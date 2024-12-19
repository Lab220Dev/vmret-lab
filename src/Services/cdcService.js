import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import { useDataStore } from '@/store/dataStore.js';

const store = useAuthStore();
const dataStore = useDataStore();

const cdcService = {
    async listarCentrosDeCusto() {
        const data = { id_cliente: store.userIdCliente };

        try {
            const response = await axios.post('/cdc/listar', data);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar centros de custo:', error);
            throw error;
        }
    },

    async adicionarCentro(cdc) {
        const data = {
            id_cliente: store.userIdCliente,
            id_usuario: store.userId,
            ...cdc
        };

        try {
            await axios.post('/cdc/adicionar', data);
            dataStore.invalidateCDCCache();
        } catch (error) {
            console.error('Erro ao adicionar centro de custo:', error);
            throw error;
        }
    },

    async atualizarCentro(cdc) {
        const data = {
            id_cliente: store.userIdCliente,
            id_usuario: store.userId,
            ...cdc
        };

        try {
            await axios.post('/cdc/atualizar', data);
            dataStore.invalidateCDCCache();
        } catch (error) {
            console.error('Erro ao atualizar centro de custo:', error);
            throw error;
        }
    },

    async deletarCentro(cdc) {
        const data = {
            id_cliente: store.userIdCliente,
            id_usuario: store.userId,
            ID_CentroCusto: cdc.ID_CentroCusto
        };

        try {
            await axios.post('/cdc/deleteCentro', data);
            dataStore.invalidateCDCCache();
        } catch (error) {
            console.error('Erro ao deletar centro de custo:', error);
            throw error;
        }
    }
};

export default cdcService;
