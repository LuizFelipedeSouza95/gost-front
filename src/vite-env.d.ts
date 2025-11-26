/// <reference types="vite/client" />

/**
 * Declaração de tipos para variáveis de ambiente do Vite
 * Estende a interface ImportMetaEnv do Vite com variáveis customizadas
 */
interface ImportMetaEnv {
  // Variáveis de ambiente customizadas
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_INTERNAL_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FRONTEND_URL?: string;
  readonly VITE_ENABLE_LOGS?: string;
}

