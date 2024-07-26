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
const historico = ref([]);
const dms = ref([]);
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const plantas = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref([]);
const relatorio = ref({
    id_planta: '',
    id_funcionario: '',
    data_inicio: '',
    data_final: ''
});

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        //id_dm: relatorio.value.dm,
        id_planta: relatorio.value.id_planta,
        //id_centro_custo: relatorio.value.id_centro_custo,
        //id_setor: relatorio.value.id_setor,
        id_funcionario: relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        const response = await axios.post('', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar fichas:', error);
    }
};

const voltar = () => {
    show.value = true;
    selectedItem.value = {};
};

const dt = ref(null);

const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
};

const exportCSV = () => {
    const csvContent = generateCSV(retiradas.value);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'FichasRetiradas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'FichasRetiradas.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarplanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantas.value = response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }));
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
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
};

const handleDatepickerOpen = () => {
  closeAllDropdowns();
};
onMounted(() => {
    fetchIdPlanta();
    fetchFuncionarios();
});



</script>

<template>
    <div class="card">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" 
                        :options="plantas" optionLabel="label" optionValue="value" 
                        ref="dropdown1"/>
                    </div>
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" 
                        :options="ListaFuncionarios" optionLabel="label" optionValue="value"
                        ref="dropdown2" />
                    </div>
                    <div class="field lg:col-2 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false"
                        @open="handleDatepickerOpen" />
                    </div>
                    <div class="field lg:col-2 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" 
                        @open="handleDatepickerOpen"/>
                    </div>
                    <div class="field mt-4 lg:col-2 md:col-6 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div> -->
                </div>
                <!--  datatable do relatorio -->
                <!-- <div class="datatable-wrapper"> -->
                    <!-- <DataTable
                        v-model:filters="filters"
                        :value="retiradas"
                        stripedRows
                        showGridlines
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['ID_DM', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
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
                        <template #empty> Nenhuma retirada realizada </template>
                        <Column field="ID_DM" sortable header="DM"></Column>
                        <Column field="Dia" sortable header="Data"></Column>
                        <Column field="matricula" sortable header="Matricula"></Column>
                        <Column field="nome" sortable header="Nome"></Column>
                        <Column field="email" sortable header="E-mail"></Column>
                        <Column field="ProdutoNome" sortable header="Item"></Column>
                        <Column field="Quantidade" sortable header="Quant" class="text-center"></Column>
                        <Column field="ProdutoSKU" sortable header="CA"></Column>
                    </DataTable> -->
                <!-- </div> -->
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-check" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>