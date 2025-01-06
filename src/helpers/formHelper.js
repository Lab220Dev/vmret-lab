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
  