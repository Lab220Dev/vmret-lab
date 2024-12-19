import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';

const store = useAuthStore();

const funcaoService = {
  async listarFuncoes() {
    const data = { id_cliente: store.userIdCliente };
    try {
      const response = await axios.post('/funcao/listar', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar funções:', error.message);
      throw error;
    }
  },

  async adicionarFuncao(funcao) {
    const data = {
      id_usuario: store.userId,
      id_cliente: store.userIdCliente,
      ...funcao,
    };
    try {
      await axios.post('/funcao/adicionar', data);
    } catch (error) {
      console.error('Erro ao adicionar função:', error.message);
      throw error;
    }
  },

  async atualizarFuncao(funcao) {
    try {
      await axios.post('/funcao/atualizar', funcao);
    } catch (error) {
      console.error('Erro ao atualizar função:', error.message);
      throw error;
    }
  },

  async deletarFuncao(idFuncao) {
    const data = { id_funcao: idFuncao, id_usuario: store.userId };
    try {
      await axios.post('/funcao/deletar', data);
    } catch (error) {
      console.error('Erro ao deletar função:', error.message);
      throw error;
    }
  },

};

export default funcaoService;
