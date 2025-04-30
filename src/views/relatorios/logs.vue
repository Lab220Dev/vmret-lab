<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importação do componente VueDatePicker para seleção de datas
import { FilterMatchMode } from '@primevue/core/api'; // Importação do FilterMatchMode para configurar filtros na DataTable
import { useToast } from 'primevue/usetoast'; // Importação do hook useToast para exibir mensagens de notificação
import '@vuepic/vue-datepicker/dist/main.css'; // Importação do CSS do VueDatePicker
import { ref, onMounted, watch, computed } from 'vue'; // Importação dos hooks do Vue: ref, onMounted e watch
import { useAuthStore } from '@/store/authStore.js'; // Importação do store para gerenciar o estado de autenticação
import relatorioService from '@/Services/relatorioService'; // Serviço para buscar logs web
import dmService from '@/services/DmService'; // Serviço para manipulação de dados DE dm
import usuarioService from '@/services/usuarioService';

import funcionarioService from '@/Services/funcionarioService.js';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

const filteredCount = ref(0); // Contador reativo para o número de registros filtrados

const store = useAuthStore(); // Acesso ao store de autenticação
const toast = useToast(); // Acesso ao toast para mostrar mensagens de notificação
const select1 = ref(null); // Referência para o primeiro select(não utilizado no template atual)
const select2 = ref(null); // Referência para o segundo select(não utilizado no template atual)
const select3 = ref(null); // Referência para o terceiro select(usado para o filtro de usuários)
const todosOption = { label: 'Todos', value: null }; // Opção "Todos" para selects de seleção
const historico = ref([]); // Lista reativa que armazenará os dados do histórico de logs
const dms = ref([todosOption]); // Lista reativa que armazenará os DMs (Data Migrations) disponíveis
const operacao = computed(() => [
    // Lista de opções para filtro de operações
    { label: t('all'), value: null },
    { label: t('insert'), value: 'INSERT' },
    { label: t('update'), value: 'UPDATE' },
    { label: t('delete'), value: 'DELETE' }
]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para a DataTable (por padrão, filtra por "CONTÉM")
});

const emptyMessage = computed(() => t('no_search_made')); // Mensagem a ser exibida se não houver dados filtrados

const ListaFuncionarios = ref([todosOption]); // Lista reativa que armazenará os funcionários disponíveis
const usuario = ref([]); // Lista reativa que armazenará os usuários disponíveis
const relatorio = ref({
    // Objeto reativo que mantém os filtros do relatório
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
    try {
        historico.value = await relatorioService.logs(relatorio);
        filteredCount.value = historico.value.length; // Atualiza o contador de registros filtrados
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao buscar logs:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os logs.', life: 3000 }); // Exibe uma notificação de erro
    }
};

// Watch para monitorar o filtro global e recalcular a quantidade de registros filtrados
watch(
    () => filters.value.global.value, // Observa a mudança no valor do filtro global
    () => {
        // Quando o filtro global mudar
        filteredCount.value = historico.value.filter((item) => {
            // Filtra os dados do histórico
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
        const response = await dmService.listarDMs(data);
        dms.value = [
            // Atualiza a lista de DMs com a resposta
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                // Mapeia a resposta para o formato esperado
                label: Identificacao,
                value: ID_DM
            }))
        ];
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao carregar lista de dms:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_dm_list'), life: 3000 }); // Exibe uma notificação de erro
    }
};

// Função que busca os usuários disponíveis
const fetchUsuario = async () => {
    const data = { id_cliente: store.userIdCliente }; // Prepara os dados para a requisição

    try {
        const response = await usuarioService.listarUsuarios(data);
        usuario.value = response.data.map(({ id_usuario, nome }) => ({
            // Mapeia a resposta para o formato esperado
            label: nome,
            value: id_usuario
        }));
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao carregar lista de usuários:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_user_list'), life: 3000 }); // Exibe uma notificação de erro
    }
};

// Função que busca os funcionários disponíveis
const fetchFuncionarios = async () => {
    const data = { id_cliente: store.userIdCliente }; // Prepara os dados para a requisição

    try {
        const response = await funcionarioService.listarFuncionarios(data);
        ListaFuncionarios.value = response.data.map((funcionario) => ({
            // Mapeia a resposta para o formato esperado
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }));
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao carregar funcionários:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_employee_list'), life: 3000 }); // Exibe uma notificação de erro
    }
};

// Função para fechar todos os selects
const closeAllselects = () => {
    if (select1.value?.overlayVisible) select1.value.hide(); // Se o primeiro selectestiver visível, esconde
    if (select2.value?.overlayVisible) select2.value.hide(); // Se o segundo selectestiver visível, esconde
    if (select3.value?.overlayVisible) select3.value.hide(); // Se o terceiro selectestiver visível, esconde
};

// Função que é chamada quando o datepicker é aberto
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os selects quando o datepicker é aberto
};

