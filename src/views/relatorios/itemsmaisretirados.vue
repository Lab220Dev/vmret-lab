<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente de calendário (datepicker)
import { FilterMatchMode } from 'primevue/api'; // Importa o tipo de filtro para a tabela (DataTable) do PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa a função para exibir mensagens de toast (notificações)
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o estilo do componente VueDatePicker
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'; // Importa funções reativas e de ciclo de vida do Vue
import axios from '@/axios.js'; // Importa o cliente axios configurado
import { useAuthStore } from '@/store/authStore.js'; // Importa o store para autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento

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
const store = useAuthStore();

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
const emptyMessage = ref('Ainda não foi feita nenhuma busca');

/**
 * @type {Ref<any>}
 * Referência para o primeiro dropdown (DM).
 */
const dropdown1 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o segundo dropdown (Planta).
 */
const dropdown2 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o terceiro dropdown (Setor).
 */
const dropdown3 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o quarto dropdown (Centro de Custo).
 */
const dropdown4 = ref(null);

/**
 * @type {Ref<any>}
 * Referência para o quinto dropdown (Funcionário).
 */
const dropdown5 = ref(null);

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
const dms = ref([todosOption]);

/**
 * @type {Ref<Array<any>>}
 * Lista de Plantas.
 * @default [todosOption]
 */
const plantas = ref([todosOption]);

/**
 * @type {Ref<Array<any>>}
 * Lista de Centros de Custo.
 * @default [todosOption]
 */
const centroCusto = ref([todosOption]);

/**
 * @type {Ref<Array<any>>}
 * Lista original de funcionários.
 * @default []
 */
const ListaFuncionariosOriginal = ref([]);

/**
 * @type {Ref<Array<any>>}
 * Lista filtrada de funcionários.
 * @default []
 */
const ListaFuncionarios = ref([]);

/**
 * @type {Ref<Array<any>>}
 * Lista original de setores.
 * @default []
 */
const ListaSetorOriginal = ref([]);

/**
 * @type {Ref<Array<any>>}
 * Lista filtrada de setores.
 * @default []
 */
const ListaSetor = ref([]);

/**
 * @type {Ref<Object>}
 * Filtro global para a tabela. O filtro é baseado no valor digitado pelo usuário.
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

/**
 * @type {Ref<boolean>}
 * Flag que controla a exibição da tabela de resultados.
 * @default false
 */
const show = ref(false);

/**
 * @type {Ref<any[]>}
 * Armazena o item selecionado para exibição de detalhes.
 * @default []
 */
const selectedItem = ref([]);

/**
 * @type {Ref<boolean>}
 * Flag que controla a exibição do spinner de carregamento.
 * @default false
 */
const loading = ref(false);

/**
 * @type {Ref<Object>}
 * Relatório que contém os filtros selecionados para a consulta (DM, Planta, Setor, Centro de Custo, etc).
 */
const relatorio = ref({
    id_dm: '',
    id_planta: null,
    ID_CentroCusto: '',
    id_setor: null,
    id_funcionario: null,
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1º dia do mês atual
    data_final: new Date() // data atual
});

/**
 * Função para formatar uma data no formato "dd/MM/yyyy".
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada no padrão "dd/MM/yyyy".
 */
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Meses são baseados em zero.
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Retorna a data formatada no padrão dd/MM/yyyy
};

/**
 * Função para converter a data para o formato ISO (usado nas requisições API).
 * @param {Date} date - A data a ser convertida.
 * @returns {string|null} - A data no formato ISO ou null se não houver data.
 */
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Converte para formato ISO
};

/**
 * Função de busca que envia os parâmetros para a API e recebe os dados das retiradas.
 */
