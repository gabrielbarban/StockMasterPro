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
    
    return Promise.reject(error);
  }
);

export default api;