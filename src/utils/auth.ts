import { api } from '../services/api';

export interface UserInfo {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  roles: string[];
}

let userCache: UserInfo | null = null;
let lastCheck = 0;
const CACHE_DURATION = 30000;

export async function isAuthenticated(): Promise<boolean> {
  try {
    const data = await api.get<{ success: boolean; user?: UserInfo }>('/api/auth/me');
    if (data.success && data.user) {
      userCache = data.user;
      lastCheck = Date.now();
      return true;
    }
    userCache = null;
    return false;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

export async function getUserInfo(): Promise<UserInfo | null> {
  if (userCache && Date.now() - lastCheck < CACHE_DURATION) {
    return userCache;
  }

  try {
    const data = await api.get<{ success: boolean; user?: UserInfo }>('/api/auth/me');
    if (data.success && data.user) {
      userCache = data.user;
      lastCheck = Date.now();
      return data.user;
    }
    userCache = null;
    return null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout', {});
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    userCache = null;
    lastCheck = 0;
    window.location.href = '/';
  }
}

export function clearUserCache(): void {
  userCache = null;
  lastCheck = 0;
}
