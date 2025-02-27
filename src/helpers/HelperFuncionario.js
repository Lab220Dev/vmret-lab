import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import { isValidDocPessoaFisica, isValidEmail } from '@/helpers/HelperValidacao';
const store = useAuthStore();

/**
 * Prepara os dados do funcionário para envio ao backend.
 * @param {Object} funcionario - Dados do funcionário.
 * @param {File|null} selectedFile - Arquivo selecionado para upload (opcional).
 * @param {boolean} isUpdate - Define se é uma atualização (true) ou criação (false).
 * @returns {FormData} - Os dados preparados em um FormData.
 */
export const prepareFuncionarioData = (funcionario, selectedFile = null, isUpdate = false) => {
    const formData = new FormData();

    // Se um arquivo for selecionado, prepare para substituí-lo
    if (selectedFile.value) {
        const fileExtension = selectedFile.value.name.split('.').pop();
        const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExtension}`;
        formData.append('foto', nomeArquivo);
        formData.append('file', selectedFile.value);

        // Para atualização, sinalize que a foto antiga deve ser removida
        if (isUpdate) {
            formData.append('remove_old_photo', true);
        }
    } else if (isUpdate) {
        // Se não houver arquivo novo, mantenha a foto antiga
        formData.append('foto', funcionario.foto);
    }

    // Remova o campo `foto` da lógica de manipulação se um arquivo novo for enviado
    const { foto, itens, ...restOfFuncionario } = funcionario;

    // Processar os itens do funcionário
    const itensUnicos = Array.from(new Set(itens.map((item) => item.id_produto))).map((id_produto) => itens.find((item) => item.id_produto === id_produto));

    formData.append('itens', JSON.stringify(itensUnicos));

    // Adicionar os demais campos do funcionário
    Object.entries(restOfFuncionario).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (!isUpdate) {
        formData.append('id_cliente', store.userIdCliente);
      }
    formData.append('id_usuario', store.userId);

    return formData;
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
export const prepareprodutoData = (funcionario, produto) => {
    return {
        /**
         * ID do cliente associado ao produto. Obtido a partir da variável global `store.userIdCliente`.
         * @type {string}
         */
        id_cliente: store.userIdCliente,

        /**
         * ID do usuário (funcionário) responsável pela operação. Obtido a partir da variável global `store.userId`.
         * @type {string}
         */
        id_usuario: store.userId,

        /**
         * ID único do funcionário relacionado ao produto. Extraído do objeto `funcionario`.
         * @type {string}
         */
        id_funcionario: funcionario.id_funcionario,

        /**
         * ID único do produto. Extraído do objeto `produto.value`.
         * @type {string}
         */
        id_produto: produto.value.id_produto,

        /**
         * Quantidade do produto relacionada ao funcionário. Extraída do objeto `produto.value`.
         * @type {number}
         */
        quantidade: produto.value.quantidade
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
export const validateForm = (funcionario) => {
    /**
     * Objeto que armazena as mensagens de erro para os campos inválidos.
     * Inicialmente está vazio.
     * @type {Object}
     */
    const errors = {};

    /**
     * Verifica se o CPF fornecido é válido. Caso contrário, adiciona uma mensagem de erro.
     * @param {string} funcionario.CPF - CPF do funcionário a ser validado.
     * @returns {undefined} - Não retorna valor, mas altera o objeto `errors` se necessário.
     */
    if (!funcionario.CPF || !isValidDocPessoaFisica(funcionario.CPF)) {
        /**
         * Se o CPF for inválido, uma mensagem de erro é adicionada ao objeto `errors` com a chave 'CPF'.
         * @type {string}
         */
        errors.CPF = 'CPF inválido';
    }

    /**
     * Verifica se o e-mail fornecido é válido. Caso contrário, adiciona uma mensagem de erro.
     * @param {string} funcionario.email - E-mail do funcionário a ser validado.
     * @returns {undefined} - Não retorna valor, mas altera o objeto `errors` se necessário.
     */
    if (!funcionario.email || !isValidEmail(funcionario.email)) {
        /**
         * Se o e-mail for inválido, uma mensagem de erro é adicionada ao objeto `errors` com a chave 'email'.
         * @type {string}
         */
        errors.email = 'E-mail inválido';
    }

    /**
     * Retorna o resultado da validação:
     * - `isValid`: verdadeiro se não houver erros (tamanho do objeto `errors` é 0).
     * - `errors`: objeto contendo as mensagens de erro associadas aos campos inválidos.
     * @type {Object}
     * @returns {Object} - Objeto contendo a chave `isValid` e a chave `errors`.
     */
    return {
        /**
         * Verifica se o objeto `errors` está vazio. Se estiver vazio, significa que todos os campos são válidos.
         * @type {boolean}
         */
        isValid: Object.keys(errors).length === 0,

        /**
         * O objeto `errors` contém todas as mensagens de erro para os campos inválidos.
         * @type {Object}
         */
        errors
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
export const validadorcpf = (CPF) => {
    /**
     * Verifica se o CPF foi informado. Caso contrário, retorna a mensagem de erro.
     * @returns {string} - Mensagem de erro indicando que o CPF é obrigatório.
     */
    if (!CPF) {
        return 'O CPF é obrigatório';
    } 
    /**
     * Verifica se o CPF fornecido é válido. Se não for, retorna a mensagem de erro.
     * @returns {string} - Mensagem de erro indicando que o CPF é inválido.
     */
    else if (!isValidDocPessoaFisica(CPF)) {
        return 'CPF inválido';
    } 
    /**
     * Se o CPF for válido, retorna uma string vazia.
     * @returns {string} - String vazia indicando que o CPF é válido.
     */
    else {
        return '';
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
export const validadoremail = (email) => {
    /**
     * Verifica se o e-mail foi informado. Caso contrário, retorna a mensagem de erro.
     * @returns {string} - Mensagem de erro indicando que o e-mail é obrigatório.
     */
    if (!email) {
        return 'O e-mail é obrigatório';
    } 
    /**
     * Verifica se o e-mail fornecido é válido. Se não for, retorna a mensagem de erro.
     * @returns {string} - Mensagem de erro indicando que o e-mail é inválido.
     */
    else if (!isValidEmail(email)) {
        return 'E-mail inválido';
    } 
    /**
     * Se o e-mail for válido, retorna uma string vazia.
     * @returns {string} - String vazia indicando que o e-mail é válido.
     */
    else {
        return '';
    }
};