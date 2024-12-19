import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';

const store = useAuthStore();

const funcionarioService = {
  async listarFuncionarios() {
    const data = { id_cliente: store.userIdCliente };
    try {
      const response = await axios.post('/funcionarios/listar', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar funcionários:', error.message);
      throw error;
    }
  },

  async adicionarFuncionario(funcionario, file) {
    const formData = new FormData();

    if (file) {
      const nomeArquivo = `funcionario_${funcionario.nome}_${Date.now()}`;
      formData.append('foto', nomeArquivo);
      formData.append('file', file);
    }

    Object.entries(funcionario).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('id_cliente', store.userIdCliente);
    formData.append('id_usuario', store.userId);

    try {
      await axios.post('/funcionarios/adicionar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error.message);
      throw error;
    }
  },

  async atualizarFuncionario(funcionario, file) {
    const formData = new FormData();

    if (file) {
      const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
      formData.append('foto', nomeArquivo);
      formData.append('file', file);
      formData.append('remove_old_photo', true);
    }

    Object.entries(funcionario).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('id_usuario', store.userId);

    try {
      await axios.put('/funcionarios/atualizar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error.message);
      throw error;
    }
  },

  async deletarFuncionario(idFuncionario) {
    const data = { id_funcionario: idFuncionario, id_usuario: store.userId };
    try {
      await axios.post('/funcionarios/deleteFuncionario', data);
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error.message);
      throw error;
    }
  },

  async listarHierarquia() {
    const data = { id_cliente: store.userIdCliente };
    try {
      const response = await axios.post('/funcionarios/listarhierarquia', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar hierarquia:', error.message);
      throw error;
    }
  },

  async fetchItensSetor(idSetor) {
    const data = { id_cliente: store.userIdCliente, id_setor: idSetor };
    try {
      const response = await axios.post('/Setor/itensdisponiveissetor', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens do setor:', error.message);
      throw error;
    }
  },
  async deletarProdutoFuncionario(data) {
    try {
      const response = await axios.post('/funcionarios/deleteItem', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
};

export default funcionarioService;
