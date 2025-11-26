import { api } from './api';

export interface Treinamento {
  id: string;
  titulo: string;
  descricao: string;
  conteudo?: string | null;
  data_treinamento?: string | null;
  local?: string | null;
  instrutor_nome?: string | null;
  tipo?: string | null;
  duracao_minutos?: number | null;
  max_participantes?: number | null;
  participantes: string[];
  material_necessario?: string | null;
  ativo: boolean;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
}

export const treinamentosService = {
  /**
   * Lista todos os treinamentos
   */
  list: async (tipo?: string, status?: string, ativo?: boolean): Promise<{ success: boolean; data: Treinamento[] }> => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (status) params.append('status', status);
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    return api.get(`/api/treinamentos?${params.toString()}`);
  },

  /**
   * Cria um novo treinamento
   */
  create: async (data: Partial<Treinamento>): Promise<{ success: boolean; data: Treinamento }> => {
    return api.post('/api/treinamentos', data, { requireAuth: true });
  },

  /**
   * Inscreve em um treinamento
   */
  subscribe: async (id: string): Promise<{ success: boolean; data: Treinamento }> => {
    return api.post(`/api/treinamentos/${id}/subscribe`, {}, { requireAuth: true });
  },
};

