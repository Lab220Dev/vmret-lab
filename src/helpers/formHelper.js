/**
 * Aplica um filtro global na lista de dados, baseado em um valor de busca.
 * @param {Object[]} dataList - Lista de dados a ser filtrada.
 * @param {string} filterValue - Valor da busca para filtrar os dados.
 * @returns {Object[]} - A lista de dados filtrada.
 */
export const applyGlobalFilter = (dataList, filterValue) => {
  // Converte o valor de filtro para minúsculas. Se não for fornecido, assume uma string vazia
  const filter = filterValue?.toLowerCase() || ''; 

  // Filtra a lista de dados, verificando se algum valor do objeto contém o valor de filtro
  return dataList.filter((item) =>
    Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filter)) // Se algum valor do item contém o filtro, retorna true para incluir o item na lista
  );
};

/**
* Reseta o formulário de **Centro de Custo**.
* @param {Object} form - Objeto do formulário que será resetado.
*/
export const resetCDCForm = (form) => {
  // Limpa todos os campos do formulário de Centro de Custo
  form.Nome = ''; // Nome do centro de custo
  form.Codigo = ''; // Código do centro de custo
  form.ID_CentroCusto = ''; // ID do centro de custo
};

/**
* Retorna um objeto inicial para o formulário de **Cliente**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetClienteForm = () => ({
  nome: '', // Nome do cliente
  cnpj: '', // CNPJ do cliente
  ativo: true, // Flag indicando se o cliente está ativo
  usar_api: false, // Flag indicando se o cliente usa a API
  textoretirada: '', // Texto de retirada
});

/**
* Retorna um objeto inicial para o formulário de **Função**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetFuncaoForm = () => ({
  codigo: '', // Código da função
  nome: '', // Nome da função
  id_centro_custo: '', // ID do centro de custo associado à função
});

/**
* Retorna um objeto inicial para o formulário de **Funcionário**.
* @returns {Object} - Objeto com os campos resetados.
*/
export const resetFuncionarioForm = () => ({
  id_funcionario: '', // ID do funcionário
  matricula: '', // Matrícula do funcionário
  senha: '', // Senha do funcionário
  nome: '', // Nome do funcionário
  biometria: '', // Biometria do funcionário
  biometria2: '', // Segunda biometria do funcionário
  data_admissao: null, // Data de admissão do funcionário
  CPF: '', // CPF do funcionário
  RG: '', // RG do funcionário
  CTPS: '', // CTPS do funcionário
  email: '', // E-mail do funcionário
  status: '', // Status do funcionário (ex: ativo, inativo)
  hora_inicial: '', // Hora inicial de trabalho
  hora_final: '', // Hora final de trabalho
  id_centro_custo: '', // ID do centro de custo do funcionário
  id_funcao: '', // ID da função do funcionário
  id_planta: '', // ID da planta onde o funcionário trabalha
  id_setor: '', // ID do setor onde o funcionário trabalha
  segunda: false, // Flag indicando se o funcionário trabalha na segunda-feira
  terca: false, // Flag indicando se o funcionário trabalha na terça-feira
  quarta: false, // Flag indicando se o funcionário trabalha na quarta-feira
  quinta: false, // Flag indicando se o funcionário trabalha na quinta-feira
  sexta: false, // Flag indicando se o funcionário trabalha na sexta-feira
  sabado: false, // Flag indicando se o funcionário trabalha no sábado
  domingo: false, // Flag indicando se o funcionário trabalha no domingo
  itens: [], // Lista de itens associados ao funcionário
});

/**
* Reseta o formulário de **Itens** dentro de Funcionario.
* @param {Object} selectedProduct - Objeto do produto selecionado que será resetado.
*/
export const resetItens = (selectedProduct) => {
  // Reseta os campos do produto selecionado para valores iniciais
  selectedProduct.value = {
    id_produto: '', // ID do produto
    nome: '', // Nome do produto
    sku: '', // SKU (código único) do produto
    quantidade: null, // Quantidade do produto
  };
};

