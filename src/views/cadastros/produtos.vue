<script setup>
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import imageUrl from '@/assets/images/placeholder4.png'
import clockurl from '@/assets/images/OIP.jpeg'

const produto = reactive({
    sku: '',
    planta: '',
    tipo: '',
    nome: '',
    descricao: '',
    especificacoes: '',
    unidadesdemedida: '',
    validade: '',
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
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Produto">

            </TabPanel>
            <TabPanel header="Adicionar Produto">
                <div class="grid">
                    <div class="p-fluid formgrid grid">
                        <div class="col-4">
                            <h4 class="mt-3">Descrição</h4>
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="nome">Nome</label>
                                    <InputText v-model="produto.nome" id="nome" type="text"></InputText>
                                </div>
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="sku">SKU</label>
                                    <InputText v-model="produto.sku" id="sku" type="text"></InputText>
                                </div>
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="tipo">Tipo</label>
                                    <Dropdown v-model="produto.tipo" :options="tipoProduto" optionLabel="nome"
                                        placeholder="Selecione um tipo" />
                                </div>
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="tipo">Plantas</label>
                                    <Dropdown v-model="produto.tipo" :options="plantas" optionLabel="nome"
                                        placeholder="Selecione um" />
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <h4 class="mt-3">Informações</h4>
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="nome">Descrição</label>
                                    <Textarea v-model="produto.descricao" autoResize rows="5" cols="30" />
                                </div>
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="sku">Especificação</label>
                                    <Textarea v-model="produto.especificacoes" autoResize rows="5" cols="30" />
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <h4 class="mt-3">Outros</h4>
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="UndMedida">Unidade de Medida</label>
                                    <InputText v-model="produto.unidadesdemedida" id="UndMedida" type="text">
                                    </InputText>

                                </div>
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="vldDias">Validade em dias</label>
                                    <InputText v-model="produto.validade" id="vldDias" type="text"></InputText>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-fluid formgrid grid">
                        <FileUpload name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)" :multiple="true"
                            accept="image/*" :maxFileSize="1000000" @select="onSelectedFiles">
                            <template #empty>
                                <div class="flex align-items-center justify-content-center flex-column">
                                
                                </div>
                            </template>
                        </FileUpload>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>