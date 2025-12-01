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

    // Obter variáveis de ambiente - no build do Vite, undefined vira string "undefined"
    const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
    const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'galeria';
    const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;

    // Verificar se as variáveis estão realmente definidas (não são "undefined" string)
    const isValidConnectionString = connectionString &&
      connectionString !== 'undefined' &&
      connectionString.trim() !== '';

    const isValidAccountName = accountName &&
      accountName !== 'undefined' &&
      accountName.trim() !== '';

    console.log('[Azure Debug] Verificando variáveis de ambiente:', {
      hasConnectionString: !!connectionString,
      connectionStringType: typeof connectionString,
      connectionStringLength: connectionString?.length || 0,
      hasAccountName: !!accountName,
      accountNameType: typeof accountName,
      containerName
    });

    if (!isValidConnectionString && !isValidAccountName) {
      throw new Error('VITE_AZURE_STORAGE_CONNECTION_STRING ou VITE_AZURE_STORAGE_ACCOUNT_NAME não estão configuradas. Verifique as variáveis de ambiente no ambiente de produção.');
    }

    // Se não tem connection string mas tem accountName, precisamos de SAS token
    if (!isValidConnectionString && isValidAccountName) {
      throw new Error('VITE_AZURE_STORAGE_CONNECTION_STRING não está configurada. É necessária para autenticação.');
    }

    // Garantir que connectionString não é undefined após validações
    if (!connectionString || connectionString === 'undefined' || connectionString.trim() === '') {
      throw new Error('VITE_AZURE_STORAGE_CONNECTION_STRING não está configurada corretamente.');
    }

    try {
      // Normalizar a connection string
      let normalizedConnectionString = connectionString.trim();

      // Verificar se não é a string "undefined" (pode acontecer se variável não foi injetada no build)
      if (normalizedConnectionString === 'undefined' || normalizedConnectionString.length === 0) {
        throw new Error('Connection string está vazia ou não foi configurada corretamente no build. Verifique se VITE_AZURE_STORAGE_CONNECTION_STRING foi passada durante o build do Docker.');
      }

      // Validar formato básico antes de processar
      if (normalizedConnectionString.length === 0) {
        throw new Error('Connection string está vazia');
      }

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

          // Validar URL base antes de usar
          if (!urlBase || urlBase.trim() === '') {
            throw new Error('URL base inválida na connection string');
          }

          // Reconstruir com BlobEndpoint
          normalizedConnectionString = `BlobEndpoint=${urlBase};${sasPart}`;
        } else {
          // Se não tiver SAS, adicionar BlobEndpoint= no início
          normalizedConnectionString = `BlobEndpoint=${normalizedConnectionString}`;
        }
      }

      // Validar connection string normalizada antes de passar para o SDK
      // Verificar se tem pelo menos um dos formatos esperados
      const hasBlobEndpoint = normalizedConnectionString.includes('BlobEndpoint=');
      const hasAccountKey = normalizedConnectionString.includes('AccountKey=');
      const hasSAS = normalizedConnectionString.includes('SharedAccessSignature');

      if (!hasBlobEndpoint && !hasAccountKey && !hasSAS) {
        throw new Error('Connection string não possui formato válido (BlobEndpoint, AccountKey ou SharedAccessSignature)');
      }

      // Validar que não há caracteres problemáticos que possam quebrar a construção de URL
      // Remover caracteres de controle e espaços extras
      normalizedConnectionString = normalizedConnectionString
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim();


      // Verificar se é uma connection string com SAS ou tradicional
      try {
        // Tentar criar o cliente com a connection string normalizada
        if (normalizedConnectionString.includes('SharedAccessSignature') || normalizedConnectionString.includes('AccountKey')) {
          // Connection string com SAS ou AccountKey
          // Validar que não há caracteres problemáticos que possam quebrar a construção de URL
          // O SDK do Azure pode tentar construir URLs internamente, então precisamos garantir formato válido

          // Verificar se há caracteres especiais problemáticos
          const problematicChars = /[^\x20-\x7E]/; // Caracteres não-ASCII imprimíveis
          if (problematicChars.test(normalizedConnectionString)) {
            console.warn('[Azure Debug] Connection string contém caracteres não-ASCII, tentando limpar...');
            // Tentar limpar caracteres problemáticos mantendo a estrutura
            normalizedConnectionString = normalizedConnectionString
              .split('')
              .filter(char => {
                const code = char.charCodeAt(0);
                // Manter caracteres ASCII imprimíveis e alguns especiais necessários (=, ;, /, :, ?, &, etc)
                return (code >= 32 && code <= 126) || char === '=' || char === ';' || char === '/' || char === ':' || char === '?' || char === '&';
              })
              .join('');
          }

          this.blobServiceClient = BlobServiceClient.fromConnectionString(normalizedConnectionString);
        } else {
          throw new Error('Formato de connection string não suportado. Use Connection String ou SAS Token.');
        }
      } catch (sdkError: any) {
        console.error('[Azure Debug] Erro ao criar BlobServiceClient:', sdkError);
        console.error('[Azure Debug] Tipo do erro:', typeof sdkError);
        console.error('[Azure Debug] Mensagem:', sdkError.message);
        console.error('[Azure Debug] Connection string length:', normalizedConnectionString.length);
        console.error('[Azure Debug] Connection string (primeiros 100 chars):', normalizedConnectionString.substring(0, 100));
        console.error('[Azure Debug] Connection string (últimos 100 chars):', normalizedConnectionString.substring(Math.max(0, normalizedConnectionString.length - 100)));

        // Se o erro for relacionado a URL, tentar método alternativo
        if (sdkError.message && (sdkError.message.includes('URL') || sdkError.message.includes('Invalid URL'))) {
          // Tentar usar accountName e SAS token separadamente se disponível
          if (isValidAccountName && normalizedConnectionString.includes('SharedAccessSignature')) {
            try {
              // Extrair SAS token da connection string
              // Pode estar no formato: SharedAccessSignature=sv=...&sig=...&se=...&sr=...
              let sasToken = '';

              // Tentar extrair do formato BlobEndpoint=...;SharedAccessSignature=...
              const sasMatch1 = normalizedConnectionString.match(/SharedAccessSignature=([^;]+)/);
              if (sasMatch1 && sasMatch1[1]) {
                sasToken = sasMatch1[1];
              } else {
                // Tentar extrair se estiver no formato URL?sv=...&sig=...
                const urlMatch = normalizedConnectionString.match(/[?&](sv=[^&]+&sig=[^&]+[^;]*)/);
                if (urlMatch && urlMatch[1]) {
                  sasToken = urlMatch[1];
                } else {
                  throw new Error('Não foi possível extrair SAS token da connection string');
                }
              }

              // Garantir que o token começa com ?
              if (!sasToken.startsWith('?')) {
                sasToken = '?' + sasToken;
              }

              // Construir URL do blob service
              const blobServiceUrl = `https://${accountName}.blob.core.windows.net${sasToken}`;

              this.blobServiceClient = new BlobServiceClient(blobServiceUrl);
            } catch (altError: any) {
              console.error('[Azure Debug] Método alternativo também falhou:', altError);
              console.error('[Azure Debug] Stack do erro alternativo:', altError.stack);
              throw new Error(`Erro ao processar connection string: ${sdkError.message}. Método alternativo também falhou: ${altError.message}. Verifique se VITE_AZURE_STORAGE_ACCOUNT_NAME está configurada corretamente.`);
            }
          } else {
            const missingInfo: string[] = [];
            if (!isValidAccountName) missingInfo.push('VITE_AZURE_STORAGE_ACCOUNT_NAME');
            if (!normalizedConnectionString.includes('SharedAccessSignature')) missingInfo.push('SAS token na connection string');

            throw new Error(`Erro ao processar connection string: ${sdkError.message}. ${missingInfo.length > 0 ? 'Faltando: ' + missingInfo.join(', ') : ''} Verifique se as variáveis de ambiente foram passadas corretamente durante o build do Docker.`);
          }
        } else {
          throw sdkError;
        }
      }

      this.containerClient = this.blobServiceClient.getContainerClient(containerName);

      // Verificar se o container existe, se não, criar
      const exists = await this.containerClient.exists();
      if (!exists) {
        await this.containerClient.create({
          access: 'blob', // Permite acesso público aos blobs, mas não lista o container
        });
      }

    } catch (error: any) {
      console.error('[Azure Debug] Erro ao inicializar Azure Blob Storage:', error);
      console.error('[Azure Debug] Stack:', error.stack);
      throw new Error(`Erro ao inicializar Azure Blob Storage: ${error.message || 'Erro desconhecido'}`);
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

      // Obter URL pública - no mobile pode haver problemas com blockBlobClient.url
      let blobUrl: string;

      try {
        // Tentar obter URL do blockBlobClient
        blobUrl = blockBlobClient.url;

        // Se não funcionar, construir manualmente
        if (!blobUrl || typeof blobUrl !== 'string' || blobUrl.trim() === '') {
          throw new Error('URL não disponível do blockBlobClient');
        }
      } catch (error) {
        // Construir URL manualmente como fallback (especialmente para mobile)
        const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;
        const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'galeria';

        if (!accountName) {
          throw new Error('VITE_AZURE_STORAGE_ACCOUNT_NAME não está configurada');
        }

        // Construir URL manualmente
        blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`;
      }

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
      // No mobile, evitar usar new URL() que pode falhar
      try {
        // Verificação básica de formato usando regex (mais seguro no mobile)
        const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlPattern.test(blobUrl)) {
          throw new Error('Formato de URL inválido');
        }

        // Verificar componentes básicos da URL sem usar new URL()
        const urlParts = blobUrl.match(/^(https?):\/\/([^\/]+)(\/.*)?$/i);
        if (!urlParts || !urlParts[1] || !urlParts[2]) {
          throw new Error('URL não possui protocolo ou hostname válido');
        }

        // Se chegou até aqui, a URL parece válida
        // No mobile, não tentar criar objeto URL para evitar erros
        return blobUrl;
      } catch (urlError: any) {
        console.error('Erro ao validar URL:', urlError);
        console.error('URL gerada:', blobUrl);

        // Se a URL tem formato básico válido mesmo com erro, retornar mesmo assim
        if (blobUrl.startsWith('https://') && blobUrl.includes('blob.core.windows.net')) {
          console.warn('Retornando URL mesmo com aviso de validação (formato parece válido)');
          return blobUrl;
        }

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