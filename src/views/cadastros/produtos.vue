<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import '@vuepic/vue-datepicker/dist/main.css';
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { useDataStore } from '@/store/dataStore.js';

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const dataStore = useDataStore();
const store = useAuthStore();

const toast = useToast();
const active = ref(0);
const loading = ref(false);
let plantasoptions = ref([]);
let formatedPlantaOptions = ref([]);
const tipoProduto = ref([
    { label: 'EPI', value: 1 },
    { label: 'Insumo', value: 2 },
    { label: 'Consumivel', value: 3 }
]);
const currentPage = ref(1);
const pageSize = 10;
const totalRecords = ref(0);

const selectedFile = ref(null);
const selectedSecFile = ref(null);
const selectedInfoFile = ref(null);

const imagePrinc = ref(imagePlaceholder);
const imageSec = ref(imagePlaceholder);
const imageInfo = ref(imagePlaceholder);

const ListaProdutos = ref([]);
const deleteProdutoDialog = ref(false);
const visible = ref(false);

const handleFileSelected = (file, type) => {
    if (type === 'principal') {
        selectedFile.value = file;
    } else if (type === 'secundaria') {
        selectedSecFile.value = file;
    } else if (type === 'info') {
        selectedInfoFile.value = file;
    }
};

const produto = reactive({
    codigo: '',
    id_planta: '',
    id_tipoProduto: '',
    id_categoria: 71,
    nome: '',
    descricao: ' ',
    unidade_medida: '',
    validadedias: ''
});

const setImageIfValid = async (image, targetRef) => {
    if (image) {
        targetRef.value = await getImagem(image);
    } else {
        targetRef.value = null;
    }
};

const onRowSelect = async (event) => {
    Object.assign(produto, event.data);
    await setImageIfValid(produto.imagem1, imagePrinc);
    await setImageIfValid(produto.imagem2, imageSec);
    await setImageIfValid(produto.imagemdetalhe, imageInfo);
    visible.value = true;
    active.value = 1;
    loadProdutos();
};

const loadProdutos = async (page = 1) => {
    const searchTerm = filters.value.global.value || ''; // Pega o valor do filtro global
    if (searchTerm.length >= 3 || searchTerm === '') {
    const data = {
        id_cliente: store.userIdCliente,
        page,
        pageSize,
        searchTerm // Passa o termo de busca
    };
    try {
        loading.value = true;
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });

        ListaProdutos.value = response.data.produtos;
        totalRecords.value = response.data.totalRecords;

        await loadImagens(ListaProdutos.value);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    } finally {
        loading.value = false;
    }
}
};

const debounceTimeout = ref(null); 
// Filtro local 
watch(
    () => filters.value.global.value, 
    (newValue, oldValue) => {
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value); //Limpa o timeout anterior
        }

        // espera 2 segundos após parar de digitar
        debounceTimeout.value = setTimeout(() => {
            loadProdutos(currentPage.value); // Chama a função de busca
        }, 1000); // ex : 2000ms (2 segundos)
    },
    { immediate: true } // Chama a busca se tiver um valor no filtro
);

// Função para carregar imagens apenas dos produtos visíveis na página atual
const loadImagens = async (produtos) => {
    for (const produto of produtos) {
        produto.imagemUrl = await getImagem(produto.imagem1);
    }
};

// Função de mudança de página no DataTable
const onPageChange = (event) => {
    currentPage.value = event.page + 1;
    loadProdutos(currentPage.value);
};

const loadData = async () => {
    try {
        formatedPlantaOptions.value = dataStore.plantas || (await dataStore.fetchPlantas());
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
};

const saveProduto = async () => {
    const formData = new FormData();
    if (selectedFile.value) {
        const fileType = selectedFile.value.type; // Obtém o tipo MIME do arquivo
        const fileExtension = fileType === 'image/jpeg' ? '.jpg' : '.png'; // Define a extensão com base no tipo MIME
        const nomeArquivoPrincipal = `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}${fileExtension}`;
        formData.append('imagem1', nomeArquivoPrincipal);
        formData.append('file_principal', selectedFile.value);
    }

    if (selectedInfoFile.value) {
        const fileType = selectedInfoFile.value.type;
        const fileExtension = fileType === 'image/jpeg' ? '.jpg' : '.png';
        const nomeArquivoInfo = `produto_${produto.nome}_${produto.codigo}_info${Date.now()}${fileExtension}`;
        formData.append('imagemdetalhe', nomeArquivoInfo);
        formData.append('file_info', selectedInfoFile.value);
    }

    if (selectedSecFile.value) {
        const fileType = selectedSecFile.value.type;
        const fileExtension = fileType === 'image/jpeg' ? '.jpg' : '.png';
        const nomeArquivoSecundario = `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}${fileExtension}`;
        formData.append('imagem2', nomeArquivoSecundario);
        formData.append('file_secundario', selectedSecFile.value);
    }

    Object.entries(produto).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : String(value));
    });
    formData.append('id_cliente', store.userIdCliente);

    try {
        loading.value = true;
        const response = await axios.post('/produtos/adicionar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto cadastrado', life: 3000 });
        dataStore.invalidatProdutoCache();
        loadProdutos();
        resetForm();
        active.value = 0;
    } catch (error) {
        console.error('Erro ao adicionar o produto:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao criar o produto', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
        active.value = 0; // Mude a aba para listar produtos
    }
};

