import { api } from './api';

export interface EquipeInfo {
  id?: string;
  nome: string;
  significado_nome?: string | null;
  objetivo?: string | null;
  data_criacao?: string | null;
  descricao?: string | null;
  logo_url?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export const equipeService = {
  /**
   * Obtém informações da equipe
   */
  get: async (): Promise<{ success: boolean; data: EquipeInfo }> => {
    return api.get('/api/equipe');
  },

  /**
   * Cria ou atualiza informações da equipe
   */
  createOrUpdate: async (data: Partial<EquipeInfo>): Promise<{ success: boolean; data: EquipeInfo }> => {
    return api.post('/api/equipe', data, { requireAuth: true });
  },
};

