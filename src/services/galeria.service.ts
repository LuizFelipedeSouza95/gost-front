import { api } from './api';
import { azureBlobService } from './azure-blob.service';

export interface Galeria {
  id: string;
  imagem_url: string;
  thumbnail_url?: string | null;
  descricao?: string | null;
  titulo?: string | null;
  jogo_id?: string | null;
  is_operacao: boolean;
  nome_operacao?: string | null;
  data_operacao?: string | null;
  categoria?: string | null;
  album?: string | null;
  createdAt?: string;
  jogo?: {
    id: string;
    nome_jogo: string;
    data_jogo?: string;
    local_jogo?: string;
  } | null;
}

export const galeriaService = {
  /**
   * Lista todas as imagens
   */
  list: async (jogo_id?: string, categoria?: string, is_operacao?: boolean, album?: string, limit?: number): Promise<{ success: boolean; data: Galeria[] }> => {
    const params = new URLSearchParams();
    if (jogo_id) params.append('jogo_id', jogo_id);
    if (categoria) params.append('categoria', categoria);
    if (is_operacao !== undefined) params.append('is_operacao', is_operacao.toString());
    if (album) params.append('album', album);
    if (limit) params.append('limit', limit.toString());
    return api.get(`/api/galeria?${params.toString()}`);
  },

  /**
   * Adiciona uma nova imagem via upload para Azure Blob Storage
   */
  create: async (
    file: File,
    data: {
      descricao?: string;
      titulo?: string;
      jogo_id?: string;
      categoria?: string;
      is_operacao?: boolean;
      nome_operacao?: string;
      data_operacao?: string;
      album?: string;
      thumbnail_url?: string;
      imagem_url?: string; // URL já gerada (opcional)
    }
  ): Promise<{ success: boolean; data: Galeria }> => {
    try {
      let imagemUrl: string;
      let thumbnailUrl: string;

      // Se já foi fornecido imagem_url, usar ela (caso o upload já tenha sido feito)
      if (data.imagem_url && typeof data.imagem_url === 'string' && data.imagem_url.trim() !== '') {
        imagemUrl = data.imagem_url.trim();
      } else {
        // Caso contrário, fazer upload da imagem principal para Azure Blob Storage
        imagemUrl = await azureBlobService.uploadImage(file, 'galeria');
      }

      // Validar URL gerada
      if (!imagemUrl || typeof imagemUrl !== 'string' || imagemUrl.trim() === '') {
        throw new Error('URL da imagem é inválida ou vazia');
      }

      // Usar thumbnail_url fornecido ou a própria imagem como thumbnail
      if (data.thumbnail_url && typeof data.thumbnail_url === 'string' && data.thumbnail_url.trim() !== '') {
        thumbnailUrl = data.thumbnail_url.trim();
      } else {
        thumbnailUrl = imagemUrl;
      }

      // Validar thumbnail URL
      if (!thumbnailUrl || typeof thumbnailUrl !== 'string' || thumbnailUrl.trim() === '') {
        thumbnailUrl = imagemUrl; // Fallback para imagem principal
      }

      // 3. Enviar metadados para o backend
      const payload = {
        imagem_url: imagemUrl,
        thumbnail_url: thumbnailUrl,
        descricao: data.descricao,
        titulo: data.titulo,
        jogo_id: data.jogo_id,
        categoria: data.categoria,
        is_operacao: data.is_operacao,
        nome_operacao: data.nome_operacao,
        data_operacao: data.data_operacao,
        album: data.album,
      };

      return api.post('/api/galeria', payload, { requireAuth: true });
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error(error.message || 'Erro ao fazer upload da imagem');
    }
  },

  /**
   * Atualiza uma imagem existente
   */
  update: async (
    id: string,
    data: {
      descricao?: string;
      titulo?: string;
      jogo_id?: string;
      categoria?: string;
      is_operacao?: boolean;
      nome_operacao?: string;
      data_operacao?: string;
      album?: string;
      thumbnail_url?: string;
    }
  ): Promise<{ success: boolean; data: Galeria }> => {
    return api.put(`/api/galeria/${id}`, data, { requireAuth: true });
  },

  /**
   * Deleta uma imagem (remove do Azure Blob Storage e do banco)
   */
  delete: async (id: string, imagemUrl?: string): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Deletar do backend (que também deleta do Azure se necessário)
      const response = await api.delete(`/api/galeria/${id}`, { requireAuth: true }) as { success: boolean; message: string };

      // 2. Se o backend não deletar do Azure, deletar diretamente
      if (imagemUrl && imagemUrl.includes('blob.core.windows.net')) {
        try {
          await azureBlobService.deleteImage(imagemUrl);
        } catch (blobError) {
          console.warn('Erro ao deletar do Azure Blob Storage (pode já ter sido deletado):', blobError);
        }
      }

      return response;
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  },
};

