<script setup>
// Importando funções e objetos do Vue.js para usar no componente
import { reactive, ref, onMounted, watch,computed } from 'vue';
// Importando a função 'useToast' para exibir notificações de sucesso ou erro
import { useToast } from 'primevue/usetoast';
// Importando o estilo do componente de data picker
import '@vuepic/vue-datepicker/dist/main.css';
// Importando a imagem de placeholder que será usada caso não haja imagem para um produto
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
// Importando o store de autenticação para acessar o estado de autenticação do usuário
import { useAuthStore } from '@/store/authStore.js';
// Importando o componente de upload de imagem para ser usado na interface
import ImageUpload from '@/components/ImageUpload.vue';
// Importando o componente de spinner de carregamento
import LoadingSpinner from '@/components/LoadingSpinner.vue';
// Importando o objeto 'FilterMatchMode' do PrimeVue para configurar os filtros de pesquisa
import { FilterMatchMode } from 'primevue/api';
// Importando o store de dados para acessar os dados compartilhados, como plantas
import { useDataStore } from '@/store/dataStore.js';
// Importando o serviço de produto para interagir com a API relacionada aos produtos
import produtoService from '@/services/produtoService';
// Importando funções de ajuda relacionadas ao formulário do produto
import { resetProdutoForm } from '@/helpers/formHelper';
// Importando funções auxiliares relacionadas ao produto
import { enrichProdutoData } from '@/helpers/HelperProduto.js';
import { isMobEnabled } from '@/helpers/HelperUtils.js'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
/**
 * Filtros de pesquisa global aplicados na listagem de produtos.
 * @type {Object}
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que usa o modo 'CONTAINS' para buscar substrings
});

// Inicializando stores para autenticação e dados
const dataStore = useDataStore(); // Acessa o store de dados para obter informações sobre plantas e outros dados
const store = useAuthStore(); // Acessa o store de autenticação para obter dados sobre o usuário logado

// Variáveis de controle da interface do usuário
const toast = useToast(); // Função para exibir notificações via toast
const active = ref(0); // Controle de qual aba está ativa
const loading = ref(false); // Controle de carregamento de dados
const mob = ref(false); // Controle da habilidade de manipular produtos baseado na integração com Mob
let formatedPlantaOptions = ref([]); // Opções formatadas para as plantas
const tipoProduto = computed(() => [
    // Opções de tipos de produtos disponíveis
    { label: t('product_type_epi'), value: 1 }, // Tipo de produto EPI
    { label: t('product_type_supply'), value: 2 }, // Tipo de produto Insumo
    { label: t('product_type_consumable'), value: 3 } // Tipo de produto Consumível
]);

// Controle de paginação para exibição de produtos
const currentPage = ref(1); // Página atual de exibição de produtos
const pageSize = 10; // Número de itens por página
const totalRecords = ref(0); // Total de registros de produtos disponíveis

// Referências para os campos de upload de imagens
const imageUploader = ref(null);
const imageUploader2 = ref(null);
const imageUploader3 = ref(null);

// Referências para os arquivos de imagem selecionados
const selectedFile = ref(null); // Imagem principal selecionada
const selectedSecFile = ref(null); // Imagem secundária selecionada
const selectedInfoFile = ref(null); // Imagem de informações selecionada

// Imagens de placeholder para os produtos
const imagePrinc = ref(imagePlaceholder); // Placeholder da imagem principal
const imageSec = ref(imagePlaceholder); // Placeholder da imagem secundária
const imageInfo = ref(imagePlaceholder); // Placeholder da imagem de informações

// Lista de produtos a ser exibida
const ListaProdutos = ref([]);

// Controle do diálogo de exclusão de produto
const deleteProdutoDialog = ref(false); // Controle de visibilidade do diálogo de exclusão

// Controle de visibilidade do formulário de edição de produto
const visible = ref(false); // Visibilidade do formulário de edição de produto

/**
 * Função chamada quando um arquivo é selecionado para upload.
 * @param {File} file - O arquivo selecionado para upload
 * @param {string} type - O tipo de imagem (principal, secundária ou de informações)
 */
const handleFileSelected = (file, type) => {
    if (type === 'principal') {
        // Se o tipo for 'principal', armazena o arquivo principal
        selectedFile.value = file;
    } else if (type === 'secundaria') {
        // Se o tipo for 'secundaria', armazena o arquivo secundário
        selectedSecFile.value = file;
    } else if (type === 'info') {
        // Se o tipo for 'info', armazena o arquivo de informações
        selectedInfoFile.value = file;
    }
};

