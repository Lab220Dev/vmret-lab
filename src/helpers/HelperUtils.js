import { format } from 'date-fns-tz';
import { parseISO, isValid, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore.js';
const store = useAuthStore();
/**
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