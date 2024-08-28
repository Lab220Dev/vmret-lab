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

let DM = reactive({
    Ativo: false,
    Chave: '',
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
const Controladoras = ref([]);
const tipoControladoras = ['2018', '2023', '2024'];

const nextValues = reactive({
    '2018': { placa: 12 },
    '2023': { dip: 2 },
    '2024': { placa: 101 }
});
const maxControladoras = {
    '2018': 16,
    '2023': 90,
    '2024': Infinity
};
const countControladoras = (tipo) => {
    return Controladoras.value.filter(controladora => controladora.tipo === tipo).length;
};
const operador = ref(false);
const show = ref(false);
const showDialogDVM = ref(false);
const showDialogDItem = ref(false);
const showDialogProduto = ref(false);
const ListaProdutos = ref([]);
const ListaProdutosFiltradp = ref([]);
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
    Motor1: '',
    Motor2: '',
    Controladora: ''
});
const controladoraOptions = ref([]);
const checkboxOptions = ref([]);
const dipOptions = ref([]);
const andarOptions = ref([]);
const posicaoOptions = ref([]);
const motorOptions = ref([]);
const ListaDMS = ref([]);
const todosOption = { label: 'Todos', value: null };
const plantas = ref([todosOption]);

const handleControladoraChange = () => {
    const selectedControladora = Controladoras.value.find(c => c.tipo === produtoSelecionado.value.Controladora);

    if (!selectedControladora) return;

    if (produtoSelecionado.value.Controladora === '2018') {
        checkboxOptions.value = selectedControladora.dados.checkboxes.map(cb => ({ label: cb, value: cb }));
    } else if (produtoSelecionado.value.Controladora === '2023') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];
        andarOptions.value = selectedControladora.dados.andar.map(a => ({ label: a, value: a }));
        posicaoOptions.value = selectedControladora.dados.posicao.map(p => ({ label: p, value: p }));
    } else if (produtoSelecionado.value.Controladora === '2024') {
        motorOptions.value = [{ label: selectedControladora.dados.motor, value: selectedControladora.dados.motor }];
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
    DM = event.data;
    visible.value = true;

    mapControladoras(DM);
    configurarClienteSelecionado(DM);
    configurarVisibilidade();
};
const configurarClienteSelecionado = (dm) => {
    const client = ListaClientes.value.find(client => client.value.id_cliente === dm.IDcliente);
    if (client) {
        selectedClient.value = client.value;
        usarApi.value = client.value.usar_api;
    } else {
        selectedClient.value = null;
        usarApi.value = false;
    }
};
const mapControladoras = (dm) => {
    Controladoras.value = dm.Controladoras.map(controladora => ({
        id: controladora.ID,  
        tipo: controladora.Tipo_Controladora,
        dados: {
            placa: controladora.Placa,
            dip: controladora.DIP,
            andar: controladora.Andar ? controladora.Andar.split(',').map(Number) : [],
            posicao: controladora.Posicao ? controladora.Posicao.split(',').map(Number) : [],
            motor: controladora.Tipo_Controladora === '2018' ? '' : controladora.Mola1 || '',
            motor2: controladora.Tipo_Controladora === '2018' ? '' : controladora.Mola2 || '',
            checkboxes: controladora.Tipo_Controladora === '2018' ? (controladora.Mola1 ? controladora.Mola1.split(',').map(Number) : []) : []
        }
    }));

    ajustarContagemInicial();
};
const preencherControladoraOptions = () => {
    controladoraOptions.value = Controladoras.value.map(controladora => {
        const id = controladora.id || 'N/A'; // Usando o ID da controladora diretamente
        return {
            label: `ID: ${id}, Tipo: ${controladora.tipo}`,
            value: controladora.tipo
        };
    });
};
const ajustarContagemInicial = () => {
    const placasExistentes = Controladoras.value
        .filter(controladora => controladora.tipo === '2018')
        .map(controladora => controladora.dados.placa);

    if (placasExistentes.length > 0) {
        nextValues['2018'].placa = Math.max(...placasExistentes) + 1;
    }

    const dipsExistentes = Controladoras.value
        .filter(controladora => controladora.tipo === '2023')
        .map(controladora => controladora.dados.dip);

    if (dipsExistentes.length > 0) {
        nextValues['2023'].dip = Math.max(...dipsExistentes) + 1;
    }

    const placas2024Existentes = Controladoras.value
        .filter(controladora => controladora.tipo === '2024')
        .map(controladora => controladora.dados.placa);

    if (placas2024Existentes.length > 0) {
        nextValues['2024'].placa = Math.max(...placas2024Existentes) + 1;
    }
};
const preencherOpcoesControladoras = () => {
    // Limpa as opções anteriores
    checkboxOptions.value = [];
    dipOptions.value = [];
    andarOptions.value = [];
    posicaoOptions.value = [];
    motorOptions.value = [];

    // Itera sobre as controladoras para preencher as opções com base no tipo
    Controladoras.value.forEach(controladora => {
        if (controladora.tipo === '2018') {
            checkboxOptions.value.push(...controladora.dados.checkboxes);
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
    await onRowSelect(event);
};

const atualizarDM = async () => {
    const data = {
        id_usuario: store.userId,
        IDcliente: selectedClient.value.id_cliente,
        ClienteNome: selectedClient.value.nome_cliente,
        ...DM,
        Controladoras: Controladoras.value.map(controladora => {
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
    fetchIdPlanta();
    fetchCliente();
    fetchDMS();
});
const resetDMForm = () => {
    DM.Ativo = '';
    DM.Chave = '';
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
    nextValues['2024'].placa = 101;
};
const voltar = () => {
    show.value = false;
    operador.value = false;
}
const resetProdutoSelecionado = () => {
    produtoSelecionado.value = {
        id_produto: '',
        Porta: '',
        Motor1: '',
        Motor2: '',
        Controladora: ''
    };
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/usuarios/listarPlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantas.value = [
            todosOption,
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`,
                value: id_planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
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
    () => DM.IDcliente,
    (newClienteId) => {
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);
        if (client) {
            selectedClient.value = client.value; // Atualiza selectedClient com o cliente selecionado
            usarApi.value = client.value.usar_api; // Atualiza usarApi com base no cliente selecionado
        } else {
            usarApi.value = false;
        }
    }
);

const addControladora = () => {
    Controladoras.value.push({
        ID: null,
        tipo: '',
        dados: {}
    });
};

const updateTipoControladora = (index, tipo) => {
    //tipo = tipo.toString();
    const count = countControladoras(tipo);
    const controladora = Controladoras.value[index];
    const tipoAnterior = controladora.tipo;
    console.log(`Controladora ${index} tipo:`, tipo);
    console.log(`Dados da controladora:`, controladora.dados);
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

    // Se o tipo é o mesmo que o anterior, não faça nada
    if (tipo === '2018') {
        controladora.dados = {
            placa: controladora.dados.placa || nextValues['2018'].placa,
            checkboxes: controladora.dados.checkboxes || []
        };
        if (!controladora.dados.placa) {
            nextValues['2018'].placa++;
        }
    } else if (tipo === '2023') {
        controladora.dados = {
            dip: controladora.dados.dip || nextValues['2023'].dip,
            andar: controladora.dados.andar || [],
            posicao: controladora.dados.posicao || []
        };
        if (!controladora.dados.dip) {
            nextValues['2023'].dip++;
        }
    } else if (tipo === '2024') {
        controladora.dados = {
            placa: controladora.dados.placa || nextValues['2024'].placa,
            motor: controladora.dados.motor || ''
        };
        if (!controladora.dados.placa) {
            nextValues['2024'].placa++;
        }
    }

};

const selectAllCheckboxes = (index) => {
    if (Controladoras.value[index].tipo === '2018') {
        Controladoras.value[index].dados.checkboxes = Array.from({ length: 10 }, (_, i) => i + 1);
    }
};
const removeControladora = (index) => {
    Controladoras.value.splice(index, 1);
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
                            <DataTable v-model:filters="filters" :value="ListaDMS" selectionMode="single"
                                tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows
                                dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect" paginator :rows="10"
                                :globalFilterFields="['id_DM', 'nome', 'email', 'nome_cliente', 'local', 'atualizado']">
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
                                <Column field="ID_DM" header="Id"></Column>
                                <Column field="Numero" header="Número"></Column>
                                <Column field="Identificacao" header="Identificação"></Column>
                                <Column field="ClienteNome" header="Cliente"></Column>
                                <Column field="local" header="Localização"></Column>
                                <Column field="Ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi"
                                            :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="Updated" header="Atualizado">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.Updated)) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteDM(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel :header="visible ? 'Editar Dispenser Machines' : 'Adicionar Dispenser Machines'"
                        v-if="admin()">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Cliente:</label>
                                <Dropdown class="my-2" v-model="selectedClient" :options="ListaClientes"
                                    optionLabel="label" optionValue="value" placeholder="Selecione um" />

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
                                        <Checkbox v-model="DM.voucher" inputId="Voucher" value="Voucher"
                                            :binary="true" />
                                        <label for="Voucher" class="ml-2"> Voucher </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.cracha" inputId="cracha" value="cracha" :binary="true" />
                                        <label for="cracha" class="ml-2"> Crachá </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Biometria" inputId="Biometria" value="Biometria"
                                            :binary="true" />
                                        <label for="Biometria" class="ml-2"> Biometria </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Facial" inputId="Facial" value="Facial"
                                            :binary="true" />
                                        <label for="Facial" class="ml-2"> Rec. Facial </label>
                                    </div>
                                </div>
                            </div>
                        </panel>

                        <div v-if="selectedClient.usar_api" class="mt-5 mx-auto p-fluid grid">
                            <div class="full flex align-items-start xl:col-12 lg:col-12 md:col-6 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Integracao" inputId="switch3" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">UserID API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.UserID" type="password" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">Senha API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">IdCliente API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.ClienteID" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-6">
                                <label for="codigo">Senha Chave:</label>
                                <Textarea v-model="DM.Chave" class="my-2 overflow-hidden" style="min-height: 20px"
                                    inputClass="w-full" rows="2" cols="30" />
                            </div>
                        </div>
                        <div>
                            <Button label="Adicionar Controladora" @click="addControladora" />
                            <div v-for="(controladora, index) in Controladoras" :key="index" class="card">
                                <h5>Controladora {{ index + 1 }}</h5>
                                <Dropdown v-model="controladora.tipo" :options="tipoControladoras"
                                    placeholder="Selecione o tipo de Controladora"
                                    @change="updateTipoControladora(index, controladora.tipo)" />

                                <!-- Botão de Remoção -->
                                <Button icon="pi pi-trash" label="Remover" class="p-button-danger"
                                    @click="removeControladora(index)" />

                                <!<!-- Controladora 2018 -->
                                    <div v-if="controladora.tipo === '2018'">
                                        <div class="field">
                                            <label>Placa</label>
                                            <InputText v-model="controladora.dados.placa" disabled />
                                        </div>
                                        <div class="field">
                                            <label>Selecionar opções</label>
                                            <div class="checkbox-group">
                                                <Button label="Selecionar Todos" @click="selectAllCheckboxes(index)" />
                                                <div v-for="i in 10" :key="i" class="checkbox-item">
                                                    <Checkbox v-model="controladora.dados.checkboxes" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Controladora 2023 -->
                                    <div v-if="controladora.tipo === '2023'">
                                        <div class="field">
                                            <label>DIP</label>
                                            <InputText v-model="controladora.dados.dip" disabled />
                                        </div>
                                        <div class="field">
                                            <h4>Andar</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 6" :key="i" class="checkbox-item">
                                                    <Checkbox v-model="controladora.dados.andar" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="field">
                                            <h4>Posição</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 15" :key="i" class="checkbox-item">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Controladora 2024 -->
                                    <div v-if="controladora.tipo === '2024'">
                                        <div class="field">
                                            <label>Placa</label>
                                            <InputText v-model="controladora.dados.placa" disabled />
                                        </div>
                                        <div class="field">
                                            <label>Motor</label>
                                            <InputText v-model="controladora.dados.motor" />
                                        </div>
                                    </div>
                            </div>
                        </div>

                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button v-if="!visible" label="Salvar" icon="pi pi-check" severity="info"
                                @click="adicionarDM" class="full mt-4 mr-2" />
                            <Button v-if="visible" label="Salvar" icon="pi pi-check" severity="info"
                                @click="atualizarDM" class="full mt-4 mr-2" />
                        </div>
                    </TabPanel>
                </TabView>
                <div class="card" v-if="operador">
                    <h5 class="mt-2">Itens da DM</h5>
                    <Button class="m-1" label="Adicionar Itens" @click="showDialogProduto = true" />
                    <div class="mt-5 mx-0 p-fluid grid">
                        <div class="lg:col-12 md:col-12 sm:col-12">
                            <DataTable :value="ListaItens" selectionMode="single" tableStyle="min-width: 25%"
                                :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false"
                                @rowSelect="handleRowSelection" paginator :rows="10">
                                <Column field="SKU" header="SKU"></Column>
                                <Column field="Nome_Produto" header="Produto"></Column>
                                <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
                                <Column field="QTD" header="QTD"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteItem(slotProps.data)" />
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
                    <Dropdown v-model="produtoSelecionado.id_produto" class="w-full" :options="ListaProdutos"
                        optionLabel="label" optionValue="value" placeholder="Selecione um produto" />
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">Controladora:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions"
                        @change="handleControladoraChange" placeholder="Selecione uma controladora" />
                </div>
                <!-- Exibir campos dependendo do tipo de controladora -->
                <template v-if="produtoSelecionado.Controladora === '2018'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="checkboxes" class="font-semibold">Mola1 (Checkboxes):</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="checkboxOptions"
                            optionLabel="label" optionValue="value" placeholder="Selecione Mola1" />
                    </div>
                </template>

                <template v-if="produtoSelecionado.Controladora === '2023'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">DIP:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions"
                            optionLabel="label" optionValue="value" placeholder="Selecione DIP" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Andar" class="font-semibold">Andar:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions"
                            optionLabel="label" optionValue="value" placeholder="Selecione o andar" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions"
                            optionLabel="label" optionValue="value" placeholder="Selecione a posição" />
                    </div>
                </template>

                <template v-if="produtoSelecionado.Controladora === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">Motor:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions"
                            optionLabel="label" optionValue="value" placeholder="Selecione o Motor" />
                    </div>
                </template>
                <!-- <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <InputNumber id="Controladora" v-model="produtoSelecionado.Controladora" inputClass="w-full"
                        autocomplete="off" :min="1" :max="999" />
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" :options="Controladoras.value"
                    optionLabel="dados.placa" optionValue="dados.placa" placeholder="Selecione uma controladora" />
            </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Porta" class="font-semibold">Porta:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <InputNumber id="Porta" v-model="produtoSelecionado.Porta" inputClass="w-full" autocomplete="off"
                        :min="1" :max="999" />
                </div>
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Mola" class="font-semibold">Motor 1:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <InputNumber id="Mola" v-model="produtoSelecionado.Motor1" inputClass="w-full" autocomplete="off"
                        :min="1" :max="999" />
                </div>

                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Mola2" class="font-semibold">Motor 2:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <InputNumber id="Mola2" v-model="produtoSelecionado.Motor2" inputClass="w-full" autocomplete="off"
                        :min="1" :max="999" />
                </div> -->
            </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
            <Button type="button" label="Cancelar" severity="secondary" @click="showDialogProduto = false"></Button>
            <Button type="button" label="Salvar" @click="adicionarProduto"></Button>
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
</style>
