import { defineStore } from 'pinia';
import { useDataStore } from '@/store/dataStore.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    usuario: null,
    menu: null,
    globalMessage: '' // Propriedade de estado para a mensagem global
  }),
  actions: {
    login({ token, usuario, menu }) {
      this.token = token;
      this.usuario = usuario;
      this.menu = menu;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('menu', JSON.stringify(menu));
    },
    logout() {
      this.token = null;
      this.usuario = null;
      this.menu = null;
      this.globalMessage = ''; // Limpa a mensagem global ao fazer logout
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('menu');
      
      const dataStore = useDataStore();
      dataStore.$reset();
    },
    initializeStore() {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      const menu = localStorage.getItem('menu');
      if (token && usuario) {
        this.token = token;
        this.usuario = JSON.parse(usuario);
        this.menu = menu ? JSON.parse(menu) : null;
      }
    },
    setGlobalMessage(msg) {
      this.globalMessage = msg;
    },
    clearGlobalMessage() {
      this.globalMessage = '';
    }
  },
  getters: {
    userName: (state) => {
      return state.usuario?.nome || ''; // Usando operador de encadeamento opcional
    },
    userRole: (state) => {
      return state.usuario?.role || ''; // Usando operador de encadeamento opcional
    },
    userIdCliente: (state) => {
      return state.usuario?.id_cliente || ''; // Usando operador de encadeamento opcional
    },
    userId: (state) => {
      return state.usuario?.id_usuario || ''; // Usando operador de encadeamento opcional
    },
    menuItems: (state) => {
      return state.menu || []; // Retorna uma lista vazia se o menu for nulo
    },
    getGlobalMessage: (state) => { // Renomeando o getter
      return state.globalMessage;
    }
  },
  persist: true // Isso garante que o estado do Pinia seja persistido automaticamente
});
