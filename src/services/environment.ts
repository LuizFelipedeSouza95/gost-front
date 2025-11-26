/**
 * Configurações de ambiente
 */

export const ENV_CONFIG = {
  // Habilita logs no console (útil para debug)
  enableConsoleLogs: (import.meta as any).env?.DEV || (import.meta as any).env?.VITE_ENABLE_LOGS === 'true',
  
  // URLs da API
  internalApiUrl: (import.meta as any).env?.VITE_INTERNAL_API_URL || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Outras configurações podem ser adicionadas aqui
};

