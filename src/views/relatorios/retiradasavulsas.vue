<script setup>
// Importações de componentes, funções e bibliotecas
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente VueDatePicker para selecionar datas
import { FilterMatchMode } from 'primevue/api'; // Função da biblioteca PrimeVue para modos de filtro
import { useToast } from 'primevue/usetoast'; // Hook de notificação Toast da PrimeVue
import '@vuepic/vue-datepicker/dist/main.css'; // Estilos do VueDatePicker
import { ref, onMounted, watch, computed } from 'vue'; // Funções do Vue (reactividade, lifecycle, watch)
import { useDataStore } from '@/store/dataStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de Spinner de carregamento
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { filtroGenericoReltorio, gerarEbaixarCSV, gerarEbaixarJSON, formatDateToString, formatTimeToString } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Definindo as variáveis reativas do componente
const filteredCount = ref(0); // Contagem filtrada de itens na tabela
const showDialog = ref(false); // Controle de visibilidade do diálogo de erro
const dialogMessage = ref(''); // Mensagem a ser exibida no diálogo de erro
const loading = ref(false); // Controle de carregamento da requisição
const dataStore = useDataStore(); // Acesso à store de dados
const emptyMessage = computed(() => t('no_search_made')); // Mensagem quando não há dados
const toast = useToast();
const retiradas = ref([]); // Dados das retiradas a serem exibidos na tabela
const dropdown1 = ref(null); // Referências para os dropdowns usados nos filtros
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);
const dropdown6 = ref(null);
// Dados para as opções dos filtros
const ListaFuncionarios = computed(() => dataStore.funcionariosOptions);
// Lista de funcionários
const ListaFuncionariosOriginal = computed(() => dataStore.funcionariosOptions);
// Lista de funcionários
const ListaSetorOriginal = computed(() => dataStore.setoresOptions); // Lista de funcionários
const dms = computed(() => dataStore.dmsOptions); // Lista de DMs
const plantas = computed(() => dataStore.plantasOptions); // Lista de plantas
const setor = computed(() => dataStore.setoresOptions); // Lista de setores
const centroCusto = computed(() => dataStore.cdcsOptions); // Lista de centros de custo

// Filtro global aplicado na DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global, busca no campo "global"
});

// Controle de exibição do card de detalhes
const show = ref(true);
const selectedItem = ref([]); // Item selecionado para exibir detalhes

// Objeto com os dados do relatório
const relatorio = ref({
    dm: '', // Filtro para DM
    id_planta: '', // Filtro para planta
    id_setor: '', // Filtro para setor
    id_centro_custo: '', // Filtro para centro de custo
    id_funcionario: '', // Filtro para funcionário
    voucher: '', // Filtro para voucher
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data de início padrão (1º dia do mês atual)
    data_final: new Date() // Data final padrão (data atual)
});

// Função para buscar os dados do relatório
const buscar = async () => {
    try {
        loading.value = true; // Ativa o carregamento
        retiradas.value = await relatorioService.retiradaAvulsas(relatorio);
        filteredCount.value = retiradas.value.length; // Atualiza a contagem dos itens filtrados

        // Verifica se não há dados no retorno da requisição
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum resultado encontrado para os filtros aplicados.'; // Mensagem de erro
            showDialog.value = true; // Exibe o diálogo de erro
        }

        // Se não houver dados, altera a mensagem de "nenhum dado encontrado"
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.'; // Mensagem de erro
        } else {
            emptyMessage.value = ''; // Limpa a mensagem de erro se houver dados
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
        // Se ocorrer erro na requisição, exibe no console
        console.error('Erro ao buscar dados:', error);
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

// Função para retornar ao card principal e limpar os detalhes
const voltar = () => {
    show.value = true; // Exibe o card principal
    selectedItem.value = {}; // Limpa o item selecionado
};

// Referência da tabela
const dt = ref(null);

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown1 se estiver aberto
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown2 se estiver aberto
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o dropdown3 se estiver aberto
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o dropdown4 se estiver aberto
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o dropdown5 se estiver aberto
    if (dropdown6.value?.overlayVisible) dropdown6.value.hide(); // Fecha o dropdown6 se estiver aberto
};
const filtroGenerico = () => {
    filtroGenericoReltorio(relatorio, ListaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, setor);
};

