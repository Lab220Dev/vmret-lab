<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const toast = useToast();
const active = ref(0);
const store = useAuthStore();
const loading = ref(false);
const DM = reactive({
    nome: '',
    usuario: '',
    senha: '',
    cliente:''
});
const ListaClientes = ref([])
const visible = ref(false);
const status = ref([
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' }
]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const confirmar = ref();
const selectedVM = ref([]);
const DMOptions = ref([
    { nome: 'DM 1', code: 'plt1' },
    { nome: 'DM 2', code: 'plt2' },
    { nome: 'DM 3', code: 'plt3' },
    { nome: 'DM 4', code: 'plt4' },
    { nome: 'DM 5', code: 'plt5' },
    { nome: 'DM 6', code: 'plt6' },
    { nome: 'DM 7', code: 'plt7' },
    { nome: 'DM 8', code: 'plt8' }
]);
const ListaDMS = ref([]);
const todosOption = { label: 'Todos', value: null };
const plantas = ref([todosOption]);
const saveUsuario = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });
};
const saveDMs = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Maquinas Salvas para o Usuario', life: 3000 });
};
const onRowSelect = (event) => {
    show.value = true;
    DM.value = event.data;
};
const admin = () => {
    return store.userRole === "Administrador";
};
const voltar = () => {
    active.value = 0;
    resetForm();
};
const submitForm = () => {
    if (visible.value) {
        atualizarUsuario();
    } else {
        saveUsuario();
    }
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
        //fetchUsuarios();
        visible.value = false;
    }
});
onMounted(() => {
    fetchIdPlanta();
    fetchCliente();
    //admin();
    fetchDMS();
});

const resetForm = () => {

}
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
        plantas.value = [todosOption, ...response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }))];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};
const fetchCliente = async () => {
    loading.value = true;
    try {
        const response = await axios.post('/admin/cliente/listar', {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaClientes.value = response.data.map(({ id_cliente, nome }) => ({
            label: nome,
            value: id_cliente
        }));
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
</script>

<template>
    <div class="grid h-full">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Dispenser Machines</h5>
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Listar Dispenser Machines">
                        <div class="col-12">
                            <DataTable  v-model:filters="filters" :value="ListaDMS" selectionMode="single" tableStyle="min-width: 25%"
                                :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false"
                                @rowSelect="onRowSelect" paginator :rows="10" :globalFilterFields="['id_DM','nome','email','nome_cliente','local','atualizado']">
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
                                <Column field="id_DM" header="Id"></Column>
                                <Column field="nome" header="Número"></Column>
                                <Column field="email" header="Identificação"></Column>
                                <Column field="nome_cliente" header="Cliente"></Column>
                                <Column field="local" header="Localização"></Column>
                                <Column field="ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi"
                                            :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="atualizado" header="Atualizado">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.last_login)) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteUsuario(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Adicionar Dispenser Machines" v-if="admin()" >
                        <h5 class="mt-2">{{ visible ? 'Editar ' : 'Nova ' }}Dispenser Machines</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Cliente:</label>
                                <Dropdown class="my-2" v-model="DM.cliente" :options="ListaClientes" optionLabel="label"
                                optionValue="value" placeholder="Selecione um" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Numero da DM:</label>
                                <InputText class="my-2" v-model="DM.usuario" id="email" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Identificação da DM:</label>
                                <InputText class="my-2" v-model="DM.usuario" id="email" />
                            </div>
                            <div class="full lg:col-12 md:col-4 sm:col-12">
                                <label class="mt-3 ml-4" for="switch2">DM Ativo?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.status" inputId="switch2" />
                            </div>
                        </div>
                        <h5 class="mt-2">Opções de DM</h5>
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
                                    <Checkbox v-model="DM.biometria" inputId="Biometria" value="Biometria"
                                        :binary="true" />
                                    <label for="Biometria" class="ml-2"> Biometria </label>
                                </div>
                                <div class="checkbox-items m-2 flex align-items-center">
                                    <Checkbox v-model="DM.facial" inputId="Facial" value="Facial" :binary="true" />
                                    <label for="Facial" class="ml-2"> Rec. Facial </label>
                                </div>
                            </div>
                            <div class="full lg:col-12 md:col-4 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Mob" inputId="switch3" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">UserID API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">Senha API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">IdCliente API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-6">
                                <label for="codigo">Senha Chave:</label>
                                <Textarea v-model="DM.textoretirada" class="my-2 overflow-scroll" rows="5" cols="30" />
                            </div>
                            <div class="flex align-items-center justify-content-end field col-12">
                                <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario"
                                    class="m-2" />
                            </div>
                        </div>
                        <h5 class="mt-2">Controladoras</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button label="Adicionar Controladoras" icon="pi pi-check" severity="info"
                                @click="adicionarDM" class="full mt-4 mr-2" />
                        </div>
                        <div class="col-12">
                            <DataTable v-model:selection="selectedVM" :value="DMOptions" dataKey="code"
                                tableStyle="width:100% min-width: 50rem" :size="small">
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                <Column field="code" header="Code" class="col-12 md:col-6" :style="{ width: '30%' }">
                                </Column>
                                <Column field="nome" header="Name" class="col-12 md:col-6" :style="{ width: '70%' }">
                                </Column>
                            </DataTable>

                            <div class="flex align-items-center justify-content-end field col-12">
                                    <Button v-if="visible" style="width: 15%;"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        label="Salvar" icon="pi pi-check" severity="primary"
                                        @click="saveDMs" />
                                    <Button style="width: 15%;"
                                        class="flex align-items-center justify-content-center m-2 mr-0" label="Voltar"
                                        icon="pi pi-arrow-left" severity="primary" @click="active = 0" />
                                <Button v-if="!visible" style="width: 15%;"
                                    class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                    icon="pi pi-check" severity="info" @click="adicionarCliente" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
</template>
<style>
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
