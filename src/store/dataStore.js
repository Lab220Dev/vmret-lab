import { defineStore } from 'pinia'; // Importa a função 'defineStore' da biblioteca Pinia para criar uma store
import { useAuthStore } from '@/store/authStore'; // Importa a store de autenticação para acessar informações do usuário
import  funcionarioService  from '@/services/funcionarioService'; // Importa o serviço de funcionários para carregar a lista de funcionários
import  plantaService  from '@/services/PlantaService';
import setorService from '@/Services/SetorService';
import cdcService from '@/Services/cdcService';
import dmService from '@/Services/DmService';
import produtoService from '@/Services/produtoService';
import i18n from '@/i18n';

// Define a store 'data' utilizando Pinia
export const useDataStore = defineStore('data', {
    getters: {
        funcionariosOptions(state) {
          // Acessa o locale para criar dependência reativa
          const _ = i18n.global.locale;
          return state.funcionarios
            ? [{ label: i18n.global.t('all'), value: null }, ...state.funcionarios]
            : [];
        },
        plantasOptions(state) {
          const _ = i18n.global.locale;
          return state.plantas
            ? [{ label: i18n.global.t('all'), value: null }, ...state.plantas]
            : [];
        },
        setoresOptions(state) {
          const _ = i18n.global.locale;
          return state.setores
            ? [{ label: i18n.global.t('all'), value: null }, ...state.setores]
            : [];
        },
        cdcsOptions(state) {
          const _ = i18n.global.locale;
          return state.cdcs
            ? [{ label: i18n.global.t('all'), value: null }, ...state.cdcs]
            : [];
        },
        dmsOptions(state) {
          const _ = i18n.global.locale;
          return state.dms
            ? [{ label: i18n.global.t('all'), value: null }, ...state.dms]
            : [];
        },
        produtosOptions(state) {
          const _ = i18n.global.locale;
          return state.produtos
            ? [{ label: i18n.global.t('all'), value: null }, ...state.produtos]
            : [];
        }
      },
    state: () => ({
        // Inicializa o estado da store com variáveis para armazenar as listas de dados
        funcionarios: null,  // Lista de funcionários
        plantas: null,       // Lista de plantas
        setores: null,       // Lista de setores
        cdcs: null,          // Lista de Centros de Custo
        dms: null,           // Lista de DMs (Documentos)
        produtos: null       // Lista de produtos
    }),

    actions: {
        /**
         * Carrega a lista de funcionários.
         * Se os dados já estiverem carregados, retorna os dados em cache.
         * @returns {Array} Lista de funcionários
         * @throws {Error} Se houver erro na requisição
         */
        async fetchFuncionarios() {
            if (this.funcionarios) return this.funcionarios; // Se os dados de funcionários já estiverem carregados, retorna os dados em cache

            try {
                const authStore = useAuthStore(); // Obtém a store de autenticação para pegar o id_cliente
                const data = {
                    id_cliente: authStore.userIdCliente // Prepara os dados com id_cliente do usuário logado
                };

                const response = await funcionarioService.listarFuncionariosSimples(data);
                this.funcionarios = response.data.map((funcionario) => ({
                    label: funcionario.nome,
                    value: funcionario.id_funcionario
                  }));
                return this.funcionarios; // Retorna a lista de funcionários
            } catch (error) {
                console.error('Erro ao carregar lista de funcionários:', error); // Se houver erro, exibe no console
                throw error; // Lança o erro para ser tratado externamente
            }
        },

        /**
         * Carrega a lista de plantas.
         * @returns {Array} Lista de plantas
         * @throws {Error} Se houver erro na requisição
         */
        async fetchPlantas() {
            if (this.plantas) return this.plantas; // Retorna os dados em cache se já estiverem carregados

            try {
                const authStore = useAuthStore(); // Obtém a store de autenticação para pegar o id_cliente
                const data = {
                    id_cliente: authStore.userIdCliente // Prepara os dados com id_cliente
                };

                const response = await plantaService.listarPlantasSimples(data); // Faz a requisição para carregar a lista de plantas
                this.plantas = response.data.map(({ nome, id_planta }) => ({
                    label: nome,
                    value: id_planta
                  }));
                  return this.plantas;
            } catch (error) {
                console.error('Erro ao carregar lista de plantas:', error); // Exibe erro no console caso a requisição falhe
                throw error; // Lança o erro
            }
        },

        /**
         * Carrega a lista de setores.
         * @returns {Array} Lista de setores
         * @throws {Error} Se houver erro na requisição
         */
        async fetchSetores() {
            if (this.setores) return this.setores; // Se os dados de setores já estiverem carregados, retorna os dados em cache

            try {
                const authStore = useAuthStore(); // Obtém a store de autenticação para pegar o id_cliente
                const data = {
                    id_cliente: authStore.userIdCliente // Prepara os dados com id_cliente
                };

                const response = await setorService.listarSetoresSimples(data); // Faz a requisição para carregar a lista de setores
                this.setores = response.data.map(({ id_setor, nome, id_centro_custo }) => ({
                    label: nome,
                    value: id_setor,
                    id_centro_custo
                  }));
                  return this.setores;
            } catch (error) {
                console.error('Erro ao carregar lista de Setores:', error); // Exibe erro no console se a requisição falhar
                throw error; // Lança o erro
            }
        },

        /**
         * Carrega a lista de Centros de Custo (CDCs).
         * @returns {Array} Lista de Centros de Custo
         * @throws {Error} Se houver erro na requisição
         */
        async fetchCdc() {
            if (this.cdcs) return this.cdcs; // Se os dados de Centros de Custo já estiverem carregados, retorna os dados em cache

            try {
                const response = await cdcService.listarCentrosDeCustoSimples(); // Faz a requisição para carregar a lista de Centros de Custo
                this.cdcs = response.data.map(({ ID_CentroCusto, Nome }) => ({
                    label: Nome,
                    value: ID_CentroCusto
                  }));
                  return this.cdcs; // Retorna a lista de Centros de Custo
            } catch (error) {
                console.error('Erro ao carregar lista de Centro de Custos:', error); // Exibe erro no console se a requisição falhar
                throw error; // Lança o erro
            }
        },

        /**
         * Carrega a lista de DMs (Documentos).
         * @returns {Array} Lista de DMs
         * @throws {Error} Se houver erro na requisição
         */
        async fetchListaDms() {
            if (this.dms) return this.dms; // Se os dados de DMs já estiverem carregados, retorna os dados em cache

            try {
                const authStore = useAuthStore(); // Obtém a store de autenticação para pegar o id_cliente
                const data = {
                    id_cliente: authStore.userIdCliente // Prepara os dados com id_cliente
                };

                const response = await dmService.listarDMSimples(data); // Faz a requisição para carregar a lista de DMs
                this.dms = response.data.map((dm) => ({
                        label: dm.Identificacao, // Identificação do DM como rótulo
                        value: dm.id_dm // ID do DM como valor
                    })
                );
                return this.dms; // Retorna a lista de DMs
            } catch (error) {
                console.error('Erro ao carregar lista de DMs:', error); // Exibe erro no console se a requisição falhar
                throw error; // Lança o erro
            }
        },

        /**
         * Carrega a lista de produtos.
         * @returns {Array} Lista de produtos
         * @throws {Error} Se houver erro na requisição
         */
        async fetchProdutos() {
            if (this.produtos) return this.produtos; // Se os dados de produtos já estiverem carregados, retorna os dados em cache

            try {
                const authStore = useAuthStore(); // Obtém a store de autenticação para pegar o id_cliente
                const data = {
                    id_cliente: authStore.userIdCliente // Prepara os dados com id_cliente
                };

                const response =   await produtoService.listarProdutosSimples(data); // Faz a requisição para carregar a lista de produtos
                this.produtos = response.data.map((produto) => ({
                        label: produto.nome, // Nome do produto como rótulo
                        value: produto.id_produto, // ID do produto como valor
                        codigo: produto.codigo // Código do produto
                    })
                );
                return this.produtos; // Retorna a lista de produtos
            } catch (error) {
                console.error('Erro ao carregar lista de produtos:', error); // Exibe erro no console se a requisição falhar
                throw error; // Lança o erro
            }
        },

        // Funções para invalidar o cache das listas carregadas
        invalidateFuncionariosCache() {
            this.funcionarios = null; // Define a lista de funcionários como null para forçar um novo carregamento
        },
        invalidatePlantasCache() {
            this.plantas = null; // Define a lista de plantas como null para forçar um novo carregamento
        },
        invalidateSetorCache() {
            this.setores = null; // Define a lista de setores como null para forçar um novo carregamento
        },
        invalidateCDCCache() {
            this.cdcs = null; // Define a lista de Centros de Custo como null para forçar um novo carregamento
        },
        invalidateDMCache() {
            this.dms = null; // Define a lista de DMs como null para forçar um novo carregamento
        },
        invalidatProdutoCache() {
            this.produtos = null; // Define a lista de produtos como null para forçar um novo carregamento
        }
    }
});
