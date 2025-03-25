import axios from 'axios';

const usuarioService = {
    async listarUsuarios() {
        const response = await axios.get('http://localhost:3050/listarUsuarios');
        return response.data;
    },
    async listarMaquina() {
        const response = await axios.get('http://localhost:3050/maquinas');
        return response.data;
    },
    async listarClientes() {
        const response = await axios.get('http://localhost:3050/clientes');
        return response.data;
    },

    async adiconarUsuarios(data) {
        return axios.post('http://localhost:3050/register', data);
    },
    async editarUsuarios(data) {
        return axios.post('http://localhost:3050/edit', data);
    },
    async deletarUsuarios(data) {
        return axios.post('http://localhost:3050/delete', data);
    }
};
export default usuarioService;
