import axios from '@/axios.js';
import {prepareProdutoData} from '@/helpers/HelperProduto';
const produtoService = {
  async listarProdutos(data) {
    return axios.post('/produtos/listar', data);
  },

  async adicionarProduto(produto, files) {
    const formData = prepareProdutoData(produto, files);
    return axios.post('/produtos/adicionar', formData, {
      headers: {'Content-Type': 'multipart/form-data' },
    });
  },

  async atualizarProduto(produto, files) {
    const formData = prepareProdutoData(produto, files);
    return axios.post('/produtos/atualizar', formData);
  },

  async deletarProduto(data) {
    return axios.post('/produtos/deleteProduto', data);
  },

  async obterImagem(userIdCliente, filename) {
    return axios.get(`/image/produto/${userIdCliente}/${filename}`);
  },
};

export default produtoService;
