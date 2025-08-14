import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.

const laService = {
    async adicionar(data) {
        return axios.post('/liberacaoavulsa/adicionar', data);
    },
    async listar(data) {
        return axios.post('/liberacaoavulsa/listar',data);
    },
    async listarDIPs(id_dm){
        return axios.get('/liberacaoavulsa/listarDIP', {
        params: { id_dm }
    });
    },
    async listarLocker(){
    return axios.get('/liberacaoavulsa/lockerdisponiveis');
    },
  async itensLocker(id_dm){
    let data = {
      id_dm: id_dm
    }
  return axios.post('/liberacaoavulsa/lockerItens',data);
    },
    async listarPosicoes(data) {
  return axios.post('/liberacaoavulsa/listarPosicoes', data);
}

};

export default laService;