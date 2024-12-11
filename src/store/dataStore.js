
import { defineStore } from 'pinia';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';

const todosOption = { label: 'Todos', value: null };
const addTodosOption = (list) => [todosOption, ...list];

export const useDataStore = defineStore('data', {
    state: () => ({
        funcionarios: null,
        plantas: null,
        setores: null,
        cdcs: null,
        dms: null,
        produtos: null
    }),
    actions: {
        async fetchFuncionarios() {
            if (this.funcionarios) return this.funcionarios;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/funcionarios/listaSimples', data);
                this.funcionarios = addTodosOption(
                    response.data.map((funcionario) => ({
                        label: funcionario.nome,
                        value: funcionario.id_funcionario
                    }))
                );
                return this.funcionarios;
            } catch (error) {
                console.error('Erro ao carregar lista de funcionários:', error);
                throw error;
            }
        },

        async fetchPlantas() {
            if (this.plantas) return this.plantas;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/plantas/listaSimples', data);
                this.plantas = addTodosOption(
                    response.data.map(({ nome, id_planta }) => ({
                        label: `Planta  ${nome}`,
                        value: id_planta
                    }))
                );
                return this.plantas;
            } catch (error) {
                console.error('Erro ao carregar lista de plantas:', error);
                throw error;
            }
        },

        async fetchSetores() {
            if (this.setores) return this.setores;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/Setor/listaSimples', data);
                this.setores = addTodosOption(
                    response.data.map(({ id_setor, nome, id_centro_custo }) => ({
                        label: `Setor  ${nome}`,
                        value: id_setor, 
                        id_centro_custo
                    }))
                );
                return this.setores; 
            } catch (error) {
                console.error('Erro ao carregar lista de Setores:', error);
                throw error;
            }
        },

        async fetchCdc() {
            if (this.cdcs) return this.cdcs;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/cdc/listaSimples', data);
                this.cdcs = addTodosOption(
                    response.data.map(({ ID_CentroCusto, Nome }) => ({
                        label: `Centro de Custo  ${Nome}`,
                        value: ID_CentroCusto
                    }))
                );
                return this.cdcs;
            } catch (error) {
                console.error('Erro ao carregar lista de Centro de Custos:', error);
                throw error;
            }
        },

        async fetchListaDms() {
            if (this.dms) return this.dms;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/DM/listarDMResumido', data);
                this.dms = addTodosOption(
                    response.data.map((dm) => ({
                        label: dm.Identificacao,
                        value: dm.id_dm
                    }))
                );
                return this.dms;
            } catch (error) {
                console.error('Erro ao carregar lista de DMs:', error);
                throw error;
            }
        },
        async fetchProdutos() {
            if (this.produtos) return this.produtos;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/produtos/listarResumo', data);
                this.produtos = addTodosOption(
                    response.data.map((produto) => ({
                        label: produto.nome,
                        value: produto.id_produto,
                        codigo: produto.codigo
                    }))
                );
                return this.produtos;
            } catch (error) {
                console.error('Erro ao carregar lista de produtos:', error);
                throw error;
            }
        },
        invalidateFuncionariosCache() {
            this.funcionarios = null;
        },
        invalidatePlantasCache() {
            this.plantas = null;
        },
        invalidateSetorCache() {
            this.setores = null;
        },
        invalidateCDCCache() {
            this.cdcs = null;
        },
        invalidateDMCache() {
            this.dms = null;
        },
        invalidatProdutoCache() {
            this.produtos = null;
        }
    }
});
