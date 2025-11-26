import { api } from './api';

export interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria?: string | null;
  ordem_exibicao: number;
  visualizacoes: number;
  ativo: boolean;
}

export const faqsService = {
  /**
   * Lista todas as FAQs
   */
  list: async (categoria?: string): Promise<{ success: boolean; data: FAQ[] }> => {
    const params = categoria ? `?categoria=${categoria}` : '';
    return api.get(`/api/faqs${params}`);
  },

  /**
   * Cria uma nova FAQ
   */
  create: async (data: Partial<FAQ>): Promise<{ success: boolean; data: FAQ }> => {
    return api.post('/api/faqs', data, { requireAuth: true });
  },
};

