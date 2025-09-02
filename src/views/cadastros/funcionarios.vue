<script setup>
// Importando funções e objetos do Vue.js para usar no componente
import { reactive, ref, onMounted, watch, computed } from 'vue';
// Importando a função 'useToast' para exibir notificações de sucesso ou erro
import { useToast } from 'primevue/usetoast';
// Importando o estilo do componente de data picker
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
// Importando o objeto 'FilterMatchMode' do PrimeVue para configurar os filtros de pesquisa
import { FilterMatchMode } from '@primevue/core/api';
// Importando a imagem de placeholder que será usada caso não haja imagem para um produto
import imagePlaceholder from '@/assets/images/placeholder4.1.jpg';
import clockurl from '@/assets/images/OIP.png';
// Importando o store de autenticação para acessar o estado de autenticação do usuário
import { useAuthStore } from '@/store/authStore.js';
// Importando o componente de upload de imagem para ser usado na interface
import ImageUpload from '@/components/ImageUpload.vue';
// Importando o store de dados para acessar os dados compartilhados, como plantas
import { useDataStore } from '@/store/dataStore.js';
// Importando o componente de spinner de carregamento
import LoadingSpinner from '@/components/LoadingSpinner.vue';
// Importando o serviço de produto para interagir com a API relacionada aos funcionarios
import funcionarioService from '@/Services/funcionarioService.js';
import * as formatservices from '@/helpers/HelperUtils.js'; // Importa todas as funções de ajuda do arquivo HelperUtils.js
// Importando funções de ajuda relacionadas ao formulário do funcionarios
import { resetFuncionarioForm, resetItens as resetProduto } from '@/helpers/formHelper.js';
import { validadorcpf, validadoremail } from '@/helpers/HelperFuncionario.js';//validateForm
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const store = useAuthStore(); // Acessa o store de autenticação para obter dados sobre o usuário logado

const dataStore = useDataStore(); // Acessa o store de dados para obter informações sobre plantas e outros dados

const toast = useToast(); // Função para exibir notificações via toast

const selectedFile = ref(null); // Cria uma referência reativa para armazenar o arquivo selecionado
const handleFileSelected = (file) => {
    // Declara uma função chamada handleFileSelected
    selectedFile.value = file; // Define o arquivo selecionado na referência reativa
};

// Cria uma referência reativa para armazenar erros, inicialmente vazia.
const errors = ref({});

// Cria uma referência reativa para armazenar o status do funcionário, com duas opções: 'Ativo' e 'Inativo'.
const status = computed(() => [
    { label: t('active'), value: 'Ativo' }, // Opção de status 'Ativo'.
    { label: t('inactive'), value: 'Inativo' } // Opção de status 'Inativo'.
]);
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'nome', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
//IMAGEM
const imageUploader = ref(null);

/**
 * Cria uma referência reativa para armazenar o URL da imagem, inicializada com uma imagem placeholder.
 * @type {string} O valor inicial é o caminho da imagem placeholder.
 */
const imageUrl = ref(imagePlaceholder);

// Cria uma referência reativa para armazenar as opções de hierarquia, inicialmente um array vazio.
let hieraquiaoptions = ref([]);

// Cria uma referência reativa para armazenar as opções de hierarquia formatadas, inicialmente um array vazio.
let formatedHierarquiaOptions = ref([]);

const centroCustoOptions = computed(() => dataStore.cdcsOptions);
const plantaOptions = computed(() => dataStore.plantasOptions);
const setorOptions = computed(() => dataStore.setoresOptions);
const produtosOptions = computed(() => dataStore.produtosOptions);
const ListaProdutos = computed(() => {
    return produtosOptions.value.filter((produto) => produto.value !== null);
});


/**
 * Cria um objeto reativo para armazenar os dados de um funcionário, com as propriedades iniciais.
 *
 * @type {Object}
 */
let funcionario = reactive({
    id_funcionario: '', // ID do funcionário.
    matricula: '', // Matrícula do funcionário.
    senha: '', // Senha do funcionário.
    nome: '', // Nome do funcionário.
    biometria: '', // Primeira digital do funcionário.
    biometria2: '', // Segunda digital do funcionário.
    data_admissao: null, // Data de admissão do funcionário.
    CPF: '', // CPF do funcionário.
    RG: '', // RG do funcionário.
    CTPS: '', // CTPS (Carteira de Trabalho e Previdência Social) do funcionário.
    email: '', // E-mail do funcionário.
    status: '', // Status do funcionário, como 'Ativo' ou 'Inativo'.
    hora_inicial: '', // Hora de início do expediente.
    hora_final: '', // Hora de término do expediente.
    id_centro_custo: '', // ID do centro de custo.
    id_funcao: '', // ID da função.
    id_planta: '', // ID da planta onde o funcionário está alocado.
    id_setor: '', // ID do setor onde o funcionário está alocado.
    segunda: false, // Se o funcionário trabalha na segunda-feira.
    terca: false, // Se o funcionário trabalha na terça-feira.
    quarta: false, // Se o funcionário trabalha na quarta-feira.
    quinta: false, // Se o funcionário trabalha na quinta-feira.
    sexta: false, // Se o funcionário trabalha na sexta-feira.
    sabado: false, // Se o funcionário trabalha no sábado.
    domingo: false, // Se o funcionário trabalha no domingo.
    nomearquivo: '', // Nome do arquivo do funcionário (por exemplo, foto ou documento).
    itens: [] // Lista de itens relacionados ao funcionário.
});

