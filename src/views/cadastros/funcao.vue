<script setup>
import { reactive, ref, onMounted, watch } from 'vue'; // Importa os hooks necessários do Vue para estado reativo e controle de ciclo de vida
import { useToast } from 'primevue/usetoast'; // Hook para exibir mensagens de toast (notificações)
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de carregamento (spinner)
import { FilterMatchMode } from 'primevue/api'; // Importa filtros do PrimeVue para usar na tabela
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados (provavelmente para carregar dados externos)
import funcaoService from '@/services/funcaoService'; // Importa os serviços para manipulação das funções
import { resetFuncaoForm } from '@/helpers/formHelper'; // Importa a função para resetar o formulário
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const dataStore = useDataStore(); // Cria uma instância do store de dados
const Mob = ref(false);
// Variáveis reativas
const active = ref(0); // Armazena o índice da aba ativa (para alternar entre 'Listar' e 'Adicionar/Editar')
const toast = useToast(); // Instância do toast para exibir mensagens de sucesso e erro
const ListaFuncao = ref([]); // Armazena a lista de funções
const visible = ref(false); // Controla a visibilidade do formulário de edição/adicionar
const todosOption = { label: 'Todos', value: null }; // Opção de filtro 'Todos' para o campo de Centro de Custo
const centroCusto = ref([todosOption]); // Armazena a lista de centros de custo, com a opção 'Todos'
const loading = ref(false); // Controla o estado de carregamento (para exibir ou não o spinner)
const deleteFuncaoDialog = ref(false); // Controla a visibilidade do diálogo de confirmação para exclusão de função

// Filtros para a DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que verifica se o valor contém o texto pesquisado
});
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Codigo', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
// Contador de resultados filtrados
const filteredCount = ref(0);

// Função para resetar os dados do formulário de função
let funcao = reactive(resetFuncaoForm()); // Inicializa os dados do formulário com a função de reset

/**
 * Função chamada ao selecionar uma linha na DataTable
 * Atualiza os dados do formulário com os dados da linha selecionada
 * Exibe o formulário de edição
 * @param {Object} event - Evento disparado ao selecionar uma linha
 */
const onRowSelect = (event) => {
    funcao = event.data; // Atualiza os dados do formulário com os dados da linha selecionada
    visible.value = true; // Exibe o formulário de edição
    active.value = 1; // Muda a aba para a de edição
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadFuncoes(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadFuncoes(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadFuncoes(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
/**
 * Função para enviar o formulário, seja para adicionar ou editar uma função
 * Exibe uma notificação de sucesso ou erro dependendo do resultado
 */
const submitForm = async () => {
    try {
        loading.value = true; // Ativa o estado de carregamento
        if (visible.value) {
            // Se o formulário está no modo de edição, atualiza a função
            await funcaoService.atualizarFuncao(funcao);
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('function_update_sucess'), life: 3000 });
        } else {
            // Se o formulário está no modo de adição, adiciona a função
            await funcaoService.adicionarFuncao(funcao);
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('function_add_sucess'), life: 3000 });
        }
        loadFuncoes(); // Recarrega a lista de funções após a operação
        active.value = 0; // Volta para a aba de listagem
        funcao = reactive(resetFuncaoForm()); // Reseta os dados do formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('function_default_fail'), life: 3000 }); // Mensagem de erro se a operação falhar
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função para carregar a lista de funções
 */
const loadFuncoes = async (page = 1) => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };
        const data = prepareListData(params);
        // ListaFuncao.value = await funcaoService.listarFuncoes(); // Carrega as funções através do serviço
        const result = await funcaoService.listarFuncoesPaginadas(data); // Carrega as funções através do serviço
        ListaFuncao.value = result.funcoes;
        filteredCount.value = result.totalRecords; // Atualiza o contador de resultados filtrados
    } catch (error) {
        console.error(error.message); // Registra o erro no console
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

// Observa mudanças no filtro global e recalcula a quantidade de resultados filtrados
watch(
    () => filters.value.global.value, // Observa o valor do filtro global
    () => {
        filteredCount.value = ListaFuncao.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Converte o valor do filtro para minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
            // Verifica se algum valor da função contém o texto do filtro
        }).length; // Atualiza a quantidade de itens filtrados
    },
    { immediate: true } // Executa imediatamente ao montar o componente
);

/**
 * Função para excluir uma função
 * Exibe uma mensagem de sucesso ou erro após a operação
 */
const deleteFuncao = async () => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        await funcaoService.deletarFuncao(funcao.id_funcao); // Chama o serviço para excluir a função
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('function_delete_sucess'), life: 3000 }); // Mensagem de sucesso
        loadFuncoes(); // Recarrega a lista de funções
        deleteFuncaoDialog.value = false; // Fecha o diálogo de confirmação de exclusão
        funcao = reactive(resetFuncaoForm()); // Reseta os dados do formulário
        active.value = 0; // Volta para a aba de listagem
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('function_delete_fail'), life: 3000 }); // Mensagem de erro se a exclusão falhar
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função para resetar as informações e botões ao alternar de abas
 * Recarrega a lista de funções e reseta o formulário
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        funcao = reactive(resetFuncaoForm()); // Reseta os dados do formulário
        loadFuncoes(); // Recarrega a lista de funções
        visible.value = false; // Esconde o formulário de edição/adicionar
    }
});

