// Importa a instância configurada do Axios para realizar requisições HTTP.
import axios from '@/axios.js'; 

// Importa o store de autenticação para acessar informações do usuário autenticado.
import { useAuthStore } from '@/store/authStore.js'; 

// Cria uma instância do store de autenticação, que contém dados do usuário autenticado.
const store = useAuthStore();

// Definição do objeto `clientesService` que contém métodos para interagir com a API de clientes.
const clientesService = {
  /**
   * Método assíncrono para listar todos os clientes.
   * @returns {Promise<Object>} A lista de clientes.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async listarClientes() {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.post('/admin/cliente/listarComMenu');
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },
  async listarClientesPaginado(data) {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.post('/admin/cliente/listarComMenuPaginado',data);
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },
  async listarClienteServicos() {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.get('/admin/cliente/listarClienteServicos');
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },

  async listarServicos(data) {
    try {
      // Realiza uma requisição POST para listar os clientes.
      console.log('Chamando API para listar serviços com dados:', data);
      const response = await axios.post('/admin/cliente/listarServicos', data);
      return response; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  }
  ,

  async adicionarServico(data) {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.post('/admin/cliente/adicionarServico', data);
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },

  async atualizarServico(data) {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.post('/admin/cliente/atualizarServico', data);
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },

  async deletarServico(data) {
    try {
      // Realiza uma requisição POST para listar os clientes.
      const response = await axios.post('/admin/cliente/deletarServico', data);
      return response.data; // Retorna os dados da resposta (listagem de clientes).
    } catch (error) {
      // Em caso de erro, exibe a mensagem de erro no console e relança o erro.
      console.error('Erro ao listar clientes:', error.message);
      throw error; // Lança o erro novamente para que o chamador possa tratá-lo.
    }
  },
  
  /**
   * Método assíncrono para adicionar um novo cliente.
   * @param {Object} cliente - Os dados do cliente a ser adicionado.
   * @returns {Promise<void>} Uma Promise que indica o sucesso ou falha da operação.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async adicionarCliente(cliente) {
    // Cria um objeto de dados contendo os dados do cliente e o id do usuário autenticado.
    const data = { ...cliente, id_usuario: store.userId };

    try {
      // Realiza uma requisição POST para adicionar o cliente.
      await axios.post('/admin/cliente/adicionar', data);
    } catch (error) {
      // Caso ocorra um erro na requisição, exibe a mensagem no console e lança o erro.
      console.error('Erro ao adicionar cliente:', error.message);
      throw error; // Lança o erro novamente para o chamador.
    }
  },

  

  /**
   * Método assíncrono para atualizar as informações de um cliente.
   * @param {Object} cliente - Os dados atualizados do cliente.
   * @returns {Promise<void>} Uma Promise que indica o sucesso ou falha da operação.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async atualizarCliente(cliente) {
    // Cria um objeto de dados contendo os dados atualizados do cliente e o id do usuário autenticado.
    const data = { ...cliente, id_usuario: store.userId, id_cliente: cliente.id_cliente };

    try {
      // Realiza uma requisição POST para atualizar as informações do cliente.
      await axios.post('/admin/cliente/atualizar', data);
    } catch (error) {
      // Caso ocorra um erro na requisição, exibe a mensagem no console e lança o erro.
      console.error('Erro ao atualizar cliente:', error.message);
      throw error; // Lança o erro novamente para o chamador.
    }
  },

  /**
   * Método assíncrono para deletar um cliente com base no seu ID.
   * @param {number} clienteId - O ID do cliente a ser deletado.
   * @returns {Promise<void>} Uma Promise que indica o sucesso ou falha da operação.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async deletarCliente(clienteId) {
    // Cria um objeto de dados com o id do cliente e o id do usuário autenticado.
    const data = { id_cliente: clienteId, id_usuario: store.userId };

    try {
      // Realiza uma requisição POST para deletar o cliente.
      await axios.post('/admin/cliente/deletar', data);
    } catch (error) {
      // Caso ocorra um erro na requisição, exibe a mensagem no console e lança o erro.
      console.error('Erro ao deletar cliente:', error.message);
      throw error; // Lança o erro novamente para o chamador.
    }
  },
  async fetchDadosCliente(clienteId) {
    // Cria um objeto de dados com o id do cliente e o id do usuário autenticado.
    const data = { id_cliente: clienteId };

    try {
      // Realiza uma requisição POST para deletar o cliente.
     const response = await axios.post('/admin/cliente/fetchdados', data);
     return response.data;
    } catch (error) {
      // Caso ocorra um erro na requisição, exibe a mensagem no console e lança o erro.
      console.error('Erro ao deletar cliente:', error.message);
      throw error; // Lança o erro novamente para o chamador.
    }
  },
};

// Exporta o objeto `clientesService` para ser utilizado em outros arquivos ou componentes.
export default clientesService;
