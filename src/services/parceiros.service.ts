import { api } from './api';

export interface Parceiro {
  id: string;
  nome: string;
  descricao?: string | null;
  logo_url?: string | null;
  website?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  tipo?: string | null;
  ordem_exibicao: number;
  ativo: boolean;
}

export const parceirosService = {
  /**
   * Lista todos os parceiros
   */
  list: async (): Promise<{ success: boolean; data: Parceiro[] }> => {
    return api.get('/api/parceiros');
  },

  /**
   * Cria um novo parceiro
   */
  create: async (data: Partial<Parceiro>): Promise<{ success: boolean; data: Parceiro }> => {
    return api.post('/api/parceiros', data, { requireAuth: true });
  },

  /**
   * Atualiza um parceiro existente
   */
  update: async (id: string, data: Partial<Parceiro>): Promise<{ success: boolean; data: Parceiro }> => {
    return api.put(`/api/parceiros/${id}`, data, { requireAuth: true });
  },

  /**
   * Exclui um parceiro
   */
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return api.delete(`/api/parceiros/${id}`, { requireAuth: true });
  },
};

