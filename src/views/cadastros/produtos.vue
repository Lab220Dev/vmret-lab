<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import imageUrl from '@/assets/images/placeholder4.png';
import clockurl from '@/assets/images/OIP.jpeg';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';

const store = useAuthStore();
const toast = useToast();
const active = ref(0);
let plantasoptions = ref([]);
let formatedPlantaOptions = ref([]);
const tipoProduto = ref([
    { label: 'EPI', value: 1 },
    { label: 'Insumo', value: 2 },
    { label: 'Consumivel', value: 3 }
]);

const selectedFile = ref(null);
const selectedFilesSecondary = ref([]);
const imagemProduto = ref(imagePlaceholder);

const handleFileSelectedSecondary = (file) => {
    selectedFilesSecondary.value.push(file);
};

const handleFileSelected = (file) => {
    selectedFile.value = file;
};

let produto = reactive({
    codigo: '',
    id_planta: '',
    id_tipoProduto: '',
    id_categoria: 71,
    nome: '',
    descricao: ' ',
    unidade_medida: '',
    validadedias: '',
    nomeArquivo: '',
});

const ListaProdutos = ref([]);
const deleteProdutoDialog = ref(false);
const visible = ref(false);

const saveProduto = async () => {
    const formData = new FormData();
    if (selectedFile.value) {
        const nomeArquivoPrincipal = `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}`;
        formData.append('imagem1', nomeArquivoPrincipal);
        formData.append('file_principal', selectedFile.value);
    }


    if (selectedFilesSecondary.value && Array.isArray(selectedFilesSecondary.value)) {
        selectedFilesSecondary.value.forEach((file, index) => {
            const nomeArquivoSecundario = `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}`;
            formData.append(`imagem${index+2}`, nomeArquivoSecundario);
            formData.append(`file_secundario_${index}`, file);
        });
    }
    Object.entries(produto).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append('id_cliente', store.userIdCliente);

    try {
        await axios.post('/produtos/adicionar', formData,
            {
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
    }
    active.value = 0;
};

const onRowSelect = (event) => {
    produto = event.data;
    active.value = 1;
};
const loadProdutos = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaProdutos.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
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

onMounted(async () => {
    await loadProdutos();
    await fetchIdPlanta();
    ListaProdutos.value.forEach(async (produto) => {
        produto.imagemUrl = await getImagem(produto.imagem1);
    });
});

const deleteProduto = async () => {
    let data = { id_produto: produto.id_produto };
    try {
        await axios.post('/produtos/deleteProduto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        const index = ListaProdutos.value.findIndex((f) => f.id_produto === produto.id_produto);
        if (index !== -1) {
            ListaProdutos.value.splice(index, 1);
        }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto Deletado', life: 3000 });
        deleteProdutoDialog.value = false;

        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o produto', life: 3000 });
    }
    active.value = 0;
};
const getImagem = async (filename) => {
    if(filename===""){
        return imagePlaceholder;
    }
    try {
        const response = await axios.get(`/image/produtos/${store.userIdCliente}/${filename}`, {
            headers: {
                Authorization: `Bearer ${store.token}`
            },
        });
        const { image, mimeType } = response.data;
        return `data:${mimeType};base64,${image}`;
    } catch (error) {   
        console.error("Erro ao carregar imagem:", error);
        return imagePlaceholder; 
    }
};
const resetForm = () => {
    produto.id_cliente = '';
    produto.codigo = '';
    produto.id_produto = '';
    produto.id_cliente = '';
    produto.id_categoria = '';
    produto.nome = '';
    produto.descricao = '';
    produto.especificacoes = '';
    produto.validadedias = '';
    produto.id_planta = '';
    produto.id_tipoProduto = '';
    produto.unidade_medida = '';
    selectedFile.value = null;
    selectedFilesSecondary.value = [];
};
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Produto">
                <div class="col-12">
                    <DataTable :value="ListaProdutos" selectionMode="single" stripedRows dataKey="id"
                        :metaKeySelection="false" @rowSelect="onRowSelect">
                        <Column header="Imagem" class="col-3">
                            <template #body="slotProps">
                                <div>
                                    <img :src="slotProps.data.imagemUrl"
                                        alt="Imagem do Produto" class="w-6rem border-round" />
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
                    <div class="p-fluid formgrid grid">
                        <div class="card">
                            <!--form de cadastro de novo produto-->
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="codigo">SKU</label>
                                    <InputText v-model="produto.codigo" id="codigo" type="text"></InputText>
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="nome">Nome</label>
                                    <InputText v-model="produto.nome" id="nome" type="text"></InputText>
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="nome">Descrição</label>
                                    <Textarea v-model="produto.descricao" class="overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="codigo">Especificação</label>
                                    <Textarea v-model="produto.especificacoes" class="overflow-scroll" rows="5"
                                        cols="30" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="tipo">Tipo</label>
                                    <Dropdown v-model="produto.id_tipoProduto" :options="tipoProduto"
                                        optionLabel="label" optionValue="value" placeholder="Selecione um tipo" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="tipo">Planta</label>
                                    <Dropdown v-model="produto.id_planta" :options="formatedPlantaOptions"
                                        optionLabel="label" optionValue="value" placeholder="Selecione um" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="UndMedida">Unidade de Medida</label>
                                    <InputText v-model="produto.unidade_medida" id="UndMedida" type="text"> </InputText>
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4">
                                    <label for="vldDias">Validade em dias</label>
                                    <InputNumber v-model="produto.validadedias" inputId="vldDias" suffix=" dias" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-fluid formgrid grid">
                        <div class="border-right-2 surface-border field lg:col-4 md:col-4 sm:col-4">
                            <h3 class="text-center">Imagem Principal</h3>
                            <ImageUpload @fileSelected="handleFileSelected" />
                        </div>
                        <div class=" field surface-border lg:col-4 md:col-4 sm:col-4">
                            <h3 class="text-center">Imagens Secundaria</h3>
                            <ImageUpload @fileSelected="handleFileSelectedSecondary" />
                        </div>
                        <div class="surface-border border-left-2 field lg:col-4 md:col-4 sm:col-4">
                            <h3 class="text-center">Informações Adicionais</h3>
                            <ImageUpload @fileSelected="handleFileSelectedSecondary" />
                        </div>
                    </div>

                </div>
                <div class="grid justify-content-end flex-wrap">
                    <Button class="flex align-items-center justify-content-center m-2" label="Excluir"
                        icon="pi pi-trash" severity="danger" @click="deleteProdutoDialog = true" />
                    <Button class="flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check"
                        severity="info" @click="saveProduto" />
                </div>
                <Dialog header="Deletar Produto" v-model:visible="deleteProdutoDialog" style="width: 400px"
                    :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            Você tem certeza que deseja deletar o produto <b>{{ produto.id_produto }}</b> - <b>{{
                                produto.nome
                            }}</b> ?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" @click="deleteProdutoDialog = false"
                            class="p-button-text" />
                        <Button label="Sim" icon="pi pi-check" @click="deleteProduto" class="p-button-text" />
                    </template>
                </Dialog>
            </TabPanel>
        </TabView>
    </div>
</template>

<style>
.overflow-scroll {
    overflow: scroll !important;
    resize: none;
}
</style>
