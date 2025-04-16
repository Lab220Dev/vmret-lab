import { isValidEmail, isValidCPF, isSetorExists, isPlantaExists, isCentroCustoExists } from '@/helpers/HelperValidacao'; // Importa as funções para validação de CPF e Email.
import { generateCSV, downloadCSV } from '@/helpers/HelperUtils'; // Importa funções para gerar e baixar arquivos CSV.
import Papa from 'papaparse'; // Importa a biblioteca PapaParse para processar arquivos CSV.

/**
 * Valida uma linha de dados com base no tipo de importação.
 * A função valida os dados de uma linha, verificando se estão corretos para o tipo de importação (funcionários, produtos, centro de custo).
 * Para o tipo 'funcionarios', a função valida campos obrigatórios e formatos de CPF e Email.
 *
 * @param {Object} row - Os dados da linha a serem validados. Cada campo da linha é verificado individualmente.
 * @param {string} type - O tipo de importação ('funcionarios', 'produtos', 'centro_custo'). Define qual validação será aplicada.
 * @returns {Object} - Um objeto contendo os erros encontrados na validação. Se não houver erros, o objeto estará vazio.
 */
export const validateRow = async (row, type) => {
    const errors = {}; // Criação de um objeto para armazenar os erros encontrados.

    // Verifica se o tipo de importação é 'funcionarios'
    if (type === 'funcionarios') {
        // Verifica se o nome está vazio ou não fornecido
        if (!row.Nome || row.Nome.trim() === '') errors.Nome = 'Nome é obrigatório'; // Erro: "Nome é obrigatório"

        // Verifica se o CPF é válido, usando a função isValidCPF importada
        if (!isValidCPF(row.CPF)) errors.CPF = 'CPF inválido'; // Erro: "CPF inválido"

        // Verifica se o email está vazio ou não é válido, usando a função isValidEmail importada
        if (!row.Email || !isValidEmail(row.Email)) errors.Email = 'Email inválido'; // Erro: "Email inválido"

        // Verifica se a matrícula está vazia
        if (!row.Matrícula || String(row.Matrícula).trim() === '') errors.Matrícula = 'Matrícula é obrigatória'; // Erro: "Matrícula é obrigatória"

        if (!row.Senha || String(row.Senha.trim()) === '') errors.Senha = 'Senha é obrigatória'; // Erro: "Senha é obrigatória"

        // Valida o campo "Centro_Custo"
        if (!row.Centro_Custo) {
            errors.Centro_Custo = 'Centro de Custo não registrado ou Inválido'; // Mensagem de erro se o setor for inválido
        } else if (!(await isCentroCustoExists(row.Centro_Custo))) {
            errors.Centro_Custo = 'Centro de Custo não registrado ou Inválido'; // Mensagem de erro se o setor for inválido
        }

        // Valida o campo "Planta"
        if (!row.Planta) {
            errors.Planta = 'Planta não registrada ou Invalida'; // Mensagem de erro se a planta for inválida
        } else if (!(await isPlantaExists(row.Planta))) {
            errors.Planta = 'Planta não registrada ou Invalida'; // Mensagem de erro se a planta for inválida
        }

        // Valida o campo "Setor"
        if (!row.Setor) {
            errors.Setor = 'Setor não registrado ou Inválido'; // Mensagem de erro se o setor for inválido
        } else if (!(await isSetorExists(row.Setor))) {
            errors.Setor = 'Setor não registrado ou Inválido'; // Mensagem de erro se o setor for inválido
        }
    }

    return errors; // Retorna o objeto de erros. Se não houver erros, ele estará vazio.
};

/**
 * Formata os erros de validação de uma linha em uma string legível.
 * Converte o objeto de erros em uma string, onde cada erro é apresentado de forma clara.
 * Essa função é útil para apresentar ou exportar os erros de forma amigável.
 *
 * @param {Object} rowData - Os dados da linha, incluindo os erros encontrados na validação.
 * @returns {string} - Uma string formatada contendo todos os erros encontrados, separados por vírgula.
 */
export const formatErrors = (rowData) => {
    // Mapeia as entradas do objeto de erros e as formata em uma string legível
    const formattedErrors = Object.entries(rowData.errors || {}) // Itera sobre as entradas do objeto 'errors'.
        .map(([key, message]) => `${key}: ${message}`) // Para cada erro, formata "campo: mensagem de erro".
        .join(', '); // Junta todos os erros com uma vírgula, criando uma string com todos os erros.

    console.log('Formatted Errors:', formattedErrors); // Adiciona um console para exibir os erros formatados.
    return formattedErrors;
};