/**
 * Objeto reativo que representa os dados de um produto.
 * @type {Object}
 */
const produto = reactive({
    codigo: '', // Código do produto
    id_planta: '', // ID da planta associada ao produto
    id_tipoProduto: '', // Tipo de produto (EPI, Insumo, Consumível)
    id_categoria: 71, // ID da categoria do produto (fixo)
    nome: '', // Nome do produto
    descricao: ' ', // Descrição do produto
    unidade_medida: '', // Unidade de medida
    validadedias: '', // Validade em dias do produto
    quantidademinima: '' //quantidade minima do produto
});

/**
 * Define a imagem se for válida. A função tenta buscar a imagem com base no nome.
 * @param {string} image - Nome do arquivo da imagem
 * @param {Ref} targetRef - Referência para onde a imagem será atribuída
 * @returns {Promise<void>}
 */
const setImageIfValid = async (image, targetRef) => {
    if (image) {
        // Se houver uma imagem associada ao produto
        targetRef.value = await getImagem(image); // Obtém a imagem e atribui ao ref alvo
    } else {
        targetRef.value = null; // Se não houver imagem, define como null
    }
};

/**
 * Função chamada quando uma linha do DataTable é selecionada.
 * Atribui os dados do produto selecionado ao objeto 'produto' e define as imagens.
 * @param {Object} event - Evento de seleção da linha
 * @returns {Promise<void>}
 */
const onRowSelect = async (event) => {
    Object.assign(produto, event.data); // Atribui os dados do produto selecionado ao objeto 'produto'
    await setImageIfValid(produto.imagem1, imagePrinc); // Define a imagem principal
    await setImageIfValid(produto.imagem2, imageSec); // Define a imagem secundária
    await setImageIfValid(produto.imagemdetalhe, imageInfo); // Define a imagem de detalhes
    visible.value = true; // Torna o formulário visível
    active.value = 1; // Ativa a aba de edição
    loadProdutos(); // Recarrega a lista de produtos
};

/**
 * Função para carregar os produtos com base na página atual e filtro.
 * @param {number} [page=1] - Número da página a ser carregada
 * @returns {Promise<void>}
 */
const loadProdutos = async (page = 1) => {
    const searchTerm = filters.value.global.value || ''; // Obtém o termo de pesquisa para os filtros
    const data = { id_cliente: store.userIdCliente, page, pageSize, searchTerm }; // Prepara os dados para a requisição

    try {
        loading.value = true; // Ativa o estado de carregamento
        const response = await produtoService.listarProdutos(data, store.token); // Faz a requisição para listar produtos
        ListaProdutos.value = response.data.produtos; // Atualiza a lista de produtos com a resposta
        totalRecords.value = response.data.totalRecords; // Atualiza o total de registros de produtos
        await loadImagens(ListaProdutos.value); // Carrega as imagens dos produtos
    } catch (error) {
        console.error('Erro ao carregar produtos:', error); // Exibe erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_list_error'), life: 3000 }); // Exibe erro via toast
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

// Controle de debounce para o filtro de pesquisa
const debounceTimeout = ref(null); // Variável para armazenar o timeout do debounce

/**
 * Filtro local para os produtos, que aguarda 1 segundo após a última digitação para fazer a requisição.
 * @param {string} newValue - O novo valor do filtro global
 * @param {string} oldValue - O valor anterior do filtro global
 */
watch(
    () => filters.value.global.value, // Observa mudanças no valor do filtro global
    (newValue, oldValue) => {
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value); // Limpa o timeout anterior
        }

        // Espera 1 segundo após a digitação
        debounceTimeout.value = setTimeout(() => {
            loadProdutos(currentPage.value); // Carrega os produtos com o filtro atualizado
        }, 1000); // Tempo de espera de 1000ms (1 segundo)
    },
    { immediate: true } // Executa a função de busca imediatamente ao observar a mudança
);

/**
 * Função para carregar as imagens associadas aos produtos.
 * @param {Array} produtos - Lista de produtos para carregar suas imagens
 * @returns {Promise<void>}
 */
const loadImagens = async (produtos) => {
    for (const produto of produtos) {
        produto.imagemUrl = await getImagem(produto.imagem1); // Atribui a URL da imagem ao produto
    }
};

