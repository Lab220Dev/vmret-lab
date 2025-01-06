<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente de data picker para selecionar as datas
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de correspondência para filtros no PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa o hook do PrimeVue para mostrar notificações
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS do componente de data picker
import { ref, onMounted, watch } from 'vue'; // Importa funções do Vue para reatividade e manipulação de ciclo de vida
import axios from '@/axios.js'; // Importa a configuração do Axios para fazer requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados de usuário
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados para acessar listas e informações
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de carregamento

const dataStore = useDataStore(); // Instancia o store de dados
const showDialog = ref(false); // Estado reativo para controlar a visibilidade de uma caixa de diálogo
const dialogMessage = ref(''); // Estado reativo para armazenar a mensagem a ser exibida no diálogo

const filteredCount = ref(0); // Conta os itens filtrados para exibição

const store = useAuthStore(); // Instancia o store de autenticação
const toast = useToast(); // Instancia o hook de toast para notificações

const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem padrão quando não há resultados
const dropdown1 = ref(null); // Referência para o primeiro dropdown
const dropdown2 = ref(null); // Referência para o segundo dropdown
const dropdown3 = ref(null); // Referência para o terceiro dropdown
const dropdown4 = ref(null); // Referência para o quarto dropdown
const dropdown5 = ref(null); // Referência para o quinto dropdown

const devolucoes = ref([]); // Lista de devoluções retornadas pela API

const todosOption = { label: 'Todos', value: null }; // Opção de "Todos" para dropdowns

const dms = ref([todosOption]); // Lista de DMs (dados de movimentação) para o filtro
const plantas = ref([todosOption]); // Lista de plantas para o filtro
const centroCusto = ref([todosOption]); // Lista de centros de custo para o filtro

const ListaFuncionariosOriginal = ref([]); // Lista original de funcionários
const ListaFuncionarios = ref([]); // Lista de funcionários filtrada

const ListaSetorOriginal = ref([]); // Lista original de setores
const ListaSetor = ref([]); // Lista de setores filtrada

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
    ID_CentroCusto: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data inicial (primeiro dia do mês)
    data_final: new Date() // Data final (data atual)
});

// Função para formatar as datas no formato dd/mm/yyyy
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
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
            showDialog.value = true; // Abre a caixa de diálogo com a mensagem de erro
        }
        // Se não houver resultados, altera a mensagem padrão
        if (devolucoes.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
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
watch(() => filters.value.global.value, () => {
    filteredCount.value = devolucoes.value.filter(item => {
        const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo corresponde ao filtro
    }).length;
}, { immediate: true });

// Função para voltar à visualização da tabela após a visualização de um item
const voltar = () => {
    show.value = true; // Exibe a tabela de dados
    selectedItem.value = {}; // Limpa o item selecionado
};
const dt = ref(null); // Referência para o DataTable

// Função para gerar o conteúdo CSV a partir dos dados
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Obtém os cabeçalhos a partir das chaves do primeiro objeto
    const rows = data.map((row) => Object.values(row).join(',')).join('\n'); // Converte cada linha em uma string CSV
    return `${headers}\n${rows}`; // Retorna o conteúdo no formato CSV
};

// Função para exportar os dados em formato CSV
const exportCSV = () => {
    const csvContent = generateCSV(devolucoes.value); // Gera o conteúdo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Cria um blob do CSV
    const link = document.createElement('a'); // Cria um link de download
    const url = URL.createObjectURL(blob); // Cria uma URL do blob
    link.setAttribute('href', url); // Define o link para o arquivo gerado
    link.setAttribute('download', 'Devoluções.csv'); // Define o nome do arquivo
    document.body.appendChild(link); // Adiciona o link ao DOM
    link.click(); // Dispara o clique para iniciar o download
    document.body.removeChild(link); // Remove o link do DOM
};

// Função para exportar os dados em formato JSON
const exportJSON = () => {
    const jsonContent = JSON.stringify(devolucoes.value, null, 2); // Converte os dados em JSON
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' }); // Cria um blob do JSON
    const link = document.createElement('a'); // Cria um link de download
    const url = URL.createObjectURL(blob); // Cria uma URL do blob
    link.setAttribute('href', url); // Define o link para o arquivo gerado
    link.setAttribute('download', 'Devoluções.json'); // Define o nome do arquivo
    document.body.appendChild(link); // Adiciona o link ao DOM
    link.click(); // Dispara o clique para iniciar o download
    document.body.removeChild(link); // Remove o link do DOM
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o primeiro dropdown
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o segundo dropdown
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o terceiro dropdown
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o quarto dropdown
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o quinto dropdown
};