const deleteProduto = async () => {
    let data = {
        id_produto: produto.id_produto,
        id_usuario: store.userId,
        id_cliente: store.userIdCliente
    };
    try {
        loading.value = true;
        await axios.post('/produtos/deleteProduto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto Deletado', life: 3000 });
        dataStore.invalidatProdutoCache();
        deleteProdutoDialog.value = false;
        loadProdutos();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o produto', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const updateProduto = async () => {
    const formData = new FormData();

    // Adiciona os dados do produto ao FormData
    Object.entries(produto).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : String(value));
    });

    // Função para obter a extensão do arquivo com base no tipo MIME
    const getFileExtension = (fileType) => {
        if (fileType === 'image/jpeg') return '.jpg';
        if (fileType === 'image/png') return '.png';
        return ''; // Default if file type is not supported
    };

    if (selectedFile.value) {
        formData.delete('imagem1');
        const fileType = selectedFile.value.type; // Obtém o tipo MIME do arquivo
        const fileExtension = getFileExtension(fileType); // Obtém a extensão com base no tipo MIME
        formData.append('imagem1', `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}${fileExtension}`);
        formData.append('file_principal', selectedFile.value);
    }

    if (selectedInfoFile.value) {
        formData.delete('imagemdetalhe');
        const fileType = selectedInfoFile.value.type;
        const fileExtension = getFileExtension(fileType);
        formData.append('imagemdetalhe', `produto_${produto.nome}_${produto.codigo}_info${Date.now()}${fileExtension}`);
        formData.append('file_info', selectedInfoFile.value);
    }

    if (selectedSecFile.value) {
        formData.delete('imagem2');
        const fileType = selectedSecFile.value.type;
        const fileExtension = getFileExtension(fileType);
        formData.append('imagem2', `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}${fileExtension}`);
        formData.append('file_secundario', selectedSecFile.value);
    }

    try {
        loading.value = true;
        await axios.post('/produtos/atualizar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto atualizado', life: 3000 });
        dataStore.invalidatProdutoCache();
        loadProdutos();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao atualizar o produto', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};

const getImagem = async (filename) => {
    if (!filename) {
        return imagePlaceholder;
    }
    try {
        const response = await axios.get(`/image/produto/${store.userIdCliente}/${filename}`, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        if (response.status === 200) {
            const { image, mimeType } = response.data;
            const imageUrl = `data:${mimeType};base64,${image}`;
            return imageUrl;
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        return imagePlaceholder;
    }
};

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadProdutos();
        visible.value = false;
    }
});

const resetForm = () => {
    delete produto.imagem1;
    delete produto.imagem2;
    delete produto.imagemdetalhe;
    Object.assign(produto, {
        codigo: '',
        id_planta: '',
        id_tipoProduto: '',
        id_categoria: '',
        nome: '',
        descricao: ' ',
        unidade_medida: '',
        validadedias: 0
    });
    selectedFile.value = null;
    selectedSecFile.value = null;
    selectedInfoFile.value = null;
    imagePrinc.value = imagePlaceholder;
    imageSec.value = imagePlaceholder;
    imageInfo.value = imagePlaceholder;
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(async () => {
    await loadProdutos();
    loadData();
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
                        <div class="card">
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
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'principal')" :externalImages="imagePrinc" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Imagem<br />Secundária:</h4>
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'secundaria')" :externalImages="imageSec" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Informações<br />Adicionais:</h4>
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'info')" :externalImages="imageInfo" />
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
