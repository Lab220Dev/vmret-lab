<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente de data picker para selecionar as datas
import { FilterMatchMode } from '@primevue/core/api'; // Importa o modo de correspondência para filtros no PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa o hook do PrimeVue para mostrar notificações
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS do componente de data picker
import { ref, onMounted, watch, computed } from 'vue'; // Importa funções do Vue para reatividade e manipulação de ciclo de vida
import axios from '@/axios.js'; // Importa a configuração do Axios para fazer requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados de usuário
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados para acessar listas e informações
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de carregamento
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import {filtroGenericoReltorio,gerarEbaixarCSV,gerarEbaixarJSON, isMobileDevice} from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import { useI18n } from 'vue-i18n';

import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png'; // Importa o ícone de exportação csv

const { t, locale } = useI18n();
const dataStore = useDataStore(); // Instancia o store de dados
const showDialog = ref(false); // Estado reativo para controlar a visibilidade de uma caixa de diálogo
const dialogMessage = ref(''); // Estado reativo para armazenar a mensagem a ser exibida no diálogo

const filteredCount = ref(0); // Conta os itens filtrados para exibição

const store = useAuthStore(); // Instancia o store de autenticação
const toast = useToast(); // Instancia o hook de toast para notificações

const emptyMessage = computed(() => t('no_search_made')); // Mensagem padrão quando não há resultados
const select1 = ref(null); // Referência para o primeiro select
const select2 = ref(null); // Referência para o segundo select
const select3 = ref(null); // Referência para o terceiro select
const select4 = ref(null); // Referência para o quarto select
const select5 = ref(null); // Referência para o quinto select

const devolucoes = ref([]); // Lista de devoluções retornadas pela API

const dms = computed(() => dataStore.dmsOptions); // Lista de DMs (dados de movimentação) para o filtro
const plantas = computed(() => dataStore.plantasOptions);  // Lista de plantas para o filtro
const centroCusto= computed(() => dataStore.cdcsOptions);  // Lista de centros de custo para o filtro

const ListaFuncionariosOriginal = computed(() => dataStore.funcionariosOptions); // Lista original de funcionários
const ListaFuncionarios = computed(() => dataStore.funcionariosOptions);// Lista de funcionários filtrada

const ListaSetorOriginal = computed(() => dataStore.setoresOptions); // Lista original de setores
const ListaSetor  = computed(() => dataStore.setoresOptions); // Lista de setores filtrada

// Filtros gerais para a tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para pesquisa na tabela
});

const show = ref(true); // Estado reativo para controlar a exibição da tabela de dados

const selectedItem = ref([]); // Estado reativo para armazenar item selecionado

const loading = ref(false); // Estado reativo para controlar a exibição do spinner de carregamento

// Objeto do relatório com filtros aplicados
const relatorio = ref({
    id_dm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data inicial (primeiro dia do mês)
    data_final: new Date() // Data final (data atual)
});

/**
 * Função para formatar uma data no formato dd/MM/yyyy.
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada no padrão "dd/MM/yyyy"
 */
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Meses começam do 0, então somamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

// Função para converter a data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

// Função para buscar as devoluções de acordo com os filtros selecionados
const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente (proveniente do store de autenticação)
        id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm, // Filtro de DM, se não estiver vazio
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // Filtro de funcionário, se não estiver vazio
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início
        data_final: toISODate(relatorio.value.data_final) // Data de término
    };
    try {
        loading.value = true; // Ativa o carregamento enquanto a requisição é realizada
        const response = await axios.post('devolucoes/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Passa o token de autenticação no cabeçalho
            }
        });
        devolucoes.value = response.data; // Armazena os dados retornados pela API na variável devolucoes

        filteredCount.value = devolucoes.value.length; // Atualiza o contador de registros filtrados

        // Se não houver resultados, exibe uma mensagem de erro
        if (Array.isArray(devolucoes.value) && devolucoes.value.length === 0) {
            dialogMessage.value = t('no_data_found');
            showDialog.value = true; // Abre a caixa de diálogo com a mensagem de erro
        }
        // Se não houver resultados, altera a mensagem padrão
        if (devolucoes.value.length === 0) {
            emptyMessage.value = t('no_data_found');
        } else {
            emptyMessage.value = ''; // Limpa a mensagem se houver resultados
        }
    } catch (error) {
        console.error('Erro ao buscar devoluções:', error); // Exibe erro no console caso a requisição falhe
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

// Reage a mudanças no filtro global e atualiza o contador de registros filtrados
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = devolucoes.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo corresponde ao filtro
        }).length;
    },
    { immediate: true }
);

// Função para voltar à visualização da tabela após a visualização de um item
const voltar = () => {
    show.value = true; // Exibe a tabela de dados
    selectedItem.value = {}; // Limpa o item selecionado
};
const dt = ref(null); // Referência para o DataTable


// Função para exportar os dados em formato CSV
const exportCSV = () => {
    gerarEbaixarCSV('Devoluções', devolucoes.value);
};