// Função para carregar os dados iniciais dos filtros
const loadData = async () => {
    try {
        // O operador || verifica se o valor já está armazenado no store, caso contrário, faz a chamada para obter os dados
        dms.value = dataStore.dms || await dataStore.fetchListaDms(); // Carrega a lista de DMs
        plantas.value = dataStore.plantas || await dataStore.fetchPlantas(); // Carrega a lista de plantas
        ListaSetor.value = dataStore.setores || await dataStore.fetchSetores(); // Carrega a lista de setores
        centroCusto.value = dataStore.cdcs || await dataStore.fetchCdc(); // Carrega a lista de centros de custo
        ListaFuncionarios.value = dataStore.funcionarios || await dataStore.fetchFuncionarios(); // Carrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Exibe erro caso haja falha no carregamento dos dados
    }
};

// Função para filtrar os setores de acordo com o centro de custo selecionado
const filterSetor = () => {
    if (relatorio.value.ID_CentroCusto) {
        // Filtra os setores de acordo com o centro de custo
        ListaSetor.value = ListaSetorOriginal.value.filter(setorItem => 
            setorItem.id_centro_custo === relatorio.value.ID_CentroCusto || setorItem.value === null
        );
    } else {
        ListaSetor.value = ListaSetorOriginal.value; // Se não houver centro de custo selecionado, exibe todos os setores
    }
};

// Função para filtrar os funcionários de acordo com os filtros selecionados
const filterFuncionarios = () => {
  // Verifica se ao menos um filtro de setor ou planta foi selecionado
  if (relatorio.value.id_setor || relatorio.value.id_planta) {
    // Filtra os funcionários conforme os filtros de setor e planta
    ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
      const matchesSetor = relatorio.value.id_setor ? funcionario.id_setor === relatorio.value.id_setor : true; // Verifica se o setor corresponde
      const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true; // Verifica se a planta corresponde

      return matchesSetor && matchesPlanta; // Retorna os funcionários que correspondem aos filtros
    });
  } else {
    // Se não houver filtros, exibe todos os funcionários
    ListaFuncionarios.value = ListaFuncionariosOriginal.value;
  }
};

// Função chamada quando o datepicker é aberto, fecha todos os dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns
};

// Função chamada quando o componente é montado
onMounted(() => {
    loadData(); // Carrega os dados iniciais
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <h5 class="my-6  ml-2 text-2xl">Devoluções</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="id_dm">DM:</label>
                        <Dropdown class="drop" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" ref="dropdown1" placeholder="Todos"></Dropdown>
                    </div>
                    
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" @change="filterSetor"/>
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Setor:</label>
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" @change="filterFuncionarios" />
                    </div><div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" @change="filterFuncionarios" />
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            placeholder="Selecione uma data inicial"
                            teleport="body"
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            placeholder="Selecione uma data final"
                            teleport="body"
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>
                </div>

                <!--  datatable do relatorio -->
                <div class="datatable-wrapper mt-6">
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
                        <!-- @rowSelect="onRowSelect"  -->
                        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                <span>Total de registros: {{ filteredCount}}</span>
                            </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> {{ emptyMessage }} </template>
                        <Column field="ID_DM" sortable header="DM"></Column>
                        <Column field="Dia" sortable header="Data"></Column>
                        <Column field="matricula" sortable header="Matricula"></Column>
                        <Column field="nome" sortable header="Nome"></Column>
                        <Column field="email" sortable header="E-mail"></Column>
                        <Column field="ProdutoNome" sortable header="Item"></Column>
                        <Column field="Quantidade" sortable header="Quant" class="text-center"></Column>
                        <Column field="ProdutoSKU" header="CA"></Column>
                    </DataTable>
                </div>
                <Card v-if="!show">
                    <template #title>{{ selectedItem.id_dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>
<style>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow-x: auto;
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

.table-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
