import { isValidEmail,isValidCPF } from '@/helpers/HelperValidacao';
import { generateCSV, downloadCSV } from '@/helpers/HelperUtils';
import Papa from 'papaparse';

/**
 * Valida uma linha de dados com base no tipo de importação.
 * @param {Object} row - Os dados da linha a serem validados.
 * @param {string} type - O tipo de importação ('funcionarios', 'produtos', 'centro_custo').
 * @returns {Object} - Um objeto contendo os erros encontrados na validação.
 */
export const validateRow = (row, type) => {
    const errors = {};
    if (type === 'funcionarios') {
        if (!row.Nome || row.Nome.trim() === '') errors.Nome = 'Nome é obrigatório';
        if (!isValidCPF(row.CPF)) errors.CPF = 'CPF inválido';
        if (!row.Email || !isValidEmail(row.Email)) errors.Email = 'Email inválido';
        if (!row.Matrícula || String(row.Matrícula).trim() === '') errors.Matrícula = 'Matrícula é obrigatória';
    }
    return errors;
};

/**
 * Formata os erros de validação de uma linha em uma string legível.
 * @param {Object} rowData - Os dados da linha, incluindo os erros.
 * @returns {string} - Uma string formatada com os erros encontrados.
 */
export const formatErrors = (rowData) => {
    return Object.entries(rowData.errors || {})
        .map(([key, message]) => `${key}: ${message}`)
        .join(', ');
};

/**
 * Obtém os rótulos dos campos com base no tipo de importação.
 * @param {string} importType - O tipo de importação ('funcionarios', 'produtos', 'centro_custo').
 * @returns {Object} - Um objeto contendo os rótulos dos campos.
 */
export const getFieldLabels = (importType) => {
    switch (importType) {
        case 'funcionarios':
            return {
                Nome: 'Nome Completo',
                CPF: 'CPF',
                Matrícula: 'Matrícula',
                Email: 'Email',
                Senha: 'Senha',
                data_admissao: 'Data de Admissão',
                RG: 'RG',
                CTPS: 'CTPS',
                Centro_Custo: 'Centro de Custo',
                Planta: 'Planta',
                Setor: 'Setor',
                Função: 'Função',
                Status: 'Status',
                hora_inicial: 'Hora de Início',
                hora_final: 'Hora Final'
            };
        case 'produtos':
            return {
                Nome: 'Nome do Produto',
                Código: 'Código do Produto',
                Preço: 'Preço',
                Estoque: 'Quantidade em Estoque'
            };
        case 'centro_custo':
            return {
                Código: 'Código',
                Descrição: 'Descrição',
                Categoria: 'Categoria'
            };
        default:
            return {};
    }
};
/**
 * Exporta os erros como um arquivo CSV.
 * @param {Array<string>} fields - Colunas do CSV.
 * @param {Array<Object>} invalidData - Dados inválidos.
 */
export function exportInvalidData(fields, invalidData) {
    if (!invalidData.length) {
        console.warn('Não há registros inválidos para exportar.');
        return;
    }
    const csvContent = generateCSV(fields, invalidData);
    downloadCSV('erros.csv', csvContent);
}
/**
 * Revalida os dados inválidos.
 * @param {Array<Object>} invalidData - Dados inválidos.
 * @param {Function} validateRow - Função de validação por linha.
 * @param {string} importType - Tipo de importação.
 * @returns {Object} Dados válidos e inválidos atualizados.
 */
export function revalidateData(invalidData, validateRow, importType) {
    const validData = [];
    const remainingInvalidData = [];

    invalidData.forEach((row) => {
        const errors = validateRow(row, importType);
        if (Object.keys(errors).length === 0) {
            validData.push(row);
        } else {
            row.errors = errors;
            remainingInvalidData.push(row);
        }
    });

    return { validData, remainingInvalidData };
}
/**
 * Reprocessa um arquivo CSV para corrigir dados inválidos.
 * @param {File} file - Arquivo corrigido.
 * @param {Function} onSuccess - Callback com os dados processados.
 * @param {Function} onError - Callback para erro.
 */
export function processFileReupload(file, onSuccess, onError) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results && results.meta && results.data.length > 0) {
                onSuccess(results.data);
            } else {
                onError('Erro ao processar o arquivo CSV.');
            }
        }
    });
}
/**
 * Processa o arquivo CSV e retorna os dados.
 * @param {File} file - Arquivo selecionado.
 * @param {Function} onSuccess - Callback para sucesso.
 * @param {Function} onError - Callback para erro.
 */
export function processFileUpload(file, onSuccess, onError) {
    Papa.parse(file, {
        header: true,
        complete: (results) => onSuccess(results.data),
        error: () => onError('Erro ao processar o arquivo.')
    });
}