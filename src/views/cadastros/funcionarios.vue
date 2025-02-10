<script setup>
// Importando funções e objetos do Vue.js para usar no componente
import { reactive, ref, onMounted, watch , computed} from 'vue';
// Importando a função 'useToast' para exibir notificações de sucesso ou erro
import { useToast } from 'primevue/usetoast';
// Importando o estilo do componente de data picker
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
// Importando o objeto 'FilterMatchMode' do PrimeVue para configurar os filtros de pesquisa
import { FilterMatchMode } from 'primevue/api';
// Importando a imagem de placeholder que será usada caso não haja imagem para um produto
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
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
import * as formatservices from '@/helpers/HelperUtils.js';
// Importando funções de ajuda relacionadas ao formulário do funcionarios
import {resetFuncionarioForm,resetItens as resetProduto} from '@/helpers/formHelper.js';
import { validadorcpf, validadoremail,validateForm } from '@/helpers/HelperFuncionario.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const store = useAuthStore();// Acessa o store de autenticação para obter dados sobre o usuário logado

const dataStore = useDataStore();// Acessa o store de dados para obter informações sobre plantas e outros dados

const toast = useToast(); // Função para exibir notificações via toast
const selectedFile = ref(null);
const handleFileSelected = (file) => {
    selectedFile.value = file;
};

// Cria uma referência reativa para armazenar erros, inicialmente vazia.
const errors = ref({}); 

// Cria uma referência reativa para armazenar o status do funcionário, com duas opções: 'Ativo' e 'Inativo'.
const status  = computed(() => [
    { label: t('active'), value: 'Ativo' },   // Opção de status 'Ativo'.
    { label: t('inactive'), value: 'Inativo' } // Opção de status 'Inativo'.
]);
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'nome', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {}, // Filtros aplicados
});
//IMAGEM
const imageUploader = ref(null);

/**
 * Cria uma referência reativa para armazenar o URL da imagem, inicializada com uma imagem placeholder.
 * @type {string} O valor inicial é o caminho da imagem placeholder.
 */
const imageUrl = ref(imagePlaceholder);

// Cria uma referência reativa para armazenar os centros de custo, inicialmente um array vazio.
let centroCusto = ref([]);

// Cria uma referência reativa para armazenar os setores, inicialmente um array vazio.
let setor = ref([]);

// Cria uma referência reativa para armazenar as opções de hierarquia, inicialmente um array vazio.
let hieraquiaoptions = ref([]);

// Cria uma referência reativa para armazenar as opções de hierarquia formatadas, inicialmente um array vazio.
let formatedHierarquiaOptions = ref([]);

// Cria uma referência reativa para armazenar as plantas, inicialmente um array vazio.
let plantas = ref([]);

/**
 * Cria um objeto reativo para armazenar os dados de um funcionário, com as propriedades iniciais.
 * 
 * @type {Object}
 */
let funcionario = reactive({
    id_funcionario: '',     // ID do funcionário.
    matricula: '',          // Matrícula do funcionário.
    senha: '',              // Senha do funcionário.
    nome: '',               // Nome do funcionário.
    biometria: '',          // Primeira digital do funcionário.
    biometria2: '',         // Segunda digital do funcionário.
    data_admissao: null,    // Data de admissão do funcionário.
    CPF: '',                // CPF do funcionário.
    RG: '',                 // RG do funcionário.
    CTPS: '',               // CTPS (Carteira de Trabalho e Previdência Social) do funcionário.
    email: '',              // E-mail do funcionário.
    status: '',             // Status do funcionário, como 'Ativo' ou 'Inativo'.
    hora_inicial: '',       // Hora de início do expediente.
    hora_final: '',         // Hora de término do expediente.
    id_centro_custo: '',    // ID do centro de custo.
    id_funcao: '',          // ID da função.
    id_planta: '',          // ID da planta onde o funcionário está alocado.
    id_setor: '',           // ID do setor onde o funcionário está alocado.
    segunda: false,         // Se o funcionário trabalha na segunda-feira.
    terca: false,           // Se o funcionário trabalha na terça-feira.
    quarta: false,          // Se o funcionário trabalha na quarta-feira.
    quinta: false,          // Se o funcionário trabalha na quinta-feira.
    sexta: false,           // Se o funcionário trabalha na sexta-feira.
    sabado: false,          // Se o funcionário trabalha no sábado.
    domingo: false,         // Se o funcionário trabalha no domingo.
    nomearquivo: '',        // Nome do arquivo do funcionário (por exemplo, foto ou documento).
    itens: []               // Lista de itens relacionados ao funcionário.
});

