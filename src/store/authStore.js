import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    usuario: null,
    menu:null
  }),
  actions: {
    login({ token, usuario,menu }) {
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
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('menu');
    },
    initializeStore() {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      const menu = localStorage.getItem('menu');
      if (token && usuario) {
        this.token = token;
        this.user = JSON.parse(usuario);
        this.menu = menu ? JSON.parse(menu) : null;
      }
    },
  },
  getters: {
    userName: (state) => {
      return state.usuario.nome;
    },
    userRole: (state) => {
      return state.usuario.role;
    },
    userIdCliente: (state) => {
      return state.usuario.id_cliente;
    },
    userId: (state) => {
      return state.usuario.id_usuario;
    },
    menuItems: (state) => {
      return state.menu;
    },
  },
  persist: true 
});
