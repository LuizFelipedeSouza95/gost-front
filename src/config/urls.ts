/**
 * Configuração centralizada de URLs para diferentes ambientes
 * 
 * Prioridade das variáveis de ambiente:
 * 1. Variáveis específicas (ex: VITE_BACKEND_URL, VITE_API_URL)
 * 2. Variáveis genéricas (ex: VITE_INTERNAL_API_URL, VITE_API_BASE_URL)
 * 3. Valores padrão baseados no ambiente
 */

const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Obtém a URL do backend
 */
export function getBackendUrl(): string {
  // Prioridade: VITE_BACKEND_URL > VITE_API_URL > VITE_INTERNAL_API_URL > VITE_API_BASE_URL > inferência
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.VITE_INTERNAL_API_URL) {
    return import.meta.env.VITE_INTERNAL_API_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Em desenvolvimento, usa localhost:3001 (porta do backend)
  if (isDev) {
    const hostname = window.location.hostname;
    
    // Se estiver em localhost, usa localhost:3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Se estiver na rede local, usa o IP da rede com porta 3001
    return `http://${hostname}:3001`;
  }

  // Em produção, tenta inferir da URL atual ou usa padrão
  if (isProduction) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // Se o frontend está em www.gosttactical.com.br, a API está em api.gosttactical.com.br
    if (hostname.startsWith('www.')) {
      return `${protocol}//api.${hostname.replace('www.', '')}`;
    }

    // Se já está em api.gosttactical.com.br, usa a mesma URL
    if (hostname.startsWith('api.')) {
      return `${protocol}//${hostname}`;
    }

    // Padrão de produção
    return 'https://api.gosttactical.com.br';
  }

  // Fallback para desenvolvimento
  return 'http://localhost:3001';
}

/**
 * Obtém a URL do frontend
 */
export function getFrontendUrl(): string {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }

  if (isProduction) {
    return 'https://www.gosttactical.com.br';
  }

  return 'http://localhost:3000';
}

/**
 * Configuração consolidada de URLs
 */
export const urlConfig = {
  backend: getBackendUrl(),
  frontend: getFrontendUrl(),
  isDev,
  isProduction,
} as const;

