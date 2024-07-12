import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    usuario: null,
  }),
  actions: {
    login({ token, usuario }) {
      this.token = token;
      this.usuario = usuario;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    },
    initializeStore() {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      if (token && usuario) {
        this.token = token;
        this.user = JSON.parse(usuario);
      }
    },
  },
  getters: {
    userName: (state) => {
      return state.usuario[0].nome;
    },
    userRole: (state) => {
      return state.usuario[0].role;
    },
    userIdCliente: (state) => {
      return state.usuario[0].id_cliente;
    }
  },
  persist: true 
});
