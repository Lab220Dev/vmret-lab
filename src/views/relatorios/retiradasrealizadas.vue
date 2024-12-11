<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted, watch } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const showDialog = ref(false);
const dialogMessage = ref('');

const filteredCount = ref(0);

const store = useAuthStore();
const toast = useToast();
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);
const retiradas = ref([]);
const todosOption = { label: 'Todos', value: null };

const dms = ref([todosOption]);
const plantas = ref([todosOption]);
//const setor = ref([todosOption]);
const centroCusto = ref([todosOption]);

const ListaFuncionariosOriginal = ref([]);
const ListaFuncionarios = ref([]);

const ListaSetorOriginal = ref([]);
const ListaSetor = ref([]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const show = ref(true);
const selectedItem = ref([]);
const loading = ref(false);
const relatorio = ref({
    id_dm: '',
    id_planta: null,
    ID_CentroCusto: '',
    id_setor: null,
    id_funcionario: null,
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
});

const format = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`; // Formato de data: dd/MM/yyyy
};

const formatTime = (date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`; // Formato de hora: HH:mm
};

const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

const buscar = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm,
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo,
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        loading.value = true;
        const response = await axios.post('relatorioRetiRe/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;

        // Atualizando a contagem de registros após a resposta da API
        filteredCount.value = retiradas.value.length;

        // mostra o diálogo se não houver resultados
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
            showDialog.value = true;
        }
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = '';
        }
    } catch (error) {
        console.error('Erro ao buscar retiradas:', error);
    } finally {
        loading.value = false;
    }
};

watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = retiradas.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const voltar = () => {
    show.value = true;
    selectedItem.value = {};
};
const dt = ref(null);

const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
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

