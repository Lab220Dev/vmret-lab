<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { useDataStore } from '@/store/dataStore.js';
import produtoService from '@/services/produtoService';
import { resetProdutoForm } from '@/helpers/formHelper';
import { getFileExtension } from '@/helpers/HelperUtils';
import { enrichProdutoData } from '@/helpers/HelperProduto.js';

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que usa o modo 'CONTAINS'
});

// Inicializando stores para autenticação e dados
const dataStore = useDataStore();
const store = useAuthStore();

// Inicializando variáveis de controle de interface
const toast = useToast();
const active = ref(0);
const loading = ref(false);
let formatedPlantaOptions = ref([]);
const tipoProduto = ref([
    { label: 'EPI', value: 1 },
    { label: 'Insumo', value: 2 },
    { label: 'Consumivel', value: 3 }
]);

// Controle de paginação
const currentPage = ref(1); 
const pageSize = 10; // Tamanho da página
const totalRecords = ref(0); // Total de registros

// Referências para os campos de upload de imagem
const imageUploader = ref(null);
const imageUploader2 = ref(null);
const imageUploader3 = ref(null);

// Referências para os arquivos selecionados
const selectedFile = ref(null);
const selectedSecFile = ref(null);
const selectedInfoFile = ref(null);

// Imagens de placeholder para os produtos
const imagePrinc = ref(imagePlaceholder);
const imageSec = ref(imagePlaceholder);
const imageInfo = ref(imagePlaceholder);

// Lista de produtos
const ListaProdutos = ref([]);

// Controle de diálogo de exclusão de produto
const deleteProdutoDialog = ref(false);

// Visibilidade de componentes
const visible = ref(false);

// Função chamada quando um arquivo é selecionado para upload
const handleFileSelected = (file, type) => {
    if (type === 'principal') { // Se o tipo for 'principal', armazena o arquivo principal
        selectedFile.value = file;
    } else if (type === 'secundaria') { // Se o tipo for 'secundaria', armazena o arquivo secundário
        selectedSecFile.value = file;
    } else if (type === 'info') { // Se o tipo for 'info', armazena o arquivo de informações
        selectedInfoFile.value = file;
    }
};

// Objeto reativo para armazenar os dados do produto
const produto = reactive({
    codigo: '', // Código do produto
    id_planta: '', // ID da planta
    id_tipoProduto: '', // ID do tipo de produto
    id_categoria: 71, // ID da categoria (fixo)
    nome: '', // Nome do produto
    descricao: ' ', // Descrição do produto
    unidade_medida: '', // Unidade de medida
    validadedias: '' // Validade em dias
});

// Função para definir a imagem se for válida
const setImageIfValid = async (image, targetRef) => {
    if (image) { // Se houver imagem
        targetRef.value = await getImagem(image); // Obtém a imagem e atribui ao ref alvo
    } else {
        targetRef.value = null; // Caso contrário, define como null
    }
};

// Função chamada quando uma linha do DataTable é selecionada
const onRowSelect = async (event) => {
    Object.assign(produto, event.data); // Atribui os dados do produto selecionado ao objeto 'produto'
    await setImageIfValid(produto.imagem1, imagePrinc); // Define a imagem principal
    await setImageIfValid(produto.imagem2, imageSec); // Define a imagem secundária
    await setImageIfValid(produto.imagemdetalhe, imageInfo); // Define a imagem de detalhes
    visible.value = true; // Torna o formulário visível
    active.value = 1; // Ativa a aba de edição
    loadProdutos(); // Carrega a lista de produtos
};

// Função para carregar os produtos com base na página atual e filtro
const loadProdutos = async (page = 1) => {
    const searchTerm = filters.value.global.value || '';
    const data = { id_cliente: store.userIdCliente, page, pageSize, searchTerm };

    try {
        loading.value = true;
        const response = await produtoService.listarProdutos(data, store.token);
        ListaProdutos.value = response.data.produtos;
        totalRecords.value = response.data.totalRecords;
        await loadImagens(ListaProdutos.value);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const debounceTimeout = ref(null);
// Filtro local
watch(
    () => filters.value.global.value,
    (newValue, oldValue) => {
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value); // Limpa o timeout anterior
        }

        // Espera 2 segundos após parar de digitar
        debounceTimeout.value = setTimeout(() => {
            loadProdutos(currentPage.value); // Chama a função de busca
        }, 1000); // Ex: 2000ms (2 segundos)
    },
    { immediate: true } // Chama a busca imediatamente se já houver valor no filtro
);

// Função para carregar as imagens dos produtos visíveis
const loadImagens = async (produtos) => {
    for (const produto of produtos) {
        produto.imagemUrl = await getImagem(produto.imagem1); // Atribui a URL da imagem ao produto
    }
};

// Função chamada ao mudar a página no DataTable
const onPageChange = (event) => {
    currentPage.value = event.page + 1; // Atualiza a página atual
    loadProdutos(currentPage.value); // Carrega os produtos da nova página
};

// Função para carregar os dados iniciais (plantas)
const loadData = async () => {
    try {
        formatedPlantaOptions.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega as opções de plantas
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Exibe erro no console
    }
};

