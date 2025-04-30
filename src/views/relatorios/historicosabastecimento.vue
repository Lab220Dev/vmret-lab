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
import { FilterMatchMode } from '@primevue/core/api';

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

const { t,locale } = useI18n();

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
 * Referências para os selects de filtros.
 * @type {ref<any>}
 */
const select1 = ref(null);
const select2 = ref(null);
const select3 = ref(null);
const select4 = ref(null);
const select5 = ref(null);

/**
 * Dados do histórico de abastecimento.
 * @type {ref<Array<object>>}
 */
const historico = ref([]);

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
const dms = computed(() => dataStore.dmsOptions);

/**
 * Lista de plantas disponíveis.
 * @type {ref<Array<object>>}
 */
const plantas = computed(() => dataStore.plantasOptions);

/**
 * Lista de setores disponíveis.
 * @type {ref<Array<object>>}
 */
const setor  = computed(() => dataStore.setoresOptions);
const ListaSetorOriginal  = computed(() => dataStore.setoresOptions);

/**
 * Lista de centros de custo disponíveis.
 * @type {ref<Array<object>>}
 */
const centroCusto = computed(() => dataStore.cdcsOptions);

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
 * Função para fechar todos os selects abertos.
 */
const closeAllselects = () => {
    if (select1.value?.overlayVisible) select1.value.hide(); // Fecha o selectdo DM
    if (select2.value?.overlayVisible) select2.value.hide(); // Fecha o selectda planta
    if (select3.value?.overlayVisible) select3.value.hide(); // Fecha o selectdo setor
    if (select4.value?.overlayVisible) select4.value.hide(); // Fecha o selectdo centro de custo
    if (select5.value?.overlayVisible) select5.value.hide(); // Fecha o selectdo operador
};

/**
 * Função para tratar o evento de abertura do date picker.
 * Fecha todos os selects ao abrir o date picker.
 */
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os selects ao abrir o date picker
};
const loadData = async () => {
    loading.value = true;
    try {
        if (!dataStore.dms)(await dataStore.fetchListaDms()); // Carrega a lista de DMs
        if (!dataStore.plantas) await dataStore.fetchPlantas(); // Carrega a lista de plantas
        if (!dataStore.setores) await dataStore.fetchSetores(); // Carrega a lista de setores
        if (!dataStore.cdcs) await dataStore.fetchCdc();// Carrega a lista de centros de custo
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
            <div class="">
                <div class="p-0 m-0 p-fluid formgrid grid col-12" >
                    <!-- Filtro de DM (Documento de Movimento) -->
                    <div class=" py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">{{t('dm')}}:</label>
                        <!-- Componente selectpara escolher o DM -->
                        <Select filter class="w-full" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select1" />
                    </div>
                    <!-- Filtro de Planta -->
                    <div class="py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="planta">{{t('factory')}}:</label>
                        <!-- Componente Select para escolher a planta -->
                        <Select filter class="w-full" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select2" />
                    </div>
                    <!-- Filtro de Setor -->
                    <div class="py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('sector')}}:</label>
                        <!-- Componente Select para escolher o setor -->
                        <Select filter class="w-full" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select3" />
                    </div>
                    <!-- Filtro de Centro de Custo -->
                    <div class=" py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('cost_center')}}:</label>
                        <!-- Componente Select para escolher o centro de custo -->
                        <Select filter class="w-full" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select4" />
                    </div>

                    <!-- Filtro de Operador -->
                    <div class=" py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('operator')}}:</label>
                        <!-- Componente Select para escolher o operador -->
                        <Select filter class="w-full" v-model="relatorio.id_operador" :options="ListaOperador" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select5" />
                    </div>
                    <!-- Filtro de Data Inicial -->
                    <div class=" py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <!-- Componente VueDatePicker para escolher a data inicial -->
                        <VueDatePicker
                            class="w-full"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            :locale="locale"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('initial_date_placeholder')"
                        />
                    </div>
                    <!-- Filtro de Data Final -->
                    <div class=" py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <!-- Componente VueDatePicker para escolher a data final -->
                        <VueDatePicker
                            class="w-full"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                           :locale="locale"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('end_date_placeholder')"
                        />
                    </div>
                    <!-- Botão para filtrar os dados -->
                    <div class=" pt-4 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <Button class="w-full" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
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
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" autocomplete="off"/>
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

</style>
