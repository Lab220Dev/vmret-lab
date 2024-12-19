import { useDataStore } from '@/store/dataStore';
import { isValid as validateCPF } from 'cpf-validator';


/**
 * Valida CPF usando a biblioteca cpf-validator.
 * @param {string} cpf - CPF a ser validado.
 * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
 */
export const isValidCPF = (cpf) => !!cpf && validateCPF(cpf);

/**
 * Valida email com regex.
 * @param {string} email - Email a ser validado.
 * @returns {boolean} Retorna `true` se o email for válido, caso contrário, `false`.
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Verifica se o valor é numérico.
 * @param {*} value - Valor a ser verificado.
 * @returns {boolean} Retorna `true` se o valor for numérico, caso contrário, `false`.
 */
const isNumeric = (value) => !isNaN(value) && isFinite(value);

/**
 * Verifica se o Centro de Custo existe no sistema.
 * Aceita tanto IDs quanto nomes para validação.
 *
 * @param {string|number} centroCusto - Nome ou ID do Centro de Custo a ser validado.
 * @returns {Promise<boolean>} Retorna uma promessa que resolve para `true` se o Centro de Custo existir, caso contrário, `false`.
 */
export const isCentroCustoExists = async (centroCusto) => {
    const dataStore = useDataStore();
    const cdcs = dataStore.cdcs || (await dataStore.fetchCdc());

    if (isNumeric(centroCusto)) {
        return cdcs.some(({ value }) => value === parseInt(centroCusto, 10));
    } else {
        return cdcs.some(({ label }) => label.toLowerCase() === centroCusto.toLowerCase());
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
    const dataStore = useDataStore();
    const setores = dataStore.setores || (await dataStore.fetchSetores());

    if (isNumeric(setor)) {
        return setores.some(({ value }) => value === parseInt(setor, 10));
    } else {
        return setores.some(({ label }) => label.toLowerCase() === setor.toLowerCase());
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
    const dataStore = useDataStore();
    const plantas = dataStore.plantas || (await dataStore.fetchPlantas());

    if (isNumeric(planta)) {
        return plantas.some(({ value }) => value === parseInt(planta, 10));
    } else {
        return plantas.some(({ label }) => label.toLowerCase() === planta.toLowerCase());
    }
};

export const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
  
    if (cnpj === '' || cnpj.length !== 14) return false;
  
    const cnpjsInvalidos = ['00000000000000', '11111111111111', '22222222222222', '33333333333333'];
  
    if (cnpjsInvalidos.includes(cnpj)) return false;
  
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0, pos = tamanho - 7;
  
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
  
    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
  
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
  };