import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const termoService = {
    async salvaTermo(data) {
        return postRequest('/termo/Salvar', data);
    },
    async recuperaTermo(data) {
        return postRequest('/termo/recuperar', data);
    }
};

export default termoService;