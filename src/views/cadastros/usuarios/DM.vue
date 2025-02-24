<script setup>
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue'; // Hooks do Vue.js
import { useAuthStore } from '@/store/authStore.js'; // Store para autenticação de usuário
import { FilterMatchMode } from 'primevue/api'; // Modo de filtro global para PrimeVue
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de loading
import { useDataStore } from '@/store/dataStore.js'; // Store para dados gerais
import {
    selectAll,
    desselectAll,
    configurarClienteSelecionado,
    handleControladoraChange as hcgHelper,
    mapControladoras as mapControladorasHelper,
    preencherOpcoesControladoras as pocHelper,
    validarAndarSelecionado as ValidarAndarHelper,
    preencherControladoraOptions as pcoHelper,
    ajustarContagemInicial as ContagemHelper,
    validarMudancaAndar,
    validarCampos as validarCamposHelper,
    updateTipoControladora as updateControladoraHelper,
    findControladora,
    updateProdutoSelecionado,
    prepareDMData,
    prepareItemDMData,
    FormatarListaCliente,
    isArmario
} from '@/helpers/DMHelper.js'; // Import the helper functions
import { normalizeDateTime, prepareListData } from '@/helpers/HelperUtils.js';
import { resetDMForm, resetProdutoSelecionado } from '@/helpers/formHelper.js';
import dmService from '@/services/dmService';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import ScrollTop from 'primevue/scrolltop';

