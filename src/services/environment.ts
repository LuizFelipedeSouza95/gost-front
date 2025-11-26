/**
 * Configurações de ambiente
 */

import { getBackendUrl } from '../config/urls';

export const ENV_CONFIG = {
  // Habilita logs no console (útil para debug)
  enableConsoleLogs: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true',
  
  // URLs da API (usa configuração centralizada)
  internalApiUrl: getBackendUrl(),
  
  // Outras configurações podem ser adicionadas aqui
};