/**
 * Obtém os rótulos dos campos com base no tipo de importação.
 * Essa função retorna os rótulos dos campos para diferentes tipos de importação (funcionários, produtos, centro de custo).
 *
 * @param {string} importType - O tipo de importação ('funcionarios', 'produtos', 'centro_custo').
 * @returns {Object} - Um objeto contendo os rótulos dos campos para o tipo de importação específico.
 */
export const getFieldLabels = (importType) => {
    switch (importType) {
        // Rótulos para o tipo de importação 'funcionarios'
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
                Funcao: 'Função',
                Status: 'Status',
                hora_inicial: 'Hora de Início',
                hora_final: 'Hora Final'
            };

        // Rótulos para o tipo de importação 'produtos'
        case 'produtos':
            return {
                Nome: 'Nome do Produto',
                Codigo: 'Código do Produto',
                Descricao: 'Descrição',
                Especificacao: 'Especificação',
                tipo_produto: 'Quantidade em Estoque',
                id_planta: 'Quantidade em Estoque',
                unidade_medida: 'Unidade de Medida',
                validade: 'Validade',
                quantidade_minima: 'Quantidade Mínima',
                url_foto_principal: 'URL da Foto Principal',
                url_foto_secundaria: 'URL da Foto Secundária',
                url_info_adicional: 'URL de Informações Adicionais'
            };
        case 'centro_custo':
            return {
                Codigo: 'Código',
                Nome: 'Nome do Centro de Custo'
            };
        case 'planta':
            return {
                Codigo: 'Código',
                Nome: 'Nome da Planta'
            };
        case 'setor':
            return {
                Codigo: 'Código',
                Nome: 'Nome do Setor',
                Codigo_Centro_Custo: 'Id do Centro de Custo'
            };

        case 'funcao':
            return {
                Codigo: 'Código',
                Nome: 'Nome da Função',
                Codigo_Centro_Custo: 'Id do Centro de Custo'
            };
        // Caso o tipo de importação não seja reconhecido, retorna um objeto vazio
        default:
            return {};
    }
};

/**
 * Exporta os erros encontrados durante a validação como um arquivo CSV.
 * A função permite que os erros sejam exportados para análise em um formato de planilha (CSV).
 *
 * @param {Array<string>} fields - As colunas do CSV (nomes dos campos) que serão exportadas.
 * @param {Array<Object>} invalidData - Dados inválidos a serem exportados (contêm os registros com erros).
 */
export function exportInvalidData(fields, invalidData) {
    // Verifica se existem dados inválidos para exportar
    if (!invalidData.length) {
        console.warn('Não há registros inválidos para exportar.'); // Exibe um aviso no console se não houver dados inválidos
        return;
    }

    // Gera o conteúdo do CSV utilizando a função generateCSV
    const csvContent = generateCSV(fields, invalidData);

    // Baixa o arquivo CSV com o nome 'erros.csv'
    downloadCSV('erros.csv', csvContent);
}

/**
 * Revalida os dados inválidos.
 * A função permite revalidar os dados que foram identificados como inválidos anteriormente.
 * Se o erro foi corrigido, os dados são movidos para a lista de dados válidos. Caso contrário, permanecem inválidos.
 *
 * @param {Array<Object>} invalidData - Dados inválidos a serem revalidados.
 * @param {Function} validateRow - Função de validação que será aplicada a cada linha de dados.
 * @param {string} importType - Tipo de importação, usado para validar corretamente os dados.
 * @returns {Object} - Um objeto contendo os dados válidos e inválidos após a revalidação.
 */
export function revalidateData(invalidData, validateRow, importType) {
    const validData = []; // Criação de um array para armazenar os dados válidos após a revalidação.
    const remainingInvalidData = []; // Criação de um array para armazenar os dados que ainda são inválidos.

    // Itera sobre os dados inválidos e realiza a revalidação de cada linha
    invalidData.forEach((row) => {
        // Valida os dados da linha usando a função de validação
        const errors = validateRow(row, importType);

        // Se a linha não tiver erros (ou seja, os dados estão válidos)
        if (Object.keys(errors).length === 0) {
            validData.push(row); // Adiciona à lista de dados válidos
        } else {
            // Caso contrário, adiciona o objeto de erros à linha e mantém nos dados inválidos
            row.errors = errors; // Adiciona o objeto de erros à linha
            remainingInvalidData.push(row); // Adiciona à lista de dados inválidos
        }
    });

    return { validData, remainingInvalidData }; // Retorna os dados válidos e inválidos após a revalidação
}

