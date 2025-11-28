import { api } from './api';

export interface Jogo {
  id: string;
  nome_jogo: string;
  descricao_jogo?: string | null;
  data_jogo?: string | null;
  local_jogo?: string | null;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  localizacao?: string | null;
  confirmations: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  capa_url?: string | null;
  tipo_jogo?: string | null;
  max_participantes?: number | null;
}

export const jogosService = {
  /**
   * Lista todos os jogos
   */
  list: async (status?: string, limit?: number): Promise<{ success: boolean; data: Jogo[] }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    return api.get(`/api/jogos?${params.toString()}`);
  },

  /**
   * Obtém um jogo por ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Jogo }> => {
    return api.get(`/api/jogos/${id}`);
  },

  /**
   * Cria um novo jogo
   */
  create: async (data: Partial<Jogo>): Promise<{ success: boolean; data: Jogo }> => {
    return api.post('/api/jogos', data, { requireAuth: true });
  },

  /**
   * Confirma presença em um jogo
   * @param id ID do jogo
   * @param nome Nome do usuário (opcional, necessário apenas se não autenticado)
   * @param email Email do usuário (opcional, necessário apenas se não autenticado)
   */
  confirmPresence: async (id: string, nome?: string, email?: string): Promise<{ success: boolean; data: Jogo }> => {
    const body = nome ? { nome, email } : {};
    // Não requer autenticação se nome for fornecido
    return api.post(`/api/jogos/${id}/confirm`, body, nome ? {} : { requireAuth: true });
  },

  /**
   * Remove confirmação de presença
   */
  removePresence: async (id: string): Promise<{ success: boolean; data: Jogo }> => {
    return api.delete(`/api/jogos/${id}/confirm`, { requireAuth: true });
  },

  /**
   * Atualiza um jogo
   */
  update: async (id: string, data: Partial<Jogo>): Promise<{ success: boolean; data: Jogo }> => {
    return api.put(`/api/jogos/${id}`, data, { requireAuth: true });
  },

  /**
   * Deleta um jogo
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/api/jogos/${id}`, { requireAuth: true });
  },
};

