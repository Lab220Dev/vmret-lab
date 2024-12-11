<script setup>
import { onMounted, ref, watch } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import { FilterMatchMode } from 'primevue/api';

const filteredCount = ref(0);

const store = useAuthStore();
const relatorio = ref({
    id_dm: '',
    dia: new Date()
});
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const todosOption = { label: 'Todos', value: null };
const loading = ref(false);
const dms = ref([todosOption]);
const StatusDM = ref([]);
const dropdown1 = ref(null);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

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
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};
const KeepAlive = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_usuario: store.userId,
        id_dm: relatorio.value.id_dm,
        dia: relatorio.value.dia.toISOString()
    };
    try {
        const response = await axios.post('/SDM/relatorio', data);
        StatusDM.value = response.data;

        filteredCount.value = StatusDM.value.length;

        if (StatusDM.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        }
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};

watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = StatusDM.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`; // Formato de data: dd/MM/yyyy
};

const formatTime = (date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`; // Formato de hora: HH:mm
};


const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
};
</script>

<template>
    <div class="card vh">
        <!-- Header com a Seleção de Dms -->
        <h5 class="my-6 ml-2 text-2xl">Status DM</h5>
        <div class="flex mt-3 flex-row gap-3 mb-5">
            <Dropdown id="dm" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Selecione uma DM" class="mr-3 w-full md:w-14rem" style="width: 20%" ref="dropdown1" @change="KeepAlive" />
            <VueDatePicker
                class="drop w-full md:w-14rem"
                v-model="relatorio.dia"
                showIcon
                :showOnFocus="false"
                :format="formatDate"
                locale="pt-BR"
                auto-apply
                :enable-time-picker="false"
                placeholder="Selecione uma data"
                teleport="body"
                @update:modelValue="KeepAlive"
                @open="handleDatepickerOpen"
            />
        </div>
        <DataTable
            class="mt-3"
            v-model:filters="filters"
            :value="StatusDM"
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            dataKey="DM"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :globalFilterFields="['Identificacao', 'status', 'dataHora']"
            selectionMode="single"
            :metaKeySelection="false"
            tableStyle="min-width: 50rem; table-layout: fixed;"
            :sortOrder="1"
            :sortField="'Identificacao'"
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-start">
                        <span>Total de registros: {{ filteredCount }}</span>
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

            <template #empty> {{ emptyMessage }} </template>
            <Column field="Identificacao" sortable header="DM"></Column>
            <Column field="status" sortable header="Status"></Column>
            <Column field="dataHora" sortable header="Data">
                <template #body="{ data }">
                    <span v-tooltip="data.dataHora">{{ formatDate(new Date(data.dataHora)) }}</span>
                </template></Column
            >
            <Column field="Hora" sortable header="Hora">
                <template #body="{ data }">
                    <span v-tooltip="data.dataHora">{{ formatTime(new Date(data.dataHora)) }}</span>
                </template></Column
            >
        </DataTable>
        <LoadingSpinner v-if="loading" />
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
