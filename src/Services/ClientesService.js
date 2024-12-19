import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();

const clientesService = {
  async listarClientes() {
    try {
      const response = await axios.post('/admin/cliente/listarComMenu');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error.message);
      throw error;
    }
  },

  async adicionarCliente(cliente) {
    const data = { ...cliente, id_usuario: store.userId };
    try {
      await axios.post('/admin/cliente/adicionar', data);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error.message);
      throw error;
    }
  },

  async atualizarCliente(cliente) {
    const data = { ...cliente, id_usuario: store.userId, id_cliente: cliente.id_cliente };
    try {
      await axios.post('/admin/cliente/atualizar', data);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error.message);
      throw error;
    }
  },

  async deletarCliente(clienteId) {
    const data = { id_cliente: clienteId, id_usuario: store.userId };
    try {
      await axios.post('/admin/cliente/deletar', data);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error.message);
      throw error;
    }
  },
};

export default clientesService;