/**
 * Função chamada quando a página de produtos é alterada.
 * @param {Object} event - Evento de mudança de página
 */
const onPageChange = (event) => {
    currentPage.value = event.page + 1; // Atualiza a página atual
    loadProdutos(currentPage.value); // Carrega os produtos da nova página
};

/**
 * Função para carregar dados iniciais como as plantas.
 * @returns {Promise<void>}
 */
const loadData = async () => {
    try {
        formatedPlantaOptions.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega as opções de plantas
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
        console.error('Erro ao carregar dados iniciais:', error); // Exibe erro no console
    }
};

/**
 * Função para salvar um novo produto no sistema.
 * @returns {Promise<void>}
 */
const saveProduto = async () => {
    try {
        loading.value = true; // Ativa o carregamento
        await produtoService.adicionarProduto(
            enrichProdutoData(produto, store.userId, store.userIdCliente), // Preenche os dados do produto
            {
                selectedFile: selectedFile.value,
                selectedSecFile: selectedSecFile.value,
                selectedInfoFile: selectedInfoFile.value
            }
        );
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_added_sucess'), life: 3000 }); // Exibe sucesso
        loadProdutos(); // Recarrega a lista de produtos
        resetForm(); // Reseta o formulário
        active.value = 0; // Volta para a aba inicial
    } catch (error) {
        console.error('Erro ao salvar produto:', error); // Exibe erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_added_error'), life: 3000 }); // Exibe erro
    } finally {
        loading.value = false; // Desativa o carregamento
        dataStore.invalidatProdutoCache();
    }
};

/**
 * Função para deletar um produto.
 * @returns {Promise<void>}
 */
const deleteProduto = async () => {
    const data = {
        id_produto: produto.id_produto, // ID do produto
        id_usuario: store.userId, // ID do usuário
        id_cliente: store.userIdCliente // ID do cliente
    };

    try {
        loading.value = true; // Ativa o carregamento
        await produtoService.deletarProduto(data, store.token); // Faz a requisição para deletar o produto
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_delete_sucess'), life: 3000 }); // Exibe sucesso
        loadProdutos(); // Recarrega a lista de produtos
        resetProdutoForm(produto, [imagePrinc, imageSec, imageInfo]); // Reseta o formulário
        deleteProdutoDialog.value = false; // Fecha o diálogo de exclusão
        active.value = 0; // Volta para a aba inicial
    } catch (error) {
        console.error('Erro ao deletar produto:', error); // Exibe erro no console
        toast.add({ severity: 'error', summary:  t('title_error'), detail: t('product_delete_error'), life: 3000 }); // Exibe erro
    } finally {
        loading.value = false; // Desativa o carregamento
        dataStore.invalidatProdutoCache();
    }
};

/**
 * Função para atualizar os dados de um produto existente.
 * @returns {Promise<void>}
 */
const updateProduto = async () => {
    try {
        loading.value = true; // Ativa o carregamento
        await produtoService.atualizarProduto(
            enrichProdutoData(produto, store.userId, store.userIdCliente), // Atualiza os dados do produto
            {
                selectedFile: selectedFile.value,
                selectedSecFile: selectedSecFile.value,
                selectedInfoFile: selectedInfoFile.value
            }
        );
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_update_sucess'), life: 3000 }); // Exibe sucesso
        loadProdutos(); // Recarrega a lista de produtos
        resetForm(); // Reseta o formulário
        active.value = 0; // Volta para a aba inicial
    } catch (error) {
        console.error('Erro ao atualizar produto:', error); // Exibe erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_update_error'), life: 3000 }); // Exibe erro
    } finally {
        loading.value = false; // Desativa o carregamento
        dataStore.invalidatProdutoCache();
    }
};

/**
 * Função para buscar uma imagem associada ao nome do arquivo.
 * @param {string} filename - Nome do arquivo da imagem
 * @returns {Promise<string>} - A URL da imagem
 */
const getImagem = async (filename) => {
    if (!filename) return imagePlaceholder; // Se não houver imagem, retorna o placeholder

    try {
        const response = await produtoService.obterImagem(store.userIdCliente, filename); // Faz a requisição para obter a imagem
        if (response.status === 200) {
            const { image, mimeType } = response.data;
            return `data:${mimeType};base64,${image}`; // Retorna a imagem codificada em base64
        }
    } catch (error) {
        console.error('Erro ao carregar imagem:', error); // Exibe erro no console
        return imagePlaceholder; // Retorna o placeholder se houver erro ao carregar a imagem
    }
    
};