//Store e Variaveis Reativas
const dataStore = useDataStore();
const store = useAuthStore();
const toast = useToast();
//controle de Loading
const loading = ref(false);
const loadingControladoras = ref(true);
//Objeto de DM
let DM = reactive({
    Ativo: false,
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
    Integracao: false,
    Numero: '',
    OP_Biometria: false,
    OP_Facial: false,
    OP_Senha: false,
    voucher: false,
    cracha: false,
    URL: '',
    Updated: '',
    UserID: '',
    Versao: '',
    Devolucao: false
});
// Mapeamento de valores
const nextValues = reactive({
    2018: { placa: 12 },
    2023: { dip: 2 },
    'Locker-Padrao': { dip: 2 },
    'Locker-Ker': { dip: 0 },
    2024: { placa: 101 }
});
const tipoControladoras = [
    { label: '2018', value: '2018' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: 'Locker Padrão', value: 'Locker-Padrao' },
    { label: 'Locker Ker', value: 'Locker-Ker' }
];
// Objeto de produto selecionado
const produtoSelecionado = ref({
    id_produto: '',
    Porta: '',
    Placa: '',
    Posicao: '',
    Andar: '',
    Dip: '',
    Motor1: '',
    Motor2: '',
    Controladora: '',
    Capacidade: 1
});
//Listas Reativas
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Identificacao', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
const ListaItens = ref([]);
const ListaClientes = ref([]);
const ListaProdutos = ref([]);
const Controladoras = ref([]);
const controladoraOptions = ref([]);
const molasOptions = ref([]);
const dipOptions = ref([]);
const andarOptions = ref([]);
const posicaoOptions = ref([]);
const placaOptions = ref([]);
const motorOptions = ref([]);
const ListaDMS = ref([]);
const controladoraRefs = ref([]);
// Controles de Estado
const totalRecords = ref(0);
const isEditMode = ref(false);
const showDialogProduto = ref(false);
const active = ref(0);
const showDialogDVM = ref(false);
const showDialogDItem = ref(false);
const showDialogControl = ref(false);
const show = ref(false);
const usarApi = ref(false);
const selectedClient = ref({ id_cliente: '', nome_cliente: '', usar_api: false });
const dialogMessage = ref('');
const selectedItem = ref(null);
const todosOption = { label: 'Todos', value: { id_cliente: '', nome_cliente: 'Todos', usar_api: false }, usar_api: false };
const operador = ref(false);
const visible = ref(false);
const currentPage = ref(1);
const debounceTimeout = ref(null);
const salvardados = ref(true);
const salvardadosMaquina = ref(true);
const supe = ref(false);
const dupe = ref(false);
// Propriedades Computadas
const tipoControladoraSelecionada = computed(() => {
    const controladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora);
    return controladora ? controladora.tipo : null;
});
const isArmarioSelecionado = computed(() => isArmario(tipo));
//Funções Ultilitárias
const validarCampos = () => {
    try {
        // Tenta validar os campos
        validarCamposHelper(produtoSelecionado.value, tipoControladoraSelecionada.value);
        return true;
    } catch (error) {
        // Captura o erro e exibe a mensagem no toast
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 });
        return false;
    }
};
const setRefs = (el) => {
    if (el) {
        controladoraRefs.value.push(el);
    }
};
const selectAllCliente = (index) => {
    selectAll(Controladoras.value[index]);
};
const desselectAllCliente = (index) => {
    desselectAll(Controladoras.value[index]);
};
const addControladora = () => {
    Controladoras.value.push({
        ID: null,
        tipo: '',
        deleted: false,
        dados: {}
    });
    setTimeout(() => {
        const ultimaControladora = controladoraRefs.value[controladoraRefs.value.length - 1];
        if (ultimaControladora) {
            ultimaControladora.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 100);
};
const updateTipoControladora = (index, tipo) => {
    try {
        updateControladoraHelper(index, tipo, Controladoras.value, nextValues);
    } catch (error) {
        console.log('Erro ao atualizar o tipo da controladora:', error);
        toast.add({ severity: 'warn', summary: t('title_error'), detail: error.message, life: 3000 });
        return;
    }
};
const admin = () => {
    return store.userRole === 'Administrador';
};
const voltar = () => {
    show.value = false;
    operador.value = false;
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await fetchDMS(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await fetchDMS(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await fetchDMS(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
//Funções de manipulaçao de estado
// Função para manipular mudanças na controladora selecionada
const handleControladoraChange = () => {
    hcgHelper(Controladoras.value, produtoSelecionado.value, ListaItens.value, isEditMode.value, { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions });
};

// Função para manipular mudanças no andar selecionado
const handleAndarChange = () => {
    validarMudancaAndar(Controladoras.value, produtoSelecionado.value, ListaItens.value, posicaoOptions);
};

// Função para validar o andar selecionado
const validarAndarSelecionado = () => {
    try {
        ValidarAndarHelper(produtoSelecionado);
    } catch (error) {
        toast.add({ severity: 'warn', summary: t('title_error'), detail: error.message, life: 3000 });
        console.error('Erro ao validar o andar selecionado:', error);
    }
};
//função para remoção de controladora
const removeControladora = (index) => {
    if (!DM.ID_DM) {
        Controladoras.value.splice(index, 1);
    } else {
        Controladoras.value[index].deleted = true;
    }
};
/**
 * Função chamada para cancelar a exclusão de um item.
 * Apenas fecha o diálogo sem realizar nenhuma ação.
 */
const cancelDelete = () => {
    showDialogDItem.value = false;
    showDialogDVM.value = false;
    showDialogControl.value = false;
    selectedItem.value = null;
};
function debounce(func, wait = 3000) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
const debouncedFilterChange = debounce(() => {
    onFilterChange();
}, 300);
/**
 * Função chamada ao selecionar uma linha de DM na tabela.
 * Preenche as informações relacionadas ao DM selecionado e suas controladoras.
 */
const onRowSelect = async (event) => {
    if (!event || !event.data) {
        console.error('Seleção inválida na tabela.');
        return;
    }
    try {
        // DM = {...event.data};
        Object.assign(DM, event.data);
        visible.value = true;
        await mapControladoras(DM);
        configurarCliente(DM);
        configurarVisibilidade();
    } catch (error) {
        console.error('Erro ao selecionar a DM:', error);
        loadingControladoras.value = false;
    }
};
/**
 * Função chamada ao selecionar uma linha de Produto na tabela.
 * Preenche as informações relacionadas ao Produto selecionado e suas controladoras.
 */
const handleRowSelection = async (event) => {
    const edit = event.data;
    isEditMode.value = true;
    showDialogProduto.value = true;
    //seto o produto para edição
    produtoSelecionado.value = {
        id_item: edit.id_item,
        id_produto: edit.id_produto,
        Nome_Produto: edit.Nome_Produto,
        QTD: edit.QTD,
        SKU: edit.SKU,
        Controladora: '',
        Capacidade: edit.Capacidade
    };
    // Extrai valores da posição
    const [controladora, ...valores] = edit.Posicao.split(' / ');

   // Busca pela controladora original
   const controladoraOriginal = findControladora(controladora, Number(valores[0]), Controladoras.value);
    if (controladoraOriginal) {
        produtoSelecionado.value.Controladora = controladoraOriginal.id;
    } else {
        console.warn('Controladora não encontrada para o tipo e identificador fornecidos.');
    }

    // Atualiza o produto selecionado com base no tipo de controladora
    updateProdutoSelecionado(produtoSelecionado.value, controladora, valores);
    await nextTick();
    handleControladoraChange();
};
//funções de  cancelar dialogo e limpeza de campos
const handleCancelar = () => {
    resetProdutoSelecionado(produtoSelecionado);
    isEditMode.value = false;
    showDialogProduto.value = false;
};
//Funções Principais
//DM
/**
 * Função para buscar as DMs através de uma requisição.
 * A requisição é ajustada de acordo com o tipo de usuário (admin ou não).
 */
const fetchDMS = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };

        const data = prepareListData(params);
        const response = await dmService.listarDMPaginado(data);
        ListaDMS.value = response.data.dmsArray; // Atualiza a lista de DMs com a resposta
        totalRecords.value = response.data.totalRecords; // Atualiza o total de registros
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_dm_list'), life: 3000 }); // Exibe uma mensagem de erro
        console.error('Erro ao carregar usuários:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Desativa o loading após a requisição
    }
};
 const validarDados = async () =>{
    const data ={
        UserID:DM.UserID,
        Chaveapi:DM.ChaveAPI,
        ClienteID:DM.ClienteID,
        URL:DM.URL,
    }
    if (!data.UserID || !data.Chaveapi || !data.ClienteID || !data.URL) {
        toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preencha todos os campos antes de validar.', life: 3000 });
        return; 
    }
    try {
        const response = await dmService.validarExternalData(data);
        
        if (response.data.success) {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Dados validados com sucesso!', life: 3000 });
        } else {
            toast.add({ severity: 'warn', summary: 'Falha na Validação', detail: response.data.message || 'Não foi possível validar os dados.', life: 3000 });
        }
    } catch (error) {
        console.error('Erro ao validar dados:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro ao validar os dados. Tente novamente.', life: 4000 });
    }
 }
const adicionarDM = async () => {
    loading.value = true;
    // const placaExists = Controladoras.value.some(controladora => controladora.dados.placa === DM.Placa);
    // if (placaExists) {
    //     toast.add({ severity: 'error', summary: 'Erro', detail: 'Placa já cadastrada', life: 3000 });
    //     loading.value = false;
    //     return;
    // }
    try {
        const data = prepareDMData('adicionar', DM, selectedClient.value, Controladoras.value);
        await dmService.adicionarDM(data);
        dataStore.invalidateDMCache();
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('dm_added_sucess'), life: 3000 });
        fetchDMS();
        active.value = 0;
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('dm_added_error'), life: 3000 });
        console.error('Erro ao adicionar DM:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
const atualizarDM = async () => {
    dataStore.invalidateDMCache();
    loading.value = true;
    const preparedControladoras = Controladoras.value.map((controladora) => ({
        ...controladora,
        ID: controladora.ID || null
    }));

    const data = prepareDMData('atualizar', DM, selectedClient, preparedControladoras);
    try {
        await dmService.atualizarDM(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('dm_update_sucess'), life: 3000 });
        fetchDMS();
        active.value = 0;
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('dm_update_error'), life: 3000 });
        console.error('Erro ao atualizar DM:', error);
    } finally {
        loading.value = false;
    }
};
/**
 * Função chamada quando o usuário deseja excluir uma DM.
 * Exibe o diálogo de confirmação de exclusão com a mensagem personalizada.
 */