// Cria uma referência reativa para armazenar a lista de produtos, inicialmente um array vazio.
const ListaProdutos = ref([]);

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
const Mob = ref(false)
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Configuração para o filtro global de busca.
});

// Cria uma referência reativa para armazenar o produto selecionado, com propriedades padrão vazias.
const selectedProduct = ref({
    id_produto: '',        // ID do produto selecionado.
    nome: '',              // Nome do produto selecionado.
    sku: '',               // SKU (Stock Keeping Unit) do produto selecionado.
    quantidade: 1          // Quantidade do produto selecionado, inicialmente configurada para 1.
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

// Cria uma referência reativa para armazenar o valor de "ativo", inicialmente configurado para 0.
const active = ref(0);

// Cria uma referência reativa para armazenar o valor de "itens ativos", inicialmente configurado para 0.
const activeItens = ref(0);
const totalRecords = ref(0); 

const loading = ref(false);

// Cria uma referência reativa para armazenar o dropdown 1, inicialmente configurado para `null` (não atribuído).
const dropdown1 = ref(null);

// Cria uma referência reativa para armazenar o dropdown 2, inicialmente configurado para `null` (não atribuído).
const dropdown2 = ref(null);

// Cria uma referência reativa para armazenar o dropdown 3, inicialmente configurado para `null` (não atribuído).
const dropdown3 = ref(null);

// Cria uma referência reativa para armazenar o dropdown 4, inicialmente configurado para `null` (não atribuído).
const dropdown4 = ref(null);

// Cria uma referência reativa para armazenar o dropdown 5, inicialmente configurado para `null` (não atribuído).
const dropdown5 = ref(null);

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

    // Define o valor de `active` como 1, provavelmente indicando que o funcionário está ativo no sistema.
    active.value = 1;

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
   await  loadFuncionarios(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
const loadFuncionarios = async (page = 1) => {
    const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters, // Filtros aplicados
        };
        const data = formatservices.prepareListData(params);
    try {
        // Define a referência reativa `loading.value` para `true` para indicar que os dados estão sendo carregados.
        loading.value = true;
        const response = await funcionarioService.listarFuncionariosPaginado(data);
        ListaFuncionarios.value = response.data.funcionarios;
        totalRecords.value = response.data.totalRecords

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
    () => filters.value.global.value,
    () => {
        filteredCount.value = ListaFuncionarios.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const adicionarFuncionario = async () => {
    try {
        loading.value = true;
        const { isValid, errors } = validateForm(funcionario);
        if(!isValid){
            throw new Error(t('employee_form_validation_error', { errors: JSON.stringify(errors) }));
        }
        await funcionarioService.adicionarFuncionario(funcionario, selectedFile.value);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_added'), life: 3000 });
        dataStore.invalidateFuncionariosCache();
        await loadFuncionarios();
        active.value = 0;
        resetForm();
        resetFuncionarioForm(funcionario);
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail:  error.message || t('employee_form_default_error'), life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};

const loadData = async () => {
    try {
        plantas = dataStore.plantas || (await dataStore.fetchPlantas());
        setor = dataStore.setores || (await dataStore.fetchSetores());
        centroCusto = dataStore.cdcs || (await dataStore.fetchCdc());
        const produtos = dataStore.produtos || (await dataStore.fetchProdutos());

        //excluindo a opção 'Todos' e obtendo os outros dados
        ListaProdutos.value = produtos.filter((produto) => produto.label !== 'Todos');
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
    }
};

const fetchItensSetor = async (id_setor) => {
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: id_setor
    };

    try {
        const response = await funcionarioService.fetchItensSetor(data);
        // Armazena os itens do setor em ListaItemsSetor
        ListaItemsSetor.value = response.data;

        listarProdutosDisponiveis();
    } catch (error) {}
};

const listarProdutosDisponiveis = () => {
    const addedIds = new Set(ListaItemsSetor.value.map((item) => item.id_produto));

    // Filtra os produtos disponíveis (da ListaProdutos) excluindo os que já estão no setor
    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...ListaProdutos.value.filter((produto) => !addedIds.has(produto.value)));
};

const fetchHieraquiaOptions = async () => {
    try {
        const response = await funcionarioService.fetchHieraquiaOptions();  
        hieraquiaoptions = response.data;
        formatedHierarquiaOptions = hieraquiaoptions.map((hieraquiaoptions) => ({
            label: ` ${hieraquiaoptions.id_funcao}`,
            value: hieraquiaoptions.id_funcao
        }));
    } catch (error) {}
};

watch(
    TempoInicio,
    (newTime) => {
        if (newTime) {
            funcionario.hora_inicial = formatservices.formatarTempo(newTime);
        } else {
            funcionario.hora_inicial = '';
        }
    },
    { deep: true }
);

watch(
    TempoFim,
    (newTime) => {
        if (newTime) {
            funcionario.hora_final = formatservices.formatarTempo(newTime);
        } else {
            funcionario.hora_final = '';
        }
    },
    { deep: true }
);

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        funcionario = reactive(resetFuncionarioForm());
        resetForm();
        resetItens();
        loadFuncionarios();
        editVisible.value = false;
    }
});

const resetTable = () => {
    activeItens.value = 0;
    resetItens();
};

const getImagem = async (filename) => {
    if (filename === '') {
        return imagePlaceholder;
    }
    try {
        const response = await funcionarioService.obterImagem(store.userIdCliente, filename);
        if (response.status === 200) {
        const { image, mimeType } = response.data;
        imageUrl.value = `data:${mimeType};base64,${image}`;
        }
    } catch (error) {
        return imagePlaceholder;
    }
};

onMounted(async () => {
    Mob.value = formatservices.isMobEnabled();
    await loadData();
    await loadFuncionarios();
    await fetchHieraquiaOptions();
    await fetchItensSetor();
});

const deleteFuncionario = async () => {
    let data = { id_funcionario: funcionario.id_funcionario, id_usuario: store.userId };
    try {
        loading.value = true;
        await funcionarioService.deleteFuncionario(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('deleted_employee_form_sucess'), life: 3000 });
        dataStore.invalidateFuncionariosCache();
        deleteFuncionarioDialog.value = false;
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('deleted_employee_form_error'), life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};

const resetForm = () => {
    funcionario.foto = null;
    imageUrl.value = imagePlaceholder;
    resetFuncionarioForm(funcionario);
    funcionario.itemsSelecionadosFuncionario = [];

    selectedFile.value = null;
    TempoInicio.value = null;
    TempoFim.value = null;
    imageUploader.value?.clearImageData();
    ListaItemsSetor.value = [];
    ListaProdutoFuncionario.value = [];
};

const resetItens = () => {
    resetProduto(selectedProduct)
};

const SalvarProduto = async () => {
    if (!validarCampos()) {
        return; //se falhar não continua
    }
    loading.value = true;
    try {
        const response = await funcionarioService.SalvarProduto(funcionario, selectedProduct);
        ListaProdutoFuncionario.value = [];
        ListaProdutoFuncionario.value = response.data.dados[0];
        visible.value = false;
        resetItens();
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_product_sucess'), life: 3000 });
        itemDialog.value = false;
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('employee_product_error'), life: 3000 });
    } finally {
        loading.value = false;
        
    }
};

