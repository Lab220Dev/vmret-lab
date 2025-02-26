<script setup>
// Importação de funções e hooks do Vue.js
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import cdcService from '@/services/cdcService';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { resetCDCForm } from '@/helpers/formHelper';
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Definição de variáveis reativas e referências
const active = ref(0); // Estado para o índice da aba ativa
const toast = useToast(); // Hook para usar a funcionalidade de toast
const centroCusto = ref([]); // Lista dos centros de custo
const visible = ref(false); // Controle de visibilidade para o formulário de edição/adição
const spinner = ref(false); // Controle de visibilidade do spinner de carregamento
const deleteCentroDialog = ref(false); // Controle de visibilidade do diálogo de confirmação de exclusão
const Mob = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global, que verifica se o texto contém o valor
});
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Codigo', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
const filteredCount = ref(0); // Contador de itens filtrados

// Definição de um objeto reativo para armazenar dados do centro de custo
let cdc = reactive({
    Nome: '',
    Codigo: '',
    ID_CentroCusto: ''
});

/**
 * Função que lida com a seleção de uma linha na tabela.
 * Ao selecionar uma linha, atualiza os dados do centro de custo,
 * torna o formulário de edição visível e altera para a aba de edição.
 *
 * @param {Object} event - O evento de clique que contém os dados da linha selecionada.
 * @param {Object} event.data - Os dados da linha selecionada na tabela.
 */
const onRowSelect = async (event) => {
    cdc = event.data; // Atualiza os dados do centro de custo com os dados da linha selecionada
    visible.value = true; // Torna o formulário de edição visível
    active.value = 1; // Muda para a aba de edição
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    loadCentroCusto(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    loadCentroCusto(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    loadCentroCusto(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
/**
 * Função para carregar a lista de centros de custo.
 * Ela chama o serviço para listar os centros de custo, atualiza o contador de registros filtrados
 * e lida com possíveis erros durante a operação.
 *
 * @async
 * @returns {Promise<void>} Retorna uma Promise que não resolve nenhum valor, pois é uma operação assíncrona.
 * @throws {Error} Caso haja um erro na requisição, o erro será exibido no console e uma mensagem de erro será mostrada ao usuário.
 */
const loadCentroCusto = async (page = 1) => {
    const params = {
        first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
        rows: lazyParams.value.rows, // Número de registros por página
        sortField: lazyParams.value.sortField, // Campo para ordenação
        sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
        filters: lazyParams.value.filters // Filtros aplicados
    };
    const data = prepareListData(params);
    spinner.value = true; // Exibe o spinner de carregamento
    try {
        const result = await cdcService.listarCentrosDeCustoPaginada(data); // Chama o serviço para listar os centros de custo
        centroCusto.value = result.centrosCusto; // Atualiza a lista de centros de custo
        filteredCount.value = result.totalRecords; // Atualiza o contador de registros filtrados
    } catch (error) {
        console.error(error.message); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_cost_center_error') }); // Exibe mensagem de erro
    }finally{
        spinner.value = false; // Esconde o spinner de carregamento
    }
};

/**
 * Função para enviar o formulário de edição ou adição de um centro de custo.
 * Dependendo do estado do formulário (edição ou adição), ela chama a função apropriada
 * para atualizar ou adicionar um centro de custo no backend, e em seguida recarrega a lista de centros de custo.
 * Caso haja um erro, uma mensagem de erro é exibida ao usuário.
 *
 * @async
 * @returns {Promise<void>} Retorna uma Promise que não resolve nenhum valor, pois é uma operação assíncrona.
 * @throws {Error} Caso haja um erro durante o envio do formulário, o erro será mostrado ao usuário por meio de uma mensagem de erro.
 */
const submitForm = async () => {
    spinner.value = true; // Exibe o spinner de carregamento
    try {
        if (visible.value) {
            // Se o formulário estiver no modo de edição, chama a função de atualizar
            await cdcService.atualizarCentro(cdc); // Atualiza o centro de custo no backend
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: 'Centro atualizado!', life: 3000 }); // Exibe mensagem de sucesso
        } else {
            // Se o formulário estiver no modo de adicionar, chama a função de adicionar
            await cdcService.adicionarCentro(cdc); // Adiciona o centro de custo no backend
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: 'Centro adicionado!', life: 3000 }); // Exibe mensagem de sucesso
        }
        loadCentroCusto(); // Carrega novamente a lista de centros de custo
        resetCDCForm(cdc); // Reseta os campos do formulário
        active.value = 0; // Volta para a aba de listagem
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: error.message || t('cost_center_update_error_default'), life: 3000 }); // Exibe mensagem de erro caso falhe
    }finally{
        spinner.value = false; // Esconde o spinner de carregamento
    }	
};

/**
 * Função para deletar um centro de custo.
 * Ela chama o serviço para deletar o centro de custo, exibe uma mensagem de sucesso ou erro,
 * e recarrega a lista de centros de custo após a exclusão.
 * Caso a exclusão falhe, uma mensagem de erro é exibida ao usuário.
 *
 * @async
 * @returns {Promise<void>} Retorna uma Promise que não resolve nenhum valor, pois é uma operação assíncrona.
 * @throws {Error} Caso haja um erro durante a exclusão, o erro será mostrado ao usuário por meio de uma mensagem de erro.
 */
