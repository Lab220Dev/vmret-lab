import axios from '@/axios.js'; // Importa a instância configurada do Axios para realizar requisições HTTP.
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados para manipulação de cache ou dados persistentes.

const store = useAuthStore(); // Cria uma instância do store de autenticação.
const dataStore = useDataStore(); // Cria uma instância do store de dados.

const cdcService = { // Objeto que contém os métodos relacionados ao Centro de Custo (CDC).
    /**
     * Método para listar todos os centros de custo associados ao cliente.
     * @returns {Promise<Object>} A lista de centros de custo.
     * @throws {Error} Se ocorrer um erro na requisição HTTP.
     */
    async listarCentrosDeCusto() {
        // Cria um objeto de dados com o id_cliente extraído do store de autenticação.
        const data = { id_cliente: store.userIdCliente };

        try {
            // Realiza a requisição POST para listar os centros de custo.
            const response = await axios.post('/cdc/listar', data);
            return response.data; // Retorna os dados da resposta da requisição.
        } catch (error) {
            // Caso ocorra algum erro na requisição, exibe o erro no console.
            console.error('Erro ao listar centros de custo:', error);
            throw error; // Lança o erro para que a chamada possa tratá-lo posteriormente.
        }
    },
    async listarCentrosDeCustoPaginada(data) {

        try {
            // Realiza a requisição POST para listar os centros de custo.
            const response = await axios.post('/cdc/listarPaginada', data);
            return response.data; // Retorna os dados da resposta da requisição.
        } catch (error) {
            // Caso ocorra algum erro na requisição, exibe o erro no console.
            console.error('Erro ao listar centros de custo:', error);
            throw error; // Lança o erro para que a chamada possa tratá-lo posteriormente.
        }
    },
    /**
     * Método para adicionar um novo centro de custo.
     * @param {Object} cdc - O centro de custo a ser adicionado.
     * @returns {Promise<void>} Uma Promise indicando a conclusão da operação.
     * @throws {Error} Se ocorrer um erro na requisição HTTP.
     */
    async adicionarCentro(cdc) {
        // Cria um objeto de dados com o id_cliente, id_usuario e os dados do centro de custo.
        const data = {
            id_cliente: store.userIdCliente, // ID do cliente do usuário autenticado.
            id_usuario: store.userId, // ID do usuário autenticado.
            ...cdc // Espalha as propriedades do centro de custo no objeto.
        };

        try {
            if (!cdc.Codigo || cdc.Codigo === 0) {
                console.error('Código do centro de custo é inválido!');  
                throw new Error('Código do centro de custo é inválido!'); 
            }
            else {
                // Realiza a requisição POST para adicionar o centro de custo.
                await axios.post('/cdc/adicionar', data);
                dataStore.invalidateCDCCache(); // Invalida o cache de centros de custo no store de dados.
            }
        } catch (error) {
            // Caso ocorra algum erro na requisição, exibe o erro no console.
            console.error('Erro ao adicionar centro de custo:', error);
            throw error; // Lança o erro para que a chamada possa tratá-lo posteriormente.
        }
    },

    /**
     * Método para atualizar um centro de custo existente.
     * @param {Object} cdc - O centro de custo a ser atualizado.
     * @returns {Promise<void>} Uma Promise indicando a conclusão da operação.
     * @throws {Error} Se ocorrer um erro na requisição HTTP.
     */
    async atualizarCentro(cdc) {
        // Cria um objeto de dados com o id_cliente, id_usuario e os dados atualizados do centro de custo.
        const data = {
            id_cliente: store.userIdCliente, // ID do cliente do usuário autenticado.
            id_usuario: store.userId, // ID do usuário autenticado.
            ...cdc // Espalha as propriedades do centro de custo no objeto.
        };

        try {
            // Realiza a requisição POST para atualizar o centro de custo.
            await axios.post('/cdc/atualizar', data);
            dataStore.invalidateCDCCache(); // Invalida o cache de centros de custo no store de dados.
        } catch (error) {
            // Caso ocorra algum erro na requisição, exibe o erro no console.
            console.error('Erro ao atualizar centro de custo:', error);
            throw error; // Lança o erro para que a chamada possa tratá-lo posteriormente.
        }
    },

    /**
     * Método para deletar um centro de custo.
     * @param {Object} cdc - O centro de custo a ser deletado.
     * @returns {Promise<void>} Uma Promise indicando a conclusão da operação.
     * @throws {Error} Se ocorrer um erro na requisição HTTP.
     */
    async deletarCentro(cdc) {
        // Cria um objeto de dados com o id_cliente, id_usuario e o ID do centro de custo a ser deletado.
        const data = {
            id_cliente: store.userIdCliente, // ID do cliente do usuário autenticado.
            id_usuario: store.userId, // ID do usuário autenticado.
            ID_CentroCusto: cdc.ID_CentroCusto // ID do centro de custo a ser deletado.
        };

        try {
            // Realiza a requisição POST para deletar o centro de custo.
            await axios.post('/cdc/deleteCentro', data);
            dataStore.invalidateCDCCache(); // Invalida o cache de centros de custo no store de dados.
        } catch (error) {
            // Caso ocorra algum erro na requisição, exibe o erro no console.
            console.error('Erro ao deletar centro de custo:', error);
            throw error; // Lança o erro para que a chamada possa tratá-lo posteriormente.
        }
    }
};

// Exporta o objeto `cdcService` para ser usado em outros componentes ou arquivos.
export default cdcService;
