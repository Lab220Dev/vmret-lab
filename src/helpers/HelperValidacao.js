import { useDataStore } from '@/store/dataStore';  // Importa o hook `useDataStore` para acessar o armazenamento de dados.
import { isValid as validateCPF } from 'cpf-validator';  // Importa a função `isValid` da biblioteca `cpf-validator` e a renomeia como `validateCPF`.
import i18n from '@/i18n'; 
/**
 * Valida CPF usando a biblioteca cpf-validator.
 * @param {string} cpf - CPF a ser validado.
 * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
 */
export const isValidCPF = (cpf) => !!cpf && validateCPF(cpf);  // Verifica se o CPF existe e se ele é válido usando a função `validateCPF`.

export const isValidCUIT = (cuit) => {
    if (!cuit) return false;

    // Remover caracteres não numéricos
    cuit = cuit.replace(/\D/g, '');

    // Verificar se tem exatamente 11 dígitos
    if (cuit.length !== 11) return false;

    // Verificar se começa com identificadores válidos
    const prefixo = cuit.substring(0, 2);
    const prefixosValidos = ["20", "23", "24", "27", "30", "33", "34"];

    if (!prefixosValidos.includes(prefixo)) return false;

    // Chama a função de validação do CUIT
    return validarCUIT(cuit);
};


// Exporta a função isValidDocPessoaFisica, que valida um documento de pessoa física com base na língua selecionada.
export const isValidDocPessoaFisica = (doc) => {
    // Obtém a língua selecionada do objeto i18n.
    const linguaSelecionada = i18n.global.locale.value;

    // Se a língua selecionada for espanhol ('es'), valida o documento como CUIT.
    if(linguaSelecionada === 'es') {
        return isValidCUIT(doc);
    } else {
        // Caso contrário, valida o documento como CPF.
        return isValidCPF(doc);
    }
}
/**
 * Valida email com regex.
 * @param {string} email - Email a ser validado.
 * @returns {boolean} Retorna `true` se o email for válido, caso contrário, `false`.
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);  // Valida o email verificando se ele corresponde ao padrão comum de emails.

const isNumeric = (value) => !isNaN(value) && isFinite(value);  // Retorna `true` se o valor for um número finito, caso contrário, `false`.

/**
 * Verifica se o Centro de Custo existe no sistema.
 * Aceita tanto IDs quanto nomes para validação.
 * 
 * @param {string|number} centroCusto - Nome ou ID do Centro de Custo a ser validado.
 * @returns {Promise<boolean>} Retorna uma promessa que resolve para `true` se o Centro de Custo existir, caso contrário, `false`.
 */
export const isCentroCustoExists = async (centroCusto) => {
    const dataStore = useDataStore();  // Acessa o estado global de dados, obtendo uma instância do dataStore.
    const cdcs = dataStore.cdcs || (await dataStore.fetchCdc());  // Obtém os Centros de Custo armazenados, ou faz uma requisição para obtê-los, caso não estejam no dataStore.

    if (isNumeric(centroCusto)) {
        // Se o Centro de Custo for numérico (ID), verifica se o ID existe nos Centros de Custo
        return cdcs.some(({ value }) => value === parseInt(centroCusto, 10));  // Retorna `true` se algum CDC tiver o ID igual ao fornecido, caso contrário `false`.
    } else {
        // Caso contrário, verifica se o nome do Centro de Custo (label) existe nos Centros de Custo
        return cdcs.some(({ label }) => label.toLowerCase() === centroCusto.toLowerCase());  // Retorna `true` se o nome do CDC for igual ao fornecido (ignora maiúsculas/minúsculas), caso contrário `false`.
    }
};

/**
 * 
 * @param {string|number} setor - Nome ou ID do Setor a ser validado.
 * @returns {Promise<boolean>} Retorna uma promessa que resolve para `true` se o Setor existir, caso contrário, `false`.
 */
export const isSetorExists = async (setor) => {
    const dataStore = useDataStore();  // Acessa o estado global de dados, obtendo uma instância do dataStore.
    const setores = dataStore.setores || (await dataStore.fetchSetores());  // Obtém os Setores armazenados, ou faz uma requisição para obtê-los, caso não estejam no dataStore.

    if (isNumeric(setor)) {
        // Se o Setor for numérico (ID), verifica se o ID existe nos Setores
        return setores.some(({ value }) => value === parseInt(setor, 10));  // Retorna `true` se algum Setor tiver o ID igual ao fornecido, caso contrário `false`.
    } else {
        // Caso contrário, verifica se o nome do Setor (label) existe nos Setores
        return setores.some(({ label }) => label.toLowerCase() === setor.toLowerCase());  // Retorna `true` se o nome do Setor for igual ao fornecido (ignora maiúsculas/minúsculas), caso contrário `false`.
    }
};

/**
 * 
 * @param {string|number} planta - Nome ou ID da Planta a ser validada.
 * @returns {Promise<boolean>} Retorna uma promessa que resolve para `true` se a Planta existir, caso contrário, `false`.
 */
export const isPlantaExists = async (planta) => {
    const dataStore = useDataStore();  // Acessa o estado global de dados, obtendo uma instância do dataStore.
    const plantas = dataStore.plantas || (await dataStore.fetchPlantas());  // Obtém as Plantas armazenadas, ou faz uma requisição para obtê-las, caso não estejam no dataStore.

    if (isNumeric(planta)) {
        // Se a Planta for numérica (ID), verifica se o ID existe nas Plantas
        return plantas.some(({ value }) => value === parseInt(planta, 10));  // Retorna `true` se alguma Planta tiver o ID igual ao fornecido, caso contrário `false`.
    } else {
        // Caso contrário, verifica se o nome da Planta (label) existe nas Plantas
        return plantas.some(({ label }) => label.toLowerCase() === planta.toLowerCase());  // Retorna `true` se o nome da Planta for igual ao fornecido (ignora maiúsculas/minúsculas), caso contrário `false`.
    }
};