const deleteCentro = async () => {
    spinner.value = true; // Exibe o spinner de carregamento
    try {
        const response = await cdcService.deletarCentro(cdc); // Chama o serviço para deletar o centro de custo
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: response.data.message || t('cost_center_deleted_sucess'), life: 3000 }); // Exibe mensagem de sucesso
        deleteCentroDialog.value = false; // Fecha o diálogo de confirmação de exclusão
        loadCentroCusto(); // Carrega novamente a lista de centros de custo
        resetCDCForm(cdc); // Reseta os campos do formulário
        active.value = 0; // Volta para a aba de listagem
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('cost_center_delted_error'), life: 3000 }); // Exibe mensagem de erro caso falhe
    }finally{
        spinner.value = false; // Esconde o spinner de carregamento
    }
};

/**
 * Watcher que observa mudanças no índice da aba ativa e executa ações quando a aba ativa é alterada.
 * Se a aba ativa for a de listagem (índice 0), a função reseta o formulário e carrega novamente os dados dos centros de custo.
 *
 * @param {number} newIndex - O novo índice da aba ativa.
 * @param {number} oldIndex - O índice anterior da aba ativa.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        // Se a aba ativa for a de listagem (índice 0)
        resetCDCForm(cdc); // Reseta os campos do formulário
        loadCentroCusto(); // Carrega os dados novamente
        visible.value = false; // Esconde o formulário de edição/adicionar
    }
});

/**
 * Watcher que observa mudanças no filtro global e atualiza a contagem de centros de custo filtrados.
 * Quando o valor do filtro global mudar, ele filtra os centros de custo e atualiza o contador de registros filtrados.
 *
 * @param {string} filters.value.global.value - O valor do filtro global digitado pelo usuário.
 */
watch(
    () => filters.value.global.value, // Observa o valor do filtro global
    () => {
        filteredCount.value = centroCusto.value.filter((item) => {
            // Filtra os centros de custo de acordo com o valor digitado no filtro global
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro convertido para minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
            // Verifica se qualquer valor do centro de custo contém o texto filtrado
        }).length;
    },
    { immediate: true } // Executa imediatamente ao montar o componente
);
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
/**
 * Função que é chamada ao montar o componente.
 * Ela carrega os dados dos centros de custo chamando a função `loadCentroCusto`.
 */
onMounted(() => {
    loadCentroCusto(); // Carrega os dados ao montar o componente
    Mob.value = isMobEnabled();
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <!-- Componente TabView para controlar abas de listagem e edição -->

            <!-- Aba de Listagem de Centros de Custo -->
            <TabPanel :header="$t('list_cost_center')">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="centroCusto"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        stripedRows
                        removableSort
                        paginator
                        lazy
                        :totalRecords="filteredCount"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="lazyParams.value?.rows || 10"
                        dataKey="id"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        :sortField="lazyParams.value?.sortField || 'Codigo'"
                        @filter="onFilterChange($event)"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                        :globalFilterFields="['Codigo', 'Nome']"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                    >
                        <!-- A tabela exibe os dados provenientes de "centroCusto" -->
                        <!-- Permite selecionar apenas uma linha por vez -->
                        <!-- Aplica um estilo alternado nas linhas para facilitar a leitura -->
                        <!-- Aplica a ordenação removível, permitindo ao usuário reverter a ordenação clicando novamente na coluna -->
                        <!-- Habilita a paginação para exibir os dados em várias páginas -->
                        <!-- Oferece as opções de quantidade de itens por página: 5, 10, 20, 50 -->
                        <!-- Exibe 10 itens por página por padrão -->
                        <!-- A chave única para identificar cada linha é o campo "id" -->
                        <!-- Ordena os dados inicialmente pelo campo "Codigo" -->
                        <!-- Aplica o filtro global aos campos "Codigo" e "Nome" -->
                        <!-- Desabilita a seleção de múltiplas linhas usando a tecla "meta" -->
                        <!-- Quando uma linha é selecionada, emite o evento 'rowSelect', chamando a função 'handleRowSelection' -->
                        <template #header>
                            <!-- Cabeçalho da tabela -->
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>{{ $t('total_records',{count: filteredCount})}}</span>
                                </div>
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')"  type="search" @input="debouncedFilterChange" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> {{ t('empty_cost_center') }} </template>
                        <!-- Mensagem exibida quando a tabela está vazia -->
                        <Column field="Codigo" sortable :header="t('code')"></Column>
                        <Column field="Nome" sortable :header="t('cost_center_name')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- Aba de Edição ou Adição de Centro de Custo -->
            <TabPanel :header="visible ? t('edit_cost_center') : t('add_cost_center')" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <!-- Formulário para adicionar ou editar um centro de custo -->

                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_centro_custo">{{ t('code') }}:</label>
                                        <InputNumber class="my-2" id="id_centro_custo" v-model="cdc.Codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ t('cost_center_name') }}:</label>
                                        <InputText class="my-2" id="nome" v-model="cdc.Nome" required />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- Botões de Ação -->
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="submitForm" :disabled="Mob" />
                                    <Button
                                        v-if="visible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteCentroDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="submitForm" :disabled="Mob" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>

                        <Dialog :header="$t('delete_cost_center')" v-model:visible="deleteCentroDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class=""> {{ t('delete_cost_center_confirm', { codigo: cdc.Codigo, nome: cdc.Nome }) }}</span>
                            </div>

                            <template #footer>
                                <Button :label="$t('no')" icon="pi pi-times" @click="deleteCentroDialog = false" class="p-button-text" />
                                <Button :label="$t('yes')" icon="pi pi-check" @click="deleteCentro" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="spinner" />
    </div>
</template>
<style>
@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
