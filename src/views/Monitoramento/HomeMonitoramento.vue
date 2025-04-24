<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { FilterMatchMode, FilterOperator, FilterService } from '@primevue/core/api';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/authStore';
// Registro de filtro customizado para comparar arrays
const { t, locale } = useI18n();

// Variáveis reativas para os dados, estado de carregamento e erros SSE
const data = ref([]);
const loading = ref(true);
const sseError = ref(false);
const store = useAuthStore();
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
    ID_DM: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    QR_Code_Valido: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    Retorno_Placa: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
});
// Função para limpar os filtros, resetando-os para os valores iniciais
function limparFiltros() {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        ID_DM: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        QR_Code_Valido: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        Retorno_Placa: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    };
}
let eventSource = null;
let reconnectTimeout = null;

// Função para conectar via SSE, com tratamento de erro e reconexão automática
function connectSSE() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    eventSource = new EventSource(`${baseURL}/nomad/updateNomad`, {
        headers: {
            Authorization: 'Bearer ' + store.token
        }
    });

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

function tratarMensagemMaquin(StringMaquina) {
    switch (StringMaquina) {
        case 'EXOK00':
            return 'Passou Produto';
        case 'EXNOK':
            return 'NAO caiu produto';
        case 'EXOKST':
            return ' Processo Ok sem cuidar produto';
        case 'EXLINIV':
            return 'Linha fora de limites';
        case 'EXCOLINV':
            return 'Coluna fora de limites';
        case 'EXTONF':
            return ' Sem motor ligado na saída';
        case 'EXLIMCORR':
            return ' Corrente maxima atingida';
        case 'EXTOST00':
            return 'Timeout de volta';
        case 'EXSC00':
            return 'Sobrecorrente na Coluna';
        case 'EXSC01':
            return 'Sobrecorrente na Linha';
        case 'N':
            return 'Sem resposta da maquina';
        default:
            return StringMaquina;
    }
}
</script>
<template>
    <div class="flex">
        <h2 class="mb-0">
            {{ $t('title') }}
            <hr class="mt-0" />
        </h2>
    </div>

    <!-- Exibe uma mensagem de erro caso a conexão SSE seja interrompida -->
    <div v-if="sseError" class="error-message justify-content-end flex "style="color: #fb2b2b !important; border-radius: 10px;">
        A conexão com o servidor caiu. Tentando reconectar 
        <span class="anim" >
            ...
        </span>
    </div>
    <DataTable
        v-model:filters="filters"
        :value="formattedData"
        stripedRows
        showGridlines
        paginator
        :rows="50"
        :rowsPerPageOptions="[50, 100, 500, 1000]"
        rowHover
        :globalFilterFields="['Nome', 'ID_DM', 'Qr_Code', 'Qr_COde_Valido', 'Retorno_Placa', 'Retorno_Infra']"
        tableStyle="min-width: 50rem; table-layout: fixed;"
        :sortField="'nome'"
        :sortOrder="1"
        filterDisplay="menu"
        :loading="loading"
    >
        <!-- Cabeçalho com total de registros e controles de filtro -->
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div class="border-primary-500 px-4 py-2">
                    <span>{{ $t('totalRecords') }}: {{ data.length }}</span>
                </div>
                <div class="flex justify-content-end align-items-center">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" :placeholder="$t('searchPlaceholder')" />
                    </IconField>
                    <Button class="ml-4" type="button" icon="pi pi-filter-slash" label="Limpar Filtros" outlined @click="limparFiltros()" />
                </div>
            </div>
        </template>

        <!-- Mensagens para quando não houver dados ou durante o carregamento -->
        <template #empty> {{ t('noData') }} </template>
        <template #loading> Carregando registros encontrados, aguarde... </template>

        <!-- Definição das colunas com filtros customizados -->
        <Column field="Nome" :header="$t('ProdutoNome')" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo nome" />
            </template>
        </Column>
        <Column field="ID_DM" :header="$t('MaquinaID')" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela maquina" />
            </template>
        </Column>
        <Column field="Qr_Code" :header="$t('QRCode')" sortable class="table-cell"> </Column>
        <Column field="QR_Code_Valido" :header="$t('QRCodeValido')" sortable>
            <template #body="slotProps">
                {{ slotProps.data.QR_Code_Valido ? 'Valido' : 'Invalido' }}
            </template>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure por um QR Code" />
            </template>
        </Column>
        <Column field="Retorno_Placa" :header="$t('RespostaMaquina')" sortable>
            <template #body="slotProps">
                <span>
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Retirada')" class="pi pi-refresh updated-icon"></i>
                    {{ tratarMensagemMaquin(slotProps.data.Retorno_Placa) }}
                </span>
            </template>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela hora" />
            </template>
        </Column>
    </DataTable>
</template>

<style>

.anim {
    overflow: hidden;
    white-space: nowrap;
    border-right: 0.15em solid #fb2b2b;
    width: 0ch;
    animation: typing 5s steps(5) infinite normal;
}

@keyframes typing {
    from {
        width: 0ch;
    }
    to {
        width: 3ch;
    }
}
</style>
