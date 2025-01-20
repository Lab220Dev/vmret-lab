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
//será usado em GerenciaMicro
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
};

// Exporta o objeto `clientesService` para ser utilizado em outros arquivos ou componentes.
export default clientesService;
