import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import { isValidDocPessoaFisica, isValidEmail } from '@/helpers/HelperValidacao';   // Importa funções de validação de CPF e e-mail.
const store = useAuthStore();   // Inicializa o store de autenticação para acessar informações do usuário autenticado.

/**
 * Prepara os dados do funcionário para envio ao backend.
 * @param {Object} funcionario - Dados do funcionário.
 * @param {File|null} selectedFile - Arquivo selecionado para upload (opcional).
 * @param {boolean} isUpdate - Define se é uma atualização (true) ou criação (false).
 * @returns {FormData} - Os dados preparados em um FormData.
 */
export const prepareFuncionarioData = (funcionario, selectedFile = null, isUpdate = false) => { // Função que prepara os dados do funcionário para envio ao backend.
    const formData = new FormData();    // Inicializa um objeto FormData para armazenar os dados do funcionário.

    if (selectedFile.value) {// Verifica se um arquivo foi selecionado.
        const fileExtension = selectedFile.value.name.split('.').pop(); // Obtém a extensão do arquivo.
        const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExtension}`;  // Define o nome do arquivo.
        formData.append('foto', nomeArquivo);   // Adiciona o nome do arquivo ao FormData.
        formData.append('file', selectedFile);  // Adiciona o arquivo ao FormData.

        if (isUpdate) { // Verifica se é uma atualização.
            formData.append('remove_old_photo', true);  // Adiciona a flag para remover a foto antiga.
        }
    } else if (isUpdate) {  // Se não houver arquivo novo, mantenha a foto antiga.
        formData.append('foto', funcionario.foto);
    }

    // Remova o campo `foto` da lógica de manipulação se um arquivo novo for enviado
    const { foto, itens, ...restOfFuncionario } = funcionario;

    // Processar os itens do funcionário
    const itensUnicos = Array.from(new Set(itens.map((item) => item.id_produto))).map((id_produto) => itens.find((item) => item.id_produto === id_produto));

    formData.append('itens', JSON.stringify(itensUnicos));

    // Adicionar os demais campos do funcionário
    Object.entries(restOfFuncionario).forEach(([key, value]) => {   // Itera sobre os campos do funcionário.
        formData.append(key, value);//
    });

    // Campos obrigatórios
    formData.append('id_cliente', store.userIdCliente); // Adiciona o ID do cliente ao FormData.
    formData.append('id_usuario', store.userId);    // Adiciona o ID do usuário ao FormData.

    return formData;    // Retorna o FormData com os dados do funcionário.
};

/**
 * Prepara os dados necessários para o envio de um produto relacionado a um funcionário.
 * 
 * @param {Object} funcionario - Objeto representando o funcionário.
 * @param {Object} funcionario.id_funcionario - ID único do funcionário.
 * @param {Object} produto - Objeto representando o produto.
 * @param {Object} produto.value - Objeto contendo os dados do produto.
 * @param {string} produto.value.id_produto - ID único do produto.
 * @param {number} produto.value.quantidade - Quantidade do produto.
 * @returns {Object} - Retorna um objeto contendo os dados preparados para o envio ou armazenamento.
 */
export const prepareprodutoData = (funcionario, produto) => {   // Função que prepara os dados do produto relacionado ao funcionário.
    return {
        id_cliente: store.userIdCliente,// Adiciona o ID do cliente ao objeto.
        id_usuario: store.userId,// Adiciona o ID do usuário ao objeto.
        id_funcionario: funcionario.id_funcionario,// Adiciona o ID do funcionário ao objeto.
        id_produto: produto.value.id_produto,// Adiciona o ID do produto ao objeto.
        quantidade: produto.value.quantidade    // Adiciona a quantidade do produto ao objeto.
    };
};

/**
 * Valida os dados de um formulário de funcionário, verificando CPF e e-mail.
 * 
 * @param {Object} funcionario - O objeto contendo os dados do funcionário a serem validados.
 * @param {string} funcionario.CPF - O CPF do funcionário a ser validado.
 * @param {string} funcionario.email - O e-mail do funcionário a ser validado.
 * @returns {Object} Retorna um objeto contendo o resultado da validação.
 * @returns {boolean} isValid - Indicador de validade, verdadeiro se não houver erros.
 * @returns {Object} errors - Objeto contendo as mensagens de erro para cada campo inválido.
 */
export const validateForm = (funcionario) => {  // Função que valida os dados de um formulário de funcionário.
    const errors = {};  // Inicializa um objeto vazio para armazenar as mensagens de erro.
    if (!funcionario.CPF || !isValidDocPessoaFisica(funcionario.CPF)) { // Verifica se o CPF foi fornecido e se é válido.
        errors.CPF = 'CPF inválido';    // Adiciona uma mensagem de erro ao objeto de erros.
    }
    if (!funcionario.email || !isValidEmail(funcionario.email)) {   // Verifica se o e-mail foi fornecido e se é válido.
        errors.email = 'E-mail inválido';   // Adiciona uma mensagem de erro ao objeto de erros.
    }
    return {    // Retorna um objeto contendo o resultado da validação.
        isValid: Object.keys(errors).length === 0,  // Indicador de validade, verdadeiro se não houver erros.
        errors  // Objeto contendo as mensagens de erro para cada campo inválido.
    };
};

/**
 * Valida o CPF informado.
 * 
 * A função verifica se o Documento foi fornecido e se é válido utilizando a função `isValidDocPessoaFisica`.
 * alteranando baseado no lingua fornecida pelo cliente no navegador, sendo o cpf pra br ou cuit para ar.
 * Se o CPF não for fornecido ou for inválido, retorna uma mensagem de erro.
 * Caso contrário, retorna uma string vazia indicando que o CPF está válido.
 * 
 * @param {string} CPF - O CPF a ser validado.
 * @returns {string} - Retorna uma mensagem de erro caso o CPF seja inválido ou obrigatório. Retorna uma string vazia se o CPF for válido.
 */
export const validadorcpf = (CPF) => {  // Função que valida o CPF informado.
    if (!CPF) { // Verifica se o CPF foi fornecido.
        return 'O CPF é obrigatório';   // Retorna uma mensagem de erro caso o CPF seja obrigatório.
    } 
    else if (!isValidDocPessoaFisica(CPF)) {    // Verifica se o CPF é válido.
        return 'CPF inválido';  // Retorna uma mensagem de erro caso o CPF seja inválido.
    } 
    else {  // Se o CPF for válido, retorne uma string vazia.
        return '';  // Retorna uma string vazia.
    }
};

/**
 * Valida o e-mail informado.
 * 
 * A função verifica se o e-mail foi fornecido e se é válido utilizando a função `isValidEmail`.
 * Se o e-mail não for fornecido ou for inválido, retorna uma mensagem de erro.
 * Caso contrário, retorna uma string vazia indicando que o e-mail está válido.
 * 
 * @param {string} email - O e-mail a ser validado.
 * @returns {string} - Retorna uma mensagem de erro caso o e-mail seja inválido ou obrigatório. Retorna uma string vazia se o e-mail for válido.
 */
export const validadoremail = (email) => {  // Função que valida o e-mail informado.
    if (!email) {   // Verifica se o e-mail foi fornecido.
        return 'O e-mail é obrigatório';    // Retorna uma mensagem de erro caso o e-mail seja obrigatório.
    } 
    else if (!isValidEmail(email)) {    // Verifica se o e-mail é válido.
        return 'E-mail inválido';   // Retorna uma mensagem de erro caso o e-mail seja inválido.
    } 
    else {  // Se o e-mail for válido, retorne uma string vazia.
        return '';  // Retorna uma string vazia.
    }
};