<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref } from 'vue';
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();
const retiradas = ref([{ "id": 1, "nome": "Yorgo Mielnik", "vm": "vm003", "data": "11/15/2023", "email": "ymielnik0@kickstarter.com", "item": "caneca 4", "quantidade": 1, "ca": 929670, "matricula": 2178, "valor": 0.65 },
{ "id": 2, "nome": "Elsy MacDermid", "vm": "vm004", "data": "4/14/2024", "email": "emacdermid1@uiuc.edu", "item": "caneca 2", "quantidade": 8, "ca": 119151, "matricula": 9229, "valor": 0.57 },
{ "id": 3, "nome": "Morgan Sive", "vm": "vm003", "data": "8/29/2021", "email": "msive2@storify.com", "item": "caneca 4", "quantidade": 7, "ca": 539485, "matricula": 5951, "valor": 0.78 },
{ "id": 4, "nome": "Mohammed Janaszkiewicz", "vm": "vm005", "data": "7/10/2023", "email": "mjanaszkiewicz3@example.com", "item": "caneca 3", "quantidade": 6, "ca": 820260, "matricula": 5594, "valor": 0.41 },
{ "id": 5, "nome": "Prent Gallagher", "vm": "vm005", "data": "4/7/2022", "email": "pgallagher4@blinklist.com", "item": "caneca 4", "quantidade": 5, "ca": 892485, "matricula": 3552, "valor": 0.8 },
{ "id": 6, "nome": "Brewer Orfeur", "vm": "vm002", "data": "5/27/2023", "email": "borfeur5@imdb.com", "item": "caneca 4", "quantidade": 1, "ca": 185102, "matricula": 3247, "valor": 0.77 },
{ "id": 7, "nome": "Angela Isbell", "vm": "vm004", "data": "8/5/2025", "email": "aisbell6@tripadvisor.com", "item": "caneca 1", "quantidade": 1, "ca": 978084, "matricula": 7624, "valor": 0.38 },
{ "id": 8, "nome": "Osmond Byles", "vm": "vm005", "data": "10/19/2021", "email": "obyles7@dmoz.org", "item": "caneca 3", "quantidade": 0, "ca": 551495, "matricula": 6721, "valor": 0.52 },
{ "id": 9, "nome": "Yasmeen Imorts", "vm": "vm002", "data": "11/6/2025", "email": "yimorts8@flavors.me", "item": "caneca 5", "quantidade": 9, "ca": 259658, "matricula": 1860, "valor": 0.89 },
{ "id": 10, "nome": "Faythe Berger", "vm": "vm003", "data": "5/19/2020", "email": "fberger9@edublogs.org", "item": "caneca 3", "quantidade": 5, "ca": 346378, "matricula": 8904, "valor": 0.63 },
{ "id": 11, "nome": "Pammie Risbie", "vm": "vm005", "data": "2/5/2020", "email": "prisbiea@sphinn.com", "item": "caneca 2", "quantidade": 6, "ca": 139989, "matricula": 3419, "valor": 0.37 },
{ "id": 12, "nome": "Misti Crayden", "vm": "vm001", "data": "7/23/2025", "email": "mcraydenb@sciencedirect.com", "item": "caneca 1", "quantidade": 5, "ca": 630364, "matricula": 7744, "valor": 0.6 },
{ "id": 13, "nome": "Dex Lacrouts", "vm": "vm003", "data": "7/12/2023", "email": "dlacroutsc@cnet.com", "item": "caneca 3", "quantidade": 3, "ca": 257340, "matricula": 8696, "valor": 0.23 },
{ "id": 14, "nome": "Mort Halhead", "vm": "vm002", "data": "9/8/2020", "email": "mhalheadd@jugem.jp", "item": "caneca 5", "quantidade": 4, "ca": 462180, "matricula": 3124, "valor": 0.04 },
{ "id": 15, "nome": "Rusty McKinless", "vm": "vm003", "data": "12/17/2021", "email": "rmckinlesse@google.es", "item": "caneca 3", "quantidade": 8, "ca": 214540, "matricula": 8701, "valor": 0.21 },
{ "id": 16, "nome": "Anabal Starten", "vm": "vm001", "data": "11/15/2021", "email": "astartenf@youtube.com", "item": "caneca 2", "quantidade": 6, "ca": 61682, "matricula": 3546, "valor": 0.9 },
{ "id": 17, "nome": "Sherrie Critchley", "vm": "vm005", "data": "9/19/2024", "email": "scritchleyg@cloudflare.com", "item": "caneca 3", "quantidade": 2, "ca": 431285, "matricula": 9698, "valor": 0.52 },
{ "id": 18, "nome": "Arthur Bricket", "vm": "vm005", "data": "7/13/2024", "email": "abricketh@posterous.com", "item": "caneca 4", "quantidade": 10, "ca": 488499, "matricula": 8244, "valor": 0.32 },
{ "id": 19, "nome": "Aretha Janout", "vm": "vm004", "data": "12/10/2025", "email": "ajanouti@spotify.com", "item": "caneca 2", "quantidade": 9, "ca": 53764, "matricula": 2012, "valor": 0.41 },
{ "id": 20, "nome": "Berthe Swaisland", "vm": "vm003", "data": "2/28/2022", "email": "bswaislandj@wunderground.com", "item": "caneca 1", "quantidade": 1, "ca": 415522, "matricula": 2585, "valor": 0.43 }]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref([]);
const loading = ref(false);
const relatorio = ref({
    vm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: '',
    data_final: ''
})
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
const buscar = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    Object.assign(data, relatorio);
    try {
        const response = await axios.post("relatorios/retiradasrealizadas", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        Retirada.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar centros de custo:", error);
    }
};
const onRowSelect = (event) => {
    if (event.data) {
        selectedItem.value = event.data;
        show.value = false;
    } else {
        voltar();
    }
};
const voltar = () => {
    show.value = true;
    selectedItem.value = {}
};
const dt = ref(null);

const generateCSV = (data) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  return `${headers}\n${rows}`;
};

