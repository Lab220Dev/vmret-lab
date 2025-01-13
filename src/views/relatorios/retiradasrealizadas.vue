<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para o controle de data
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de filtro para correspondência de filtros globais
import { useToast } from 'primevue/usetoast'; // Importa o serviço de toast para mensagens rápidas
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS necessário para o VueDatePicker
import { ref, onMounted, watch } from 'vue'; // Importa os hooks do Vue (ref, onMounted, watch)
import axios from '@/axios.js'; // Importa a instância de axios configurada para requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para obter dados de usuário e token
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de loading (spinner)

const showDialog = ref(false); // Controla a visibilidade do dialog de erro
const dialogMessage = ref(''); // Armazena a mensagem de erro que será exibida no dialog

const filteredCount = ref(0); // Contagem de itens filtrados (para a filtragem de dados)

const store = useAuthStore(); // Obtém o store de autenticação (para acessar o token e dados do usuário)
const toast = useToast(); // Instancia o toast para exibir mensagens ao usuário
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem exibida quando não há resultados

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

// Função para formatar a data como dd/MM/yyyy
const format = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para formatar a data de forma mais simples (dd/MM/yyyy)
const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para formatar a hora como HH:mm
const formatTime = (date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
};

// Função para converter uma data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

// Função assíncrona para buscar os dados do relatório
const buscar = async () => {
    // Monta o objeto com os parâmetros de busca, tratando valores nulos
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm,
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo,
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        loading.value = true;
        const response = await axios.post('relatorioRetiRe/relatorio', data);
        retiradas.value = response.data;

        // Atualiza a contagem de registros
        filteredCount.value = retiradas.value.length;

        // Exibe um diálogo caso não haja dados retornados
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
            showDialog.value = true;
        }
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = ''; // Limpa a mensagem de "sem dados"
        }
    } catch (error) {
        console.error('Erro ao buscar retiradas:', error); // Exibe o erro no console caso haja uma falha na requisição
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

// Funções para exportar os dados em CSV e JSON
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
};

// Exportação de dados em formato CSV
const exportCSV = () => {
    const csvContent = generateCSV(retiradas.value);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.csv');
    document.body.appendChild(link);
    link.click(); // Inicia o download do CSV
    document.body.removeChild(link);
};

// Exportação de dados em formato JSON
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.json');
    document.body.appendChild(link);
    link.click(); // Inicia o download do JSON
    document.body.removeChild(link);
};

// Função para buscar os DM's disponíveis
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioRetiRe/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // Atualiza as opções de DM
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Exibe erro caso a requisição falhe
    }
};

