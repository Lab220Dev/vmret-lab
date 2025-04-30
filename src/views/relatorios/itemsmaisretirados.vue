<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente de calendário (datepicker)
import { FilterMatchMode } from '@primevue/core/api'; // Importa o tipo de filtro para a tabela (DataTable) do PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa a função para exibir mensagens de toast (notificações)
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o estilo do componente VueDatePicker
import { ref, onMounted, computed, nextTick, watch } from 'vue'; // Importa funções reativas e de ciclo de vida do Vue
import { useDataStore } from '@/store/dataStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { filtroGenericoReltorio, gerarEbaixarCSV, gerarEbaixarJSON, formatDateToString, formatTimeToString, isMobileDevice } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import { useI18n } from 'vue-i18n';

import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png'; // Importa o ícone de exportação csv

const { t, locale } = useI18n();
/**
 * @type {Ref<boolean>}
 * Flag que controla a exibição do modal de mensagem.
 * @default false
 */
const showDialog = ref(false);

/**
 * @type {Ref<string>}
 * Armazena a mensagem a ser exibida no modal de mensagem.
 * @default ''
 */
const dialogMessage = ref('');

/**
 * @type {Ref<number>}
 * Contador de registros filtrados para exibição na interface.
 * @default 0
 */
const filteredCount = ref(0);

/**
 * @type {ReturnType<typeof useAuthStore>}
 * Armazena a instância do store de autenticação.
 */
const dataStore = useDataStore();
/**
 * @type {ReturnType<typeof useToast>}
 * Armazena o serviço de toast para exibir notificações de sucesso ou erro.
 */
const toast = useToast();

/**
 * @type {Ref<string>}
 * Mensagem padrão exibida quando não há dados encontrados.
 * @default 'Ainda não foi feita nenhuma busca'
 */
const emptyMessage = computed(() => t('no_search_made'));

/**
 * @type {Ref<any>}
 * Referência para o primeiro select(DM).
 */
const select1 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o segundo select(Planta).
 */
const select2 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o terceiro select(Setor).
 */
const select3 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o quarto select(Centro de Custo).
 */
const select4 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o quinto select(Funcionário).
 */
const select5 = ref(null);

/**
 * @type {Ref<Array<any>>}
 * Armazena os dados de retiradas recuperados.
 * @default []
 */
const retiradas = ref([]);

/**
 * @type {Object}
 * Define a opção "Todos" como valor padrão para filtros de seleção.
 */
const todosOption = { label: 'Todos', value: null };

// Declarações das listas de dados filtráveis (DMs, Plantas, Setores, Centros de Custo, Funcionários)
/**
 * @type {Ref<Array<any>>}
 * Lista de DMs (Documentos de Medição).
 * @default [todosOption]
 */