const deleteDM = async (item) => {
    dialogMessage.value = `Você tem certeza que deseja excluir a DM: ${item.Identificacao}?`;
    showDialogDVM.value = true;
    selectedItem.value = item;
};

const confirmdeleteDM = async () => {
    if (!selectedItem.value) return;
    console.log(selectedItem.value);
    const data = prepareDMData('deletar', selectedItem.value);
    try {
        showDialogDVM.value = false;
        loading.value = true;
        await dmService.deletarDM(data);
        dataStore.invalidateDMCache();
        toast.add({ severity: 'success', summary: 'Successful', detail: t('dm_delete_sucess'), life: 3000 });
        await fetchDMS();
    } catch (error) {
        if (error.response && (error.response.status === 500 || error.response.status === 401)) {
            toast.add({ severity: 'error', summary: 'Error', detail: t('dm_delete_error'), life: 3000 });
        }
    } finally {
        loading.value = false; // Desativa o loading
        selectedItem.value = null; // Reseta o item selecionado
    }
};

/**
 * Função para mapear as controladoras do DM.
 * Preenche as informações relacionadas às controladoras e ajusta a contagem inicial de valores.
 */
const mapControladoras = async (dm) => {
    Controladoras.value = await mapControladorasHelper(dm);
    ajustarContagemInicial();
};
/**
 * Função para preencher as opções de controladoras disponíveis para seleção.
 */
const preencherControladoraOptions = () => {
    controladoraOptions.value = pcoHelper(Controladoras.value);
};
/**
 * Função para ajustar a contagem inicial dos valores das controladoras com base nas existentes.
 */
