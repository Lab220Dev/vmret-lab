<script setup>
import { onMounted, ref, watch } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const relatorio = ref({
    id_dm: '',
    dia: new Date()
});
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const todosOption = { label: 'Todos', value: null };
const loading = ref(false);
const dms = ref([todosOption]);
const formatedDms = ref([]);
const selectedDM = ref('');
const StatusDM = ref([]);
const dropdown1 = ref(null);




onMounted(() => {
    fetchDM();
});

const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioRetiRe/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = [todosOption, ...response.data.map(({ ID_DM, Identificacao }) => ({
            label: `DM  ${Identificacao}`,
            value: ID_DM
        }))];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};
const KeepAlive = async () =>{
    if(relatorio.id_dm || relatorio.dia){
        const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/SDM/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        StatusDM.value = response.data;
        if (StatusDM.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } 
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
    }
}
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
watch([() => relatorio.value.id_dm, () => relatorio.value.dia], () => {
    KeepAlive();
});
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
};
</script>

<template>
    <div class="card vh p-fluid formgrid">
        <!-- Header com a Seleção de Dms -->
        <h5 class="my-4 text-2xl">Status DM</h5>
        <div class="flex mt-3 flex-row gap-3 mb-5">
            <Dropdown id="dm" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value"
                placeholder="Selecione uma DM" class="mr-3 w-full md:w-14rem" ref="dropdown1" />
            <VueDatePicker class="drop w-full md:w-14rem" v-model="relatorio.dia" showIcon :showOnFocus="false"
                :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" placeholder="Selecione uma data"
                teleport="body" @open="handleDatepickerOpen" />
        </div>
        <DataTable :value="StatusDM" stripedRows showGridlines paginator :rows="10" dataKey="DM"
            :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <template #empty> {{ emptyMessage }} </template>
            <Column field="DM" header="DM"></Column>
            <Column field="Data" header="Data"></Column>
        </DataTable>
    </div>
</template>

<style>
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