const SenhaBE = ref(''); // Armazena a senha original para comparação

const isSameSenha = () => {
    // Função para verificar se a senha inserida é a mesma
    return funcionario.senha === SenhaBE.value;
};

const senhaAlterada = ref(false); // Flag para indicar se a senha foi alterada

// Cria uma referência reativa para armazenar a lista de produtos, inicialmente um array vazio.
// const ListaProdutos = ref([]);

/**
 * Cria uma referência reativa para armazenar a lista de produtos disponíveis,
 * utilizando `reactive` para garantir que as alterações sejam rastreadas e reativas.
 * Inicialmente, é um array vazio.
 *
 * @type {Array} Inicializa como um array vazio.
 */
const ListaProdutosDisponiveis = reactive([]);

// Cria uma referência reativa para armazenar a lista de produtos de um funcionário específico, inicialmente um array vazio.
const ListaProdutoFuncionario = ref([]);

// Cria uma referência reativa para armazenar os itens do setor, inicialmente um array vazio.
const ListaItemsSetor = ref([]);

// Cria uma referência reativa para controlar a visibilidade da edição, inicialmente como `false` (oculto).
const editVisible = ref(false);
const Mob = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Configuração para o filtro global de busca.
});

// Cria uma referência reativa para armazenar o produto selecionado, com propriedades padrão vazias.
const selectedProduct = ref({
    id_produto: '', // ID do produto selecionado.
    nome: '', // Nome do produto selecionado.
    sku: '', // SKU (Stock Keeping Unit) do produto selecionado.
    quantidade: 1 // Quantidade do produto selecionado, inicialmente configurada para 1.
});

// Cria uma referência reativa para armazenar a lista de funcionários, inicialmente um array vazio.
const ListaFuncionarios = ref([]);

// Cria uma referência reativa para controlar a visibilidade do diálogo de itens, inicialmente configurado para `false` (oculto).
const itemDialog = ref(false);

// Cria uma referência reativa para controlar a visibilidade do diálogo de exclusão de produto, inicialmente configurado para `false` (oculto).
const deleteProductDialog = ref(false);

// Cria uma referência reativa para controlar a visibilidade do diálogo de exclusão de funcionário, inicialmente configurado para `false` (oculto).
const deleteFuncionarioDialog = ref(false);

// Cria uma referência reativa para controlar a visibilidade de um outro elemento, inicialmente configurado para `false` (oculto).
const visible = ref(false);

const active = ref('0'); // Variável reativa para controlar a aba ativa.

// Cria uma referência reativa para armazenar o valor de "itens ativos", inicialmente configurado para 0.
const activeItens = ref(0);
const totalRecords = ref(0);

const loading = ref(false); // Cria uma referência reativa para controlar o estado de carregamento

// Cria uma referência reativa para armazenar o select1, inicialmente configurado para `null` (não atribuído).
const select1 = ref(null);

// Cria uma referência reativa para armazenar o select2, inicialmente configurado para `null` (não atribuído).
const select2 = ref(null);

// Cria uma referência reativa para armazenar o select3, inicialmente configurado para `null` (não atribuído).
const select3 = ref(null);

// Cria uma referência reativa para armazenar o select4, inicialmente configurado para `null` (não atribuído).
const select4 = ref(null);

// Cria uma referência reativa para armazenar o select5, inicialmente configurado para `null` (não atribuído).
const select5 = ref(null);

/**
 * Formata a data usando o serviço de formatação para transformá-la em uma string.
 *
 * @param {Date} date - A data a ser formatada.
 * @returns {string} Retorna a data formatada como uma string.
 */
const format = (date) => {
    // Chama o serviço de formatação para formatar a data em uma string.
    return formatservices.formatDateToString(date);
};

/**
 * Cria uma referência reativa para armazenar o tempo de início, inicialmente configurado para `null`.
 * @type {null} Inicialmente, o valor é `null`.
 */
const TempoInicio = ref(null);

/**
 * Cria uma referência reativa para armazenar o tempo de fim, inicialmente configurado para `null`.
 * @type {null} Inicialmente, o valor é `null`.
 */
const TempoFim = ref(null);

/**
 * Cria uma referência reativa para armazenar a quantidade de itens filtrados, inicialmente configurada para 0.
 * @type {number} Inicializa como 0.
 */
const filteredCount = ref(0);

/**
 * Função que é chamada quando uma linha é selecionada em uma tabela ou lista.
 *
 * @param {Object} event - O evento gerado pela seleção da linha.
 * @property {Object} event.data - Os dados do funcionário selecionado.
 *
 * @returns {Promise<void>} Retorna uma Promise, pois executa ações assíncronas, como chamadas de API.
 */
