/**
 * Serviço base para comunicação com a API usando Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV_CONFIG } from './environment';
import { getBackendUrl } from '../config/urls';

// Obtém a URL do backend usando configuração centralizada
const backendUrl = getBackendUrl();

if (ENV_CONFIG.enableConsoleLogs) {
  console.log('🔗 Backend URL:', backendUrl);
}

const InternalApi: AxiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // CRÍTICO: Habilitado para suportar cookies de sessão e CORS com credentials
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 300000, // 5 minutos de timeout para suportar uploads grandes
  // Não define validateStatus para permitir que o axios trate todos os status codes
  validateStatus: (status) => status < 500, // Aceita qualquer status < 500, deixando o interceptor tratar erros
});

// Interceptador de requisição para adicionar automaticamente o token
InternalApi.interceptors.request.use(
  (config) => {
    // CRÍTICO: Garante que withCredentials está sempre true para CORS com credenciais
    config.withCredentials = true;
    
    // Pega o token do localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Adiciona o token no cabeçalho Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // IMPORTANTE: Remove headers CORS que NÃO devem ser enviados pelo cliente
    // Esses headers são apenas de resposta do servidor
    delete config.headers['Access-Control-Allow-Origin'];
    delete config.headers['Access-Control-Allow-Methods'];
    delete config.headers['Access-Control-Allow-Headers'];
    delete config.headers['Access-Control-Expose-Headers'];
    delete config.headers['Access-Control-Allow-Credentials'];
    delete config.headers['Access-Control-Max-Age'];
    
    // Garante que os métodos PUT, PATCH, DELETE tenham os headers corretos
    if (['PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      // Mantém Content-Type apenas se não for FormData
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    // Para uploads de arquivo (multipart/form-data), remove o Content-Type padrão
    // para deixar o browser definir automaticamente com o boundary correto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Log de debug (apenas em desenvolvimento)
    if (ENV_CONFIG.enableConsoleLogs) {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        withCredentials: config.withCredentials,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': config.headers['Authorization'] ? 'Bearer ***' : undefined,
        },
      });
    }
    
    return config;
  },
  (error) => {
    if (ENV_CONFIG.enableConsoleLogs) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratamento de erros
InternalApi.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de debug (apenas em desenvolvimento)
    if (ENV_CONFIG.enableConsoleLogs) {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config.url,
        headers: {
          'access-control-allow-origin': response.headers['access-control-allow-origin'],
          'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
        },
      });
    }
    return response;
  },
  (error) => {
    // Detecta erros de CORS (normalmente aparecem como Network Error)
    if (error.message === 'Network Error' || !error.response) {
      if (ENV_CONFIG.enableConsoleLogs) {
        console.error('❌ ERRO DE CORS/REDE DETECTADO:', {
          método: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
          withCredentials: error.config?.withCredentials,
          mensagem: error.message,
          dica: 'Verifique se o backend está rodando e configurado corretamente para CORS',
          verifique: [
            '1. Backend está rodando na porta 3001?',
            '2. Backend está retornando headers CORS corretos?',
            '3. Requisição OPTIONS (preflight) está sendo tratada?',
          ],
        });
      }
      
      // Adiciona informação mais clara no erro
      (error as any).corsError = true;
      (error as any).userMessage = `Erro de CORS ao tentar ${error.config?.method?.toUpperCase()} em ${error.config?.url}. Verifique se o backend está rodando e configurado corretamente.`;
    }
    
    // Se receber 401 (não autorizado), limpa dados mas NÃO força navegação
    // Deixa o AuthProvider gerenciar a navegação
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('SESSION_KEY');
    }
    
    // Log específico para erro 500 em registro
    if (error.response?.status === 500 && error.config?.url?.includes('/register')) {
      if (ENV_CONFIG.enableConsoleLogs) {
        console.log('Erro 500 no registro - provavelmente problema no backend');
      }
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

