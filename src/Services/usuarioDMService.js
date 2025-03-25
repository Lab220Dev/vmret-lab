import axios from '@/axios.js'; // Importa a instância do axios configurada a partir do caminho especificado

const postRequest = async (url, data) => { // Declara uma função assíncrona chamada postRequest que recebe uma URL e dados como parâmetros
    try { // Inicia um bloco try para capturar possíveis erros
        const response = await axios.post(url, data); // Faz uma requisição POST usando axios para a URL fornecida com os dados fornecidos e aguarda a resposta
        return response; // Retorna a resposta da requisição
    } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
        throw error; // Lança o erro capturado para ser tratado em outro lugar
    }
};

const usuarioDMService = { // Declara um objeto chamado usuarioDMService que contém vários métodos assíncronos
    async listarUsuariosDM(data) { // Declara um método assíncrono chamado listarUsuariosDM que recebe dados como parâmetro
        return postRequest('/UDM/listar', data); // Chama a função postRequest com a URL '/UDM/listar' e os dados fornecidos, retornando a resposta
    },
    async listarUDMSimples(data) {
        return postRequest('/UDM/listaSimples', data);
    },
    async adicionarUsuarioDM(data) {
        return postRequest('/UDM/adicionar', data);
    },
    async deletarUsuarioDM(data) {
        return postRequest('/UDM/deletar', data);
    },
    async atualizarUsuarioDM(data) {
        return postRequest('/UDM/atualizar', data);
    },
    async listaSimplesClientes() {
        return postRequest('/admin/cliente/listaSimples');
    },
};

export default usuarioDMService; // Exporta o objeto usuarioDMService como padrão