const onRowSelect = async (event) => {
    // Atribui o funcionário selecionado ao objeto `funcionario`.
    funcionario = event.data;

    // Mapeia os itens do funcionário para incluir uma propriedade 'action' com valor 'new'.
    ListaProdutoFuncionario.value = funcionario.itens.map((item) => ({
        ...item,
        action: 'new' // A ação é atribuída como 'new' para todos os itens.
    }));

    // Chama o serviço para formatar o tempo de início do funcionário e atribui a referência reativa `TempoInicio`.
    formatservices.setTempo(TempoInicio, funcionario.hora_inicial);

    // Chama o serviço para formatar o tempo de fim do funcionário e atribui a referência reativa `TempoFim`.
    formatservices.setTempo(TempoFim, funcionario.hora_final);

    // Faz uma requisição assíncrona para buscar os itens do setor do funcionário com base no `id_setor`.
    await fetchItensSetor(funcionario.id_setor);

    // Limpa os dados da imagem (provavelmente associada ao funcionário).
    imageUploader.value?.clearImageData();

    // Faz uma requisição assíncrona para buscar a imagem do funcionário com base no nome do arquivo de imagem.
    await getImagem(funcionario.foto);

senha.value = funcionario.senha; // Armazena a senha para edição
    SenhaBE.value = funcionario.senha; // Armazena a senha original para comparação
    senhaAlterada.value = false; // Reseta a flag de senha alterada
    
    // Define o valor de `active` como 1, provavelmente indicando que o funcionário está ativo no sistema.
    active.value = '1';

    // Define a visibilidade do formulário de edição para `true`, permitindo a edição dos dados do funcionário.
    editVisible.value = true;
};

/**
 * Função chamada quando o setor selecionado é alterado.
 *
 * @param {Object} event - O evento gerado pela mudança no setor.
 * @property {any} event.value - O valor do setor selecionado.
 *
 * @returns {Promise<void>} Retorna uma Promise, pois faz uma requisição assíncrona.
 */
const setorChange = async (event) => {
    // Armazena o valor do setor selecionado.
    const idSetorSelecionado = event.value;

    // Verifica se um setor foi selecionado antes de buscar os itens do setor.
    if (idSetorSelecionado) {
        // Faz uma requisição assíncrona para buscar os itens do setor selecionado.
        await fetchItensSetor(idSetorSelecionado);
    }
};

/**
 * Valida o CPF do funcionário e armazena o erro, se houver.
 * A função `validadorcpf` verifica se o CPF é válido.
 */
const cpfvalidate = () => {
    // Armazena o resultado da validação do CPF na propriedade `CPF` de `errors`.
    errors.value.CPF = validadorcpf(funcionario.CPF);
};

/**
 * Valida o e-mail do funcionário e armazena o erro, se houver.
 * A função `validadoremail` verifica se o e-mail é válido.
 */
const validateEmail = () => {
    // Armazena o resultado da validação do e-mail na propriedade `email` de `errors`.
    errors.value.email = validadoremail(funcionario.email);
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadFuncionarios(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadFuncionarios(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadFuncionarios(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
const loadFuncionarios = async (page = 1) => {
    const params = {
        first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
        rows: lazyParams.value.rows, // Número de registros por página
        sortField: lazyParams.value.sortField, // Campo para ordenação
        sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
        filters: lazyParams.value.filters // Filtros aplicados
    };
    const data = formatservices.prepareListData(params);
    try {
        // Define a referência reativa `loading.value` para `true` para indicar que os dados estão sendo carregados.
        loading.value = true;
        const response = await funcionarioService.listarFuncionariosPaginado(data);
        ListaFuncionarios.value = response.data.funcionarios;
        totalRecords.value = response.data.totalRecords;

        // Chama a função `resetTable` para resetar a tabela (ou reiniciar a visualização da lista).
        resetTable();

        // Chama a função `resetItens` para reiniciar o estado dos itens ou componentes relacionados.
        resetItens();
    } catch (error) {
        // Em caso de erro, exibe uma notificação de erro com a mensagem 'Erro ao carregar os funcionários'.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_employee_list'), life: 3000 });
    } finally {
        // Define a referência reativa `loading.value` para `false` após o carregamento, indicando que o processo foi concluído.
        loading.value = false;
    }
};

watch(
    () => filters.value.global.value, // Observa mudanças no valor global do filtro
    () => {
        filteredCount.value = ListaFuncionarios.value.filter((item) => {
            // Filtra a lista de funcionários
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro em minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor do item inclui o valor do filtro
        }).length; // Atualiza o contador de resultados filtrados
    },
    { immediate: true } // Aciona imediatamente
);

const adicionarFuncionario = async () => {
    try {
        loading.value = true;
        // const { isValid, errors } = validateForm(funcionario);
        // if (!isValid) {
        //     throw new Error(t('employee_form_validation_error', { errors: JSON.stringify(errors) }));
        // }
        await funcionarioService.adicionarFuncionario(funcionario, selectedFile);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_added'), life: 3000 });
        dataStore.invalidateFuncionariosCache();
        await loadFuncionarios();
        active.value = '0';
        resetForm();
        resetFuncionarioForm(funcionario);
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: error.message || t('employee_form_default_error'), life: 3000 });
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const loadData = async () => {
    try {
        if (!dataStore.plantas) await dataStore.fetchPlantas();
        if (!dataStore.setores) await dataStore.fetchSetores();
        if (!dataStore.cdcs) await dataStore.fetchCdc();
        if (!dataStore.produtos) await dataStore.fetchProdutos();
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
    }
};

const fetchItensSetor = async (id_setor) => {
    // Declara uma função assíncrona chamada fetchItensSetor
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: id_setor
    };

    try {
        const response = await funcionarioService.fetchItensSetor(data); // Faz uma requisição para buscar os itens do setor
        // Armazena os itens do setor em ListaItemsSetor
        ListaItemsSetor.value = response.data;

        listarProdutosDisponiveis(); // Chama a função para listar os produtos disponíveis
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a requisição
    }
};

const listarProdutosDisponiveis = () => {
    // Declara uma função chamada listarProdutosDisponiveis
    const addedIds = new Set(ListaItemsSetor.value.map((item) => item.id_produto)); // Cria um conjunto com os IDs dos produtos já adicionados ao setor

    // Filtra os produtos disponíveis (da ListaProdutos) excluindo os que já estão no setor
    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...ListaProdutos.value.filter((produto) => !addedIds.has(produto.value)));
};

const fetchHieraquiaOptions = async () => {
    // Declara uma função assíncrona chamada fetchHieraquiaOptions
    try {
        const response = await funcionarioService.fetchHieraquiaOptions();
        hieraquiaoptions = response.data;
        formatedHierarquiaOptions = hieraquiaoptions.map((hieraquiaoptions) => ({
            label: ` ${hieraquiaoptions.nome}`,
            value: hieraquiaoptions.id_funcao
        }));
    } catch (error) {
        // Captura qualquer erro que ocorrer durante a requisição
    }
};

watch(
    TempoInicio, // Observa mudanças na referência reativa TempoInicio
    (newTime) => {
        // Função de callback chamada quando TempoInicio muda
        if (newTime) {
            funcionario.hora_inicial = formatservices.formatarTempo(newTime); // Formata e atribui o novo tempo inicial
        } else {
            funcionario.hora_inicial = ''; // Reseta o tempo inicial se newTime for nulo
        }
    },
    { deep: true } // Observa mudanças profundas no objeto TempoInicio
);

watch(
    TempoFim, // Observa mudanças na referência reativa TempoFim
    (newTime) => {
        // Função de callback chamada quando TempoFim muda
        if (newTime) {
            funcionario.hora_final = formatservices.formatarTempo(newTime); // Formata e atribui o novo tempo final
        } else {
            funcionario.hora_final = ''; // Reseta o tempo final se newTime for nulo
        }
    },
    { deep: true } // Observa mudanças profundas no objeto TempoFim
);

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    // Observa mudanças na variável reativa active
    if (newIndex !== oldIndex && newIndex === '0') {
        // Verifica se o índice mudou e se o novo índice é 0
        funcionario = reactive(resetFuncionarioForm()); // Reseta o formulário do funcionário
        resetForm(); // Reseta o formulário
        resetItens(); // Reseta os itens
        loadFuncionarios(); // Carrega a lista de funcionários
        editVisible.value = false; // Define a visibilidade da edição como false
    }
});

