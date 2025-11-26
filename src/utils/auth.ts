/**
 * Utilitário para autenticação usando sessão do backend
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

export interface UserInfo {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  roles: string[];
}

// Cache dos dados do usuário para evitar requisições desnecessárias
let userCache: UserInfo | null = null;
let lastCheck = 0;
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Verifica se o usuário está autenticado fazendo uma requisição ao backend
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include', // Importante para enviar cookies de sessão
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        userCache = data.user;
        lastCheck = Date.now();
        return true;
      }
    }

    userCache = null;
    return false;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

/**
 * Obtém informações do usuário autenticado
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  // Se temos cache recente, retorna ele
  if (userCache && Date.now() - lastCheck < CACHE_DURATION) {
    return userCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        userCache = data.user;
        lastCheck = Date.now();
        return data.user;
      }
    }

    userCache = null;
    return null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
}

/**
 * Faz logout do usuário
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Limpa o cache mesmo se houver erro
    userCache = null;
    lastCheck = 0;
    window.location.href = '/';
  }
}

/**
 * Limpa o cache de usuário (útil após login/logout)
 */
export function clearUserCache(): void {
  userCache = null;
  lastCheck = 0;
}