// Observador para atualizar a contagem dos itens filtrados quando o filtro global for alterado
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = retiradas.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
); // Executa imediatamente após a montagem

// Função que é chamada quando o DatePicker é aberto, fechando todos os dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns quando o DatePicker for aberto
};
const loadData = async () => {
    loading.value = true;
    try {
        if (!dataStore.dms) await dataStore.fetchListaDms(); // Carrega a lista de DMs
        if (!dataStore.plantas) await dataStore.fetchPlantas(); // Carrega a lista de plantas
        if (!dataStore.setores) await dataStore.fetchSetores(); // Carrega a lista de setores // Carrega a lista de setores
        if (!dataStore.cdcs) await dataStore.fetchCdc(); // Carrega a lista de centros de custo
        if (!dataStore.funcionarios) await dataStore.fetchFuncionarios(); // Carrega a lista de funcionários
        // Carrega a lista de funcionários
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
    }
};
// Função chamada ao montar o componente
onMounted(() => {
    loadData();
});
</script>

<template>
    <!-- Container principal do componente -->
    <div class="card vh">
        <div class="form">
            <!-- Grid de layout -->
            <div class="text-center">
                <!-- Formulário de busca para o relatório, exibido quando "show" for true -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- Campo de filtro para DM -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="dm">{{t('dispenser_machine')}}:</label>
                        <!-- Dropdown para selecionar DM -->
                        <Dropdown filter class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown1" />
                    </div>

                    <!-- Campo de filtro para Planta -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="planta">{{t('factory')}}:</label>
                        <!-- Dropdown para selecionar Planta -->
                        <Dropdown filter class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown2" @change="filtroGenerico" />
                    </div>

                    <!-- Campo de filtro para Setor -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('sector')}}:</label>
                        <!-- Dropdown para selecionar Setor -->
                        <Dropdown filter class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown3" @change="filtroGenerico" />
                    </div>

                    <!-- Campo de filtro para Centro de Custo -->
                    <div class="py-0 mt-2 field xl:col-4 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">{{t('cost_center')}}:</label>
                        <!-- Dropdown para selecionar Centro de Custo -->
                        <Dropdown filter class="drop" v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown4" @change="filtroGenerico" />
                    </div>

                    <!-- Campo de filtro para Funcionário -->
                    <div class="py-0 mt-2 field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('employee')}}:</label>
                        <!-- Dropdown para selecionar Funcionário -->
                        <Dropdown filter class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown5" />
                    </div>

                    <!-- Campo de filtro para Voucher -->
                    <div class="py-0 mt-2 field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">Voucher:</label>
                        <!-- Dropdown para selecionar Voucher -->
                        <Dropdown filter class="drop" v-model="relatorio.voucher" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown6" />
                    </div>

                    <!-- Campo de filtro para Data Inicial -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-4 sm:col-12">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <!-- DatePicker para selecionar Data Inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            ref="datepicker1"
                            :enable-time-picker="false"
                            teleport="body"
                            @open="handleDatepickerOpen"
                            placeholder="Selecione uma data inicial"
                        />
                    </div>

                    <!-- Campo de filtro para Data Final -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-4 sm:col-12">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <!-- DatePicker para selecionar Data Final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            ref="datepicker1"
                            :enable-time-picker="false"
                            teleport="body"
                            placeholder="Selecione uma data final"
                            @open="handleDatepickerOpen"
                        />
                    </div>

                    <!-- Botão de Filtrar -->
                    <div class="py-0 my-0 field xl:col-4 lg:col-4 md:col-4 sm:col-12 justify-self-end">
                        <!-- Botão para filtrar dados do relatório -->
                        <Button class="filtrar" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div> -->
                </div>

                <!-- Tabela de Dados do Relatório -->
                <div class="datatable-wrapper mt-5">
                    <!-- DataTable que exibe os dados das retiradas -->
                    <DataTable
                        v-model:filters="filters"
                        :value="retiradas"
                        stripedRows
                        showGridlines
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['DM', 'Data', 'Matricula', 'Nome', 'Email', 'CodigoCa', 'Item']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                        :sortField="'CodigoCa'"
                        removableSort
                        :sortOrder="1"
                    >
                        <!-- 
    A tabela exibe os dados provenientes de 'retiradas', que podem representar registros de retiradas de algum tipo de item, como produtos, documentos, etc.

    - **v-model:filters="filters"**: O modelo bidirecional de dados para o filtro global é vinculado à variável `filters`. Isso permite que os filtros sejam aplicados dinamicamente à tabela conforme o usuário insere os critérios de pesquisa. O valor de `filters` é atualizado automaticamente sempre que o usuário altera os filtros na tabela.

    - **:value="retiradas"**: A variável `retiradas` contém os dados que serão exibidos na tabela. Cada item de `retiradas` será exibido como uma linha na tabela. A tabela é preenchida dinamicamente com esses itens.

    - **stripedRows**: Aplica um estilo alternado nas linhas da tabela, ou seja, as linhas ímpares terão uma cor de fundo diferente das linhas pares. Isso melhora a legibilidade da tabela, tornando mais fácil distinguir uma linha da outra.

    - **showGridlines**: Exibe as linhas de grade na tabela, ou seja, as linhas de separação entre as células da tabela. Isso ajuda a organizar visualmente os dados e torna a tabela mais legível.

    - **paginator**: Habilita a paginação da tabela. Quando ativado, os dados serão divididos em várias páginas, permitindo ao usuário navegar entre os registros em blocos menores, o que melhora a usabilidade e desempenho.

    - **:rows="10"**: Define o número de linhas exibidas por página. Neste caso, cada página da tabela exibirá 10 registros. O valor pode ser alterado dependendo do número de registros a ser mostrado.

    - **:rowsPerPageOptions="[5, 10, 20, 50]"**: Oferece ao usuário opções para escolher o número de linhas a ser exibido por página. As opções disponíveis são 5, 10, 20 e 50 registros por página.

    - **rowHover**: Aplica um estilo de destaque nas linhas quando o mouse passa sobre elas. Esse efeito melhora a interação do usuário, destacando a linha em que ele está posicionado.

    - **:globalFilterFields="['DM', 'Data', 'Matricula', 'Nome', 'Email', 'CodigoCa', 'Item']"**: Especifica os campos que podem ser usados para filtragem global. Quando o usuário pesquisa, a tabela busca nesses campos: 'DM', 'Data', 'Matricula', 'Nome', 'Email', 'CodigoCa', e 'Item'. Isso permite a pesquisa por qualquer valor dentro desses campos.

    - **:tableStyle="{ width: '100%' }"**: Define o estilo da tabela, garantindo que ela ocupe 100% da largura disponível no contêiner pai. Isso a torna responsiva, ajustando o tamanho da tabela conforme o espaço disponível na tela.

    - **ref="dt"**: Atribui uma referência chamada `dt` à tabela. Essa referência permite acessar a instância do componente DataTable diretamente através de `this.$refs.dt` no código JavaScript, possibilitando manipulações programáticas da tabela, como alteração dos filtros, paginação ou ordenação.

    - **:sortField="'CodigoCa'"**: Define o campo pelo qual os dados serão inicialmente ordenados. Nesse caso, os dados serão ordenados pelo campo 'CodigoCa' (que provavelmente representa algum código ou identificação).

    - **removableSort**: Permite que o usuário remova a ordenação da tabela. Se o usuário clicar novamente no cabeçalho da coluna que está sendo usada para ordenação, a ordenação será removida. Isso oferece maior flexibilidade na visualização dos dados.

    - **:sortOrder="1"**: Define a ordem da ordenação. O valor `1` indica que a ordenação será feita em ordem crescente. Se fosse `-1`, a ordenação seria decrescente.