const exportCSV = () => {
  const csvContent = generateCSV(retiradas.value);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'RetiradasRealizadas.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const exportJSON = () => {
  const jsonContent = JSON.stringify(retiradas.value, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'RetiradasRealizadas.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const fetchVM = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        ListaFuncionarios.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};
const fetchIdPlanta = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post("funcionarios/listarplanta", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        plantasoptions = response.data;
        formatedPlantaOptions = plantasoptions.map(plantasoptions => ({
            label: `Planta ${plantasoptions.id_planta}`,
            value: plantasoptions.id_planta
        }))
    } catch (error) {
        console.error("Erro ao buscar opções de plantas:", error);
    }
};
const fetchSetorDiretoria = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post("funcionarios/listarsetor", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        SetorDiretoriaoptions = response.data;
        formatedSetorOptions = SetorDiretoriaoptions.map(SetorDiretoriaoptions => ({
            label: `Setor ${SetorDiretoriaoptions.id_setor}`,
            value: SetorDiretoriaoptions.id_setor
        }))
    } catch (error) {
        console.error("Erro ao buscar setores/diretorias:", error);
    }
};
const fetchFuncionarios = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        ListaFuncionarios.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};
</script>

<template>
    <div class="card">
        <div class="form">
            <div class="grid">
                    <div class="p-fluid formgrid grid" v-if="show">
                        <!-- div de busca de informações para o relatorio -->
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="vm">Seleciona A VM</label>
                            <Dropdown v-model="relatorio.vm" :options="formatedVMOptions" optionLabel="label"
                                optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="planta">Selecione A Planta</label>
                            <Dropdown v-model="relatorio.id_planta" :options="formatedPlantaOptions" optionLabel="label"
                                optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Selecione o Centro de Custo</label>
                            <Dropdown v-model="relatorio.id_centro_custo" :options="formatedCentroCustoOptions"
                                optionLabel="label" optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Selecione o Setor</label>
                            <Dropdown v-model="relatorio.id_setor" :options="formatedSetorOptions" optionLabel="label"
                                optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Selecione o Funcionario</label>
                            <Dropdown v-model="relatorio.id_funcionario" :options="formatedFuncionarioOptions"
                                optionLabel="label" optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Data Inicial</label>
                            <VueDatePicker v-model="relatorio.data_inicio" showIcon :showOnFocus="false"
                                :format="format" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar"
                                :enable-time-picker="false" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Data Final</label>
                            <VueDatePicker v-model="relatorio.data_final" showIcon :showOnFocus="false" :format="format"
                                locale="pt-BR" cancelText="Cancelar" selectText="Selecionar"
                                :enable-time-picker="false" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <!-- botão de filtrar -->
                            <Button type="button" label="Filtrar Dados" icon="pi pi-search" severity="info"
                                @click="buscar" />
                        </div>
                        <div class="field lg:col-2  md:col-6 sm:col-4">
                            <Button icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                        </div>
                        <div class="field lg:col-2  md:col-6 sm:col-4">
                            <Button icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>

                        </div>

                    </div>
                    <!--  datatable do relatorio -->
                    <div class="datatable-wrapper">
                    <DataTable v-model:filters="filters" :value="retiradas" stripedRows showGridlines paginator
                        :rows="10" dataKey="id" filterDisplay="row" :loading="loading"
                        :rowsPerPageOptions="[5, 10, 20, 50]" v-model:selection="selectedItem"
                        :globalFilterFields="['id', 'vm', 'data', 'matricula', 'nome', 'email', 'item', 'qtd', 'ca', 'valor']"
                        :tableStyle="{ width: '100%' }" selectionMode="single" :metaKeySelection="false" ref="dt">
                        <!-- @rowSelect="onRowSelect"  -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> Nenhuma retirada realizada </template>
                        <template #loading> Carregando dados porfavor espere </template>
                        <Column field="id" sortable header="ID"></Column>
                        <Column field="vm" sortable header="VM"></Column>
                        <Column field="data" sortable header="Data"></Column>
                        <Column field="matricula" sortable header="Matricula"></Column>
                        <Column field="nome" sortable header="Nome"></Column>
                        <Column field="email" sortable header="E-mail"></Column>
                        <Column field="item" sortable header="Item"></Column>
                        <Column field="quantidade" sortable header="Quantidade"></Column>
                        <Column field="ca" sortable header="CA"></Column>
                        <Column field="valor" sortable header="Valor(R$)"></Column>
                    </DataTable>
                    </div>
                    <Card v-if="!show">
                        <template #title>{{ selectedItem.vm }}</template>
                        <template #content>
                            <Button type="button" label="Voltar" icon="pi pi-check" severity="info" @click="voltar" />
                        </template>
                    </Card>
                </div>
            </div>
        </div>

</template>
<style>
.card {
    overflow-x: auto;
}
.datatable-wrapper {
    overflow-x: auto;
    width: 100%;
}
</style>