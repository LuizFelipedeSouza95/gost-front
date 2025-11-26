/// <reference types="vite/client" />
import { getBackendUrl } from '../config/urls';

export const ENV_CONFIG = {
  enableConsoleLogs: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true',
  internalApiUrl: getBackendUrl(),
};

