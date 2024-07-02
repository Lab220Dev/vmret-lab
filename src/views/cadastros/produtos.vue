<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import imagePlaceholder from '@/assets/images/placeholder4.png';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();
const active = ref(1);

const tipoProduto = ref([
    { nome: 'EPI', key: 'epi' },
    { nome: 'Insumo', key: 'isn' },
    { nome: 'Consumivel', key: 'csn' },
]);

const plantas = ref([
    { nome: 'Planta 1', key: 'p1' },
    { nome: 'Planta 2', key: 'p2' },
    { nome: 'Planta 3', key: 'p3' },
]);

let produto = reactive({
    codigo: '',
    planta: '',
    tipo: '',
    nome: '',
    descricao: ' ',
    especificacoes: '',
    unidadesdemedida: '',
    validade: '',
    imagemPrincipal: ''
});

const ListaProdutos = ref([]);

const saveProduto = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto cadastrado', life: 3000 });
};

const onRowSelect = (event) => {
    produto = event.data;
    active.value = 1;
};

const onTemplatedUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};

const loadProdutos = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        ListaProdutos.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
};

onMounted(() => {
    loadProdutos();
});
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Produto">
                <div class="col-12">
                    <DataTable :value="ListaProdutos" selectionMode="single" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                        <Column header="Imagem" class="col-3">
                            <template #body="slotProps">
                                <div>
                                    <img :src="slotProps.data.image ? slotProps.data.image : imagePlaceholder" class="w-6rem border-round" />
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
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="codigo">SKU</label>
                                    <InputText v-model="produto.codigo" id="codigo" type="text"></InputText>
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="nome">Nome</label>
                                    <InputText v-model="produto.nome" id="nome" type="text"></InputText>
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="nome">Descrição</label>
                                    <Textarea v-model="produto.descricao" class="overflow-scroll" rows="5" cols="30" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="codigo">Especificação</label>
                                    <Textarea v-model="produto.especificacoes" class="overflow-scroll" rows="5"
                                        cols="30" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="tipo">Tipo</label>
                                    <Dropdown v-model="produto.tipo" :options="tipoProduto" optionLabel="nome"
                                        placeholder="Selecione um tipo" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="tipo">Planta</label>
                                    <Dropdown v-model="produto.tipo" :options="plantas" optionLabel="nome"
                                        placeholder="Selecione um" />
                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="UndMedida">Unidade de Medida</label>
                                    <InputText v-model="produto.unidadesdemedida" id="UndMedida" type="text">
                                    </InputText>

                                </div>
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="vldDias">Validade em dias</label>
                                    <InputNumber v-model="produto.validade" inputId="vldDias" suffix=" dias" />

                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="p-fluid formgrid grid">
                        <div class="field lg:col-12 md:col-6 sm:col-4 ">
                            <h3>Imagem Principal</h3>
                            <FileUpload name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)"
                                accept="image/*" :multiple="false" :maxFileSize="1000000" @select="onSelectedFiles"
                                chooseLabel="Escolha uma Foto" cancelLabel="Limpar">
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">

                                    </div>
                                </template>
                            </FileUpload>
                        </div>
                        <div class="field lg:col-12 md:col-6 sm:col-4 ">
                            <h3>Imagens Secundaria</h3>
                            <FileUpload name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)"
                                :multiple="true" accept=" image/*" :maxFileSize="1000000" @select="onSelectedFiles"
                                chooseLabel="Escolha uma Foto" cancelLabel="Limpar">
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">

                                    </div>
                                </template>
                            </FileUpload>
                        </div>
                        <div class="field lg:col-12 md:col-6 sm:col-4 ">
                            <h3>Informações Adicionais</h3>
                            <FileUpload name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)"
                                :multiple="false" accept=" image/*" :maxFileSize="1000000" @select="onSelectedFiles"
                                chooseLabel="Escolha uma Foto" cancelLabel="Limpar">
                                <template #empty>
                                    <div class="flex align-items-center justify-content-center flex-column">

                                    </div>
                                </template>
                            </FileUpload>
                        </div>

                    </div>
                </div>
                <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveProduto" />
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