const ajustarContagemInicial = () => {
    ContagemHelper(Controladoras.value, nextValues);
};
/**
 * Função para preencher as opções de controladoras, incluindo molas, dips, andares, posições e motores.
 */
const preencherOpcoesControladoras = () => {
    pocHelper(Controladoras.value, { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions });
};
const getTooltipText = (data) => {
    if (data.modelo === '2018') {
        return t('controller_2018');
    } else if (data.modelo === '2023') {
        return t('controller_2023');
    } else {
        return t('default_controller');
    }
};
const configurarVisibilidade = () => {
    if (!admin()) {
        show.value = true;
        fetchItemDM();
        loadData(); //o listarProduto estava dando erro, trocar aqui caso haja algum comportamento estranho na listagem de produtos
        preencherOpcoesControladoras();
        preencherControladoraOptions();
        operador.value = true;
    } else {
        active.value = 1;
    }
};
//Produto
const adicionarProduto = async () => {
    if (!validarCampos()) {
        return; //se falhar não continua
    }

    const data = prepareItemDMData('adicionar', DM, produtoSelecionado, Controladoras);
    try {
        loading.value = true;
        await dmService.adicionarItem(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_added_sucess'), life: 3000 });
        showDialogProduto.value = false;
        resetProdutoSelecionado(produtoSelecionado);
        fetchItemDM();
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_added_error'), life: 3000 });
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
// Função para atualizar o produto selecionado
const atualizarProduto = async () => {
    const data = prepareItemDMData('atualizar', DM, produtoSelecionado, Controladoras);
    try {
        loading.value = true;
        await dmService.atualizarProduto(data);
        showDialogProduto.value = false;
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_update_sucess'), life: 3000 });
        resetProdutoSelecionado(produtoSelecionado);
        fetchItemDM();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_update_error'), life: 3000 });
    } finally {
        loading.value = false;
        isEditMode.value = false;
    }
};
/**
 * Função chamada quando o usuário deseja excluir um item.
 * Exibe o diálogo de confirmação de exclusão com a mensagem personalizada.
 */
const deleteItem = async (item) => {
    dialogMessage.value = t('confirm_delete_item', { product: item.Nome_Produto });
    showDialogDItem.value = true;
    selectedItem.value = item;
};

/**
 * Função chamada para confirmar a exclusão do item.
 * Realiza a requisição para excluir o item e atualiza a lista de itens.
 */
const confirmDeleteItem = async () => {
    if (!selectedItem.value) return;
    console.log(selectedItem.value);
    try {
        showDialogDItem.value = false;
        loading.value = true;
        const data = prepareItemDMData('deletar', DM, selectedItem);
        await dmService.deletarItem(data);
        // Atualiza a lista de itens após exclusão
        fetchItemDM();

        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_delete_sucess'), life: 3000 });
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_delete_error'), life: 3000 });
    } finally {
        loading.value = false;
        selectedItem.value = null;
    }
};
//Cliuentes
const fetchCliente = async () => {
    loading.value = true;
    try {
        const response = await dmService.listarClientes();
        ListaClientes.value = [todosOption, ...FormatarListaCliente(response.data)];
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_client_list'), life: 3000 });
        console.error('Erro ao carregar clientes:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
/**
 * Função para configurar as informações do cliente selecionado a partir do DM.
 * Mapeia o cliente para as opções de uso de API.
 */
const configurarCliente = () => {
    const cliente = ListaClientes.value.find((c) => c.value.id_cliente === DM.id_cliente);
    if (cliente) {
        selectedClient.value = cliente; // Agora `selectedClient` terá a estrutura correta
        usarApi.value = cliente.value.usar_api;
    } else {
        console.warn('Cliente não encontrado na ListaClientes:', DM.id_cliente);
    }
};
//Geral
/**
 * Função para carregar os itens associados ao DM.
 * Realiza uma requisição para listar os itens e os exibe na interface.
 */
const fetchItemDM = async () => {
    loading.value = true;
    try {
        const data = prepareItemDMData('listar', DM);
        const response = await dmService.fetchItemDM(data);
        ListaItens.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_client_dm_iten_list'), life: 3000 });
        console.error('Erro ao carregar Itens:', error);
    } finally {
        loading.value = false;
    }
};
const loadData = async () => {
    loading.value = true;
    try {
        const produtos = dataStore.produtos || (await dataStore.fetchProdutos());
        ListaProdutos.value = produtos
            .filter(({ codigo, label }) => !(codigo === null && label === 'Todos')) // Remove o item com valor null e label "Todos"
            .map(({ value, codigo, label }) => ({
                label: `${codigo} | ${label}`,
                value: value
            }))
            .sort((a, b) => {
                const codigoA = parseInt(a.label.split(' | ')[0], 10); // Converte para número
                const codigoB = parseInt(b.label.split(' | ')[0], 10); // Converte para número
                return codigoA - codigoB; // Ordem crescente
            });
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 });
        console.error('Erro ao carregar dados iniciais:', error);
    } finally {
        loading.value = false;
    }
};
const handleSalvarDadosChange = () => {
    if (!salvardados.value) {
        supe.value = false;
        dupe.value = false;
    }
};
watch(
    () => DM.ID_Cliente,
    (newClienteId) => {
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);
        if (client) {
            selectedClient.value = { ...client.value }; // Atualiza selectedClient com o cliente selecionado
            usarApi.value = client.value.usar_api ?? false; // Verifica se usar_api é nulo e define como false
        } else {
            usarApi.value = false; // Define usarApi como false se o cliente não for encontrado
        }
    }
);
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetDMForm(DM, Controladoras, selectedClient, nextValues);
        //fetchDMS();
        visible.value = false;
    }
});
watch(
    () => filters.value.global.value, // Observa mudanças no valor do filtro global
    (newValue, oldValue) => {
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value); // Limpa o timeout anterior
        }

        // Espera 1 segundo após a digitação
        debounceTimeout.value = setTimeout(() => {
            fetchDMS(currentPage.value); // Carrega os produtos com o filtro atualizado
        }, 1000); // Tempo de espera de 1000ms (1 segundo)
    },
    { immediate: true } // Executa a função de busca imediatamente ao observar a mudança
);
onMounted(async () => {
    await loadData();
    await fetchCliente();
    await fetchDMS();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h4 class="my-6 ml-2">{{ t('dispenser_machines') }}</h4>
                <TabView v-model:activeIndex="active" v-if="!show">
                    <TabPanel :header="$t('dispenser_machine_list')">
                        <div class="col-12">
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaDMS"
                                stripedRows
                                removableSort
                                paginator
                                lazy
                                :totalRecords="totalRecords"
                                :rows="lazyParams.value?.rows || 10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['Numero', 'Identificacao', 'ClienteNome', 'local', 'Updated']"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="onRowSelect"
                                :sortOrder="lazyParams.value?.sortOrder || 1"
                                :sortField="lazyParams.value?.sortField || 'Identificacao'"
                                @filter="onFilterChange($event)"
                                @page="onPageChange($event)"
                                @sort="onSortChange($event)"
                            >
                                <template #header>
                                    <div class="flex justify-content-between align-items-center">
                                        <div class="flex justify-content-start">
                                            <span>{{ $t('total_records', { count: totalRecords }) }}</span>
                                        </div>
                                        <div>
                                            <IconField iconPosition="left">
                                                <InputIcon>
                                                    <i class="pi pi-search" />
                                                </InputIcon>
                                                <InputText v-model="filters['global'].value" :placeholder="t('search')" @input="debouncedFilterChange" />
                                            </IconField>
                                        </div>
                                    </div>
                                </template>
                                <template #empty>{{ $t('no_dm_added') }} </template>
                                <Column field="Identificacao" sortable :header="t('identification')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
                                    </template></Column
                                >
                                <Column field="Numero" sortable :header="t('number')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.Numero">{{ data.Numero }}</span>
                                    </template>
                                </Column>

                                <Column field="ClienteNome" sortable :header="t('client')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.ClienteNome">{{ data.ClienteNome }}</span>
                                    </template></Column
                                >
                                <Column field="local" sortable :header="t('station')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.local">{{ data.local }}</span>
                                    </template></Column
                                >
                                <Column field="Ativo" sortable style="width: 9%; text-align: center" :header="t('active')">
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="Updated" style="width: 15%" sortable :header="t('updated')">
                                    <template #body="{ data }">
                                        {{ normalizeDateTime(data.Updated, true) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem" v-if="admin()">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteDM(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel :header="visible ? $t('edit_dispenser_machine') : $t('add_dispenser_machine')" v-if="admin()">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">{{ t('client') }}:</label>
                                <Dropdown class="my-2" v-model="selectedClient" :options="ListaClientes" optionLabel="label" optionValue="value" :placeholder="t('select_one')" />
                            </div>

                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="indetificacao">{{ t('dm_identification') }}:</label>
                                <InputText class="my-2" v-model="DM.Identificacao" id="indetificacao" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="numero">{{ t('dm_number') }}:</label>
                                <InputText class="my-2" v-model="DM.Numero" id="numero" />
                            </div>
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">{{ t('dm_active') }}</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Ativo" inputId="switch2" />
                                    <span class="ml-2">{{ DM.Ativo ? $t('yes') : $t('no') }}</span>
                                </div>
                            </div>
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch3">{{ t('dm_return') }}</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Devolucao" inputId="switch3" />
                                    <span class="ml-2">{{ DM.Devolucao ? $t('yes') : $t('no') }}</span>
                                </div>
                            </div>
                        </div>

                        <panel :header="$t('dm_options')" class="mt-4">
                            <div class="grid mt-5 mx-0 p-fluid">
                                <!-- Painel Configuração da Máquina -->
                                <div class="col-12 md:col-6">
                                    <panel header="Opções de Retirada">
                                        <div id="fim" class="flex flex-column gap-3 mt-3">
                                            <div class="flex align-items-center">
                                                <Checkbox v-model="DM.voucher" inputId="Voucher" :binary="true" />
                                                <label for="Voucher" class="ml-2"> {{ t('voucher') }} </label>
                                            </div>
                                            <div class="flex align-items-center">
                                                <Checkbox v-model="DM.cracha" inputId="cracha" :binary="true" />
                                                <label for="cracha" class="ml-2"> {{ t('badge') }} </label>
                                            </div>
                                            <div class="flex align-items-center">
                                                <Checkbox v-model="DM.OP_Biometria" inputId="Biometria" :binary="true" />
                                                <label for="Biometria" class="ml-2"> {{ t('biometric_reader') }} </label>
                                            </div>
                                            <div class="flex align-items-center">
                                                <Checkbox v-model="DM.OP_Facial" inputId="Facial" :binary="true" />
                                                <label for="Facial" class="ml-2">{{ t('facial_recognition') }}</label>
                                            </div>
                                            <div class="flex align-items-center">
                                                <Checkbox v-model="DM.OP_Senha" inputId="Senha" :binary="true" />
                                                <label for="Senha" class="ml-2"> {{ t('password') }} </label>
                                            </div>
                                        </div>
                                    </panel>
                                </div>

                                <!-- Painel Opções de Retirada -->
                                <div class="col-12 md:col-6">
                                    <panel header="Config Maquina">
                                        <div class="flex flex-column gap-3 mt-3">
                                            <div class="flex align-items-center flex-column">
                                                <label for="switch4" class="mt-0 text-nowrap"> deseja salvar dados de Funcionarios</label>
                                                <div class="grid mt-3">
                                                    <InputSwitch class="mr-2" v-model="salvardados" inputId="switch4" @change="handleSalvarDadosChange"/>
                                                    <span class="ml-2">{{ salvardados ? $t('yes') : $t('no') }}</span>
                                                </div>
                                            </div>

                                            <div class="flex flex-column gap-3">
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="supe" inputId="supe" :binary="true" :disabled="!salvardados" />
                                                    <label for="supe" class="ml-2"> Nome Funcionario </label>
                                                </div>
                                                <div class="flex align-items-center">
                                                    <Checkbox v-model="dupe" inputId="dupe" :binary="true" :disabled="!salvardados"/>
                                                    <label for="dupe" class="ml-2"> Numero de Matricula </label>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="flex flex-column gap-3">
                                                <div class="flex align-items-center flex-column">
                                                <label for="switch4" class="mt-0 text-nowrap"> deseja salvar dados de Maquina</label>
                                                <div class="grid mt-3">
                                                    <InputSwitch class="mr-2" v-model="salvardadosMaquina" inputId="switch4"/>
                                                    <span class="ml-2">{{ salvardadosMaquina ? $t('yes') : $t('no') }}</span>
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                    </panel>
                                </div>
                            </div>
                        </panel>

                        <div v-if="selectedClient.usar_api" class="mt-5 mx-auto p-fluid grid">
                            <div class="full flex align-items-start xl:col-12 lg:col-12 md:col-6 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Integracao" inputId="switch3" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="userapi">{{ t('userid_api') }}</label>
                                <InputText class="my-2" id="userapi" v-model="DM.UserID" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senhaapi">{{ t('api_password') }}</label>
                                <InputText class="my-2" id="senhaapi" v-model="DM.ChaveAPI" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="clienteAPI">{{ t('idclient_api') }}</label>
                                <InputText class="my-2" id="clienteAPI" v-model="DM.ClienteID" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="urlapi">{{ t('url_api') }}</label>
                                <InputText class="my-2" id="urlapi" v-model="DM.URL" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-6">
                                <label for="codigo">{{ t('key') }}</label>
                                <Textarea v-model="DM.Chave" class="my-2 overflow-hidden" style="min-height: 50px; min-width: 450px" inputClass="w-full" rows="2" cols="30" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-6">
                                <label for="validar">{{ t('validate_external_data') }}</label>
                                <Button class="mt-4" icon="pi pi-check" :label="t('validate_external_data_text')" @click="validarDados" />
                            </div>
                        </div>
                        <Button class="mt-7" icon="pi pi-plus" :label="t('new_controller')" @click="addControladora" />

                        <div>
                            <div v-for="(controladora, index) in Controladoras" :key="index" class="mt-5 card" v-show="!DM.ID_DM || !controladora?.deleted" :ref="setRefs">
                                <div class="flex justify-content-between flex-wrap">
                                    <h5>{{ $t('controller_number', { number: index + 1 }) }}</h5>

                                    <!-- Botão de Remoção -->
                                    <Button icon="pi pi-trash" :label="$t('remove')" class="p-button-danger" @click="removeControladora(index)" />
                                </div>

                                <div class="field mt-3 col-12">
                                    <label class="mr-3">{{ t('model') }} </label>
                                    <Dropdown
                                        class=""
                                        style="width: 250px"
                                        v-model="controladora.tipo"
                                        optionLabel="label"
                                        optionValue="value"
                                        :options="tipoControladoras"
                                        :placeholder="$t('select_controller')"
                                        @change="updateTipoControladora(index, controladora.tipo)"
                                    />
                                </div>

                                <!<!-- Controladora 2018 -->
                                <div class="" v-if="controladora.tipo === '2018'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">{{ t('board') }}: </label>
                                        <InputText class="" style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>

                                    <fieldset class="field card mt-4">
                                        <legend>{{ t('spring') }}</legend>

                                        <div class="checkbox-group mt-3" style="text-align: center">
                                            <div v-for="i in 10" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.molas" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                        </div>
                                    </fieldset>
                                </div>

                                <!-- Controladora 2023 -->
                                <div v-if="controladora.tipo === '2023'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="card mt-5">
                                        <div class="field mt-3">
                                            <h4>{{ t('level_floor') }}:</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 6" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.andar" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="field mt-6">
                                            <h4>{{ t('position') }}</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 15" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Controladora 2024 -->
                                <div v-if="controladora.tipo === '2024'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">{{ t('board') }}: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">{{ t('motor') }}: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.motor" />
                                    </div>
                                </div>

                                <!-- Controladora Locker -->
                                <div v-if="controladora.tipo === 'Locker-Padrao'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>{{ t('position') }}</h4>
                                        <div class="checkbox-group">
                                            <div v-for="i in 20" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>
                                <div v-if="controladora.tipo === 'Locker-Ker'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">{{ t('dip') }}: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>{{ t('position') }}</h4>
                                        <div class="checkbox-group">
                                            <div v-for="i in 12" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" :label="$t('select_all')" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" :label="$t('deselect')" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button v-if="!visible" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarDM" class="full mt-4 mr-2" />
                            <Button v-if="visible" :label="$t('save')" icon="pi pi-check" severity="info" @click="atualizarDM" class="full mt-4 mr-2" />
                        </div>
                    </TabPanel>
                </TabView>
                <div class="card" v-if="operador">
                    <div class="mx-0 grid">
                        <div class="col-12">
                            <div class="flex mt-5 justify-content-between">
                                <h5>{{ t('itens_dms') }}</h5>
                                <Button :label="$t('add_items')" @click="showDialogProduto = true" />
                            </div>
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaItens"
                                rowGroupMode="subheader"
                                groupRowsBy="modelo"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['SKU', 'Nome_Produto', 'Posicao', 'QTD']"
                                stripedRows
                                removableSort
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="handleRowSelection"
                                paginator
                                :rows="10"
                                :sortOrder="1"
                                :sortField="'Posicao'"
                            >
                                <template #header>
                                    <div class="flex justify-content-between mt-4">
                                        <div class="font-semibold">
                                            <span>{{ $t('total_records', { count: ListaItens.length }) }}</span>
                                        </div>
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                        </IconField>
                                    </div>
                                </template>

                                <template #empty> {{ t('no_added_item') }} </template>

                                <Column field="SKU" style="width: 9%" sortable :header="t('sku')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.SKU">{{ data.SKU }}</span>
                                    </template>
                                </Column>
                                <Column field="Nome_Produto" sortable style="width: 30%" :header="t('product')">
                                    <template #body="{ data }">
                                        <span class="tooltip-target" v-tooltip="data.Nome_Produto">{{ data.Nome_Produto }}</span>
                                    </template></Column
                                >
                                <Column field="Posicao" sortable style="width: 40%" :header="t('position')">
                                    <template #body="{ data }">
                                        <span v-tooltip="getTooltipText(data)">
                                            {{ data.Posicao }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="QTD" sortable style="width: 9%" :header="t('quantity_short')"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" v-tooltip="{ value: $t('delete_product'), showDelay: 1000, hideDelay: 300 }" />
                                    </template>
                                </Column>
                                <template #groupheader="slotProps">
                                    <div class="flex align-items-center text-3xl gap-2">
                                        <span v-tooltip="$t('controller_model')">
                                            {{ slotProps.data.modelo }}
                                        </span>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <Button class="m-1" :label="$t('back')" @click="voltar()" />
                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <Dialog class="" :header="isEditMode ? $t('edit_product') : $t('add_product')" :visible.sync="showDialogProduto" :modal="true" :closable="false" :draggable="false">
        <div class="box card">
            <div class="grid">
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Produto" class="font-semibold">{{ t('product') }}:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown
                        v-model="produtoSelecionado.id_produto"
                        class="w-full"
                        removableSort
                        :options="ListaProdutos"
                        :virtualScrollerOptions="{ itemSize: 30 }"
                        :filter="true"
                        :filterBy="'label'"
                        v-model:filters="filters"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="t('select_product')"
                    />
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">{{ t('controller') }}:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions" @change="handleControladoraChange" :placeholder="$t('controller_select')" />
                </div>
                <!-- Exibir campos dependendo do tipo de controladora -->
                <template v-if="tipoControladoraSelecionada === '2018'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('board') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Placa" class="w-full" :options="placaOptions" optionLabel="label" optionValue="value" :placeholder="$t('board_select')" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="molas" class="font-semibold">{{ t('spring') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="molasOptions" optionLabel="label" optionValue="value" :placeholder="$t('spring_select')" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2023'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('dip') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" :placeholder="$t('dip_select')" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Andar" class="font-semibold">{{ t('level_floor') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions" optionLabel="label" optionValue="value" :placeholder="$t('floor_select')" @change="handleAndarChange" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">{{ t('position') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" :placeholder="$t('position_select')" @change="validarAndarSelecionado" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">{{ t('motor') }}:</label>
                    </div>
                    <div class="lg:col-8 md:c ol-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions" optionLabel="label" optionValue="value" :placeholder="$t('motor_select')" />
                    </div>
                </template>

                <template v-if="isArmario(tipoControladoraSelecionada)">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">{{ t('dip') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" :placeholder="$t('dip_select')" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">{{ t('position') }}:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" :placeholder="$t('position_select')" />
                    </div>
                </template>
                <div v-if="tipoControladoraSelecionada" class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Capacidade" class="font-semibold">{{ t('capacity') }}:</label>
                </div>
                <div v-if="tipoControladoraSelecionada" class="lg:col-8 md:col-8 sm:col-8 justify-content-end flex">
                    <InputNumber inputId="Capacidade" :disabled="tipoControladoraSelecionada === 'Locker-Padrao' || tipoControladoraSelecionada === 'Locker-Ker'" class="w-full" v-model="produtoSelecionado.Capacidade" :mask="1" aria-describedby="username-help" :suffix="$t('capacity_suffix')"/>
                </div>
            </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
            <Button type="button" :label="$t('cancel')" severity="secondary" @click="handleCancelar()"></Button>
            <Button type="button" :label="isEditMode ? $t('update') : $t('save')" @click="isEditMode ? atualizarProduto() : adicionarProduto()"></Button>
        </div>
    </Dialog>
    <Dialog :header="$t('dialog_delete_item')" :visible.sync="showDialogDItem" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="OK" icon="pi pi-check" @click="confirmDeleteItem" />
        </template>
    </Dialog>
    <Dialog :header="$t('dialog_delte_dm')" :visible.sync="showDialogDVM" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="Sim" icon="pi pi-check" @click="confirmdeleteDM" />
        </template>
    </Dialog>
    <Dialog header="Deletar Controladora" :visible.sync="showDialogControl" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="Sim" icon="pi pi-check" @click="confirmdeleteControl" />
        </template>
    </Dialog>
    <ScrollTop />
</template>

<style scoped>
@media (max-width: 768px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }

    .box {
        width: 50vw;
    }
}

@media (min-width: 769px) {
    .box {
        width: 40vw;
    }
}

@media (min-width: 900px) {
    .box {
        width: 30vw;
    }

    .card {
        overflow: hidden;
        /* Ensure content doesn't overflow */
        box-sizing: border-box;
        /* Include padding and border in element's total width and height */
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
}
/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
