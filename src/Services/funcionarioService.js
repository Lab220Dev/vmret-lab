import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.
import { useAuthStore } from '@/store/authStore.js'; // Importa o hook `useAuthStore` para acessar o estado da autenticação do usuário.
import { prepareFuncionarioData, prepareprodutoData } from '@/helpers/HelperFuncionario'; // Importa funções auxiliares para preparar os dados de funcionário e produto.

const funcionarioService = {
    /**
     * Realiza uma requisição para listar os funcionários.
     *
     * @param {Object} data - Dados a serem enviados para o servidor na requisição.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async listarFuncionarios(data) {
        return axios.post('/funcionarios/listar', data); // Envia uma requisição POST para listar funcionários.
    },
    async listarFuncionariosSimples(data) {
        return axios.post('/funcionarios/listaSimples', data); // Envia uma requisição POST para listar funcionários.
    },
    async listarFuncionariosPaginado(data) {
        return axios.post('/funcionarios/listaPaginado', data);
    },
    async adicionarFuncionario(funcionario, file) {
        const formData = prepareFuncionarioData(funcionario, file, false); // Prepara os dados do funcionário usando a função `prepareFuncionarioData`.
        return axios.post('/funcionarios/adicionar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Configura o cabeçalho para envio de formulário multipart com arquivo.
        });
    },

    /**
     * Atualiza os dados de um funcionário existente.
     *
     * @param {Object} funcionario - Dados do funcionário a ser atualizado.
     * @param {File} file - Arquivo de imagem atualizado do funcionário.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async atualizarFuncionario(funcionario, file) {
        const formData = prepareFuncionarioData(funcionario, file, true); // Prepara os dados do funcionário com a função `prepareFuncionarioData`.
        return axios.put('/funcionarios/atualizar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Define o tipo de conteúdo como 'multipart/form-data' para envio de arquivos.
        });
    },

    /**
     * Exclui um funcionário.
     *
     * @param {Object} data - Dados do funcionário a ser excluído.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async deleteFuncionario(data) {
        return axios.post('/funcionarios/deleteFuncionario', data); // Envia uma requisição POST para excluir o funcionário.
    },

    /**
     * Obtém a imagem do funcionário a partir do servidor.
     *
     * @param {string} userIdCliente - ID do cliente associado ao funcionário.
     * @param {string} filename - Nome do arquivo de imagem.
     * @returns {Promise} Retorna a Promise da requisição axios.
     * @throws {Error} Lança um erro se a requisição falhar.
     */
    async obterImagem(userIdCliente, filename) {
        try {
            return axios.get(`/image/funcionario/${userIdCliente}/${filename}`); // Envia uma requisição GET para obter a imagem do funcionário.
        } catch (error) {
            console.error('Erro ao carregar imagem do produto:', error.message); // Loga o erro caso ocorra.

            // Lança o erro novamente para que o chamador possa tratá-lo.
            throw error;
        }
    },

    /**
     * Adiciona um item de produto ao funcionário.
     *
     * @param {Object} funcionario - Dados do funcionário.
     * @param {Object} produto - Dados do produto a ser adicionado.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async SalvarProduto(funcionario, produto) {
        const data = prepareprodutoData(funcionario, produto); // Prepara os dados do produto para envio.
        return axios.post('/funcionarios/adicionarItem', data); // Envia uma requisição POST para adicionar o item.
    },

    /**
     * Exclui um item de produto associado ao funcionário.
     *
     * @param {Object} funcionario - Dados do funcionário.
     * @param {Object} produto - Dados do produto a ser excluído.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async deleteProduct(funcionario, produto) {
        const data = prepareprodutoData(funcionario, produto); // Prepara os dados do produto para exclusão.
        return axios.post('/funcionarios/deleteItem', data); // Envia uma requisição POST para excluir o item.
    },

    /**
     * Obtém os itens disponíveis para um determinado setor.
     *
     * @param {Object} data - Dados a serem enviados para o servidor.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async fetchItensSetor(data) {
        return axios.post('Setor/itensdisponiveissetor', data); // Envia uma requisição POST para obter os itens do setor.
    },
    async fetchdadosfuncionario(id_funcionario) {
        const response = await axios.post('funcionarios/fetchdados', {id_funcionario:id_funcionario});
        return response.data // Envia uma requisição POST para obter os itens do setor.
    },
    /**
     * Obtém as opções de hierarquia dos funcionários.
     *
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async fetchHieraquiaOptions() {
        const store = useAuthStore(); // Obtém o estado de autenticação através do hook `useAuthStore`.
        return axios.post('/funcao/listar', { id_cliente: store.userIdCliente }); // Envia uma requisição POST para obter as opções de hierarquia com o ID do cliente do estado.
    }
};

// Exporta o objeto `funcionarioService` para que possa ser utilizado em outros módulos.
export default funcionarioService;