/**
 * 
 * @param {string} cnpj - O CNPJ a ser validado, pode incluir caracteres não numéricos como pontos, barras ou hífens.
 * @returns {boolean} Retorna `true` se o CNPJ for válido, caso contrário, `false`.
 */
export const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');  // Remove todos os caracteres não numéricos do CNPJ.

    if (cnpj === '' || cnpj.length !== 14) return false;  // Se o CNPJ estiver vazio ou não tiver exatamente 14 caracteres, retorna `false`.

    const cnpjsInvalidos = ['00000000000000', '11111111111111', '22222222222222', '33333333333333'];  // Lista de CNPJs inválidos conhecidos (sequências repetidas).

    if (cnpjsInvalidos.includes(cnpj)) return false;  // Se o CNPJ for uma das sequências inválidas, retorna `false`.

    let tamanho = cnpj.length - 2;  // Define o tamanho da parte do CNPJ que será usado para os cálculos dos dígitos verificadores.
    let numeros = cnpj.substring(0, tamanho);  // Obtém os primeiros 12 números do CNPJ.
    let digitos = cnpj.substring(tamanho);  // Obtém os dois últimos dígitos do CNPJ (dígitos verificadores).
    let soma = 0, pos = tamanho - 7;  // Inicializa as variáveis para os cálculos.

    // Calcula o primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;  // Multiplica cada número do CNPJ pelos respectivos pesos.
        if (pos < 2) pos = 9;  // Se o peso for menor que 2, reinicia para 9.
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);  // Calcula o primeiro dígito verificador.
    if (resultado != digitos.charAt(0)) return false;  // Se o primeiro dígito verificador não for válido, retorna `false`.

    tamanho++;  // Avança para o próximo cálculo, incluindo o primeiro dígito verificador.
    numeros = cnpj.substring(0, tamanho);  // Obtém os primeiros 13 números do CNPJ.
    soma = 0;  // Reinicia a soma para o segundo dígito verificador.
    pos = tamanho - 7;  // Reinicia a posição do peso.

    // Calcula o segundo dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;  // Multiplica cada número do CNPJ pelos respectivos pesos.
        if (pos < 2) pos = 9;  // Se o peso for menor que 2, reinicia para 9.
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);  // Calcula o segundo dígito verificador.
    return resultado == digitos.charAt(1);  // Retorna `true` se o segundo dígito verificador for válido, caso contrário `false`.
};

export const validarCUIT = (cuit) =>{
    cuit = cuit.replace(/\D/g, '');

    // Verificar se tem exatamente 11 dígitos
    if (cuit.length !== 11) return false;

    // Array de multiplicadores usados no cálculo do dígito verificador
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let sum = 0;

    // Calcular a soma ponderada
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cuit[i]) * weights[i];
    }

    // Calcular o dígito verificador
    let remainder = sum % 11;
    let calculatedDigit = remainder === 0 ? 0 : 11 - remainder;

    // Tratar casos especiais (se for 10, o CUIT é inválido)
    if (calculatedDigit === 10) return false;

    // Comparar com o dígito verificador real
    return calculatedDigit === parseInt(cuit[10]);
}

export const isValidDoc = (doc) => {
    // Obtém a língua selecionada do objeto i18n.
    const linguaSelecionada = i18n.global.locale.value;

    // Se a língua selecionada for espanhol ('es'), valida o documento como CUIT.
    if (linguaSelecionada === 'es') {
        return validarCUIT(doc);
    } else {
        // Caso contrário, valida o documento como CNPJ.
        validarCNPJ(doc);
    }
}
/**
 * Valida se o arquivo enviado é um vídeo válido do tipo .mp4 e não excede o tamanho máximo permitido.
 * 
 * @param {File} file - O arquivo que será validado.
 * @param {string} file.type - O tipo MIME do arquivo, utilizado para verificar se é um vídeo .mp4.
 * @param {number} file.size - O tamanho do arquivo em bytes, utilizado para verificar se está dentro do limite de 5MB.
 * 
 * @returns {Object} O resultado da validação contendo um campo `valid` e, em caso de erro, o campo `error` com a mensagem de erro.
 * @returns {boolean} valid - Indica se o arquivo é válido ou não.
 * @returns {string} [error] - A mensagem de erro, caso o arquivo não seja válido.
 */
export const isValidVideoFile = (file) => {
    // Verifica se o tipo MIME do arquivo não inclui 'mp4'.
    if (!file.type.includes('mp4')) {
        return { valid: false, error: 'Apenas arquivos .mp4 são permitidos.' };  // Retorna um objeto indicando que o arquivo não é válido e fornece uma mensagem de erro.
    }

    // Verifica se o tamanho do arquivo excede 50MB.
    if (file.size > 50 * 1024 * 1024) {
        return { valid: false, error: 'O tamanho do arquivo não pode exceder 5MB.' };  // Retorna um objeto indicando que o arquivo não é válido e fornece uma mensagem de erro.
    }

    // Se o arquivo for um vídeo .mp4 e não exceder o tamanho permitido, retorna um objeto indicando que o arquivo é válido.
    return { valid: true };
};