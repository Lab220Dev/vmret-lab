import axios from '@/axios.js'; // Importa a instância do axios configurada a partir do caminho especificado

const postRequest = async (url, data) => { // Declara uma função assíncrona chamada postRequest que recebe uma URL e dados como parâmetros
    try { // Inicia um bloco try para capturar possíveis erros
        const response = await axios.post(url, data); // Faz uma requisição POST usando axios para a URL fornecida com os dados fornecidos e aguarda a resposta
        return response; // Retorna a resposta da requisição
    } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
        throw error; // Lança o erro capturado para ser tratado em outro lugar
    }
};

const estoqueService = { // Declara um objeto chamado estoqueService que contém vários métodos assíncronos
    async listarEstoqueDM(data) { // Declara um método assíncrono chamado listarEstoqueDM que recebe dados como parâmetro
        return postRequest('/Estoque/listar', data); // Chama a função postRequest com a URL '/Estoque/listar' e os dados fornecidos, retornando a resposta
    },
    async relatorioEstoqueDM(data) { // Declara um método assíncrono chamado relatorioEstoqueDM que recebe dados como parâmetro
        return postRequest('/Estoque/relatorio', data); // Chama a função postRequest com a URL '/Estoque/relatorio' e os dados fornecidos, retornando a resposta
    }

};

export default estoqueService; // Exporta o objeto estoqueService como padrão