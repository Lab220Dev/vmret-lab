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
    findControladora,prepareListData,
    updateProdutoSelecionado,prepareDMData,prepareItemDMData,FormatarListaCliente
} from '@/helpers/DMHelper.js'; // Import the helper functions
import { normalizeDateTime } from '@/helpers/HelperUtils.js';
import { resetDMForm, resetProdutoSelecionado } from '@/helpers/formHelper.js';
import dmService from '@/services/dmService';
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
    OP_Biometria: '',
    OP_Facial: '',
    OP_Senha: '',
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
    "Locker-Padrao": { dip: 3 },
    "Locker-Ker": { dip: 0 },
    2024: { placa: 101 }
});
const tipoControladoras = [
  { label: '2018', value: '2018' },
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: 'Locker Padrão', value: 'Locker-Padrao' },
  { label: 'Locker Ker', value: 'Locker-Ker' },
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
    Capacidade: ''
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
    filters: {}, // Filtros aplicados
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
// Propriedades Computadas
const tipoControladoraSelecionada = computed(() => {
    const controladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora);
    return controladora ? controladora.tipo : null;
});

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
        toast.add({ severity: 'warn', summary: 'Erro', detail: error.message, life: 3000 });
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
        toast.add({ severity: 'warn', summary: 'Erro', detail: `${error.message}`, life: 3000 });
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
    selectedItem.value = null;
};
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
        DM = {...event.data};
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
            filters: lazyParams.value.filters, // Filtros aplicados
        };

        const data = prepareListData(params)
        const response = await dmService.listarDMPaginado(data);
        ListaDMS.value = response.data.dmsArray; // Atualiza a lista de DMs com a resposta
        totalRecords.value = response.data.totalRecords; // Atualiza o total de registros
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar DMs', life: 3000 }); // Exibe uma mensagem de erro
        console.error('Erro ao carregar usuários:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Desativa o loading após a requisição
    }
};