/**
 * Reprocessa um arquivo CSV para corrigir dados inválidos.
 * Essa função é usada para permitir o reenvio de arquivos corrigidos, que contêm dados que foram previamente identificados como inválidos.
 *
 * @param {File} file - O arquivo CSV corrigido que será reprocessado.
 * @param {Function} onSuccess - Callback que será chamado com os dados processados, caso o arquivo seja processado com sucesso.
 * @param {Function} onError - Callback que será chamado caso ocorra um erro ao processar o arquivo.
 */
export function processFileReupload(file, onSuccess, onError) {
    Papa.parse(file, {
        header: true, // Indica que o arquivo possui um cabeçalho, que será utilizado para mapear os campos
        dynamicTyping: true, // Tenta converter automaticamente os tipos dos dados (ex: transforma números em números, booleans em booleanos)
        skipEmptyLines: true, // Ignora linhas vazias durante o processamento
        complete: (results) => {
            // Se o arquivo for processado com sucesso e contiver dados
            if (results && results.meta && results.data.length > 0) {
                onSuccess(results.data); // Chama a função de sucesso, passando os dados processados
            } else {
                // Caso não haja dados válidos no arquivo
                onError('Erro ao processar o arquivo CSV.'); // Exibe uma mensagem de erro
            }
        }
    });
}

/**
 * Processa um arquivo CSV e retorna os dados.
 * Essa função lê o arquivo CSV e, se o processamento for bem-sucedido, chama a função de sucesso com os dados extraídos.
 * Caso ocorra um erro, chama a função de erro.
 *
 * @param {File} file - O arquivo CSV que será processado.
 * @param {Function} onSuccess - Função de callback a ser chamada quando o arquivo for processado com sucesso.
 * @param {Function} onError - Função de callback a ser chamada em caso de erro.
 */
export function processFileUpload(file, onSuccess, onError) {
    Papa.parse(file, {
        header: true, // Especifica que o arquivo CSV contém um cabeçalho, que será usado para mapear os campos
        complete: (results) => onSuccess(results.data), // Chama a função de sucesso passando os dados processados
        error: () => onError('Erro ao processar o arquivo.') // Chama a função de erro caso ocorra algum problema durante o processamento
    });
}
// HelperImportacao.js

/**
 * Função para resetar todos os estados relacionados ao upload/importação,
 * retornando a aplicação ao estado inicial (primeiro passo).
 *
 * @param {Object} states - Objeto contendo os estados reativos a serem resetados.
 * @param {import('vue').Ref<number>} states.active - Estado da etapa ativa do Stepper.
 * @param {import('vue').Ref<string|null>} states.selectedImportType - Tipo de importação selecionado.
 * @param {import('vue').Ref<boolean>} states.fileUploaded - Indicador se o arquivo foi carregado.
 * @param {import('vue').Ref<Array>} states.fileData - Dados do arquivo carregado.
 * @param {import('vue').Ref<Array>} states.dadosValidos - Dados válidos após a validação.
 * @param {import('vue').Ref<Array>} states.dadosInvalidos - Dados inválidos após a validação.
 * @param {import('vue').Ref<string|null>} states.uploadError - Mensagem de erro no upload.
 * @param {import('vue').ShallowRef<any>} states.componenteAtual - Componente carregado dinamicamente.
 * @param {import('vue').Ref<boolean>} states.validacaoConcluida - Indicador se a validação foi concluída.
 * @param {import('vue').Ref<boolean>} states.isEditingEnabled - Indicador se a edição está habilitada.
 * @param {import('vue').Ref<Object>} states.fieldLabels - Rótulos dos campos.
 */
export const resetImportacao = ({
    active,
    selectedImportType,
    fileUploaded,
    fileData,
    dadosValidos,
    dadosInvalidos,
    uploadError,
    componenteAtual,
    validacaoConcluida,
    isEditingEnabled,
    fieldLabels,
  }) => {
    active.value = 0;
    selectedImportType.value = null;
    fileUploaded.value = false;
    fileData.value = [];
    dadosValidos.value = [];
    dadosInvalidos.value = [];
    uploadError.value = null;
    componenteAtual.value = null;
    validacaoConcluida.value = false;
    isEditingEnabled.value = false;
    fieldLabels.value = {};
  };
  
  