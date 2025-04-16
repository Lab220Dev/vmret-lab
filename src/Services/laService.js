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
    },
    async listarLocker(){
    return axios.get('/liberacaoavulsa/lockerdisponiveis');
  },
  async itensLocker(id_dm){
    let data = {
      id_dm: id_dm
    }
  return axios.post('/liberacaoavulsa/lockerItens',data);
}
};

export default laService;