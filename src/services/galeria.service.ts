import { api } from './api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

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
  list: async (jogo_id?: string, categoria?: string, is_operacao?: boolean, limit?: number): Promise<{ success: boolean; data: Galeria[] }> => {
    const params = new URLSearchParams();
    if (jogo_id) params.append('jogo_id', jogo_id);
    if (categoria) params.append('categoria', categoria);
    if (is_operacao !== undefined) params.append('is_operacao', is_operacao.toString());
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

    const response = await fetch(`${API_BASE_URL}/api/galeria`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Importante para cookies de sessão
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Deleta uma imagem
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/api/galeria/${id}`, { requireAuth: true });
  },
};

