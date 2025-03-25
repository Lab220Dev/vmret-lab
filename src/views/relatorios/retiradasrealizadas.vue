<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para o controle de data
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de filtro para correspondência de filtros globais
import { useToast } from 'primevue/usetoast'; // Importa o serviço de toast para mensagens rápidas
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS necessário para o VueDatePicker
import { ref, onMounted, watch, computed } from 'vue'; // Importa os hooks do Vue (ref, onMounted, watch)
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para obter dados de usuário e token
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de autenticação para obter dados de usuário e token
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de loading (spinner)
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { filtroGenericoReltorio, gerarEbaixarCSV, gerarEbaixarJSON, formatDateToString, formatTimeToString, getTimeFromString, getDateFromString, isMobileDevice } from '@/helpers/HelperUtils.js'; // Importa funções utilitárias
import { useI18n } from 'vue-i18n';
import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png'; // Importa o ícone de exportação csv

const { t } = useI18n();

const showDialog = ref(false); // Controla a visibilidade do dialog de erro
const dialogMessage = ref(''); // Armazena a mensagem de erro que será exibida no dialog

const filteredCount = ref(0); // Contagem de itens filtrados (para a filtragem de dados)

const store = useAuthStore(); // Obtém o store de autenticação (para acessar o token e dados do usuário)
const dataStore = useDataStore(); // Obtém o store de autenticação (para acessar o token e dados do usuário)
const toast = useToast(); // Instancia o toast para exibir mensagens ao usuário
const emptyMessage = computed(() => t('no_search_made'));
// Refs para os dropdowns no formulário de filtro
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

// Refs para armazenar os dados retornados da API
const retiradas = ref([]); // Lista de retiradas
const todosOption = { label: 'Todos', value: null }; // Opção padrão para "Todos"

// Refs para armazenar as opções de filtros que serão carregados dinamicamente
const dms = ref([todosOption]); // Lista de DM (Departamento/Manager)
const plantas = ref([todosOption]); // Lista de plantas
// const setor = ref([todosOption]); // (Comentado) Lista de setores (não está sendo utilizado neste código)
const centroCusto = ref([todosOption]); // Lista de centros de custo

// Refs para armazenar as listas de funcionários e setores
const ListaFuncionariosOriginal = ref([]); // Lista original de funcionários
const ListaFuncionarios = ref([]); // Lista de funcionários filtrados
const ListaSetorOriginal = ref([]); // Lista original de setores
const ListaSetor = ref([]); // Lista de setores filtrados

// Filtros globais para a tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que faz a correspondência "contains" (conteúdo)
});

// Controla se a visualização do relatório está ativa ou não
const show = ref(true);

// Armazena o item selecionado quando a tabela é clicada
const selectedItem = ref([]);

// Variável para controlar o carregamento dos dados (exibe o spinner)
const loading = ref(false);

// Objeto de parâmetros do relatório (com filtros predefinidos)
const relatorio = ref({
    id_dm: '',
    id_planta: null,
    ID_CentroCusto: '',
    id_setor: null,
    id_funcionario: null,
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data inicial é o primeiro dia do mês atual
    data_final: new Date() // Data final é o dia atual
});

// Função assíncrona para buscar os dados do relatório
const buscar = async () => {
    try {
        loading.value = true;
        retiradas.value = await relatorioService.retiradaRealizadas(relatorio);
        // Atualiza a contagem de registros
        filteredCount.value = retiradas.value.length;

        // Exibe um diálogo caso não haja dados retornados
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = t('no_data_found');
            showDialog.value = true;
        }
        if (retiradas.value.length === 0) {
            emptyMessage.value = t('no_data_found');
        } else {
            emptyMessage.value = ''; // Limpa a mensagem de "sem dados"
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            life: 3000,
            detail: t('fetch_data')
        });
        console.error(t('console_fetch_data'), error); // Exibe o erro no console caso haja uma falha na requisição
    } finally {
        loading.value = false; // Desativa o spinner de carregamento
    }
};

// Função para contar o número de itens filtrados
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = retiradas.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Filtro de texto global
        }).length;
    },
    { immediate: true }
);

// Função para voltar à visão inicial
const voltar = () => {
    show.value = true; // Exibe a tela inicial do relatório
    selectedItem.value = {}; // Limpa o item selecionado
};

// Exportação de dados em formato CSV
const exportCSV = () => {
    gerarEbaixarCSV('RetiradasRealizadas', retiradas.value);
};

