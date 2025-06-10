import axios from '@/axios.js';

const monitoramentoService = {

async relatorio(data) {
    try {
        const response = await axios.post('/nomad/relatorio', data);
        return response.data;
    } catch (error) {
        throw error;
    }
},
async relatorioRetirada(data) {
    try {
        const response = await axios.post('/nomad/relatorioRetirada', data);
        return response.data;
    } catch (error) {
        throw error;
    }
},
async register(data) {
    try {
        return axios.post('/nomad/register', data); // Ajustar a URL para corresponder à rota do backend
        
    } catch (error) {
        throw error;
    }
},
async deleteUser(data) {
    try {
        const response = await axios.post('/nomad/deleteUser', data);
    } catch (error) {
        throw error;
    }
},

async listarUsuarios(data) {
    try {
        const response = await axios.post('/nomad/listarUsuarios', data);
        return response.data;
    } catch (error) {
        throw error;
    }
},
async atualizarUsuario(data) {
    try {
        const response = await axios.post('/nomad/atualizarUsuario', data);
        return response.data;
    } catch (error) {
        throw error;
    }
},
async relatorioAberturaPorta(data) {
    try {
      const response = await axios.post('/nomad/relatorioAberturaPorta', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default monitoramentoService;