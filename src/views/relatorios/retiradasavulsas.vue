<script setup>
// Importações de componentes, funções e bibliotecas
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente VueDatePicker para selecionar datas
import { FilterMatchMode } from 'primevue/api'; // Função da biblioteca PrimeVue para modos de filtro
import { useToast } from 'primevue/usetoast'; // Hook de notificação Toast da PrimeVue
import '@vuepic/vue-datepicker/dist/main.css'; // Estilos do VueDatePicker
import { ref, onMounted, watch } from 'vue'; // Funções do Vue (reactividade, lifecycle, watch)
import axios from '@/axios.js'; // Instância axios personalizada
import { useAuthStore } from '@/store/authStore.js'; // Composição de store para autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de Spinner de carregamento

// Definindo as variáveis reativas do componente
const filteredCount = ref(0); // Contagem filtrada de itens na tabela
const showDialog = ref(false); // Controle de visibilidade do diálogo de erro
const dialogMessage = ref(''); // Mensagem a ser exibida no diálogo de erro
const originalSetores = ref([]); // Armazena dados originais de setores
const loading = ref(false); // Controle de carregamento da requisição
const originalFuncionarios = ref([]); // Armazena dados originais de funcionários
const store = useAuthStore(); // Acesso à store de autenticação
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem quando não há dados
const retiradas = ref([]); // Dados das retiradas a serem exibidos na tabela
const dropdown1 = ref(null); // Referências para os dropdowns usados nos filtros
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);
const dropdown6 = ref(null);

// Definições de opções gerais para dropdowns
const todosOption = { label: 'Todos', value: null }; // Opção "Todos" para dropdowns

// Dados para as opções dos filtros
const ListaFuncionarios = ref(null); // Lista de funcionários
const dms = ref([todosOption]); // Lista de DMs
const plantas = ref([todosOption]); // Lista de plantas
const setor = ref([todosOption]); // Lista de setores
const centroCusto = ref([todosOption]); // Lista de centros de custo

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

// Função para formatar a data no formato dd/mm/yyyy
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Meses começam do zero, então somamos 1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Função para converter a data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Retorna a data formatada em ISO, ou null se não houver data
};

// Função para buscar os dados do relatório
const buscar = async () => {
    // Estrutura dos dados que serão enviados na requisição
    const data = {
        id_usuario: store.userId, // ID do usuário autenticado
        id_cliente: store.userIdCliente, // ID do cliente
        id_dm: relatorio.value.dm === null ? undefined : relatorio.value.dm, // Filtro DM (se não for selecionado, não é enviado)
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta, // Filtro Planta
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo, // Filtro Centro de Custo
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor, // Filtro Setor
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // Filtro Funcionário
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início formatada em ISO
        data_final: toISODate(relatorio.value.data_final) // Data final formatada em ISO
    };

    try {
        loading.value = true; // Ativa o carregamento
        const response = await axios.post('', data, { // Envia a requisição para a API
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autorização para a requisição
            }
        });

        retiradas.value = response.data; // Dados recebidos da requisição
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

// Função para buscar os DMs
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
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`, // Identificação do DM
                value: ID_DM // Valor do DM
            }))
        ];
    } catch (error) {
        // Mensagem de erro ao carregar a lista de DMs
        console.error('Erro ao carregar lista de dms:', error);
    }
};

// Função para buscar as plantas
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

        // Atualiza a lista de plantas
        plantas.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`, // Nome da planta
                value: id_planta // ID da planta
            }))
        ];
    } catch (error) {
        // Mensagem de erro ao carregar plantas
        console.error('Erro ao buscar opções de plantas:', error);
    }
};

// Função para buscar os setores
const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente
    };

    try {
        const response = await axios.post('Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });

        // Atualiza a lista de setores
        originalSetores.value = response.data;
        setor.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map(({ id_setor, nome }) => ({
                label: `Setor  ${nome}`, // Nome do setor
                value: id_setor // ID do setor
            }))
        ];
    } catch (error) {
        // Mensagem de erro ao carregar setores/diretorias
        console.error('Erro ao buscar setores/diretorias:', error);
    }
};