const resetTable = () => {
    // Declara uma função chamada resetTable
    activeItens.value = 0; // Define o valor de activeItens como 0
    resetItens(); // Reseta os itens
};

const getImagem = async (filename) => {
    // Declara uma função assíncrona chamada getImagem
    if (filename === '') {
        // Verifica se o nome do arquivo é vazio
        return imagePlaceholder; // Retorna a imagem placeholder
    }
    try {
        const response = await funcionarioService.obterImagem(store.userIdCliente, filename);
        if (response.status === 200) {
            const { image, mimeType } = response.data;
            imageUrl.value = `data:${mimeType};base64,${image}`;
        }
    } catch (error) {
        return imagePlaceholder; // Retorna a imagem placeholder em caso de erro
    }
};

function debounce(func, wait = 300) {
    // Declara uma função chamada debounce
    let timeout; // Declara uma variável para armazenar o timeout
    return (...args) => {
        // Retorna uma função que recebe argumentos
        clearTimeout(timeout); // Limpa o timeout anterior
        timeout = setTimeout(() => func.apply(this, args), wait); // Define um novo timeout para chamar a função após o tempo de espera
    };
}

const debouncedFilterChange = debounce(() => {
    // Declara uma função chamada debouncedFilterChange que usa debounce para chamar onFilterChange após 300ms
    onFilterChange();
}, 300);

onMounted(async () => {
    // Declara uma função assíncrona chamada onMounted
    Mob.value = formatservices.isMobEnabled(); // Define o valor de Mob com base na função isMobEnabled
    await loadData(); // Carrega os dados iniciais
    await loadFuncionarios(); // Carrega a lista de funcionários
    await fetchHieraquiaOptions(); // Busca as opções de hierarquia
    await fetchItensSetor(); // Busca os itens do setor

    active.value = '0'; // Define a aba ativa como 0 (listagem de usuários)
});

