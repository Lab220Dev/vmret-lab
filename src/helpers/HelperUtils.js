import { format } from 'date-fns-tz';
import { parseISO, isValid, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore.js';
const store = useAuthStore();
/**
 * @deprecated  Use `gerarEbaixarCSV` em vez disso.
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
 * @deprecated Use `gerarEbaixarCSV` em vez disso.
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
 * Formats a Date object to a string in the format "HH:MM".
 *
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted time string.
 */
export const formatTimeToString = (date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
};

/**
 * Formats a given date object into a string with date and time.
 *
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date and time string in the format "YYYY-MM-DD - HH:MM:SS".
 */
export const formatarDataHora = (date) => {
  const dataPart = formatDateToString(date);
  const horaPart = formatTimeToString(date);
  return `${dataPart} - ${horaPart}`;
}
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
 * @deprecated Use `filtroGenericoReltorio` em vez disso.
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
* @deprecated Use `filtroGenericoReltorio` em vez disso.
*/
export const filterFuncionariosBySetorAndPlanta  = (relatorio, ListaFuncionarios, ListaFuncionarioFiltrado) => {

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


/**
 * Filtra o relatório com base nos critérios fornecidos e atualiza as listas de funcionários e setores de acordo.
 *
 * @param {Object} relatorio - O objeto do relatório contendo os critérios de filtragem.
 * @param {Object} relatorio.value - O objeto contendo os critérios de filtragem.
 * @param {string} [relatorio.value.id_centro_custo] - O ID do centro de custo para filtrar.
 * @param {string} [relatorio.value.id_planta] - O ID da planta para filtrar.
 * @param {string} [relatorio.value.id_setor] - O ID do setor para filtrar.
 * @param {Object} listaFuncionariosOriginal - The original list of employees.
 * @param {Array} listaFuncionariosOriginal.value - O array de objetos originais de funcionários.
 * @param {Object} ListaFuncionarios - A lista de funcionários que será atualizada.
 * @param {Array} ListaFuncionarios.value - O array de objetos de funcionários que será atualizado.
 * @param {Object} ListaSetorOriginal - A lista original de setores.
 * @param {Array} ListaSetorOriginal.value - O array de objetos originais de setores.
 * @param {Object} ListaSetor - A lista de setores que será atualizada.
 * @param {Array} ListaSetor.value - O array de objetos de setores que será atualizado.
 */
export const filtroGenericoReltorio = (relatorio, listaFuncionariosOriginal,ListaFuncionarios, ListaSetorOriginal, ListaSetor) => {
  const semFiltro = (!relatorio.value.id_centro_custo || relatorio.value.id_centro_custo === '')
   && (!relatorio.value.id_planta || relatorio.value.id_planta === '')
    && (!relatorio.value.id_setor || relatorio.value.id_setor === '');
  if (semFiltro) {
      ListaFuncionarios.value = [...listaFuncionariosOriginal.value];
      ListaSetor.value = [...ListaSetorOriginal.value];
      return;
  }
  if (relatorio.value.id_centro_custo) {
      ListaSetor.value = ListaSetorOriginal.value.filter((setor) => setor.id_centro_custo === relatorio.value.id_centro_custo);
  } else {
      ListaSetor.value = [...ListaSetorOriginal.value];
  }
  ListaFuncionarios.value = listaFuncionariosOriginal.value.filter((funcionario) => {
      const cdcMatch = relatorio.value.id_centro_custo && funcionario.id_dentro_custo === relatorio.value.id_centro_custo;
      const plantaMatch = relatorio.value.id_planta && funcionario.id_planta === relatorio.value.id_planta;
      const setorMatch = relatorio.value.id_setor && funcionario.id_setor === relatorio.value.id_setor;

      return cdcMatch || plantaMatch || setorMatch;
  });
};