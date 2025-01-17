import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const usuarioService = {
    async listarUsuarios(data) {
        return postRequest('/usuarios/listar', data);
    },
    async adicionarUsuario(data) {
        return postRequest('/usuarios/adicionar', data);
    },
    async deletarUsuario(data) {
        return postRequest('/usuarios/deletar', data);
    },
    async atualizarUsuario(data) {
        return postRequest('/usuarios/atualizar', data);
    },
    async listarClientes() {
        return postRequest('/admin/cliente/listar', {});
    }

};

export default usuarioService;