const buscar = async () => {
    const data = {
        id_usuario: store.userId, // ID do usuário logado
        id_cliente: store.userIdCliente, // ID do cliente associado ao usuário
        id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm, // Filtro por DM (Documentos de Medição)
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta, // Filtro por Planta
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo, // Filtro por Centro de Custo
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor, // Filtro por Setor
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // Filtro por Funcionário
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início formatada para ISO
        data_final: toISODate(relatorio.value.data_final) // Data final formatada para ISO
    };
    
    try {
        loading.value = true; // Ativa a flag de carregamento
        const response = await axios.post('relatorioItems/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        retiradas.value = response.data; // Armazena os dados das retiradas na variável reativa
        
        // Atualiza a contagem de registros filtrados
        filteredCount.value = retiradas.value.length;

        // Se não houver dados, exibe mensagem informativa
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.'; // Mensagem de erro
        } else {
            emptyMessage.value = ''; // Limpa a mensagem de erro
        }

        // Caso não haja resultados, exibe o diálogo de erro
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.'; // Mensagem de erro no modal
            showDialog.value = true; // Exibe o modal com a mensagem de erro
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error); // Exibe erro no console se ocorrer falha
    } finally {
        loading.value = false; // Desativa o carregamento ao finalizar a requisição
    }
};

/**
 * Reage à mudança no filtro global e atualiza a contagem de itens filtrados.
 */
watch(
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

// Função para gerar o conteúdo CSV com base nos dados fornecidos
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Cabeçalhos das colunas
    const rows = data.map((row) => Object.values(row).join(',')).join('\n'); // Corpo da tabela
    return `${headers}\n${rows}`; // Retorna o conteúdo CSV
};

// Função para exportar os dados para um arquivo CSV
const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {
        // Verifica se retiradas.value é um array
        // Agrega detalhes de cada produto
        const detalhesAgregados = retiradas.value.flatMap((produto) => {
            if (Array.isArray(produto.Detalhes)) {
                return produto.Detalhes; // Retorna os detalhes do produto
            } else {
                console.warn(`Detalhes não é um array para o produto ${produto.ProdutoID}`); // Alerta no console se detalhes não for um array
                return [];
            }
        });

        // Gera o conteúdo CSV
        const csvContent = generateCSV(detalhesAgregados);

        // Cria um Blob e link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Items_Mais_Retiradas.csv'); // Nome do arquivo CSV
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.error('retiradas.value não é um array.'); // Exibe erro se retiradas.value não for um array
    }
};

// Função para exportar os dados para um arquivo JSON
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2); // Converte os dados em JSON com espaçamento
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' }); // Cria um Blob com os dados JSON
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.json'); // Nome do arquivo JSON
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Função para buscar DM's (Documentos de Medição)
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente associado ao usuário
    };
    try {
        const response = await axios.post('/relatorioItems/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        dms.value = [
            todosOption, // Adiciona a opção "Todos" ao começo da lista
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`, // Identificação do DM
                value: ID_DM // ID do DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Exibe erro se falhar ao buscar os DM's
    }
};

// Função para buscar as plantas associadas ao cliente
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente associado ao usuário
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        plantas.value = [
            todosOption, // Adiciona a opção "Todos" ao começo da lista
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`, // Nome da planta
                value: id_planta // ID da planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error); // Exibe erro se falhar ao buscar plantas
    }
};

// Função para buscar setores/diretorias
const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente associado ao usuário
    };
    try {
        const response = await axios.post('Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        ListaSetorOriginal.value = [
            todosOption, // Adiciona a opção "Todos" ao começo da lista
            ...response.data.map(({ id_setor, nome, id_centro_custo }) => ({
                label: `Setor  ${nome}`, // Nome do setor
                value: id_setor, // ID do setor
                id_centro_custo // ID do centro de custo associado ao setor
            }))
        ];
        // Inicializa a lista de setores com todos os dados
        ListaSetor.value = ListaSetorOriginal.value;
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error); // Exibe erro se falhar ao buscar setores
    }
};

