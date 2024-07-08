<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref } from 'vue';
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();
const Retirada = ref([]);

const relatorio = ref({
    vm:'',
    id_planta:'',
    id_centro_custo:'',
    id_setor:'',
    id_funcionario:'',
    data_inicio:'',
    data_final:''
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
const fetchCentroCusto = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post("funcionarios/listarcentrocusto", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        centroCustooptions = response.data;
        formatedCentroCustoOptions = centroCustooptions.map(centroCustooptions =>({
            label: `Centro de Custo ${centroCustooptions.id_centro_custo}`, 
            value: centroCustooptions.id_centro_custo
        }))
    } catch (error) {
        console.error("Erro ao buscar centros de custo:", error);
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
        formatedSetorOptions = SetorDiretoriaoptions.map(SetorDiretoriaoptions =>({
            label: `Setor ${SetorDiretoriaoptions.id_setor}`, 
            value: SetorDiretoriaoptions.id_setor
        }))
    } catch (error) {
        console.error("Erro ao buscar setores/diretorias:", error);
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
        formatedPlantaOptions = plantasoptions.map(plantasoptions =>({
            label: `Planta ${plantasoptions.id_planta}`, 
            value: plantasoptions.id_planta
        }))
    } catch (error) {
        console.error("Erro ao buscar opções de plantas:", error);
    }
};
const loadFuncionarios = async () => {
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
                <div class="col12">
                    <div class="p-fluid formgrid grid">
                        <!-- div de busca de informações para o relatorio -->
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="vm">Seleciona A VM</label>
                            <Dropdown v-model="relatorio.vm" :options="formatedVMOptions"
                                optionLabel="label" optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="planta">Selecione A Planta</label>
                            <Dropdown v-model="relatorio.id_planta" :options="formatedPlantaOptions"
                                optionLabel="label" optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Selecione o Centro de Custo</label>
                            <Dropdown v-model="relatorio.id_centro_custo" :options="formatedCentroCustoOptions"
                                optionLabel="label" optionValue="value" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <label for="perfil">Selecione o Setor</label>
                            <Dropdown v-model="relatorio.id_setor" :options="formatedSetorOptions"
                                optionLabel="label" optionValue="value" />
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
                            <VueDatePicker v-model="relatorio.data_final" showIcon :showOnFocus="false"
                                :format="format" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar"
                                :enable-time-picker="false" />
                        </div>
                        <div class="field lg:col-3  md:col-6 sm:col-4">
                            <!-- botão de filtrar -->
                            <Button type="button" label="Filtrar Dados" icon="pi pi-search" 
                            severity="info"   @click="buscar"/>
                        </div>

                        <!--  datatable do relatorio -->
                        <DataTable :value="retiradas" stripedRows  showGridlines tableStyle="min-width: 50rem">
                            <Column field="id" header="ID"></Column>
                            <Column field="vm" header="VM"></Column>
                            <Column field="data" header="Data"></Column>
                            <Column field="matricula" header="Matricula"></Column>
                            <Column field="nome" header="Nome"></Column>
                            <Column field="email" header="E-mail"></Column>
                            <Column field="item" header="Item"></Column>
                            <Column field="qtd" header="Quantidade"></Column>
                            <Column field="ca" header="CA"></Column>
                            <Column field="valor" header="Valor(R$)"></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>