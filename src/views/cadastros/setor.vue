<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useDataStore } from '@/store/dataStore.js';
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js';
import setorService from '@/Services/SetorService.js';
import { useI18n } from 'vue-i18n';
import { resetSetorForm, resetProdutoSelecionadoSetor } from '@/helpers/formHelper.js';
const { t } = useI18n();
const Mob = ref(false);
const active = ref('0'); // Variável reativa para controlar a aba ativa.
const dataStore = useDataStore();
const toast = useToast();
const ListaSetor = ref([]);
const ListaItensSetor = computed(() => dataStore.produtosOptions);
const ItensSetor = ref([]);
const ListaItensDisponiveis = ref([]); // Declare ListaItensDisponiveis as a reactive reference
const itemDialog = ref(false);
const deleteSetorDialog = ref(false);
const deleteProductDialog = ref(false);
const visible = ref(false);
const editVisible = ref(false);
const item = ref({});
const centroCusto = computed(() => dataStore.cdcsOptions);
const loading = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Define o filtro global com o modo de correspondência CONTAINS
});

const filteredCount = ref(0); // Cria uma referência reativa para armazenar a contagem de registros filtrados

const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Codigo', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});

let setor = reactive({
    // Cria um objeto reativo para armazenar os dados do setor
    codigo: '', // Código do setor
    nome: '', // Nome do setor
    id_centro_custo: '' // ID do centro de custo associado ao setor
});

const produtoSelecionado = ref({
    // Cria uma referência reativa para armazenar o produto selecionado
    id_produto: '', // ID do produto selecionado
    quantidade: '' // Quantidade do produto selecionado
});
const onRowSelect = async (event) => {
    // Declara uma função assíncrona chamada onRowSelect
    Object.assign(setor, event.data); // Atribui os dados do evento ao objeto reativo setor

    editVisible.value = true; // Define a visibilidade de edição como true
    active.value = '1'; // Define o índice ativo como 1
    fetchListaItemSetor(); // Chama a função para buscar a lista de itens do setor
};

