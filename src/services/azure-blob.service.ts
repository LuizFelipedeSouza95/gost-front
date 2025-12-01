import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';

/**
 * Serviço para gerenciar uploads no Azure Blob Storage
 */
class AzureBlobService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;

  /**
   * Inicializa o cliente do Blob Storage
   * Suporta tanto Connection String tradicional quanto SAS Token
   */
  private async initialize(): Promise<void> {
    if (this.containerClient) {
      return; // Já inicializado
    }

    const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
    const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'galeria';
    const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;

    if (!connectionString) {
      throw new Error('VITE_AZURE_STORAGE_CONNECTION_STRING não está configurada');
    }

    try {
      // Normalizar a connection string
      let normalizedConnectionString = connectionString.trim();
      
      // Se começar com https:// mas não tiver BlobEndpoint=, adicionar
      if (normalizedConnectionString.startsWith('https://') && !normalizedConnectionString.includes('BlobEndpoint=')) {
        // Encontrar onde começa o SharedAccessSignature
        const sasIndex = normalizedConnectionString.indexOf('SharedAccessSignature');
        if (sasIndex > 0) {
          // Separar a URL base do SAS
          // A URL base termina antes do SharedAccessSignature (remover o ';' se houver)
          let urlBase = normalizedConnectionString.substring(0, sasIndex);
          if (urlBase.endsWith(';')) {
            urlBase = urlBase.slice(0, -1);
          }
          const sasPart = normalizedConnectionString.substring(sasIndex);
          // Reconstruir com BlobEndpoint
          normalizedConnectionString = `BlobEndpoint=${urlBase};${sasPart}`;
        } else {
          // Se não tiver SAS, adicionar BlobEndpoint= no início
          normalizedConnectionString = `BlobEndpoint=${normalizedConnectionString}`;
        }
      }

      // Verificar se é uma connection string com SAS ou tradicional
      if (normalizedConnectionString.includes('SharedAccessSignature')) {
        // Connection string com SAS
        this.blobServiceClient = BlobServiceClient.fromConnectionString(normalizedConnectionString);
      } else if (normalizedConnectionString.includes('AccountKey')) {
        // Connection string tradicional
        this.blobServiceClient = BlobServiceClient.fromConnectionString(normalizedConnectionString);
      } else {
        throw new Error('Formato de connection string não suportado. Use Connection String ou SAS Token.');
      }

      this.containerClient = this.blobServiceClient.getContainerClient(containerName);

      // Verificar se o container existe, se não, criar
      const exists = await this.containerClient.exists();
      if (!exists) {
        await this.containerClient.create({
          access: 'blob', // Permite acesso público aos blobs, mas não lista o container
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar Azure Blob Storage:', error);
      throw error;
    }
  }

  /**
   * Normaliza o nome do álbum para usar como pasta no Blob Storage
   * Remove espaços, caracteres especiais e converte para minúsculas
   * Exemplo: "Combat Zone" -> "combatzone"
   */
  normalizeAlbumName(albumName: string): string {
    return albumName
      .toLowerCase()
      .normalize('NFD') // Normaliza caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
      .replace(/[^a-z0-9]/g, '') // Remove tudo que não é letra ou número
      .trim();
  }

  /**
   * Faz upload de uma imagem para o Blob Storage
   * @param file Arquivo de imagem
   * @param folder Pasta/prefixo para organizar (ex: 'galeria', 'thumbnails', ou nome do álbum normalizado)
   * @returns URL pública da imagem
   */
  async uploadImage(file: File, folder: string = 'galeria'): Promise<string> {
    try {
      await this.initialize();

      if (!this.containerClient) {
        throw new Error('Container não inicializado');
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

      const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // Upload do arquivo
      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: file.type || 'image/jpeg',
        },
      });

      // Retornar URL pública
      let blobUrl = blockBlobClient.url;
      
      // Validar que a URL é válida
      if (!blobUrl || typeof blobUrl !== 'string' || blobUrl.trim() === '') {
        throw new Error('URL gerada é inválida ou vazia');
      }

      // Normalizar a URL (remover espaços, garantir formato correto)
      blobUrl = blobUrl.trim();
      
      // Verificar formato básico da URL
      if (!blobUrl.startsWith('http://') && !blobUrl.startsWith('https://')) {
        // Tentar adicionar https:// se não tiver protocolo
        if (blobUrl.includes('blob.core.windows.net')) {
          blobUrl = 'https://' + blobUrl.replace(/^https?:\/\//, '');
        } else {
          throw new Error('URL não começa com http:// ou https://');
        }
      }

      // Validar URL de forma mais robusta para mobile
      // Evitar usar new URL() diretamente que pode falhar em alguns casos no mobile
      try {
        // Verificação básica de formato
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlPattern.test(blobUrl)) {
          throw new Error('Formato de URL inválido');
        }
        
        // Tentar criar objeto URL apenas se necessário (pode falhar em mobile)
        // Mas não bloquear se a URL parece válida
        try {
          const urlObj = new URL(blobUrl);
          if (!urlObj.protocol || !urlObj.hostname) {
            throw new Error('URL não possui protocolo ou hostname válido');
          }
        } catch (urlConstructError: any) {
          // Se falhar ao construir URL mas a URL parece válida, continuar mesmo assim
          console.warn('Aviso ao validar URL com new URL():', urlConstructError.message);
          console.warn('URL gerada (continuando mesmo assim):', blobUrl);
          
          // Verificar se a URL tem pelo menos formato básico válido
          if (!blobUrl.includes('://') || !blobUrl.includes('.')) {
            throw new Error(`URL inválida: ${urlConstructError.message || 'Formato não reconhecido'}`);
          }
        }
        
        return blobUrl;
      } catch (urlError: any) {
        console.error('Erro ao validar URL:', urlError);
        console.error('URL gerada:', blobUrl);
        throw new Error(`Erro ao gerar URL da imagem: ${urlError.message || 'URL inválida'}`);
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      if (error.message) {
        throw error;
      }
      throw new Error('Erro ao fazer upload da imagem para o Azure Blob Storage: ' + (error.message || 'Erro desconhecido'));
    }
  }

  /**
   * Faz upload de múltiplas imagens
   */
  async uploadImages(files: File[], folder: string = 'galeria'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Faz download de uma imagem de uma URL e faz upload para o Blob Storage
   * @param imageUrl URL da imagem a ser baixada
   * @param folder Pasta/prefixo para organizar (ex: 'equipe', 'galeria')
   * @returns URL pública da imagem no Blob Storage
   */
  async uploadImageFromUrl(imageUrl: string, folder: string = 'galeria'): Promise<string> {
    try {
      await this.initialize();

      if (!this.containerClient) {
        throw new Error('Container não inicializado');
      }

      // Validar URL antes de fazer fetch
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        throw new Error('URL da imagem é inválida ou vazia');
      }

      const trimmedUrl = imageUrl.trim();
      
      // Validar formato da URL
      try {
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          throw new Error('URL deve começar com http:// ou https://');
        }
        new URL(trimmedUrl); // Validar formato
      } catch (urlError: any) {
        throw new Error(`URL inválida: ${urlError.message || 'Formato de URL não suportado'}`);
      }

      // Fazer download da imagem
      const response = await fetch(trimmedUrl);
      if (!response.ok) {
        throw new Error(`Erro ao baixar imagem: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Verificar se é uma imagem
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL não aponta para uma imagem válida');
      }

      // Converter Blob para File
      const fileExtension = blob.type.split('/')[1] || 'jpg';
      const fileName = `image.${fileExtension}`;
      const file = new File([blob], fileName, { type: blob.type });

      // Fazer upload usando o método existente
      return await this.uploadImage(file, folder);
    } catch (error: any) {
      console.error('Erro ao fazer upload de imagem de URL:', error);
      throw new Error('Erro ao fazer upload de imagem de URL: ' + (error.message || 'Erro desconhecido'));
    }
  }

  /**
   * Deleta uma imagem do Blob Storage
   * @param imageUrl URL completa da imagem
   */
  async deleteImage(imageUrl: string): Promise<void> {
    await this.initialize();

    if (!this.containerClient) {
      throw new Error('Container não inicializado');
    }

    try {
      // Validar URL antes de processar
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        throw new Error('URL da imagem é inválida ou vazia');
      }

      // Extrair o nome do blob da URL
      let blobName: string;
      
      try {
        // Verificar se é uma URL válida antes de criar o objeto URL
        const trimmedUrl = imageUrl.trim();
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          throw new Error('URL não começa com http:// ou https://');
        }

        const url = new URL(trimmedUrl);
        // Remove o primeiro segmento (container name) do pathname
        // Exemplo: /galeria/imagem.jpg -> imagem.jpg
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length > 1) {
          // Remove o primeiro elemento (nome do container)
          blobName = pathParts.slice(1).join('/');
        } else {
          // Se não houver container no path, usar o pathname completo
          blobName = url.pathname.replace(/^\//, '');
        }
      } catch (urlError: any) {
        // Se não for uma URL válida, tentar extrair o nome do blob de outra forma
        // Pode ser que seja apenas o caminho relativo
        console.warn('Erro ao processar URL, tentando método alternativo:', urlError);
        if (imageUrl.includes('/')) {
          const parts = imageUrl.split('/');
          blobName = parts.slice(-2).join('/'); // Pega os últimos 2 segmentos (container/nome)
        } else {
          throw new Error('URL inválida: ' + imageUrl);
        }
      }

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      throw new Error('Erro ao deletar imagem do Azure Blob Storage: ' + (error.message || 'Erro desconhecido'));
    }
  }

  /**
   * Gera uma URL assinada (SAS) para acesso temporário
   * Nota: Requer configuração adicional no backend para gerar tokens SAS
   */
  getPublicUrl(blobName: string): string {
    const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'galeria';

    if (!accountName) {
      throw new Error('VITE_AZURE_STORAGE_ACCOUNT_NAME não está configurada');
    }

    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  }
}

export const azureBlobService = new AzureBlobService();

