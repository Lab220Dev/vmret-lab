import { format } from 'date-fns-tz';
import { parseISO, isValid, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore.js';
const store = useAuthStore();
/**
 * @deprecated Esta função será removida em versões futuras.
 * Use `gerarEbaixarCSV` em vez disso.
 * 
 * Gera um conteúdo CSV com base nos campos e nos dados fornecidos.
 * @param {string[]} fields - Os campos que serão usados como cabeçalho no CSV.
 * @param {Object[]} data - Os dados que serão convertidos em linhas do CSV.
 * @returns {string} - O conteúdo do CSV gerado.
 */
export const generateCSV = (fields, data) => {
  const header = fields.join(',');
  const rows = data.map((row) => fields.map((field) => row[field] || '').join(','));
  return [header, ...rows].join('\n');
};

/**
 * @deprecated Esta função será removida em versões futuras.
 * Use `gerarEbaixarCSV` em vez disso.
 * 
 * Baixa um arquivo CSV com o conteúdo fornecido.
 * @param {string} filename - O nome do arquivo CSV a ser baixado.
 * @param {string} csvContent - O conteúdo do CSV.
 */
export const downloadCSV = (filename, csvContent) => {
  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
/**
 * Gera e baixa um arquivo CSV.
 * @param {string} filename - Nome do arquivo para download.
 * @param {Object[]} data - Array de objetos que contém os dados.
 * @param {string[]} [fields] - Campos específicos para incluir no CSV (opcional).
 * @param {boolean} [warnIfEmpty] - Exibe um aviso no console se `data` estiver vazio (padrão: `false`).
 */
export function gerarEbaixarCSV(filename, data, fields, warnIfEmpty = false) {
  // Valida se há dados para exportar
  if (!data.length) {
      if (warnIfEmpty) {
        throw new Error(`Nenhum dado disponível para exportar para ${filename}.`);
      }
      return;
  }

  // Determina os campos para o cabeçalho, se fornecidos
  const selectedFields = fields || Object.keys(data[0]);

  // Gera o conteúdo do CSV
  const header = selectedFields.join(',');
  const rows = data.map(row =>
      selectedFields.map(field => row[field] || '').join(',')
  );
  const csvContent = [header, ...rows].join('\n');

  // Cria um Blob para o CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Configura o link para download
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
/**
 * Normaliza uma data ou data/hora para o formato `dd/MM/yyyy` ou `dd/MM/yyyy - HH:mm`.
 * @param {string} dateTimeString - A string da data ou data/hora a ser normalizada.
 * @param {boolean} includeTime - Se deve incluir a hora no formato.
 * @returns {string|null} - A data/hora normalizada ou `null` se inválida.
 */
export function normalizeDateTime(dateTimeString, includeTime = false) {
  if (!dateTimeString) return null;

  const timeZone = 'America/Sao_Paulo';
  try {
    const parsedDate = parseISO(dateTimeString) || parse(dateTimeString, 'dd/MM/yyyy', new Date());
    if (!isValid(parsedDate)) return null;

    const datePart = format(parsedDate, 'dd/MM/yyyy', { timeZone });
    if (includeTime) {
      const timePart = format(parsedDate, 'HH:mm', { timeZone });
      return `${datePart} - ${timePart}`;
    }
    return datePart;
  } catch {
    return null;
  }
}
/**
 * Gera e baixa um arquivo JSON.
 * @param {string} filename - O nome do arquivo JSON para download.
 * @param {Object|Object[]} data - Os dados que serão convertidos para JSON.
 * @throws {Error} - Lança um erro caso os dados sejam nulos ou indefinidos.
 */
export const gerarEbaixarJSON = (filename, data) => {
  if (!data) {
      throw new Error(`Nenhum dado disponível para exportar para ${filename}.`);
  }

  const jsonContent = JSON.stringify(data, null, 2); // Formata o JSON com identação
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Configura o link para download
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formata uma data em `dd/MM/yyyy`.
 * @param {Date|string} value - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return format(date, 'dd/MM/yyyy');
};

/**
 * Formats a Date object to a string in the format "DD/MM/YYYY".
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDateToString = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Converte um objeto de tempo em uma string ISO.
 * @param {Object} time - { hours, minutes, seconds }.
 * @param {Date} baseDate - Data base para aplicar o horário.
 * @returns {string} - A data/hora no formato ISO.
 */
export const formatarTempo = (time, baseDate = new Date()) => {
  baseDate.setHours(time.hours, time.minutes, time.seconds);
  return baseDate.toISOString();
};

/**
 * Converts a given date to ISO 8601 format.
 *
 * @param {Date|string} date - The date to be converted. Can be a Date object or a date string.
 * @returns {string|null} The ISO 8601 formatted date string, or null if the input date is falsy.
 */
export const toISODate = (date) => {
  return date ? new Date(date).toISOString() : null;
};
/**
 * Extrai um objeto de tempo `{ hours, minutes, seconds }` de uma string ISO.
 * @param {Object} tempoRef - A referência do objeto de tempo.
 * @param {string} isoString - A string ISO da data/hora.
 */
export const setTempo = (tempoRef, isoString) => {
  const date = new Date(isoString);
  tempoRef.value = {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
  };
};

/**
 * Fecha todos os dropdowns fornecidos.
 * @param {Array} dropdowns - Array de referências de dropdowns.
 */
export const closeAllDropdowns = (dropdowns) => {
  dropdowns.forEach((dropdown) => dropdown.value?.hide());
};

export const generateCustomVideoName = (dm, existingVideo) => {
  if (!existingVideo || existingVideo === 'N') {
    return `DM-${dm}-v1`;
  }
  const match = existingVideo.match(/-v(\d+)(\.mp4)?$/);
  const nextVersion = match ? parseInt(match[1], 10) + 1 : 1;
  return `DM-${dm}-v${nextVersion}`;
};

export const getFileExtension = (fileType) => {
  if (fileType === 'image/jpeg') return '.jpg';
  if (fileType === 'image/png') return '.png';
  return '';
};
/**
 * Enriquece qualquer objeto com dados adicionais.
 *
 * @param {Object} target - Objeto a ser enriquecido.
 * @returns {Object} - Objeto enriquecido.
 */
export const enrichData = (target) => {
  return {
    ...target,
    id_cliente: store.userIdCliente,
    id_usuario: store.userId,
  };
};
/**
 * Filtra uma lista de setores com base no centro de custo selecionado.
 * @param {Object} relatorio - Objeto contendo os filtros aplicados.
 * @param {Object} ListaSetor - Lista reativa de setores.
 * @param {Object} ListaSetorOriginal - Lista original de setores.
 */
export const filterSetoresByCDC  = (relatorio, ListaSetor, ListaSetorOriginal) => {
  if (relatorio.ID_CentroCusto) {
      ListaSetor.value = ListaSetorOriginal.value.filter(setorItem => 
          setorItem.id_centro_custo === relatorio.ID_CentroCusto || setorItem.value === null
      );
  } else {
      ListaSetor.value = ListaSetorOriginal.value;
  }
};

/**
* Filtra uma lista de funcionários com base nos filtros de setor e planta.
* @param {Object} relatorio - Objeto contendo os filtros aplicados.
* @param {Object} ListaFuncionarios - Lista de funcionários.
* @param {Object} ListaFuncionarioFiltrado - Lista de funcionarios filtrados.
*/
export const filterFuncionariosBySetorAndPlanta  = (relatorio, ListaFuncionarios, ListaFuncionarioFiltrado) => {
  // if (relatorio.id_setor || relatorio.id_planta) {
  //     ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter(funcionario => {
  //         const matchesSetor = relatorio.id_setor ? funcionario.id_setor === relatorio.id_setor : true;
  //         const matchesPlanta = relatorio.id_planta ? funcionario.id_planta === relatorio.id_planta : true;

  //         return matchesSetor && matchesPlanta;
  //     });
  // } else {
  //     ListaFuncionarios.value = ListaFuncionariosOriginal.value;
  // }
    const {id_setor, id_planta} = relatorio;
    if(!(id_setor || id_planta)) {
      ListaFuncionarioFiltrado.value = ListaFuncionarios.value;
    }
    ListaFuncionarioFiltrado.value = ListaFuncionarios.value.filter(funcionario => {
        const matchesSetor = id_setor ? funcionario.id_setor === id_setor : true;
        const matchesPlanta = id_planta ? funcionario.id_planta === id_planta : true;

        return matchesSetor && matchesPlanta;
    });
};