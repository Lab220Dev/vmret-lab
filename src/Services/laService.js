import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.

const laService = {
    async adicionar(data) {
        return axios.post('/liberacaoavulsa/adicionar', data);
    },
    async listar(data) {
        return axios.post('/liberacaoavulsa/listar',data);
    },
    async listarCodigo(){
        return axios.get('/liberacaoavulsa/listarCodigo');
    }

};

export default laService;