// Função que é chamada quando o componente é montado
onMounted(() => {
    fetchDM(); // Carrega os DMs disponíveis
    fetchUsuario(); // Carrega os usuários disponíveis
    fetchFuncionarios(); // Carrega os funcionários disponíveis
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mb-0 pt-5 mr-1">
                <!-- Campos para filtros -->
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">{{ t('user') }}:</label>
                    <Select filter class="drop" v-model="relatorio.id_usuario" :options="usuario" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select3" />
                </div>
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="operacao">{{ t('operation') }}:</label>
                    <Select filter class="drop" v-model="relatorio.id_operacao" :options="operacao" optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">{{ t('initial_date') }}:</label>
                    <VueDatePicker
                        class="drop"
                        v-model="relatorio.data_inicio"
                        showIcon
                        :showOnFocus="false"
                        :format="format"
                        auto-apply
                        :locale="locale"
                        @open="handleDatepickerOpen"
                        :enable-time-picker="false"
                        teleport="body"
                        :placeholder="$t('initial_date_placeholder')"
                    />
                </div>
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">{{ t('end_date') }}:</label>
                    <VueDatePicker
                        class="drop"
                        v-model="relatorio.data_final"
                        showIcon
                        :showOnFocus="false"
                        :format="format"
                        auto-apply
                        :locale="locale"
                        @open="handleDatepickerOpen"
                        :enable-time-picker="false"
                        teleport="body"
                        :placeholder="$t('end_date_placeholder')"
                    />
                </div>
            </div>
            <div class="p-0 m-0 lg:col-12 md:col-6 sm:col-12">
                <Button class="w-full mt-4" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
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
            dataKey="ID"
            tableStyle=""
            removableSort
            :sortOrder="1"
            :sortField="'Dia'"
            class="mt-4"
        >
            <!--
    A tabela exibe os dados provenientes de 'historico', que contêm informações relacionadas aos registros históricos de abastecimento.

    - **v-model:filters="filters"**: Vincula a variável `filters` ao estado de filtros globais da tabela. Essa variável pode ser utilizada para filtrar os dados da tabela em tempo real. O Vue.js vai atualizar os dados da tabela automaticamente quando os filtros forem aplicados.
    - **:value="historico"**: A variável `historico` contém os dados que serão exibidos na tabela. Cada item de `historico` será mostrado como uma linha na tabela.
    
    - **stripedRows**: Aplica um estilo alternado nas linhas da tabela, ou seja, as linhas ímpares terão um fundo diferente das linhas pares, melhorando a legibilidade e facilitando a visualização dos dados.
    
    - **showGridlines**: Exibe as linhas de grade (ou seja, as divisões entre as células da tabela). Isso ajuda a melhorar a estrutura visual da tabela, tornando a leitura mais fácil e organizada.
    
    - **paginator**: Habilita a funcionalidade de paginação na tabela, permitindo que os dados sejam divididos em várias páginas. O usuário poderá navegar entre essas páginas para visualizar todos os dados.
    
    - **:rows="10"**: Define o número de linhas a serem exibidas por página na tabela. Aqui, são exibidas 10 linhas por página.
    
    - **:rowsPerPageOptions="[5, 10, 20, 50]"**: Define as opções de quantidade de linhas por página que o usuário pode escolher. As opções disponíveis são 5, 10, 20 ou 50 linhas por página.
    
    - **rowHover**: Aplica um estilo especial nas linhas quando o usuário passa o mouse sobre elas. Isso facilita a interação, destacando a linha sobre a qual o mouse está.
    
    - **:globalFilterFields="['Dia', 'Operacao', 'ID_Usuario', 'Log_Web', 'Resultado']"**: Define quais campos podem ser usados para a busca global na tabela. Isso significa que, ao digitar no campo de busca, a tabela será filtrada com base em qualquer um desses campos (Dia, Operacao, ID_Usuario, Log_Web e Resultado).
    
    - **dataKey="Operacao"**: Especifica a chave de identificação única para cada linha da tabela, que neste caso é o campo `Operacao`. Isso permite ao componente identificar e manipular individualmente as linhas, especialmente útil quando se lida com seleção de linhas ou manipulação de dados.
    
    - **tableStyle=""**: Aqui, o estilo da tabela não está sendo especificado. Caso desejado, poderia ser adicionado um objeto de estilo CSS para personalizar a aparência da tabela, por exemplo, ajustando o tamanho ou a largura das colunas.
    
    - **removableSort**: Permite ao usuário remover a ordenação das colunas. Isso significa que, após ordenar por uma coluna, o usuário pode clicar novamente na seta de ordenação para remover a ordenação.
    
    - **:sortOrder="1"**: Define a direção da ordenação da tabela. O valor `1` indica ordenação crescente, ou seja, os dados serão exibidos do menor para o maior.
    
    - **:sortField="'Dia'"**: Define o campo pelo qual os dados serão inicialmente ordenados. Aqui, a tabela será ordenada pela coluna `Dia` em ordem crescente ao ser carregada pela primeira vez.
-->

            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{ $t('total_records', { count: filteredCount }) }}</span>
                    </div>
                    <div>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" autocomplete="off"/>
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty> {{ emptyMessage }} </template>

            <Column field="Dia" sortable :header="t('date')"> </Column>
            <Column field="Operacao" sortable style="max-width: 10%" :header="t('operation')"></Column>
            <Column field="ID_Usuario" sortable style="max-width: 8%" :header="t('user')"></Column>
            <Column field="Log_Web" sortable style="max-width: 500px" :header="t('summary')"></Column>
            <Column field="Resultado" sortable style="max-width: 10%" :header="t('result')"></Column>
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
