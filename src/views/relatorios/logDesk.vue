<script setup>
// Importações necessárias para o funcionamento do componente
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente de seletor de data
import { FilterMatchMode } from 'primevue/api'; // Modo de filtragem do PrimeVue
import { useToast } from 'primevue/usetoast'; // Função para exibir mensagens de toast
import '@vuepic/vue-datepicker/dist/main.css'; // Estilo do VueDatePicker
import { ref, onMounted, watch } from 'vue'; // Funções do Vue para reatividade e ciclo de vida
import { useAuthStore } from '@/store/authStore.js'; // Store para autenticação e dados do usuário

import dmService from '@/services/DmService'; // Serviço para manipulação de dados DE dm
import usuarioDMService from '@/services/usuarioDMService';

import funcionarioService from '@/Services/funcionarioService.js';

import relatorioService  from '@/Services/relatorioService'; // Serviço para buscar logs de desktop
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// Contadores e mensagens reativas
const filteredCount = ref(0); // Contador de registros filtrados
const emptyMessage = computed(() => t('no_search_made')); // Mensagem para exibição quando não houver resultados

// Variáveis reativas para dados da store de autenticação e manipulação de dropdowns
const store = useAuthStore(); // Store do Vuex com informações de autenticação
const toast = useToast(); // Função para exibir mensagens toast
const dropdown1 = ref(null); // Referência para o primeiro dropdown
const dropdown2 = ref(null); // Referência para o segundo dropdown
const dropdown3 = ref(null); // Referência para o terceiro dropdown
const todosOption = { label: 'Todos', value: null }; // Opção padrão para "Todos" nos dropdowns

// Variáveis para armazenar os dados de DMs, operações e filtros
const historico = ref([]); // Armazena os registros históricos
const dms = ref([todosOption]); // Lista de DMs para o dropdown

// Filtros globais para busca
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que realiza busca por correspondência parcial
});

// Variáveis para armazenar as opções de funcionários e usuários
const ListaFuncionarios = ref([todosOption]);
const operador = ref([]); // Lista de usuários
const relatorioDesk = ref({ // Objeto que armazena os filtros para a busca de logs
    dm: '',
    id_usuario: '',
    id_funcionario: '',
    id_operacao: '',
    data_inicio: '',
    data_final: ''
});

/**
 * Função para formatar uma data no formato dd/MM/yyyy.
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada no padrão "dd/MM/yyyy"
 */
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

// Função que monitora mudanças no filtro global e atualiza o contador de registros filtrados
watch(() => filters.value.global.value, () => {
    filteredCount.value = historico.value.filter(item => {
        const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro global
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor no item contém o filtro
    }).length; // Atualiza o contador de registros filtrados
}, { immediate: true }); // O watch é executado imediatamente após a inicialização

// Função para buscar a lista de usuários (Usuário DM = Operador)
const fetchUsuarioDM = async () => {
    const data = { id_cliente: relatorioDesk.value.dm.id_cliente  }; // Dados para a requisição
    try {
        const response = await usuarioDMService.listarUDMSimples(data); // Requisição para buscar usuários
        operador.value = response.data.map(({ id, nome, id_cliente }) => ({ // Mapeia os usuários para o formato esperado no dropdown
            label: nome, 
            value: id,
            id_cliente: id_cliente
        }));
    } catch (error) {
        console.error('Erro ao carregar lista de operadores:', error); // Log de erro
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('operator_list_error'), life: 3000  }); // Mensagem de erro
    }
};
// Função para buscar DMs disponíveis
const fetchDM = async () => {
    try {
        const response = await dmService.listarDMId(); // Requisição para buscar DMs
        dms.value = [...response.data.map(({ id_dm, Identificacao , id_cliente}) => ({ // Mapeia as DMs para o formato esperado no dropdown
            label: Identificacao, 
            value: id_dm,
            id_cliente: id_cliente
        }))]; // Atualiza a lista de DMs
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Log de erro
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_dm_list'), life: 3000 }); // Mensagem de erro
    }
};

