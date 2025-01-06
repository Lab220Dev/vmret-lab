<script setup>
/**
 * Importa o componente VueDatePicker para uso no formulário de seleção de data.
 */
import VueDatePicker from '@vuepic/vue-datepicker';

/**
 * Importa o FilterMatchMode da biblioteca PrimeVue para utilização na filtragem de dados da tabela.
 */
import { FilterMatchMode } from 'primevue/api';

/**
 * Importa o hook useToast para exibir notificações de toast.
 */
import { useToast } from 'primevue/usetoast';

/**
 * Importa o estilo do VueDatePicker para garantir que o componente seja exibido corretamente.
 */
import '@vuepic/vue-datepicker/dist/main.css';

/**
 * Importa funções do Vue para gerenciamento de estado e efeitos colaterais.
 */
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

/**
 * Importa o axios, que é utilizado para fazer requisições HTTP à API.
 */
import axios from '@/axios.js';

/**
 * Importa o store de autenticação, que contém as informações do usuário e o token de autorização.
 */
import { useAuthStore } from '@/store/authStore.js';

/**
 * Importa o componente de LoadingSpinner para mostrar um indicador de carregamento enquanto os dados estão sendo processados.
 */
import LoadingSpinner from '@/components/LoadingSpinner.vue';

/**
 * Variáveis reativas do Vue que controlam a visibilidade do diálogo e as mensagens exibidas.
 */
const showDialog = ref(false);  // Controle de visibilidade do diálogo de erro
const dialogMessage = ref('');  // Mensagem exibida no diálogo de erro

/**
 * Variáveis para armazenar dados do store, como o ID do cliente e a função de exibição de toast.
 */
const store = useAuthStore();  // Acesso ao store de autenticação
const toast = useToast();  // Função para exibir notificações de toast

/**
 * Mensagem padrão para ser exibida caso não haja dados na tabela.
 */
const emptyMessage = ref('Ainda não foi feita nenhuma busca');

/**
 * Referências para os dropdowns usados para filtros (funcionário, DM, etc.).
 */
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

/**
 * Variáveis reativas para armazenar os dados da tabela, como a lista de retiradas e os filtros de pesquisa.
 */
const retiradas = ref([]);  // Dados das retiradas
const todosOption = { label: 'Todos', value: null };  // Opção padrão "Todos" para os filtros

/**
 * Variáveis para armazenar listas de funcionários, DMs, plantas, setores e centros de custo.
 */
const ListaFuncionarios = ref(null);
const dms = ref([todosOption]);  // Lista de DMs com a opção "Todos"
const plantas = ref([todosOption]);  // Lista de plantas com a opção "Todos"
const setor = ref([todosOption]);  // Lista de setores com a opção "Todos"
const centroCusto = ref([todosOption]);  // Lista de centros de custo com a opção "Todos"

/**
 * Filtros de pesquisa globais para a DataTable.
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

/**
 * Variáveis para controlar a exibição de detalhes na DataTable.
 */
const show = ref(false);  // Controle de visibilidade dos detalhes
const selectedItem = ref([]);  // Armazena o item selecionado
const loading = ref(false);  // Controle de carregamento (indicador de espera)

/**
 * Objeto para armazenar os parâmetros de filtragem, como DM, planta, centro de custo, etc.
 */
const relatorio = ref({
    dm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
});

/**
 * Função para formatar as datas de forma customizada (dd/mm/yyyy).
 * @param {Date} date A data a ser formatada.
 * @returns {String} A data formatada.
 */
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;  // Meses começam do 0, então é necessário adicionar 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;  // Retorna a data no formato dd/mm/yyyy
};

/**
 * Função para converter uma data para o formato ISO.
 * @param {Date} date A data a ser convertida.
 * @returns {String|null} A data em formato ISO, ou null se a data for inválida.
 */
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;  // Converte para ISO se a data for válida
};

/**
 * Função para realizar a busca dos dados conforme os filtros selecionados.
 * Essa função envia uma requisição HTTP para a API e atualiza a lista de retiradas.
 */
