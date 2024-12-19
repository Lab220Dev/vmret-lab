/**
 * Importa a função `defineStore` do Pinia, usada para criar e gerenciar stores reativos.
 */
import { defineStore } from 'pinia';

/**
 * Importa a instância `axios`, configurada para facilitar as requisições HTTP.
 */
import axios from '@/axios.js';

/**
 * Importa o store `useAuthStore`, que é usado para acessar dados relacionados ao usuário autenticado.
 */
import { useAuthStore } from '@/store/authStore';

/**
 * Define uma opção 'Todos' que será adicionada no início de listas de seleção.
 */
const todosOption = { label: 'Todos', value: null };

/**
 * Função auxiliar que adiciona a opção 'Todos' no começo de qualquer lista de opções.
 * @param {Array} list - A lista original de itens.
 * @returns {Array} A lista com a opção 'Todos' no início.
 */
const addTodosOption = (list) => [todosOption, ...list];

/**
 * Cria e exporta o store `useDataStore`, que gerencia os dados compartilhados da aplicação,
 * como funcionários, plantas, setores, centros de custo (CDCs), DMs e produtos.
 */
export const useDataStore = defineStore('data', {
  /**
   * Define o estado inicial do store, que armazena listas de dados como funcionários, plantas, setores, etc.
   * @returns {Object} O estado inicial com as propriedades para armazenar as listas de dados.
   */
  state: () => ({
    funcionarios: null, // Lista de funcionários, inicialmente vazia.
    plantas: null, // Lista de plantas, inicialmente vazia.
    setores: null, // Lista de setores, inicialmente vazia.
    cdcs: null, // Lista de centros de custo (CDCs), inicialmente vazia.
    dms: null, // Lista de DMs, inicialmente vazia.
    produtos: null // Lista de produtos, inicialmente vazia.
  }),

  /**
   * Define as ações do store, que são métodos que manipulam ou obtêm dados e atualizam o estado do store.
   */
  actions: {
    
    /**
     * Faz a requisição para obter a lista de funcionários e armazena no estado.
     * Caso a lista já tenha sido carregada, retorna diretamente os dados.
     * @returns {Array} A lista de funcionários com a opção 'Todos' no início.
     */
    async fetchFuncionarios() {
      if (this.funcionarios) return this.funcionarios; // Se a lista já existe, retorna ela diretamente.

      try {
        const authStore = useAuthStore(); // Obtém o store de autenticação.
        const data = {
          id_cliente: authStore.userIdCliente // Passa o ID do cliente autenticado na requisição.
        };
        const response = await axios.post('/funcionarios/listaSimples', data); // Faz a requisição para obter os funcionários.
        this.funcionarios = addTodosOption( // Adiciona a opção 'Todos' na lista de funcionários.
          response.data.map((funcionario) => ({
            label: funcionario.nome, // Nome do funcionário.
            value: funcionario.id_funcionario // ID do funcionário.
          }))
        );
        return this.funcionarios;
      } catch (error) {
        console.error('Erro ao carregar lista de funcionários:', error); // Exibe erro no console, caso ocorra.
        throw error; // Lança o erro para ser tratado por quem chamou a função.
      }
    },

    /**
     * Faz a requisição para obter a lista de plantas e armazena no estado.
     * @returns {Array} A lista de plantas com a opção 'Todos' no início.
     */
    async fetchPlantas() {
      if (this.plantas) return this.plantas; // Se a lista de plantas já foi carregada, retorna ela diretamente.

      try {
        const authStore = useAuthStore();
        const data = { id_cliente: authStore.userIdCliente };
        const response = await axios.post('/plantas/listaSimples', data);
        this.plantas = addTodosOption(
          response.data.map(({ nome, id_planta }) => ({
            label: `Planta  ${nome}`, // Formata o nome da planta.
            value: id_planta // ID da planta.
          }))
        );
        return this.plantas;
      } catch (error) {
        console.error('Erro ao carregar lista de plantas:', error);
        throw error;
      }
    },

    /**
     * Faz a requisição para obter a lista de setores e armazena no estado.
     * @returns {Array} A lista de setores com a opção 'Todos' no início.
     */
    async fetchSetores() {
      if (this.setores) return this.setores; // Se a lista de setores já foi carregada, retorna ela diretamente.

      try {
        const authStore = useAuthStore();
        const data = { id_cliente: authStore.userIdCliente };
        const response = await axios.post('/Setor/listaSimples', data);
        this.setores = addTodosOption(
          response.data.map(({ id_setor, nome, id_centro_custo }) => ({
            label: `Setor  ${nome}`, // Formata o nome do setor.
            value: id_setor, // ID do setor.
            id_centro_custo // ID do centro de custo relacionado.
          }))
        );
        return this.setores;
      } catch (error) {
        console.error('Erro ao carregar lista de Setores:', error);
        throw error;
      }
    },

    /**
     * Faz a requisição para obter a lista de centros de custo (CDCs) e armazena no estado.
     * @returns {Array} A lista de centros de custo (CDCs) com a opção 'Todos' no início.
     */
    async fetchCdc() {
      if (this.cdcs) return this.cdcs; // Se a lista de centros de custo já foi carregada, retorna ela diretamente.

      try {
        const authStore = useAuthStore();
        const data = { id_cliente: authStore.userIdCliente };
        const response = await axios.post('/cdc/listaSimples', data);
        this.cdcs = addTodosOption(
          response.data.map(({ ID_CentroCusto, Nome }) => ({
            label: `Centro de Custo  ${Nome}`, // Formata o nome do centro de custo.
            value: ID_CentroCusto // ID do centro de custo.
          }))
        );
        return this.cdcs;
      } catch (error) {
        console.error('Erro ao carregar lista de Centro de Custos:', error);
        throw error;
      }
    },

    /**
     * Faz a requisição para obter a lista de DMs e armazena no estado.
     * @returns {Array} A lista de DMs com a opção 'Todos' no início.
     */
    async fetchListaDms() {
      if (this.dms) return this.dms; // Se a lista de DMs já foi carregada, retorna ela diretamente.

      try {
        const authStore = useAuthStore();
        const data = { id_cliente: authStore.userIdCliente };
        const response = await axios.post('/DM/listarDMResumido', data);
        this.dms = addTodosOption(
          response.data.map((dm) => ({
            label: dm.Identificacao, // Formata a identificação do DM.
            value: dm.id_dm // ID do DM.
          }))
        );
        return this.dms;
      } catch (error) {
        console.error('Erro ao carregar lista de DMs:', error);
        throw error;
      }
    },

    /**
     * Faz a requisição para obter a lista de produtos e armazena no estado.
     * @returns {Array} A lista de produtos com a opção 'Todos' no início.
     */
    async fetchProdutos() {
      if (this.produtos) return this.produtos; // Se a lista de produtos já foi carregada, retorna ela diretamente.

      try {
        const authStore = useAuthStore();
        const data = { id_cliente: authStore.userIdCliente };
        const response = await axios.post('/produtos/listarResumo', data);
        this.produtos = addTodosOption(
          response.data.map((produto) => ({
            label: produto.nome, // Nome do produto.
            value: produto.id_produto, // ID do produto.
            codigo: produto.codigo // Código do produto.
          }))
        );
        return this.produtos;
      } catch (error) {
        console.error('Erro ao carregar lista de produtos:', error);
        throw error;
      }
    },

    /**
     * Limpa o cache da lista de funcionários.
     */
    invalidateFuncionariosCache() {
      this.funcionarios = null;
    },

    /**
     * Limpa o cache da lista de plantas.
     */
    invalidatePlantasCache() {
      this.plantas = null;
    },

    /**
     * Limpa o cache da lista de setores.
     */
    invalidateSetorCache() {
      this.setores = null;
    },

    /**
     * Limpa o cache da lista de centros de custo (CDCs).
     */
    invalidateCDCCache() {
      this.cdcs = null;
    },

    /**
     * Limpa o cache da lista de DMs.
     */
    invalidateDMCache() {
      this.dms = null;
    },

    /**
     * Limpa o cache da lista de produtos.
     */
    invalidatProdutoCache() {
      this.produtos = null;
    }
  }
});