// Função para salvar um novo produto
const saveProduto = async () => {
    try {
        loading.value = true;
        await produtoService.adicionarProduto(
            enrichProdutoData(produto, store.userId, store.userIdCliente),
            {
                selectedFile: selectedFile.value,
                selectedSecFile: selectedSecFile.value,
                selectedInfoFile: selectedInfoFile.value
            }
        );
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto salvo com sucesso!', life: 3000 });
        loadProdutos();
        resetForm();
        active.value = 0;
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar produto.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Função para deletar um produto
const deleteProduto = async () => {
    const data = {
        id_produto: produto.id_produto,
        id_usuario: store.userId,
        id_cliente: store.userIdCliente
    };

    try {
        loading.value = true;
        await produtoService.deletarProduto(data, store.token);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto deletado com sucesso!', life: 3000 });
        loadProdutos();
        resetProdutoForm(produto, [imagePrinc, imageSec, imageInfo]);
        deleteProdutoDialog.value = false;
        active.value = 0;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar produto.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const updateProduto = async () => {
  try {
    loading.value = true;
    await produtoService.atualizarProduto(
      enrichProdutoData(produto, store.userId, store.userIdCliente),
      {
        selectedFile: selectedFile.value,
        selectedSecFile: selectedSecFile.value,
        selectedInfoFile: selectedInfoFile.value,
      }
    );
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado com sucesso!', life: 3000 });
    loadProdutos();
    resetForm();
    active.value = 0;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar produto.', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const getImagem = async (filename) => {
    if (!filename) return imagePlaceholder;

    try {
        const response = await produtoService.obterImagem(store.userIdCliente, filename);
        if (response.status === 200) {
            const { image, mimeType } = response.data;
            return `data:${mimeType};base64,${image}`;
        }
    } catch (error) {
        console.error('Erro ao carregar imagem:', error);
    }
    return imagePlaceholder;
};
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm(); // Reseta o formulário quando a aba ativa mudar para 0
        loadProdutos(); // Carrega novamente a lista de produtos
        visible.value = false; // Torna o produto invisível
    }
});

const resetForm = () => {
    resetProdutoForm(produto, [imagePrinc, imageSec, imageInfo]);
    imageUploader.value?.clearImageData();
    imageUploader2.value?.clearImageData();
    imageUploader3.value?.clearImageData();
};

const handleRowSelection = async (event) => {
    await onRowSelect(event); // Lida com a seleção de uma linha na tabela
};

onMounted(async () => {
    await loadProdutos(); // Carrega a lista de produtos ao montar o componente
    loadData(); // Carrega dados adicionais ao montar o componente
});

</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Produtos">
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
                        ><!--lazy-->
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>Total de registros: {{ totalRecords }}</span>
                                </div>

                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> Nenhum produto adicionado. </template>
                        <Column header="Imagem" class="col-3">
                            <template #body="slotProps">
                                <div>
                                    <img :src="slotProps.data.imagemUrl" alt="Imagem do Produto" class="w-6rem border-round" />
                                </div>
                            </template>
                        </Column>
                        <Column field="codigo" sortable header="SKU" class="col-2"></Column>
                        <Column field="nome" sortable header="Nome" class="col-7"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? 'Editar Produto' : 'Adicionar Produto'">
                <div class="grid">
                    <div class="col-12">
                        <div class="my-6">
                            <!--form de cadastro de novo produto-->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="codigo">SKU:</label>
                                    <InputText class="my-2" v-model="produto.codigo" id="codigo" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="nome">Nome:</label>
                                    <InputText class="my-2" v-model="produto.nome" id="nome" type="text"></InputText>
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="nome">Descrição:</label>
                                    <Textarea v-model="produto.descricao" class="my-2 overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="codigo">Especificação:</label>
                                    <Textarea v-model="produto.especificacoes" class="my-2 overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="tipo">Tipo:</label>
                                    <Dropdown class="my-2" v-model="produto.id_tipoProduto" :options="tipoProduto" optionLabel="label" optionValue="value" placeholder="Selecione um tipo" />
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="tipo">Planta:</label>
                                    <Dropdown class="my-2" v-model="produto.id_planta" :options="formatedPlantaOptions" optionLabel="label" optionValue="value" placeholder="Selecione uma planta" />
                                </div>
                                <div class="full med lg:col-6 md:col-6 sm:col-6">
                                    <label for="UndMedida">Unidade de Medida:</label>
                                    <InputText class="my-2" v-model="produto.unidade_medida" id="UndMedida" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="vldDias">Validade:</label>
                                    <InputNumber class="my-2" v-model="produto.validadedias" inputId="vldDias" suffix=" dias" />
                                </div>
                            </div>
                        </div>
                        <div class="card p-0 col-12" style="width: 100%">
                            <div class="p-fluid grid flex-wrap col-12 my-4 p-0 mx-0">
                                <!-- Grid de Upload de Imagens -->
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Imagem<br />Principal:</h4>
                                    <ImageUpload ref="imageUploader" @fileSelected="(file) => handleFileSelected(file, 'principal')" @clearImage="handleClearImage" :externalImages="imagePrinc" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Imagem<br />Secundária:</h4>
                                    <ImageUpload ref="imageUploader2" @fileSelected="(file) => handleFileSelected(file, 'secundaria')" @clearImage="handleClearImage" :externalImages="imageSec" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Informações<br />Adicionais:</h4>
                                    <ImageUpload ref="imageUploader3" @fileSelected="(file) => handleFileSelected(file, 'info')" @clearImage="handleClearImage" :externalImages="imageInfo" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-7 grid justify-content-end flex-wrap">
                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="updateProduto" />
                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteProdutoDialog = true" />
                    <Button v-if="!visible" style="width: 15%" class="mr-6 flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="saveProduto" />
                </div>

                <Dialog header="Deletar Produto" v-model:visible="deleteProdutoDialog" style="width: 400px" :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span>
                            Você tem certeza que deseja deletar o produto <b>{{ produto.id_produto }}</b> - <b>{{ produto.nome }}</b> ?</span
                        >
                    </div>

                    <template #footer>
                        <Button label="Não" icon="pi pi-times" @click="deleteProdutoDialog = false" class="p-button-text" />
                        <Button label="Sim" icon="pi pi-check" @click="deleteProduto" class="p-button-text" />
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
