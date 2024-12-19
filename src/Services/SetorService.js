import axios from '@/axios.js';
const setorService = {
  async listarSetores(data) {
    return axios.post('/Setor/listar', data);
  },

  async adicionarSetor(data) {
    return axios.post('/Setor/adicionar', data);
  },

  async atualizarSetor(data) {
    return axios.post('/Setor/atualizar', data);
  },

  async deletarSetor(data) {
    return axios.post('/Setor/deletar', data);
  },

  async listarItensDisponiveis(data) {
    return axios.post('/setor/itensdisponiveissetor', data);
  },
  async fetchProdutoSetor(data) {
    return axios.post('/setor/fetchProdutoSetor', data);
  },
  async atualizarProdutoSetor(data) {
    return axios.post('/setor/atualizarproduto', data);
  },

  async adicionarProduto(data) {
    return axios.post('/setor/additem', data);
  },

  async deletarProduto(data) {
    return axios.post('/setor/deletarProduto', data);
  },
};

export default setorService;
