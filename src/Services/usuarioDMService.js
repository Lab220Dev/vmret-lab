import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const usuarioDMService = {
    async listarUsuariosDM(data) {
        return postRequest('/UDM/listar', data);
    },
    async adicionarUsuarioDM(data) {
        return postRequest('/UDM/adicionar', data);
    },
    async deletarUsuarioDM(data) {
        return postRequest('/UDM/deletar', data);
    },
    async atualizarUsuarioDM(data) {
        return postRequest('/UDM/atualizar', data);
    },
    async listaSimplesClientes() {
        return postRequest('/admin/cliente/listaSimples');
    },
};

export default usuarioDMService;