/**
 * Função para carregar os dados do centro de custo
 * Carrega os dados do centro de custo no store ou através de uma chamada ao serviço
 */
const loadData = async () => {
    try {
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega os centros de custo do store ou faz a chamada ao serviço
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
        console.error('Erro ao carregar dados iniciais:', error); // Registra o erro no console
    }
};
function debounce(func, wait = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
const debouncedFilterChange = debounce(() => {
    onFilterChange();
}, 300);
// Chama a função de carregamento de dados ao montar o componente
onMounted(() => {
    Mob.value = isMobEnabled();
    loadFuncoes(); // Carrega a lista de funções
    loadData(); // Carrega os dados dos centros de custo
});
</script>

<template>
    <div class="card vh">
        <!-- Componente TabView para alternar entre as abas de listagem e edição/adicionar -->
        <TabView v-model:activeIndex="active">
            <TabPanel :header="$t('list_functions')">
                <div class="col-12">
                    <!-- Componente DataTable para exibição das funções -->
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaFuncao"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        stripedRows
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        lazy
                        :totalRecords="filteredCount"
                        :rows="lazyParams.value?.rows || 10"
                        dataKey="id"
                        :globalFilterFields="['id_funcao', 'nome', 'id_centro_custo']"
                        :metaKeySelection="false"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        :sortField="lazyParams.value?.sortField || 'id_funcao'"
                        @rowSelect="onRowSelect"
                        @filter="onFilterChange($event)"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                    >
                        <!-- A tabela exibe os dados provenientes de "ListaFuncao" -->
                        <!-- Permite selecionar apenas uma linha por vez -->
                        <!-- Aplica um estilo alternado nas linhas para melhorar a legibilidade -->
                        <!-- Habilita a funcionalidade de paginação -->
                        <!-- Permite a ordenação removível, ou seja, a ordenação pode ser removida clicando novamente na coluna de ordenação -->
                        <!-- Oferece as opções de quantidade de itens por página: 5, 10, 20, 50 -->
                        <!-- Exibe 10 itens por página por padrão -->
                        <!-- Define a chave única para cada linha como o campo "id" -->
                        <!-- Aplica o filtro global aos campos "id_funcao", "nome" e "id_centro_custo" -->
                        <!-- Ordena inicialmente pela coluna "id_funcao" em ordem crescente -->
                        <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" -->
                        <!-- Emite o evento 'rowSelect' e chama a função 'onRowSelect' ao selecionar uma linha -->

                        <template #header>
                            <!-- Cabeçalho da tabela com filtro global e contador de registros -->
                            <div class="flex justify-content-between align-items-center mt-4">
                                <span>{{ $t('total_records',{count: filteredCount})}}</span>

                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search" @input="debouncedFilterChange" />
                                </IconField>
                            </div>
                        </template>

                        <template #empty> {{ t('function_empty') }} </template>
                        <Column field="id_funcao" sortable :header="t('code')"></Column>
                        <Column field="nome" sortable :header="t('function_name')"></Column>
                        <Column field="id_centro_custo" sortable :header="t('cost_center_name')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- Aba para adicionar ou editar função -->
            <TabPanel :header="visible ? t('edit_function') : t('add_function')" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <!-- Campo para código da função -->
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_funcao">{{ $t('function_code') }}:</label>
                                        <InputText class="my-2" id="id_funcao" v-model="funcao.codigo" required />
                                    </div>
                                    <!-- Campo para nome da função -->
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ $t('function_name') }}:</label>
                                        <InputText class="my-2" id="nome" v-model="funcao.nome" required />
                                    </div>
                                    <!-- Campo para selecionar o centro de custo -->
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="perfil">{{ $t('cost_center') }}:</label>
                                        <Dropdown class="my-2" filter v-model="funcao.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown3" />
                                    </div>
                                </div>

                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- Botões de ação para salvar ou excluir função -->
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="submitForm" :disabled="Mob" />
                                    <Button
                                        v-if="visible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteFuncaoDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="submitForm" :disabled="Mob" />
                                </div>
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>
                        <Dialog header="Deletar Função" v-model:visible="deleteFuncaoDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    {{ t('function_dialog_confirm', { id: funcao.id_funcao, nome: funcao.nome }) }}
                                </span>
                            </div>

                            <template #footer>
                                <Button :label="$t('no')" icon="pi pi-times" @click="deleteFuncaoDialog = false" class="p-button-text" />
                                <Button :label="$t('yes')" icon="pi pi-check" @click="deleteFuncao" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <!-- Componente de loading (spinner) -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>
