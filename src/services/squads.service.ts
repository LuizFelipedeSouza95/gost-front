import { api } from './api';

export interface Squad {
  id: string;
  nome: string;
  descricao?: string | null;
  comando_squad?: string | null;
  comando_geral: string[];
  cor?: string | null;
  logo_url?: string | null;
  ativo: boolean;
  membros?: any[];
  comandante?: {
    id: string;
    name?: string | null;
    email: string;
    nome_guerra?: string | null;
  } | null;
}

export interface SquadCreateUpdateData extends Partial<Squad> {
  comandante_id?: string | null;
  membros_ids?: string[];
}

export const squadsService = {
  /**
   * Lista todos os squads
   */
  list: async (): Promise<{ success: boolean; data: Squad[] }> => {
    return api.get('/api/squads');
  },

  /**
   * Obtém um squad por ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Squad }> => {
    return api.get(`/api/squads/${id}`);
  },

  /**
   * Cria um novo squad
   */
  create: async (data: SquadCreateUpdateData): Promise<{ success: boolean; data: Squad }> => {
    return api.post('/api/squads', data, { requireAuth: true });
  },

  /**
   * Atualiza um squad
   */
  update: async (id: string, data: SquadCreateUpdateData): Promise<{ success: boolean; data: Squad }> => {
    return api.put(`/api/squads/${id}`, data, { requireAuth: true });
  },

  /**
   * Deleta um squad
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/api/squads/${id}`, { requireAuth: true });
  },
};