// Função para buscar centros de custo
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente associado ao usuário
    };
    try {
        const response = await axios.post('cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        centroCusto.value = [
            todosOption, // Adiciona a opção "Todos" ao começo da lista
            ...response.data.map(({ ID_CentroCusto, Nome }) => ({
                label: `Centro de Custo  ${Nome}`, // Nome do centro de custo
                value: ID_CentroCusto // ID do centro de custo
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error); // Exibe erro se falhar ao buscar centros de custo
    }
};

// Função para filtrar setores com base no centro de custo selecionado
const filterSetor = () => {
    if (relatorio.value.ID_CentroCusto) {
        // Verifica se foi selecionado um centro de custo
        // Filtra os setores com base no centro de custo selecionado
        ListaSetor.value = ListaSetorOriginal.value.filter((setorItem) => setorItem.id_centro_custo === relatorio.value.ID_CentroCusto || setorItem.value === null);
    } else {
        ListaSetor.value = ListaSetorOriginal.value; // Se não houver filtro, exibe todos os setores
    }
};

// Função para filtrar funcionários com base em filtros selecionados
const filterFuncionarios = () => {
    // Verifica se há ao menos um filtro selecionado
    if (relatorio.value.id_setor || relatorio.value.id_planta) {
        ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
            const matchesSetor = relatorio.value.id_setor ? funcionario.id_setor === relatorio.value.id_setor : true;
            const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true;

            return matchesSetor && matchesPlanta; // Filtra funcionários por setor e planta
        });
    } else {
        ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Exibe todos os funcionários se não houver filtro
    }
};

// Função para buscar a lista de funcionários
const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente associado ao usuário
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autorização no cabeçalho
            }
        });
        ListaFuncionariosOriginal.value = [
            todosOption, // Adiciona a opção "Todos" ao começo da lista
            ...response.data.map((funcionario) => ({
                label: funcionario.nome, // Nome do funcionário
                value: funcionario.id_funcionario, // ID do funcionário
                id_setor: funcionario.id_setor, // ID do setor associado
                id_planta: funcionario.id_planta // ID da planta associada
            }))
        ];
        // Inicializa a lista de funcionários com todos os dados
        ListaFuncionarios.value = ListaFuncionariosOriginal.value;
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error); // Exibe erro se falhar ao buscar funcionários
    }
};

// Função para fechar todos os dropdowns abertos
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown de DM
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown de Planta
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o dropdown de Setor
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o dropdown de Funcionário
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o dropdown de Centro de Custo
};

// Função para fechar os dropdowns quando o datepicker for aberto
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns
};

// Função chamada ao montar o componente
onMounted(() => {
    fetchDM(); // Chama a função para buscar DM's
    fetchIdPlanta(); // Chama a função para buscar plantas
    fetchSetorDiretoria(); // Chama a função para buscar setores/diretorias
    fetchFuncionarios(); // Chama a função para buscar funcionários
    fetchCentroCusto(); // Chama a função para buscar centros de custo
});
</script>

<template>
    <div class="card vh">
        <!-- Card principal da página -->
        <div class="form">
            <!-- Container para o formulário -->
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título principal -->
                <h5 class="my-6 ml-2 text-2xl">Itens mais retirados</h5>

                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Início do formulário de busca de informações para o relatório -->
                    <!-- Filtro para DM (Documento de Medição) -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="id_dm">DM:</label>
                        <!-- Dropdown para selecionar o DM (documento de medição) -->
                        <Dropdown class="drop" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>

                    <!-- Filtro para Centro de Custo -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <!-- Dropdown para selecionar o centro de custo -->
                        <Dropdown class="drop" v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" @change="filterSetor" />
                    </div>

                    <!-- Filtro para Setor -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="perfil">Setor:</label>
                        <!-- Dropdown para selecionar o setor -->
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" @change="filterFuncionarios" />
                    </div>

                    <!-- Filtro para Planta -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <!-- Dropdown para selecionar a planta -->
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" @change="filterFuncionarios" />
                    </div>

                    <!-- Filtro para Funcionário -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <!-- Dropdown para selecionar o funcionário -->
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
                    </div>

                    <!-- Filtro para Data Inicial -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <!-- DataPicker para selecionar a data inicial -->
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
                            teleport="body"
                            placeholder="Selecione uma data inicial"
                        />
                    </div>

                    <!-- Filtro para Data Final -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <!-- DataPicker para selecionar a data final -->
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
                            teleport="body"
                            placeholder="Selecione uma data final"
                        />
                    </div>

                    <!-- Botão de Filtrar -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- Botão para Exportar para CSV -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>

                    <!-- Botão para Exportar para JSON -->
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>
                </div>

                <!-- DataTable para exibir os resultados do relatório -->
                <div class="datatable-wrapper mt-6">
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
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <div>
                                    <!-- Filtro global de pesquisa -->
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty>{{ emptyMessage }} </template>
                        <!-- Colunas da tabela -->
                        <Column field="ProdutoNome" sortable header="Item"></Column>
                        <Column field="quantidade_no_periodo" sortable style="width: 15%" header="Quantidade" class="text-center"></Column>
                        <Column field="ProdutoSKU" sortable style="width: 15%" header="CA"></Column>
                    </DataTable>

                    <!-- Exibe os detalhes do produto em um modal -->
                    <card v-if="show" class="details-card">
                        <template #title>Detalhes do Produto</template>
                        <template #content>
                            <DataTable 
                            :value="selectedItem" 
                            stripedRows 
                            removableSort 
                            showGridlines 
                            paginator 
                            :rows="10" 
                            :rowsPerPageOptions="[5, 10, 20, 50]" 
                            rowHover>
                                <Column field="Identificacao" sortable header="DM"></Column>
                                <Column field="ProdutoNome" sortable header="Item"></Column>
                                <Column field="Data" sortable header="Data"></Column>
                                <Column field="Quantidade" sortable header="Quantidade"> </Column>
                                <Column field="ProdutoSKU" sortable header="SKU"></Column>
                            </DataTable>
                        </template>
                    </card>
                </div>
            </div>
        </div>
    </div>

    <!-- Spinner de carregamento, exibido enquanto os dados estão sendo carregados -->
    <LoadingSpinner v-if="loading" />

    <!-- Diálogo de erro com a mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style>
