import { api } from './api';

export interface Recrutamento {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  idade?: number | null;
  cidade?: string | null;
  experiencia?: string | null;
  equipamento?: string | null;
  disponibilidade?: string | null;
  motivacao?: string | null;
  instagram?: string | null;
  etapa_inscricao: 'pendente' | 'aprovado' | 'reprovado';
  etapa_avaliacao: 'pendente' | 'aprovado' | 'reprovado';
  etapa_qa: 'pendente' | 'aprovado' | 'reprovado';
  etapa_votacao: 'pendente' | 'aprovado' | 'reprovado';
  etapa_integracao: 'pendente' | 'aprovado' | 'reprovado';
  responsavel?: {
    id: string;
    name: string;
    email: string;
  } | null;
  observacoes_inscricao?: string | null;
  observacoes_avaliacao?: string | null;
  observacoes_qa?: string | null;
  observacoes_votacao?: string | null;
  observacoes_integracao?: string | null;
  votos?: Record<string, 'aprovado' | 'reprovado'> | null;
  status: 'ativo' | 'aprovado' | 'reprovado' | 'cancelado';
  data_inscricao?: string | null;
  data_avaliacao?: string | null;
  data_qa?: string | null;
  data_votacao?: string | null;
  data_integracao?: string | null;
  usuario_id?: string | null;
  createdAt?: string;
}

export interface CreateRecrutamentoData {
  nome: string;
  email: string;
  telefone?: string;
  idade?: number;
  cidade?: string;
  experiencia?: string;
  equipamento?: string;
  disponibilidade?: string;
  motivacao?: string;
  instagram?: string;
}

export const recrutamentoService = {
  /**
   * Lista todos os recrutamentos (requer autenticação)
   */
  list: async (status?: string, etapa?: string): Promise<{ success: boolean; data: Recrutamento[] }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (etapa) params.append('etapa', etapa);
    return api.get(`/api/recrutamento?${params.toString()}`, { requireAuth: true });
  },

  /**
   * Obtém o recrutamento do usuário logado (requer autenticação)
   */
  getMyRecrutamento: async (): Promise<{ success: boolean; data: Recrutamento }> => {
    return api.get('/api/recrutamento/me', { requireAuth: true });
  },

  /**
   * Obtém um recrutamento por ID (requer autenticação)
   */
  getById: async (id: string): Promise<{ success: boolean; data: Recrutamento }> => {
    return api.get(`/api/recrutamento/${id}`, { requireAuth: true });
  },

  /**
   * Cria um novo recrutamento (público)
   */
  create: async (data: CreateRecrutamentoData): Promise<{ success: boolean; data: Recrutamento }> => {
    return api.post('/api/recrutamento', data);
  },

  /**
   * Atualiza uma etapa do recrutamento (admin apenas)
   */
  updateStage: async (
    id: string,
    etapa: 'inscricao' | 'avaliacao' | 'qa' | 'votacao' | 'integracao',
    status: 'pendente' | 'aprovado' | 'reprovado',
    observacoes?: string
  ): Promise<{ success: boolean; data: Recrutamento }> => {
    return api.put(
      `/api/recrutamento/${id}/stage`,
      { etapa, status, observacoes },
      { requireAuth: true }
    );
  },

  /**
   * Atribui responsável ao recrutamento (admin apenas)
   */
  assignResponsible: async (
    id: string,
    responsavel_id: string | null
  ): Promise<{ success: boolean; data: Recrutamento }> => {
    return api.put(
      `/api/recrutamento/${id}/responsible`,
      { responsavel_id },
      { requireAuth: true }
    );
  },

  /**
   * Adiciona voto na etapa de votação (comando apenas)
   */
  addVote: async (
    id: string,
    voto: 'aprovado' | 'reprovado'
  ): Promise<{ success: boolean; data: Recrutamento; votos?: any }> => {
    return api.post(
      `/api/recrutamento/${id}/vote`,
      { voto },
      { requireAuth: true }
    );
  },

  /**
   * Deleta um recrutamento (admin apenas)
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/api/recrutamento/${id}`, { requireAuth: true });
  },
};

