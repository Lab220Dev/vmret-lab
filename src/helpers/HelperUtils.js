import { format ,formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
const store = useAuthStore();
/**
 * Gera uma string no formato CSV a partir dos campos e dados fornecidos.
 *
 * @param {Array<string>} fields - Um array de strings representando os nomes dos campos (colunas) do CSV.
 * @param {Array<Object>} data - Um array de objetos, onde cada objeto contém os dados de uma linha no CSV.
 * 
 * @returns {string} Uma string formatada no padrão CSV.
 */
export const generateCSV = (fields, data) => {

  const header = fields.join(',');


  const rows = data.map((row) =>
    fields.map((field) => row[field] || '').join(',')
  );

  return [header, ...rows].join('\n');
};

/**
 * Função que gera e faz o download de um arquivo CSV.
 *
 * @param {string} filename - O nome do arquivo CSV a ser baixado.
 * @param {string} csvContent - O conteúdo do CSV que será baixado.
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

  if (!data.length) {
    if (warnIfEmpty) {
      // Lança um erro caso a lista de dados esteja vazia e a flag de alerta esteja ativada
      throw new Error(`Nenhum dado disponível para exportar para ${filename}.`);
    }
    // Retorna se não houver dados e `warnIfEmpty` for falso
    return;
  }

  const selectedFields = fields || Object.keys(data[0]);


  const header = selectedFields.join(',');

  const rows = data.map(row =>
    selectedFields.map(field => row[field] || '').join(',')
  );

  const csvContent = [header, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  /**
   * Cria um link (elemento `<a>`) no DOM que será usado para simular o download do arquivo CSV.
   */
  const link = document.createElement('a');

  /**
   * Cria uma URL temporária para o Blob. Essa URL será associada ao link para iniciar o download.
   */
  const url = URL.createObjectURL(blob);

  /**
   * Configura o link para apontar para o conteúdo do CSV gerado.
   * O atributo `href` é definido como a URL do Blob.
   */
  link.setAttribute('href', url);

  /**
   * Configura o atributo `download` do link para definir o nome do arquivo a ser baixado.
   */
  link.setAttribute('download', filename);

  /**
   * Adiciona o link criado ao corpo do documento (DOM) para que o clique possa ser simulado.
   */
  document.body.appendChild(link);

  /**
   * Simula um clique no link, o que inicia o download do arquivo CSV.
   * O arquivo será baixado com o nome especificado no parâmetro `filename`.
   */
  link.click();

  /**
   * Remove o link do DOM após o clique. Isso limpa o ambiente DOM após o uso.
   */
  document.body.removeChild(link);
};

/**
 * Normaliza uma data ou data/hora para o formato `dd/MM/yyyy` ou `dd/MM/yyyy - HH:mm`.
 * @param {string} dateTimeString - A string da data ou data/hora a ser normalizada.
 * @param {boolean} includeTime - Se deve incluir a hora no formato.
 * @returns {string|null} - A data/hora normalizada ou `null` se inválida.
 */