/**
 * Observa mudanças no índice da aba ativa. Quando a aba ativa muda para a aba inicial (índice 0),
 * o formulário será resetado e a lista de produtos será recarregada. O produto será ocultado.
 * @param {number} newIndex - O novo índice da aba ativa
 * @param {number} oldIndex - O índice da aba ativa antes da mudança
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        // Verifica se a aba foi alterada para a aba inicial (índice 0)
        resetForm(); // Chama a função para resetar o formulário, limpando os dados
        visible.value = false; // Torna o formulário de edição de produto invisível
    }
});

/**
 * Reseta o formulário de produto, limpando os dados do objeto 'produto' e as imagens selecionadas.
 * Limpa também os dados de imagem dos campos de upload.
 */
const resetForm = () => {
    // Reseta os dados do produto e limpa as imagens (principal, secundária e de informações)
    resetProdutoForm(produto, [imagePrinc, imageSec, imageInfo]);

    // Limpa os dados de imagem nos campos de upload
    imageUploader.value?.clearImageData();
    imageUploader2.value?.clearImageData();
    imageUploader3.value?.clearImageData();
};

/**
 * Função chamada quando uma linha de produto é selecionada na tabela de produtos.
 * A seleção de uma linha é processada e os dados do produto são carregados no formulário de edição.
 * @param {Object} event - O evento gerado pela seleção da linha, contendo os dados do produto selecionado
 * @returns {Promise<void>}
 */
const handleRowSelection = async (event) => {
    // Chama a função de seleção de linha para carregar os dados do produto no formulário
    await onRowSelect(event); // Lida com a seleção de uma linha e carrega as informações no formulário de edição
};

/**
 * Função chamada quando o componente é montado (inicializado).
 * Realiza o carregamento inicial dos produtos e de dados adicionais necessários para o componente.
 * @returns {Promise<void>}
 */
