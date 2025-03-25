import axios from '@/axios.js'; // Importa a instância do axios configurada a partir do caminho especificado

const postRequest = async (url, data) => { // Declara uma função assíncrona chamada postRequest que recebe uma URL e dados como parâmetros
    try { // Inicia um bloco try para capturar possíveis erros
        const response = await axios.post(url, data); // Faz uma requisição POST usando axios para a URL fornecida com os dados fornecidos e aguarda a resposta
        return response; // Retorna a resposta da requisição
    } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
        throw error; // Lança o erro capturado para ser tratado em outro lugar
    }
};

const usuarioService = { // Declara um objeto chamado usuarioService que contém vários métodos assíncronos
    async listarUsuarios(data) { // Declara um método assíncrono chamado listarUsuarios que recebe dados como parâmetro
        return postRequest('/usuarios/listar', data); // Chama a função postRequest com a URL '/usuarios/listar' e os dados fornecidos, retornando a resposta
    },
    async listarUsuariosPaginado(data) { // Declara um método assíncrono chamado listarUsuariosPaginado que recebe dados como parâmetro
        return postRequest('/usuarios/listarPaginado', data); // Chama a função postRequest com a URL '/usuarios/listarPaginado' e os dados fornecidos, retornando a resposta
    },
    async adicionarUsuario(data) { // Declara um método assíncrono chamado adicionarUsuario que recebe dados como parâmetro
        return postRequest('/usuarios/adicionar', data); // Chama a função postRequest com a URL '/usuarios/adicionar' e os dados fornecidos, retornando a resposta
    },
    async deletarUsuario(data) { // Declara um método assíncrono chamado deletarUsuario que recebe dados como parâmetro
        return postRequest('/usuarios/deletar', data); // Chama a função postRequest com a URL '/usuarios/deletar' e os dados fornecidos, retornando a resposta
    },
    async atualizarUsuario(data) { // Declara um método assíncrono chamado atualizarUsuario que recebe dados como parâmetro
        return postRequest('/usuarios/atualizar', data); // Chama a função postRequest com a URL '/usuarios/atualizar' e os dados fornecidos, retornando a resposta
    },
    async listarClientes() { // Declara um método assíncrono chamado listarClientes
        return postRequest('/admin/cliente/listar', {}); // Chama a função postRequest com a URL '/admin/cliente/listar' e um objeto vazio, retornando a resposta
    }

};

export default usuarioService; // Exporta o objeto usuarioService como padrão