const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioRetiRe/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);
    }
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // usar o id_dm para acessar quais as plantas e setores estão disponiveis
        plantas.value = [
            todosOption,
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`,
                value: id_planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};

const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaSetorOriginal.value = [
            todosOption,
            ...response.data.map(({ id_setor, nome, id_centro_custo }) => ({
                label: `Setor  ${nome}`,
                value: id_setor, 
                id_centro_custo
            }))
        ];
        // Inicialize a lista de setores com todos os dados
        ListaSetor.value = ListaSetorOriginal.value;
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error);
    }
};

const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCusto.value = [
            todosOption,
            ...response.data.map(({ ID_CentroCusto, Nome }) => ({
                label: `Centro de Custo  ${Nome}`,
                value: ID_CentroCusto
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};

const filterSetor = () => {
    if (relatorio.value.ID_CentroCusto) {
        // Filtra os setores de acordo com o centro de custo selecionado
        ListaSetor.value = ListaSetorOriginal.value.filter(setorItem => 
            setorItem.id_centro_custo === relatorio.value.ID_CentroCusto || setorItem.value === null
        );
    } else {
        ListaSetor.value = ListaSetorOriginal.value;
    }
};

const filterFuncionarios = () => {
  // Verifica se há ao menos um filtro selecionado
  if (relatorio.value.id_setor || relatorio.value.id_planta) {
    ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
      const matchesSetor = relatorio.value.id_setor ? funcionario.id_setor === relatorio.value.id_setor : true;
      const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true;

      return matchesSetor && matchesPlanta;
    });
  } else {
    // Se não tiver filtro, exibe todos os funcionários
    ListaFuncionarios.value = ListaFuncionariosOriginal.value;
  }
};

const fetchFuncionarios = async () => {
  const data = {
    id_cliente: store.userIdCliente
  };
  try {
    const response = await axios.post('/funcionarios/listar', data, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    });
    ListaFuncionariosOriginal.value = [
      todosOption,
      ...response.data.map((funcionario) => ({
        label: funcionario.nome,
        value: funcionario.id_funcionario,
        id_setor: funcionario.id_setor,
        id_planta : funcionario.id_planta
      }))
    ];
    // Inicialize a lista de funcionários com todos os dados
    ListaFuncionarios.value = ListaFuncionariosOriginal.value;

  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
  }
};

const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide();
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
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
    <div class="card vh">
        <h5 class="my-6 ml-2 text-2xl">Retiradas Realizadas</h5>
        <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
            <!-- div de busca de informações para o relatorio -->
            <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                <label for="dm">DM:</label>
                <Dropdown class="drop" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1"></Dropdown>
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Centro de Custo:</label>
                <Dropdown class="drop" v-model="relatorio.ID_CentroCusto" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" @change="filterSetor" />
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Setor:</label>
                <Dropdown class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" @change="filterFuncionarios" />
            </div>
            <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                <label for="planta">Planta:</label>
                <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" @change="filterFuncionarios" />
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Funcionário:</label>
                <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Data Inicial:</label>
                <VueDatePicker
                    class="drop"
                    v-model="relatorio.data_inicio"
                    showIcon
                    :showOnFocus="false"
                    :format="format"
                    locale="pt-BR"
                    auto-apply
                    :enable-time-picker="false"
                    placeholder="Selecione uma data inicial"
                    teleport="body"
                    ref="datepicker1"
                    @open="handleDatepickerOpen"
                />
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <label for="perfil">Data Final:</label>
                <VueDatePicker
                    class="drop"
                    v-model="relatorio.data_final"
                    showIcon
                    :showOnFocus="false"
                    :format="format"
                    locale="pt-BR"
                    auto-apply
                    :enable-time-picker="false"
                    placeholder="Selecione uma data final"
                    teleport="body"
                    ref="datepicker2"
                    @open="handleDatepickerOpen"
                />
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <!-- botão de filtrar -->
                <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
            </div>

            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
            </div>
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6">
                <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
            </div>
        </div>
        <!--  datatable do relatorio -->
        <DataTable
            v-model:filters="filters"
            :value="retiradas"
            stripedRows
            removableSort
            showGridlines
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            rowHover
            :globalFilterFields="['Identificacao', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"
            tableStyle="min-width: 50rem; table-layout: fixed;"
            ref="dt"
            class="mt-6"
            :sortField="'ProdutoSKU'"
            :sortOrder="1"
            :tableStyle="{ width: '100%' }"
        >
            <!-- @rowSelect="onRowSelect"  -->
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>Total de registros: {{ filteredCount }}</span>
                    </div>
                    <div>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                        </IconField>
                    </div>
                </div>
            </template>

            <template #empty> {{ emptyMessage }} </template>
            <Column field="Identificacao" class="table-cell" sortable style="width: 8%" header="DM">
                <template #body="{ data }">
                    <span v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
                </template></Column
            >
            <Column field="Dia" sortable class="table-cell" style="width: 10%" header="Data">
                <template #body="{ data }">
                    <span v-tooltip="data.Dia">{{ formatDate(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Hora" sortable class="table-cell" style="width: 7%" header="Hora">
                <template #body="{ data }">
                    <span v-tooltip="data.Hora">{{ formatTime(new Date(data.Dia)) }}</span>
                </template></Column
            >
            <Column field="Matricula" sortable class="table-cell" style="width: 10%" header="Matricula">
                <template #body="{ data }">
                    <span v-tooltip="data.Matricula">{{ data.Matricula }}</span>
                </template></Column
            >
            <Column field="Nome" class="table-cell" style="width: 10%" sortable header="Nome">
                <template #body="{ data }">
                    <span v-tooltip="data.Nome">{{ data.Nome }}</span>
                </template></Column
            >
            <Column field="Email" sortable class="table-cell" header="E-mail">
                <template #body="{ data }">
                    <span v-tooltip="data.Email">{{ data.Email }}</span>
                </template></Column
            >
            <Column field="ProdutoNome" style="width: 20%" sortable class="table-cell" header="Item">
                <template #body="{ data }">
                    <span v-tooltip="data.ProdutoNome">{{ data.ProdutoNome }}</span>
                </template>
            </Column>
            <Column field="Quantidade" style="width: 10%" sortable header="Quant" class="text-center table-cell"></Column>
            <Column field="ProdutoSKU" class="table-cell" style="width: 10%" sortable header="CA">
                <template #body="{ data }">
                    <span v-tooltip="data.ProdutoSKU">{{ data.ProdutoSKU }}</span>
                </template></Column
            >
        </DataTable>

        <Card v-if="!show">
            <template #title>{{ selectedItem.dm }}</template>
            <template #content>
                <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
            </template>
        </Card>
    </div>
    <LoadingSpinner v-if="loading" />
    <!--  mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
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

.table-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.field {
    white-space: nowrap;
    text-align: left;
}
</style>
