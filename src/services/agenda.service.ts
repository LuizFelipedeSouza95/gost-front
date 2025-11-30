import { api } from './api';

export interface AgendaItem {
  id: string;
  titulo: string;
  descricao?: string | null;
  data: string;
  hora?: string | null;
  local?: string | null;
  tipo?: string | null;
  ativo: boolean;
  ordem?: number | null;
  createdAt: string;
  updatedAt: string;
}

export const agendaService = {
  /**
   * Lista todos os itens da agenda (apenas ativos)
   */
  list: async (): Promise<{ success: boolean; data: AgendaItem[] }> => {
    return api.get('/api/agenda');
  },

  /**
   * Lista todos os itens da agenda (incluindo inativos - admin)
   */
  listAll: async (): Promise<{ success: boolean; data: AgendaItem[] }> => {
    return api.get('/api/agenda/all', { requireAuth: true });
  },

  /**
   * Obtém um item da agenda por ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: AgendaItem }> => {
    return api.get(`/api/agenda/${id}`);
  },

  /**
   * Cria um novo item na agenda
   */
  create: async (data: Partial<AgendaItem>): Promise<{ success: boolean; data: AgendaItem }> => {
    return api.post('/api/agenda', data, { requireAuth: true });
  },

  /**
   * Atualiza um item da agenda
   */
  update: async (id: string, data: Partial<AgendaItem>): Promise<{ success: boolean; data: AgendaItem }> => {
    return api.put(`/api/agenda/${id}`, data, { requireAuth: true });
  },

  /**
   * Deleta um item da agenda
   */
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return api.delete(`/api/agenda/${id}`, { requireAuth: true });
  },
};

