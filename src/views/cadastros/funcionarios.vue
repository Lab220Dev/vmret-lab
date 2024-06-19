<script setup>
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FuncionarioService } from '@/service/FuncionarioService';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import imageUrl from '@/assets/images/placeholder4.png'
import clockurl from '@/assets/images/OIP.jpeg'

const toast = useToast();
const status = ref([
    { name: 'Ativo', status: true },
    { name: 'Inativo', status: false }
]);
const centroCusto = ref([
    { name: "Centro de Custo 1", key: "cc1" },
    { name: "Centro de Custo 2", key: "cc2" },
]);
const SetorDiretoria = ref([
    { name: "Desenvolvimento", key: "dev" },
    { name: "Administração", key: "adm" },
]);
const hieraquiaoptions = ref([
    { name: "Senior" },
    { name: "Junior" },
    { name: "Pleno" }
]);
const funcionario = reactive({
    Matricula: '',
    Nome: '',
    Hash1: '',
    Hash2: '',
    DataAdmissao: new Date().toDateString(),
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    CentrodeCusto: '',
    planta: '',
    Setor: '',
    Funcao: '',
    status: '',
    HoraInicio: '',
    HoraFim: '',
    dias: [],
    itemsSelecionadosSetor: [],
    itemsSelecionadosFuncionario: [],
    file: []
})
const selectedProduct = ref([]);

const ItensSetorDev = ref([
    { name: "Mouse", sku: "mse", prazo: 3, quantidade: 1 },
    { name: "Teclado", sku: "tcd", prazo: 3, quantidade: 1 },
    { name: "Microfone", sku: "mic", prazo: 3, quantidade: 1 },
    { name: "Fone de ouvido", sku: "hdf", prazo: 3, quantidade: 1 },
    { name: "Cabo USB", sku: "cusb", prazo: 3, quantidade: 1 },

])
const ItensSetorAdm = ref([
    { name: "Post-it", sku: "pit", prazo: 0, quantidade: 0 },
    { name: "caderno", sku: "cdn", prazo: 0, quantidade: 0 },
    { name: "corretivo", sku: "crr", prazo: 0, quantidade: 0 },
    { name: "clipe de papel", sku: "clp", prazo: 0, quantidade: 0 },
])

const ListaFuncionarios = ref([
    { "Nome": "Magdalen", "matricula": 80700 },
    { "Nome": "Hillary", "matricula": 12228 },
    { "Nome": "Aristotle", "matricula": 95795 },
    { "Nome": "Kiele", "matricula": 24045 },
    { "Nome": "Robinetta", "matricula": 28333 },
    { "Nome": "Lionello", "matricula": 47629 },
    { "Nome": "Carling", "matricula": 15321 },
    { "Nome": "Sebastiano", "matricula": 20196 },
    { "Nome": "Cointon", "matricula": 58933 },
    { "Nome": "Delbert", "matricula": 32068 }
]);
const visible = ref(false);
const metaKey = ref(true);
const active = ref(0);
const saveFuncionario = () => {
    //veirficar data/rg valido/se o status for ativado e as permissoes/
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });

}
const SalvarProduto = () =>{
    funcionario.itemsSelecionadosFuncionario.push(selectedProduct.value);
    visible.value=false;
}
const onRowSelect = (event) => {
    funcionario.Nome = event.data.Nome;
    funcionario.Matricula = event.data.matricula;
    active.value = 1;
};
const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
</script>

