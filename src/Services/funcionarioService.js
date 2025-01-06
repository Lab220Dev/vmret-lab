// Importa a instância configurada do Axios para realizar requisições HTTP.
import axios from '@/axios.js'; 

// Importa o store de autenticação, permitindo acessar os dados do usuário autenticado.
import { useAuthStore } from '@/store/authStore'; 

// Instancia o store de autenticação para acessar os dados do usuário.
const store = useAuthStore(); 

// Objeto `funcionarioService` que contém métodos para interagir com a API de funcionários.
const funcionarioService = {

  /**
   * Método assíncrono para listar todos os funcionários de um cliente.
   * @returns {Promise<Object>} Retorna os dados dos funcionários.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async listarFuncionarios() {
    // Prepara os dados para enviar na requisição, incluindo o id_cliente obtido do store.
    const data = { id_cliente: store.userIdCliente };

    try {
      // Realiza a requisição POST para listar os funcionários do cliente.
      const response = await axios.post('/funcionarios/listar', data);

      // Retorna os dados da resposta (lista de funcionários).
      return response.data; 
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao listar funcionários:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para adicionar um novo funcionário.
   * @param {Object} funcionario - Dados do funcionário a ser adicionado.
   * @param {File} file - Arquivo de foto do funcionário (opcional).
   * @returns {Promise<void>} Retorna uma Promise resolvida quando o funcionário for adicionado.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async adicionarFuncionario(funcionario, file) {
    // Cria uma instância de FormData para enviar os dados, incluindo arquivos.
    const formData = new FormData();

    // Se o arquivo foi fornecido, adiciona o arquivo e o nome da foto ao FormData.
    if (file) {
      // Gera um nome único para o arquivo com base no nome do funcionário e a data atual.
      const nomeArquivo = `funcionario_${funcionario.nome}_${Date.now()}`;
      formData.append('foto', nomeArquivo);  // Adiciona o nome da foto.
      formData.append('file', file);         // Adiciona o arquivo da foto.
    }

    // Adiciona os dados do funcionário ao FormData.
    Object.entries(funcionario).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Adiciona o id_cliente e id_usuario ao FormData.
    formData.append('id_cliente', store.userIdCliente);
    formData.append('id_usuario', store.userId);

    try {
      // Realiza a requisição POST para adicionar o funcionário com os dados e o arquivo (se presente).
      await axios.post('/funcionarios/adicionar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Especifica o tipo de conteúdo para upload de arquivos.
        },
      });
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao adicionar funcionário:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para atualizar um funcionário existente.
   * @param {Object} funcionario - Dados do funcionário a ser atualizado.
   * @param {File} file - Arquivo de foto do funcionário (opcional).
   * @returns {Promise<void>} Retorna uma Promise resolvida quando o funcionário for atualizado.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async atualizarFuncionario(funcionario, file) {
    // Cria uma instância de FormData para enviar os dados, incluindo arquivos.
    const formData = new FormData();

    // Se o arquivo foi fornecido, adiciona o arquivo e o nome da foto ao FormData.
    if (file) {
      // Gera um nome único para o arquivo com base no nome do funcionário e a data atual.
      const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
      formData.append('foto', nomeArquivo);  // Adiciona o nome da foto.
      formData.append('file', file);         // Adiciona o arquivo da foto.
      formData.append('remove_old_photo', true); // Marca para remover a foto antiga, caso haja.
    }

    // Adiciona os dados do funcionário ao FormData.
    Object.entries(funcionario).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Adiciona o id_usuario ao FormData.
    formData.append('id_usuario', store.userId);

    try {
      // Realiza a requisição PUT para atualizar o funcionário com os dados e o arquivo (se presente).
      await axios.put('/funcionarios/atualizar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Especifica o tipo de conteúdo para upload de arquivos.
        },
      });
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao atualizar funcionário:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para deletar um funcionário específico.
   * @param {string} idFuncionario - ID do funcionário a ser deletado.
   * @returns {Promise<void>} Retorna uma Promise resolvida quando o funcionário for deletado.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async deletarFuncionario(idFuncionario) {
    // Cria o objeto `data` com o ID do funcionário e o ID do usuário que está realizando a exclusão.
    const data = { id_funcionario: idFuncionario, id_usuario: store.userId };

    try {
      // Realiza a requisição POST para deletar o funcionário.
      await axios.post('/funcionarios/deleteFuncionario', data);
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao deletar funcionário:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para listar a hierarquia dos funcionários de um cliente.
   * @returns {Promise<Object>} Retorna os dados da hierarquia dos funcionários.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async listarHierarquia() {
    // Prepara os dados para enviar na requisição, incluindo o id_cliente obtido do store.
    const data = { id_cliente: store.userIdCliente };

    try {
      // Realiza a requisição POST para listar a hierarquia dos funcionários do cliente.
      const response = await axios.post('/funcionarios/listarhierarquia', data);

      // Retorna os dados da hierarquia.
      return response.data; 
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao listar hierarquia:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para buscar os itens disponíveis em um setor específico.
   * @param {string} idSetor - ID do setor para buscar os itens.
   * @returns {Promise<Object>} Retorna os itens do setor.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async fetchItensSetor(idSetor) {
    // Prepara os dados para enviar na requisição, incluindo o id_cliente e o id_setor.
    const data = { id_cliente: store.userIdCliente, id_setor: idSetor };

    try {
      // Realiza a requisição POST para buscar os itens disponíveis no setor.
      const response = await axios.post('/Setor/itensdisponiveissetor', data);

      // Retorna os itens do setor.
      return response.data; 
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao buscar itens do setor:', error.message);
      
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  },

  /**
   * Método assíncrono para deletar um produto atribuído a um funcionário.
   * @param {Object} data - Dados do produto a ser deletado.
   * @returns {Promise<Object>} Retorna a resposta da API.
   * @throws {Error} Lança um erro se houver falha na requisição.
   */
  async deletarProdutoFuncionario(data) {
    try {
      // Realiza a requisição POST para deletar o produto atribuído ao funcionário.
      const response = await axios.post('/funcionarios/deleteItem', data);

      // Retorna a resposta da API.
      return response.data; 
    } catch (error) {
      // Lança o erro novamente, permitindo que o chamador lide com ele.
      throw error; 
    }
  }

};

// Exporta o serviço `funcionarioService` para ser utilizado em outros arquivos ou componentes.
export default funcionarioService;
