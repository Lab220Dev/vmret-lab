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
const operacao = ref(null);
const usuario = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref([]);
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
        id_operacao: relatorio.value.id_operacao,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        const response = await axios.post('', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        historico.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
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

// const exportCSV = () => {
//     const csvContent = generateCSV(historico.value);
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'HistoricoAbastecimento.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
// const exportJSON = () => {
//     const jsonContent = JSON.stringify(historico.value, null, 2);
//     const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', 'HistoricoAbastecimento.json');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };

const fetchDM = async () => {
    const params = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.get('', {
            params: params,
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = response.data.map(({ id_dm }) => ({
            label: `DM  ${id_dm}`,
            value: id_dm
        }));
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};

const fetchUsuario = async () => {
    const user = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.get ('', {
            user: user,
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = response.data.map(({ id_usuario }) => ({
            label: `Usuario  ${id_usuario}`,
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

//falta operação;//

onMounted(() => {
    fetchDM();
    fetchUsuario();
    fetchFuncionarios();
});

</script>

<template>
    <div class="card p-fluid formgrid">
        <div class="form grid mt-3">
        <!-- Header com a Seleção de Dms -->
        <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="dm">DM:</label>
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="usuario">Usuário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="usuario" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="funcionario">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="operacao">Operação:</label>
                        <Dropdown class="drop" v-model="relatorio.id_operacao" :options="operacao" optionLabel="label" optionValue="value" />
                    </div>
        <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false" :format="format" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar" :enable-time-picker="false" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false" :format="format" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar" :enable-time-picker="false" />
                    </div>
                </div>
        <DataTable :value="dms" stripedRows showGridlines paginator :rows="10" dataKey="DM" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <Column field="DM" header="DM"></Column>
            <Column field="Data" header="Data"></Column>
            <Column field="usuario" header="Usuário"></Column>
            <Column field="funcionario" header="Funcionário"></Column>
            <Column field="operacao" header="Operação"></Column>
        </DataTable>
    </div>
</template>