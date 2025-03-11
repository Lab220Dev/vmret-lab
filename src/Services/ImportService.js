import axios from '@/axios.js';

const ImportService = {
    async mass(dados, tipo) {
        try {
            const data = {
                dados: dados,
                tipo: tipo
            };
            const response = await axios.post('/import/mass', data);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar clientes:', error.message);
            throw error;
        }
    }
};

export default ImportService;