// Função para exportar os dados em formato JSON
const exportJSON = () => {
    gerarEbaixarJSON('Devoluções', devolucoes.value);
};

// Função para fechar todos os selects
const closeAllselects = () => {
    if (select1.value?.overlayVisible) select1.value.hide(); // Fecha o primeiro select
    if (select2.value?.overlayVisible) select2.value.hide(); // Fecha o segundo select
    if (select3.value?.overlayVisible) select3.value.hide(); // Fecha o terceiro select
    if (select4.value?.overlayVisible) select4.value.hide(); // Fecha o quarto select
    if (select5.value?.overlayVisible) select5.value.hide(); // Fecha o quinto select
};

// Função para carregar os dados iniciais dos filtros
const loadData = async () => {
    loading.value = true;
    try {
        if (!dataStore.plantas) await dataStore.fetchPlantas();
        if (!dataStore.dms) await dataStore.fetchListaDms();
        if (!dataStore.setores) await dataStore.fetchSetores();
        if (!dataStore.cdcs) await dataStore.fetchCdc();
        if (!dataStore.produtos) await dataStore.fetchProdutos();
        if (!dataStore.funcionarios) await dataStore.fetchFuncionarios();
        // O operador || verifica se o valor já está armazenado no store, caso contrário, faz a chamada para obter os dados
        // dms.value = dataStore.dms || (await dataStore.fetchListaDms()); // Carrega a lista de DMs
        // plantas.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega a lista de plantas
        // ListaSetorOriginal.value = dataStore.setores || (await dataStore.fetchSetores()); // Carrega a lista de setores
        // ListaSetor.value = ListaSetorOriginal.value; // Carrega a lista de setores
        // centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega a lista de centros de custo
        // ListaFuncionariosOriginal.value = await relatorioService.listaFuncionario();
        // ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Carrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Exibe erro caso haja falha no carregamento dos dados
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

const filtroGenerico = () => {
    filtroGenericoReltorio(relatorio, ListaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor);
};
// Função chamada quando o datepicker é aberto, fecha todos os selects
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os selects
};

const isMobile = isMobileDevice();

// Função chamada quando o componente é montado
onMounted(() => {
    loadData(); // Carrega os dados iniciais
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="id_dm">{{t('dm')}}:</label>
                        <Select filter class="w-full" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" ref="select1" :placeholder="$t('all')" />
                    </div>

                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('cost_center')}}:</label>
                        <Select filter class="w-full" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="select3" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('sector')}}:</label>
                        <Select filter class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value":placeholder="$t('all')"  ref="select4" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="planta">{{t('factory')}}:</label>
                        <Select filter class="w-full" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="select2" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 mt-3 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('employee')}}:</label>
                        <Select filter class="w-full" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="select5" />
                    </div>
                    <div class="field py-0 mt-3 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            :locale="locale"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('initial_date_placeholder')"
                            teleport="body"
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field py-0 mt-3 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            :locale="locale"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('end_date_placeholder')"
                            teleport="body"
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field pt-6 mt-0 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <!-- botão de filtrar -->
                        <Button class="filtrar w-full" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
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

                <!--  datatable do relatorio -->
                <div class="mt-6">
                    <DataTable
                        v-model:filters="filters"
                        :value="devolucoes"
                        stripedRows
                        showGridlines
                        removableSort
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['ID_DM', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                        class=""
                        :sortOrder="1"
                        :sortField="'ProdutoSKU'"
                    >
                        <!-- A tabela exibe os dados provenientes de 'devolucoes', com funcionalidades de filtros, ordenação, paginação e exibição de linhas listradas. -->
                        <!-- O usuário pode interagir com os dados através de filtros globais e pode classificar os dados clicando nas colunas da tabela. -->
                        <!-- A tabela tem uma funcionalidade de paginação que divide os dados em páginas de 10 itens por vez, com opções de 5, 10, 20 ou 50 itens por página. -->
                        <!-- A ordenação inicial é configurada para o campo 'ProdutoSKU', com a ordem crescente (1). -->
                        <!-- O efeito de destaque de linhas e a exibição das linhas de grade facilitam a leitura e a interação com a tabela. -->

                        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                    <span>{{$t('total_records',{count: filteredCount})}}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" :placeholder="t('search')" autocomplete="off"/>
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> {{ emptyMessage }} </template>
                        <Column field="ID_DM" sortable  :header="t('dm')"></Column>
                        <Column field="Dia" sortable :header="t('date')">></Column>
                        <Column field="matricula" sortable :header="t('employee_id')"></Column>
                        <Column field="nome" sortable :header="t('name')"></Column>
                        <Column field="ProdutoNome" sortable :header="t('item')"></Column>
                        <Column field="Quantidade" sortable :header="t('quantity_short')" class="text-center"></Column>
                        <Column field="ProdutoSKU" :header="t('ca')"></Column>
                    </DataTable>
                </div>
                <Card v-if="!show">
                    <template #title>{{ selectedItem.id_dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            
        
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>
<style>
</style>
