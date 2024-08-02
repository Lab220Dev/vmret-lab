<script setup>
import { onMounted, ref, watch } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

/*dados mockados*/
const relatorio = ref({
    statusdm: ''
});

const dms = ref([]);
const formatedDms = ref([]);
const selectedDM = ref('');
const StatusDM = ref([]);
const dropdown1 = ref(null);

watch(dms, (newValue) => {
    if (newValue) {
        fetchSelectedDMs();
    } else {
        return;
    }
});

const mockData = [
    { DM: 1, Data: 'StatusDM 1' },
    { DM: 2, Data: 'StatusDM 2' },
    { DM: 3, Data: 'StatusDM 3' },
    { DM: 4, Data: 'StatusDM 4' },
    { DM: 5, Data: 'StatusDM 5' },
    { DM: 6, Data: 'StatusDM 6' },
    { DM: 7, Data: 'StatusDM 7' },
    { DM: 8, Data: 'StatusDM 8' },
    { DM: 9, Data: 'StatusDM 9' },
    { DM: 10, Data: 'StatusDM 10' }
];

onMounted(() => {
    dms.value = mockData;
});

const fetchDMs = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('relatorios/listarDms', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms = response.data;
        formatedDms.value = dms.map((dms) => ({
            label: dms.nome,
            value: dms.id_maquina
        }));
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const fetchSelectedDMs = async () => {
    const data = {
        DM: selectedDM.value
    };
    try {
        const response = await axios.post('relatorios/listarDMselecionado', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        StatusDM.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar a lista de DMs:', error);
    }
};



const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

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
            <Dropdown 
                id="dm" 
                v-model="relatorio.statusdm" 
                :options="formatedDms" 
                optionLabel="label" 
                optionValue="value" 
                placeholder="Selecione uma DM" 
                class="mr-3 w-full md:w-14rem" 
                ref="dropdown1"
            />
            <VueDatePicker 
                class="drop w-full md:w-14rem" 
                v-model="relatorio.statusdm" 
                showIcon 
                :showOnFocus="false" 
                :format="format" 
                locale="pt-BR" 
                auto-apply
                :enable-time-picker="false" 
                placeholder="Selecione uma data" teleport="body"
                @open="handleDatepickerOpen"
            />
        </div>
        <DataTable :value="dms" stripedRows showGridlines paginator :rows="10" dataKey="DM" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
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