-->
                        <!-- Cabeçalho da tabela com filtro global -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <!-- Campo de busca global na tabela -->
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>

                        <!-- Mensagem exibida quando não há dados -->
                        <template #empty> {{ emptyMessage }} </template>

                        <!-- Definição das colunas da tabela -->
                        <Column field="DM" sortable :header="t('dispenser_machine')"></Column>
                        <Column field="Data" sortable :header="t('date')"></Column>
                        <Column field="Matricula" sortable :header="t('employee_id')"></Column>
                        <Column field="Voucher" sortable header="Voucher"></Column>
                        <Column field="Nome" sortable :header="t('name')"></Column>
                        <Column field="CodigoCa" sortable header="CA"></Column>
                        <Column field="Item" sortable header="Item"></Column>
                    </DataTable>
                </div>

                <!-- Exibição do cartão com os detalhes do item selecionado -->
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <!-- Botão para voltar aos dados principais -->
                        <Button type="button" :label="t('back')" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <!-- Componente de spinner de carregamento -->
    <LoadingSpinner v-if="loading" />

    <!-- Mensagem de erro exibida em um diálogo -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="true" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <!-- Botão para fechar o diálogo de erro -->
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style>
/**
 * Define o estilo para o container da "card" (cartão).
 * Faz com que a área do conteúdo dentro da carta (card) permita rolagem horizontal quando o conteúdo for maior que o container.
 */
