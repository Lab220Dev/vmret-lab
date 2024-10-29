<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const dialogMessage = ref('');
const selectedItem = ref(null);
const toast = useToast();
const active = ref(0);
const store = useAuthStore();
const loading = ref(false);
const loadingControladoras = ref(true);
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

const tipoControladoras = ['2018', '2023', '2024', 'Locker'];

const nextValues = reactive({
    2018: { placa: 12 },
    2023: { dip: 2 },
    Locker: { dip: 3 },
    2024: { placa: 101 }
});
const maxControladoras = {
    2018: 16,
    2023: 90,
    Locker: Infinity,
    2024: Infinity
};
const countControladoras = (tipo) => {
    return Controladoras.value.filter((controladora) => controladora.tipo === tipo).length;
};
const operador = ref(false);
const show = ref(false);
const showDialogDVM = ref(false);
const showDialogDItem = ref(false);
const showDialogProduto = ref(false);
const ListaProdutos = ref([]);
const ListaClientes = ref([]);
const selectedClient = ref({ id_cliente: null, nome_cliente: '', usar_api: false });
const visible = ref(false);
const ListaItens = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const usarApi = ref(false);
const produtoSelecionado = ref({
    id_produto: '',
    Porta: '',
    Placa: '',
    Posicao: '',
    Dip: '',
    Motor1: '',
    Motor2: '',
    Controladora: ''
});
const isEditMode = ref(false);
const Controladoras = ref([]);
const controladoraOptions = ref([]);
const molasOptions = ref([]);
const dipOptions = ref([]);
const andarOptions = ref([]);
const posicaoOptions = ref([]);
const placaOptions = ref([]);
const motorOptions = ref([]);
const ListaDMS = ref([]);

