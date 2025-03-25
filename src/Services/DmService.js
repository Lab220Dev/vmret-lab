import axios from '@/axios.js'; // Importa a instância do axios configurada a partir do caminho especificado

const postRequest = async (url, data) => { // Declara uma função assíncrona chamada postRequest que recebe uma URL e dados como parâmetros
    try { // Inicia um bloco try para capturar possíveis erros
        const response = await axios.post(url, data); // Faz uma requisição POST usando axios para a URL fornecida com os dados fornecidos e aguarda a resposta
        return response; // Retorna a resposta da requisição
    } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
        throw error; // Lança o erro capturado para ser tratado em outro lugar
    }
};

const dmService = { // Declara um objeto chamado dmService que contém vários métodos assíncronos
    async listarDMs(data) { // Declara um método assíncrono chamado listarDMs que recebe dados como parâmetro
        return postRequest('/DM/listar', data); // Chama a função postRequest com a URL '/DM/listar' e os dados fornecidos, retornando a resposta
    },
    async listarDMPaginado(data) {// Declara um método assíncrono chamado listarDMs que recebe dados como parâmetro
        return postRequest('/DM/listarPaginado', data);// Chama a função postRequest com a URL '/DM/listar' e os dados fornecidos, retornando a resposta
    },
    async listarDMId() {
        return postRequest('/DM/listaDmId');
    },
    async adicionarDM(data) {
        return postRequest('/DM/adicionar', data);
    },
    async deletarDM(data) {
        return postRequest('/DM/delete', data);
    },
    async atualizarDM(data) {
        return postRequest('/DM/atualizar', data);
    },
    async fetchItemDM(data) {
        return postRequest('/DM/listaritens', data);
    },
    async adicionarItem(data) {
        return postRequest('/DM/adicionarItensDM', data);
    },
    async deletarItem(data) {
        return postRequest('/DM/deleteItem', data);
    },
    async listarProduto(data) {
        return postRequest('/produtos/listar', data);
    },
    async listarClientes() {
        return postRequest('/admin/cliente/listar', {});
    },
    async atualizarProduto(data) {
        return postRequest('/DM/atualizarItens', data);
    },
    async infoEntrada(data) {
        return postRequest('/DM/recuperarInfo', data);
    },
    async atualizarInfo(data) {
        return postRequest('/DM/updateInfo', data);
    },
    async validarExternalData(data) {
        return postRequest('/DM/validar', data);
    },
};

export default dmService;
