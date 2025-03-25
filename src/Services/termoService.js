import axios from '@/axios.js'; // Importa a instância do axios configurada a partir do caminho especificado

const postRequest = async (url, data) => { // Declara uma função assíncrona chamada postRequest que recebe uma URL e dados como parâmetros
    try { // Inicia um bloco try para capturar possíveis erros
        const response = await axios.post(url, data); // Faz uma requisição POST usando axios para a URL fornecida com os dados fornecidos e aguarda a resposta
        return response; // Retorna a resposta da requisição
    } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
        throw error; // Lança o erro capturado para ser tratado em outro lugar
    }
};

const termoService = { // Declara um objeto chamado termoService que contém vários métodos assíncronos
    async salvaTermo(data) { // Declara um método assíncrono chamado salvaTermo que recebe dados como parâmetro
        return postRequest('/termo/Salvar', data); // Chama a função postRequest com a URL '/termo/Salvar' e os dados fornecidos, retornando a resposta
    },
    async recuperaTermo(data) { // Declara um método assíncrono chamado recuperaTermo que recebe dados como parâmetro
        return postRequest('/termo/recuperar', data); // Chama a função postRequest com a URL '/termo/recuperar' e os dados fornecidos, retornando a resposta
    }
};

export default termoService; // Exporta o objeto termoService como padrão