const dms = computed(() => dataStore.dmsOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista de Plantas.
 * @default [todosOption]
 */
const plantas = computed(() => dataStore.plantasOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista de Centros de Custo.
 * @default [todosOption]
 */
const centroCusto = computed(() => dataStore.cdcsOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista original de funcionários.
 * @default []
 */
const ListaFuncionariosOriginal = computed(() => dataStore.funcionariosOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista filtrada de funcionários.
 * @default []
 */
const ListaFuncionarios = computed(() => dataStore.funcionariosOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista original de setores.
 * @default []
 */
const ListaSetorOriginal = computed(() => dataStore.setoresOptions);

/**
 * @type {Ref<Array<any>>}
 * Lista filtrada de setores.
 * @default []
 */
const ListaSetor = computed(() => dataStore.setoresOptions);

/**
 * @type {Ref<Object>}
 * Filtro global para a tabela. O filtro é baseado no valor digitado pelo usuário.
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const show = ref(false); //Flag que controla a exibição da tabela de resultados.

const selectedItem = ref([]); //Armazena o item selecionado para exibição de detalhes.

const loading = ref(false); //Flag que controla a exibição do spinner de carregamento.

const relatorio = ref({
    //Relatório que contém os filtros selecionados para a consulta (DM, Planta, Setor, Centro de Custo, etc).
    id_dm: '',
    id_planta: null,
    ID_CentroCusto: '',
    id_setor: null,
    id_funcionario: null,
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1º dia do mês atual
    data_final: new Date() // data atual
});

const buscar = async () => {
    //Função de busca que envia os parâmetros para a API e recebe os dados das retiradas.
    try {
        loading.value = true; // Ativa a flag de carregamento
        retiradas.value = await relatorioService.itemsMaisRetiradas(relatorio);
        // Atualiza a contagem de registros filtrados
        filteredCount.value = retiradas.value.length;

        // Se não houver dados, exibe mensagem informativa
        if (retiradas.value.length === 0) {
            emptyMessage.value = t('no_data_found'); // Mensagem de erro
        } else {
            emptyMessage.value = ''; // Limpa a mensagem de erro
        }

        // Caso não haja resultados, exibe o diálogo de erro
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = t('no_data_found'); // Mensagem de erro no modal
            showDialog.value = true; // Exibe o modal com a mensagem de erro
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('title'),
            life: 3000,
            detail: t('fetch_data')
        });
        console.error('Erro ao buscar dados:', error); // Exibe erro no console se ocorrer falha
    } finally {
        loading.value = false; // Desativa o carregamento ao finalizar a requisição
    }
};

watch(
    //Reage à mudança no filtro global e atualiza a contagem de itens filtrados.
    () => filters.value.global.value,
    () => {
        filteredCount.value = retiradas.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro global e converte para minúsculo
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor do item contém o filtro
        }).length; // Atualiza a contagem de itens filtrados
    },
    { immediate: true } // Executa a função de imediato após a montagem
);

/**
 * Função chamada ao selecionar uma linha na tabela.
 * @param {Object} event - O evento de seleção da linha da tabela.
 */
const onRowSelect = (event) => {
    show.value = true; // Exibe a seção de detalhes
    selectedItem.value = event.data.Detalhes; // Armazena os detalhes do item selecionado

    // Scroll para o cartão de detalhes ao selecionar o item
    nextTick(() => {
        const detailsCard = document.querySelector('.details-card');
        if (detailsCard) {
            detailsCard.scrollIntoView({ behavior: 'smooth' }); // Rola suavemente até o cartão de detalhes
        }
    });
};

// Função para voltar à lista principal e esconder os detalhes
const voltar = () => {
    show.value = false; // Esconde a seção de detalhes
    selectedItem.value = {}; // Limpa o item selecionado
};

// Referência para a tabela DataTable
const dt = ref(null);

// Função para exportar os dados para um arquivo CSV
const exportCSV = () => {
    gerarEbaixarCSV('ItensMaisRetirados', retiradas.value);
};

// Função para exportar os dados para um arquivo JSON
const exportJSON = () => {
    gerarEbaixarJSON('ItensMaisRetirados', retiradas.value);
};

const loadData = async () => {
    loading.value = true;
    try {
        if (!dataStore.dms) await dataStore.fetchListaDms(); // Carrega a lista de DMs
        if (!dataStore.plantas) await dataStore.fetchPlantas(); // Carrega a lista de plantas
        if (!dataStore.setores) await dataStore.fetchSetores(); // Carrega a lista de setores
        if (!dataStore.cdcs) await dataStore.fetchCdc(); // Carrega a lista de centros de custo
        if (!dataStore.funcionarios) await dataStore.fetchFuncionarios(); // Carrega a lista de funcionários
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('title'),
            life: 3000,
            detail: t('fetch_data')
        });
    } finally {
        loading.value = false;
    }
};
const filtroGenerico = () => {
    filtroGenericoReltorio(relatorio, ListaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor);
};

// Função para fechar todos os selects abertos
const closeAllselects = () => {
    if (select1.value?.overlayVisible) select1.value.hide(); // Fecha o selectde DM
    if (select2.value?.overlayVisible) select2.value.hide(); // Fecha o selectde Planta
    if (select3.value?.overlayVisible) select3.value.hide(); // Fecha o selectde Setor
    if (select4.value?.overlayVisible) select4.value.hide(); // Fecha o selectde Funcionário
    if (select5.value?.overlayVisible) select5.value.hide(); // Fecha o selectde Centro de Custo
};

// Função para fechar os selects quando o datepicker for aberto
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os selects
};

const isMobile = isMobileDevice(); //Retorna `true` se o dispositivo for móvel, ou `false` caso contrário.

// Função chamada ao montar o componente
onMounted(async () => {
    await loadData();
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div>
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <div class="field py-0 my-0 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="id_dm">{{ t('dispenser_machine') }}:</label>
                        <!-- selectpara selecionar o DM (documento de medição) -->
                        <Select filter class="w-full" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select1" />
                    </div>

                    <!-- Filtro para Centro de Custo -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('cost_center') }}</label>
                        <!-- selectpara selecionar o centro de custo -->
                        <Select filter class="w-full" v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select3" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro para Setor -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('sector') }}</label>
                        <!-- selectpara selecionar o setor -->
                        <Select filter class="w-full" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select4" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro para Planta -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="planta">{{ t('factory') }}:</label>
                        <!-- selectpara selecionar a planta -->
                        <Select filter class="w-full" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select2" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro para Funcionário -->
                    <div class="field py-0 mt-3 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('employee') }}:</label>
                        <!-- selectpara selecionar o funcionário -->
                        <Select filter class="w-full" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select5" />
                    </div>

                    <!-- Filtro para Data Inicial -->
                    <div class="field py-0 mt-3 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('initial_date') }}:</label>
                        <!-- DataPicker para selecionar a data inicial -->
                        <VueDatePicker
                            class="w-full"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            :locale="locale"
                            :enable-time-picker="false"
                            auto-apply
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('initial_date_placeholder')"
                        />
                    </div>

                    <!-- Filtro para Data Final -->
                    <div class="field py-0 mt-3 xl:col-3 lg:col-3 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('end_date') }}:</label>
                        <!-- DataPicker para selecionar a data final -->
                        <VueDatePicker
                            class="w-full"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            :locale="locale"
                            :enable-time-picker="false"
                            auto-apply
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('end_date_placeholder')"
                        />
                    </div>

                    <!-- Botão de Filtrar -->
                    <div class="pt-6 mt-0 field xl:col-3 lg:col-3 md:col-12 sm:col-12">
                        <Button class="w-full" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- Botão para exportar dados em CSV -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                        <Button class="exportar" icon="pi pi-file" :label="$t('export_csv')" @click="exportCSV"></Button>
                    </div>

                    <!-- Botão para exportar dados em JSON -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                        <Button class="exportar" icon="pi pi-file" :label="$t('export_json')" @click="exportJSON"></Button>
                    </div>
                </div>
            </div>

            <!-- WEB - Se for mobile não é para mostrar esse ícones -->
        </div>
        <div v-if="!isMobile" class="flex justify-content-start align-items-center">
            <!-- Imagem para exportar dados em CSV -->
            <div class="">
                <img :src="exportCsv" alt="Export CSV" @click="exportCSV" style="cursor: pointer" width="70" height="70" />
            </div>

            <!-- Imagem para exportar dados em JSON -->
            <div class="">
                <img :src="exportJson" alt="Export JSON" @click="exportJSON" style="cursor: pointer" width="70" height="70" />
            </div>
        </div>

        <!-- DataTable para exibir os resultados do relatório -->

        <DataTable
            v-model:filters="filters"
            :value="retiradas"
            stripedRows
            showGridlines
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            rowHover
            @rowSelect="onRowSelect"
            :globalFilterFields="['ProdutoNome', 'Quantidade', 'ProdutoSKU']"
            selectionMode="single"
            removableSort
            class="mt-6"
            :sortOrder="1"
            :sortField="'ProdutoSKU'"
            ref="dt"
            :tableStyle="{ width: '100%' }"
        >
            <!-- A tabela exibe os dados provenientes de 'retiradas', com informações sobre os produtos retirados -->
            <!-- As linhas são alternadas com cores listradas para melhorar a legibilidade -->
            <!-- As linhas de grade (linhas de divisão) são exibidas, facilitando a leitura das células -->
            <!-- A paginação é habilitada para dividir os dados em páginas -->
            <!-- O número de linhas por página é configurado para 10, mas o usuário pode escolher entre 5, 10, 20 ou 50 linhas por página -->
            <!-- Um efeito de destaque é aplicado nas linhas quando o mouse passa sobre elas -->
            <!-- A tabela permite a seleção de apenas uma linha por vez -->
            <!-- A ordenação inicial é aplicada com base no campo 'ProdutoSKU' em ordem crescente -->
            <!-- O estilo da tabela é configurado para ocupar 100% da largura disponível -->

            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-start">
                        <!-- Exibe o total de registros filtrados -->
                        <span>{{ $t('total_records', { count: filteredCount }) }}</span>
                    </div>
                    <div>
                        <!-- Filtro global de pesquisa -->
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" autocomplete="off"/>
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty>{{ emptyMessage }} </template>
            <!-- Colunas da tabela -->
            <Column field="ProdutoNome" sortable :header="t('item')"></Column>
            <Column field="quantidade_no_periodo" sortable style="width: 15%" :header="t('quantity')" class="text-center"></Column>
            <Column field="ProdutoSKU" sortable style="width: 15%" :header="t('ca')"></Column>
        </DataTable>

        <!-- Exibe os detalhes do produto em um modal -->
        <card v-if="show" class="card mt-5">
            <template #title> {{ $t('details') }}: </template>
            <template #content>
                <DataTable class="mt-4" :value="selectedItem" stripedRows removableSort showGridlines paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" rowHover>
                    <Column field="Identificacao" sortable :header="t('dm')"></Column>
                    <Column field="ProdutoNome" sortable :header="t('item')"></Column>
                    <Column field="Data" sortable :header="t('date')"></Column>
                    <Column field="Quantidade" sortable :header="t('quantity')"> </Column>
                    <Column field="ProdutoSKU" sortable :header="t('SKU')"></Column>
                </DataTable>
            </template>
        </card>
    </div>

    <!-- Spinner de carregamento, exibido enquanto os dados estão sendo carregados -->
    <LoadingSpinner v-if="loading" />

    <!-- Diálogo de erro com a mensagem de erro -->
    <Dialog :header="t('info')" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style></style>
