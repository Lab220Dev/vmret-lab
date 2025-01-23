/**
 * Importa o método `defineStore` do Pinia, que é utilizado para criar stores reativos na aplicação.
 */
import { defineStore } from 'pinia'; 

/**
 * Importa o store `useDataStore` que gerencia dados compartilhados da aplicação.
 */
import { useDataStore } from '@/store/dataStore.js'; 

/**
 * Cria e exporta o store `useAuthStore`, responsável pela autenticação e gerenciamento do estado de login.
 * Este store guarda informações de login do usuário, como token, dados do usuário e menu de navegação.
 */
export const useAuthStore = defineStore('auth', {
  /**
   * Define o estado inicial do store, com as propriedades que serão usadas para gerenciar os dados de autenticação.
   * @returns {Object} O estado do store, que inclui o token de autenticação, dados do usuário, o menu de navegação e a mensagem global.
   */
  state: () => ({
    token: null, // Armazena o token de autenticação, inicialmente é null
    usuario: null, // Armazena os dados do usuário logado, inicialmente é null
    menu: null, // Armazena o menu de navegação associado ao usuário, inicialmente é null
    globalMessage: '' // Mensagem global, usada para exibir alertas ou mensagens importantes para o usuário
  }),

  /**
   * Define as ações que podem ser executadas neste store.
   */
  actions: {
    /**
     * Função de login que armazena o token, dados do usuário e o menu na loja e no localStorage.
     * @param {Object} payload - O objeto que contém o token, o usuário e o menu.
     * @param {string} payload.token - O token de autenticação do usuário.
     * @param {Object} payload.usuario - O objeto com os dados do usuário.
     * @param {Object} payload.menu - O menu associado ao usuário.
     */
    login({ token, usuario, menu }) {
      this.token = token; // Armazena o token no store
      this.usuario = usuario; // Armazena os dados do usuário no store
      this.menu = menu; // Armazena o menu no store
      localStorage.setItem('token', token); // Salva o token no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuario)); // Salva os dados do usuário no localStorage
      localStorage.setItem('menu', JSON.stringify(menu)); // Salva o menu no localStorage
    },

    /**
     * Função de logout que limpa todos os dados de autenticação tanto no store quanto no localStorage.
     */
    logout() {
      this.token = null; // Limpa o token no store
      this.usuario = null; // Limpa os dados do usuário no store
      this.menu = null; // Limpa o menu no store
      this.globalMessage = ''; // Limpa a mensagem global ao fazer logout
      localStorage.removeItem('token'); // Remove o token do localStorage
      localStorage.removeItem('usuario'); // Remove os dados do usuário do localStorage
      localStorage.removeItem('menu'); // Remove o menu do localStorage

      /**
       * Reseta o store de dados, apagando quaisquer informações relacionadas.
       * Este comando acessa o store `useDataStore` e chama o método `$reset()`.
       * O método `$reset()` é usado para limpar os dados armazenados no store de dados.
       */
      const dataStore = useDataStore(); 
      dataStore.$reset(); // Limpa os dados no store de dados
    },

    /**
     * Inicializa o store com os dados armazenados no localStorage, se existirem.
     */
    initializeStore() {
      const token = localStorage.getItem('token'); // Tenta recuperar o token do localStorage
      const usuario = localStorage.getItem('usuario'); // Tenta recuperar os dados do usuário do localStorage
      const menu = localStorage.getItem('menu'); // Tenta recuperar o menu do localStorage
      if (token && usuario) { // Se o token e os dados do usuário existirem no localStorage
        this.token = token; // Define o token no store
        this.usuario = JSON.parse(usuario); // Define os dados do usuário no store, convertendo de volta o objeto JSON
        this.menu = menu ? JSON.parse(menu) : null; // Define o menu no store, se existir, converte o menu de volta de JSON
      }
    },

    /**
     * Define a mensagem global, geralmente usada para mostrar alertas ou avisos ao usuário.
     * @param {string} msg - A mensagem que será exibida globalmente.
     */
    setGlobalMessage(msg) {
      this.globalMessage = msg; // Define a mensagem global no store
    },

    /**
     * Limpa a mensagem global, deixando-a em branco.
     */
    clearGlobalMessage() {
      this.globalMessage = ''; // Limpa a mensagem global
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
    Integracao: (state) => {
      return state.usuario?.mob; 
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
