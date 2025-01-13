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
import { ref, onMounted, watch } from 'vue';

/**
 * Importa o Axios configurado para realizar requisições HTTP.
 * @module axios
 */
import axios from '@/axios.js';

/**
 * Importa o store de autenticação para acessar informações do usuário.
 * @module store/authStore.js
 */
import { useAuthStore } from '@/store/authStore.js';

/**
 * Importa o componente de spinner de carregamento.
 * @module components/LoadingSpinner.vue
 */
import LoadingSpinner from '@/components/LoadingSpinner.vue';

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
const store = useAuthStore();

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
 * Flag para exibir a busca ou o resultado dos dados.
 * @type {ref<boolean>}
 */
const show = ref(true);

/**
 * Item selecionado para exibir mais detalhes.
 * @type {ref<Array<object>>}
 */
const selectedItem = ref([]);

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
 * Formata a data no formato `dia/mês/ano`.
 * @param {Date} date A data a ser formatada.
 * @returns {string} A data formatada.
 */
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Formata a data com horas e minutos no formato `dia/mês/ano - hora:minuto`.
 * @param {Date} date A data a ser formatada.
 * @returns {string} A data formatada com horas e minutos.
 */
const formatTabela = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${horas}:${minutos}`;
};

/**
 * Converte uma data para o formato ISO.
 * @param {Date} date A data a ser convertida.
 * @returns {string|null} A data convertida para o formato ISO ou `null` se a data for inválida.
 */
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

/**
 * Função para buscar o histórico de abastecimento com base nos filtros.
 * @async
 * @returns {Promise<void>}
 */
 const buscar = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        id_dm: relatorio.value.dm === null ? undefined : relatorio.value.dm,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final),
        id_operador: relatorio.value.id_operador
    };
    try {
        loading.value = true;
        const response = await axios.post('/HistoricoAbastecimento/relatorio', data);
        historico.value = response.data;

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
 * Função para voltar à tela inicial, limpando as seleções e exibindo a busca.
 */
const voltar = () => {
    show.value = true; // Exibe a tela de busca
    selectedItem.value = {}; // Limpa o item selecionado
};

/**
 * Função para gerar conteúdo em CSV a partir dos dados fornecidos.
 * @param {Array<object>} data Dados a serem exportados em CSV.
 * @returns {string} O conteúdo CSV gerado.
 */
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Gera cabeçalhos a partir das chaves dos objetos
    const rows = data.map((row) => Object.values(row).join(',')).join('\n'); // Converte as linhas em CSV
    return `${headers}\n${rows}`; // Retorna o conteúdo CSV
};

/**
 * Função para exportar os dados do histórico em formato CSV.
 * Gera um arquivo CSV e inicia o download.
 */
const exportCSV = () => {
    const csvContent = generateCSV(historico.value); // Gera o CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Cria o Blob com o conteúdo CSV
    const link = document.createElement('a'); // Cria um link para o download
    const url = URL.createObjectURL(blob); // Cria uma URL temporária para o Blob
    link.setAttribute('href', url); // Atribui a URL ao link
    link.setAttribute('download', 'HistoricoAbastecimento.csv'); // Define o nome do arquivo
    document.body.appendChild(link); // Adiciona o link ao DOM
    link.click(); // Simula o clique no link para iniciar o download
    document.body.removeChild(link); // Remove o link do DOM
};

/**
 * Função para exportar os dados do histórico em formato JSON.
 * Gera um arquivo JSON e inicia o download.
 */
const exportJSON = () => {
    const jsonContent = JSON.stringify(historico.value, null, 2); // Converte os dados para formato JSON
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' }); // Cria o Blob com o conteúdo JSON
    const link = document.createElement('a'); // Cria um link para o download
    const url = URL.createObjectURL(blob); // Cria uma URL temporária para o Blob
    link.setAttribute('href', url); // Atribui a URL ao link
    link.setAttribute('download', 'HistoricoAbastecimento.json'); // Define o nome do arquivo
    document.body.appendChild(link); // Adiciona o link ao DOM
    link.click(); // Simula o clique no link para iniciar o download
    document.body.removeChild(link); // Remove o link do DOM
};

/**
 * Função para carregar as opções de DM's disponíveis.
 * @async
 * @returns {Promise<void>}
 */
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente
    };
    try {
        const response = await axios.post('/relatorioRetiRe/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ]; // Atualiza a lista de DM's com os dados da resposta
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Exibe erro se houver falha
        toast.add({ severity: 'error', summary: 'Erro', detail: "Não foi possível carregar os DM's. Tente novamente." }); // Exibe uma mensagem de erro
    }
};

/**
 * Função para carregar as opções de plantas disponíveis.
 * @async
 * @returns {Promise<void>}
 */
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });
        plantas.value = [
            todosOption,
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`,
                value: id_planta
            }))
        ]; // Atualiza a lista de plantas
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error); // Exibe erro se houver falha
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as plantas. Tente novamente.' }); // Exibe uma mensagem de erro
    }
};

