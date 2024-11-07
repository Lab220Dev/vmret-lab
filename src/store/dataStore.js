// src/store/dataStore.js
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
        dms: null
    }),
    actions: {
        async fetchFuncionarios() {
            if (this.funcionarios) {
                return this.funcionarios;
            }

            const authStore = useAuthStore();
            const data = {
                id_cliente: authStore.userIdCliente
            };

            try {
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
                    response.data.map((planta) => ({
                        label: planta.nome,
                        value: planta.id_planta
                    }))
                );
                return this.plantas;
            } catch (error) {
                console.error('Erro ao carregar lista de plantas:', error);
                throw error;
            }
        },

        async fetchSetores() {
            // Corrigido para `fetchSetores`
            if (this.setores) return this.setores;

            try {
                const authStore = useAuthStore();
                const data = {
                    id_cliente: authStore.userIdCliente
                };
                const response = await axios.post('/Setor/listaSimples', data);
                this.setores = addTodosOption(
                    response.data.map((setor) => ({
                        // Corrigido `setores` para `setor`
                        label: setor.nome,
                        value: setor.id_setor // Corrigido `plansetoresta` para `setor`
                    }))
                );
                return this.setores; // Corrigido retorno para `this.setores`
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
                    response.data.map((cdc) => ({
                        label: cdc.Nome,
                        value: cdc.ID_CentroCusto
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
        }
    }
});
