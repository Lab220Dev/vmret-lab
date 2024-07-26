<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import '@vuepic/vue-datepicker/dist/main.css';
import imagePlaceholder from '@/assets/images/placeholder4.png';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

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

const selectedFile = ref(null);
const selectedSecFile = ref(null);
const selectedInfoFile = ref(null);

const imagePrinc = ref(imagePlaceholder);
const imageSec = ref(imagePlaceholder);
const imageInfo = ref(imagePlaceholder)

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

let produto = reactive({
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
    produto = event.data;
    await setImageIfValid(produto.imagem1, imagePrinc);
    await setImageIfValid(produto.imagem2, imageSec);
    await setImageIfValid(produto.imagemdetalhe, imageInfo);
    visible.value = true;
    active.value = 1;
    loadProdutos();
};

const loadProdutos = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        loading.value = true
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaProdutos.value = response.data;
        ListaProdutos.value.forEach(async (produto) => {
            produto.imagemUrl = await getImagem(produto.imagem1);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }finally {
        loading.value = false; // Desativando loading
    }
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('produtos/listarplanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantasoptions = response.data;
        formatedPlantaOptions = plantasoptions.map((plantasoptions) => ({
            label: `Planta ${plantasoptions.id_planta}`,
            value: plantasoptions.id_planta
        }));
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};

const saveProduto = async () => {
    const formData = new FormData();
    if (selectedFile.value) {
        const nomeArquivoPrincipal = `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}.png`;
        formData.append('imagem1', nomeArquivoPrincipal);
        formData.append('file_principal', selectedFile.value);
    }  

    if (selectedInfoFile.value) {
        const nomeArquivoInfo = `produto_${produto.nome}_${produto.codigo}_info${Date.now()}.png`;
        formData.append('imagemdetalhe', nomeArquivoInfo);
        formData.append('file_info', selectedFile.value);
    }

    if (selectedSecFile.value) {
        const nomeArquivoSecundario = `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}.png`;
        formData.append('imagem2', nomeArquivoSecundario);
        formData.append('file_secundario', selectedSecFile.value);
    }
    Object.entries(produto).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append('id_cliente', store.userIdCliente);

    try {
        loading.value = true
        await axios.post('/produtos/adicionar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto cadastrado', life: 3000 });
        loadProdutos();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar o produto:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'erro ao criar o produto', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const deleteProduto = async () => {
    let data = { id_produto: produto.id_produto };
    try {
        loading.value = true
        await axios.post('/produtos/deleteProduto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto Deletado', life: 3000 });
        deleteProdutoDialog.value = false;
        loadProdutos();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o produto', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const updateProduto = async () => {
    const formData = new FormData();

    Object.entries(produto).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (selectedFile.value) {
        formData.append('imagem1', `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}.png`);
        formData.append('file_principal', selectedFile.value);
    }

    if (selectedInfoFile.value) {
        formData.append('imagemdetalhe', `produto_${produto.nome}_${produto.codigo}_info${Date.now()}.png`);
        formData.append('file_info', selectedInfoFile.value);
    }

    if (selectedSecFile.value) {
        formData.append('imagem2', `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}.png`);
        formData.append('file_secundario', selectedSecFile.value);
    }

    try {
        loading.value = true
        await axios.post('/produtos/atualizar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto atualizado', life: 3000 });
        loadProdutos();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao atualizar o produto', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
};

const getImagem = async (filename) => {
    if (filename === '') {
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
            return `data:${mimeType};base64,${image}`;
        }
    } catch (error) {
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
    produto = {
        codigo: '',
        id_planta: '',
        id_tipoProduto: '',
        id_categoria: 71,
        nome: '',
        descricao: ' ',
        unidade_medida: '',
        validadedias: '',
        imagem1: '',
        imagem2: '',
        imagem3: '',
        imagem4: '',
        imagemdetalhe: ''
    };
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
    await fetchIdPlanta();
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Produtos">
                <div class="col-12">
                    <DataTable :value="ListaProdutos" selectionMode="single" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <Column header="Imagem" class="col-3">
                            <template #body="slotProps">
                                <div>
                                    <img :src="slotProps.data.imagemUrl" alt="Imagem do Produto" class="w-6rem border-round" />
                                </div>
                            </template>
                        </Column>
                        <Column field="codigo" header="SKU" class="col-2"></Column>
                        <Column field="nome" header="Nome" class="col-7"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Produto" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <!--form de cadastro de novo produto-->
                            <div class="p-fluid  formgrid grid m-0 p-0">
                                <div class="full lg:col-6 md:col-6 sm:col-6">
                                    <label for="codigo">SKU:</label>
                                    <InputText class="my-2" v-model="produto.codigo" id="codigo" type="text" ></InputText>
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
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'principal')" :externalImages="imagePrinc"  />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Imagem<br />Secundária:</h4>
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'secundaria')" :externalImages="imageSec" />
                                </div>
                                <div class="full lg:col-4 md:col-4 col-12 my-4 mx-0 p-0 text-center">
                                    <h4 class="titulo">Informações<br />Adicionais:</h4>
                                    <ImageUpload @fileSelected="(file) => handleFileSelected(file, 'info')" :externalImages="imageInfo"  />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-7 grid justify-content-end flex-wrap">
                    <Button v-if="visible" style="width: 15%;" class="flex align-items-center justify-content-center m-2" label="Atualizar" icon="pi pi-refresh" severity="primary" @click="updateProduto" />
                    <Button v-if="visible" style="width: 15%;" class="flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteProdutoDialog = true" />
                    <Button v-if="!visible" style="width: 15%; "class="mr-6 flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="saveProduto" />
                </div>

                <Dialog header="Deletar Produto" v-model:visible="deleteProdutoDialog" style="width: 400px" :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
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

<style>
.overflow-scroll {
    overflow: scroll;
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