// Exportação de dados em formato JSON
const exportJSON = () => {
    gerarEbaixarJSON('RetiradasRealizadas', retiradas.value);
};

const filtroGenerico = () => {
    filtroGenericoReltorio(relatorio, ListaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor);
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide();
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide();
};

// Função para gerenciar a abertura do datepicker e fechar outros dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns();
};
const loadData = async () => {
    loading.value = true;
    try {
        dms.value = dataStore.dms || (await dataStore.fetchListaDms()); // Carrega a lista de DMs
        plantas.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega a lista de plantas
        ListaSetorOriginal.value = dataStore.setores || (await dataStore.fetchSetores()); // Carrega a lista de setores
        ListaSetor.value = ListaSetorOriginal.value; // Carrega a lista de setores
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega a lista de centros de custo
        ListaFuncionariosOriginal.value = await relatorioService.listaFuncionario();
        ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Carrega a lista de funcionários
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: 'Erro ao carregar dados' });
    } finally {
        loading.value = false;
    }
};

const isMobile = isMobileDevice();

// Ao montar o componente, carrega todas as informações necessárias
onMounted(() => {
    loadData();
});
</script>

<template>
    <!-- Card principal para exibição do relatório -->
    <div class="card vh">
        <div class="form">
            <div class="text-center">
                <!-- Título do card <h5 class="my-6 ml-2 text-2xl">{{$t('retiradas_realizadas')}}</h5>-->
                
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- Filtro DM (Departamento ou Manager) -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">{{ $t('dm') }}</label>
                        <!-- Dropdown para selecionar DM (vinculado a 'relatorio.id_dm') -->
                        <Dropdown class="drop" filter v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown1"></Dropdown>
                    </div>

                    <!-- Filtro Centro de Custo -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{ $t('cost_center') }}</label>
                        <!-- Dropdown para selecionar Centro de Custo, com a chamada do método filterSetor em caso de mudança -->
                        <Dropdown class="drop" filter v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown3" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro Setor -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{ $t('sector') }}</label>
                        <!-- Dropdown para selecionar Setor, com a chamada do método filterFuncionarios em caso de mudança -->
                        <Dropdown class="drop" filter v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown4" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro Planta -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="planta">{{ $t('factory') }}:</label>
                        <!-- Dropdown para selecionar Planta, com a chamada do método filterFuncionarios em caso de mudança -->
                        <Dropdown class="drop" filter v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown2" @change="filtroGenerico" />
                    </div>

                    <!-- Filtro Funcionário -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{ t('employee') }}:</label>
                        <!-- Dropdown para selecionar Funcionário -->
                        <Dropdown class="drop" filter v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown5" />
                    </div>

                    <!-- Filtro Data Inicial -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">{{ t('initial_date') }}:</label>
                        <!-- DatePicker para selecionar a Data Inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('initial_date_placeholder')"
                            teleport="body"
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                        />
                    </div>

                    <!-- Filtro Data Final -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">{{ $t('end_date') }}:</label>
                        <!-- DatePicker para selecionar a Data Final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('end_date_placeholder')"
                            teleport="body"
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                        />
                    </div>

                    <!-- Botão de filtro -->
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <Button class="filtrar" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
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
        <!-- DataTable que exibe o relatório com base nos filtros -->
        <DataTable
            v-model:filters="filters"
            :value="retiradas"
            stripedRows
            removableSort
            showGridlines
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            rowHover
            :globalFilterFields="['Identificacao', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"
            ref="dt"
            class="mt-6"
            :sortField="'ProdutoSKU'"
            :sortOrder="1"
            size="Normal"
            columnResizeMode="fit"
        >
            <!-- 
    A tabela exibe os dados contidos na variável 'retiradas', que provavelmente são registros de algum tipo de transação ou retirada de itens. Cada linha da tabela corresponde a um item dessa lista.

    - **v-model:filters="filters"**: A tabela possui um campo de filtro global vinculado ao modelo `filters`. Isso permite que o usuário insira critérios de pesquisa, e a variável `filters` será atualizada automaticamente com base nas entradas do filtro. A tabela irá aplicar esses filtros para exibir apenas os dados relevantes.

    - **:value="retiradas"**: A propriedade `value` recebe os dados a serem exibidos. A variável `retiradas` contém os dados que serão apresentados na tabela. Cada elemento de `retiradas` será uma linha na tabela.

    - **stripedRows**: Ativa o estilo de linhas alternadas (listradas), onde as linhas ímpares e pares têm cores de fundo diferentes. Esse estilo facilita a leitura dos dados, permitindo que o usuário acompanhe as linhas mais facilmente.

    - **removableSort**: Permite que o usuário remova a ordenação clicando novamente no cabeçalho de uma coluna. Isso oferece flexibilidade adicional ao usuário que quer alternar entre diferentes ordens de visualização dos dados.

    - **showGridlines**: Exibe as linhas de grade, ou seja, as divisórias entre as células da tabela. Isso melhora a legibilidade, especialmente quando há muitas colunas de dados.

    - **paginator**: Habilita a paginação da tabela. Os dados serão divididos em várias páginas, e o usuário pode navegar entre elas. Isso melhora a performance e facilita a navegação em grandes conjuntos de dados.

    - **:rows="10"**: Define o número padrão de linhas que serão exibidas por página. Neste caso, a tabela exibirá 10 itens por página, mas o usuário pode alterar isso.

    - **:rowsPerPageOptions="[5, 10, 20, 50]"**: Proporciona ao usuário a opção de selecionar quantos itens por página ele deseja ver. As opções disponíveis são 5, 10, 20 ou 50 itens por página.

    - **rowHover**: Aplica um estilo de destaque nas linhas da tabela quando o mouse passa sobre elas. Esse efeito melhora a experiência do usuário ao navegar pela tabela, tornando mais fácil identificar qual linha está sendo selecionada.

    - **:globalFilterFields="['Identificacao', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"**: Define os campos pelos quais a filtragem global será feita. Quando o usuário insere um critério de pesquisa, ele será aplicado a todos esses campos. O filtro buscará dentro dos campos de 'Identificacao', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', e 'ProdutoSKU'.

    - **tableStyle="min-width: 50rem; table-layout: fixed;"**: Define o estilo da tabela. O valor `min-width: 50rem;` garante que a tabela tenha um tamanho mínimo de 50rem de largura. O `table-layout: fixed;` assegura que a largura das colunas seja fixa, independentemente do conteúdo da célula. Esse estilo ajuda a controlar a aparência da tabela, especialmente se ela contiver colunas com conteúdos longos ou variáveis.

    - **ref="dt"**: A tabela é associada a uma referência chamada `dt`, que permite acessá-la diretamente no código JavaScript. Isso é útil para interações programáticas com a tabela, como manipulação dos filtros, ordenação ou paginação através do código.

    - **class="mt-6"**: A classe CSS `mt-6` é adicionada à tabela, provavelmente para definir uma margem superior. A margem de `mt-6` pode ser uma convenção do seu framework CSS (provavelmente Tailwind CSS), que aplica um espaçamento específico.

    - **:sortField="'ProdutoSKU'"**: Define a coluna 'ProdutoSKU' como o campo pelo qual a tabela será inicialmente ordenada. Isso significa que, ao carregar a tabela, ela será ordenada pela coluna 'ProdutoSKU'.

    - **:sortOrder="1"**: Define que a ordenação será feita em ordem crescente (valor `1`), ou seja, os dados serão ordenados do menor para o maior valor na coluna 'ProdutoSKU'. Se fosse `-1`, a ordenação seria em ordem decrescente.

    - **:tableStyle="{ width: '100%' }"**: Aplica um estilo adicional que faz a tabela ocupar 100% da largura disponível do contêiner pai. Isso torna a tabela responsiva e adaptável a diferentes tamanhos de tela, preenchendo toda a largura disponível.

