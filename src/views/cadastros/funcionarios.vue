<script setup>
import { reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FuncionarioService } from '@/service/FuncionarioService';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

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
    DataAdmissao: '',
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    CentrodeCusto: '',
    planta: '',
    Setor: '',
    Funcao: '',
    status: '',
    intervaloHoras: [],
    dias:[],
    itemsSelecionados:[]
})
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
const metaKey = ref(true);
const saveFuncionario = () => {
    //veirficar data/rg valido/se o status for ativado e as permissoes/
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionario criado', life: 3000 });

}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
               qv
                <!--form de cadastro de novo funcionario-->
                <div class="p-fluid formgrid grid">
                    <div class="field col-6">
                        <label for="name">Nome</label>
                        <InputText v-model="funcionario.nome" id="name" type="text"></InputText>
                    </div>
                    <div class="field col-6">
                        <label for="matricula">Matricula</label>
                        <InputText id="matricula" v-model="funcionario.Matricula" />
                    </div>
                    <div class="field col-4">
                        <label for="cpf">CPF</label>
                        <InputText v-model="funcionario.CPF" id="cpf" type="text">{{ funcionario.name }}</InputText>
                    </div>
                    <div class="field col-4">
                        <label for="rg">RG</label>
                        <InputText id="rg" v-model="funcionario.RG" />
                    </div>
                    <div class="field col-4">
                        <label for="ctps">CTPS</label>
                        <InputText id="ctps" v-model="funcionario.CTPS" />
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
                        <label for="setor">Setor/Diretoria</label>
                        <Dropdown v-model="funcionario.Setor" :options="SetorDiretoria" optionLabel="name"
                            placeholder="Selecione o Setor" />
                    </div>
                    <div class="field col-6">
                        <label for="funcao">Função/Nivel Hierarquico</label>
                        <Dropdown v-model="funcionario.Funcao" :options="hieraquiaoptions" optionLabel="name"
                            placeholder="Selecione a Função" />
                    </div>
                    <div class="field col-6">
                        <label for="planta">Planta</label>
                        <InputText id="planta" v-model="funcionario.planta" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="senha">Senha</label>
                        <InputText id="senha" v-model="funcionario.senha" type="password" />
                    </div>
                    <div class="field col-6">
                        <label for="DataAdmissao">Data de Admissao</label>
                        <Calendar v-model="funcionario.DataAdmissao" showIcon :showOnFocus="false"
                            dateFormat="dd/mm/yy" />
                    </div>
                </div>
                <!--Grid separado para carregar os campos caso for ativo-->
                <div class="p-fluid formgrid grid">
                    <div class="field col-4">
                        <label for="status">Status</label>
                        <Dropdown id="status" v-model="funcionario.status" :options="status" optionLabel="name"
                            placeholder="Escolha um"></Dropdown>
                    </div>
                    <div class="field col-4" v-if="funcionario.status.status">
                        <label>Permissões</label>
                        <label for="inicio">no intervalo Entre</label>
                        <VueDatePicker v-model="funcionario.intervaloHoras" time-picker disable-time-range-validation range
                            placeholder="Selecio o Intervalo de tempo" />
                    </div>
                    <div class="field col-4" v-if="funcionario.status.status">
                        <label>Nos dias</label>
                        <MultiSelect v-model="funcionario.dias" :options="diasSemana" optionLabel="name"
                            placeholder="Selecione os dias da semana" :maxSelectedLabels="5" />
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
                            <DataTable :value="ItensFuncionario" tableStyle="min-width: 50rem" stripedRows dataKey="sku" 
                            v-model:selection="funcionario.itemsSelecionados">
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
</template>