// Função para buscar os centros de custo
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente
    };

    try {
        const response = await axios.post('cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });

        // Atualiza a lista de centros de custo
        centroCusto.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map(({ ID_CentroCusto, Nome }) => ({
                label: `Centro de Custo  ${Nome}`, // Nome do centro de custo
                value: ID_CentroCusto // ID do centro de custo
            }))
        ];
    } catch (error) {
        // Mensagem de erro ao carregar centros de custo
        console.error('Erro ao buscar centros de custo:', error);
    }
};

// Função para buscar os funcionários
const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente
    };

    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });

        // Atualiza os dados de funcionários
        originalFuncionarios.value = response.data;
        ListaFuncionarios.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map((funcionario) => ({
                label: funcionario.nome, // Nome do funcionário
                value: funcionario.id_funcionario // ID do funcionário
            }))
        ];
    } catch (error) {
        // Mensagem de erro ao carregar funcionários
        console.error('Erro ao carregar usuários:', error);
    }
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown1 se estiver aberto
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown2 se estiver aberto
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o dropdown3 se estiver aberto
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o dropdown4 se estiver aberto
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o dropdown5 se estiver aberto
    if (dropdown6.value?.overlayVisible) dropdown6.value.hide(); // Fecha o dropdown6 se estiver aberto
};

// Função para filtrar setores conforme o centro de custo
const filterSetores = () => {
    let filteredSetores = originalSetores.value; // Começa com todos os setores

    // Se houver um centro de custo selecionado, filtra os setores conforme o centro de custo
    if (relatorio.value.id_centro_custo) {
        filteredSetores = filteredSetores.filter(s => s.id_centro_custo === relatorio.value.id_centro_custo);
    }

    // Atualiza a lista de setores filtrados
    setor.value = [
        todosOption, // Adiciona a opção "Todos"
        ...filteredSetores.map(({ id_setor, nome }) => ({
            label: `Setor ${nome}`, // Nome do setor
            value: id_setor // ID do setor
        }))
    ];
};

// Função para filtrar funcionários conforme os filtros aplicados
const filterFuncionarios = () => {
    let filteredFuncionarios = originalFuncionarios.value; // Começa com todos os funcionários

    // Filtra os funcionários conforme planta, setor e centro de custo
    if (relatorio.value.id_planta) {
        filteredFuncionarios = filteredFuncionarios.filter(f => f.id_planta === relatorio.value.id_planta);
    }
    if (relatorio.value.id_setor) {
        filteredFuncionarios = filteredFuncionarios.filter(f => f.id_setor === relatorio.value.id_setor);
    }
    if (relatorio.value.id_centro_custo) {
        filteredFuncionarios = filteredFuncionarios.filter(f => f.id_centro_custo === relatorio.value.id_centro_custo);
    }

    // Atualiza a lista de funcionários filtrados
    ListaFuncionarios.value = [
        todosOption, // Adiciona a opção "Todos"
        ...filteredFuncionarios.map((funcionario) => ({
            label: funcionario.nome, // Nome do funcionário
            value: funcionario.id_funcionario // ID do funcionário
        }))
    ];
};

// Observador para filtrar os funcionários quando os filtros de planta, setor ou centro de custo mudam
watch(
    () => [relatorio.value.id_planta, relatorio.value.id_setor, relatorio.value.id_centro_custo],
    filterFuncionarios // Chama a função filterFuncionarios sempre que os filtros mudam
);

// Observador para filtrar setores quando o centro de custo muda
watch(
    () => relatorio.value.id_centro_custo,
    (newValue, oldValue) => {
        console.log("Centro de Custo mudou:", oldValue, "->", newValue); // Loga a mudança do centro de custo
        filterSetores(); // Filtra setores conforme o novo centro de custo
    }
);

// Observador para atualizar a contagem dos itens filtrados quando o filtro global for alterado
watch(() => filters.value.global.value, () => {
    filteredCount.value = retiradas.value.filter(item => {
        const filterValue = filters.value.global.value?.toLowerCase() || '';
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); 
    }).length;
}, { immediate: true }); // Executa imediatamente após a montagem

// Função que é chamada quando o DatePicker é aberto, fechando todos os dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns quando o DatePicker for aberto
};

// Função chamada ao montar o componente
onMounted(() => {
    fetchDM(); // Busca os DMs
    fetchIdPlanta(); // Busca as plantas
    fetchSetorDiretoria(); // Busca os setores/diretorias
    fetchFuncionarios(); // Busca os funcionários
    fetchCentroCusto(); // Busca os centros de custo
});
</script>