const handleControladoraChange = () => {
    const selectedControladora = Controladoras.value.find((c) => c.tipo === produtoSelecionado.value.Controladora);
    if (!selectedControladora) return;

    if (produtoSelecionado.value.Controladora === '2018') {
        molasOptions.value = selectedControladora.dados.molas.map((mola) => ({ label: mola, value: mola }));
        placaOptions.value = [{ label: selectedControladora.dados.placa, value: selectedControladora.dados.placa }];
    } else if (produtoSelecionado.value.Controladora === '2023') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];
        andarOptions.value = selectedControladora.dados.andar.map((a) => ({ label: a, value: a }));
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p }));
    } else if (produtoSelecionado.value.Controladora === '2024') {
        motorOptions.value = [{ label: selectedControladora.dados.motor, value: selectedControladora.dados.motor }];
    } else if (produtoSelecionado.value.Controladora === 'Locker') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p }));
    }
};
const atualizarProduto = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        ...produtoSelecionado.value,
        id_dm: DM.ID_DM
    };
    try {
        loading.value = true;
        const response = await axios.post('/DM/atualizarItens', data);
        showDialogProduto.value = false;
        resetProdutoSelecionado();
        fetchItemDM();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false;
        isEditMode.value = false;
    }
};
const fetchDMS = async () => {
    loading.value = true;
    let data = null;
    if (admin()) {
        data = '';
    } else {
        data = {};
        data.id_cliente = store.userIdCliente;
    }
    try {
        const response = await axios.post('/DM/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaDMS.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const deleteItem = async (item) => {
    dialogMessage.value = `Você tem certeza que deseja excluir o item ${item.Nome_Produto}?`;
    showDialogDItem.value = true;
    selectedItem.value = item;
};

const confirmDelete = async () => {
    if (!selectedItem.value) return;
    console.log(selectedItem.value);
    loading.value = true;

    try {
        const response = await axios.post(
            '/DM/deleteItem',

            {
                id_item: selectedItem.value.id_item,
                id_usuario: store.userId
            },
            {
                headers: {
                    Authorization: `Bearer ${store.token}`
                }
            }
        );

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

const cancelDelete = () => {
    showDialogDItem.value = false;
    selectedItem.value = null;
};

const fetchItemDM = async () => {
    loading.value = true;
    try {
        const data = {
            id_dm: DM.ID_DM,
            id_cliente: store.userIdCliente,
            id_usuario: store.userId
        };
        const response = await axios.post('/DM/listaritens', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaItens.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar Itens:', error);
    } finally {
        loading.value = false;
    }
};

const onRowSelect = async (event) => {
    try {
        DM = event.data;
        visible.value = true;
        console.log(DM);
        await mapControladoras(DM);
        configurarClienteSelecionado(DM);
        configurarVisibilidade();
    } catch (error) {
        console.error('Erro ao selecionar a DM:', error);
        loadingControladoras.value = false;
    }
};
const configurarClienteSelecionado = (dm) => {
    const client = ListaClientes.value.find((client) => client.value.id_cliente === dm.ID_Cliente);
    if (client) {
        selectedClient.value = client.value;
        usarApi.value = client.value.usar_api ?? false;
    } else {
        selectedClient.value = null;
        usarApi.value = false;
    }
};
const mapControladoras = async (dm) => {
    Controladoras.value = dm.Controladoras.map((controladora) => {
        return {
            id: controladora.ID,
            tipo: controladora.Tipo_Controladora,
            deleted: false,
            dados: {
                placa: controladora.Placa,
                dip: controladora.DIP,
                andar: Array.isArray(controladora.Andar) ? controladora.Andar.flatMap((a) => a.split(',').map(Number)) : controladora.Andar ? controladora.Andar.split(',').map(Number) : [],
                posicao: Array.isArray(controladora.Posicao) ? controladora.Posicao.flatMap((p) => p.split(',').map(Number)) : controladora.Posicao ? controladora.Posicao.split(',').map(Number) : [],
                molas: controladora.Tipo_Controladora === '2018' && Array.isArray(controladora.Mola1) ? controladora.Mola1.flatMap((mola) => mola.split(',').map(Number)) : [],
                motor: '',
                motor2: ''
            }
        };
    });

    ajustarContagemInicial();
};
const preencherControladoraOptions = () => {
    controladoraOptions.value = Controladoras.value.map((controladora) => {
        const id = controladora.id || 'N/A'; // Usando o ID da controladora diretamente
        return {
            label: `ID: ${id}, Tipo: ${controladora.tipo}`,
            value: controladora.tipo
        };
    });
};
const ajustarContagemInicial = () => {
    const placasExistentes2018 = Controladoras.value.filter((controladora) => controladora.tipo === '2018').map((controladora) => controladora.dados.placa);

    if (placasExistentes2018.length > 0) {
        nextValues['2018'].placa = Math.max(...placasExistentes2018) + 1;
    } else {
        nextValues['2018'].placa = 12; // Valor inicial caso não haja nenhuma
    }

    const dipsExistentes2023 = Controladoras.value.filter((controladora) => controladora.tipo === '2023').map((controladora) => controladora.dados.dip);

    if (dipsExistentes2023.length > 0) {
        nextValues['2023'].dip = Math.max(...dipsExistentes2023) + 1;
    } else {
        nextValues['2023'].dip = 2; // Valor inicial caso não haja nenhuma
    }

    const placas2024Existentes = Controladoras.value.filter((controladora) => controladora.tipo === '2024').map((controladora) => controladora.dados.placa);

    if (placas2024Existentes.length > 0) {
        nextValues['2024'].placa = Math.max(...placas2024Existentes) + 1;
    } else {
        nextValues['2024'].placa = 101; // Valor inicial caso não haja nenhuma
    }
};

const preencherOpcoesControladoras = () => {
    molasOptions.value = [];
    dipOptions.value = [];
    andarOptions.value = [];
    posicaoOptions.value = [];
    motorOptions.value = [];

    Controladoras.value.forEach((controladora) => {
        if (controladora.tipo === '2018') {
            console.log(controladora);
            molasOptions.value.push(...controladora.dados.molas);
            placaOptions.value.push(controladora.dados.placa);
        } else if (controladora.tipo === '2023') {
            dipOptions.value.push(controladora.dados.dip);
            andarOptions.value.push(...controladora.dados.andar);
            posicaoOptions.value.push(...controladora.dados.posicao);
        } else if (controladora.tipo === '2024') {
            motorOptions.value.push(controladora.dados.motor);
        }
    });
};
const configurarVisibilidade = () => {
    if (!admin()) {
        show.value = true;
        fetchItemDM();
        listarProduto();
        preencherOpcoesControladoras();
        preencherControladoraOptions();
        operador.value = true;
    } else {
        active.value = 1;
    }
};
const adicionarDM = async () => {
    DM.IDcliente = selectedClient.value.id_cliente;
    DM.ClienteNome = selectedClient.value.nome_cliente;
    const data = {
        id_usuario: store.userId,
        ...DM,
        Controladoras: Controladoras.value
    };
    loading.value = true;
    try {
        const response = await axios.post('/DM/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchDMS();
        active.value = 0;
        resetDMForm();
    } catch (error) {
        console.error('Erro ao adicionar DM:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const deleteDM = async (item) => {
    let data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        ID_DM: item.ID_DM
    };
    loading.value = true;
    try {
        await axios.post('/DM/delete', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
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
const handleRowSelection = async (event) => {
    const edit = event.data;
    console.log(edit);
    isEditMode.value = true;
    showDialogProduto.value = true;
    produtoSelecionado.value = {
        id_item: edit.id_item,
        id_produto: edit.id_produto,
        Nome_Produto: edit.Nome_Produto,
        QTD: edit.QTD,
        SKU: edit.SKU,
        Controladora: ''
    };

    const [controladora, valor1, valor2, valor3] = edit.Posicao.split(' / ');
    console.log(controladora, valor1, valor2, valor3);
    produtoSelecionado.value.Controladora = controladora;

    if (controladora === '2018') {
        produtoSelecionado.value.Placa = Number(valor1);
        produtoSelecionado.value.Motor1 = Number(valor2);
    } else if (controladora === '2023') {
        produtoSelecionado.value.Dip = Number(valor1);
        produtoSelecionado.value.Andar = Number(valor2);
        produtoSelecionado.value.Posicao = Number(valor3);
    } else if (controladora === '2024') {
        produtoSelecionado.value.Motor1 = Number(valor1);
    } else if (controladora === 'Locker') {
        produtoSelecionado.value.Dip = Number(valor1);
        produtoSelecionado.value.Posicao = Number(valor2);
    }
    handleControladoraChange();
};
const handleCancelar = () => {
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
        Posicao: null
    };
    isEditMode.value = false;
    showDialogProduto.value = false;
};
const atualizarDM = async () => {
    const data = {
        id_usuario: store.userId,
        IDcliente: selectedClient.value.id_cliente,
        ClienteNome: selectedClient.value.nome_cliente,
        ...DM,
        Controladoras: Controladoras.value.map((controladora) => {
            if (!controladora.ID) {
                controladora.ID = null;
            }
            return controladora;
        })
    };
    loading.value = true;
    try {
        const response = await axios.post('/DM/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchDMS();
        active.value = 0;
        resetDMForm();
    } catch (error) {
        console.error('Erro ao atualizar DM:', error);
    } finally {
        loading.value = false;
    }
};
const admin = () => {
    return store.userRole === 'Administrador';
};

const formatDate = (value) => {
    if (!value) {
        return '';
    }
    try {
        const date = new Date(value);
        if (isNaN(date)) {
            throw new Error('Data inválida');
        }
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const day = String(localDate.getDate()).padStart(2, '0');
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const year = localDate.getFullYear();
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};

const listarProduto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        loading.value = true;
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaProdutos.value = response.data.map(({ id_produto, codigo, nome }) => ({
            label: `${codigo} | ${nome}`,
            value: id_produto
        }));
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const adicionarProduto = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        ...produtoSelecionado.value,
        id_dm: DM.ID_DM
    };
    try {
        loading.value = true;
        const response = await axios.post('/DM/adicionarItens', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        showDialogProduto.value = false;
        resetProdutoSelecionado();
        fetchItemDM();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetDMForm();
        fetchDMS();
        visible.value = false;
    }
});

onMounted(() => {
    fetchCliente();
    fetchDMS();
});
const resetDMForm = () => {
    DM.Ativo = '';
    DM.Chave = '';
    DM.ChaveAPI = '';
    DM.ClienteID = '';
    DM.ClienteNome = '';
    DM.Created = '';
    DM.Enviada = '';
    DM.ID_CR_Usuario = '';
    DM.ID_DM = '';
    DM.IDcliente = '';
    DM.Identificacao = '';
    DM.Integracao = '';
    DM.Numero = '';
    DM.OP_Biometria = '';
    DM.OP_Facial = '';
    DM.OP_Senha = '';
    DM.URL = '';
    DM.Updated = '';
    DM.UserID = '';
    DM.Versao = '';
    DM.Devolucao = '';
    Controladoras.value = [];
    nextValues['2018'].placa = 12;
    nextValues['2023'].dip = 2;
    nextValues['Locker'].dip = 2;
    nextValues['2024'].placa = 101;
};
const voltar = () => {
    show.value = false;
    operador.value = false;
};
const resetProdutoSelecionado = () => {
    produtoSelecionado.value = {
        id_produto: '',
        Porta: '',
        Motor1: '',
        Motor2: '',
        Controladora: ''
    };
};

const fetchCliente = async () => {
    loading.value = true;
    try {
        const response = await axios.post(
            '/admin/cliente/listar',
            {},
            {
                headers: {
                    Authorization: `Bearer ${store.token}`
                }
            }
        );
        ListaClientes.value = response.data.map((cliente) => ({
            label: cliente.nome,
            value: {
                id_cliente: cliente.id_cliente,
                nome_cliente: cliente.nome,
                usar_api: cliente.usar_api
            },
            usar_api: cliente.usar_api
        }));
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
watch(
    () => DM.ID_Cliente,
    (newClienteId) => {
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);
        if (client) {
            selectedClient.value = client.value; // Atualiza selectedClient com o cliente selecionado
            usarApi.value = client.value.usar_api ?? false; // Verifica se usar_api é nulo e define como false
        } else {
            usarApi.value = false; // Define usarApi como false se o cliente não for encontrado
        }
    }
);

const addControladora = () => {
    Controladoras.value.push({
        ID: null,
        tipo: '',
        deleted: false,
        dados: {}
    });
};

const updateTipoControladora = (index, tipo) => {
    const count = countControladoras(tipo);
    const controladora = Controladoras.value[index];

    if (count >= maxControladoras[tipo]) {
        toast.add({
            severity: 'warn',
            summary: 'Limite Atingido',
            detail: `Você atingiu o limite máximo de controladoras ${tipo}`,
            life: 3000
        });
        Controladoras.value.splice(index, 1);
        return;
    }

    if (tipo === '2018') {
        controladora.dados.placa = nextValues['2018'].placa++;
        controladora.dados.molas = controladora.dados.molas || [];
    } else if (tipo === '2023') {
        controladora.dados.dip = nextValues['2023'].dip++;
        controladora.dados.andar = controladora.dados.andar || [];
        controladora.dados.posicao = controladora.dados.posicao || [];
    } else if (tipo === '2024') {
        controladora.dados.placa = nextValues['2024'].placa++;
        controladora.dados.motor = controladora.dados.motor || '';
    } else if (tipo === 'Locker') {
        controladora.dados.dip = nextValues['Locker'].dip++;
        controladora.dados.posicao = controladora.dados.posicao || [];
    }
};

const selectAll = (index) => {
    if (Controladoras.value[index].tipo === '2018') {
        Controladoras.value[index].dados.molas = Array.from({ length: 10 }, (_, i) => i + 1);
    }
    if (Controladoras.value[index].tipo === '2023') {
        Controladoras.value[index].dados.andar = Array.from({ length: 6 }, (_, i) => i + 1);
        Controladoras.value[index].dados.posicao = Array.from({ length: 15 }, (_, i) => i + 1);
    }
    if (Controladoras.value[index].tipo === 'Locker') {
        Controladoras.value[index].dados.posicao = Array.from({ length: 14 }, (_, i) => i + 1);
    }
};

const desselectAll = (index) => {
    if (Controladoras.value[index].tipo === '2018') {
        Controladoras.value[index].dados.molas = Array.from({ length: 10 }, (_, i) => (i = 0));
    }
    if (Controladoras.value[index].tipo === '2023') {
        Controladoras.value[index].dados.andar = Array.from({ length: 6 }, (_, i) => (i = 0));
        Controladoras.value[index].dados.posicao = Array.from({ length: 15 }, (_, i) => (i = 0));
    }
    if (Controladoras.value[index].tipo === 'Locker') {
        Controladoras.value[index].dados.posicao = Array.from({ length: 14 }, (_, i) => (i = 0));
    }
};

const removeControladora = (index) => {
    if (!DM.ID_DM) {
        Controladoras.value.splice(index, 1);
    } else {
        Controladoras.value[index].deleted = true;
    }
};
</script>

<template>
    <div class="grid h-full">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Dispenser Machines</h5>
                <TabView v-model:activeIndex="active" v-if="!show">
                    <TabPanel header="Listar Dispenser Machines">
                        <div class="col-12">
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaDMS"
                                stripedRows
                                paginator
                                :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['ID_DM', 'Numero', 'Identificacao', 'ClienteNome', 'local', 'Updated']
                                "selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;" 
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="onRowSelect"
                                :sortOrder="-1"
                            >
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                        </IconField>
                                    </div>
                                </template>
                                <Column field="ID_DM" sortable style="width: 7%" header="ID"></Column>
                                <Column field="Numero" sortable header="Número"></Column>
                                <Column field="Identificacao"  sortable header="Identificação"></Column>
                                <Column field="ClienteNome" sortable header="Cliente"></Column>
                                <Column field="local" sortable header="Localização"></Column>
                                <Column field="Ativo" sortable style="width: 9%; text-align: center;" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="Updated" style="width: 15%" sortable header="Atualizado">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.Updated)) }}
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
                                <label for="email">Numero da DM:</label>
                                <InputText class="my-2" v-model="DM.Numero" id="email" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Identificação da DM:</label>
                                <InputText class="my-2" v-model="DM.Identificacao" id="email" />
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
                            <div v-for="(controladora, index) in Controladoras" :key="index" class="mt-5 card" v-show="!DM.ID_DM || !controladora?.deleted">
                                <div class="flex justify-content-between flex-wrap">
                                    <h5>Controladora {{ index + 1 }}</h5>

                                    <!-- Botão de Remoção -->
                                    <Button icon="pi pi-trash" label="Remover" class="p-button-danger" @click="removeControladora(index)" />
                                </div>

                                <div class="field mt-3 col-12">
                                    <label class="mr-3">Modelo: </label>
                                    <Dropdown class="" style="width: 250px" v-model="controladora.tipo" :options="tipoControladoras" placeholder="Selecione o tipo de controladora" @change="updateTipoControladora(index, controladora.tipo)" />
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
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
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
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
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
                                <div v-if="controladora.tipo === 'Locker'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">Dip: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>Posição</h4>
                                        <div class="checkbox-group">
                                            
                                            <div v-for="i in 14" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
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
                    <h5 class="mt-2">Itens da DM</h5>
                    <Button class="m-1" label="Adicionar Itens" @click="showDialogProduto = true" />
                    <div class="mt-5 mx-0 p-fluid grid">
                        <div class="lg:col-12 md:col-12 sm:col-12">
                            <DataTable
                                :value="ListaItens"
                                selectionMode="single"
                                tableStyle="min-width: 25%"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                stripedRows
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="handleRowSelection"
                                paginator
                                :rows="10"
                            >
                                <Column field="SKU" header="SKU"></Column>
                                <Column field="Nome_Produto" header="Produto"></Column>
                                <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
                                <Column field="QTD" header="QTD"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                    <Button class="m-1" label="Voltar" @click="voltar()" />
                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <Dialog class="" header="Adicionar Produto" :visible.sync="showDialogProduto" :modal="true" :closable="false">
        <div class="box card">
            <div class="grid">
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Produto" class="font-semibold">Produto:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.id_produto" class="w-full" :options="ListaProdutos" optionLabel="label" optionValue="value" placeholder="Selecione um produto" />
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">Controladora:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions" @change="handleControladoraChange" placeholder="Selecione uma controladora" />
                </div>
                <!-- Exibir campos dependendo do tipo de controladora -->
                <template v-if="produtoSelecionado.Controladora === '2018'">
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

                <template v-if="produtoSelecionado.Controladora === '2023'">
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
                        <Dropdown v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions" optionLabel="label" optionValue="value" placeholder="Selecione o andar" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" placeholder="Selecione a posição" />
                    </div>
                </template>

                <template v-if="produtoSelecionado.Controladora === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">Motor:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions" optionLabel="label" optionValue="value" placeholder="Selecione o Motor" />
                    </div>
                </template>
                <template v-if="produtoSelecionado.Controladora === 'Locker'">
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
