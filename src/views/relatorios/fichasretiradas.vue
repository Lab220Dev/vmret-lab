<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const showDialog = ref(false);
const dialogMessage = ref('');

const loading = ref(false);

const store = useAuthStore();
const toast = useToast();
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const todosOption = { label: 'Todos', value: null };
const historico = ref([]);
const ListaFuncionarios = ref([todosOption]);;
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const plantas = ref([todosOption]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref([]);
const relatorio = ref({
    id_planta: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
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
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,       
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        loading.value = true
        const response = await axios.post('', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = '';
        }
    } catch (error) {
        console.error('Erro ao buscar fichas:', error);
    } finally {
        loading.value = false; // Desativando loading
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
        plantas.value = [todosOption, ...response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }))];
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
        ListaFuncionarios.value = [todosOption,...response.data.map((funcionario) => ({
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }))];
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
                <h5 class="my-4 text-2xl">Fichas Retiradas</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" 
                        :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos"
                        ref="dropdown1"/>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" 
                        :options="ListaFuncionarios" optionLabel="label" optionValue="value"
                        ref="dropdown2" placeholder="Todos"/>
                    </div>
                    <div class="field datepicker xl:col-2 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class=" drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false"
                        @open="handleDatepickerOpen" placeholder="Selecione uma data"/>
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="datepicker" v-model="relatorio.data_final" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" placeholder="Selecione uma data"
                        @open="handleDatepickerOpen"/>
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-6 sm:col-6">
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
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>
<style scoped>
.card {
    overflow-x: auto;
    overflow: visible; /* Permite que os elementos filhos excedam os limites do pai */
}

.datepicker {
    position: relative; /* Necessário para o posicionamento absoluto funcionar corretamente */
}

.vue-datepicker {
    position: absolute; /* Permite que o DatePicker ultrapasse os limites do grid */
    z-index: 1050; /* Garante que o DatePicker fique acima de outros elementos */
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

.vue-datepicker {
    z-index: 1050; /* Assegura que o menu do date picker seja exibido acima de outros elementos */
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