const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        setor.value = [
            todosOption,
            ...response.data.map(({ id_setor, nome }) => ({
                label: `Setor  ${nome}`,
                value: id_setor
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error);
    }
};

const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCusto.value = [
            todosOption,
            ...response.data.map(({ ID_CentroCusto, Nome }) => ({
                label: `Centro de Custo  ${Nome}`,
                value: ID_CentroCusto
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};


const fetchOperador = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listarOperarios', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaOperador.value = [
            todosOption,
            ...response.data.map((funcionario) => ({
                label: funcionario.nome,
                value: funcionario.id_operador
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
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

// Função executada quando o componente é montado.
// Carrega todas as opções de filtros ao carregar o componente.
onMounted(() => {
    fetchDM(); // Carrega a lista de DM's
    fetchIdPlanta(); // Carrega a lista de plantas
    fetchSetorDiretoria(); // Carrega a lista de setores
    fetchOperador(); // Carrega a lista de operadores
    fetchCentroCusto(); // Carrega a lista de centros de custo
});
</script>

<template>
    <!-- Card container para o conteúdo -->
    <div class="card vh">
        <!-- Formulário que contém os campos de filtros e as tabelas -->
        <div class="form">
            <!-- Grid para a disposição dos campos de filtro e a tabela -->
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título da página -->
                <h5 class="my-4 text-2xl">Histórico de Abastecimento</h5>

                <!-- Condição para exibir os campos de filtro -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- Filtro de DM (Documento de Movimento) -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="dm">DM:</label>
                        <!-- Componente Dropdown para escolher o DM -->
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <!-- Filtro de Planta -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <!-- Componente Dropdown para escolher a planta -->
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" />
                    </div>
                    <!-- Filtro de Setor -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Setor:</label>
                        <!-- Componente Dropdown para escolher o setor -->
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                    </div>
                    <!-- Filtro de Centro de Custo -->
                    <div class="field lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <!-- Componente Dropdown para escolher o centro de custo -->
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" />
                    </div>

                    <!-- Filtro de Operador -->
                    <div class="field lg:col-6 md:col-6 sm:col-6">
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
                            :format="format"
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
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            placeholder="Selecione uma data final"
                        />
                    </div>
                    <!-- Botão para filtrar os dados -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                </div>

                <!-- DataTable para exibição dos resultados do histórico -->
                <div class="datatable-wrapper">
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
                                {{ formatTabela(new Date(data.Dia)) }}
                                <!-- Formata a data para o formato correto -->
                            </template>
                        </Column>
                        <Column field="Operador" sortable header="Operador"></Column>
                        <Column field="Nome_Produto" sortable header="Item"></Column>
                        <Column field="quantidade_abastecido" sortable header="Quantidade" class="text-center"></Column>
                        <Column field="posicao" sortable header="Posição"></Column>
                    </DataTable>
                </div>

                <!-- Exibe o conteúdo do histórico selecionado quando show for false -->
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                        <!-- Botão para voltar -->
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <!-- Componente de carregamento (spinner) exibido enquanto a requisição está sendo processada -->
    <LoadingSpinner v-if="loading" />

    <!-- Dialog de erro ou informação -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="true">
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