const buscar = async () => {
    // Dados de filtro que serão enviados para a API
    const data = {
        id_cliente: store.userIdCliente,  // ID do cliente do usuário autenticado
        id_dm: relatorio.value.dm === null ? undefined : relatorio.value.dm,
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo,
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),  // Convertendo data de início para formato ISO
        data_final: toISODate(relatorio.value.data_final)  // Convertendo data final para formato ISO
    };

    try {
        loading.value = true;  // Ativa o indicador de carregamento
        const response = await axios.post('relatorioItems/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Autorização com token de acesso do usuário
            }
        });

        // Atualiza a lista de retiradas com a resposta da API
        retiradas.value = response.data;

        // Exibe uma mensagem caso não haja resultados
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = '';
        }

        // Mostra o diálogo caso não haja dados na tabela
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
            showDialog.value = true;
        }
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);  // Exibe erro no console caso a requisição falhe
    } finally {
        loading.value = false;  // Desativa o indicador de carregamento, independentemente do sucesso ou erro
    }
};

/**
 * Função que é chamada quando uma linha da tabela é selecionada.
 * Exibe o modal de detalhes e faz o scroll até a seção de detalhes.
 * @param {Object} event Evento de seleção da linha.
 */
const onRowSelect = (event) => {
    show.value = true;  // Exibe os detalhes do item
    selectedItem.value = event.data.Detalhes;  // Armazena os detalhes do item selecionado

    // Realiza o scroll até o cartão de detalhes da tabela
    nextTick(() => {
        const detailsCard = document.querySelector('.details-card');
        if (detailsCard) {
            detailsCard.scrollIntoView({ behavior: 'smooth' });  // Scrola suavemente até o card de detalhes
        }
    });
};

/**
 * Função para voltar à visualização original (esconde o card de detalhes).
 */
const voltar = () => {
    show.value = false;  // Esconde o card de detalhes
    selectedItem.value = {};  // Limpa o item selecionado
};

/**
 * Referência da DataTable utilizada para manipulação direta da tabela.
 */
const dt = ref(null);

/**
 * Função para gerar conteúdo CSV a partir de um array de objetos.
 * @param {Array} data Os dados a serem convertidos para CSV.
 * @returns {String} O conteúdo em formato CSV.
 */
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');  // Gera o cabeçalho a partir das chaves do primeiro objeto
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');  // Gera as linhas do CSV a partir dos valores dos objetos
    return `${headers}\n${rows}`;  // Retorna o conteúdo CSV
};

/**
 * Função para exportar os dados da tabela como um arquivo CSV.
 */
const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {  // Verifica se retiradas é um array
        // Agrega detalhes de cada produto para gerar o CSV
        const detalhesAgregados = retiradas.value.flatMap((produto) => {
            if (Array.isArray(produto.Detalhes)) {
                return produto.Detalhes;
            } else {
                console.warn(`Detalhes não é um array para o produto ${produto.ProdutoID}`);  // Exibe um aviso no console caso "Detalhes" não seja um array
                return [];
            }
        });

        // Gera o conteúdo CSV
        const csvContent = generateCSV(detalhesAgregados);

        // Cria um Blob e link para download do CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Items_Mais_Retiradas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.error('retiradas.value não é um array.');  // Exibe erro se retiradas não for um array
    }
};

/**
 * Função para exportar os dados da tabela como um arquivo JSON.
 */
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2);  // Converte os dados para JSON formatado
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Função para buscar a lista de DMs (Documentos de Movimentação) e atualizá-los na interface.
 */
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente  // Envia o ID do cliente para a requisição
    };

    try {
        const response = await axios.post('/relatorioItems/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Autorização com token de acesso
            }
        });
        
        // Atualiza a lista de DMs com a resposta da API
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);  // Exibe erro no console se falhar ao carregar a lista de DMs
    }
};

/**
 * Função para fechar todos os dropdowns abertos na interface.
 */
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide();
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide();
};

/**
 * Função para fechar todos os dropdowns quando o DatePicker for aberto.
 */
const handleDatepickerOpen = () => {
    closeAllDropdowns();  // Fecha todos os dropdowns
};

/**
 * Hook do Vue que executa a função fetchDM ao montar o componente.
 */
onMounted(() => {
    fetchDM();  // Carrega a lista de DMs ao montar o componente
});
</script>

