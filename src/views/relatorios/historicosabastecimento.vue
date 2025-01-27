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
import { ref, onMounted } from 'vue';


/**
 * Importa o componente de spinner de carregamento.
 * @module components/LoadingSpinner.vue
 */
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import {  formatDateToString, formatStringDate } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de autenticação para obter dados de usuário e token

// Definindo referências reativas para a UI e lógica do aplicativo.

/**
 * Flag que controla a exibição do modal de mensagem.
 * @type {ref<boolean>}
 */
const showDialog = ref(false);

/**
 * Mensagem exibida no modal.
 * @type {ref<string>}
 */
const dialogMessage = ref('');

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
const emptyMessage = ref('Ainda não foi feita nenhuma busca');

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
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
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
        
                <!-- Título da página -->
                <h5 class="my-6 ml-2 text-2xl">Histórico de Abastecimento</h5>

                <!-- Condição para exibir os campos de filtro -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12" >
                    <!-- Filtro de DM (Documento de Movimento) -->
                    <div class="field lg:col-4 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Componente Dropdown para escolher o DM -->
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <!-- Filtro de Planta -->
                    <div class="field lg:col-4 md:col-6 sm:col-12">
                        <label for="planta">Planta:</label>
                        <!-- Componente Dropdown para escolher a planta -->
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" />
                    </div>
                    <!-- Filtro de Setor -->
                    <div class="field lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">Setor:</label>
                        <!-- Componente Dropdown para escolher o setor -->
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                    </div>
                    <!-- Filtro de Centro de Custo -->
                    <div class="field lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Centro de Custo:</label>
                        <!-- Componente Dropdown para escolher o centro de custo -->
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" />
                    </div>

                    <!-- Filtro de Operador -->
                    <div class="field lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Operador:</label>
                        <!-- Componente Dropdown para escolher o operador -->
                        <Dropdown class="drop" v-model="relatorio.id_operador" :options="ListaOperador" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
                    </div>
                    <!-- Filtro de Data Inicial -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
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
                            placeholder="Selecione uma data inicial"
                        />
                    </div>
                    <!-- Filtro de Data Final -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
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
                            placeholder="Selecione uma data final"
                        />
                    </div>
                    <!-- Botão para filtrar os dados -->
                    <div class="field lg:col-4 md:col-6 sm:col-12">
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                </div>

                <!-- DataTable para exibição dos resultados do histórico -->
                <div class="mt-6">
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
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    <!-- Campo de entrada para pesquisa global -->
                                </IconField>
                            </div>
                        </template>

                        <!-- Mensagem quando não houver dados -->
                        <template #empty>{{ emptyMessage }} </template>

                        <!-- Definição das colunas da tabela -->
                        <Column field="Maquina" sortable header="DM"></Column>
                        <Column field="Dia" sortable class="table-cell" style="width: 25%" header="Data">
                            <template #body="{ data }">
                                {{formatStringDate(data.Dia) }}
                            </template>
                        </Column>
                        <Column field="Operador" sortable header="Operador"></Column>
                        <Column field="Nome_Produto" sortable header="Item"></Column>
                        <Column field="quantidade_abastecido" sortable header="Quantidade" class="text-center"></Column>
                        <Column field="posicao" sortable header="Posição"></Column>
                    </DataTable>
                </div>
           
    </div>

    <!-- Componente de carregamento (spinner) exibido enquanto a requisição está sendo processada -->
    <LoadingSpinner v-if="loading" />

    <!-- Dialog de erro ou informação -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="true" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <!-- Mensagem exibida no dialog -->
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
            <!-- Botão para fechar o dialog -->
        </template>
    </Dialog>
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