<template>
    <!-- Container principal do componente -->
    <div class="card vh">
        <div class="form">
            <!-- Grid de layout -->
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título principal -->
                <h5 class="my-4 text-2xl">Retiradas Avulsas</h5>
                
                <!-- Formulário de busca para o relatório, exibido quando "show" for true -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    
                    <!-- Campo de filtro para DM -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Dropdown para selecionar DM -->
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label"
                            optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    
                    <!-- Campo de filtro para Planta -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="planta">Planta:</label>
                        <!-- Dropdown para selecionar Planta -->
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label"
                            optionValue="value" placeholder="Todos" ref="dropdown2" />
                    </div>
                    
                    <!-- Campo de filtro para Setor -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">Setor:</label>
                        <!-- Dropdown para selecionar Setor -->
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label"
                            optionValue="value" placeholder="Todos" ref="dropdown3" />
                    </div>
                    
                    <!-- Campo de filtro para Centro de Custo -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <!-- Dropdown para selecionar Centro de Custo -->
                        <Dropdown class="drop" v-model="relatorio.ID_CentroCusto" :options="centroCusto"
                            optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" />
                    </div>
                    
                    <!-- Campo de filtro para Funcionário -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">Funcionário:</label>
                        <!-- Dropdown para selecionar Funcionário -->
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios"
                            optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
                    </div>
                    
                    <!-- Campo de filtro para Voucher -->
                    <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">Voucher:</label>
                        <!-- Dropdown para selecionar Voucher -->
                        <Dropdown class="drop" v-model="relatorio.voucher" :options="ListaFuncionarios" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown6" />
                    </div>
                    
                    <!-- Campo de filtro para Data Inicial -->
                    <div class="field xl:col-4 lg:col-4 md:col-4 sm:col-12">
                        <label for="perfil">Data Inicial:</label>
                        <!-- DatePicker para selecionar Data Inicial -->
                        <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" auto-apply ref="datepicker1" :enable-time-picker="false"
                            teleport="body" @open="handleDatepickerOpen" placeholder="Selecione uma data inicial" />
                    </div>
                    
                    <!-- Campo de filtro para Data Final -->
                    <div class="field xl:col-4 lg:col-4 md:col-4 sm:col-12">
                        <label for="perfil">Data Final:</label>
                        <!-- DatePicker para selecionar Data Final -->
                        <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" auto-apply ref="datepicker1" :enable-time-picker="false"
                            teleport="body" placeholder="Selecione uma data final" @open="handleDatepickerOpen" />
                    </div>
                    
                    <!-- Botão de Filtrar -->
                    <div class="field xl:col-4 lg:col-4 md:col-4 sm:col-12 justify-self-end">
                        <!-- Botão para filtrar dados do relatório -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info"
                            @click="buscar" />
                    </div>

                    <!-- <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field lg:col-3 md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div> -->
                </div>

                <!-- Tabela de Dados do Relatório -->
                <div class="datatable-wrapper">
                    <!-- DataTable que exibe os dados das retiradas -->
                    <DataTable v-model:filters="filters" :value="retiradas" stripedRows showGridlines paginator
                        :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" rowHover
                        :globalFilterFields="['DM', 'Data', 'Matricula', 'Nome', 'Email', 'CodigoCa', 'Item']"
                        :tableStyle="{ width: '100%' }" ref="dt"
                        :sortField="'CodigoCa'"
                        removableSort
                        :sortOrder="1"  >
                        
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
                        <Column field="DM" sortable header="DM"></Column>
                        <Column field="Data" sortable header="Data"></Column>
                        <Column field="Matricula" sortable header="Matricula"></Column>
                        <Column field="Voucher" sortable header="Voucher"></Column>
                        <Column field="Nome" sortable header="Nome"></Column>
                        <Column field="Email" sortable header="E-mail"></Column>
                        <Column field="CodigoCa" sortable header="CA"></Column>
                        <Column field="Item" sortable header="Item"></Column>
                    </DataTable>
                </div>
                
                <!-- Exibição do cartão com os detalhes do item selecionado -->
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <!-- Botão para voltar aos dados principais -->
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <!-- Componente de spinner de carregamento -->
    <LoadingSpinner v-if="loading" />

    <!-- Mensagem de erro exibida em um diálogo -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="true">
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