<template>
    <TabView v-model:activeIndex="active">
        <TabPanel header="Listar Funcionário">
            <div class="card">
                <DataTable :value="ListaFuncionarios" selectionMode="single" stripedRows tableStyle="min-width: 50rem"
                    dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                    <Column field="Nome" header="Nome"></Column>
                    <Column field="matricula" header="Matrícula"></Column>
                </DataTable>
            </div>
        </TabPanel>

        <TabPanel header="Adicionar Funcionário">
            <div class="grid">
                <div class="col-12">
                    <div class="card">
                        <!--form de cadastro de novo funcionario-->
                        <div class="p-fluid formgrid grid">
                            <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                <label for="name">Nome</label>
                                <InputText v-model="funcionario.Nome" id="name" type="text"></InputText>
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="matricula">Matrícula</label>
                                <InputText id="matricula" v-model="funcionario.Matricula" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="Hash">Hash 1</label>
                                <InputText disabled id="Hash" v-model="funcionario.Hash1" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="Hash2">Hash 2</label>
                                <InputText disabled id="Hash2" v-model="funcionario.Hash2" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="DataAdmissao">Data de Admissao</label>
                                <VueDatePicker v-model="funcionario.DataAdmissao" showIcon :showOnFocus="false"
                                    dateFormat="dd/mm/yy" locale="pt-BR" cancelText="Cancelar"
                                    selectText="Selecionar" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="cpf">CPF</label>
                                <InputMask v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="rg">RG</label>
                                <InputMask id="rg" v-model="funcionario.RG" mask="99.999.999-*" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="ctps">CTPS</label>
                                <InputMask id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="email">E-mail</label>
                                <InputText id="email" v-model="funcionario.email" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="perfil">Centro de Custo</label>
                                <Dropdown v-model="funcionario.CentrodeCusto" :options="centroCusto" optionLabel="name"
                                    placeholder="Selecione Um " />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="planta">Planta</label>
                                <InputText id="planta" v-model="funcionario.planta" type="text" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="setor">Setor/Diretoria</label>
                                <Dropdown v-model="funcionario.Setor" :options="SetorDiretoria" optionLabel="name"
                                    placeholder="Selecione o Setor" />
                            </div>
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="funcao">Função/Nivel Hierarquico</label>
                                <Dropdown v-model="funcionario.Funcao" :options="hieraquiaoptions" optionLabel="name"
                                    placeholder="Selecione a Função" />
                            </div>

                        </div>
                        <!--Grid separado para carregar os campos caso for ativo-->
                        <div class="p-fluid formgrid grid">
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <label for="status">Status</label>
                                <Dropdown id="status" v-model="funcionario.status" :options="status" optionLabel="name"
                                    placeholder="Escolha um"></Dropdown>
                            </div>
                            <div class="field lg:col-2  md:col-6 sm:col-4">
                                <label for="inicio">Hora Inicio</label>
                                <VueDatePicker v-model="funcionario.HoraInicio" time-picker
                                    disable-time-range-validation>
                                    <template #input-icon>
                                        <img class="input-slot-image" :src="clockurl" />
                                    </template>
                                </VueDatePicker>
                            </div>
                            <div class="field lg:col-2  md:col-6 sm:col-4">
                                <label for="inicio">Hora Fim</label>
                                <VueDatePicker id="inicio" v-model="funcionario.HoraFim" time-picker
                                    disable-time-range-validation>
                                    <template #input-icon>
                                        <img class="input-slot-image" :src="clockurl" />
                                    </template>
                                </VueDatePicker>
                            </div>

                        </div>
                        <div class="p-fluid formgrid grid">
                            <div class="field lg:col-4  md:col-6 sm:col-4">
                                <Toast />
                                <img role="presentation" :src="imageUrl" width="170" />
                                <FileUpload mode="basic" name="demo[]" url="demo/images" accept="image/*"
                                    :maxFileSize="1000000" @upload="onUpload" chooseLabel="Escolha uma Foto" />
                            </div>
                            <!--Div com os dias da Semana-->
                            <div class=" field lg:col-4  md:col-6 sm:col-4">
                                <label for="fim">Selecione os dias que o Funcionario poderá retirar os items:</label>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Segunda" name="pizza"
                                        value="Segunda" />
                                    <label for="Segunda" class="ml-2"> Segunda-Feira </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Terca" name="Dias" value="Terca" />
                                    <label for="Terca" class="ml-2"> Terça-Feira </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Quarta" name="Dias" value="Quarta" />
                                    <label for="Quarta" class="ml-2"> Quarta-Feira </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Quinta" name="Dias" value="Quinta" />
                                    <label for="Quinta" class="ml-2"> Quinta-Feira </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Sexta" name="Dias" value="Sexta" />
                                    <label for="Sexta" class="ml-2"> Sexta-Feira </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Sabado" name="Dias" value="Sabado" />
                                    <label for="Sabado" class="ml-2"> Sabado </label>
                                </div>
                                <div class="m-2 flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Domingo" name="Dias"
                                        value="Domingo" />
                                    <label for="Domingo" class="ml-2"> Domingo</label>
                                </div>

                            </div>

                        </div>
                        <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveFuncionario" />
                        <!--Datatables com os items que são carregados a partir das escolhas do cadastro do usuario-->
                        <div class="col-12">
                            <TabView>
                                <TabPanel header="Items do Setor">
                                    <DataTable :value="ItensSetorDev" stripedRows dataKey="sku"
                                        v-model="funcionario.itemsSelecionadosSetor">
                                        <Column field="name" header="Nome"></Column>
                                        <Column field="sku" header="SKU"></Column>
                                        <Column field="quantidade" header="Quantidade"></Column>
                                        <Column field="prazo" header="Prazo"></Column>
                                    </DataTable>
                                </TabPanel>
                                <TabPanel header="Items do Funcionario">
                                    <Button label="Adicionar Items" @click="visible = true" />
                                    <Dialog v-model:visible="visible" modal header="Adicionar Items do Funcionário">
                                        <div class="flex align-items-center gap-3 mb-3">
                                            <label for="username" class="font-semibold w-6rem">Produto</label>
                                            <Dropdown v-model="selectedProduct" :options="ItensSetorAdm"
                                                optionLabel="name" placeholder="Selecione um produto" />
                                        </div>
                                        <div class="flex align-items-center gap-3 mb-5">
                                            <label for="Ordem" class="font-semibold w-6rem">Ordem</label>
                                            <InputText id="Ordem" v-model="selectedProduct.prazo" class="flex-auto" autocomplete="off" />
                                        </div>
                                        <div class="flex align-items-center gap-3 mb-5">
                                            <label for="Quantidade" class="font-semibold w-6rem">Quantidade</label>
                                            <InputNumber  id="Quantidade" v-model="selectedProduct.quantidade" class="flex-auto" autocomplete="off" />
                                        </div>
                                        <div class="flex justify-content-end gap-2">
                                            <Button type="button" label="Cancelar" severity="secondary"
                                                @click="visible = false"></Button>
                                            <Button type="button" label="Adicionar" @click="SalvarProduto"></Button>
                                        </div>
                                    </Dialog>
                                    <DataTable :value="funcionario.itemsSelecionadosFuncionario" tableStyle="min-width: 50rem"
                                        stripedRows dataKey="sku">
                                        <Column field="name" header="Nome"></Column>
                                        <Column field="sku" header="SKU"></Column>
                                        <Column field="quantidade" header="Quantidade"></Column>
                                        <Column field="prazo" header="Prazo"></Column>
                                    </DataTable>
                                </TabPanel>
                            </TabView>
                        </div>

                    </div>
                </div>
            </div>
        </TabPanel>
    </TabView>

</template>
<style>
.input-slot-image {
    height: 20px;
    width: auto;
    margin-left: 5px;
}
</style>