onMounted(async () => {
    try {
        // Carrega os produtos logo que o componente é montado
        await loadProdutos(); // Carrega a lista de produtos ao montar o componente
        loadData(); // Carrega dados adicionais (por exemplo, plantas) ao montar o componente
        mob.value = isMobEnabled(); // Verifica se a integração com Mob está habilitada
    } catch (error) {
        // Exibe uma mensagem de erro caso algo dê errado durante o carregamento dos produtos ou dados
        console.error('Erro ao carregar dados no onMounted:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
    }
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel :header="$t('list_products')">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaProdutos"
                        selectionMode="single"
                        stripedRows
                        paginator
                        removableSort
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :totalRecords="totalRecords"
                        dataKey="id"
                        lazy
                        :globalFilterFields="['codigo', 'nome']"
                        :sortField="'codigo'"
                        :sortOrder="1"
                        :metaKeySelection="false"
                        @rowSelect="handleRowSelection"
                        @page="onPageChange"
                    >
                        <!-- A tabela exibe os dados provenientes de "ListaProdutos" -->
                        <!-- Permite selecionar apenas uma linha por vez -->
                        <!-- Aplica um estilo de linhas alternadas para melhorar a legibilidade -->
                        <!-- Habilita a funcionalidade de paginação para dividir os dados em várias páginas -->
                        <!-- Permite ao usuário remover a ordenação clicando na coluna de ordenação -->
                        <!-- Define o número de linhas por página como 10 e as opções de quantidade de itens por página como 5, 10, 20 ou 50 -->
                        <!-- Define o número total de registros para auxiliar na navegação da paginação -->
                        <!-- A chave única para cada linha é o campo "id" -->
                        <!-- Habilita o carregamento preguiçoso, ou seja, os dados são carregados conforme necessário -->
                        <!-- Os filtros globais serão aplicados aos campos "codigo" e "nome" -->
                        <!-- A ordenação inicial será feita pelo campo "codigo" em ordem crescente -->
                        <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" (Ctrl ou Command) -->
                        <!-- Emite o evento de seleção de linha chamando a função handleRowSelection quando uma linha for selecionada -->
                        <!-- Emite o evento de mudança de página chamando a função onPageChange quando a página for alterada -->
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>{{$t('total_records',{count: totalRecords})}}</span>
                                </div>

                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> {{t('product_empty')}} </template>
                        <Column header="Imagem" class="col-3">
                            <template #body="slotProps">
                                <div>
                                    <img :src="slotProps.data.imagemUrl" :alt="$t('product_image_alt')" class="w-6rem border-round" />
                                </div>
                            </template>
                        </Column>
                        <Column field="codigo" sortable :header="t('sku')" class="col-2"></Column>
                        <Column field="nome" sortable :header="t('name')" class="col-7"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? t('edit_product') :  t('add_product')">
                <div class="grid">
                    <div class="col-12">
                        <div class="my-6">
                            <!--form de cadastro de novo produto-->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="codigo">{{t('sku')}}:</label>
                                    <InputText class="my-2" v-model="produto.codigo" id="codigo" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="nome">{{t('name')}}:</label>
                                    <InputText class="my-2" v-model="produto.nome" id="nome" type="text"></InputText>
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="nome">{{t('description')}}:</label>
                                    <Textarea v-model="produto.descricao" class="my-2 overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="codigo">{{t('specification')}}:</label>
                                    <Textarea v-model="produto.especificacoes" class="my-2 overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="tipo">{{t('type')}}:</label>
                                    <Dropdown class="my-2" v-model="produto.id_tipoProduto" :options="tipoProduto" optionLabel="label" optionValue="value" :placeholder="t('select_type')" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="tipo">{{t('factory')}}:</label>
                                    <Dropdown class="my-2" v-model="produto.id_planta" :options="formatedPlantaOptions" optionLabel="label" optionValue="value" :placeholder="t('select_factory')" />
                                </div>
                                <div class="full med lg:col-4 md:col-4 sm:col-4">
                                    <label for="UndMedida">{{t('unit_measurement')}}:</label>
                                    <InputText class="my-2" v-model="produto.unidade_medida" id="UndMedida" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-4 md:col-4 sm:col-4">
                                    <label for="vldDias">{{t('shelf_life')}}:</label>
                                    <InputNumber class="my-2" v-model="produto.validadedias" inputId="vldDias" :suffix="$t('product_shelflife_suffix')" />
                                </div>
                                <div class="full lg:col-4 md:col-4 sm:col-4">
                                    <label for="qntMin">{{t('minimum_quantity')}}:</label>
                                    <InputNumber class="my-2" v-model="produto.quantidademinima" inputId="qntMin" />
                                </div>
                            </div>
                        </div>
                        <div class="card p-0 col-12" style="width: 100%">
                            <div class="p-fluid grid flex-wrap col-12 my-4 p-0 mx-0">
                                <!-- Grid de Upload de Imagens -->
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">{{t('image')}}<br />{{t('image_type_Main')}}:</h4>
                                    <ImageUpload ref="imageUploader" @fileSelected="(file) => handleFileSelected(file, 'principal')" @clearImage="handleClearImage" :externalImages="imagePrinc" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">{{t('image')}}<br /> {{t('image_type_secondary')}} :</h4>
                                    <ImageUpload ref="imageUploader2" @fileSelected="(file) => handleFileSelected(file, 'secundaria')" @clearImage="handleClearImage" :externalImages="imageSec" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">{{t('infos')}}<br /> {{ t('image_type_additional') }} :</h4>
                                    <ImageUpload ref="imageUploader3" @fileSelected="(file) => handleFileSelected(file, 'info')" @clearImage="handleClearImage" :externalImages="imageInfo" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-7 grid justify-content-end flex-wrap">
                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="updateProduto" :disabled="mob"/>
                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteProdutoDialog = true" :disabled="mob"/>
                    <Button v-if="!visible" style="width: 15%" class="mr-6 flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="saveProduto" :disabled="mob"/>
                </div>

                <Dialog header="Deletar Produto" v-model:visible="deleteProdutoDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span>
                            Você tem certeza que deseja deletar o produto <b>{{ produto.id_produto }}</b> - <b>{{ produto.nome }}</b> ?</span
                        >
                    </div>

                    <template #footer>
                        <Button :label="$t('no')" icon="pi pi-times" @click="deleteProdutoDialog = false" class="p-button-text" />
                        <Button :label="$t('yes')" icon="pi pi-check" @click="deleteProduto" class="p-button-text" />
                    </template>
                </Dialog>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style scoped>
.overflow-scroll {
    overflow-x: auto !important;

    resize: none;
}

@media (max-width: 1024px) {
    .text-center {
        margin: 2px;
    }
}

.full {
    padding: 4.5px;
}

.titulo {
    white-space: pre-wrap;
    text-align: center;
}

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
