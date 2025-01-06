<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importação do componente VueDatePicker para seleção de datas
import { FilterMatchMode } from 'primevue/api'; // Importação do FilterMatchMode para configurar filtros na DataTable
import { useToast } from 'primevue/usetoast'; // Importação do hook useToast para exibir mensagens de notificação
import '@vuepic/vue-datepicker/dist/main.css'; // Importação do CSS do VueDatePicker
import { ref, onMounted, watch } from 'vue'; // Importação dos hooks do Vue: ref, onMounted e watch
import axios from '@/axios.js'; // Importação do Axios para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importação do store para gerenciar o estado de autenticação

const filteredCount = ref(0); // Contador reativo para o número de registros filtrados

const store = useAuthStore(); // Acesso ao store de autenticação
const toast = useToast(); // Acesso ao toast para mostrar mensagens de notificação
const dropdown1 = ref(null); // Referência para o primeiro dropdown (não utilizado no template atual)
const dropdown2 = ref(null); // Referência para o segundo dropdown (não utilizado no template atual)
const dropdown3 = ref(null); // Referência para o terceiro dropdown (usado para o filtro de usuários)
const todosOption = { label: 'Todos', value: null }; // Opção "Todos" para dropdowns de seleção
const historico = ref([]); // Lista reativa que armazenará os dados do histórico de logs
const dms = ref([todosOption]); // Lista reativa que armazenará os DMs (Data Migrations) disponíveis
const operacao = ref([  // Lista de opções para filtro de operações
    { label: 'Todos', value: null },
    { label: 'Insert', value: 'INSERT' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' }
]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para a DataTable (por padrão, filtra por "CONTÉM")
});

const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem a ser exibida se não houver dados filtrados

const ListaFuncionarios = ref([todosOption]); // Lista reativa que armazenará os funcionários disponíveis
const usuario = ref([]); // Lista reativa que armazenará os usuários disponíveis
const relatorio = ref({ // Objeto reativo que mantém os filtros do relatório
    dm: '',
    id_usuario: '',
    id_funcionario: '',
    id_operacao: '',
    data_inicio: '',
    data_final: ''
});

// Função que formata a data no formato dd/MM/yyyy
const format = (date) => {
    const day = date.getDate(); // Dia da data
    const month = date.getMonth() + 1; // Mês da data (adicione 1 porque o índice começa do 0)
    const year = date.getFullYear(); // Ano da data

    return `${day}/${month}/${year}`; // Retorna a data formatada como string
};

// Função que formata a data no formato dd/MM/yyyy
const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0'); // Dia com dois dígitos
    const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês com dois dígitos
    const ano = date.getFullYear(); // Ano

    return `${dia}/${mes}/${ano}`; // Retorna a data no formato dd/MM/yyyy
};

// Função que formata a hora no formato HH:mm
const formatTime = (date) => {
    const horas = date.getHours().toString().padStart(2, '0'); // Hora com dois dígitos
    const minutos = date.getMinutes().toString().padStart(2, '0'); // Minutos com dois dígitos
    return `${horas}:${minutos}`; // Retorna a hora no formato HH:mm
};

// Função que converte a data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Se a data for válida, retorna em formato ISO
};

// Função que busca os logs filtrados
const buscar = async () => {
    const data = { // Prepara os dados para a requisição
        id_cliente: store.userIdCliente, // ID do cliente autenticado
        id_dm: relatorio.value.dm, // Filtro de DM
        id_usuario: relatorio.value.id_usuario, // Filtro de usuário
        id_funcionario: relatorio.value.id_funcionario, // Filtro de funcionário
        operacao: relatorio.value.id_operacao, // Filtro de operação
        data_inicio: toISODate(relatorio.value.data_inicio), // Data inicial (convertida para formato ISO)
        data_final: toISODate(relatorio.value.data_final) // Data final (convertida para formato ISO)
    };

    try {
        const response = await axios.post('/Log/relatorio', data, { // Realiza a requisição POST para buscar os logs
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autenticação no cabeçalho
            }
        });
        historico.value = response.data; // Armazena a resposta na variável historico
        filteredCount.value = historico.value.length; // Atualiza o contador de registros filtrados
    } catch (error) { // Caso ocorra um erro na requisição
        console.error('Erro ao buscar logs:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os logs.' }); // Exibe uma notificação de erro
    }
};

// Watch para monitorar o filtro global e recalcular a quantidade de registros filtrados
watch(
    () => filters.value.global.value, // Observa a mudança no valor do filtro global
    () => { // Quando o filtro global mudar
        filteredCount.value = historico.value.filter((item) => { // Filtra os dados do histórico
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro global em minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo contém o valor do filtro
        }).length; // Atualiza a quantidade de registros filtrados
    },
    { immediate: true } // Executa o watch imediatamente após a montagem
);