const listarProdutosFiltrados = () => {
    const idsSetor = new Set(ListaItemsSetor.value.map((item) => item.id_produto)); //setor

    const idsAdicionados = new Set(ListaProdutoFuncionario.value.map((item) => item.id_produto)); //funcionario(datatable)

    const itensFiltrados = ListaProdutos.value.filter(
        (produto) => !idsSetor.has(produto.value) && !idsAdicionados.has(produto.value) //o restante
    );

    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...itensFiltrados); //atualizando a lista

    if (itensFiltrados.length === 0) {
        toast.add({
            severity: 'warn',
            summary: t('employee_no_availble_item'),
            detail: t('employee_no_more_availble'),
            life: 3000
        });
    }
};

const abrirDialogAdicionarItem = () => {
    listarProdutosFiltrados();
    visible.value = true; // Mostre o diálogo
};

const editItem = (selectedItem) => {
    selectedProduct.value = { ...selectedItem };
    itemDialog.value = true;
};

const atualizarFuncionario = async () => {
    try {
        loading.value = true;
        const { isValid, errors } = validateForm(funcionario);
        if(!isValid){
            throw new Error(t('employee_form_validation_error', { errors: JSON.stringify(errors) }));
        }
        await funcionarioService.atualizarFuncionario(funcionario, selectedFile);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('employee_update'), life: 3000 });
        dataStore.invalidateFuncionariosCache();
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary:t('title_error'), detail:  error.message||t('employee_update_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide();
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
};
const confirmDeleteProduct = (item) => {
    selectedProduct.value = { ...item };
    deleteProductDialog.value = true;
};
const deleteProduct = async () => {
    try {
        loading.value = true;
        const res = await funcionarioService.deleteProduct(funcionario, selectedProduct);
        if (res.data && res.data.items) {
            ListaProdutoFuncionario.value = res.data.items;
        }
        resetItens();
        toast.add({
            severity: 'success',
            summary: t('title_sucess'),
            detail: t('delete_employee_product_sucess'),
            life: 3000
        });

        deleteProductDialog.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            detail: t('delete_employee_product_error'),
            life: 3000
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const validarCampos = () => {
    try {
        if (!selectedProduct.value.id_produto) {
            toast.add({
                severity: 'error',
                summary: t('title_error'),
                detail: t('employee_product_confirm'),
                life: 3000
            });
            return false;
        }

        if (!selectedProduct.value.quantidade || selectedProduct.value.quantidade <= 0) {
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
            life: 3000
        });
        return false;
    }
};

const hideDialog = () => {
    itemDialog.value = false;
    deleteProductDialog.value = false;
};
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active" >
            <TabPanel :header="$t('employee_list')">
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
                        :sortOrder="lazyParams.value?.sortOrder||1"
                        :sortField="lazyParams.value?.sortField ||'nome'"
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
                                    <span>{{$t('total_records')}}:{{  totalRecords  }}</span>
                                </div>
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText name="busca" v-model="filters['global'].value" :placeholder="t('search')" type="search" autocomplete="off" />
                                </IconField>
                            </div>
                        </template>

                        <template #empty> {{t('no_employee')}} </template>

                        <Column field="nome" sortable :header="t('name')" class="col-6"></Column>
                        <Column field="matricula" sortable :header="t('employee_id')" class="col-6"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <TabPanel :header="editVisible ? t('edit_employee') : t('add_employee')" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <div class="full lg:col-8 md:col-6 sm:col-12">
                                    <label for="name">{{t('name')}}:</label>
                                    <InputText class="my-2" v-model="funcionario.nome" id="name" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="matricula">{{t('employee_id')}}:</label>
                                    <InputText class="my-2" id="matricula" v-model="funcionario.matricula" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="senha">{{t('password')}}:</label>
                                    <InputText type="password" class="my-2" id="senha" v-model="funcionario.senha" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash">Hash 1:</label>
                                    <InputText class="my-2" disabled id="Hash" v-model="funcionario.biometria" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash2">Hash 2:</label>
                                    <InputText class="my-2" disabled id="Hash2" v-model="funcionario.biometria2" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="DataAdmissao">{{t('admission_date')}}:</label>
                                    <VueDatePicker class="my-2" v-model="funcionario.data_admissao" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="cpf">{{t('ssn')}}:</label>
                                    <InputMask class="my-2" v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" 
                                    :unmask="true" :invalid="!!errors.CPF" @blur="cpfvalidate" :autoClear="false"/>
                                    <small v-if="errors.CPF" class="p-error">{{ errors.CPF }}</small>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="rg">{{t('identity_document')}}:</label>
                                    <InputMask class="my-2" id="rg" v-model="funcionario.RG" mask="99.999.999-*" :unmask="true" :autoClear="false"/>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="ctps">{{t('work_card')}}:</label>
                                    <InputMask class="my-2" id="ctps" v-model="funcionario.CTPS" 
                                    mask="9999999/9999" :unmask="true" :autoClear="false" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="email">{{t('email')}}:</label>
                                    <InputText class="my-2" id="email" v-model="funcionario.email" 
                                    :invalid="!!errors.email" @blur="validateEmail" />
                                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="perfil">{{t('cost_center')}}:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_centro_custo" 
                                    :options="centroCusto" optionLabel="label" optionValue="value" 
                                    :placeholder="$t('select_center_cost')" ref="dropdown1" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="planta">{{t('factory')}}:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_planta" :options="plantas" 
                                    optionLabel="label" optionValue="value"
                                    :placeholder="$t('select_factory')" ref="dropdown2" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="setor">{{t('sector')}}:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_setor" :options="setor" 
                                    optionLabel="label" optionValue="value" :placeholder="$t('select_sector')"
                                     @change="setorChange" ref="dropdown3" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label class="ajustetexto" for="funcao">{{t('function')}}:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_funcao" 
                                    :options="formatedHierarquiaOptions" optionLabel="label" optionValue="value"
                                     :placeholder="$t('select_function')" ref="dropdown4" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="status">{{t('status')}}:</label>
                                    <Dropdown class="my-2" id="status" v-model="funcionario.status" 
                                    :options="status" optionLabel="label" optionValue="value" 
                                    :placeholder="$t('select_status')" ref="dropdown5"></Dropdown>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="inicio">{{t('start_time')}}:</label>
                                    <VueDatePicker class="my-2" v-model="TempoInicio" time-picker disable-time-range-validation>
                                        <template #input-icon>
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="inicio">{{t('end_time')}}:</label>
                                    <VueDatePicker class="my-2" id="inicio" v-model="TempoFim" time-picker disable-time-range-validation>
                                        <template #input-icon>
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>
                                <!-- primeira parte do nested -->
                                <div class="p-fluid formgrid grid nested-grid lg:col-8 md:col-6 sm:4 p-0 pt-1">
                                    <Fieldset
                                        legend="Selecione os dias que o funcionário poderá retirar os
                                        Itens:"
                                        class="mt-5 p-1 lg:col-12 md:col-12 sm:col-12"
                                    >
                                        <label for="fim"></label>
                                        <div id="fim" class="checkbox-container flex align-content-end flex-wrap mx-4">
                                            <div class="checkbox-items m-2 flex align-items-end">
                                                <Checkbox v-model="funcionario.segunda" inputId="Segunda" name="Dias" value="Segunda" :binary="true" />
                                                <label for="Segunda" class="ml-2"> {{t('monday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.terca" inputId="Terca" name="Dias" value="Terca" :binary="true" />
                                                <label for="Terca" class="ml-2"> {{t('tuesday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quarta" inputId="Quarta" name="Dias" value="Quarta" :binary="true" />
                                                <label for="Quarta" class="ml-2"> {{t('wednesday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quinta" inputId="Quinta" name="Dias" value="Quinta" :binary="true" />
                                                <label for="Quinta" class="ml-2"> {{t('thursday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sexta" inputId="Sexta" name="Dias" value="Sexta" :binary="true" />
                                                <label for="Sexta" class="ml-2">{{t('friday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sabado" inputId="Sabado" name="Dias" value="Sabado" :binary="true" />
                                                <label for="Sabado" class="ml-2"> {{t('saturday')}} </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.domingo" inputId="Domingo" name="Dias" value="Domingo" :binary="true" />
                                                <label for="Domingo" class="ml-2">{{t('sunday')}}</label>
                                            </div>
                                        </div>
                                    </Fieldset>
                                </div>

                                <div class="full mx-auto lg:col-4 md:col-6 sm:col-12 ml-2 ml-2 p-0">
                                    <ImageUpload ref="imageUploader" @fileSelected="handleFileSelected" @clearImage="handleClearImage" :externalImages="imageUrl" />
                                </div>
                            </div>
                            <div class="grid justify-content-end flex-wrap mt-8">
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="$t('save')" icon="pi pi-check" severity="primary" @click="atualizarFuncionario" :disabled="Mob"/>
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="$t('delete')" icon="pi pi-trash" severity="danger" @click="deleteFuncionarioDialog = true" :disabled="Mob"/>

                                <Button v-if="!editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarFuncionario()" :disabled="Mob"/>
                            </div>
                            <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                            <div class="col-12">
                                <TabView v-model:activeIndex="activeItens">
                                    <TabPanel :header="t('sector_items')">
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
                                            <template #empty> {{t('employee_itens_empty')}} </template>
                                            <Column :field="nome" sortable style="width: 45%" :header="t('name')"></Column>
                                            <Column :field="sku" sortable :header="t('sku')"></Column>
                                            <Column :field="qtd_limite" :header="t('quantity')"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <TabPanel :header="t('employee_items')">
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
                                            <template #empty>{{t('employee_itens_empty')}} </template>
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
                                </TabView>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="$t('item_edit')" :draggable="false" :modal="true" class="p-fluid" >
            <div>
                <div class="p-fluid formgrid grid">
                    <div class="field lg:col-12 md:col-6 sm:col-4">
                        <label for="name">{{t('name')}}:</label>
                        <InputText disabled v-model="selectedProduct.nome_produto" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-4">
                        <label for="Quantidade">{{t('quantity')}}</label>
                        <InputText id="Quantidade" v-model="selectedProduct.quantidade" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="$t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('save')" icon="pi pi-check" text @click="SalvarProduto" />
            </template>
        </Dialog>

        <Dialog v-model:visible="visible" 
        :modal="true" 
        :draggable="false" 
        :header="$t('add_employee_items')">
            <div class="grid">
                <div class="col-12">
                    <label for="Produto" class="mr-2 font-semibold col-2">{{t('product')}}: </label>
                    <Dropdown 
                    v-model="selectedProduct.id_produto" :options="ListaProdutosDisponiveis" optionLabel="label" 
                    :virtualScrollerOptions="{ itemSize: 30 }"
                    :filter="true"
                    :filterBy="'label'"
                    optionValue="value" 
                    :placeholder="$t('select_product')" 
                    class="col-8 p-0" />
                </div>
                <div class="col-12">
                    <label for="Quantidade" class="font-semibold w-6rem mr-2">{{t('quantity')}}: </label>
                    <InputNumber variant="filled" id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" :label="$t('cancel')" severity="secondary" @click="visible = false"></Button>
                <Button type="button" :label="$t('add')" @click="SalvarProduto"></Button>
            </div>
        </Dialog>
        <Dialog v-model:visible="deleteProductDialog" :draggable="false" 
        :style="{ width: '450px' }" :header="$t('dialog_delete_item')" 
        :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedProduct.id_produto">
                    {{ t('dialog_delete_employee',{nome:selectedProduct.nome_produto}) }}
                  </span
                >
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
                    {{ t('dialog_delete_item_confirm',{id:funcionario.id_funcionario, name:funcionario.nome}) }}
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

.buttons {
    width: 100px;
}

@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
