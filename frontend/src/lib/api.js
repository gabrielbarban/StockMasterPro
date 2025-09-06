import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`🔥 ${config.method?.toUpperCase()} ${config.url}`);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('🔐 Token do localStorage:', token ? token.substring(0, 50) + '...' : 'null');
      
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Header Authorization adicionado:', config.headers['Authorization'].substring(0, 50) + '...');
      } else {
        console.log('❌ Nenhum token encontrado no localStorage');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status || 'unknown';
    const url = error.config?.url || 'unknown';
    const message = error.response?.data?.message || error.message;
    const data = error.response?.data;
    const requestData = error.config?.data;
    
    console.error(`❌ ${status} ${url}`, { 
      message, 
      responseData: data,
      requestData: requestData ? JSON.parse(requestData) : null
    });
    
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('empresa');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;