// Função que busca os DMs (Data Migrations) disponíveis
const fetchDM = async () => {
    const data = { id_cliente: store.userIdCliente }; // Prepara os dados para a requisição

    try {
        const response = await axios.post('/DM/listar', data, { // Realiza a requisição para listar os DMs
            headers: { Authorization: `Bearer ${store.token}` } // Envia o token de autenticação
        });
        dms.value = [ // Atualiza a lista de DMs com a resposta
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({ // Mapeia a resposta para o formato esperado
                label: Identificacao,
                value: ID_DM
            }))
        ];
    } catch (error) { // Caso ocorra um erro na requisição
        console.error('Erro ao carregar lista de dms:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a lista de DMs.' }); // Exibe uma notificação de erro
    }
};

// Função que busca os usuários disponíveis
const fetchUsuario = async () => {
    const data = { id_cliente: store.userIdCliente }; // Prepara os dados para a requisição

    try {
        const response = await axios.post('/usuarios/listar', data, { // Realiza a requisição para listar os usuários
            headers: { Authorization: `Bearer ${store.token}` } // Envia o token de autenticação
        });
        usuario.value = response.data.map(({ id_usuario, nome }) => ({ // Mapeia a resposta para o formato esperado
            label: nome,
            value: id_usuario
        }));
    } catch (error) { // Caso ocorra um erro na requisição
        console.error('Erro ao carregar lista de usuários:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a lista de usuários.' }); // Exibe uma notificação de erro
    }
};

// Função que busca os funcionários disponíveis
const fetchFuncionarios = async () => {
    const data = { id_cliente: store.userIdCliente }; // Prepara os dados para a requisição

    try {
        const response = await axios.post('/funcionarios/listar', data, { // Realiza a requisição para listar os funcionários
            headers: { Authorization: `Bearer ${store.token}` } // Envia o token de autenticação
        });
        ListaFuncionarios.value = response.data.map((funcionario) => ({ // Mapeia a resposta para o formato esperado
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }));
    } catch (error) { // Caso ocorra um erro na requisição
        console.error('Erro ao carregar funcionários:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a lista de funcionários.' }); // Exibe uma notificação de erro
    }
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Se o primeiro dropdown estiver visível, esconde
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Se o segundo dropdown estiver visível, esconde
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Se o terceiro dropdown estiver visível, esconde
};

// Função que é chamada quando o datepicker é aberto
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns quando o datepicker é aberto
};

// Função que é chamada quando o componente é montado
onMounted(() => {
    fetchDM(); // Carrega os DMs disponíveis
    fetchUsuario(); // Carrega os usuários disponíveis
    fetchFuncionarios(); // Carrega os funcionários disponíveis
});
</script>

<template>
    <div class="card vh p-fluid">
        <div class="form">
            <h5 class="my-6 ml-2 text-2xl">Log</h5>
            <div class="grid mt-3 mx-1 p-1">
                <!-- Campos para filtros -->
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">Usuário:</label>
                    <Dropdown class="drop" v-model="relatorio.id_usuario" :options="usuario" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="operacao">Operação:</label>
                    <Dropdown class="drop" v-model="relatorio.id_operacao" :options="operacao" optionLabel="label" optionValue="value" placeholder="Todos" />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">Data Inicial:</label>
                    <VueDatePicker
                        class="drop"
                        v-model="relatorio.data_inicio"
                        showIcon
                        :showOnFocus="false"
                        :format="format"
                        auto-apply
                        locale="pt-BR"
                        @open="handleDatepickerOpen"
                        :enable-time-picker="false"
                        teleport="body"
                        placeholder="Selecione uma data inicial"
                    />
                </div>
                <div class="field lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">Data Final:</label>
                    <VueDatePicker
                        class="drop"
                        v-model="relatorio.data_final"
                        showIcon
                        :showOnFocus="false"
                        :format="format"
                        auto-apply
                        locale="pt-BR"
                        @open="handleDatepickerOpen"
                        :enable-time-picker="false"
                        teleport="body"
                        placeholder="Selecione uma data final"
                    />
                </div>
                <div class="field lg:col-12 md:col-12 sm:col-12">
                    <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
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
            :globalFilterFields="['Dia', 'Operacao', 'ID_Usuario', 'Log_Web', 'Resultado']"
            dataKey="Operacao"
            tableStyle=""
            removableSort
            :sortOrder="1"
            :sortField="'Dia'"
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
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
            <Column field="Operacao" sortable style="max-width: 10%" header="Operação"></Column>
            <Column field="ID_Usuario" sortable style="max-width: 8%" header="Usuário"></Column>
            <Column field="Log_Web" sortable style="max-width: 500px" header="Resumo"></Column>
            <Column field="Resultado" sortable style="max-width: 10%" header="Resultado"></Column>
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
