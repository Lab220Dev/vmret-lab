<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const todosOption = { label: 'Todos', value: null };
const historico = ref([]);
const dms = ref([todosOption]);
const operacao = ref([
    { label: 'Todos', value: null },
    { label: 'Insert', value: 'INSERT' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const ListaFuncionarios = ref([todosOption]);
const usuario = ref([]);
const relatorio = ref({
    dm: '',
    id_usuario: '',
    id_funcionario: '',
    id_operacao: '',
    data_inicio: '',
    data_final: ''
});

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_dm: relatorio.value.dm,
        id_usuario: relatorio.value.id_usuario,
        id_funcionario: relatorio.value.id_funcionario,
        operacao: relatorio.value.id_operacao,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        const response = await axios.post('', data);
        historico.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
    }
};


const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/DM/listar', data);
        dms.value = [todosOption, ...response.data.map(({ ID_DM, Identificacao }) => ({
            label: Identificacao,
            value: ID_DM
        }))];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};

const fetchUsuario = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/usuarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        usuario.value = response.data.map(({ id_usuario,nome }) => ({
            label: nome,
            value: id_usuario
        }));
    } catch (error) {
        console.error('Erro ao carregar lista de usuários:', error);
    }
};

const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncionarios.value = response.data.map((funcionario) => ({
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }));
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
};

onMounted(() => {
    fetchDM();
    fetchUsuario();
    fetchFuncionarios();
    fetchOperacao();
});
</script>

<template>
    <div class="card vh p-fluid">
        <div class="form">
            <h5 class="my-6 ml-2 text-2xl">Log de Maquina</h5>
            <div class="grid mt-3 mx-1 p-1">
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">DMs:</label>
                    <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown3" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="operacao">Operação:</label>
                    <Dropdown class="drop" v-model="relatorio.id_operacao" :options="operacao" optionLabel="label"
                        optionValue="value" placeholder="Todos" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">Usuário:</label>
                    <Dropdown class="drop" v-model="relatorio.id_usuario" :options="usuario" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown3" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">Funcionario:</label>
                    <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="funcionario" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown4" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">Data Inicial:</label>
                    <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" placeholder="Selecione uma data inicial" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">Data Final:</label>
                    <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" placeholder="Selecione uma data final" />
                </div>
                <div class="field lg:col-12 md:col-12 sm:col-12">
                    <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info"
                        @click="buscar" />
                </div>
            </div>
        </div>
        <DataTable 
        v-model:filters="filters"
        :value="historico" 
        stripedRows 
        showGridlines 
        paginator 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        rowHover
        :globalFilterFields="['Dia', 'Operacao', 'ID_Usuario', 'Log', 'Resultado']"  
        dataKey="Operacao"
        :tableStyle="{ width: '100%' }"
        :sortOrder="1"
        :sortField="'Operacao'"  >

        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                    <span>Total de registros: {{ historico.length }}</span>
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

            <Column field="Dia" sortable header="Data"></Column>
            <Column field="Operacao" sortable header="Operação"></Column>
            <Column field="ID_Usuario" sortable header="Usuário"></Column>
            <Column field="Log" sortable header="Resumo"></Column>
            <Column field="Resultado" sortable header="Resultado"></Column>
        </DataTable>
    </div>
</template>
<style scoped>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
