import axios from 'axios';
import router from './router/router';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: baseURL, 
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  response => response, 
  error => {
    if (error.response && error.response.status === 403) {
      const authStore = useAuthStore();
      authStore.setGlobalMessage('Você não tem permissão para acessar essa página.');

      router.push('/dashboard');
    }
    return Promise.reject(error);
  }
);

export default instance;