-->
            <!-- Cabeçalho da tabela, com contador de registros filtrados -->
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{ $t('total_records', { count: filteredCount }) }}</span>
                        <!-- Exibe o total de registros filtrados -->
                    </div>
                    <div>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                            <!-- Campo de busca global -->
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty> {{ emptyMessage }} </template>

            <!-- Colunas da tabela -->
            <Column field="Identificacao" class="table-cell" sortable :header="t('dm')">
                <!-- <template #body="{ data }">
                    <span v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
                </template> -->
            </Column>

            <Column field="Dia" sortable class="table-cell" :header="t('date')">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ data.Dia }}</span>
                    <!-- Exibe a data formatada -->
                </template>
            </Column>

            <!-- <Column field="Hora" sortable class="table-cell"  :header="t('time')">
                <template #body="{ data }">
                    {{ getTimeFromString(data.Dia) }}
                </template>
            </Column> -->

            <Column field="Matricula" sortable class="table-cell"  :header="t('employee_id')">
                <!-- <template #body="{ data }">
                    <span v-tooltip="data.Matricula">{{ data.Matricula }}</span>
                </template> -->
            </Column>

            <Column field="Nome" class="table-cell" sortable :header="t('name')">
                <!-- <template #body="{ data }">
                    <span v-tooltip="data.Nome">{{ data.Nome }}</span>
                </template> -->
            </Column>

            <Column field="ProdutoNome" sortable class="table-cell" :header="t('item')">
                <template #body="{ data }">
                    <span class="tooltip-target" v-tooltip="data.ProdutoNome">{{ data.ProdutoNome }}</span>
                </template>
            </Column>

            <Column field="Quantidade" sortable class="text-center table-cell">
                <template #header>
                    <span v-tooltip="$t('quantity')">{{ $t('quantity_short') }}</span>
                    <!-- Tooltip para a coluna de quantidade mínima -->
                </template></Column
            >

            <Column field="ProdutoSKU" class="table-cell" sortable header="CA">
                <!-- <template #body="{ data }">
                    <span v-tooltip="data.ProdutoSKU">{{ data.ProdutoSKU }}</span>
                </template> -->
            </Column>
        </DataTable>

        <!-- Cartão exibido quando a variável 'show' for falsa -->
        <Card v-if="!show">
            <template #title>{{ selectedItem.dm }}</template>
            <template #content>
                <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                <!-- Botão para voltar -->
            </template>
        </Card>
    </div>

    <!-- Spinner de carregamento, visível quando a variável 'loading' for verdadeira -->
    <LoadingSpinner v-if="loading" />

    <!-- Caixa de diálogo de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <!-- Mensagem de erro -->
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
            <!-- Botão para fechar o diálogo -->
        </template>
    </Dialog>
