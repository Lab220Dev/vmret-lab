<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { FilterMatchMode, FilterOperator, FilterService } from '@primevue/core/api';

// Registro de filtro customizado para comparar arrays
FilterService.register('filterByArrayEquals', (arr, value) => {
    if (!value) {
        return true;
    }
    return arr.includes(value);
});

// Variáveis reativas para os dados, estado de carregamento e erros SSE
const data = ref([]);
const loading = ref(true);
const sseError = ref(false);

// Função auxiliar para formatação da data
function formatDate(dateStr) {
    if (!dateStr) return { dateObj: null, formatted: '' };
    // Considera o formato dd/mm/yyyy
    const [day, month, year] = dateStr.split('/');
    const dateObj = new Date(year, month - 1, day);
    // Ajusta para o fuso horário UTC-3
    dateObj.setHours(dateObj.getHours() + 3);
    return { dateObj, formatted: dateObj.toLocaleDateString('pt-BR') };
}

// Computed property que formata os dados antes de exibi-los na tabela
const formattedData = computed(() => {
    return data.value.map((item) => {
        if (item.dia_retirada) {
            const { dateObj, formatted } = formatDate(item.dia_retirada);
            return {
                ...item,
                dia_retirada: dateObj,
                dia_retirada_formatada: formatted
            };
        } else {
            return { ...item, dia_retirada: null, dia_retirada_formatada: '' };
        }
    });
});

// Configuração dos filtros, sem duplicação de campos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    Telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    RG: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    Retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    dia_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    hora_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
});

let eventSource = null;
let reconnectTimeout = null;

// Função para conectar via SSE, com tratamento de erro e reconexão automática
function connectSSE() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    eventSource = new EventSource(`${baseURL}/evento/updateNomad`);

    eventSource.onmessage = (event) => {
        try {
            const updates = JSON.parse(event.data);
            if (updates) {
                data.value = Array.isArray(updates) ? updates : [];
            }
            // Após a primeira mensagem, encerra o estado de carregamento
            loading.value = false;
            sseError.value = false;
        } catch (error) {
            console.error('Erro ao processar dados do EventSource:', error);
        }
    };

    // Tratamento de erro e reconexão em caso de falha na conexão SSE
    eventSource.onerror = (error) => {
        console.error('Erro no EventSource:', error);
        sseError.value = true;
        loading.value = false;
        if (eventSource) {
            eventSource.close();
        }
        // Tenta reconectar após 5 segundos, caso a conexão falhe
        if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
                connectSSE();
                reconnectTimeout = null;
            }, 5000);
        }
    };
}

onMounted(() => {
    connectSSE();
});

onUnmounted(() => {
    if (eventSource) {
        eventSource.close();
    }
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
});

// Função para limpar os filtros, resetando-os para os valores iniciais
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
<template>
    <h1>Dados do evento</h1>
    <!-- Exibe uma mensagem de erro caso a conexão SSE seja interrompida -->
    <div v-if="sseError" class="error-message">A conexão com o servidor caiu. Tentando reconectar...</div>
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
        <!-- Cabeçalho com total de registros e controles de filtro -->
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
                        <InputText v-model="filters['global'].value" placeholder="Busca" autocomplete="off"/>
                    </IconField>
                    <Button class="ml-4" type="button" icon="pi pi-filter-slash" label="Limpar Filtros" outlined @click="limparFiltros()" />
                </div>
            </div>
        </template>

        <!-- Mensagens para quando não houver dados ou durante o carregamento -->
        <template #empty> Nenhum registro encontrado </template>
        <template #loading> Carregando registros encontrados, aguarde... </template>

        <!-- Definição das colunas com filtros customizados -->
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
                <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="Selecione o dia" :showIcon="true" />
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
.error-message {
    color: red;
    margin-bottom: 1rem;
}
</style>
