<template>
    <h1>Dados do evento</h1>
    <DataTable
        v-model:filters="filters"
        :value="formattedData"
        stripedRows
        showGridlines
        paginator
        :rows="50"
        :rowsPerPageOptions="[50, 100, 500, 1000]"
        rowHover
        :globalFilterFields="['Nome', 'Telefone', 'RG', 'Retirada', 'dia_retirada', 'hora_retirada']"
        tableStyle="min-width: 50rem; table-layout: fixed;" 
        :sortField="'nome'"
        :sortOrder="1"
        filterDisplay="menu"
        :loading="loading"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <span>Total de registros: {{ data.length }}</span>
                </div>

                <div class="flex justify-content-end align-items-center">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                    </IconField>

                    <Button class="ml-4" type="button" icon="pi pi-filter-slash" label="Limpar Filtros" outlined @click="limparFiltros()" />
                </div>
            </div>
        
        </template>

        <template #empty> Nenhum registro encontrado </template>
        <template #loading> Carregando registros encontrados, aguarde... </template>

        <Column field="Nome" header="Nome" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo nome" />
            </template>
        </Column>

        <Column field="Telefone" header="Telefone" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo telefone" />
            </template>
        </Column>

        <Column field="RG" header="RG" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo RG" />
            </template>
        </Column>

        <Column field="dia_retirada" header="Dia" sortable>
    <template #body="slotProps">
        {{ slotProps.data.dia_retirada_formatada }}
    </template>
    <template #filter="{ filterModel }">
        <Calendar 
            v-model="filterModel.value" 
            dateFormat="dd/mm/yy" 
            placeholder="Selecione o dia" 
            :showIcon="true"
        />
    </template>
</Column>

        <Column field="hora_retirada" header="Hora" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela hora" />
            </template>
        </Column>

        <Column field="Retirada" header="Retirada" sortable>
            <template #body="slotProps">
                <span>
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Retirada')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Retirada }}
                </span>
            </template>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela retirada" />
            </template>
        </Column>

    </DataTable>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h, computed} from 'vue';
import { FilterMatchMode, FilterOperator, FilterService } from 'primevue/api';

FilterService.register('filterByArrayEquals', (arr, value) => {
  if (!value) {
    return true;
  }
  return arr.includes(value);
});

const formattedData = computed(() => {
    return data.value.map((item) => {
        if (item.dia_retirada) {
            const [day, month, year] = item.dia_retirada.split('/');
            const dateInBrasilia = new Date(year, month - 1, day, 0, 0, 0);
            dateInBrasilia.setHours(dateInBrasilia.getHours() + 3); 

            return {
                ...item,
                dia_retirada: dateInBrasilia,
                dia_retirada_formatada: dateInBrasilia.toLocaleDateString('pt-BR')
            };
        } else {
            return { ...item, dia_retirada: null, dia_retirada_formatada: '' };
        }
    });
});
const data = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    Telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    RG: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: 'filterByArrayEquals' }] },
    Retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    dia_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    hora_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
});


const loading = ref(false);

let eventSource;
onMounted(() => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    eventSource = new EventSource(`${baseURL}/evento/updateSE24`);
    eventSource.onmessage = (event) => {
        try {
            const updates = JSON.parse(event.data);
            if (updates) {
                data.value = Array.isArray(updates) ? updates : [];
            } else {
                console.warn('Nenhuma atualização recebida.');
            }
        } catch (error) {
            console.error('Erro ao processar dados do EventSource:', error);
        }
    };
});

onUnmounted(() => {
    if (eventSource) {
        eventSource.close();
    }
});

function rowClass(data) {
    if (data.isNew) return 'new-row';
    if (data.updatedColumns && data.updatedColumns.length > 0) return 'updated-row';
    return '';
}

function limparFiltros() {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        Telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        RG: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        Retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        dia_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        hora_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    };
}
</script>

<style>
.new-row {
    background-color: #e0ffe0;
}

.updated-row {
    background-color: #fff5e6;
}
.updated-icon {
    margin-left: 5px;
}
</style>