</template>

<style>
/* .card: Definindo o comportamento da classe 'card' */
.card {
    /* Permite que o conteúdo da 'card' se mova horizontalmente se ultrapassar a largura do contêiner */
    overflow-x: auto;
}

/* .datatable-wrapper: Definindo o comportamento para o contêiner da tabela */
.datatable-wrapper {
    /* Permite que a tabela se mova horizontalmente se o conteúdo ultrapassar a largura do contêiner */
    overflow-x: auto;

    /* Define a largura do contêiner da tabela como 100% da largura da tela */
    width: 100vw;
}

/* .filtrar: Definindo a margem superior do botão de filtro */
.filtrar {
    /* Define uma margem superior para o botão de filtro */
    margin-top: 25px;
}

/* .drop: Estilo para os dropdowns (listas suspensas) */
.drop {
    /* Define a largura do dropdown para 100% do contêiner pai */
    width: 100%;
}

.dropdown-item.text-muted {
    color: #6c757d; /* Cor cinza para a mensagem de "não há funcionários" */
    font-style: italic;
}

/* Media Query para telas menores que 580px (dispositivos móveis) */
@media (max-width: 580px) {
    /* .form .field: Estilo para os campos do formulário em telas pequenas */
    .form .field {
        /* Define o comportamento de flexbox para os campos de formulário */
        flex: 0 0 100%;

        /* Define a largura máxima do campo para 100% */
        max-width: 100%;

        /* Define a margem inferior entre os campos do formulário */
        margin-bottom: 1rem;
    }

    /* Estilo para dropdowns em telas pequenas */
    .form .field .drop {
        /* Garante que o dropdown ocupe toda a largura disponível */
        width: 100%;
    }

    /* Estilo para os botões 'filtrar' e 'exportar' em telas pequenas */
    .form .field .filtrar,
    .form .field .exportar {
        /* Define a largura dos botões como 100% para ocuparem toda a largura disponível */
        width: 100%;
    }
}

/* .table-cell: Estilo para as células da tabela */
.table-cell {
    /* Garante que o conteúdo da célula não ultrapasse os limites da célula */
    overflow: hidden;

    /* Impede que o conteúdo quebre a linha */
    white-space: nowrap;

    /* Exibe uma reticência "..." se o conteúdo for muito longo para caber na célula */
    text-overflow: ellipsis;
}

/* .field: Estilo para os campos do formulário */
.field {
    /* Impede que o texto dentro dos campos quebre a linha */
    white-space: nowrap;

    /* Alinha o texto à esquerda nos campos do formulário */
    text-align: left;
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
