import { api } from './api';

export interface EstatutoItem {
  position?: string;
  members?: string;
  additional?: string;
  text?: string;
  label?: string;
}

export interface EstatutoSection {
  title: string;
  items: EstatutoItem[];
}

export interface EstatutoTopic {
  id: string;
  icon?: string; // Nome do ícone do lucide-react (ex: 'Shield', 'Users', etc)
  title: string;
  description: string;
  content: {
    sections: EstatutoSection[];
  };
}

export interface EstatutoInfo {
  id?: string;
  titulo: string;
  descricao?: string | null;
  conteudo: {
    topics: EstatutoTopic[];
  };
}

export const estatutoService = {
  /**
   * Obtém o estatuto
   */
  get: async (): Promise<{ success: boolean; data: EstatutoInfo }> => {
    return api.get('/api/estatuto');
  },

  /**
   * Cria ou atualiza o estatuto
   */
  createOrUpdate: async (data: Partial<EstatutoInfo>): Promise<{ success: boolean; data: EstatutoInfo }> => {
    return api.post('/api/estatuto', data, { requireAuth: true });
  },
};

