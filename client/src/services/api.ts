import axios from 'axios';

// Configurable API base URL: defaults to '/api' for Vercel/same-domain proxy or custom VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tjm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized request to:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
