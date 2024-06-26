<script setup>
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import image1 from '@/assets/images/placeholder4.png'
import image2 from '@/assets/images/th.jpg'
import image3 from '@/assets/images/OIG1.jpg'

const toast = useToast();
const active = ref(1);
const saveProduto = () => {

    //veirficar data/rg valido/se o status for ativado e as permissoes/
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Produto cadastrado', life: 3000 });

}
const produto = reactive({
    sku: '',
    planta: '',
    tipo: '',
    nome: '',
    descricao: ' ',
    especificacoes: '',
    unidadesdemedida: '',
    validade: '',
    imagemPrincipal: ''
});
const tipoProduto = ref([
    { nome: 'EPI', key: 'epi' },
    { nome: 'Insumo', key: 'isn' },
    { nome: 'Consumivel', key: 'csn' },
])
const plantas = ref([
    { nome: 'Planta 1', key: 'p1' },
    { nome: 'Planta 2', key: 'p2' },
    { nome: 'Planta 3', key: 'p3' },
])
const ListaProduto = ref([
    {
        sku: 123,
        planta: 'Planta 1',
        tipo: 'EPI',
        nome: 'exemplo 1',
        descricao: ' teste',
        especificacoes: 'teste',
        unidadesdemedida: 'teste',
        validade: 22,
        image: image1
    },
    {
        sku: 456,
        planta: 'Planta 2',
        tipo: 'Insumo',
        nome: 'exemplo 2',
        descricao: 'teste ',
        especificacoes: 'teste',
        unidadesdemedida: 'teste',
        validade: 33,
        image: image2
    },
    {
        sku: 789,
        planta: 'Planta 3',
        tipo: 'Consumivel',
        nome: 'exemplo 3',
        descricao: 'teste ',
        especificacoes: 'teste',
        unidadesdemedida: 'teste',
        validade: 44,
        image: image3
    },
])
</script>

<template>
    <div class="card">
        <TabView>
            <TabPanel header="Listar Produto">
                <div class="col-12">
                    <DataTable :value="ListaProduto">
                        <Column field="nome" header="Nome"></Column>
                        <Column field="sku" header="SKU"></Column>
                        <Column header="Imagem">
                            <template #body="slotProps">
                                <img :src="slotProps.data.image" class="w-6rem border-round" />
                            </template>
                        </Column>
                    </DataTable>
                </div>

            </TabPanel>
            <TabPanel header="Adicionar Produto" v-model:activeIndex="active">
                <div class="grid">
                    <div class="p-fluid formgrid grid">
                        <div class="card">
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-6 md:col-6 sm:col-4 ">
                                    <label for="sku">SKU</label>
                                    <InputText v-model="produto.sku" id="sku" type="text"></InputText>
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
                                    <label for="sku">Especificação</label>
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
                                chooseLabel="Escolha Fotos" cancelLabel="Limpar">
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