<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const store = useAuthStore();

/*dados mockados*/
const relatorio = ref({
    id_DM: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
});

const dms = ref([]);
const formatedDms = ref([]);
const dropdown1 = ref(null);


onMounted(() => {
    fetchDMs();
});

const fetchDMs = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('relatorios/listarDms', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        dms.value = response.data;
        formatedDms.value = dms.map((dms) => ({
            label: dms.nome,
            value: dms.id_maquina
        }));
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const dt = ref(null);

const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
};

const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {
        // Agrega detalhes de cada produto
        const detalhesAgregados = retiradas.value.flatMap((produto) => {
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

const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
};

const handleDatepickerOpen = () => {
    closeAllDropdowns();
};
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <h5 class="my-4 text-2xl">Métricas da DM</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Div de busca de informações para o relatório -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label"
                            optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" :enable-time-picker="false" auto-apply ref="datepicker1"
                            @open="handleDatepickerOpen" placeholder="Selecione uma data inicial"/>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="drop" v-model="relatorio.data_final" showIcon :showOnFocus="false"
                            :format="format" locale="pt-BR" :enable-time-picker="false" auto-apply ref="datepicker2"
                            @open="handleDatepickerOpen" placeholder="Selecione uma data final"/>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <!-- Botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>
                </div>
                <!-- DataTable do relatório -->
                <div class="datatable-wrapper">
                    <DataTable
                        :value="dms"
                        stripedRows
                        showGridlines
                        rowHover
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                    >
                        <Column field="total" sortable header="Item"></Column>
                        <Column field="total" sortable header="Quantidade" class="text-center"></Column>
                </DataTable>
                </div>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />
</template>

<style>
.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}


.dialog-content {
    padding: 1rem;
}

.dialog-message {
    text-align: justify;
    margin: 0;
}

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