.card {
    overflow-x: auto; /* Permite rolagem horizontal quando o conteúdo ultrapassar a largura do container */
}

/**
 * Estiliza o wrapper da tabela para garantir que ela ocupe toda a largura da tela.
 * Também permite rolagem horizontal caso o conteúdo da tabela ultrapasse a largura da tela.
 */
.datatable-wrapper {
    overflow-x: auto; /* Permite rolagem horizontal caso o conteúdo da tabela ultrapasse a largura do container */
    width: 100vw; /* Define a largura do wrapper como 100% da largura da janela de visualização (viewport) */
}

/**
 * Define o estilo do botão de filtro (botão "Filtrar Dados").
 * Adiciona um espaço superior de 25px.
 */
.filtrar {
    margin-top: 25px; /* Adiciona uma margem superior de 25px ao botão de filtrar */
}

/**
 * Define o estilo dos dropdowns. Faz com que eles ocupem toda a largura disponível.
 */
.drop {
    width: 100%; /* Faz com que os dropdowns ocupem toda a largura do container pai */
}

/**
 * Regras de estilo aplicadas quando a largura da tela é inferior a 580px.
 * Usado para tornar o layout responsivo em telas pequenas, como em dispositivos móveis.
 */
@media (max-width: 580px) {
    /**
     * A regra dentro desse bloco altera o layout dos campos do formulário
     * quando a tela é pequena (largura menor que 580px).
     * Cada campo ocupa 100% da largura disponível e adiciona uma margem inferior.
     */
    .form .field {
        flex: 0 0 100%; /* Faz com que o campo ocupe 100% da largura disponível */
        max-width: 100%; /* Define o máximo de largura como 100% */
        margin-bottom: 1rem; /* Adiciona uma margem inferior de 1rem entre os campos */
    }

    /**
     * Define o estilo para os dropdowns dentro do formulário em telas pequenas.
     * Garante que os dropdowns ocupem 100% da largura do campo.
     */
    .form .field .drop {
        width: 100%; /* Faz com que os dropdowns ocupem 100% da largura disponível no campo */
    }

    /**
     * Estilo aplicado aos botões de filtro e exportar em telas pequenas.
     * Garante que esses botões ocupem 100% da largura do campo.
     */
    .form .field .filtrar,
    .form .field .exportar {
        width: 100%; /* Faz com que os botões ocupem 100% da largura do campo */
    }
}

/**
 * Define o estilo para os campos do formulário.
 * Faz com que o texto dentro dos campos não quebre e alinha o texto à esquerda.
 */
.field {
    white-space: nowrap; /* Impede que o texto dentro do campo quebre em várias linhas */
    text-align: left; /* Alinha o texto à esquerda dentro dos campos */
}
</style>