// Função que busca os funcionários disponíveis
const fetchFuncionarios = async () => {
    const data = { id_cliente: relatorioDesk.value.dm.id_cliente }; // Prepara os dados para a requisição

    try {
        const response= await funcionarioService.listarFuncionariosSimples(data);
        ListaFuncionarios.value = response.data.map((funcionario) => ({
            value: funcionario.id_funcionario, // ID do funcionário.
            label: funcionario.nome // Nome do funcionário.
        }));
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao carregar funcionários:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_employee_list'), life: 3000 }); // Exibe uma notificação de erro
    }
};

const buscar = async () => {

    try {
        historico.value = await relatorioService.logDesktop(relatorioDesk); // Requisição para buscar logs
        filteredCount.value = historico.value.length; // Atualiza o contador de registros filtrados
    } catch (error) {
        console.error('Erro ao buscar logs:', error); // Log de erro caso a requisição falhe
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('log_query_error'), life: 3000 }); // Mensagem de erro
    }
};

const handleDmChange = async () => {
    await fetchUsuarioDM(); // Busca os usuários
    await fetchFuncionarios(); // Busca os funcionários
    
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
});
</script>

<template>
    <!-- Formulário de filtros para a busca dos logs -->
    <div class="card vh p-fluid">
        <div class="form">
            <h5 class="my-6 ml-2 text-2xl">{{t('desk_log_title')}}</h5>
            <div class="grid mt-3 mx-1 p-1">
                <!-- Filtros para DM, Operação, Usuário, Funcionário, e Data -->
                <div class="field lg:col-2 md:col-6 sm:col-6">
                    <label for="operador">{{t('dm')}}:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.dm" :options="dms" optionLabel="label" filter
                    :placeholder="$t('all')" ref="dropdown1" @change="handleDmChange" />
                </div>
                <!-- <div class="field lg:col-4 md:col-6 sm:col-6">
                    <label for="operacao">Operação:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_operacao" :options="operacao" optionLabel="label"
                        optionValue="value" placeholder="Todos" />
                </div> -->
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="operador">{{t('operator')}}:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_usuario" :options="operador" optionLabel="label"
                        optionValue="value" :placeholder="$t('all')" ref="dropdown2" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="operador">{{t('employee')}}:</label>
                    <Dropdown class="drop" v-model="relatorioDesk.id_funcionario" :options="ListaFuncionarios" optionLabel="label"
                        optionValue="value" :placeholder="$t('all')" ref="dropdown3" />
                </div>
                <div class="field lg:col-2 md:col-6 sm:col-6">
                    <label for="perfil">{{t('initial_date')}}:</label>
                    <VueDatePicker class="drop" v-model="relatorioDesk.data_inicio" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" :placeholder="$t('initial_date_placeholder')" />
                </div>
                <div class="field lg:col-2 md:col-6 sm:col-6">
                    <label for="perfil">{{t('end_date')}}:</label>
                    <VueDatePicker class="drop" v-model="relatorioDesk.data_final" showIcon :showOnFocus="false"
                        :format="format" auto-apply locale="pt-BR" @open="handleDatepickerOpen"
                        :enable-time-picker="false" teleport="body" :placeholder="$t('end_date_placeholder')" />
                </div>
                <div class="field lg:col-12 md:col-12 sm:col-12">
                    <Button class="filtrar" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info"
                        @click="buscar" /> <!-- Botão para acionar a busca -->
                </div>
            </div>
        </div>
        <!-- Tabela para exibição dos logs -->
        <DataTable 
        v-model:filters="filters"
        :value="historico" 
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
                                    <span>{{$t('total_records')}}: {{ filteredCount }}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value"  :placeholder="t('search')" type="search" />
                                    </IconField>
                                </div>
                            </div>
                        </template>
                        <template #empty> {{ emptyMessage }} </template>

            <!-- Definição das colunas da tabela -->
            <Column field="dataHora" sortable :header="t('date')">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatDate(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Hora" sortable :header="t('time')">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatTime(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Operacao" sortable :header="t('operation')"></Column>
            <Column field="ID_Usuario" sortable :header="t('user')"></Column>
            <Column field="Log" sortable :header="t('summary')"></Column>
            <Column field="Resultado" sortable :header="t('result')"></Column>
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