/* Estilo para o cabeçalho do dialog */
.dialog-header {
    /* Exibe os itens em linha (horizontais) */
    display: flex;
    /* Alinha os itens verticalmente no centro */
    align-items: center;
    /* Cria espaço entre os itens, posicionando-os nas extremidades */
    justify-content: space-between;
}

/* Estilo para o conteúdo do dialog */
.dialog-content {
    /* Adiciona um espaçamento interno de 1 rem em todos os lados */
    padding: 1rem;
}

/* Estilo para a mensagem dentro do dialog */
.dialog-message {
    /* Define o alinhamento do texto como justificado */
    text-align: justify;
    /* Remove a margem da mensagem para evitar espaços desnecessários */
    margin: 0;
}

/* Estilo para o card */
.card {
    /* Permite o conteúdo do card se estender além do limite horizontal (caso necessário) */
    overflow-x: auto;
}

/* Estilo para a área que envolve a DataTable */
.datatable-wrapper {
    /* Permite que o conteúdo da DataTable se estenda horizontalmente se necessário */
    overflow-x: auto;
    /* Define a largura da área como 100% da largura da viewport */
    width: 100vw;
}

/* Estilo para o botão de filtro */
.filtrar {
    /* Define a margem superior do botão de filtro */
    margin-top: 25px;
}

/* Estilo para os campos de dropdown */
.drop {
    /* Define que os campos de dropdown devem ocupar toda a largura disponível */
    width: 100%;
}

/* Estilos responsivos para telas pequenas (máximo de 580px de largura) */
@media (max-width: 580px) {
    /* Define o comportamento do campo no formulário */
    .form .field {
        /* Define que o campo deve ocupar 100% da largura disponível */
        flex: 0 0 100%;
        max-width: 100%;
        /* Adiciona um espaço abaixo dos campos */
        margin-bottom: 1rem;
    }

    /* Ajusta o tamanho do dropdown para telas pequenas */
    .form .field .drop {
        /* Garante que o dropdown ocupe toda a largura disponível */
        width: 100%;
    }

    /* Ajusta a largura dos botões de filtro e exportação para telas pequenas */
    .form .field .filtrar,
    .form .field .exportar {
        /* Garante que os botões de filtro e exportação ocupem 100% da largura disponível */
        width: 100%;
    }
}

/* Estilo para o campo no formulário */
.field {
    /* Impede que o conteúdo do campo se quebre em várias linhas */
    white-space: nowrap;
    /* Alinha o texto dentro do campo à esquerda */
    text-align: left;
}
</style>
