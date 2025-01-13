<script setup>
// Importação de funções e hooks do Vue.js
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import cdcService from '@/services/cdcService';
import { resetCDCForm } from '@/helpers/formHelper';

// Definição de variáveis reativas e referências
const active = ref(0); // Estado para o índice da aba ativa
const toast = useToast(); // Hook para usar a funcionalidade de toast
const centroCusto = ref([]); // Lista dos centros de custo
const visible = ref(false); // Controle de visibilidade para o formulário de edição/adição
const deleteCentroDialog = ref(false); // Controle de visibilidade do diálogo de confirmação de exclusão
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global, que verifica se o texto contém o valor
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

/**
 * Função para carregar a lista de centros de custo.
 * Ela chama o serviço para listar os centros de custo, atualiza o contador de registros filtrados
 * e lida com possíveis erros durante a operação.
 *
 * @async
 * @returns {Promise<void>} Retorna uma Promise que não resolve nenhum valor, pois é uma operação assíncrona.
 * @throws {Error} Caso haja um erro na requisição, o erro será exibido no console e uma mensagem de erro será mostrada ao usuário.
 */
const loadCentroCusto = async () => {
    try {
        centroCusto.value = await cdcService.listarCentrosDeCusto(); // Chama o serviço para listar os centros de custo
        filteredCount.value = centroCusto.value.length; // Atualiza o contador de registros filtrados
    } catch (error) {
        console.error(error.message); // Exibe o erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar os centros de custo' }); // Exibe mensagem de erro
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
    try {
        if (visible.value) {
            // Se o formulário estiver no modo de edição, chama a função de atualizar
            await cdcService.atualizarCentro(cdc); // Atualiza o centro de custo no backend
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro atualizado!' }); // Exibe mensagem de sucesso
        } else {
            // Se o formulário estiver no modo de adicionar, chama a função de adicionar
            await cdcService.adicionarCentro(cdc); // Adiciona o centro de custo no backend
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro adicionado!' }); // Exibe mensagem de sucesso
        }
        loadCentroCusto(); // Carrega novamente a lista de centros de custo
        resetCDCForm(cdc); // Reseta os campos do formulário
        active.value = 0; // Volta para a aba de listagem
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message }); // Exibe mensagem de erro caso falhe
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
    try {
        await cdcService.deletarCentro(cdc); // Chama o serviço para deletar o centro de custo
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro deletado!' }); // Exibe mensagem de sucesso
        deleteCentroDialog.value = false; // Fecha o diálogo de confirmação de exclusão
        loadCentroCusto(); // Carrega novamente a lista de centros de custo
        resetCDCForm(cdc); // Reseta os campos do formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar o centro de custo' }); // Exibe mensagem de erro caso falhe
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

/**
 * Função que manipula a seleção de uma linha na tabela.
 * Ela chama a função `onRowSelect` para lidar com os dados da linha selecionada.
 *
 * @param {Object} event - O evento de seleção de linha, contendo os dados da linha selecionada.
 * @param {Object} event.data - Os dados da linha selecionada na tabela.
 */
const handleRowSelection = async (event) => {
    await onRowSelect(event); // Chama a função de seleção de linha
};

/**
 * Função que é chamada ao montar o componente.
 * Ela carrega os dados dos centros de custo chamando a função `loadCentroCusto`.
 */
onMounted(() => {
    loadCentroCusto(); // Carrega os dados ao montar o componente
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <!-- Componente TabView para controlar abas de listagem e edição -->

            <!-- Aba de Listagem de Centros de Custo -->
            <TabPanel header="Listar Centros de Custo">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="centroCusto"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        stripedRows
                        removableSort
                        paginator
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        dataKey="id"
                        :sortField="'Codigo'"
                        :globalFilterFields="['Codigo', 'Nome']"
                        :metaKeySelection="false"
                        @rowSelect="handleRowSelection"
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
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> Nenhum centro de custo adicionado. </template>
                        <!-- Mensagem exibida quando a tabela está vazia -->
                        <Column field="Codigo" sortable header="Código"></Column>
                        <Column field="Nome" sortable header="Centro de Custo (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- Aba de Edição ou Adição de Centro de Custo -->
            <TabPanel :header="visible ? 'Editar Centro de Custo' : 'Adicionar Centro de Custo'" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <!-- Formulário para adicionar ou editar um centro de custo -->

                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_centro_custo">Código:</label>
                                        <InputText class="my-2" id="id_centro_custo" v-model="cdc.Codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Centro de Custo (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="cdc.Nome" required />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- Botões de Ação -->
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="submitForm" />
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteCentroDialog = true" />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="submitForm" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>

                        <Dialog header="Deletar Centro de Custo" v-model:visible="deleteCentroDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar o centro de custo <b>{{ cdc.Codigo }}</b> - <b>{{ cdc.Nome }}</b> ?</span
                                >
                            </div>

                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deleteCentroDialog = false" class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deleteCentro" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
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
