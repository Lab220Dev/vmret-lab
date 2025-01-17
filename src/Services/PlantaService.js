import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.

const plantaService = {
    /**
     * Realiza uma requisição para listar as plantas associadas a um cliente.
     *
     * @param {string} idCliente - ID do cliente cujas plantas precisam ser listadas.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async listarPlantas(idCliente) {
        const data = { id_cliente: idCliente }; // Prepara o objeto com o ID do cliente para enviar na requisição.
        return axios.post('/plantas/listar', data); // Envia uma requisição POST para listar as plantas do cliente.
    },

    /**
     * Adiciona uma nova planta ao sistema.
     *
     * @param {Object} planta - Objeto contendo os dados da planta a ser adicionada.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async adicionarPlanta(planta) {
        return axios.post('/plantas/adicionar', planta); // Envia uma requisição POST para adicionar a nova planta.
    },

    async listarPlantaSimples(data) {
        return axios.post('/plantas/listaSimples', data);
    },

    /**
     * Atualiza os dados de uma planta existente.
     *
     * @param {Object} planta - Objeto contendo os dados da planta a ser atualizada.
     * @returns {Promise} Retorna a Promise da requisição axios.
     */
    async atualizarPlanta(planta) {
        return axios.post('/plantas/atualizar', planta); // Envia uma requisição POST para atualizar os dados da planta.
    },

    /**
     * Deleta uma planta do sistema.
     *
     * @param {Object} data - Dados da planta a ser deletada.
     * @returns {Promise} Retorna a Promise da requisição axios.
     * @throws {Error} Lança um erro se a requisição falhar.
     */
    async deletarPlanta(data) {
        try {
            return axios.post('/plantas/deletePlanta', data); // Envia uma requisição POST para deletar a planta com os dados fornecidos.
        } catch (error) {
            console.error('Erro ao deletar plantas:', error.message); // Caso ocorra um erro, loga a mensagem de erro no console.

            // Lança o erro novamente para que o chamador possa tratá-lo adequadamente.
            throw error;
        }
    }
};

// Exporta o serviço `plantaService` para ser utilizado em outros módulos.
export default plantaService;
