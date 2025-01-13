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

/**
* Reseta o formulário de **Planta**.
* @param {Object} planta - Objeto da planta que será resetado.
*/
export const resetPlantaForm = (planta) => {
  // Redefine os campos do objeto planta para os valores iniciais
  Object.assign(planta, {
    nome: '', // Nome da planta
    id_planta: '', // ID da planta
    userId: '', // ID do usuário associado à planta
    senha: '', // Senha do usuário
    urlapi: '', // URL da API associada à planta
    clienteid: '', // ID do cliente associado à planta
  });
};

/**
* Reseta o formulário de **Produto**.
* @param {Object} produto - Objeto do produto que será resetado.
* @param {Object[]} imageRefs - Referências para as imagens associadas ao produto.
*/
export const resetProdutoForm = (produto, imageRefs) => {
  // Redefine os campos do produto para os valores iniciais
  Object.assign(produto, {
    codigo: '', // Código do produto
    id_planta: '', // ID da planta onde o produto é utilizado
    id_tipoProduto: '', // ID do tipo de produto
    id_categoria: '', // ID da categoria do produto
    nome: '', // Nome do produto
    descricao: ' ', // Descrição do produto
    unidade_medida: '', // Unidade de medida do produto
    validadedias: 0, // Validade do produto em dias
  });

  // Se existem referências de imagens, redefine cada uma delas para null
  if (imageRefs) {
    imageRefs.forEach((imageRef) => {
      if (imageRef) imageRef.value = null; // Limpa a referência de cada imagem
    });
  }
};

/**
* Reseta o formulário de **Setor**.
* @param {Object} setor - Objeto do setor que será resetado.
*/
export const resetSetorForm = (setor) => {
  // Redefine os campos do setor para os valores iniciais
  Object.assign(setor, {
    codigo: '', // Código do setor
    nome: '', // Nome do setor
    id_centro_custo: '', // ID do centro de custo associado ao setor
  });
};
