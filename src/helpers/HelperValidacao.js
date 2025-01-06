import { useDataStore } from '@/store/dataStore';  // Importa o hook `useDataStore` para acessar o armazenamento de dados.
import { isValid as validateCPF } from 'cpf-validator';  // Importa a função `isValid` da biblioteca `cpf-validator` e a renomeia como `validateCPF`.

/**
 * Valida CPF usando a biblioteca cpf-validator.
 * @param {string} cpf - CPF a ser validado.
 * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
 */
export const isValidCPF = (cpf) => !!cpf && validateCPF(cpf);  // Verifica se o CPF existe e se ele é válido usando a função `validateCPF`.

/**
 * Valida email com regex.
 * Utiliza uma expressão regular para verificar se o email possui o formato correto.
 * @param {string} email - Email a ser validado.
 * @returns {boolean} Retorna `true` se o email for válido, caso contrário, `false`.
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);  // Valida o email verificando se ele corresponde ao padrão comum de emails.

/**
 * Verifica se o valor é numérico.
 * A função verifica se o valor é um número finito (não infinito e não NaN).
 * @param {*} value - Valor a ser verificado.
 * @returns {boolean} Retorna `true` se o valor for numérico, caso contrário, `false`.
 */
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
 * Verifica se o Setor existe no sistema.
 * Aceita tanto IDs quanto nomes para validação.
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
 * Verifica se a Planta existe no sistema.
 * Aceita tanto IDs quanto nomes para validação.
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
 * Valida um CNPJ utilizando regras matemáticas.
 * A função remove caracteres não numéricos do CNPJ, valida seu tamanho e faz os cálculos para verificar a validade.
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
