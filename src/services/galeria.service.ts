import { api } from './api';

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
   * Adiciona uma nova imagem via upload de arquivo
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
    }
  ): Promise<{ success: boolean; data: Galeria }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    if (data.descricao) formData.append('descricao', data.descricao);
    if (data.titulo) formData.append('titulo', data.titulo);
    if (data.jogo_id) formData.append('jogo_id', data.jogo_id);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.is_operacao !== undefined) formData.append('is_operacao', data.is_operacao.toString());
    if (data.nome_operacao) formData.append('nome_operacao', data.nome_operacao);
    if (data.data_operacao) formData.append('data_operacao', data.data_operacao);
    if (data.album) formData.append('album', data.album);

    return api.post('/api/galeria', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Deleta uma imagem
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/api/galeria/${id}`, { requireAuth: true });
  },
};

