import axios from '@/axios.js';  // Importa o axios para fazer requisições HTTP.
import { prepareProdutoData} from '@/helpers/HelperProduto';  // Importa uma função helper para preparar os dados do produto.

// Define o serviço produtoService que contém métodos para interagir com a API de produtos.
const produtoService = {

  /**
   * Lista os produtos com base nos parâmetros fornecidos.
   * 
   * @param {Object} data - Dados a serem enviados no corpo da requisição. Pode incluir filtros ou parâmetros de busca.
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Uma lista de produtos que atendem aos critérios passados.
   * - Erro: Um erro que descreve o problema com a requisição.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados de busca inválidos.
   * - Erro 500: Problema no servidor.
   */
  async listarProdutos(data) {
    try {
      return axios.post('/produtos/listar', data);  // Envia uma requisição POST para listar produtos com base nos dados fornecidos.
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao listar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Adiciona um novo produto ao sistema, incluindo arquivos (como imagens) se necessário.
   * 
   * @param {Object} produto - Objeto contendo as informações do produto a ser adicionado (ex: nome, preço, descrição).
   * @param {Array} files - Arquivos associados ao produto (por exemplo, imagens).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto adicionado com sucesso.
   * - Erro: Um erro ocorre caso haja problemas ao adicionar o produto.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para o produto ou arquivos não suportados.
   * - Erro 500: Problema no servidor ao adicionar o produto.
   */
  async adicionarProduto(produto, files) {
    try {
      const formData = prepareProdutoData(produto, files);  // Prepara os dados do produto e arquivos para envio (usando uma função helper).
    return axios.post('/produtos/adicionar', formData, {
      headers: {'Content-Type': 'multipart/form-data' },  // Define o cabeçalho para envio de formulários com arquivos.
    });
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao adicionar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Atualiza um produto existente no sistema, incluindo arquivos associados, se necessário.
   * 
   * @param {Object} produto - Objeto contendo as informações atualizadas do produto.
   * @param {Array} files - Arquivos associados ao produto, caso existam.
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto atualizado com sucesso.
   * - Erro: Um erro ocorre caso haja problemas ao atualizar o produto.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para o produto ou arquivos não suportados.
   * - Erro 404: Produto não encontrado para atualização.
   * - Erro 500: Problema no servidor ao atualizar o produto.
   */
  async atualizarProduto(produto, files) {
    try {
      const formData = prepareProdutoData(produto, files);  // Prepara os dados do produto e arquivos para envio.
    return axios.post('/produtos/atualizar', formData);  // Envia a requisição POST para atualizar o produto.
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao atualizar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Deleta um produto do sistema com base nos dados fornecidos.
   * 
   * @param {Object} data - Dados que identificam o produto a ser deletado (ex: id do produto).
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: Produto deletado com sucesso.
   * - Erro: Um erro ocorre ao tentar deletar o produto.
   * 
   * Exemplos de erros:
   * - Erro 400: Dados inválidos para identificação do produto.
   * - Erro 404: Produto não encontrado para deleção.
   * - Erro 500: Problema no servidor ao deletar o produto.
   */
  async deletarProduto(data) {
    try {
      return axios.post('/produtos/deleteProduto', data);  // Envia uma requisição POST para deletar o produto com base nos dados fornecidos.
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao deletar produtos:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Obtém a imagem de um produto específico.
   * 
   * @param {number} userIdCliente - ID do cliente associado ao produto.
   * @param {string} filename - Nome do arquivo da imagem do produto.
   * @returns {Promise} - Retorna uma Promise com a resposta da requisição.
   * 
   * Possíveis respostas esperadas:
   * - Sucesso: A imagem do produto será retornada.
   * - Erro: Um erro ocorre se a imagem não for encontrada ou se houver um problema no servidor.
   * 
   * Exemplos de erros:
   * - Erro 404: Imagem do produto não encontrada.
   * - Erro 500: Problema no servidor ao recuperar a imagem.
   */
  async obterImagem(userIdCliente, filename) {
    try {
      return axios.get(`/image/produto/${userIdCliente}/${filename}`);  // Envia uma requisição GET para obter a imagem do produto.
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao carregar imagem do produto:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },
};

export default produtoService;  // Exporta o serviço para ser utilizado em outros arquivos.
