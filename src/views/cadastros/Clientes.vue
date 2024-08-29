<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import MenuSelector from '@/components/MenuSelector.vue';
import { format } from 'date-fns'; // Certifique-se de que você está importando 'format' corretamente

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const loading = ref(false);
const ListaClientes = ref([]);
const visible = ref(false);
const deleteClienteDialog = ref(false);
const item = ref({});
const selectedPerfil = ref(null);
const structuredMenus = ref([]); // Novo ref para armazenar a estrutura hierárquica dos menus

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
let cliente = reactive({
    nome: '',
    cpfcnpj: '',
    ativo: true,
    usar_api: false,
    textoretirada: ''
});

const perfilOptions = [
    { label: "Master", value: 1 },
    { label: "Operador", value: 3 },
    { label: "Avulso", value: 4 }
];

const onRowSelect = (event) => {
    cliente = reactive({ ...event.data });
    active.value = 1;
    visible.value = true;
    structuredMenus.value = cliente.menus || []; // Ajuste conforme o formato dos dados
};

const submitForm = () => {
    if (visible.value) {
        atualizarCliente();
    } else {
        adicionarCliente();
    }
};

const adicionarCliente = async () => {
    const data = {
        ...cliente,
        id_usuario: store.userId
    };
    loading.value = true;
    try {
        await axios.post('/admin/cliente/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente adicionado com sucesso!', life: 3000 });
        loadCliente();
        active.value = 0;
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar cliente.', life: 3000 });
        console.error('Erro ao adicionar cliente:', error);
    } finally {
        loading.value = false;
    }
};

const atualizarCliente = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: cliente.id_cliente,
        ...cliente
    };
    loading.value = true;
    try {
        await axios.post('/admin/cliente/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado com sucesso!', life: 3000 });
        loadCliente();
        active.value = 0;
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar cliente.', life: 3000 });
        console.error('Erro ao atualizar cliente:', error);
    } finally {
        loading.value = false;
    }
};

const deleteClientedes = (itm) => {
    item.value = itm;
    deleteClienteDialog.value = true;
};

const deleteCliente = async (item) => {
    loading.value = true;
    let data = { id_cliente: item.id_cliente, id_usuario: store.userId };
    try {
        await axios.post('/admin/cliente/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado com sucesso.', life: 3000 });
        deleteClienteDialog.value = false;
        loadCliente();
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar cliente.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Função atualizada para enviar a estrutura hierárquica de menus
const submitMenu = async () => {
    const simpleStructuredMenus = JSON.parse(JSON.stringify(structuredMenus.value.value));
    console.log("Structured Menus Before Submission:", simpleStructuredMenus);
    console.log("Structured Menus:", structuredMenus.value);
    const data = {
        id_cliente: cliente.id_cliente,
        perfil: selectedPerfil.value,
        menus: simpleStructuredMenus // Enviando a estrutura hierárquica de menus
    };

    loading.value = true;
    try {
        await axios.post('/admin/cliente/salvarMenus', data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações de menu salvas com sucesso.', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações de menu.', life: 3000 });
        console.error('Erro ao salvar menus:', error);
    } finally {
        loading.value = false;
    }
};

const loadCliente = async () => {
    loading.value = true;
    try {
        const response = await axios.post('/admin/cliente/listarComMenu');
        ListaClientes.value = response.data;
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    cliente = reactive({
        nome: '',
        cpfcnpj: '',
        ativo: true,
        usar_api: false,
        textoretirada: ''
    });
    structuredMenus.value = []; // Limpar a estrutura de menus ao resetar o formulário
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

        // Ajustar a data para o fuso horário local
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

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadCliente();
        visible.value = false;
    }
});

onMounted(() => {
    loadCliente();
});
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Clientes">
                <div class="col-12">
                    <DataTable v-model:filters="filters" :value="ListaClientes" selectionMode="single"
                        tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id"
                        :metaKeySelection="false" @rowSelect="onRowSelect"
                        :globalFilterFields="['id_cliente', 'nome', 'last_login']">
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
                        <Column field="id_cliente" header="Id"></Column>
                        <Column field="nome" header="Nome"></Column>
                        <Column field="ativo" header="Ativo">
                            <template #body="{ data }">
                                <i class="pi"
                                    :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                            </template>
                        </Column>
                        <Column field="last_login" header="Último Login">
                            <template #body="{ data }">
                                {{ formatDate(new Date(data.last_login)) }}
                            </template>
                        </Column>
                        <Column style="min-width: 8rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-trash" outlined rounded severity="danger"
                                    @click="deleteClientedes(slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? 'Editar Cliente' : 'Adicionar Cliente'">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full mt-5 lg:col-12 md:col-12 sm:col-12">
                                        <div><label for="id_planta">Nome:</label>
                                            <InputText class="my-2" id="id_planta" v-model="cliente.nome" required />
                                        </div>

                                        <div class="mt-4">
                                            <label for="cpfcnpj">CNPJ/CPF:</label>
                                            <InputText class="my-2" id="cpfcnpj" v-model="cliente.cpfcnpj" required />
                                        </div>

                                        <div class="input justify-items-center mt-5">
                                            <div
                                                class=" full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                                <label class="mt-0 text-nowrap" for="switch1">Tem integração?</label>
                                                <div class="grid mt-3">
                                                    <InputSwitch class="mr-2" v-model="cliente.usar_api"
                                                        inputId="switch1" />
                                                    <span class="ml-2">{{ cliente.usar_api ? 'Sim' : 'Não' }}</span>
                                                </div>
                                            </div>
                                            <div
                                                class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                                <label class="mt-0 text-nowrap" for="switch2">Cliente Ativo?</label>
                                                <div class="grid mt-3">
                                                    <InputSwitch class="mr-2" v-model="cliente.ativo"
                                                        inputId="switch2" />
                                                    <span class="ml-2">{{ cliente.ativo ? 'Sim' : 'Não' }}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </form>
                            <div class="card" v-if="visible">
                                <!-- Seleção de Perfil -->
                                <Dropdown v-model="selectedPerfil" :options="perfilOptions" optionLabel="label"
                                    optionValue="value" placeholder="Selecione um Perfil" />

                                <!-- Seção de Seleção de Menu -->
                                <MenuSelector v-if="selectedPerfil"
                                    :selectedPerfil="selectedPerfil"
                                    :initialMenus="structuredMenus.value"
                                    @update:structuredMenus="structuredMenus.value = $event" />

                                <!-- Botão para Salvar Configurações -->
                                <Button label="Salvar Configurações" @click="submitMenu" />
                            </div>
                        </div>
                        <div class="mr-1 mt-8 grid justify-content-end">
                            <Button v-if="visible" style="width: 25%; min-width: 100px"
                                class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                icon="pi pi-check" severity="primary" @click="atualizarCliente" />
                            <Button style="width: 25%; min-width: 100px"
                                class="flex align-items-center justify-content-center m-2 mr-0" label="Voltar"
                                icon="pi pi-arrow-left" severity="primary" @click="active = 0" />
                            <Button v-if="!visible" style="width: 25%; min-width: 100px"
                                class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                icon="pi pi-check" severity="info" @click="adicionarCliente" />
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <Dialog header="Deletar Cliente" v-model:visible="deleteClienteDialog" style="width: 400px" :modal="true"
            :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class="">
                    Você tem certeza que deseja deletar o Cliente <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b>
                    ?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" @click="deleteClienteDialog = false" class="p-button-text" />
                <Button label="Sim" icon="pi pi-check" @click="deleteCliente(item)" class="p-button-text" />
            </template>
        </Dialog>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
