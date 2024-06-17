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
const diasSemana = ref([
    { name: "Segunda-Feira", key: "SEG" },
    { name: "Terça-Feira", key: "TER" },
    { name: "Quarta-Feira", key: "QUA" },
    { name: "Quinta-Feira", key: "QUI" },
    { name: "Sext-Feira", key: "SEX" },
    { name: "Sabado", key: "SAB" },
    { name: "Domingo", key: "DOM" },
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
    itemsSelecionados: [],
    file: []
})
const selectedProduct = ref();

const ItensSetorDev = ref([
    { name: "Mouse", sku: "mse", prazo: 3, quantidade: 1 },
    { name: "Teclado", sku: "tcd", prazo: 3, quantidade: 1 },
    { name: "Microfone", sku: "mic", prazo: 3, quantidade: 1 },
    { name: "Fone de ouvido", sku: "hdf", prazo: 3, quantidade: 1 },
    { name: "Cabo USB", sku: "cusb", prazo: 3, quantidade: 1 },

])
const ItensSetorAdm = ref([
    { name: "Post-it", sku: "pit", prazo: 3, quantidade: 1 },
    { name: "caderno", sku: "cdn", prazo: 3, quantidade: 1 },
    { name: "corretivo", sku: "crr", prazo: 3, quantidade: 1 },
    { name: "clipe de papel", sku: "clp", prazo: 3, quantidade: 1 },
])
const ItensFuncionario = ref([
    { name: "usb", sku: "usb", prazo: 3, quantidade: 1 },
    { name: "protetor auricuklar", sku: "pauri", prazo: 2, quantidade: 1 },
    { name: "caneta", sku: "cnt", prazo: 1, quantidade: 1 },
    { name: "fita crepe", sku: "fcp", prazo: 30, quantidade: 1 },
    { name: "carregador", sku: "crg", prazo: 30, quantidade: 1 }
])
const ListaFuncionarios = ref([
    { "name": "Magdalen", "matricula": 80700 },
    { "name": "Hillary", "matricula": 12228 },
    { "name": "Aristotle", "matricula": 95795 },
    { "name": "Kiele", "matricula": 24045 },
    { "name": "Robinetta", "matricula": 28333 },
    { "name": "Lionello", "matricula": 47629 },
    { "name": "Carling", "matricula": 15321 },
    { "name": "Sebastiano", "matricula": 20196 },
    { "name": "Cointon", "matricula": 58933 },
    { "name": "Delbert", "matricula": 32068 }
]);
const metaKey = ref(true);
const active = ref(0);
const saveFuncionario = () => {
    //veirficar data/rg valido/se o status for ativado e as permissoes/
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });

}
const onRowSelect = (event) => {
    funcionario.Nome = event.data.nome;
    funcionario.Matricula = event.data.matricula;
    active = 1;
};
const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
</script>