// Função para buscar as plantas disponíveis
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // Atualiza as opções de plantas
        plantas.value = [
            todosOption,
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`,
                value: id_planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error); // Exibe erro caso a requisição falhe
    }
};

// Função para buscar os setores/diretorias disponíveis
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
        ListaSetorOriginal.value = [
            todosOption,
            ...response.data.map(({ id_setor, nome, id_centro_custo }) => ({
                label: `Setor  ${nome}`,
                value: id_setor,
                id_centro_custo
            }))
        ];
        // Inicializa a lista de setores com todos os dados
        ListaSetor.value = ListaSetorOriginal.value;
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error); // Exibe erro caso a requisição falhe
    }
};

// Função para buscar os centros de custo disponíveis
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
        console.error('Erro ao buscar centros de custo:', error); // Exibe erro caso a requisição falhe
    }
};

// Função para filtrar setores baseados no centro de custo selecionado
const filterSetor = () => {
    if (relatorio.value.ID_CentroCusto) {
        // Filtra os setores de acordo com o centro de custo selecionado
        ListaSetor.value = ListaSetorOriginal.value.filter((setorItem) => setorItem.id_centro_custo === relatorio.value.ID_CentroCusto || setorItem.value === null);

        // Se a lista de setor estiver vazia após o filtro
        if (ListaSetor.value.length === 0) {
            // Adiciona a informação "não há setor"
            ListaSetor.value = [{ label: 'Não há setor ', value: null }];
        }
    } else {
        ListaSetor.value = ListaSetorOriginal.value; // Exibe todos os setores caso não haja filtro
    }
};

// Função para filtrar os funcionários baseados em setor ou planta selecionados
const filterFuncionarios = () => {
    // Verifica se há ao menos um filtro selecionado (setor ou planta)
    if (relatorio.value.id_setor || relatorio.value.id_planta) {
        // Filtra os funcionários com base no setor e planta
        ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
            const matchesSetor = relatorio.value.id_setor ? funcionario.id_setor === relatorio.value.id_setor : true;
            const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true;

            return matchesSetor && matchesPlanta; // Retorna os funcionários que atendem ambos os critérios
        });

        // Se a lista de funcionários estiver vazia após o filtro
        if (ListaFuncionarios.value.length === 0) {
            // Adiciona a informação "não há funcionários"
            ListaFuncionarios.value = [{ label: 'Não há funcionários ', value: null }];
        }
    } else {
        // Se não tiver filtros, exibe todos os funcionários
        ListaFuncionarios.value = ListaFuncionariosOriginal.value;
    }
};

// Função para buscar todos os funcionários disponíveis
const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncionariosOriginal.value = [
            todosOption,
            ...response.data.map((funcionario) => ({
                label: funcionario.nome,
                value: funcionario.id_funcionario,
                id_setor: funcionario.id_setor,
                id_planta: funcionario.id_planta
            }))
        ];
        // Inicialize a lista de funcionários com todos os dados
        ListaFuncionarios.value = ListaFuncionariosOriginal.value;
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error); // Exibe erro caso a requisição falhe
    }
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

// Ao montar o componente, carrega todas as informações necessárias
onMounted(() => {
    fetchDM();
    fetchIdPlanta();
    fetchSetorDiretoria();
    fetchFuncionarios();
    fetchCentroCusto();
});
</script>

<template>
    <!-- Card principal para exibição do relatório -->
    <div class="card vh">
        <!-- Título do card -->
        <h5 class="my-6 ml-2 text-2xl">Retiradas Realizadas</h5>

        <!-- Formulário de filtros de busca, visível quando a variável 'show' for verdadeira -->
        <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
            <!-- Filtro DM (Departamento ou Manager) -->
            <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                <label for="dm">DM:</label>
                <!-- Dropdown para selecionar DM (vinculado a 'relatorio.id_dm') -->
                <Dropdown class="drop" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1"></Dropdown>
            </div>

            <!-- Filtro Centro de Custo -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Centro de Custo:</label>
                <!-- Dropdown para selecionar Centro de Custo, com a chamada do método filterSetor em caso de mudança -->
                <Dropdown class="drop" v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" @change="filterSetor" />
            </div>

            <!-- Filtro Setor -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Setor:</label>
                <!-- Dropdown para selecionar Setor, com a chamada do método filterFuncionarios em caso de mudança -->
                <Dropdown class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" @change="filterFuncionarios" />
            </div>

            <!-- Filtro Planta -->
            <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                <label for="planta">Planta:</label>
                <!-- Dropdown para selecionar Planta, com a chamada do método filterFuncionarios em caso de mudança -->
                <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" @change="filterFuncionarios" />
            </div>

            <!-- Filtro Funcionário -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Funcionário:</label>
                <!-- Dropdown para selecionar Funcionário -->
                <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
            </div>

            <!-- Filtro Data Inicial -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Data Inicial:</label>
                <!-- DatePicker para selecionar a Data Inicial -->
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

            <!-- Filtro Data Final -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Data Final:</label>
                <!-- DatePicker para selecionar a Data Final -->
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

            <!-- Botão de filtro -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
            </div>

            <!-- Botão para exportar dados em CSV -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
            </div>

            <!-- Botão para exportar dados em JSON -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
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
            tableStyle="min-width: 50rem; table-layout: fixed;"
            ref="dt"
            class="mt-6"
            :sortField="'ProdutoSKU'"
            :sortOrder="1"
            :tableStyle="{ width: '100%' }"
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
                        <span>Total de registros: {{ filteredCount }}</span>
                        <!-- Exibe o total de registros filtrados -->
                    </div>
                    <div>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                            <!-- Campo de busca global -->
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty> {{ emptyMessage }} </template>

            <!-- Colunas da tabela -->
            <Column field="Identificacao" class="table-cell" sortable style="width: 8%" header="DM">
                <template #body="{ data }">
                    <span v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
                    <!-- Exibe o DM com tooltip -->
                </template>
            </Column>

            <Column field="Dia" sortable class="table-cell" style="width: 10%" header="Data">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatDate(new Date(data.Dia)) }}</span>
                    <!-- Exibe a data formatada -->
                </template>
            </Column>

            <Column field="Hora" sortable class="table-cell" style="width: 7%" header="Hora">
                <template #body="{ data }">
                    <span v-tooltip="data.Hora">{{ formatTime(new Date(data.Dia)) }}</span>
                    <!-- Exibe a hora formatada -->
                </template>
            </Column>

            <Column field="Matricula" sortable class="table-cell" style="width: 10%" header="Matricula">
                <template #body="{ data }">
                    <span v-tooltip="data.Matricula">{{ data.Matricula }}</span>
                    <!-- Exibe a matrícula -->
                </template>
            </Column>

            <Column field="Nome" class="table-cell" style="width: 10%" sortable header="Nome">
                <template #body="{ data }">
                    <span v-tooltip="data.Nome">{{ data.Nome }}</span>
                    <!-- Exibe o nome com tooltip -->
                </template>
            </Column>

            <Column field="Email" sortable class="table-cell" header="E-mail">
                <template #body="{ data }">
                    <span v-tooltip="data.Email">{{ data.Email }}</span>
                    <!-- Exibe o email com tooltip -->
                </template>
            </Column>

            <Column field="ProdutoNome" style="width: 20%" sortable class="table-cell" header="Item">
                <template #body="{ data }">
                    <span v-tooltip="data.ProdutoNome">{{ data.ProdutoNome }}</span>
                    <!-- Exibe o nome do produto -->
                </template>
            </Column>

            <Column field="Quantidade" style="width: 10%" sortable header="Quant" class="text-center table-cell"></Column>

            <Column field="ProdutoSKU" class="table-cell" style="width: 10%" sortable header="CA">
                <template #body="{ data }">
                    <span v-tooltip="data.ProdutoSKU">{{ data.ProdutoSKU }}</span>
                    <!-- Exibe o SKU do produto -->
                </template>
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
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
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
</style>
