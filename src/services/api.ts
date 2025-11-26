import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV_CONFIG } from './environment';
import { getBackendUrl } from '../config/urls';

const backendUrl = getBackendUrl();

if (ENV_CONFIG.enableConsoleLogs) {
  console.log('Backend URL:', backendUrl);
}

const InternalApi: AxiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 300000,
  validateStatus: (status) => status < 500,
});

InternalApi.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    delete config.headers['Access-Control-Allow-Origin'];
    delete config.headers['Access-Control-Allow-Methods'];
    delete config.headers['Access-Control-Allow-Headers'];
    delete config.headers['Access-Control-Expose-Headers'];
    delete config.headers['Access-Control-Allow-Credentials'];
    delete config.headers['Access-Control-Max-Age'];
    
    if (['PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    if (ENV_CONFIG.enableConsoleLogs) {
      console.log('Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      });
    }
    
    return config;
  },
  (error) => {
    if (ENV_CONFIG.enableConsoleLogs) {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

InternalApi.interceptors.response.use(
  (response: AxiosResponse) => {
    if (ENV_CONFIG.enableConsoleLogs) {
      console.log('Response:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error) => {
    if (error.message === 'Network Error' || !error.response) {
      if (ENV_CONFIG.enableConsoleLogs) {
        console.error('CORS/Rede Error:', {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
      }
      (error as any).corsError = true;
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('SESSION_KEY');
    }
    
    return Promise.reject(error);
  }
);

// Interface para compatibilidade com o código existente
interface RequestOptions extends AxiosRequestConfig {
  requireAuth?: boolean;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, options);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, options);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    // Garante que withCredentials está habilitado para CORS com credenciais
    // Mescla as opções fornecidas com as configurações padrão
    const mergedOptions: RequestOptions = {
      ...options,
      withCredentials: true, // Sempre true para CORS com credenciais
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers, // Permite sobrescrever headers se necessário
      },
    };
    
    const response = await this.axiosInstance.put<T>(endpoint, data, mergedOptions);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, options);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, options);
    return response.data;
  }
}

// Exporta tanto a instância do axios quanto o serviço wrapper
export const api = new ApiService(InternalApi);
export default InternalApi;