const deleteFuncionario = async () => {
    // Declara uma função assíncrona chamada deleteFuncionario
    let data = { id_funcionario: funcionario.id_funcionario, id_usuario: store.userId };
    try {
        loading.value = true; // Ativa o estado de loading
        await funcionarioService.deleteFuncionario(data); // Faz uma requisição para deletar o funcionário
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('deleted_employee_form_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        dataStore.invalidateFuncionariosCache(); // Invalida o cache de funcionários no dataStore
        deleteFuncionarioDialog.value = false; // Fecha o diálogo de confirmação de exclusão
        loadFuncionarios(); // Carrega a lista de funcionários
        active.value = '0'; // Define o valor de active como 0
        resetForm(); // Reseta o formulário
    } catch {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('deleted_employee_form_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const resetForm = () => {
    // Declara uma função chamada resetForm
    funcionario.foto = null; // Reseta a foto do funcionário
    imageUrl.value = imagePlaceholder; // Define a URL da imagem como a imagem placeholder
    resetFuncionarioForm(funcionario); // Reseta o formulário do funcionário
    funcionario.itemsSelecionadosFuncionario = []; // Reseta os itens selecionados do funcionário

    selectedFile.value = null; // Reseta o arquivo selecionado
    TempoInicio.value = null; // Reseta o tempo de início
    TempoFim.value = null; // Reseta o tempo de fim
    imageUploader.value?.clearImageData(); // Limpa os dados da imagem no uploader
    ListaItemsSetor.value = []; // Reseta a lista de itens do setor
    ListaProdutoFuncionario.value = []; // Reseta a lista de produtos do funcionário
};

const resetItens = () => {
    resetProduto(selectedProduct);
};

const SalvarProduto = async () => {
    // Declara uma função assíncrona chamada SalvarProduto
    if (!validarCampos()) {
        // Verifica se a validação dos campos falhou
        return; // Se falhar, não continua
    }
    loading.value = true; // Ativa o estado de loading
    try {
        const response = await funcionarioService.SalvarProduto(funcionario, selectedProduct); // Faz uma requisição para salvar o produto
        ListaProdutoFuncionario.value = []; // Reseta a lista de produtos do funcionário
        ListaProdutoFuncionario.value = response.data.dados[0]; // Atualiza a lista de produtos do funcionário com a resposta
        visible.value = false; // Define a visibilidade como false
        resetItens(); // Reseta os itens
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_product_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        itemDialog.value = false; // Fecha o diálogo de item
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('employee_product_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false;
    }
};

const listarProdutosFiltrados = () => {
    // Declara uma função chamada listarProdutosFiltrados
    const idsSetor = new Set(ListaItemsSetor.value.map((item) => item.id_produto)); // Cria um conjunto com os IDs dos produtos já adicionados ao setor

    const idsAdicionados = new Set(ListaProdutoFuncionario.value.map((item) => item.id_produto)); // Cria um conjunto com os IDs dos produtos já adicionados ao funcionário

    const itensFiltrados = ListaProdutos.value.filter(
        (produto) => !idsSetor.has(produto.value) && !idsAdicionados.has(produto.value) // Filtra os produtos disponíveis excluindo os que já estão no setor ou no funcionário
    );

    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...itensFiltrados); // Atualiza a lista de produtos disponíveis

    if (itensFiltrados.length === 0) {
        // Verifica se não há mais itens disponíveis
        toast.add({
            severity: 'warn',
            summary: t('employee_no_availble_item'),
            detail: t('employee_no_more_availble'),
            life: 3000
        });
    }
};

const abrirDialogAdicionarItem = () => {
    // Declara uma função chamada abrirDialogAdicionarItem
    listarProdutosFiltrados(); // Chama a função para listar os produtos filtrados
    visible.value = true; // Mostra o diálogo
};

const editItem = (selectedItem) => {
    // Declara uma função chamada editItem
    selectedProduct.value = { ...selectedItem }; // Define o produto selecionado
    itemDialog.value = true; // Mostra o diálogo de item
};

const atualizarFuncionario = async () => {
    loading.value = true;

        if (isSameSenha()) {
        // Se a senha não foi alterada
        delete funcionario.senha; // Remove a senha do objeto
    }
    
    // Declara uma função assíncrona chamada atualizarFuncionario
    try {
        
        // const { isValid, errors } = validateForm(funcionario);
        // if (!isValid) {
        //     throw new Error(t('employee_form_validation_error', { errors: JSON.stringify(errors) }));
        // }
        await funcionarioService.atualizarFuncionario(funcionario, selectedFile); // Faz uma requisição para atualizar o funcionário
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_update'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        dataStore.invalidateFuncionariosCache(); // Invalida o cache de funcionários no dataStore
        loadFuncionarios(); // Carrega a lista de funcionários
        active.value = '0'; // Define o valor de active como 0
        resetForm(); // Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: error.message || t('employee_update_error'), life: 3000 });
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const closeAllselects = () => {
    // Declara uma função chamada closeAllselect s
    if (select1.value?.overlayVisible) select1.value.hide(); // Verifica e esconde o select1 se estiver visível
    if (select2.value?.overlayVisible) select2.value.hide(); // Verifica e esconde o select2 se estiver visível
    if (select3.value?.overlayVisible) select3.value.hide(); // Verifica e esconde o select3 se estiver visível
    if (select4.value?.overlayVisible) select4.value.hide(); // Verifica e esconde o select4 se estiver visível
    if (select5.value?.overlayVisible) select5.value.hide(); // Verifica e esconde o select5 se estiver visível
};

const handleDatepickerOpen = () => {
    // Declara uma função chamada handleDatepickerOpen
    closeAllselects(); // Chama a função closeAllselect s para fechar todos os selects
};

const confirmDeleteProduct = (item) => {
    // Declara uma função chamada confirmDeleteProduct
    selectedProduct.value = { ...item }; // Define o produto selecionado
    deleteProductDialog.value = true; // Mostra o diálogo de confirmação de exclusão de produto
};

const deleteProduct = async () => {
    // Declara uma função assíncrona chamada deleteProduct
    try {
        loading.value = true; // Ativa o estado de loading
        const res = await funcionarioService.deleteProduct(funcionario, selectedProduct); // Faz uma requisição para deletar o produto
        if (res.data && res.data.items) {
            ListaProdutoFuncionario.value = res.data.items; // Atualiza a lista de produtos do funcionário com a resposta
        }
        resetItens(); // Reseta os itens
        toast.add({
            severity: 'success',
            summary: t('title_sucess'),
            detail: t('delete_employee_product_sucess'),
            life: 3000
        });

        deleteProductDialog.value = false; // Fecha o diálogo de confirmação de exclusão de produto
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            detail: t('delete_employee_product_error'),
            life: 3000
        });
        console.error(error);
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const validarCampos = () => {
    // Declara uma função chamada validarCampos
    try {
        if (!selectedProduct.value.id_produto) {
            // Verifica se o ID do produto selecionado está vazio
            toast.add({
                severity: 'error',
                summary: t('title_error'),
                detail: t('employee_product_confirm'),
                life: 3000
            });
            return false;
        }

        if (!selectedProduct.value.quantidade || selectedProduct.value.quantidade <= 0) {
            // Verifica se a quantidade do produto é inválida
            toast.add({
                severity: 'error',
                summary: t('title_error'),
                detail: t('employee_product_qty'),
                life: 3000
            });
            return false;
        }

        return true; // Campos válidos
    } catch (error) {
        console.error(error); // Para depuração
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            detail: t('employee_product_fileds'),
            summary: t('title_error'),
            detail: t('employee_product_fileds'),
            life: 3000
        });
        return false;
    }
};
const hideDialog = () => {
    // Declara uma função chamada hideDialog
    itemDialog.value = false; // Define itemDialog como false para esconder o diálogo de item
    deleteProductDialog.value = false; // Define deleteProductDialog como false para esconder o diálogo de confirmação de exclusão de produto
};
</script>

<template>
    <div class="card vh">
        <Tabs v-model:value="active" :value="0">
            <TabList>
                <Tab value="0">{{ $t('employee_list') }}</Tab>
                <Tab value="1">{{ editVisible ? $t('edit_employee') : $t('add_employee') }}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <div class="col-12">
                        <DataTable
                            v-model:filters="filters"
                            :value="ListaFuncionarios"
                            selectionMode="single"
                            stripedRows
                            paginator
                            lazy
                            :totalRecords="totalRecords"
                            :rows="lazyParams.value?.rows || 10"
                            removableSort
                            :rowsPerPageOptions="[5, 10, 20, 50]"
                            dataKey="id"
                            :sortOrder="lazyParams.value?.sortOrder || 1"
                            :sortField="lazyParams.value?.sortField || 'nome'"
                            @filter="onFilterChange($event)"
                            @page="onPageChange($event)"
                            @sort="onSortChange($event)"
                            :globalFilterFields="['nome', 'matricula']"
                            :metaKeySelection="false"
                            @rowSelect="onRowSelect"
                        >
                            <template #header>
                                <div class="flex justify-content-between align-items-center mt-4">
                                    <div class="font-semibold">
                                        <span>{{ $t('total_records', { count: totalRecords }) }}</span>
                                    </div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText name="busca" v-model="filters['global'].value" :placeholder="t('search')" type="search" autocomplete="off" @input="debouncedFilterChange" />
                                    </IconField>
                                </div>
                            </template>
                            <template #empty> {{ t('no_employee') }} </template>
                            <Column field="nome" sortable :header="t('name')" class="col-6"></Column>
                            <Column field="matricula" sortable :header="t('employee_id')" class="col-6"></Column>
                        </DataTable>
                    </div>
                </TabPanel>
                <TabPanel value="1" v-model:activeIndex="active">
                    <div class="grid">
                        <div class="col-12">
                            <div class="mt-5">
                                <!--form de cadastro de novo funcionario-->
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="lg:col-8 md:col-6 sm:col-12">
                                        <label for="name">{{ t('name') }}:</label>
                                        <InputText class="my-2 w-full" v-model="funcionario.nome" id="name" type="text"> </InputText>
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="matricula">{{ t('employee_id') }}:</label>
                                        <InputText class="my-2 w-full" id="matricula" v-model="funcionario.matricula" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="senha">{{ t('password') }}:</label>
                                        <InputText type="password" class="my-2 w-full" id="senha" v-model="funcionario.senha" autocomplete="new-password" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="Hash">Hash 1:</label>
                                        <InputText class="my-2 w-full" disabled id="Hash" v-model="funcionario.biometria" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="Hash2">Hash 2:</label>
                                        <InputText class="my-2 w-full" disabled id="Hash2" v-model="funcionario.biometria2" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="DataAdmissao">{{ t('admission_date') }}:</label>
                                        <VueDatePicker class="my-2 w-full" v-model="funcionario.data_admissao" showIcon :showOnFocus="false" :format="format" :locale="locale" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="cpf">{{ t('ssn') }}:</label>
                                        <InputMask class="my-2 w-full" v-model="funcionario.CPF" id="cpf" :mask="$t('docmask')" :unmask="true" :invalid="!!errors.CPF" @blur="cpfvalidate" :autoClear="false" />
                                        <small v-if="errors.CPF" class="p-error">{{ errors.CPF }}</small>
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="rg">{{ t('identity_document') }}:</label>
                                        <InputMask class="my-2 w-full" id="rg" v-model="funcionario.RG" mask="99.999.999-*" :unmask="true" :autoClear="false" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="ctps">{{ t('work_card') }}:</label>
                                        <InputMask class="my-2 w-full" id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" :unmask="true" :autoClear="false" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="email">{{ t('email') }}:</label>
                                        <InputText class="my-2 w-full" id="email" v-model="funcionario.email" :invalid="!!errors.email"/>
                                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="perfil">{{ t('cost_center') }}:</label>
                                        <Select class="my-2 w-full" filter v-model="funcionario.id_centro_custo" :options="centroCustoOptions" optionLabel="label" optionValue="value" :placeholder="$t('select_center_cost')" ref="select1" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="planta">{{ t('factory') }}:</label>
                                        <Select filter class="my-2 w-full" v-model="funcionario.id_planta" :options="plantaOptions" optionLabel="label" optionValue="value" :placeholder="$t('select_factory')" ref="select2" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="setor">{{ t('sector') }}</label>
                                        <Select filter class="my-2 w-full" v-model="funcionario.id_setor" :options="setorOptions" optionLabel="label" optionValue="value" :placeholder="$t('select_sector')" @change="setorChange" ref="select3" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label class="ajustetexto" for="funcao">{{ t('function') }}:</label>
                                        <Select filter class="my-2 w-full" v-model="funcionario.id_funcao" :options="formatedHierarquiaOptions" optionLabel="label" optionValue="value" :placeholder="$t('select_function')" ref="select4" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="status">{{ t('status') }}:</label>
                                        <Select class="my-2 w-full" id="status" v-model="funcionario.status" :options="status" optionLabel="label" optionValue="value" :placeholder="$t('select_status')" ref="select5" />
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="inicio">{{ t('start_time') }}:</label>
                                        <VueDatePicker class="my-2 w-full" v-model="TempoInicio" time-picker disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>
                                    <div class="lg:col-4 md:col-6 sm:col-12">
                                        <label for="inicio">{{ t('end_time') }}:</label>
                                        <VueDatePicker class="my-2 w-full" id="inicio" v-model="TempoFim" time-picker disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>
                                    <!-- primeira parte do nested -->
                                    <div class="p-fluid formgrid grid nested-grid  lg:col-8 md:col-6 sm:4 p-0 pt-1">
                                        <Fieldset :legend="t('select_days_for_employee')" class="mt-5 text-center p-1 lg:col-12 md:col-12 sm:col-12 ">
                                            <label for="fim"></label>
                                            <div id="fim" class="checkbox-container flex align-content-end justify-content-end flex-wrap mx-4 mt-4">
                                                <div class="checkbox-items m-2 flex align-items-end">
                                                    <Checkbox v-model="funcionario.segunda" inputId="Segunda" name="Dias" value="Segunda" :binary="true" />
                                                    <label for="Segunda" class="ml-2"> {{ t('monday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.terca" inputId="Terca" name="Dias" value="Terca" :binary="true" />
                                                    <label for="Terca" class="ml-2"> {{ t('tuesday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.quarta" inputId="Quarta" name="Dias" value="Quarta" :binary="true" />
                                                    <label for="Quarta" class="ml-2"> {{ t('wednesday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.quinta" inputId="Quinta" name="Dias" value="Quinta" :binary="true" />
                                                    <label for="Quinta" class="ml-2"> {{ t('thursday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.sexta" inputId="Sexta" name="Dias" value="Sexta" :binary="true" />
                                                    <label for="Sexta" class="ml-2">{{ t('friday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.sabado" inputId="Sabado" name="Dias" value="Sabado" :binary="true" />
                                                    <label for="Sabado" class="ml-2"> {{ t('saturday') }} </label>
                                                </div>
                                                <div class="checkbox-items m-2 flex align-items-center">
                                                    <Checkbox v-model="funcionario.domingo" inputId="Domingo" name="Dias" value="Domingo" :binary="true" />
                                                    <label for="Domingo" class="ml-2">{{ t('sunday') }}</label>
                                                </div>
                                            </div>
                                        </Fieldset>
                                    </div>
                                    <div class="ml-4 lg:col-4 md:col-6 sm:col-12  p-0">
                                        <ImageUpload ref="imageUploader" @fileSelected="handleFileSelected" @clearImage="handleClearImage" :externalImages="imageUrl" />
                                    </div>
                                </div>
                                <div class="grid justify-content-end flex-wrap mt-8">
                                    <Button
                                        v-if="editVisible"
                                        style="width: 15%"
                                        class="buttons flex align-items-center justify-content-center m-2"
                                        :label="$t('save')"
                                        icon="pi pi-check"
                                        severity="primary"
                                        @click="atualizarFuncionario"
                                        :disabled="Mob"
                                    />
                                    <Button
                                        v-if="editVisible"
                                        style="width: 15%"
                                        class="buttons flex align-items-center justify-content-center m-2"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteFuncionarioDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button
                                        v-if="!editVisible"
                                        style="width: 15%"
                                        class="buttons flex align-items-center justify-content-center m-2"
                                        :label="$t('save')"
                                        icon="pi pi-check"
                                        severity="info"
                                        @click="adicionarFuncionario()"
                                        :disabled="Mob"
                                    />
                                </div>
                                <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                                <div class="col-12">
                                    <Tabs value="0" v-model:activeIndex="activeItens">
                                        <TabList>
                                            <Tab value="0">{{ t('sector_items') }}</Tab>
                                            <Tab value="1">{{ t('employee_items') }}</Tab>
                                        </TabList>
                                        <TabPanels>
                                            <TabPanel value="0">
                                                <DataTable
                                                    class=""
                                                    v-model:filters="filters"
                                                    :value="ListaItemsSetor"
                                                    stripedRows
                                                    paginator
                                                    removableSort
                                                    :rows="10"
                                                    :rowsPerPageOptions="[5, 10, 20, 50]"
                                                    :globalFilterFields="['nome', 'sku', 'qtd_limite']"
                                                    dataKey="sku"
                                                >
                                                    <template #header>
                                                        <div class="flex justify-content-end align-items-center mb-2">
                                                            <div>
                                                                <IconField iconPosition="left">
                                                                    <InputIcon>
                                                                        <i class="pi pi-search" />
                                                                    </InputIcon>
                                                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                                                </IconField>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #empty> {{ t('employee_itens_empty') }} </template>
                                                    <Column field="nome" sortable style="width: 45%" :header="t('name')"></Column>
                                                    <Column field="sku" sortable :header="t('sku')"></Column>
                                                    <Column field="qtd_limite" :header="t('quantity')"></Column>
                                                </DataTable>
                                            </TabPanel>
                                            <TabPanel value="1">
                                                <Button class="mt-3 justify-content-end" :label="t('add_items')" @click="abrirDialogAdicionarItem" />
                                                <DataTable
                                                    class="mt-3"
                                                    v-model:filters="filters"
                                                    :value="ListaProdutoFuncionario"
                                                    paginator
                                                    :rows="10"
                                                    :sortField="'sku'"
                                                    :rowsPerPageOptions="[5, 10, 20, 50]"
                                                    :globalFilterFields="['nome_produto', 'sku', 'quantidade']"
                                                    tableStyle="min-width: 50rem"
                                                    stripedRows
                                                    dataKey="id_item_funcionario"
                                                >
                                                    <template #header>
                                                        <div class="flex justify-content-end align-items-center mb-4">
                                                            <div>
                                                                <IconField iconPosition="left">
                                                                    <InputIcon>
                                                                        <i class="pi pi-search" />
                                                                    </InputIcon>
                                                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                                                </IconField>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #empty>{{ t('employee_itens_empty') }} </template>
                                                    <Column field="nome_produto" sortable style="width: 45%" :header="t('name')"></Column>
                                                    <Column field="sku" sortable :header="t('sku')"></Column>
                                                    <Column field="quantidade" :header="t('quantity')"></Column>
                                                    <Column style="min-width: 8rem">
                                                        <template #body="slotProps">
                                                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                                                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                                                        </template>
                                                    </Column>
                                                </DataTable>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="$t('item_edit')" :draggable="false" :modal="true" class="p-fluid">
            <hr class="p-0 m-0" />
            <div>
                <div class="formgrid grid">
                    <div class="field lg:col-9 md:col-6 sm:col-4">
                        <label class="mr-2" for="name">{{ t('name') }}:</label>
                        <InputText disabled class="w-full" v-model="selectedProduct.nome_produto" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-3 md:col-6 sm:col-4">
                        <label for="Quantidade">{{ t('quantity') }}</label>
                        <InputText id="Quantidade" class="w-full" v-model="selectedProduct.quantidade" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="$t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('save')" icon="pi pi-check" text @click="SalvarProduto" />
            </template>
        </Dialog>

        <Dialog v-model:visible="visible" :style="{ width: '450px' }" :modal="true" :draggable="false" :header="$t('add_employee_items')">
            <hr class="p-0 m-0" />
            <div>
                <div class="formgrid grid">
                    <div class="field lg:col-9 md:col-9 sm:col-12">
                        <label for="Produto" class="mr-2">{{ t('product') }}: </label>
                        <Select
                            v-model="selectedProduct.id_produto"
                            :options="ListaProdutosDisponiveis"
                            optionLabel="label"
                            :virtualScrollerOptions="{ itemSize: 30 }"
                            :filter="true"
                            :filterBy="'label'"
                            optionValue="value"
                            :placeholder="$t('select_product')"
                            class="w-full"
                        />
                    </div>
                    <div class="field lg:col-3 md:col-9 sm:col-12">
                        <label for="Quantidade" class="mr-2">{{ t('quantity') }}: </label>
                        <InputText variant="filled" class="w-full" id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3" autocomplete="off" required />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button type="button" :label="$t('cancel')" severity="secondary" @click="visible = false"></Button>
                <Button type="button" :label="$t('add')" @click="SalvarProduto"></Button>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :draggable="false" :style="{ width: '450px' }" :header="$t('dialog_delete_item')" :modal="true">
            <div class="confirmation-content">
                <span v-if="selectedProduct">
                    {{ t('dialog_delete_employee', { name: selectedProduct.nome_produto }) }}
                </span>
            </div>
            <template #footer>
                <Button :label="$t('no')" icon="pi pi-times" text @click="hideDialog()" />
                <Button :label="$t('yes')" icon="pi pi-check" text @click="deleteProduct()" />
            </template>
        </Dialog>
        <Dialog header="Deletar Funcionário" v-model:visible="deleteFuncionarioDialog" :draggable="false" style="width: 400px" :modal="true" :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class="">
                    {{ t('dialog_delete_item_confirm', { id: funcionario.id_funcionario, name: funcionario.nome }) }}
                </span>
            </div>
            <template #footer>
                <Button :label="$t('no')" icon="pi pi-times" @click="deleteFuncionarioDialog = false" class="p-button-text" />
                <Button :label="$t('yes')" icon="pi pi-check" @click="deleteFuncionario" class="p-button-text" />
            </template>
        </Dialog>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
<style>
.input-slot-image {
    height: 20px;
    width: auto;
    margin-left: 5px;
}

.p-error {
    color: red;
}

.ajustetexto {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    /* Garantir que o label se comporte corretamente dentro de um grid */
}

.checkbox-container {
    display: flex;
}

.checkbox-items {
    width: 40%;
    /* Metade da largura do contêiner para duas colunas */
    margin-bottom: 10px;
    /* Espaçamento entre as linhas */
}

.nested-grid {
    padding: 10px;
}

.p-fieldset-legend {
    display: flex;
}
</style>
