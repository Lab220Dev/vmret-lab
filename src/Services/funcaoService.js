// Importa a instância configurada do Axios para realizar requisições HTTP.
import axios from '@/axios.js';

// Importa o store de autenticação, permitindo acessar dados do usuário autenticado.
import { useAuthStore } from '@/store/authStore';

// Instancia o store de autenticação para acessar os dados do usuário.
const store = useAuthStore();

// Objeto `funcaoService` que contém métodos para interagir com a API de funções.
const funcaoService = {
    /**
     * Método assíncrono para listar todas as funções do cliente.
     * @returns {Promise<Object>} Retorna os dados das funções.
     * @throws {Error} Lança um erro se houver falha na requisição.
     */
    async listarFuncoes() {
        // Prepara os dados para enviar na requisição, incluindo o id_cliente obtido do store.
        const data = { id_cliente: store.userIdCliente };

        try {
            // Realiza a requisição POST para listar as funções do cliente.
            const response = await axios.post('/funcao/listar', data);

            // Retorna os dados da resposta (lista de funções).
            return response.data;
        } catch (error) {
            // Caso ocorra um erro, loga a mensagem de erro no console.
            console.error('Erro ao listar funções:', error.message);

            // Lança o erro novamente, permitindo que o chamador lide com ele.
            throw error;
        }
    },
    async listarFuncoesPaginadas(data) {
        try {
            // Realiza a requisição POST para listar as funções do cliente.
            const response = await axios.post('/funcao/listarPaginado', data);

            // Retorna os dados da resposta (lista de funções).
            return response.data;
        } catch (error) {
            // Caso ocorra um erro, loga a mensagem de erro no console.
            console.error('Erro ao listar funções:', error.message);

            // Lança o erro novamente, permitindo que o chamador lide com ele.
            throw error;
        }
    },
    /**
     * Método assíncrono para adicionar uma nova função.
     * @param {Object} funcao - Dados da função a ser adicionada.
     * @returns {Promise<void>} Retorna uma Promise resolvida quando a função for adicionada.
     * @throws {Error} Lança um erro se houver falha na requisição.
     */
    async adicionarFuncao(funcao) {
        // Cria o objeto `data` incluindo o id do usuário e id do cliente do store, além dos dados passados pela função.
        const data = {
            id_usuario: store.userId, // Obtém o ID do usuário autenticado do store.
            id_cliente: store.userIdCliente, // Obtém o ID do cliente associado ao usuário.
            ...funcao // Espalha os dados adicionais da função (como nome, descrição, etc).
        };

        try {
            // Realiza a requisição POST para adicionar a função.
            await axios.post('/funcao/adicionar', data);
        } catch (error) {
            // Caso ocorra um erro, loga a mensagem de erro no console.
            console.error('Erro ao adicionar função:', error.message);

            // Lança o erro novamente, permitindo que o chamador lide com ele.
            throw error;
        }
    },

    /**
     * Método assíncrono para atualizar uma função existente.
     * @param {Object} funcao - Dados da função a ser atualizada.
     * @returns {Promise<void>} Retorna uma Promise resolvida quando a função for atualizada.
     * @throws {Error} Lança um erro se houver falha na requisição.
     */
    async atualizarFuncao(funcao) {
        try {
            // Realiza a requisição POST para atualizar a função.
            await axios.post('/funcao/atualizar', funcao);
        } catch (error) {
            // Caso ocorra um erro, loga a mensagem de erro no console.
            console.error('Erro ao atualizar função:', error.message);

            // Lança o erro novamente, permitindo que o chamador lide com ele.
            throw error;
        }
    },

    /**
     * Método assíncrono para deletar uma função específica.
     * @param {string} idFuncao - ID da função a ser deletada.
     * @returns {Promise<void>} Retorna uma Promise resolvida quando a função for deletada.
     * @throws {Error} Lança um erro se houver falha na requisição.
     */
    async deletarFuncao(idFuncao) {
        // Cria o objeto `data` incluindo o ID da função e o ID do usuário que está realizando a exclusão.
        const data = { id_funcao: idFuncao, id_usuario: store.userId };

        try {
            // Realiza a requisição POST para deletar a função.
            await axios.post('/funcao/deletar', data);
        } catch (error) {
            // Caso ocorra um erro, loga a mensagem de erro no console.
            console.error('Erro ao deletar função:', error.message);

            // Lança o erro novamente, permitindo que o chamador lide com ele.
            throw error;
        }
    }
};

// Exporta o objeto `funcaoService` para ser utilizado em outros arquivos ou componentes.
export default funcaoService;
