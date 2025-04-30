<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importação do componente VueDatePicker para seleção de datas
import { FilterMatchMode } from '@primevue/core/api'; // Importação do FilterMatchMode para configurar filtros na DataTable
import { useToast } from 'primevue/usetoast'; // Importação do hook useToast para exibir mensagens de notificação
import '@vuepic/vue-datepicker/dist/main.css'; // Importação do CSS do VueDatePicker
import { ref, onMounted, watch , computed} from 'vue'; // Importação dos hooks do Vue: ref, onMounted e watch
import { useAuthStore } from '@/store/authStore.js'; // Importação do store para gerenciar o estado de autenticação
import laService from '@/Services/laService.js'; // Serviço para buscar logs web
import {formatDateToString} from '@/helpers/HelperUtils.js'
import funcionarioService from '@/Services/funcionarioService.js';
import { useI18n } from 'vue-i18n';
const { t,locale } = useI18n();

const filteredCount = ref(0); // Contador reativo para o número de registros filtrados

const store = useAuthStore(); // Acesso ao store de autenticação
const toast = useToast(); // Acesso ao toast para mostrar mensagens de notificação
const select1 = ref(null); // Referência para o primeiro select(não utilizado no template atual)
const select2 = ref(null); // Referência para o segundo select(não utilizado no template atual)
const select3 = ref(null); // Referência para o terceiro select(usado para o filtro de usuários)
const todosOption = { label: 'Todos', value: null }; // Opção "Todos" para selects de seleção
const dados = ref([]); // Lista reativa que armazenará os dados do histórico de logs
const codigo = ref([]); // Lista reativa que armazenará os códigos disponíveis
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para a DataTable (por padrão, filtra por "CONTÉM")
});

const emptyMessage = computed(() => t('no_search_made')); // Mensagem a ser exibida se não houver dados filtrados

const ListaFuncionarios = ref([todosOption]); // Lista reativa que armazenará os funcionários disponíveis
const relatorio = ref({
        id_funcionario: null,
        prazo: new Date(),
        codigo: null,
});

// Função que busca os logs filtrados
const buscar = async () => {
        try {
        dados.value = await laService.listar(relatorio.value); 
        filteredCount.value = dados.value.length; 
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
        filteredCount.value = dados.value.filter((item) => {
            // Filtra os dados do histórico
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro global em minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo contém o valor do filtro
        }).length; // Atualiza a quantidade de registros filtrados
    },
    { immediate: true } // Executa o watch imediatamente após a montagem
);

// Função que busca os DMs (Data Migrations) disponíveis
const fetchCodigo = async () => {
    try {
        const response = await laService.listarCodigo(); 
        codigo.value = response.data.map((codigo) => ({
            // Mapeia a resposta para o formato esperado
            label: codigo.Codigo_Retirada,
            value: codigo.Codigo_Retirada
        }));
    } catch (error) {
        // Caso ocorra um erro na requisição
        console.error('Erro ao carregar lista de dms:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('title_error'), life: 3000 }); // Exibe uma notificação de erro
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
        toast.add({ severity: 'error', summary:t('title_error'), detail: t('load_employee_list'), life: 3000 }); // Exibe uma notificação de erro
    }
};

// Função para fechar todos os select s
const closeAllselects = () => {
    if (select1.value?.overlayVisible) select1.value.hide(); // Se o primeiro selectestiver visível, esconde
    if (select2.value?.overlayVisible) select2.value.hide(); // Se o segundo selectestiver visível, esconde
    if (select3.value?.overlayVisible) select3.value.hide(); // Se o terceiro selectestiver visível, esconde
};

// Função que é chamada quando o datepicker é aberto
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os select s quando o datepicker é aberto
};

// Função que é chamada quando o componente é montado
onMounted(() => {
    fetchCodigo(); // Carrega os DMs disponíveis
    fetchFuncionarios(); // Carrega os funcionários disponíveis
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mb-0 pt-5">
                <!-- Campos para filtros -->
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="usuario">{{t('employee')}}:</label>
                    <Select class="w-full" filter v-model="relatorio.id_funcionario" :options="ListaFuncionarios"
                     optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select 3" />
                </div>
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="operacao">{{t('code')}}:</label>
                    <Select class="w-full" filter v-model="relatorio.id_operacao" :options="codigo" 
                    optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>
                <div class="py-0 my-0 lg:col-3 md:col-6 sm:col-6">
                    <label for="perfil">{{t('withdrawal_deadline')}}:</label>
                    <VueDatePicker
                    class="w-full"
                        v-model="relatorio.data_inicio"
                        showIcon
                        :showOnFocus="false"
                        :format="formatDateToString"
                        auto-apply
                        :locale="locale"
                        @open="handleDatepickerOpen"
                        :enable-time-picker="false"
                        teleport="body"
                        :placeholder="$t('initial_date_placeholder')"
                    />
                </div>
                <div class=" pt-4 m-0 lg:col-3 md:col-12 sm:col-12">
                    <Button type="button"label="Procurar" class="w-full" icon="pi pi-search" severity="info" @click="buscar" />
                </div>
            </div>
            
        </div>

        <!-- Tabela para exibição dos logs -->
        <DataTable
            v-model:filters="filters"
            :value="dados"
            stripedRows
            showGridlines
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            rowHover
            tableStyle=""
            removableSort
            :sortOrder="1"
            :sortField="'prazo'"
            class="mt-4"
        >
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{$t('total_records',{count: filteredCount})}}</span>
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
            <Column field="Nome_Produto" sortable style="max-width: 10%" :header="t('product')"></Column>
            <Column field="nome" sortable style="max-width: 8%" :header="t('employee')"></Column>
            <Column field="matricula" sortable style="max-width: 500px" :header="t('employee_id')"></Column>
            <Column field="quantidade" sortable style="max-width: 10%" :header="t('quantity')"></Column>
            <Column field="Produto_Codigo" sortable style="max-width: 10%" :header="t('code')"></Column>
        </DataTable>
    </div>
</template>

<style>

</style>