<template>
    <TabView v-model:activeIndex="active">
        <TabPanel header="Listar Funcionário">
            <div class="card">
                <DataTable :value="ListaFuncionarios" :selection="selectedProduct" selectionMode="single" stripedRows
                    tableStyle="min-width: 50rem" dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                    <Column field="name" header="Nome"></Column>
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
                            <div class="field col-12">
                                <label for="name">Nome</label>
                                <InputText v-model="funcionario.nome" id="name" type="text"></InputText>
                            </div>
                            <div class="field col-4">
                                <label for="matricula">Matrícula</label>
                                <InputText id="matricula" v-model="funcionario.Matricula" />
                            </div>
                            <div class="field col-4">
                                <label for="Hash">Hash 1</label>
                                <InputText disabled id="Hash" v-model="funcionario.Hash1" />
                            </div>
                            <div class="field col-4">
                                <label for="Hash2">Hash 2</label>
                                <InputText disabled id="Hash2" v-model="funcionario.Hash2" />
                            </div>
                            <div class="field col-4">
                                <label for="DataAdmissao">Data de Admissao</label>
                                <Calendar v-model="funcionario.DataAdmissao" showIcon :showOnFocus="false"
                                    dateFormat="dd/mm/yy" />
                            </div>
                            <div class="field col-4">
                                <label for="rg">RG</label>
                                <InputMask id="rg" v-model="funcionario.RG" mask="99.999.999-*" />
                            </div>
                            <div class="field col-4">
                                <label for="cpf">CPF</label>
                                <InputMask v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" />
                            </div>
                            <div class="field col-4">
                                <label for="ctps">CTPS</label>
                                <InputMask id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" />
                            </div>
                            <div class="field col-4">
                                <label for="email">email</label>
                                <InputText id="email" v-model="funcionario.email" />
                            </div>
                            <div class="field col-4">
                                <label for="perfil">Centro de Custo</label>
                                <Dropdown v-model="funcionario.CentrodeCusto" :options="centroCusto" optionLabel="name"
                                    placeholder="Selecione Um Centro de Custo" />
                            </div>
                            <div class="field col-4">
                                <label for="planta">Planta</label>
                                <InputText id="planta" v-model="funcionario.planta" type="text" />
                            </div>
                            <div class="field col-4">
                                <label for="setor">Setor/Diretoria</label>
                                <Dropdown v-model="funcionario.Setor" :options="SetorDiretoria" optionLabel="name"
                                    placeholder="Selecione o Setor" />
                            </div>
                            <div class="field col-4">
                                <label for="funcao">Função/Nivel Hierarquico</label>
                                <Dropdown v-model="funcionario.Funcao" :options="hieraquiaoptions" optionLabel="name"
                                    placeholder="Selecione a Função" />
                            </div>

                        </div>
                        <!--Grid separado para carregar os campos caso for ativo-->
                        <div class="p-fluid formgrid grid">
                            <div class="field col-4">
                                <label for="status">Status</label>
                                <Dropdown id="status" v-model="funcionario.status" :options="status" optionLabel="name"
                                    placeholder="Escolha um"></Dropdown>
                            </div>
                            <div class="field col-2">
                                <label for="inicio">Hora Inicio</label>
                                <VueDatePicker v-model="funcionario.HoraInicio" time-picker
                                    disable-time-range-validation>
                                    <template #input-icon>
                                        <img class="input-slot-image" :src="clockurl" />
                                    </template>
                                </VueDatePicker>
                            </div>
                            <div class="field col-2">
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
                            <div class="col-4">
                                <Toast />
                                <img role="presentation" :src="imageUrl" width="170" />
                                <FileUpload mode="basic" name="demo[]" url="demo/images" accept="image/*"
                                    :maxFileSize="1000000" @upload="onUpload" />
                            </div>
                            <div class="field col-4">
                                <label for="fim">Permissões:</label>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Segunda" name="pizza"
                                        value="Segunda" />
                                    <label for="Segunda" class="ml-2"> Segunda-Feira </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Terca" name="Dias" value="Terca" />
                                    <label for="Terca" class="ml-2"> Terça-Feira </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Quarta" name="Dias" value="Quarta" />
                                    <label for="Quarta" class="ml-2"> Quarta-Feira </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Quinta" name="Dias" value="Quinta" />
                                    <label for="Quinta" class="ml-2"> Quinta-Feira </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Sexta" name="Dias" value="Sexta" />
                                    <label for="Sexta" class="ml-2"> Sexta-Feira </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Sabado" name="Dias" value="Sabado" />
                                    <label for="Sabado" class="ml-2"> Sabado </label>
                                </div>
                                <div class="flex align-items-center">
                                    <Checkbox v-model="funcionario.dias" inputId="Domingo" name="Dias"
                                        value="Domingo" />
                                    <label for="Domingo" class="ml-2"> Domingo</label>
                                </div>

                            </div>
                        </div>

                        <!--Datatables com os items que são carregados a partir das escolhas do cadastro do usuario-->
                        <div class="col-12">
                            <TabView>
                                <TabPanel header="Items do Setor">
                                    <DataTable :value="funcionario.Setor.key === 'adm' ? ItensSetorAdm : ItensSetorDev"
                                        stripedRows dataKey="sku" v-model:selection="funcionario.itemsSelecionados">
                                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                        <Column field="name" header="Nome"></Column>
                                        <Column field="sku" header="SKU"></Column>
                                        <Column field="quantidade" header="Quantidade"></Column>
                                        <Column field="prazo" header="Prazo"></Column>
                                    </DataTable>
                                </TabPanel>
                                <TabPanel header="Items do Funcionario">
                                    <DataTable :value="ItensFuncionario" tableStyle="min-width: 50rem" stripedRows
                                        dataKey="sku" v-model:selection="funcionario.itemsSelecionados">
                                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                        <Column field="name" header="Nome"></Column>
                                        <Column field="sku" header="SKU"></Column>
                                        <Column field="quantidade" header="Quantidade"></Column>
                                        <Column field="prazo" header="Prazo"></Column>
                                    </DataTable>
                                </TabPanel>
                            </TabView>
                        </div>
                        <Button label="Salvar" icon="pi pi-check" text="" @click="saveFuncionario" />
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