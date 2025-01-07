/**
 * Aplica um filtro global na lista de dados, baseado em um valor de busca.
 * @param {Object[]} dataList - Lista de dados a ser filtrada.
 * @param {string} filterValue - Valor da busca para filtrar os dados.
 * @returns {Object[]} - A lista de dados filtrada.
 */
export const applyGlobalFilter = (dataList, filterValue) => {
    const filter = filterValue?.toLowerCase() || '';
    return dataList.filter((item) =>
      Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filter))
    );
  };
  
  /**
   * Reseta o formulário de **Centro de Custo**.
   * @param {Object} form - Objeto do formulário que será resetado.
   */
  export const resetCDCForm = (form) => {
    form.Nome = '';
    form.Codigo = '';
    form.ID_CentroCusto = '';
  };
  
  /**
   * Retorna um objeto inicial para o formulário de **Cliente**.
   * @returns {Object} - Objeto com os campos resetados.
   */
  export const resetClienteForm = () => ({
    nome: '',
    cnpj: '',
    ativo: true,
    usar_api: false,
    textoretirada: '',
  });
  
  /**
   * Retorna um objeto inicial para o formulário de **Função**.
   * @returns {Object} - Objeto com os campos resetados.
   */
  export const resetFuncaoForm = () => ({
    codigo: '',
    nome: '',
    id_centro_custo: '',
  });
  
  /**
   * Retorna um objeto inicial para o formulário de **Funcionário**.
   * @returns {Object} - Objeto com os campos resetados.
   */
  export const resetFuncionarioForm = () => ({
    id_funcionario: '',
    matricula: '',
    senha: '',
    nome: '',
    biometria: '',
    biometria2: '',
    data_admissao: null,
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    status: '',
    hora_inicial: '',
    hora_final: '',
    id_centro_custo: '',
    id_funcao: '',
    id_planta: '',
    id_setor: '',
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false,
    itens: [],
  });
  
  /**
   * Reseta o formulário de **Itens** dentro de Funcionario.
   * @param {Object} selectedProduct - Objeto do produto selecionado que será resetado.
   */
  export const resetItens = (selectedProduct) => {
    selectedProduct.value = {
      id_produto: '',
      nome: '',
      sku: '',
      quantidade: null,
    };
  };
  
  /**
   * Reseta o estado de um formulário genérico.
   * @param {Object} form - Referência do formulário a ser resetado.
   * @param {Object} initialState - Estado inicial do formulário.
   */
  export const resetGenericForm = (form, initialState) => {
    Object.keys(initialState).forEach((key) => {
      form[key] = initialState[key];
    });
  };

  export const resetPlantaForm = (planta) => {
    Object.assign(planta, {
      nome: '',
      id_planta: '',
      userId: '',
      senha: '',
      urlapi: '',
      clienteid: '',
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
      validadedias: 0,
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
      id_centro_custo: '',
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
    ID_Cliente: null,
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