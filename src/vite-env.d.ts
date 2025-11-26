/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_INTERNAL_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FRONTEND_URL?: string;
  readonly VITE_ENABLE_LOGS?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_EMBED_DEV_API?: string;
}

