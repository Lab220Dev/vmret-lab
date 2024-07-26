<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted } from 'vue';
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore.js';
import { toRaw } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const store = useAuthStore();
const toast = useToast();
const retiradas = ref([]);
const dms = ref([]);
const ListaFuncionarios = ref(null);
const plantas = ref([]);
const setor = ref([]);
const centroCusto = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(false);
let selectedItem = ref([]);
const loading = ref(false);
const relatorio = ref({
    dm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: '',
    data_final: ''
});
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};
const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_dm: relatorio.value.dm,
        //id_planta: relatorio.value.id_planta,
        //id_centro_custo: relatorio.value.id_centro_custo,
        //id_setor: relatorio.value.id_setor,
        id_funcionario: relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        loading.value = true
        const response = await axios.post("relatorioItems/relatorio", data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;
        console.log(Array.isArray(retiradas.value));
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }finally {
        loading.value = false; // Desativando loading
    }
};
const onRowSelect = (event) => {
    show.value = true
    selectedItem = event.data.Detalhes
};
const voltar = () => {
    show.value = false;
    selectedItem.value = {};
};
const dt = ref(null);

const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
};

const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {
        // Agrega detalhes de cada produto
        const detalhesAgregados = retiradas.value.flatMap(produto => {
            if (Array.isArray(produto.Detalhes)) {
                return produto.Detalhes;
            } else {
                console.warn(`Detalhes não é um array para o produto ${produto.ProdutoID}`);
                return [];
            }
        });

        // Gera o conteúdo CSV
        const csvContent = generateCSV(detalhesAgregados);

        // Cria um Blob e link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Items_Mais_Retiradas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        console.error('retiradas.value não é um array.');
    }
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
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = response.data.map(({ id_dm }) => ({
            label: `DM  ${id_dm}`,
            value: id_dm
        }));
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('relatorioItems/listarPlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // usar o id_dm para acessar quais as plantas e setores estão disponiveis
        plantas.value = response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }));
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};
const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('relatorioItems/listarSetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        setor.value = response.data.map(({ id_setor }) => ({
            label: `Setor  ${id_setor}`,
            value: id_setor
        }));
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error);
    }
};
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('relatorioItems/listarCdC', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCusto.value = response.data.map(({ id_centro_custo }) => ({
            label: `Centro de Custo  ${id_centro_custo}`,
            value: id_centro_custo
        }));
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};

const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/listarFuncionario', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncionarios.value = response.data.map(funcionario => ({
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }));
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};

onMounted(() => {
    fetchDM();
    fetchIdPlanta();
    fetchSetorDiretoria();
    fetchFuncionarios();
    fetchCentroCusto();
});
</script>

<template>
    <div class="card">
        <div class="form">
            <div class="grid mx-1 px-1">
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="dm">DM:</label>
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label"
                            optionValue="value" />
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label"
                            optionValue="value" />
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto"
                            optionLabel="label" optionValue="value" />
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="perfil">Setor:</label>
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label"
                            optionValue="value" />
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios"
                            optionLabel="label" optionValue="value" />
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" :enable-time-picker="false" auto-apply/>
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" :enable-time-picker="false" auto-apply/>
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info"
                            @click="buscar" />
                    </div>

                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field lg:col-3  md:col-6 sm:col-6">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>

                </div>
                <!--  datatable do relatorio -->
                <div class="datatable-wrapper">
                    <DataTable v-model:filters="filters" :value="retiradas" stripedRows showGridlines paginator
                        :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" rowHover @rowSelect="onRowSelect"
                        :globalFilterFields="['ProdutoNome', 'Quantidade', 'ProdutoSKU']" selectionMode="single"
                        :tableStyle="{ width: '100%' }" ref="dt">
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
                        <Column field="ProdutoNome" sortable header="Item"></Column>
                        <Column field="quantidade_no_periodo" sortable header="Quant" class="text-center"></Column>
                        <Column field="ProdutoSKU" sortable header="CA"></Column>
                    </DataTable>
                    <Card v-if="show">
                        <template #title>Detalhes do Produto</template>
                        <template #content>
                            <DataTable :value="selectedItem" stripedRows showGridlines paginator :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]" rowHover>
                                <Column field="ProdutoNome" sortable header="Item"></Column>
                                <Column field="Data" sortable header="Data"></Column>
                                <Column field="Quantidade" sortable header="Quant">
                                </Column>
                                <Column field="ProdutoSKU" sortable header="SKU"></Column>
                            </DataTable>
                            <Button type="button" label="Voltar" icon="pi pi-check" severity="info" @click="voltar" />
                        </template>
                    </Card>
                </div>


            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />
</template>
<style>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
