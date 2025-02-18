<script setup>
/**
 * Importa o componente `VueDatePicker` para exibição de seletor de data.
 * @module @vuepic/vue-datepicker
 */
import VueDatePicker from '@vuepic/vue-datepicker';

/**
 * Importa o tipo `FilterMatchMode` para configurar os filtros no componente DataTable.
 * @module primevue/api
 */
import { FilterMatchMode } from 'primevue/api';

/**
 * Importa o serviço de Toast para exibição de mensagens rápidas para o usuário.
 * @module primevue/usetoast
 */
import { useToast } from 'primevue/usetoast';

/**
 * Importa o CSS necessário para o VueDatePicker.
 * @module @vuepic/vue-datepicker/dist/main.css
 */
import '@vuepic/vue-datepicker/dist/main.css';

/**
 * Importa as funções reativas e do ciclo de vida do Vue, como `ref`, `onMounted`, e `watch`.
 * @module vue
 */
import { ref, onMounted,computed } from 'vue';
import { useI18n } from 'vue-i18n';
/**
 * Importa o componente de spinner de carregamento.
 * @module components/LoadingSpinner.vue
 */
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import {  formatDateToString, formatStringDate } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de autenticação para obter dados de usuário e token

// Definindo referências reativas para a UI e lógica do aplicativo.

const { t } = useI18n();

/**
 * Contagem de registros filtrados.
 * @type {ref<number>}
 */
const filteredCount = ref(0);

/**
 * Flag para exibir ou não o spinner de carregamento.
 * @type {ref<boolean>}
 */
const loading = ref(false);

/**
 * Armazena a store de autenticação para o usuário atual.
 * @type {object}
 */
const dataStore = useDataStore(); // Obtém o store de autenticação (para acessar o token e dados do usuário)

/**
 * Serviço de Toast para exibir mensagens.
 * @type {object}
 */
const toast = useToast();

/**
 * Mensagem padrão quando não há dados encontrados.
 * @type {ref<string>}
 */
 const emptyMessage = computed(() => t('no_search_made'));

/**
 * Referências para os dropdowns de filtros.
 * @type {ref<any>}
 */
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

/**
 * Dados do histórico de abastecimento.
 * @type {ref<Array<object>>}
 */
const historico = ref([]);

/**
 * Opção para exibir todos os itens no filtro.
 * @type {object}
 */
const todosOption = { label: 'Todos', value: null };

/**
 * Lista de operadores disponíveis.
 * @type {ref<Array<object>>}
 */
const ListaOperador = ref(null);
const ListaOperadorOriginal = ref(null);

/**
 * Lista de DM's disponíveis.
 * @type {ref<Array<object>>}
 */
const dms = ref([todosOption]);

/**
 * Lista de plantas disponíveis.
 * @type {ref<Array<object>>}
 */
const plantas = ref([todosOption]);

/**
 * Lista de setores disponíveis.
 * @type {ref<Array<object>>}
 */
const setor = ref([todosOption]);
const ListaSetorOriginal = ref([todosOption]);

/**
 * Lista de centros de custo disponíveis.
 * @type {ref<Array<object>>}
 */
const centroCusto = ref([todosOption]);

/**
 * Objeto contendo os filtros globais para o DataTable.
 * @type {ref<object>}
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que procura correspondências parciais
});

/**
 * Objeto contendo os dados do relatório, com filtros específicos.
 * @type {ref<object>}
 */
const relatorio = ref({
    dm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_operador: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data inicial (1º dia do mês atual)
    data_final: new Date() // Data final (data atual)
});

/**
 * Função para buscar o histórico de abastecimento com base nos filtros.
 * @async
 * @returns {Promise<void>}
 */
 const buscar = async () => {
    try {
        loading.value = true;
        historico.value = await relatorioService.historicoAbastecimento(relatorio);
        filteredCount.value = historico.value.length;

        if (historico.value.length === 0) {
            emptyMessage.value = t('no_data_found');
        } else {
            emptyMessage.value = '';
        }
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};


/**
 * Função para fechar todos os dropdowns abertos.
 */
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown do DM
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown da planta
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o dropdown do setor
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o dropdown do centro de custo
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o dropdown do operador
};

