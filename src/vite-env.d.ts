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
  readonly VITE_AZURE_STORAGE_CONNECTION_STRING?: string;
  readonly VITE_AZURE_STORAGE_CONTAINER_NAME?: string;
  readonly VITE_AZURE_STORAGE_ACCOUNT_NAME?: string;
  readonly VITE_N8N_URL?: string;
  readonly VITE_N8N_WORKFLOW_RECRUTAMENTO?: string;
  readonly VITE_N8N_WORKFLOW_RECRUTAMENTO_ATUALIZACAO?: string;
  readonly VITE_N8N_WORKFLOW_PRESENCA?: string;
  readonly VITE_N8N_WORKFLOW_PARCERIA?: string;
}