/**
* Reseta o estado de um formulário genérico.
* @param {Object} form - Referência do formulário a ser resetado.
* @param {Object} initialState - Estado inicial do formulário.
*/
export const resetGenericForm = (form, initialState) => {
  // Itera pelas chaves do estado inicial e redefine o formulário para esses valores
  Object.keys(initialState).forEach((key) => {
    form[key] = initialState[key]; // Para cada chave, o valor no formulário é redefinido para o valor correspondente no estado inicial
  });
};

export const resetPlantaForm = (planta) => {
    Object.assign(planta, {
      codigo:'',  
      nome: '',
        id_planta: '',
        userid: '',
        senha: '',
        urlapi: '',
        clientid: ''
    });
};

export const resetProdutoForm = (produto, imageRefs) => {
    Object.assign(produto, {
        codigo: '',
        id_planta: '',
        id_tipoProduto: '',
        id_categoria: '',
        nome: '',
        descricao: ' ',
        unidade_medida: '',
        validadedias: 0
    });

    if (imageRefs) {
        imageRefs.forEach((imageRef) => {
            if (imageRef) imageRef.value = null;
        });
    }
};

export const resetSetorForm = (setor) => {
    Object.assign(setor, {
        codigo: '',
        nome: '',
        id_centro_custo: ''
    });
};

/**
 * Reseta o formulário de DM (Dispositivo de Monitoramento).
 * @param {Object} DM - Objeto reativo do DM a ser resetado.
 * @param {Object[]} Controladoras - Lista de controladoras reativas.
 * @param {Object} selectedClient - Objeto reativo do cliente selecionado.
 * @param {Object} nextValues - Valores iniciais para tipos de controladoras.
 */
export const resetDMForm = (DM, Controladoras, selectedClient, nextValues) => {
    Object.assign(DM, {
        Ativo: '',
        Chave: '',
        ChaveAPI: '',
        ClienteID: '',
        ClienteNome: '',
        Created: '',
        Enviada: '',
        ID_CR_Usuario: '',
        ID_DM: '',
        IDcliente: '',
        Identificacao: '',
        Integracao: '',
        Numero: '',
        OP_Biometria: '',
        OP_Facial: '',
        OP_Senha: '',
        URL: '',
        Updated: '',
        UserID: '',
        Versao: '',
        Devolucao: '',
        ID_Cliente: null
    });

    Controladoras.value = [];
    selectedClient.value = { id_cliente: '', nome_cliente: '', usar_api: false };

    Object.assign(nextValues['2018'], { placa: 12 });
    Object.assign(nextValues['2023'], { dip: 2 });
    Object.assign(nextValues['Locker'], { dip: 2 });
    Object.assign(nextValues['2024'], { placa: 101 });
};
/**
 * Reseta o objeto do produto selecionado para seus valores iniciais.
 *
 * @param {Object} produtoSelecionado - Objeto referenciado do produto selecionado.
 * @param {Object} produtoSelecionado.value - Valor atual do produto selecionado que será resetado.
 * @property {string} id_produto - Identificador do produto.
 * @property {string} Porta - Porta associada ao produto.
 * @property {string} Motor1 - Identificador do primeiro motor associado ao produto.
 * @property {string} Motor2 - Identificador do segundo motor associado ao produto.
 * @property {string} Controladora - Controladora associada ao produto.
 * @property {string} Posicao - Posição associada ao produto.
 * @property {string} Andar - Andar associado ao produto.
 */
export const resetProdutoSelecionado = (produtoSelecionado) => {
    produtoSelecionado.value = {
        id_item: '',
        id_produto: '',
        Nome_Produto: '',
        QTD: '',
        SKU: '',
        Controladora: '',
        Motor1: null,
        Motor2: null,
        Dip: null,
        Andar: null,
        Posicao: null,
        Capacidade: null
    };
};
