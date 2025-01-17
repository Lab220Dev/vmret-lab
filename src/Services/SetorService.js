import axios from '@/axios.js'; 
import { useAuthStore } from '@/store/authStore.js';
const authStore = useAuthStore();
const  prepareData = (...sources) => {
  let BaseData = {
    id_cliente:authStore.userIdCliente,
    id_usuario: authStore.userId,
  }
  return sources
    .filter(source => typeof source === 'object' && source !== null)
    .reduce((acc, source) => ({ ...acc, ...source }), BaseData);
};
const setorService = {

  /**
   * Lista os setores com base nos dados fornecidos.
   * 
   * @param {Object} data - Dados a serem enviados no corpo da requisição.
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   */
  async listarSetores() {
   try {
        const data = prepareData();
        return axios.post('/Setor/listar', data); 
          

        } catch (error) {
          // Caso ocorra um erro, loga a mensagem de erro no console.
          console.error('Erro ao listar setores:', error.message);
          
          // Lança o erro novamente, permitindo que o chamador lide com ele.
          throw error; 
        }
      },
      async listarSetoresPaginado(data) {
        try {
             return axios.post('/Setor/listarPaginado', data); 
             } catch (error) {
               // Caso ocorra um erro, loga a mensagem de erro no console.
               console.error('Erro ao listar setores:', error.message);
               
               // Lança o erro novamente, permitindo que o chamador lide com ele.
               throw error; 
             }
           },
  /**
   * Adiciona um novo setor ao sistema.
   * 
   * @param {Object} data - Dados do setor a ser adicionado.
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   */
  async adicionarSetor(setor) {
   try {
         const data = prepareData(setor);
          return axios.post('/Setor/adicionar', data);
        } catch (error) {
          // Caso ocorra um erro, loga a mensagem de erro no console.
          console.error('Erro ao adicionar setores:', error.message);
          
          // Lança o erro novamente, permitindo que o chamador lide com ele.
          throw error; 
        }
      },

  /**
   * Atualiza as informações de um setor existente.
   * 
   * @param {Object} data - Dados do setor a ser atualizado (ex: id do setor, novas informações).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   */
  async atualizarSetor(setor) {
    try {
      const data = prepareData(setor);
      return axios.post('/Setor/atualizar', data);

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao listar setores:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Deleta um setor do sistema com base nos dados fornecidos.
   * 
   * @param {Object} data - Dados que identificam o setor a ser deletado (ex: id do setor).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   */
  async deletarSetor(setor) {
    try {
      const data = prepareData(setor);
      return axios.post('/Setor/deletar', data);  // Envia uma requisição POST para deletar um setor com os dados fornecidos.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao deletar setores:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Lista os itens disponíveis em um setor específico.
   * 
   * @param {Object} data - Dados a serem enviados na requisição (ex: ID do setor).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Uma lista de itens disponíveis no setor.
   * - Erro: Caso haja um erro ao buscar os itens.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos ou mal formatados.
   * - Erro 500: Problema no servidor ao listar os itens do setor.
   */
  async listarItensDisponiveis(setor) {
    try {
      const data = prepareData(setor);
      return axios.post('/setor/itensdisponiveissetor', data);  // Envia uma requisição POST para listar os itens disponíveis no setor.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao listar itens disponiveis do setor:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Recupera os produtos de um setor específico.
   * 
   * @param {Object} data - Dados a serem enviados na requisição (ex: ID do setor).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Uma lista de produtos associados ao setor.
   * - Erro: Caso haja um erro na recuperação dos produtos.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos ou mal formatados.
   * - Erro 500: Problema no servidor ao recuperar os produtos do setor.
   */
  async fetchProdutoSetor(data) {
    try {
      return axios.post('/setor/fetchProdutoSetor', data);  // Envia uma requisição POST para buscar os produtos de um setor específico.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao buscar os produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Atualiza as informações de um produto associado a um setor.
   * 
   * @param {Object} data - Dados que identificam o produto e as alterações a serem feitas (ex: ID do produto, novo valor, etc).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto atualizado com sucesso no setor.
   * - Erro: Caso haja um erro ao atualizar o produto no setor.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para atualizar o produto no setor.
   * - Erro 404: Produto ou setor não encontrado.
   * - Erro 500: Problema no servidor ao atualizar o produto.
   */
  async atualizarProdutoSetor(item) {
    try {
      const data = prepareData(item);
      return axios.post('/setor/atualizarproduto', data);  // Envia uma requisição POST para atualizar um produto associado a um setor.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao atualizar os produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Adiciona um novo produto a um setor.
   * 
   * @param {Object} data - Dados do produto a ser adicionado ao setor (ex: id do setor, id do produto).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto adicionado com sucesso ao setor.
   * - Erro: Caso haja um erro ao adicionar o produto ao setor.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para adicionar o produto ao setor.
   * - Erro 500: Problema no servidor ao adicionar o produto ao setor.
   */
  async adicionarProduto(setor,produto) {
    try {
      const data = prepareData(setor,produto);
      return axios.post('/setor/additem', data);  // Envia uma requisição POST para adicionar um produto a um setor específico.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao adicionar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Deleta um produto de um setor específico.
   * 
   * @param {Object} data - Dados que identificam o produto a ser deletado (ex: id do setor, id do produto).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto deletado do setor com sucesso.
   * - Erro: Caso haja um erro ao deletar o produto do setor.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para deletar o produto do setor.
   * - Erro 404: Produto ou setor não encontrado para deleção.
   * - Erro 500: Problema no servidor ao deletar o produto do setor.
   */
  async deletarProduto(setor) {
    try {
      const data = prepareData(setor);
      return axios.post('/setor/deletarProduto', data);  // Envia uma requisição POST para deletar um produto de um setor específico.

    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao deletar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },
};

export default setorService;  // Exporta o serviço para ser usado em outros módulos ou componentes.
