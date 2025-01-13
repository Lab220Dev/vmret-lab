import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const dmService = {
    async listarDMs(data) {
        return postRequest('/DM/listar', data);
    },
    async adicionarDM(data) {
        return postRequest('/DM/adicionar', data);
    },
    async deletarDM(data) {
        return postRequest('/DM/delete', data);
    },
    async atualizarDM(data) {
        return postRequest('/DM/atualizar', data);
    },
    async fetchItemDM(data) {
        return postRequest('/DM/listaritens', data);
    },
    async adicionarItem(data) {
        return postRequest('/DM/adicionarItensDM', data);
    },
    async deletarItem(data) {
        return postRequest('/DM/deleteItem', data);
    },
    async listarProduto(data) {
        return postRequest('/produtos/listar', data);
    },
    async listarClientes() {
        return postRequest('/admin/cliente/listar', {});
    },
    async atualizarProduto(data) {
        return postRequest('/DM/atualizarItens', data);
    }
};

export default dmService;
