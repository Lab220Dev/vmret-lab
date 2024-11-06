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
                const response = await axios.get('/plantas/listaSimples');
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
        // Crie ações similares para `fetchSetores`, `fetchCdcs` e `fetchDms`

        // Invalida o cache de uma lista específica após uma atualização
        invalidateCache(key) {
            if (this[key] !== undefined) {
                this[key] = null;
            }
        }
    }
});
