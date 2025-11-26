const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export function getBackendUrl(): string {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_INTERNAL_API_URL) return import.meta.env.VITE_INTERNAL_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  if (isDev) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return `http://${hostname}:3001`;
  }

  if (isProduction) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    if (hostname.startsWith('www.')) {
      return `${protocol}//api.${hostname.replace('www.', '')}`;
    }
    if (hostname.startsWith('api.')) {
      return `${protocol}//${hostname}`;
    }
    return 'https://api.gosttactical.com.br';
  }

  return 'http://localhost:3001';
}

export function getFrontendUrl(): string {
  if (import.meta.env.VITE_FRONTEND_URL) return import.meta.env.VITE_FRONTEND_URL;
  if (isProduction) return 'https://www.gosttactical.com.br';
  return 'http://localhost:3000';
}

export const urlConfig = {
  backend: getBackendUrl(),
  frontend: getFrontendUrl(),
  isDev,
  isProduction,
} as const;