<template>
    <!-- Card principal que envolve todo o conteúdo da tela -->
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título da seção "Performance por Horário" -->
                <h5 class="my-4 text-2xl">Performace por Horário</h5>

                <!-- Formulário de busca de dados para o relatório -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Campo de busca para o filtro de DM -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Dropdown para selecionar DM, com a v-model ligado a "relatorio.dm" -->
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>

                    <!-- Campo de busca para o filtro de Data Inicial -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Inicial:</label>
                        <!-- VueDatePicker para selecionar a Data Inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format" 
                            locale="pt-BR" 
                            :enable-time-picker="false" 
                            auto-apply
                            ref="datepicker1" 
                            @open="handleDatepickerOpen" 
                            placeholder="Selecione uma data inicial" 
                        />
                    </div>

                    <!-- Campo de busca para o filtro de Data Final -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Final:</label>
                        <!-- VueDatePicker para selecionar a Data Final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"  
                            locale="pt-BR"   
                            :enable-time-picker="false" 
                            auto-apply
                            ref="datepicker2" 
                            @open="handleDatepickerOpen" 
                            placeholder="Selecione uma data final" 
                        />
                    </div>

                    <!-- Botão para disparar a filtragem de dados -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- Botões para exportação de dados -->
                    <!-- Botão para exportar dados em formato CSV -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <!-- Botão para exportar dados em formato JSON -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>

                </div>

                <!-- DataTable para exibir os dados do relatório -->
                <div class="datatable-wrapper">
                    <!-- DataTable exibe as retiradas com filtros e paginação -->
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
                        :tableStyle="{ width: '100%' }" 
                        ref="dt" 
                    >
                        <!-- Cabeçalho da DataTable com campo de pesquisa global -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <!-- Campo de busca global -->
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>

                        <!-- Mensagem quando não há dados -->
                        <template #empty>{{ emptyMessage }} </template>

                        <!-- Colunas da DataTable -->
                        <Column field="ProdutoNome" sortable header="DM"></Column> <!-- Coluna para nome do produto -->
                        <Column field="quantidade_no_periodo" sortable header="Quantidade" class="text-center"></Column> <!-- Coluna para quantidade -->
                    </DataTable>

                    <!-- Modal de detalhes do item quando uma linha é selecionada -->
                    <card v-if="show" class="details-card">
                        <template #title>Detalhes do Produto</template>
                        <template #content>
                            <!-- DataTable dos detalhes do item -->
                            <DataTable :value="selectedItem" stripedRows showGridlines paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" rowHover>
                                <Column field="ProdutoNome" sortable header="Item"></Column>  <!-- Coluna para o nome do item -->
                                <Column field="Data" sortable header="Data"></Column>  <!-- Coluna para a data -->
                                <Column field="Quantidade" sortable header="Quantidade"> </Column>  <!-- Coluna para a quantidade -->
                                <Column field="ProdutoSKU" sortable header="SKU"></Column>  <!-- Coluna para o SKU -->
                            </DataTable>
                        </template>
                    </card>
                </div>
            </div>
        </div>
    </div>

    <!-- Spinner de carregamento exibido enquanto os dados estão sendo carregados -->
    <LoadingSpinner v-if="loading" />

    <!-- Dialog de mensagem de erro ou informação -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>  <!-- Mensagem a ser exibida no diálogo -->
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />  <!-- Botão para fechar o diálogo -->
        </template>
    </Dialog>
</template>

<style>
/* Estilos para o cabeçalho do diálogo */
.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Estilos para o conteúdo do diálogo */
.dialog-content {
    padding: 1rem;
}

/* Estilos para a mensagem dentro do diálogo */
.dialog-message {
    text-align: justify;
    margin: 0;
}

/* Estilos gerais para o card que contém o relatório */
.card {
    overflow-x: auto;
}

/* Estilos para a wrapper da DataTable */
.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

/* Estilos para o botão de filtrar */
.filtrar {
    margin-top: 25px;
}

/* Estilos para os dropdowns */
.drop {
    width: 100%;
}

/* Media query para telas pequenas (responsividade) */
@media (max-width: 580px) {
    /* Faz os campos de entrada ocuparem 100% da largura em dispositivos pequenos */
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    /* Faz os dropdowns ocuparem 100% da largura */
    .form .field .drop {
        width: 100%;
    }

    /* Faz os botões de filtro e exportação ocuparem 100% da largura */
    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

/* Estilos para os campos de entrada, garantindo que o texto não quebre */
.field {
    white-space: nowrap;
    text-align: left;
}
</style>