export function normalizeDateTime(dateTimeString, includeTime = false) {
  
  /**
   * Retorna `null` se a string de data e hora não for fornecida (undefined, null ou string vazia).
   */
  if (!dateTimeString) return null;

  /**
   * Define o fuso horário como "America/Sao_Paulo" para todas as operações de formatação.
   * Esse fuso horário será utilizado para garantir que a data e hora sejam convertidas corretamente.
   * 
   * @type {string}
   */
  const timeZone = 'America/Sao_Paulo';
  
  try {
    /**
     * Tenta analisar a string de data usando a função `parseISO` para formatos ISO 8601.
     * Caso a análise falhe, tenta usar a função `parse` para interpretar a data no formato `dd/MM/yyyy`.
     * Se ambos os métodos falharem, o valor de `parsedDate` será `undefined` ou inválido.
     * 
     * @type {Date}
     */
    const parsedDate = parseISO(dateTimeString) || parse(dateTimeString, 'dd/MM/yyyy', new Date());

    /**
     * Verifica se a data analisada é válida usando a função `isValid` da biblioteca `date-fns`.
     * Se não for válida, retorna `null`.
     */
    if (!isValid(parsedDate)) return null;

    /**
     * Formata a parte da data da string no formato `dd/MM/yyyy`, com base no fuso horário de São Paulo.
     * Utiliza a função `format` para garantir que a data seja formatada de acordo com o padrão desejado.
     * 
     * @type {string}
     */
    const datePart = format(parsedDate, 'dd/MM/yyyy', { timeZone });

    /**
     * Se o parâmetro `includeTime` for verdadeiro, formata também a parte de hora da data.
     * A hora é formatada no padrão de 24 horas `HH:mm`.
     */
    if (includeTime) {
      /**
       * Formata a parte da hora da string no formato `HH:mm`, com base no fuso horário de São Paulo.
       * 
       * @type {string}
       */
      const timePart = format(parsedDate, 'HH:mm', { timeZone });
      
      /**
       * Retorna a data e a hora concatenadas no formato `dd/MM/yyyy - HH:mm`.
       */
      return `${datePart} - ${timePart}`;
    }

    /**
     * Se o parâmetro `includeTime` for falso ou não for fornecido, retorna apenas a data formatada.
     */
    return datePart;
  } catch {
    /**
     * Em caso de erro durante a execução, retorna `null`.
     * O bloco `catch` captura qualquer erro inesperado durante a análise ou formatação.
     */
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
  
  /**
   * Verifica se os dados foram fornecidos. Se `data` for nulo, indefinido ou vazio,
   * lança um erro informando que não há dados para exportar.
   */
  if (!data) {
    throw new Error(`Nenhum dado disponível para exportar para ${filename}.`);
  }

  /**
   * Converte os dados em uma string JSON formatada. A função `JSON.stringify`
   * transforma o objeto em uma string JSON e o segundo argumento `null, 2` é usado
   * para adicionar uma identação de 2 espaços para facilitar a leitura do arquivo gerado.
   * 
   * @type {string}
   */
  const jsonContent = JSON.stringify(data, null, 2);

  /**
   * Cria um Blob a partir da string JSON gerada. Um Blob é um objeto que representa 
   * dados binários imutáveis, que neste caso é o conteúdo JSON que será baixado.
   * O tipo MIME `application/json;charset=utf-8;` é especificado para indicar que o 
   * conteúdo é um arquivo JSON.
   * 
   * @type {Blob}
   */
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  /**
   * Cria um link (`<a>`) no DOM que será usado para iniciar o download do arquivo JSON.
   * 
   * @type {HTMLAnchorElement}
   */
  const link = document.createElement('a');

  /**
   * Cria uma URL temporária para o Blob, permitindo que ele seja acessado como se fosse um arquivo.
   * O método `URL.createObjectURL` gera um URL que aponta para o Blob.
   * 
   * @type {string}
   */
  const url = URL.createObjectURL(blob);

  /**
   * Configura o link para fazer o download do arquivo JSON.
   * O atributo `href` é definido com a URL do Blob.
   * O atributo `download` define o nome do arquivo que será baixado.
   */
  link.setAttribute('href', url);
  link.setAttribute('download', filename);

  /**
   * Adiciona o link criado ao corpo do documento (DOM). O link precisa estar no DOM para 
   * que o clique possa ser simulado e o download seja iniciado.
   */
  document.body.appendChild(link);

  /**
   * Simula um clique no link, o que aciona o download do arquivo JSON.
   * O clique é realizado programaticamente sem a interação direta do usuário.
   */
  link.click();

  /**
   * Remove o link do DOM após o clique. Isso limpa o DOM, já que o link não é mais necessário 
   * após o download ser iniciado.
   */
  document.body.removeChild(link);
};

/**
 * Formata uma data em `dd/MM/yyyy`.
 * @param {Date|string} value - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export const formatDate = (value) => {

  /**
   * Verifica se o valor fornecido é inválido ou está ausente.
   * Se `value` for falsy (null, undefined, ou string vazia), retorna uma string vazia.
   */
  if (!value) return '';

  /**
   * Converte o valor fornecido para um objeto `Date`. A função `new Date(value)` tenta criar uma data válida a partir do valor fornecido.
   * O valor pode ser uma string ou um número (timestamp), ou um objeto `Date` válido.
   * 
   * @type {Date}
   */
  const date = new Date(value);

  /**
   * Usa a função `format` (presumivelmente importada de uma biblioteca como `date-fns`) para formatar a data no formato `dd/MM/yyyy`.
   * O formato retornado será uma string com o dia, mês e ano no formato de dois dígitos (ex: 01/01/2025).
   * 
   * @returns {string} A data formatada.
   */
  return format(date, 'dd/MM/yyyy');
};

