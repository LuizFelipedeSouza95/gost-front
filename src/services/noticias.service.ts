import { api } from './api';

export interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  resumo?: string | null;
  imagem_url?: string | null;
  autor_nome?: string | null;
  publicado: boolean;
  destaque?: boolean;
  data_publicacao?: string | null;
  categoria?: string | null;
  visualizacoes: number;
  tags: string[];
}

export const noticiasService = {
  /**
   * Lista todas as notícias
   */
  list: async (categoria?: string, publicado?: boolean, limit?: number): Promise<{ success: boolean; data: Noticia[] }> => {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (publicado !== undefined) params.append('publicado', publicado.toString());
    if (limit) params.append('limit', limit.toString());
    return api.get(`/api/noticias?${params.toString()}`);
  },

  /**
   * Obtém uma notícia por ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Noticia }> => {
    return api.get(`/api/noticias/${id}`);
  },

  /**
   * Cria uma nova notícia
   */
  create: async (data: Partial<Noticia>): Promise<{ success: boolean; data: Noticia }> => {
    return api.post('/api/noticias', data, { requireAuth: true });
  },

  /**
   * Atualiza uma notícia existente
   */
  update: async (id: string, data: Partial<Noticia>): Promise<{ success: boolean; data: Noticia }> => {
    return api.put(`/api/noticias/${id}`, data, { requireAuth: true });
  },

  /**
   * Deleta uma notícia
   */
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return api.delete(`/api/noticias/${id}`, { requireAuth: true });
  },
};

