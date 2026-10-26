import axios from 'axios';

// Base URL configurada a partir de variável de ambiente do Vite ou fallback local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para injetar o Bearer Token em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para captura de respostas e tratamento de expiração de sessão (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequestUrl = error.config ? error.config.url : '';
      
      // Evita loop caso o próprio endpoint de login ou reset retorne 401
      const isAuthRoute = 
        originalRequestUrl.includes('/auth/login') || 
        originalRequestUrl.includes('/auth/register') ||
        originalRequestUrl.includes('/auth/reset-password');

      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redireciona para /login se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