/**
 * Formata uma data no formato `dd/MM/yyyy`.
 * 
 * @param {Date} date - O objeto `Date` a ser formatado.
 * 
 * @returns {string} A data formatada como `dd/MM/yyyy`.
 */
export const formatDateToString = (date) => {
  const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const day = String(offsetDate.getDate()).padStart(2, '0');
  const month = String(offsetDate.getMonth() + 1).padStart(2, '0');
  const year = offsetDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export const getTimeFromString = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== 'string') {
    throw new Error("O parâmetro 'dateTimeString' é obrigatório e deve ser uma string.");
  }

  // Divide a string na parte de data e hora
  const [, time] = dateTimeString.replace('T', ' ').split(' ');

  // Retorna apenas horas e minutos (HH:mm)
  return time.split(':').slice(0, 2).join(':');
};
export const getDateFromString = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== 'string') {
    throw new Error("O parâmetro 'dateTimeString' é obrigatório e deve ser uma string.");
  }

  // Divide a string na parte de data e hora
  const [date] = dateTimeString.replace('T', ' ').split(' ');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Formata a hora de uma data no formato `HH:mm`.
 * 
 * @param {Date} date - O objeto `Date` contendo a hora a ser formatada.
 * 
 * @returns {string} A hora formatada como `HH:mm`.
 */
