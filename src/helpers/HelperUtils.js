import { format, formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import { DateTime } from 'luxon';
/**
 * Gera uma string no formato CSV a partir dos campos e dados fornecidos.
 *
 * @param {Array<string>} fields - Um array de strings representando os nomes dos campos (colunas) do CSV.
 * @param {Array<Object>} data - Um array de objetos, onde cada objeto contém os dados de uma linha no CSV.
 *
 * @returns {string} Uma string formatada no padrão CSV.
 */
export const generateCSV = (fields, data) => {  // Função que gera uma string CSV a partir dos campos e dados fornecidos.
  const header = fields.join(',');  // Cria o cabeçalho do CSV com base nos campos fornecidos.
  const rows = data.map((row) =>  // Mapeia os dados fornecidos para criar as linhas do CSV.
    fields.map((field) => row[field] || '').join(',') // Mapeia os campos de cada linha e os concatena com vírgulas.
  );

  return [header, ...rows].join('\n');  // Retorna o CSV completo, com o cabeçalho e as linhas separadas por quebras de linha.
};

/**
 * Função que gera e faz o download de um arquivo CSV.
 *
 * @param {string} filename - O nome do arquivo CSV a ser baixado.
 * @param {string} csvContent - O conteúdo do CSV que será baixado.
 */
export const downloadCSV = (filename, csvContent) => {  // Função que gera e faz o download de um arquivo CSV.
  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`; // Codifica o conteúdo do CSV em uma URI.
  const link = document.createElement('a'); // Cria um elemento <a> para simular o download do arquivo.
  link.setAttribute('href', encodedUri);  // Define o atributo `href` do link com a URI codificada.
  link.setAttribute('download', filename);  // Define o atributo `download` do link com o nome do arquivo.

  document.body.appendChild(link);  // Adiciona o link ao corpo do documento.

  link.click();   // Simula um clique no link para iniciar o download do arquivo.

  document.body.removeChild(link);  // Remove o link do corpo do documento após o download.
};

/**
 * Gera e baixa um arquivo CSV.
 * @param {string} filename - Nome do arquivo para download.
 * @param {Object[]} data - Array de objetos que contém os dados.
 * @param {string[]} [fields] - Campos específicos para incluir no CSV (opcional).
 * @param {boolean} [warnIfEmpty] - Exibe um aviso no console se `data` estiver vazio (padrão: `false`).
 */
export function gerarEbaixarCSV(filename, data, fields, warnIfEmpty = false) {  // Função que gera e baixa um arquivo CSV.

  if (!data.length) {   // Verifica se a lista de dados está vazia.
    if (warnIfEmpty) {  // Se a flag de alerta estiver ativada, exibe um aviso no console.
      // Lança um erro caso a lista de dados esteja vazia e a flag de alerta esteja ativada
      throw new Error(`Nenhum dado disponível para exportar para ${filename}.`);  // Exibe uma mensagem de erro.
    }
    // Retorna se não houver dados e `warnIfEmpty` for falso
    return;
  }

  const selectedFields = fields || Object.keys(data[0]);  // Seleciona os campos a serem incluídos no CSV.
  const header = selectedFields.join(',');  // Cria o cabeçalho do CSV com base nos campos selecionados.
  const rows = data.map(row =>  // Mapeia os dados fornecidos para criar as linhas do CSV.
    selectedFields.map(field => row[field] || '').join(',') // Mapeia os campos de cada linha e os concatena com vírgulas.
  );

  const csvContent = [header, ...rows].join('\n');  // Concatena o cabeçalho e as linhas do CSV com quebras de linha.
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Cria um Blob com o conteúdo do CSV.

  const link = document.createElement('a'); // Cria um elemento <a> no documento.
  const url = URL.createObjectURL(blob);  // Cria uma URL temporária para o Blob, permitindo que ele seja acessado como se fosse um arquivo.
  link.setAttribute('href', url);// Define o atributo `href` do link com a URL do Blob.
  link.setAttribute('download', filename);// Define o atributo `download` do link com o nome do arquivo.
  document.body.appendChild(link);// Adiciona o link ao corpo do documento (DOM). O link precisa estar no DOM para que o clique possa ser simulado e o download seja iniciado.
  link.click();// Simula um clique no link, o que aciona o download do arquivo.
  document.body.removeChild(link);// Remove o link do DOM após o clique. Isso limpa o DOM, já que o link não é mais necessário após o download ser iniciado.

};

/**
 * Normaliza uma data ou data/hora para o formato `dd/MM/yyyy` ou `dd/MM/yyyy - HH:mm`.
 * @param {string} dateTimeString - A string da data ou data/hora a ser normalizada.
 * @param {boolean} includeTime - Se deve incluir a hora no formato.
 * @returns {string|null} - A data/hora normalizada ou `null` se inválida.
 */
export function normalizeDateTime(dateTimeString, includeTime = false) {   
  
  if (!dateTimeString) return null;//Retorna `null` se a string de data e hora não for fornecida (undefined, null ou string vazia).

  const timeZone = 'America/Sao_Paulo';//Define o fuso horário como "America/Sao_Paulo" para todas as operações de formatação.
  
  try {
    const parsedDate = parseISO(dateTimeString) || parse(dateTimeString, 'dd/MM/yyyy', new Date());//Tenta analisar a string de data usando a função `parseISO` para formatos ISO 8601.Caso a análise falhe, tenta usar a função `parse` para interpretar a data no formato `dd/MM/yyyy`.Se ambos os métodos falharem, o valor de `parsedDate` será `undefined` ou inválido.

    if (!isValid(parsedDate)) return null;//Verifica se a data analisada é válida usando a função `isValid` da biblioteca `date-fns`.Se não for válida, retorna `null`.

    const datePart = format(parsedDate, 'dd/MM/yyyy', { timeZone });//Formata a parte da data da string no formato `dd/MM/yyyy`, com base no fuso horário de São Paulo.Utiliza a função `format` para garantir que a data seja formatada de acordo com o padrão desejado.

    if (includeTime) {//Se o parâmetro `includeTime` for verdadeiro, formata também a parte de hora da data.A hora é formatada no padrão de 24 horas `HH:mm`.

      const timePart = format(parsedDate, 'HH:mm', { timeZone });//Formata a parte da hora da string no formato `HH:mm`, com base no fuso horário de São Paulo.
      
      return `${datePart} - ${timePart}`;//Retorna a data e a hora concatenadas no formato `dd/MM/yyyy - HH:mm`.
    }

    return datePart;//Se o parâmetro `includeTime` for falso ou não for fornecido, retorna apenas a data formatada.
  } catch {

    return null;//Em caso de erro durante a execução, retorna `null`.
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

    const jsonContent = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);

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
 * Formata uma data no formato `dd/MM/yyyy`.
 *
 * @param {Date} date - O objeto `Date` a ser formatado.
 * @deprecated
 * @returns {string} A data formatada como `dd/MM/yyyy`.
 */
export const formatDateToString = (date) => {
    const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const day = String(offsetDate.getDate()).padStart(2, '0');
    const month = String(offsetDate.getMonth() + 1).padStart(2, '0');
    const year = offsetDate.getFullYear();

    return `${day}/${month}/${year}`;
};
export const formatStringDate = (dateString) => {
    const DatePart = getDateFromString(dateString);
    const timePart = getTimeFromString(dateString);

    return `${DatePart} - ${timePart}`;
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
export const HoraRelatorio = (date) => {
    const dataASerCorrigida = new Date(date);
    if (isNaN(dataASerCorrigida.getTime())) {
        throw new Error('A string ou valor fornecido não é uma data válida.');
    }
    const hours = String(dataASerCorrigida.getHours()).padStart(2, '0');
    const minutes = String(dataASerCorrigida.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};
/**
 * Formata uma data e hora no formato `dd/MM/yyyy - HH:mm`.
 *
 * @param {Date} date - O objeto `Date` contendo tanto a data quanto a hora.
 *
 * @returns {string} A data e hora formatadas como `dd/MM/yyyy - HH:mm`.
 */
export const formatarDataHora = (date) => {
  const dataPart = formatDateToString(date);//Chama a função `formatDateToString` para formatar a data.A data formatada será no formato `dd/MM/yyyy`.

  const horaPart = formatTimeToString(date);//Chama a função `formatTimeToString` para formatar a hora.A hora formatada será no formato `HH:mm`.

  return `${dataPart} - ${horaPart}`;//A interpolação de string é usada para juntar as partes da data e da hora.
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
    let dt = DateTime.fromJSDate(baseDate);

    dt = dt.set({
        hour: time.hours,
        minute: time.minutes,
        second: time.seconds
    });

    // Retorna a string ISO, mas com o offset local (por exemplo: 2025-02-27T14:30:00.000-03:00)
    return dt.toISO();
};

/**
 * Converte uma data fornecida para uma string no formato ISO.
 *
 * @param {string|Date} date - A data a ser convertida para o formato ISO. Pode ser uma string ou um objeto `Date`.
 *
 * @returns {string|null} A data no formato ISO ou `null` se `date` for inválido ou não fornecido.
 */
export const toISODate = (date) => {
    if (!date) return null;
    const dt = DateTime.fromJSDate(new Date(date)).toLocal();
    return dt.toISO();
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
    let dt = isoString ? DateTime.fromISO(isoString).toLocal() : DateTime.now();

    tempoRef.value = {
        hours: dt.hour,
        minutes: dt.minute,
        seconds: dt.second
    };
};

/**
 * Fecha todos os dropdowns fornecidos.
 *
 * @param {Array} dropdowns - Um array de objetos de dropdown.
 * @param {Object} dropdowns[].value - O valor associado ao dropdown. Espera-se que seja um objeto com o método `hide()`.
 *
 * @returns {void} Esta função não retorna nada.
 */
export const closeAllDropdowns = (dropdowns) => {

  dropdowns.forEach((dropdown) => dropdown.value?.hide());//Itera sobre cada dropdown no array `dropdowns` e chama o método `hide()` no valor do dropdown, caso o método esteja presente.
};

export const generateCustomVideoName = (dm, existingVideo) => {//Gera um nome personalizado para um vídeo com base no número da DM e no vídeo existente.

  if (!existingVideo || existingVideo === 'N') {//Verifica se não há vídeo existente ou se o nome do vídeo é `'N'`.
    return `DM-${dm}-v1`;//Se for o caso, retorna o nome do vídeo no formato `DM-<dm>-v1`.
  }

  const match = existingVideo.match(/-v(\d+)(\.mp4)?$/);//Tenta fazer uma correspondência com a versão do vídeo existente.

  const nextVersion = match ? parseInt(match[1], 10) + 1 : 1;//Se houver uma correspondência, a versão extraída é incrementada em 1.Caso contrário, a versão começa em 1.

  return `DM-${dm}-v${nextVersion}`;//Retorna o nome do vídeo com a nova versão, no formato `DM-<dm>-v<versão>`.
};

/**
 * Retorna a extensão do arquivo com base no tipo de arquivo fornecido.
 *
 * @param {string} fileType - O tipo MIME do arquivo, como 'image/jpeg' ou 'image/png'.
 *
 * @returns {string} A extensão do arquivo correspondente ao tipo MIME fornecido, ou uma string vazia se não houver correspondência.
 */
export const getFileExtension = (fileType) => {
  
  if (fileType === 'image/jpeg') return '.jpg';//Verifica se o tipo de arquivo é 'image/jpeg' e retorna a extensão `.jpg`.

  if (fileType === 'image/png') return '.png';//Verifica se o tipo de arquivo é 'image/png' e retorna a extensão `.png`.

  return '';//Se o tipo de arquivo não for 'image/jpeg' nem 'image/png', retorna uma string vazia.
};

/**
 * Enriquece qualquer objeto com dados adicionais.
 *
 * @param {Object} target - Objeto a ser enriquecido.
 * @returns {Object} - Objeto enriquecido.
 */
export const enrichData = (target) => {
const store = useAuthStore(); // Inicializa o store de autenticação para acessar informações do usuário autenticado.

  // Retorna um novo objeto que combina o objeto original (target) com os dados adicionais.
  return {
    ...target, // Espalha as propriedades do objeto original (target).
    id_cliente: store.userIdCliente, // Adiciona a propriedade id_cliente com o valor de store.userIdCliente.
    id_usuario: store.userId, // Adiciona a propriedade id_usuario com o valor de store.userId.
  };
};

/**
 * @param {Object} relatorio - O objeto do relatório que contém informações sobre o Centro de Custo.
 * @param {Object} ListaSetor - O objeto que contém a lista de setores filtrados.
 * @param {Object} ListaSetorOriginal - O objeto que contém a lista original de setores antes de qualquer filtragem.
 * @param {Array} ListaSetor.value - A lista de setores filtrados que será atribuída com base no critério de filtro.
 * @param {Array} ListaSetorOriginal.value - A lista original de setores.
 * @param {number|null} relatorio.ID_CentroCusto - O ID do Centro de Custo no relatório. Se presente, será usado para filtrar os setores.
 */
// Exporta a função filterSetoresByCDC, que filtra setores com base no ID do Centro de Custo.
export const filterSetoresByCDC = (relatorio, ListaSetor, ListaSetorOriginal) => {

  // Verifica se o relatório contém um ID de Centro de Custo.
  if (relatorio.ID_CentroCusto) {
    // Filtra a lista original de setores, mantendo apenas aqueles cujo id_centro_custo corresponde ao ID do Centro de Custo do relatório ou cujo valor é nulo.
    ListaSetor.value = ListaSetorOriginal.value.filter(setorItem => 
      setorItem.id_centro_custo === relatorio.ID_CentroCusto || setorItem.value === null
    );
  } else {
    // Se não houver ID de Centro de Custo no relatório, mantém a lista original de setores.
    ListaSetor.value = ListaSetorOriginal.value;
  }
};

/**
 * Exporta a função filterFuncionariosBySetorAndPlanta, que filtra funcionários com base no setor e na planta.
 * @param {Object} relatorio - O objeto do relatório que contém os filtros de setor e planta.
 * @param {Object} ListaFuncionarios - O objeto contendo a lista original de funcionários.
 * @param {Object} ListaFuncionarioFiltrado - O objeto onde a lista filtrada de funcionários será armazenada.
 * @param {Array} ListaFuncionarios.value - A lista original de funcionários.
 * @param {Array} ListaFuncionarioFiltrado.value - A lista filtrada de funcionários.
 * @param {number|null} relatorio.id_setor - O ID do setor, usado para filtrar os funcionários (opcional).
 * @param {number|null} relatorio.id_planta - O ID da planta, usado para filtrar os funcionários (opcional).
 */

export const filterFuncionariosBySetorAndPlanta = (relatorio, ListaFuncionarios, ListaFuncionarioFiltrado) => {
  // Desestrutura os IDs de setor e planta do objeto relatorio.
  const {id_setor, id_planta} = relatorio;

  // Verifica se não há filtros de setor ou planta. Se não houver, copia a lista original de funcionários para a lista filtrada.
  if (!(id_setor || id_planta)) {
    ListaFuncionarioFiltrado.value = ListaFuncionarios.value;
  }
  // Filtra a lista de funcionários com base nos filtros de setor e planta.
  ListaFuncionarioFiltrado.value = ListaFuncionarios.value.filter(funcionario => {
    // Verifica se o funcionário pertence ao setor especificado, se houver.
    const matchesSetor = id_setor ? funcionario.id_setor === id_setor : true;
    // Verifica se o funcionário pertence à planta especificada, se houver.
    const matchesPlanta = id_planta ? funcionario.id_planta === id_planta : true;
    // Retorna verdadeiro se o funcionário corresponder aos filtros de setor e planta.
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
// Exporta a função filtroGenericoReltorio, que filtra o relatório com base nos critérios fornecidos e atualiza as listas de funcionários e setores de acordo.
export const filtroGenericoReltorio = (relatorio, listaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor) => {

  // Verifica se não há filtros aplicados (centro de custo, planta ou setor).
  const semFiltro = (!relatorio.value.id_centro_custo || relatorio.value.id_centro_custo === '')
   && (!relatorio.value.id_planta || relatorio.value.id_planta === '')
    && (!relatorio.value.id_setor || relatorio.value.id_setor === '');

  // Se não houver filtros, copia as listas originais para as listas filtradas e retorna.
  if (semFiltro) {
      ListaFuncionarios.value = [...listaFuncionariosOriginal.value];
      ListaSetor.value = [...ListaSetorOriginal.value];
      return;
  }

  // Se houver filtro de centro de custo, filtra a lista de setores com base no ID do centro de custo.
  if (relatorio.value.id_centro_custo) {
      ListaSetor.value = ListaSetorOriginal.value.filter((setor) => setor.id_centro_custo === relatorio.value.id_centro_custo);
  } else {
      ListaSetor.value = [...ListaSetorOriginal.value];
  }

  // Filtra a lista de funcionários com base nos filtros de centro de custo, planta e setor.
  ListaFuncionarios.value = listaFuncionariosOriginal.value.filter((funcionario) => {

      // Verifica se o funcionário pertence ao centro de custo especificado, se houver.
      const cdcMatch = relatorio.value.id_centro_custo && funcionario.id_dentro_custo === relatorio.value.id_centro_custo;

      // Verifica se o funcionário pertence à planta especificada, se houver.
      const plantaMatch = relatorio.value.id_planta && funcionario.id_planta === relatorio.value.id_planta;

      // Verifica se o funcionário pertence ao setor especificado, se houver.
      const setorMatch = relatorio.value.id_setor && funcionario.id_setor === relatorio.value.id_setor;

      // Retorna verdadeiro se o funcionário corresponder a qualquer um dos filtros.
      return cdcMatch || plantaMatch || setorMatch;
  });
};

// Função que verifica se a integração móvel está habilitada.
export function isMobEnabled (){
const store = useAuthStore(); // Inicializa o store de autenticação para acessar informações do usuário autenticado.

  return store.Integracao;
}

// Função que prepara os dados da lista com base nos parâmetros fornecidos e no papel do usuário.
export const prepareListData = (params) => {
const store = useAuthStore(); // Inicializa o store de autenticação para acessar informações do usuário autenticado.

    let baseData = {
        id_usuario: store.userId || null,  // Adiciona o ID do usuário autenticado.
        id_cliente: store.userIdCliente || null  // Adiciona o ID do cliente autenticado.
    }
    // Se o papel do usuário for 'Administrador', retorna apenas os parâmetros fornecidos. Caso contrário, combina os dados base com os parâmetros.
    return store.userRole === 'Administrador' ? { ...params} : { ...baseData , ...params}
}

// Função que verifica se o dispositivo é móvel.
export function isMobileDevice() {
  console.log(navigator.userAgent);  // Loga o user agent do navegador no console.
  return /Mobi|Android/i.test(navigator.userAgent);  // Retorna verdadeiro se o user agent indicar um dispositivo móvel.
}

export const preparelaData = (ListaProdutoFuncionario,libAvulsa) =>{
const store = useAuthStore(); // Inicializa o store de autenticação para acessar informações do usuário autenticado.

    let baseData = {
      id_usuario: store.userId || null,  
      id_cliente: store.userIdCliente || null ,
      id_funcionario:libAvulsa.id_funcionario,
      ListaProduto:ListaProdutoFuncionario,
      prazo:libAvulsa.limiteRetirada,
      notificar:libAvulsa.enviarEmail,
  }
  return baseData;
}