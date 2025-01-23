/**
 * Importa a instância `axios`, configurada para facilitar as requisições HTTP.
 */
import axios from 'axios';

/**
 * Importa o roteador da aplicação com as rotas e configurações de navegação.
 */
import router from './router/router';

/**
 * Importa o store `useAuthStore`, que é usado para acessar dados relacionados ao usuário autenticado.
 */
import { useAuthStore } from '@/store/authStore';

/**
 * Define a URL base da API. A URL é obtida de uma variável de ambiente `VITE_API_URL` 
 * ou, se não estiver definida, usa o valor padrão 'http://localhost:3000/api'.
 */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cria uma instância do `axios`, configurada com a URL base da API.
 * Isso facilita o uso de requisições HTTP em toda a aplicação com uma configuração centralizada.
 */
const instance = axios.create({
  baseURL: baseURL, // Configura a URL base para todas as requisições.
});

/**
 * Adiciona um interceptor para as requisições antes de serem enviadas.
 * O interceptor verifica se há um token JWT armazenado no `localStorage`
 * e, se encontrado, o inclui no cabeçalho das requisições como `Authorization`.
 */
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Obtém o token de autenticação do localStorage.
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Adiciona o token no cabeçalho da requisição.
  }
  return config; // Retorna a configuração da requisição modificada.
}, error => {
  return Promise.reject(error); // Se houver um erro ao configurar a requisição, retorna o erro.
});

/**
 * Adiciona um interceptor para as respostas das requisições.
 * O interceptor verifica se a resposta possui um erro 403 (Forbidden).
 * Se o erro for 403, define uma mensagem global de erro e redireciona o usuário para a página de dashboard.
 */
instance.interceptors.response.use(
  response => response, // Se a resposta for bem-sucedida, retorna a resposta normalmente.
  error => {
    // Se a resposta contiver um erro 403 (proibido), trata o erro.
    if (error.response && error.response.status === 403) {
      const authStore = useAuthStore(); // Acessa o store de autenticação.
      authStore.setGlobalMessage('Você não tem permissão para acessar essa página.'); // Define uma mensagem de erro global.
      
      router.push('/dashboard'); // Redireciona o usuário para o dashboard.
    }
    return Promise.reject(error); // Retorna o erro, caso contrário.
  }
);

/**
 * Exporta a instância do `axios` configurada com os interceptores.
 * Esta instância pode ser usada para fazer requisições HTTP em qualquer parte da aplicação.
 */
export default instance;