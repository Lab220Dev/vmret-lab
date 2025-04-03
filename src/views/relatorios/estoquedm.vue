<script setup>
import { ref, onMounted, watch ,computed} from 'vue'; // Importa funções do Vue para reatividade e manipulação do ciclo de vida
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados do usuário autenticado
import { FilterMatchMode } from 'primevue/api'; // Importa a API de filtros do PrimeVue para filtrar a tabela
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento
import estoqueService from '@/services/estoqueService';
import { useDataStore } from '@/store/dataStore.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Declara as variáveis reativas
const loading = ref(false); // Variável para controlar o estado de carregamento
const relatorio = ref({ id_dm: null }); // Objeto para armazenar dados do filtro de DM (Documento de Movimentação)
const todosOption = { label: 'Todos', value: null }; // Opção para o filtro de DM para mostrar todos
const dropdown1 = ref(null); // Referência para o dropdown de DM
const EstoqueDM = ref([]); // Lista de itens de estoque filtrados
const dms  = computed(() => dataStore.dmsOptions); // Lista de DM com a opção de "Todos"
const store = useAuthStore(); // Instancia o store de autenticação
const emptyMessage = computed(() => t('no_search_made')); // Mensagem a ser exibida quando não houver dados
const dataStore = useDataStore(); // Acessa o store de dados para obter informações sobre plantas e outros dados

// Filtros para a DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para busca na tabela
});

// Variável para controlar o número de registros filtrados
const filteredCount = ref(0);