export const formatTimeToString = (date) => {
  const dataAserCorrigida = new Date(date);
  const isDev = import.meta.env.VITE_API_URL === 'http://localhost:3000/api';
  const offsetHours = isDev ? 3 : 5;
  const offsetMillis = offsetHours * 60 * 60 * 1000;
  const adjustedDate = new Date(dataAserCorrigida.getTime() - offsetMillis + dataAserCorrigida.getTimezoneOffset() * 60000);
  const hours = String(adjustedDate.getHours()).padStart(2, '0');
  const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
export const formatTimeToString2 = (date) => {
  const dataAserCorrigida = new Date(date);
  const isDev = import.meta.env.VITE_API_URL === 'http://localhost:3000/api';
  const offsetHours = isDev ? 3 : 8;
  const offsetMillis = offsetHours * 60 * 60 * 1000;
  const adjustedDate = new Date(dataAserCorrigida.getTime() - offsetMillis + dataAserCorrigida.getTimezoneOffset() * 60000);
  const hours = String(adjustedDate.getHours()).padStart(2, '0');
  const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
export const HoraRelatorio =(date)=>{
  const dataASerCorrigida = new Date(date);
  if (isNaN(dataASerCorrigida.getTime())) {
    throw new Error("A string ou valor fornecido não é uma data válida.");
  }
  const hours = String(dataASerCorrigida.getHours()).padStart(2, '0');
  const minutes = String(dataASerCorrigida.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
/**
 * Formata uma data e hora no formato `dd/MM/yyyy - HH:mm`.
 * 
 * @param {Date} date - O objeto `Date` contendo tanto a data quanto a hora.
 * 
 * @returns {string} A data e hora formatadas como `dd/MM/yyyy - HH:mm`.
 */
export const formatarDataHora = (date) => {
  /**
   * Chama a função `formatDateToString` para formatar a data.
   * A data formatada será no formato `dd/MM/yyyy`.
   * 
   * @type {string}
   */
  const dataPart = formatDateToString(date);

  /**
   * Chama a função `formatTimeToString` para formatar a hora.
   * A hora formatada será no formato `HH:mm`.
   * 
   * @type {string}
   */
  const horaPart = formatTimeToString(date);

  /**
   * Retorna a data e hora concatenadas no formato `dd/MM/yyyy - HH:mm`.
   * A interpolação de string é usada para juntar as partes da data e da hora.
   */
  return `${dataPart} - ${horaPart}`;
};

/**
 * Formata um objeto de tempo (`hours`, `minutes`, `seconds`) e o aplica a um objeto `Date` fornecido,
 * retornando a data resultante no formato ISO.
 * 
 * @param {Object} time - O objeto de tempo contendo as propriedades `hours`, `minutes`, e `seconds`.
 * @param {number} time.hours - A hora a ser configurada (0-23).
 * @param {number} time.minutes - O minuto a ser configurado (0-59).
 * @param {number} time.seconds - O segundo a ser configurado (0-59).
 * @param {Date} [baseDate=new Date()] - A data base sobre a qual o tempo será aplicado. Se não fornecida, usa a data atual.
 * 
 * @returns {string} A data base com o tempo configurado, no formato ISO.
 */
export const formatarTempo = (time, baseDate = new Date()) => {

  /**
   * Modifica a `baseDate` configurando as horas, minutos e segundos fornecidos.
   * A função `setHours()` define a hora, minuto e segundo da `baseDate`.
   * 
   * @param {number} time.hours - A hora a ser configurada.
   * @param {number} time.minutes - O minuto a ser configurado.
   * @param {number} time.seconds - O segundo a ser configurado.
   */
  baseDate.setHours(time.hours, time.minutes, time.seconds);

  /**
   * Retorna a `baseDate` modificada no formato ISO. A função `toISOString()` retorna a data no formato padrão ISO 8601.
   * 
   * @returns {string} A data no formato ISO.
   */
  return baseDate.toISOString();
};

/**
 * Converte uma data fornecida para uma string no formato ISO.
 * 
 * @param {string|Date} date - A data a ser convertida para o formato ISO. Pode ser uma string ou um objeto `Date`.
 * 
 * @returns {string|null} A data no formato ISO ou `null` se `date` for inválido ou não fornecido.
 */
export const toISODate = (date) => {
  
  /**
   * Verifica se `date` é válido. Se não for, retorna `null`.
   */
  return date ? new Date(date).toISOString() : null;
};

/**
 * Extrai um objeto de tempo `{ hours, minutes, seconds }` de uma string ISO e o atribui a uma referência de objeto.
 * 
 * @param {Object} tempoRef - A referência do objeto de tempo onde as propriedades `hours`, `minutes` e `seconds`
 *                             serão armazenadas.
 * @param {string} isoString - A string ISO da data/hora da qual o tempo será extraído.
 * 
 * @returns {void} Não retorna valor. O objeto `tempoRef` é atualizado com as propriedades extraídas da string ISO.
 */
export const setTempo = (tempoRef, isoString) => {

  /**
   * Cria um novo objeto `Date` a partir da string ISO fornecida.
   * A função `new Date(isoString)` cria uma data válida com base na string ISO.
   * 
   * @type {Date}
   */
  const date = new Date(isoString);

  /**
   * Atribui os valores de hora, minuto e segundo ao objeto `tempoRef` usando os métodos `getUTCHours()`, 
   * `getUTCMinutes()` e `getUTCSeconds()`, que retornam as horas, minutos e segundos em UTC.
   * 
   * @param {Object} tempoRef - O objeto onde os valores de tempo serão atribuídos.
   * @param {number} date.getUTCHours() - A hora extraída da data no formato UTC.
   * @param {number} date.getUTCMinutes() - Os minutos extraídos da data no formato UTC.
   * @param {number} date.getUTCSeconds() - Os segundos extraídos da data no formato UTC.
   */
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
/**
 * Fecha todos os dropdowns fornecidos.
 * 
 * @param {Array} dropdowns - Um array de objetos de dropdown.
 * @param {Object} dropdowns[].value - O valor associado ao dropdown. Espera-se que seja um objeto com o método `hide()`.
 * 
 * @returns {void} Esta função não retorna nada.
 */
export const closeAllDropdowns = (dropdowns) => {
  /**
   * Itera sobre cada dropdown no array `dropdowns` e chama o método `hide()` 
   * no valor do dropdown, caso o método esteja presente.
   * 
   * @param {Object} dropdown - Um objeto de dropdown.
   */
  dropdowns.forEach((dropdown) => dropdown.value?.hide());
};

/**
 * Gera um nome personalizado para um vídeo com base no número da DM e no vídeo existente.
 * Se o vídeo já existir, incrementa a versão no nome do arquivo.
 * 
 * @param {string} dm - O número da DM.
 * @param {string} existingVideo - O nome do vídeo existente ou `'N'` se não houver vídeo existente.
 * 
 * @returns {string} O nome gerado para o vídeo.
 */
export const generateCustomVideoName = (dm, existingVideo) => {
  /**
   * Verifica se não há vídeo existente ou se o nome do vídeo é `'N'`.
   * Se for o caso, retorna o nome do vídeo no formato `DM-<dm>-v1`.
   */
  if (!existingVideo || existingVideo === 'N') {
    return `DM-${dm}-v1`;
  }

  /**
   * Tenta fazer uma correspondência com a versão do vídeo existente.
   * A expressão regular `/-v(\d+)(\.mp4)?$/` busca por um sufixo que tenha a versão do vídeo no formato `-v<versão>`.
   * 
   * @type {Array|null}
   */
  const match = existingVideo.match(/-v(\d+)(\.mp4)?$/);

  /**
   * Se houver uma correspondência, a versão extraída é incrementada em 1.
   * Caso contrário, a versão começa em 1.
   * 
   * @type {number}
   */
  const nextVersion = match ? parseInt(match[1], 10) + 1 : 1;

  /**
   * Retorna o nome do vídeo com a nova versão, no formato `DM-<dm>-v<versão>`.
   */
  return `DM-${dm}-v${nextVersion}`;
};

/**
 * Retorna a extensão do arquivo com base no tipo de arquivo fornecido.
 * 
 * @param {string} fileType - O tipo MIME do arquivo, como 'image/jpeg' ou 'image/png'.
 * 
 * @returns {string} A extensão do arquivo correspondente ao tipo MIME fornecido, ou uma string vazia se não houver correspondência.
 */
export const getFileExtension = (fileType) => {
  /**
   * Verifica se o tipo de arquivo é 'image/jpeg' e retorna a extensão `.jpg`.
   */
  if (fileType === 'image/jpeg') return '.jpg';

  /**
   * Verifica se o tipo de arquivo é 'image/png' e retorna a extensão `.png`.
   */
  if (fileType === 'image/png') return '.png';

  /**
   * Se o tipo de arquivo não for 'image/jpeg' nem 'image/png', retorna uma string vazia.
   */
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
 * Filtra os setores com base no ID de Centro de Custo do relatório.
 * Se o relatório contiver um ID de Centro de Custo, a lista de setores será filtrada de acordo com esse ID.
 * Se o relatório não contiver um ID de Centro de Custo, a lista original de setores será mantida.
 *
 * @param {Object} relatorio - O objeto do relatório que contém informações sobre o Centro de Custo.
 * @param {Object} ListaSetor - O objeto que contém a lista de setores filtrados.
 * @param {Object} ListaSetorOriginal - O objeto que contém a lista original de setores antes de qualquer filtragem.
 * @param {Array} ListaSetor.value - A lista de setores filtrados que será atribuída com base no critério de filtro.
 * @param {Array} ListaSetorOriginal.value - A lista original de setores.
 * @param {number|null} relatorio.ID_CentroCusto - O ID do Centro de Custo no relatório. Se presente, será usado para filtrar os setores.
 */
export const filterSetoresByCDC = (relatorio, ListaSetor, ListaSetorOriginal) => {
 
  if (relatorio.ID_CentroCusto) {
    ListaSetor.value = ListaSetorOriginal.value.filter(setorItem => 
      setorItem.id_centro_custo === relatorio.ID_CentroCusto || setorItem.value === null
    );
  } else {
    ListaSetor.value = ListaSetorOriginal.value;
  }
};

/**
 * Filtra os funcionários com base no setor e na planta presentes no relatório.
 * Se o relatório contiver um ID de setor ou planta, a função filtra a lista de funcionários.
 * Caso contrário, a lista original de funcionários é mantida.
 *
 * @param {Object} relatorio - O objeto do relatório que contém os filtros de setor e planta.
 * @param {Object} ListaFuncionarios - O objeto contendo a lista original de funcionários.
 * @param {Object} ListaFuncionarioFiltrado - O objeto onde a lista filtrada de funcionários será armazenada.
 * @param {Array} ListaFuncionarios.value - A lista original de funcionários.
 * @param {Array} ListaFuncionarioFiltrado.value - A lista filtrada de funcionários.
 * @param {number|null} relatorio.id_setor - O ID do setor, usado para filtrar os funcionários (opcional).
 * @param {number|null} relatorio.id_planta - O ID da planta, usado para filtrar os funcionários (opcional).
 */
export const filterFuncionariosBySetorAndPlanta = (relatorio, ListaFuncionarios, ListaFuncionarioFiltrado) => {

  const {id_setor, id_planta} = relatorio;

  if (!(id_setor || id_planta)) {
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
export const filtroGenericoReltorio = (relatorio, listaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor) => {

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

export function isMobEnabled (){
  return store.Integracao;
}

export const prepareListData =(params)=>{
    let baseData = {
        id_usuario: store.userId || null,  
        id_cliente: store.userIdCliente || null 
    }
    return store.userRole === 'Administrador' ? { ...params} : { ...baseData , ...params}
}
