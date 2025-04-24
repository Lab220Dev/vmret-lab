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
}
}

export default monitoramentoService;