const fetchDM = async () => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        if (!dataStore.dms) await dataStore.fetchListaDms();
    } catch (error) {
        // Se ocorrer erro ao buscar as DM's, exibe no console
        console.error('Erro ao carregar lista de dms:', error);
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

const relatorioDM = async () => {
    loading.value = true; // Ativa o estado de carregamento

    const data = {
        id_cliente: store.userIdCliente, // ID do cliente autenticado
        id_usuario: store.userId, // ID do usuário autenticado
        id_dm: relatorio.value.id_dm // ID da DM selecionada
    };

    try {
        // Envia a requisição para gerar o relatório de estoque
        const response = await estoqueService.relatorioEstoqueDM(data);

        // Preenche a lista de EstoqueDM com a resposta da API
        EstoqueDM.value = response.data;

        // Atualiza o contador de registros filtrados
        filteredCount.value = EstoqueDM.value.length;
    } catch (error) {
        // Se ocorrer erro ao gerar o relatório, exibe no console
        console.error('Erro ao gerar o Relatorio de Estoque das DMS:', error);
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * @function
 * @param {Object} data - O objeto contendo as informações do item, com um campo `modelo` que será usado para determinar o texto.
 * @param {string} data.modelo - O modelo do item, utilizado para decidir qual texto será retornado.
 * @returns {string} Texto traduzido para a tooltip, dependendo do valor de `modelo`.
 */
 const getTooltipText = (data) => {
    // Verifica se o modelo é 2018 e retorna o texto traduzido correspondente a 'placa_mola'.
    if (data.modelo === '2018') {
        return t('placa_mola');
    } 
    // Verifica se o modelo é 2023 e retorna o texto traduzido correspondente a 'andar_posicao'.
    else if (data.modelo === '2023') {
        return t('andar_posicao');
    } 
    // Caso o modelo não seja 2018 nem 2023, retorna o texto traduzido correspondente a 'placa_motor'.
    else {
        return t('placa_motor');
    }
};


watch(
    () => filters.value.global.value, // Observa o valor do filtro global
    () => {
        // Filtra os itens do EstoqueDM com base no valor do filtro global
        filteredCount.value = EstoqueDM.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro e converte para minúsculas
            // Verifica se algum campo do item contém o valor do filtro
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length; // Atualiza o contador de registros filtrados
    },
    { immediate: true } // Chama imediatamente após a montagem para garantir que o filtro esteja pronto
);

/**
 * Função chamada quando o componente é montado.
 * Chama `fetchDM` para carregar os dados iniciais das DM's.
 */
onMounted(() => {
    relatorioDM();
    fetchDM(); // Carrega as DM's quando o componente é montado
});

//truncar texto acima de 15 caracteres
const truncatedText = (text) => {
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
};
</script>

<template>
    <div class="card vh">
        <!-- Contêiner principal da tela -->
        <!-- Título da página <h5 class="my-6 ml-2 text-2xl">{{$t('dm_inventory')}}</h5>-->
        <!-- Dropdown para seleção de DM -->
        <div class="my-2">
            <label for="dm" class="ml-2">{{$t('dispenser_machine')}}:</label>
            <Dropdown id="dm" filter style="width: 200px" v-model="relatorio.id_dm" :options="dms" ref="dropdown1" optionLabel="label" optionValue="value" :placeholder="$t('all')" class="mb-2 ml-2" @change="relatorioDM()" />
        </div>

        <!-- Tabela de Estoque -->
        <DataTable
            class="mt-3"
            v-model:filters="filters"
            :value="EstoqueDM"
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            dataKey="SKU"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :globalFilterFields="['sku', 'nome', 'Posicao', 'quantidade', 'quantidademinima', 'capacidade']"
            selectionMode="single"
            :metaKeySelection="false"
            :sortOrder="1"
            :sortField="'sku'"
            size="Normal"
            columnResizeMode="fit">
            <!-- A tabela exibe os dados provenientes da variável 'EstoqueDM' com várias funcionalidades de interatividade, como filtros, paginação e ordenação. -->
            <!-- O usuário pode filtrar os dados globalmente usando os campos definidos em ':globalFilterFields', como 'sku', 'nome', 'Posicao', 'quantidade', etc. -->
            <!-- A tabela suporta a ordenação inicial pelo campo 'sku' em ordem crescente e permite que o usuário remova a ordenação clicando novamente na coluna. -->
            <!-- A paginação é ativada, permitindo que o usuário navegue pelos dados divididos em páginas, com a opção de escolher quantas linhas exibir por página (5, 10, 20 ou 50). -->
            <!-- As linhas da tabela são listradas e as linhas de grade são exibidas para melhorar a legibilidade dos dados. -->
            <!-- O estilo de "min-width: 50rem" garante que a tabela tenha uma largura mínima, enquanto o layout fixo organiza as colunas de forma clara e consistente. -->

            <!-- Cabeçalho da tabela -->
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{$t('total_records',{count: filteredCount})}}</span>
                        <!-- Exibe o total de registros filtrados -->
                    </div>
                    <div>
                        <!-- Filtro global -->
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                                <!-- Ícone de pesquisa -->
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                            <!-- Campo de pesquisa -->
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty>  {{ $t('empty_message') }}</template>

            <!-- Definição das colunas da tabela -->
            <Column field="sku" class="table-cell" sortable style="width: 8%;" :header="t('SKU')">
            
                <template #body="{ data }">
                    <span class="tooltip-target" v-tooltip="data.sku">{{ truncatedText(data.sku) }}</span>
                </template>
            
            </Column>
            <Column field="nome" class="table-cell" sortable :header="t('product')">
                <template #body="{ data }">
                    <span class="tooltip-target" v-tooltip="data.nome">{{ truncatedText(data.nome) }}</span>
                </template>
            </Column>
            <Column field="Posicao" sortable style="width: 10%; text-align: center" :header="t('position')">
                <template #body="{ data }">
                    <span v-tooltip="getTooltipText(data)">
                        {{ data.Posicao }}
                    </span>
                    <!-- Exibe a posição do produto com tooltip condicional -->
                </template>
            </Column>
            <Column field="quantidade" :header="t('quantity')" sortable style="width: 12%; text-align: center">

            </Column>
            <Column field="quantidademinima" sortable style="width: 12%; text-align: center">
                <template #header>
                    <span v-tooltip="$t('minimum_quantity')">{{t('minimal_quantity')}}</span>
                    <!-- Tooltip para a coluna de quantidade mínima -->
                </template>
            </Column>
            <!-- Coluna para capacidade -->
            <Column field="capacidade" sortable style="width: 10%; text-align: center" :header="t('capacity')"></Column>
        </DataTable>

        <!-- Spinner de carregamento exibido enquanto a requisição está em andamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style>
.card {
    overflow-x: auto; /* Permite rolagem horizontal quando o conteúdo exceder a largura */
}

.datatable-wrapper {
    overflow-x: auto; /* Permite rolagem horizontal da tabela */
    width: 100vw; /* Largura total da tela */
}

.filtrar {
    margin-top: 25px; /* Espaçamento superior */
}

.drop {
    width: 100%; /* Largura total do dropdown */
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
    white-space: nowrap; /* Impede quebra de linha */
    text-align: left; /* Alinha o texto à esquerda */
}

.table-cell {
    overflow: hidden; /* Oculta o texto que excede o tamanho da célula */
    white-space: nowrap; /* Impede quebra de linha */
    text-overflow: ellipsis; /* Exibe reticências (...) quando o texto excede o tamanho */
}

/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
