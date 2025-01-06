<script setup>
// Importações necessárias para o funcionamento do componente
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente de seletor de data
import { FilterMatchMode } from 'primevue/api'; // Modo de filtragem do PrimeVue
import { useToast } from 'primevue/usetoast'; // Função para exibir mensagens de toast
import '@vuepic/vue-datepicker/dist/main.css'; // Estilo do VueDatePicker
import { ref, onMounted, watch } from 'vue'; // Funções do Vue para reatividade e ciclo de vida
import axios from '@/axios.js'; // Axios para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Store para autenticação e dados do usuário

// Contadores e mensagens reativas
const filteredCount = ref(0); // Contador de registros filtrados
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem para exibição quando não houver resultados

// Variáveis reativas para dados da store de autenticação e manipulação de dropdowns
const store = useAuthStore(); // Store do Vuex com informações de autenticação
const toast = useToast(); // Função para exibir mensagens toast
const dropdown1 = ref(null); // Referência para o primeiro dropdown
const dropdown2 = ref(null); // Referência para o segundo dropdown
const dropdown3 = ref(null); // Referência para o terceiro dropdown
const todosOption = { label: 'Todos', value: null }; // Opção padrão para "Todos" nos dropdowns

// Variáveis para armazenar os dados de DMs, operações e filtros
const historicoDesk = ref([]); // Armazena os registros históricos
const dms = ref([todosOption]); // Lista de DMs para o dropdown
const operacao = ref([ // Lista de tipos de operação para o dropdown
    { label: 'Todos', value: null },
    { label: 'Insert', value: 'INSERT' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
]);

// Filtros globais para busca
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que realiza busca por correspondência parcial
});

// Variáveis para armazenar as opções de funcionários e usuários
const ListaFuncionarios = ref([todosOption]);
const usuario = ref([]); // Lista de usuários
const relatorioDesk = ref({ // Objeto que armazena os filtros para a busca de logs
    dm: '',
    id_usuario: '',
    id_funcionario: '',
    id_operacao: '',
    data_inicio: '',
    data_final: ''
});

// Função para formatar data no formato dd/MM/yyyy
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Retorna a data no formato desejado
};

// Função para formatar a data de forma mais legível, com dois dígitos para o dia e mês
const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`; // Formato de data: dd/MM/yyyy
};

// Função para formatar a hora no formato HH:mm
const formatTime = (date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`; // Formato de hora: HH:mm
};

// Função para converter uma data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Retorna a data em formato ISO, ou null se não houver data
};

// Função para buscar logs com base nos filtros selecionados
const buscar = async () => {
    // Dados que serão enviados para a requisição
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente da store de autenticação
        id_dm: relatorioDesk.value.dm, // DM selecionado
        id_usuario: relatorioDesk.value.id_usuario, // ID do usuário selecionado
        id_funcionario: relatorioDesk.value.id_funcionario, // ID do funcionário selecionado
        operacao: relatorioDesk.value.id_operacao, // Operação selecionada
        data_inicio: toISODate(relatorioDesk.value.data_inicio), // Data inicial
        data_final: toISODate(relatorioDesk.value.data_final) // Data final
    };
    try {
        const response = await axios.post('/Log/relatoriodesk', data); // Requisição para buscar logs
        historicoDesk.value = response.data; // Armazena os dados retornados na variável reativa
        filteredCount.value = historicoDesk.value.length; // Atualiza o contador de registros filtrados
    } catch (error) {
        console.error('Erro ao buscar logs:', error); // Log de erro caso a requisição falhe
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar os logs' }); // Mensagem de erro
    }
};

// Função que monitora mudanças no filtro global e atualiza o contador de registros filtrados
watch(() => filters.value.global.value, () => {
    filteredCount.value = historicoDesk.value.filter(item => {
        const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro global
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor no item contém o filtro
    }).length; // Atualiza o contador de registros filtrados
}, { immediate: true }); // O watch é executado imediatamente após a inicialização

// Função para buscar DMs disponíveis
const fetchDM = async () => {
    const data = { id_cliente: store.userIdCliente }; // Dados para a requisição
    try {
        const response = await axios.post('/DM/listar', data); // Requisição para buscar DMs
        dms.value = [todosOption, ...response.data.map(({ ID_DM, Identificacao }) => ({ // Mapeia as DMs para o formato esperado no dropdown
            label: Identificacao, 
            value: ID_DM
        }))]; // Atualiza a lista de DMs
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Log de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as DMs' }); // Mensagem de erro
    }
};