const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadSetor(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadSetor(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadSetor(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
const onRowSelectItem = (event) => {
    // Atribuir o item selecionado ao `item`
    item.value = { ...event.data }; // Cria uma cópia do item selecionado
    itemDialog.value = true; // Abre o dialog de edição
};

const submitForm = () => {
    // Declara uma função chamada submitForm
    if (editVisible.value) {
        // Verifica se a visibilidade de edição é true
        atualizarSetor(); // Chama a função para atualizar o setor
    } else {
        adicionarSetor(); // Chama a função para adicionar um novo setor
    }
};

const loadSetor = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };
        const data = prepareListData(params);
        // const response = await setorService.listarSetores();
        const response = await setorService.listarSetoresPaginado(data);
        ListaSetor.value = response.data.setores;
        filteredCount.value = response.data.totalRecords;
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('list_sector_error'), life: 3000 });
        console.error('Erro ao listar Setores:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const adicionarSetor = async () => {
    // Declara uma função assíncrona chamada adicionarSetor
    loading.value = true; // Ativa o estado de loading
    try {
        await setorService.adicionarSetor(setor); // Faz uma requisição para adicionar o setor
        dataStore.invalidateSetorCache(); // Invalida o cache de setores no dataStore
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_added_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        loadSetor(); // Recarrega a lista de setores
        active.value = '0'; // Define o valor de active como 0
        resetForm(); // Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: t('sector_added_fail'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        console.error('Erro ao adicionar Setores:', error); // Exibe o erro no console
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

watch(
    () => filters.value.global.value, // Observa mudanças no valor global do filtro
    () => {
        filteredCount.value = ListaSetor.value.filter((item) => {
            // Filtra a lista de setores com base no valor do filtro global
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro global em minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor do item inclui o valor do filtro
        }).length; // Atualiza a contagem de registros filtrados
    },
    { immediate: true } // Executa imediatamente ao montar o componente
);

const deleteSetor = async () => {
    // Declara uma função assíncrona chamada deleteSetor
    loading.value = true; // Ativa o estado de loading
    try {
        await setorService.deletarSetor(setor); // Faz uma requisição para deletar o setor
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_deleted_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        dataStore.invalidateSetorCache(); // Invalida o cache de setores no dataStore
        deleteSetorDialog.value = false; // Fecha o diálogo de confirmação de exclusão de setor
        loadSetor(); // Recarrega a lista de setores
        active.value = '0'; // Define o valor de active como 0
        resetForm(); // Reseta o formulário
    } catch {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('sector_deleted_fail'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
    }

    active.value = '0'; // Define o valor de active como 0
};

const atualizarSetor = async () => {
    // Declara uma função assíncrona chamada atualizarSetor
    loading.value = true; // Ativa o estado de loading
    try {
        await setorService.atualizarSetor(setor); // Faz uma requisição para atualizar o setor
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_update_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        dataStore.invalidateSetorCache(); // Invalida o cache de setores no dataStore
        loadSetor(); // Recarrega a lista de setores
        active.value = '0'; // Define o valor de active como 0
        resetForm(); // Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('sector_update_fail'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
        console.error('Erro ao atualizar Setores:', error); // Exibe o erro no console
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};
const fetchListaItemSetor = async () => {
    // Declara uma função assíncrona chamada fetchListaItemSetor
    loading.value = true; // Define o valor de 'loading' como true, indicando que uma operação está em andamento (geralmente usado para mostrar um indicador de carregamento)

    try {
        // Inicia o bloco try para tentar executar o código dentro dele, tratando erros caso ocorram
        const response = await setorService.listarItensDisponiveis(setor); // Faz uma requisição assíncrona para listar os itens disponíveis, utilizando o serviço 'setorService' e o objeto 'setor'
        ItensSetor.value = response.data; // Quando a requisição é bem-sucedida, o valor dos itens do setor (response.data) é atribuído à variável 'ItensSetor'
        listarItensDisponiveis();
    } catch (error) {
        // Se houver algum erro durante a execução do código no bloco try
        console.error('Erro ao listar itens:', error); // Exibe uma mensagem de erro no console com a descrição do erro
    } finally {
        // O bloco finally é sempre executado, independentemente de ocorrer erro ou não
        loading.value = false; // Define o valor de 'loading' como false, indicando que a operação foi concluída e o carregamento deve ser desativado
    }
};

watch(active, (newIndex, oldIndex) => {
    // Usa o método 'watch' para observar as mudanças na variável 'active', com a função de callback recebendo 'newIndex' (novo valor) e 'oldIndex' (valor anterior)
    if (newIndex !== oldIndex && newIndex === '0') {
        // Verifica se o novo índice (newIndex) é diferente do índice antigo (oldIndex) e se o novo índice é igual a 0
        resetForm(); // Chama a função 'resetForm' para redefinir ou limpar o formulário, provavelmente reiniciando seus valores
        visible.value = false; // Define a variável 'visible' como false, provavelmente escondendo um componente ou elemento na interface
        editVisible.value = false; // Define a variável 'editVisible' como false, provavelmente desabilitando uma área de edição na interface
    }
});

const resetForm = () => {
    // Declara uma função chamada 'resetForm'
    resetSetorForm(setor); // Chama a função 'resetSetorForm' passando a variável 'setor' como argumento. Presumivelmente, essa função redefine o formulário relacionado ao setor.
};

const loadData = async () => {
    // Declara uma função assíncrona chamada 'loadData' para carregar dados
    try {
        if (!dataStore.cdcs) await dataStore.fetchCdc();
        if (!dataStore.produtos) await dataStore.fetchProdutos();
        // centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc());
        // ListaItensSetor.value = dataStore.produtos || (await dataStore.fetchProdutos());
    } catch (error) {
        // Caso ocorra algum erro na execução das requisições assíncronas
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Exibe uma notificação de erro com a mensagem de erro traduzida, utilizando a função 'toast.add'.
        console.error('Erro ao carregar dados iniciais:', error); // Exibe a mensagem de erro no console para debug.
    }
};

const listarItensDisponiveis = () => {
    // Declara uma função chamada listarItensDisponiveis
    const addedIds = new Set(ListaItensSetor.value.map((item) => item.id_produto)); // Cria um conjunto com os IDs dos produtos já adicionados ao setor

    // Filtra os produtos disponíveis (da ListaProdutos) excluindo os que já estão no setor
    ListaItensDisponiveis.value = ItensSetor.value.filter((produto) => !addedIds.has(produto.id_produto)); // Atualiza corretamente a lista reativa
};

const listarItensFiltrados = () => {
    // Declara uma função chamada listarItensFiltrados
    const idsSetor = new Set(ItensSetor.value.map((item) => item.id_produto)); // Cria um conjunto com os IDs dos produtos já adicionados ao setor

    const itensFiltrados = ListaItensSetor.value.filter(
        (produto) => !idsSetor.has(produto.value) // Filtra os produtos disponíveis excluindo os que já estão no setor
    );

    ListaItensDisponiveis.value = [...itensFiltrados]; // Atualiza a lista de produtos disponíveis de forma reativa

    if (itensFiltrados.length === 0) {
        // Verifica se não há mais itens disponíveis
        toast.add({
            severity: 'warn',
            summary: t('employee_no_availble_item'),
            detail: t('employee_no_more_availble_setor'),
            life: 3000
        });
    }
};

const abrirDialogAdicionarItem = () => {
    listarItensFiltrados();
    visible.value = true;
};

onMounted(async () => {
    // Declara uma função que será executada assim que o componente for montado (usando 'onMounted')
    Mob.value = isMobEnabled(); // Define o valor de 'Mob' como o retorno da função 'isMobEnabled()', provavelmente para verificar se o dispositivo é móvel.
    await loadSetor(); // Chama a função assíncrona 'loadSetor' e espera sua conclusão antes de continuar.
    await loadData(); // Chama a função assíncrona 'loadData' e espera sua conclusão antes de continuar.

    active.value = '0';
});

const atualizarProdutoSetor = async () => {
    // Declara uma função assíncrona chamada 'atualizarProdutoSetor'
    loading.value = true; // Define o valor de 'loading' como true, indicando que uma operação está em andamento (geralmente usado para mostrar um indicador de carregamento)

    try {
        // Inicia o bloco try-catch para tentar executar o código dentro dele e capturar erros se ocorrerem
        await setorService.atualizarProdutoSetor(item.value); // Chama a função 'atualizarProdutoSetor' do serviço 'setorService' passando 'item.value' como argumento (o item que está sendo atualizado)
        fetchListaItemSetor(); // Chama a função 'fetchListaItemSetor' para atualizar a lista de itens do setor após a atualização do produto
        itemDialog.value = false; // Define 'itemDialog' como false, provavelmente fechando um modal ou caixa de diálogo de edição de item
        toast.add({
            // Exibe uma notificação (toast) indicando sucesso na atualização do produto
            severity: 'success', // Tipo da notificação (sucesso)
            summary: t('title_sucess'), // Título da notificação (provavelmente traduzido com a função 't')
            detail: t('product_update_sucess'), // Detalhes da notificação (mensagem traduzida sobre a atualização do produto)
            life: 3000 // A duração da notificação, em milissegundos (3000ms = 3 segundos)
        });
        resetProdutoSelecionadoSetor(produtoSelecionado); // Chama a função 'resetProdutoSelecionadoSetor' para redefinir o produto selecionado no setor
    } catch (error) {
        // Se houver algum erro durante o processo de atualização
        console.error('Erro ao atualizar o produto:', error); // Exibe a mensagem de erro no console para debug
        toast.add({
            // Exibe uma notificação (toast) indicando erro na atualização do produto
            severity: 'error', // Tipo da notificação (erro)
            summary: t('title_error'), // Título da notificação (provavelmente traduzido com a função 't')
            detail: t('product_update_error_details'), // Detalhes da notificação (mensagem traduzida sobre o erro na atualização)
            life: 3000 // A duração da notificação, em milissegundos (3000ms = 3 segundos)
        });
    } finally {
        // O bloco finally é sempre executado, independentemente de ocorrer erro ou não
        loading.value = false; // Define o valor de 'loading' como false, indicando que o processo foi concluído e o carregamento pode ser desativado
    }
};

const SalvarProduto = async () => {
    // Declara uma função assíncrona chamada 'SalvarProduto' para salvar um produto
    loading.value = true; // Define 'loading' como true, indicando que a operação de salvar o produto está em andamento (usado para exibir um indicador de carregamento)

    try {
        // Inicia um bloco try-catch para tratar erros durante a execução da função
        await setorService.adicionarProduto(setor, produtoSelecionado.value); // Chama o serviço 'adicionarProduto' para adicionar o produto selecionado ao setor
        fetchListaItemSetor(); // Após adicionar o produto, chama a função 'fetchListaItemSetor' para recarregar a lista de itens do setor
        visible.value = false; // Define 'visible' como false, provavelmente escondendo o modal ou a caixa de diálogo que exibia o formulário de adição do produto
        resetProdutoSelecionadoSetor(produtoSelecionado); // Chama a função 'resetProdutoSelecionadoSetor' para redefinir ou limpar o produto selecionado no setor
        toast.add({
            // Exibe uma notificação de sucesso (toast)
            severity: 'success', // Define a severidade da notificação como 'success' (sucesso)
            summary: t('title_sucess'), // O título da notificação (provavelmente traduzido com a função 't')
            detail: t('product_added_sucess'), // Detalhes da notificação (mensagem traduzida de sucesso na adição do produto)
            life: 3000 // Duração da notificação em milissegundos (3 segundos)
        });
    } catch (error) {
        // Caso ocorra algum erro durante o processo de salvar
        console.error('Erro ao adicionar item:', error.message); // Exibe a mensagem de erro no console para depuração
        toast.add({
            // Exibe uma notificação de erro (toast)
            severity: 'error', // Define a severidade da notificação como 'error' (erro)
            summary: t('title_error'), // O título da notificação (provavelmente traduzido com a função 't')
            detail: t('employee_product_error'), // Detalhes da notificação (mensagem traduzida de erro ao adicionar produto)
            life: 3000 // Duração da notificação em milissegundos (3 segundos)
        });
    } finally {
        // O bloco finally é sempre executado, independentemente de erros
        loading.value = false; // Define 'loading' como false, desativando o indicador de carregamento
    }
};

const deletarProduto = async () => {
    // Declara uma função assíncrona chamada 'deletarProduto' para excluir um produto
    loading.value = true; // Define 'loading' como true, indicando que a operação de exclusão do produto está em andamento

    try {
        // Inicia um bloco try-catch para tratar erros durante o processo de exclusão
        await setorService.deletarProduto(item.value); // Chama o serviço 'deletarProduto' para excluir o produto especificado em 'item.value'
        fetchListaItemSetor(); // Após a exclusão, chama a função 'fetchListaItemSetor' para recarregar a lista de itens do setor
        resetProdutoSelecionadoSetor(produtoSelecionado); // Chama a função 'resetProdutoSelecionadoSetor' para redefinir ou limpar o produto selecionado
        toast.add({
            // Exibe uma notificação de sucesso (toast)
            severity: 'success', // Define a severidade da notificação como 'success' (sucesso)
            summary: t('title_sucess'), // O título da notificação (provavelmente traduzido com a função 't')
            detail: t('product_delete_sucess'), // Detalhes da notificação (mensagem traduzida de sucesso na exclusão do produto)
            life: 3000 // Duração da notificação em milissegundos (3 segundos)
        });
        deleteProductDialog.value = false; // Define 'deleteProductDialog' como false, provavelmente fechando o modal ou diálogo de confirmação de exclusão
    } catch (error) {
        // Se ocorrer algum erro durante o processo de exclusão
        console.error('Erro ao deletar produto:', error); // Exibe a mensagem de erro no console para depuração
        toast.add({
            // Exibe uma notificação de erro (toast)
            severity: 'error', // Define a severidade da notificação como 'error' (erro)
            summary: t('title_error'), // O título da notificação (provavelmente traduzido com a função 't')
            detail: t('product_delete_error'), // Detalhes da notificação (mensagem traduzida de erro na exclusão do produto)
            life: 3000 // Duração da notificação em milissegundos (3 segundos)
        });
    } finally {
        // O bloco finally é sempre executado, independentemente de erros
        loading.value = false; // Define 'loading' como false, desativando o indicador de carregamento
    }
};

/**
 * Função que define o produto a ser deletado e exibe o diálogo de confirmação.
 *
 * @param {Object} itm - O item (produto) que será deletado.
 */
const deleteProduct = async (itm) => {
    item.value = itm; // Atribui o produto recebido como parâmetro 'itm' à variável 'item.value', que provavelmente armazena o item selecionado para exclusão
    deleteProductDialog.value = true; // Define 'deleteProductDialog.value' como true, indicando que o diálogo/modal de confirmação de exclusão deve ser exibido
};

/**
 * Função que cria um "debounce", limitando a frequência de execução de uma função.
 *
 * @param {Function} func - A função que será chamada após o tempo de espera.
 * @param {number} [wait=300] - O tempo de espera (em milissegundos) entre as execuções da função. O valor padrão é 300ms.
 * @returns {Function} Uma nova função que, quando chamada, aguarda o tempo de espera e executa 'func' uma vez.
 */
function debounce(func, wait = 300) {
    let timeout; // Declara a variável 'timeout' que irá armazenar o identificador do temporizador (para limpar o temporizador anterior)

    return (...args) => {
        // Retorna uma função que pode ser chamada várias vezes. 'args' são os argumentos passados para a função 'func'
        clearTimeout(timeout); // Limpa o temporizador anterior, garantindo que a função 'func' não seja chamada antes do tempo de espera
        timeout = setTimeout(() => func.apply(this, args), wait); // Configura o temporizador para chamar 'func' após o tempo de espera, passando os argumentos e o contexto ('this')
    };
}

const debouncedFilterChange = debounce(() => {
    onFilterChange(); // Chama a função 'onFilterChange', que provavelmente é responsável por aplicar filtros (por exemplo, em uma lista ou busca)
}, 300); // O tempo de espera de 300ms é passado para a função 'debounce', limitando a frequência de chamadas da função 'onFilterChange'
</script>

<template>
    <div class="card vh">
        <!-- inicio do tabview-->
        <Tabs v-model:value="active" :value="0">
            <TabList>
                <Tab value="0">{{ t('list_sector') }}</Tab>
                <Tab value="1">{{ editVisible ? t('edit_sector') : t('add_sector') }}</Tab>
            </TabList>
            <TabPanel value="0">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaSetor"
                        stripedRows
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :totalRecords="totalRecords"
                        :rows="lazyParams.value?.rows || 10"
                        :sortField="lazyParams.value?.sortField || 'codigo'"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        dataKey="codigo"
                        :globalFilterFields="['codigo', 'nome', 'id_centro_custo']"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>{{ $t('total_records', { count: filteredCount }) }}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search" @input="debouncedFilterChange" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> {{ t('sector_empty') }} </template>
                        <Column field="codigo" sortable :header="t('code')"></Column>
                        <Column field="nome" sortable :header="t('sector_name')"></Column>
                        <Column field="id_centro_custo" sortable :header="t('cost_center')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- fim do listar -->
            <!-- inicio do adicionar-->
            <TabPanel value="1">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="lg:col-12 md:col-12 sm:col-12">
                                        <label for="codigo">{{ t('code') }}:</label>
                                        <InputText class="my-2 w-full" id="codigo" v-model="setor.codigo" required />
                                    </div>
                                    <div class="lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ t('sector_name') }}:</label>
                                        <InputText class="my-2 w-full" id="nome" v-model="setor.nome" required />
                                    </div>
                                    <div class="lg:col-12 md:col-12 sm:col-12">
                                        <label for="centro">{{ t('cost_center_name') }}:</label>
                                        <Select filter class="w-full my-2" v-model="setor.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="select3" />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="atualizarSetor" :disabled="Mob" />
                                    <Button
                                        v-if="editVisible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteSetorDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarSetor" :disabled="Mob" />
                                </div>
                                <div class="col-12">
                                    <Tabs v-if="editVisible">
                                        <TabPanel :header="t('sector_available_items')">
                                            <Button class="my-3" @click="abrirDialogAdicionarItem" :label="$t('add')" />
                                            <DataTable
                                                class=""
                                                paginator
                                                removableSort
                                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                                :rows="10"
                                                :value="ItensSetor"
                                                stripedRows
                                                dataKey="sku"
                                                v-model="setor.itemsSelecionadosSetor"
                                                @rowSelect="onRowSelectItem"
                                            >
                                                <Column field="sku" sortable :header="t('sku')"></Column>
                                                <Column field="nome" :header="t('name')"></Column>
                                                <Column field="qtd_limite" :header="t('quantity')"></Column>
                                                <Column field="dias" :header="t('best_before')"></Column>
                                                <Column style="width: 10%">
                                                    <template #body="slotProps">
                                                        <Button icon="pi pi-pencil" outlined rounded severity="info" @click="onRowSelectItem(slotProps)" />
                                                    </template> </Column
                                                ><Column style="width: 10%">
                                                    <template #body="slotProps">
                                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteProduct(slotProps.data)" />
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </TabPanel>
                                    </Tabs>

                                    <!-- dialogo editar item-->
                                    <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="t('item_edit')" :modal="true" class="p-2" :draggable="false"
                                        ><hr class="p-0 m-0" />
                                        <div>
                                            <div class="formgrid grid">
                                                <div class="field lg:col-9 md:col-9 sm:col-12">
                                                    <label class="mr-2" for="name">{{ t('name') }}:</label>
                                                    <InputText disabled class="w-full" v-model="item.nome" id="name" type="text"></InputText>
                                                </div>
                                                <div class="field lg:col-3 md:col-3 sm:col-12">
                                                    <label class="mr-2" for="Quantidade">{{ t('quantity') }}:</label>
                                                    <InputText id="Quantidade" class="w-full" v-model="item.qtd_limite" />
                                                </div>
                                            </div>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('cancel')" icon="pi pi-times" text @click="itemDialog = false" />
                                            <Button :label="$t('save')" icon="pi pi-check" text @click="atualizarProdutoSetor" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo adicionar item-->
                                    <Dialog v-model:visible="visible" :style="{ width: '450px' }" :modal="true" :header="t('add_items_to_sector')" class="p-2" :draggable="false">
                                        <hr class="p-0 m-0" />
                                        <div>
                                            <div class="formgrid grid">
                                                <div class="field lg:col-9 md:col-9 sm:col-12">
                                                    <label for="Produto" class="mr-2">{{ t('product') }}: </label>
                                                    <Select
                                                        v-model="produtoSelecionado.id_produto"
                                                        :options="ListaItensDisponiveis"
                                                        :virtualScrollerOptions="{ itemSize: 30 }"
                                                        optionLabel="label"
                                                        optionValue="value"
                                                        :placeholder="$t('select_product')"
                                                        class="w-full"
                                                    />
                                                </div>
                                                <div class="field lg:col-3 md:col-9 sm:col-12">
                                                    <label for="Quantidade" class="mr-2">{{ t('quantity') }}: </label>
                                                    <InputText id="Quantidade" class="w-full" v-model="produtoSelecionado.quantidade" inputClass="col-3" autocomplete="off" required />
                                                </div>
                                            </div>
                                        </div>
                                        <template #footer>
                                            <Button type="button" :label="$t('cancel')" severity="secondary" @click="visible = false" />
                                            <Button type="button" :label="$t('add')" @click="SalvarProduto" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo deletar produto-->
                                    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" :header="t('dialog_delete_item')" :modal="true" :draggable="false">
                                        <div class="confirmation-content">
                                            <i style="font-size: 2rem" />
                                            <span v-if="item">
                                                {{ t('dialog_delete_employee', { name: item.nome }) }}
                                            </span>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('no')" icon="pi pi-times" text @click="deleteProductDialog = false" />
                                            <Button :label="$t('yes')" icon="pi pi-check" text @click="deletarProduto" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo deletar setor-->
                                    <Dialog :header="$t('sector_delete_dialog')" v-model:visible="deleteSetorDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                                        <div class="confirmation-content">
                                            <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                            <span>
                                                {{ t('sector_delete_dialog_confirm', { codigo: setor.codigo, nome: setor.nome }) }}
                                            </span>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('no')" icon="pi pi-times" @click="deleteSetorDialog = false" class="p-button-text" />
                                            <Button :label="$t('yes')" icon="pi pi-check" @click="deleteSetor" class="p-button-text" />
                                        </template>
                                    </Dialog>
                                </div>
                            </form>
                            <!-- fim capos de texto -->
                        </div>
                    </div>
                </div>
            </TabPanel>
        </Tabs>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style></style>
