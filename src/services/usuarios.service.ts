import { api } from './api';

export interface Usuario {
  id: string;
  roles: string[];
  email: string;
  name?: string | null;
  picture?: string | null;
  nome_guerra?: string | null;
  patent?: string;
  active: boolean;
  squad?: any;
  telefone?: string | null;
}

export interface UsuariosResponse {
  success: boolean;
  data: Usuario[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usuariosService = {
  /**
   * Lista todos os usuários (pode ser chamado sem autenticação para visualização pública)
   */
  list: async (page = 1, limit = 20, requireAuth = false): Promise<UsuariosResponse> => {
    return api.get<UsuariosResponse>(`/api/usuarios?page=${page}&limit=${limit}`, {
      requireAuth,
    });
  },

  /**
   * Obtém um usuário por ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Usuario }> => {
    return api.get(`/api/usuarios/${id}`, { requireAuth: true });
  },

  /**
   * Cria um novo usuário
   */
  create: async (data: Partial<Usuario> & { squad_id?: string | null }): Promise<{ success: boolean; data: Usuario; message?: string }> => {
    return api.post('/api/usuarios', data, { requireAuth: true });
  },

  /**
   * Atualiza um usuário
   */
  update: async (id: string, data: Partial<Usuario>): Promise<{ success: boolean; data: Usuario }> => {
    return api.put(`/api/usuarios/${id}`, data, { requireAuth: true });
  },
};