// Função para buscar a lista de usuários
const fetchUsuario = async () => {
    const data = { id_cliente: store.userIdCliente }; // Dados para a requisição
    try {
        const response = await axios.post('/UDM/listaSimples', data); // Requisição para buscar usuários
        usuario.value = response.data.map(({ id, nome }) => ({ // Mapeia os usuários para o formato esperado no dropdown
            label: nome, 
            value: id
        }));
    } catch (error) {
        console.error('Erro ao carregar lista de usuários:', error); // Log de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os usuários' }); // Mensagem de erro
    }
};

// Função para buscar a lista de funcionários
const fetchFuncionarios = async () => {
    const data = { id_cliente: store.userIdCliente }; // Dados para a requisição
    try {
        const response = await axios.post('/funcionarios/listaSimples', data, { // Requisição para buscar funcionários
            headers: {
                Authorization: `Bearer ${store.token}` // Cabeçalho de autenticação
            }
        });
        ListaFuncionarios.value = response.data.map((funcionario) => ({ // Mapeia os funcionários para o formato esperado no dropdown
            label: funcionario.nome, 
            value: funcionario.id_funcionario
        }));
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error); // Log de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os funcionários' }); // Mensagem de erro
    }
};

// Função para fechar todos os dropdowns abertos
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o primeiro dropdown se ele estiver aberto
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o segundo dropdown se ele estiver aberto
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o terceiro dropdown se ele estiver aberto
};

// Função chamada ao abrir o datepicker, para fechar outros dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns
};

// Função chamada ao montar o componente, para buscar dados iniciais
onMounted(() => {
    fetchDM(); // Busca as DMs
    fetchUsuario(); // Busca os usuários
    fetchFuncionarios(); // Busca os funcionários
    //fetchOperacao(); // Função comentada, talvez usada no futuro
});
</script>

<template>
    <!-- Formulário de filtros para a busca dos logs -->
    <div class="card vh p-fluid">
        <div class="form">
            <h5 class="my-6 ml-2 text-2xl">Log de Maquina</h5>
            <div class="grid mt-3 mx-1 p-1">
                <!-- Filtros para DM, Operação, Usuário, Funcionário, e Data -->
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="usuario">DMs:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.dm" :options="dms" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown3" />
                </div>
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="operacao">Operação:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_operacao" :options="operacao" optionLabel="label"
                        optionValue="value" placeholder="Todos" />
                </div>
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="usuario">Usuário:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_usuario" :options="usuario" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown3" />
                </div>
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="usuario">Funcionario:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_funcionario" :options="ListaFuncionarios" optionLabel="label"
                        optionValue="value" placeholder="Todos" ref="dropdown4" />
                </div>
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="perfil">Data Inicial:</label>
                    <VueDatePicker class="drop" v-model="relatorioDesk.data_inicio" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" placeholder="Selecione uma data inicial" />
                </div>
                <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="perfil">Data Final:</label>
                    <VueDatePicker class="drop" v-model="relatorioDesk.data_final" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" placeholder="Selecione uma data final" />
                </div>
                <div class="field lg:col-12 md:col-12 sm:col-12">
                    <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info"
                        @click="buscar" /> <!-- Botão para acionar a busca -->
                </div>
            </div>
        </div>
        <!-- Tabela para exibição dos logs -->
        <DataTable 
        v-model:filters="filters"
        :value="historicoDesk" 
        stripedRows 
        showGridlines 
        paginator 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        rowHover
        :globalFilterFields="['Dia', 'Operacao', 'ID_Usuario', 'Log', 'Resultado']"  
        dataKey="Operacao"
        :tableStyle="{ width: '100%' }"
        :sortOrder="1"
        :sortField="'Operacao'"  >

        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                    <span>Total de registros: {{ filteredCount }}</span>
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

            <!-- Definição das colunas da tabela -->
            <Column field="dataHora" sortable header="Data">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatDate(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Hora" sortable header="Hora">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatTime(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Operacao" sortable header="Operação"></Column>
            <Column field="ID_Usuario" sortable header="Usuário"></Column>
            <Column field="Log" sortable header="Resumo"></Column>
            <Column field="Resultado" sortable header="Resultado"></Column>
        </DataTable>
    </div>
</template>

<style scoped>
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
</style>
