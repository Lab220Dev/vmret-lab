<script setup>
import { ref, onMounted } from 'vue';

import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const loading = ref(false);
const relatorio = ref({
    id_dm: ''
});
const todosOption = { label: 'Todos', value: null };
const dropdown1 = ref(null);
const EstoqueDM = ref([]);
const dms = ref([todosOption]);
const store = useAuthStore();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/Estoque/listar', data, {
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

const relatorioDM = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente,
        id_usuario: store.userId,
        id_dm: relatorio.value.id_dm
    };

    try {
        const response = await axios.post('/Estoque/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        EstoqueDM.value = response.data;
    } catch (error) {
        console.error('Erro ao gerar o Relatorio de Estoque das DMS:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchDM();
});
</script>

<template>
    <div class="card vh">
        <h5 class="my-6 ml-2 text-2xl">Estoque da DM</h5>
        <div class="my-2">
            <label for="dm" class="ml-2">DM:</label>
            <Dropdown id="dm" style="width: 20%" v-model="relatorio.id_dm" :options="dms" ref="dropdown1" optionLabel="label" optionValue="value" placeholder="Todos" class="mb-2 ml-2" @change="relatorioDM()" />
        </div>

        <DataTable
            class="mt-3"
            v-model:filters="filters"
            :value="EstoqueDM"
            stripedRows
            showGridlines
            paginator
            :rows="10"
            dataKey="SKU"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :globalFilterFields="['sku', 'nome', 'Posicao', 'quantidade', 'quantidademinima', 'capacidade']"
            selectionMode="single"
            :metaKeySelection="false"
            tableStyle="min-width: 50rem; table-layout: fixed;"
            :sortOrder="-1"
            :tableStyle="{ width: '100%' }"
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>Total de registros: {{ EstoqueDM.length }}</span>
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

            <Column field="sku" sortable class="table-cell" style="width: 10%" header="SKU"></Column>
            <Column field="nome" sortable style="width: 30%" header="Produto">
                <template #body="{ data }">
                    <span v-tooltip="data.nome">{{ data.nome }}</span>
                </template></Column
            >
            <Column field="Posicao" sortable style="width: 10%; text-align: center" header="Posição"></Column>
            <Column field="quantidade" sortable style="width: 15%; text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Atual'">Quant. Atual</span>
                </template>
            </Column>
            <Column field="quantidademinima" sortable style="width: 15%; text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Mínima'">Quant. Mín.</span>
                </template>
            </Column>
            <Column field="capacidade" sortable style="width: 10%; text-align: center" header="Capacidade"></Column>
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

.table-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