const adicionarDM = async () => {
    loading.value = true;
    try {
        const data = prepareDMData('adicionar',DM,selectedClient.value,Controladoras.value)
        await dmService.adicionarDM(data);
        dataStore.invalidateDMCache();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'DM adicionada com sucesso', life: 3000 });
        fetchDMS();
        active.value = 0;
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar DM', life: 3000 });
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
    ID: controladora.ID || null,
}));
    const data = prepareDMData('atualizar',DM,selectedClient,preparedControladoras) 
    try {
        await dmService.atualizarDM(data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'DM atualizada com sucesso', life: 3000 });
        fetchDMS();
        active.value = 0;
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar DM', life: 3000 });
        console.error('Erro ao atualizar DM:', error);
    } finally {
        loading.value = false;
    }
};
const deleteDM = async (item) => {
    const data = prepareDMData('deletar',item)
    loading.value = true;
    try {
        await dmService.deletarDM(data);
        dataStore.invalidateDMCache();
        toast.add({ severity: 'success', summary: 'Successful', detail: 'DM Deletada', life: 3000 });
        await fetchDMS();
    } catch (error) {
        if (error.response && (error.response.status === 500 || error.response.status === 401)) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a DM.', life: 3000 });
        }
    } finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
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

    const data = prepareItemDMData('adicionar',DM,produtoSelecionado,Controladoras)
    try {
        loading.value = true;
        await dmService.adicionarItem(data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto adicionado com sucesso', life: 3000 });
        showDialogProduto.value = false;
        resetProdutoSelecionado(produtoSelecionado);
        fetchItemDM();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar produto, verifique os campos e tente novamente.', life: 3000 });
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
// Função para atualizar o produto selecionado
const atualizarProduto = async () => {
    const data = prepareItemDMData('atualizar',DM,produtoSelecionado,Controladoras)
    try {
        loading.value = true;
        await dmService.atualizarProduto(data);
        showDialogProduto.value = false;
        resetProdutoSelecionado(produtoSelecionado);
        fetchItemDM();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
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
    dialogMessage.value = `Você tem certeza que deseja excluir o item ${item.Nome_Produto}?`;
    showDialogDItem.value = true;
    selectedItem.value = item;
};
/**
 * Função chamada para confirmar a exclusão do item.
 * Realiza a requisição para excluir o item e atualiza a lista de itens.
 */
const confirmDelete = async () => {
    if (!selectedItem.value) return;
    console.log(selectedItem.value);
    loading.value = true;

    try {
        const data = prepareItemDMData('deletar',DM,selectedItem)
        await dmService.deletarItem(data);
        // Atualiza a lista de itens após exclusão
        fetchItemDM();

        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído com sucesso', life: 3000 });
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir item', life: 3000 });
    } finally {
        loading.value = false;
        showDialogDItem.value = false;
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
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes', life: 3000 });
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
    selectedClient.value = configurarClienteSelecionado(ListaClientes.value, DM);
    usarApi.value = selectedClient.value.usar_api;
};
//Geral
/**
 * Função para carregar os itens associados ao DM.
 * Realiza uma requisição para listar os itens e os exibe na interface.
 */
const fetchItemDM = async () => {
    loading.value = true;
    try {
        const data = prepareItemDMData('listar',DM)
        const response = await dmService.fetchItemDM(data);
        ListaItens.value = response.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar itens da DM', life: 3000 });
        console.error('Erro ao carregar Itens:', error);
    } finally {
        loading.value = false;
    }
};
const loadData = async () => {
    loading.value = true;
    try {
        const produtos = dataStore.produtos || (await dataStore.fetchProdutos());
        ListaProdutos.value = produtos.map(({ value, codigo, label }) => ({
            label: `${codigo} | ${label}`,
            value: value
        }));

        ListaProdutos.value = produtos.filter((produto) => produto.label !== 'Todos');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar dados iniciais', life: 3000 });
        console.error('Erro ao carregar dados iniciais:', error);
    } finally {
        loading.value = false;
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
        resetDMForm(DM, Controladoras, selectedClient.value, nextValues);
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
                <h4 class="my-6 ml-2">Dispenser Machines</h4>
                <TabView v-model:activeIndex="active" v-if="!show">
                    <TabPanel header="Listar Dispenser Machines">
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
                                :sortOrder="lazyParams.value?.sortOrder||1"
                                :sortField="lazyParams.value?.sortField ||'Identificacao'"
                                @filter="onFilterChange($event)"
                                @page="onPageChange($event)"
                                @sort="onSortChange($event)"
                            >
                                <template #header>
                                    <div class="flex justify-content-between align-items-center">
                                        <div class="flex justify-content-start">
                                            <span>Total de registros: {{ totalRecords }}</span>
                                        </div>
                                        <div>
                                            <IconField iconPosition="left">
                                                <InputIcon>
                                                    <i class="pi pi-search" />
                                                </InputIcon>
                                                <InputText v-model="filters['global'].value" placeholder="Busca" />
                                            </IconField>
                                        </div>
                                    </div>
                                </template>
                                <template #empty> Nenhuma DM adicionada. </template>
                                <Column field="Identificacao" sortable header="Identificação"></Column>
                                <Column field="Numero" sortable header="Número"></Column>

                                <Column field="ClienteNome" sortable header="Cliente"></Column>
                                <Column field="local" sortable header="Localização"></Column>
                                <Column field="Ativo" sortable style="width: 9%; text-align: center" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="Updated" style="width: 15%" sortable header="Atualizado">
                                    <template #body="{ data }">
                                        {{ normalizeDateTime(data.Updated, true) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteDM(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel :header="visible ? 'Editar Dispenser Machines' : 'Adicionar Dispenser Machines'" v-if="admin()">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Cliente:</label>
                                <Dropdown class="my-2" v-model="selectedClient" :options="ListaClientes" optionLabel="label" optionValue="value" placeholder="Selecione um" />
                            </div>

                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Identificação da DM:</label>
                                <InputText class="my-2" v-model="DM.Identificacao" id="email" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Numero da DM:</label>
                                <InputText class="my-2" v-model="DM.Numero" id="email" />
                            </div>
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">DM ativa?</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Ativo" inputId="switch2" />
                                    <span class="ml-2">{{ DM.Ativo ? 'Sim' : 'Não' }}</span>
                                </div>
                            </div>
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch3">DM aceita devolução?</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Devolucao" inputId="switch3" />
                                    <span class="ml-2">{{ DM.Devolucao ? 'Sim' : 'Não' }}</span>
                                </div>
                            </div>
                        </div>

                        <panel header="Opções de DM" class="mt-4">
                            <div class="mt-5 mx-0 p-fluid grid">
                                <label for="fim"></label>
                                <div id="fim" class="checkbox-container flex align-content-end flex-wrap">
                                    <div class="checkbox-items m-2 flex align-items-end">
                                        <Checkbox v-model="DM.voucher" inputId="Voucher" value="Voucher" :binary="true" />
                                        <label for="Voucher" class="ml-2"> Voucher </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.cracha" inputId="cracha" value="cracha" :binary="true" />
                                        <label for="cracha" class="ml-2"> Crachá </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Biometria" inputId="Biometria" value="Biometria" :binary="true" />
                                        <label for="Biometria" class="ml-2"> Biometria </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Facial" inputId="Facial" value="Facial" :binary="true" />
                                        <label for="Facial" class="ml-2"> Rec. Facial </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Senha" inputId="Senha" value="Senha" :binary="true" />
                                        <label for="Senha" class="ml-2"> Senha </label>
                                    </div>
                                </div>
                            </div>
                            <Button class="mt-7" icon="pi pi-plus" label="Adicionar Controladora" @click="addControladora" />
                        </panel>

                        <div v-if="selectedClient.usar_api" class="mt-5 mx-auto p-fluid grid">
                            <div class="full flex align-items-start xl:col-12 lg:col-12 md:col-6 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Integracao" inputId="switch3" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">UserID API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.UserID" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">Senha API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.ChaveAPI" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">IdCliente API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.ClienteID" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">URL:</label>
                                <InputText class="my-2" id="senha" v-model="DM.URL" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-6">
                                <label for="codigo">Senha Chave:</label>
                                <Textarea v-model="DM.Chave" class="my-2 overflow-hidden" style="min-height: 50px; min-width: 450px" inputClass="w-full" rows="2" cols="30" />
                            </div>
                        </div>
                        <div>
                            <div v-for="(controladora, index) in Controladoras" :key="index" class="mt-5 card" v-show="!DM.ID_DM || !controladora?.deleted" :ref="setRefs">
                                <div class="flex justify-content-between flex-wrap">
                                    <h5>Controladora {{ index + 1 }}</h5>

                                    <!-- Botão de Remoção -->
                                    <Button icon="pi pi-trash" label="Remover" class="p-button-danger" @click="removeControladora(index)" />
                                </div>

                                <div class="field mt-3 col-12">
                                    <label class="mr-3">Modelo: </label>
                                    <Dropdown class="" style="width: 250px" v-model="controladora.tipo" optionLabel="label" optionValue="value" :options="tipoControladoras" placeholder="Selecione o tipo de controladora" @change="updateTipoControladora(index, controladora.tipo)" />
                                </div>

                                <!<!-- Controladora 2018 -->
                                <div class="" v-if="controladora.tipo === '2018'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Placa: </label>
                                        <InputText class="" style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>

                                    <fieldset class="field card mt-4">
                                        <legend>Molas</legend>

                                        <div class="checkbox-group mt-3" style="text-align: center">
                                            <div v-for="i in 10" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.molas" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAllCliente(index)" />
                                        </div>
                                    </fieldset>
                                </div>

                                <!-- Controladora 2023 -->
                                <div v-if="controladora.tipo === '2023'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">DIP: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="card mt-5">
                                        <div class="field mt-3">
                                            <h4>Andar:</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 6" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.andar" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="field mt-6">
                                            <h4>Posição</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 15" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Controladora 2024 -->
                                <div v-if="controladora.tipo === '2024'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Placa: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Motor: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.motor" />
                                    </div>
                                </div>

                                <!-- Controladora Locker -->
                                <div v-if="controladora.tipo === 'Locker-Padrao'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">Dip: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>Posição</h4>
                                        <div class="checkbox-group">
                                            <div v-for="i in 20" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>
                                <div v-if="controladora.tipo === 'Locker-Ker'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">Dip: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>Posição</h4>
                                        <div class="checkbox-group">
                                            <div v-for="i in 12" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAllCliente(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAllCliente(index)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button v-if="!visible" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarDM" class="full mt-4 mr-2" />
                            <Button v-if="visible" label="Salvar" icon="pi pi-check" severity="info" @click="atualizarDM" class="full mt-4 mr-2" />
                        </div>
                    </TabPanel>
                </TabView>
                <div class="card" v-if="operador">
                    <div class="mx-0 grid">
                        <div class="col-12">
                            <div class="flex mt-5 justify-content-between">
                                <h5>Itens da DM</h5>
                                <Button label="Adicionar Itens" @click="showDialogProduto = true" />
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
                                            <span>Total de itens carregados: {{ ListaItens.length }}</span>
                                        </div>
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                        </IconField>
                                    </div>
                                </template>

                                <template #empty> Nenhum item adicionado. </template>

                                <Column field="SKU" style="width: 9%" sortable header="SKU"></Column>
                                <Column field="Nome_Produto" sortable style="width: 30%" header="Produto"></Column>
                                <Column field="Posicao" sortable style="width: 40%" header="Posição">
                                    <template #body="{ data }">
                                        <span v-tooltip="data.modelo === '2018' ? 'Controladora / Placa / Motor 1 / Motor 2' : data.modelo === '2023' ? 'Controladora / DIP / Andar / Posição' : 'Placa / Motor'">
                                            {{ data.Posicao }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="QTD" sortable style="width: 9%" header="QTD"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" />
                                    </template>
                                </Column>
                                <template #groupheader="slotProps">
                                    <div class="flex align-items-center text-3xl gap-2">
                                        <span v-tooltip="'Modelo da controladora'">
                                            {{ slotProps.data.modelo }}
                                        </span>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <Button class="m-1" label="Voltar" @click="voltar()" />
                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <Dialog class="" :header="isEditMode ? 'Editar Produto' : 'Adicionar Produto'" :visible.sync="showDialogProduto" :modal="true" :closable="false">
        <div class="box card">
            <div class="grid">
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Produto" class="font-semibold">Produto:</label>
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
                        placeholder="Selecione um produto"
                    />
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">Controladora:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions" @change="handleControladoraChange" placeholder="Selecione uma controladora" />
                </div>
                <!-- Exibir campos dependendo do tipo de controladora -->
                <template v-if="tipoControladoraSelecionada === '2018'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">Placa:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Placa" class="w-full" :options="placaOptions" optionLabel="label" optionValue="value" placeholder="Selecione a Placa" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="molas" class="font-semibold">Molas:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="molasOptions" optionLabel="label" optionValue="value" placeholder="Selecione as Molas" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2023'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">DIP:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" placeholder="Selecione DIP" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Andar" class="font-semibold">Andar:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions" optionLabel="label" optionValue="value" placeholder="Selecione o andar" @change="handleAndarChange" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" placeholder="Selecione a posição" @change="validarAndarSelecionado" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">Motor:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions" optionLabel="label" optionValue="value" placeholder="Selecione o Motor" />
                    </div>
                </template>

                <template v-if="tipoControladoraSelecionada === 'Locker'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">DIP:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" placeholder="Selecione DIP" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" placeholder="Selecione a posição" />
                    </div>
                </template>
                <div v-if="tipoControladoraSelecionada" class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Capacidade" class="font-semibold">Capacidade:</label>
                </div>
                <div v-if="tipoControladoraSelecionada" class="lg:col-8 md:col-8 sm:col-8 justify-content-end flex">
                    <InputNumber inputId="Capacidade" class="w-full" v-model="produtoSelecionado.Capacidade" aria-describedby="username-help" suffix=" unidades" />
                </div>
            </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
            <Button type="button" label="Cancelar" severity="secondary" @click="handleCancelar()"></Button>
            <Button type="button" :label="isEditMode ? 'Atualizar' : 'Salvar'" @click="isEditMode ? atualizarProduto() : adicionarProduto()"></Button>
        </div>
    </Dialog>
    <Dialog header="Deletar Item" :visible.sync="showDialogDItem" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="OK" icon="pi pi-check" @click="confirmDelete" />
        </template>
    </Dialog>
    <Dialog header="Deletar DM" :visible.sync="showDialogDVM" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
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
</style>