/**
 * Função para tratar o evento de abertura do date picker.
 * Fecha todos os dropdowns ao abrir o date picker.
 */
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns ao abrir o date picker
};
const loadData = async () => {
    loading.value = true;
    try {
        dms.value = dataStore.dms || (await dataStore.fetchListaDms()); // Carrega a lista de DMs
        plantas.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega a lista de plantas
        ListaSetorOriginal.value = dataStore.setores || (await dataStore.fetchSetores()); // Carrega a lista de setores
        setor.value = ListaSetorOriginal.value; // Carrega a lista de setores
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega a lista de centros de custo
        ListaOperador.value = await relatorioService.listaOperador();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life:3000,detail: error.message });
    }finally{
        loading.value = false;
    }
   
};
// Função executada quando o componente é montado.
// Carrega todas as opções de filtros ao carregar o componente.
onMounted(() => {
    loadData();
});
</script>

<template>
    <!-- Card container para o conteúdo -->
    <div class="card vh">
        <div class="form">
            <div class="text-center">
                <div class="p-0 m-0 p-fluid formgrid grid col-12" >
                    <!-- Filtro de DM (Documento de Movimento) -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">{{t('dm')}}:</label>
                        <!-- Componente Dropdown para escolher o DM -->
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown1" />
                    </div>
                    <!-- Filtro de Planta -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="planta">{{t('factory')}}:</label>
                        <!-- Componente Dropdown para escolher a planta -->
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown2" />
                    </div>
                    <!-- Filtro de Setor -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('sector')}}:</label>
                        <!-- Componente Dropdown para escolher o setor -->
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown3" />
                    </div>
                    <!-- Filtro de Centro de Custo -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('cost_center')}}:</label>
                        <!-- Componente Dropdown para escolher o centro de custo -->
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown4" />
                    </div>

                    <!-- Filtro de Operador -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('operator')}}:</label>
                        <!-- Componente Dropdown para escolher o operador -->
                        <Dropdown class="drop" v-model="relatorio.id_operador" :options="ListaOperador" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown5" />
                    </div>
                    <!-- Filtro de Data Inicial -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <!-- Componente VueDatePicker para escolher a data inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('initial_date_placeholder')"
                        />
                    </div>
                    <!-- Filtro de Data Final -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <!-- Componente VueDatePicker para escolher a data final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('end_date_placeholder')"
                        />
                    </div>
                    <!-- Botão para filtrar os dados -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <Button class="filtrar" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                </div>
            </div>
        </div>

                <!-- DataTable para exibição dos resultados do histórico -->
                <div class="mt-3">
                    <DataTable
                        v-model:filters="filters"
                        :value="historico"
                        stripedRows
                        showGridlines
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['ID_DM', 'Data', 'operador', 'item', 'Quantidade', 'Mola']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                        :sortField="'ID_DM'"
                        :sortOrder="1"
                    >
                        <!-- Filtragem global ativada -->
                        <!-- Dados da tabela --><!-- Linhas alternadas para melhorar a legibilidade -->
                        <!-- Exibe as linhas da tabela -->
                        <!-- Paginação habilitada -->
                        <!-- Número de linhas por página -->
                        <!-- Opções de linhas por página -->
                        <!-- Destaca as linhas quando o mouse passa por cima -->
                        <!-- Campos que podem ser filtrados globalmente -->
                        <!-- Estilo para a tabela ocupar toda a largura disponível -->
                        <!-- Referência para o DataTable -->
                        <!-- Campo de ordenação inicial -->
                        <!-- Ordem crescente de classificação -->

                        <!-- Cabeçalho da tabela -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <!-- Campo de busca dentro da tabela -->
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                    <!-- Campo de entrada para pesquisa global -->
                                </IconField>
                            </div>
                        </template>

                        <!-- Mensagem quando não houver dados -->
                        <template #empty>{{ emptyMessage }} </template>

                        <!-- Definição das colunas da tabela -->
                        <Column field="Maquina" sortable  :header="t('dm')"></Column>
                        <Column field="Dia" sortable class="table-cell" style="width: 25%" :header="t('date')">
                            <template #body="{ data }">
                                {{formatStringDate(data.Dia) }}
                            </template>
                        </Column>
                        <Column field="Operador" sortable :header="t('operator')"></Column>
                        <Column field="Nome_Produto" sortable :header="t('item')"></Column>
                        <Column field="quantidade_abastecido" sortable :header="t('quantity')" class="text-center"></Column>
                        <Column field="posicao" sortable :header="t('position')"></Column>
                    </DataTable>
                </div>
           
    </div>

    <!-- Componente de carregamento (spinner) exibido enquanto a requisição está sendo processada -->
    <LoadingSpinner v-if="loading" />

</template>
<style>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow: hidden;
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
