import { format } from 'date-fns-tz';  // Importa a função `format` da biblioteca `date-fns-tz`, usada para formatar datas considerando fuso horário.
import { parseISO, isValid, parse } from 'date-fns';  // Importa funções da biblioteca `date-fns` para parsing de datas e verificação de validade.

/**
 * Gera um conteúdo CSV com base nos campos e nos dados fornecidos.
 * Esta função converte um array de campos e um array de dados em um conteúdo CSV.
 * O conteúdo CSV é retornado como uma string formatada.
 * 
 * @param {string[]} fields - Os campos que serão usados como cabeçalho no CSV (ex.: ["Nome", "Email", "Data"]).
 * @param {Object[]} data - Os dados que serão convertidos em linhas do CSV. Cada objeto deve conter as propriedades definidas nos campos.
 * @returns {string} - O conteúdo do CSV gerado, pronto para ser baixado ou manipulado.
 */
export const generateCSV = (fields, data) => {
  // Junta os campos para criar o cabeçalho do CSV
  const header = fields.join(',');  // Exemplo: "Nome,Email,Data"
  
  // Mapeia os dados e os converte em linhas do CSV, associando os valores aos campos
  const rows = data.map((row) => fields.map((field) => row[field] || '').join(','));  // Se o campo não existir, insere uma string vazia
  
  // Junta o cabeçalho com as linhas e retorna o conteúdo completo do CSV
  return [header, ...rows].join('\n');  // Exemplo: "Nome,Email,Data\nJoão,j@dominio.com,01/01/2024"
};

/**
 * Baixa um arquivo CSV com o conteúdo fornecido.
 * Esta função cria um link de download temporário e simula um clique para iniciar o download.
 * 
 * @param {string} filename - O nome do arquivo CSV a ser baixado (ex.: 'dados.csv').
 * @param {string} csvContent - O conteúdo do CSV, que será baixado.
 */
export const downloadCSV = (filename, csvContent) => {
  // Cria um URI para o conteúdo CSV com a codificação apropriada
  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  
  // Cria um link de download temporário
  const link = document.createElement('a');  // Cria um elemento <a> (link)
  link.setAttribute('href', encodedUri);  // Define o atributo 'href' para o URI do conteúdo CSV
  link.setAttribute('download', filename);  // Define o nome do arquivo que será baixado
  
  // Adiciona o link à página (necessário para chamar a ação de clique)
  document.body.appendChild(link);
  
  // Simula o clique no link para iniciar o download
  link.click();
  
  // Remove o link da página após o clique
  document.body.removeChild(link);
};

/**
 * Normaliza uma data ou data/hora para o formato `dd/MM/yyyy` ou `dd/MM/yyyy - HH:mm`.
 * Esta função tenta parsear uma string de data/hora e retorna uma versão formatada. Caso a data seja inválida, retorna `null`.
 * 
 * @param {string} dateTimeString - A string da data ou data/hora a ser normalizada (ex.: "2024-01-01T12:00:00Z").
 * @param {boolean} includeTime - Se deve incluir a hora no formato final. Se `true`, o formato será `dd/MM/yyyy - HH:mm`.
 * @returns {string|null} - A data/hora normalizada ou `null` se inválida.
 */
export function normalizeDateTime(dateTimeString, includeTime = false) {
  // Se a string de data/hora for vazia ou nula, retorna null imediatamente
  if (!dateTimeString) return null;

  // Define o fuso horário a ser utilizado (São Paulo)
  const timeZone = 'America/Sao_Paulo';
  
  try {
    // Tenta parsear a data utilizando o formato ISO. Se falhar, tenta outro formato (dd/MM/yyyy)
    const parsedDate = parseISO(dateTimeString) || parse(dateTimeString, 'dd/MM/yyyy', new Date());

    // Se a data não for válida, retorna null
    if (!isValid(parsedDate)) return null;

    // Formata a data para o formato `dd/MM/yyyy`
    const datePart = format(parsedDate, 'dd/MM/yyyy', { timeZone });
    
    // Se `includeTime` for true, inclui a hora no formato `HH:mm`
    if (includeTime) {
      const timePart = format(parsedDate, 'HH:mm', { timeZone });
      return `${datePart} - ${timePart}`;  // Retorna a data e hora no formato `dd/MM/yyyy - HH:mm`
    }
    
    // Caso contrário, apenas retorna a data sem a hora
    return datePart;
  } catch {
    // Se qualquer erro ocorrer (como erro de parsing), retorna null
    return null;
  }
}

/**
 * Formata uma data em `dd/MM/yyyy`.
 * Esta função formata qualquer tipo de entrada de data (string, objeto Date) no formato `dd/MM/yyyy`.
 * 
 * @param {Date|string} value - A data a ser formatada. Pode ser uma instância de Date ou uma string representando uma data.
 * @returns {string} - A data formatada no formato `dd/MM/yyyy`. Se o valor for inválido, retorna uma string vazia.
 */
export const formatDate = (value) => {
  // Se o valor for nulo ou indefinido, retorna uma string vazia
  if (!value) return '';

  // Cria uma instância de Date com o valor fornecido
  const date = new Date(value);

  // Formata a data no formato `dd/MM/yyyy`
  return format(date, 'dd/MM/yyyy');
};

/**
 * Converte um objeto de tempo em uma string ISO.
 * A função pega um objeto com horas, minutos e segundos e retorna um valor de data/hora no formato ISO.
 * 
 * @param {Object} time - Um objeto contendo { hours, minutes, seconds }.
 * @param {Date} baseDate - Data base para aplicar o horário. Se não for fornecido, a data atual será usada.
 * @returns {string} - A data/hora no formato ISO (ex.: "2024-01-01T12:00:00.000Z").
 */
export const formatarTempo = (time, baseDate = new Date()) => {
  // Define a hora, minuto e segundo no objeto baseDate utilizando os valores fornecidos
  baseDate.setHours(time.hours, time.minutes, time.seconds);

  // Retorna a data/hora no formato ISO (ex.: "2024-01-01T12:00:00.000Z")
  return baseDate.toISOString();
};

/**
 * Extrai um objeto de tempo `{ hours, minutes, seconds }` de uma string ISO.
 * A função converte uma string de data/hora no formato ISO para um objeto que contém as horas, minutos e segundos.
 * 
 * @param {Object} tempoRef - A referência do objeto de tempo, que será preenchido com o valor extraído.
 * @param {string} isoString - A string ISO de data/hora (ex.: "2024-01-01T12:00:00.000Z").
 */
export const setTempo = (tempoRef, isoString) => {
  // Cria um objeto Date a partir da string ISO
  const date = new Date(isoString);

  // Preenche o objeto `tempoRef` com as horas, minutos e segundos da data ISO
  tempoRef.value = {
    hours: date.getUTCHours(),  // Obtém as horas em UTC
    minutes: date.getUTCMinutes(),  // Obtém os minutos em UTC
    seconds: date.getUTCSeconds(),  // Obtém os segundos em UTC
  };
};

/**
 * Fecha todos os dropdowns fornecidos.
 * Esta função percorre um array de dropdowns e fecha cada um deles, caso tenha um método `hide` definido.
 * 
 * @param {Array} dropdowns - Array de referências para os dropdowns. Cada item no array deve ser um objeto com um método `hide`.
 */
export const closeAllDropdowns = (dropdowns) => {
  // Para cada dropdown no array, tenta chamar o método `hide` para fechá-lo
  dropdowns.forEach((dropdown) => dropdown.value?.hide());
};
