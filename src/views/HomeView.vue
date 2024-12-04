<script setup>
import { onMounted, ref, reactive } from 'vue';
import axios from '@/axios.js';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import { useAuthStore } from '@/store/authStore'; // Importa a store
import { useToast } from 'primevue/usetoast'; // Importa o toast

// Usa a store
const store = useAuthStore();
const toast = useToast(); // Inicializa o toast
const emptyMessage = ref('Ainda não foi feita nenhuma retirada');

const canViewLastRecalls = ref(false); // Controle de exibição

// Método de permissão
const checkPermission = () => {
    if (store.userRole === 'Master' || store.userRole === 'Operador') {
        canViewLastRecalls.value = true; // Se for permitido, exibe os componentes
    }
};
const products = ref([]);
const most = ref([]);
const lineData = ref(null);

const fetchUltimasRetiradas = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/ultimos', data);
        products.value = response.data.slice(0, 5); // Atualiza os dados dos produtos
    } catch (error) {
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    }
};

const fetchMaisRetirados = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/listarMaisRet', data);
        most.value = response.data.slice(0, 5); // Atualiza os dados dos produtos mais retirados
    } catch (error) {
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    }
};
const fetchEstoqueBaixo = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/Estoque/ItensEstoqueBaixo', data);
        estoquebaixo.value = response.data.slice(0, 5);
    } catch (error) {
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    }
};
const obterDadosResumo = async () => {
    try {
        const data = {
            id_cliente: store.userIdCliente
        };
        const response = await axios.post('/SDM/resumo', data);

        //console.log("Dados recebidos da API:", response.data);
        if (response.data && response.data.labels && response.data.datasets) {
            lineData.value = response.data;
            //console.log("Estrutura de dados recebida:", lineData.value);
        } else {
            console.warn('Estrutura de dados inesperada na resposta da API.');
        }
    } catch (error) {
        console.error('Erro ao obter dados do relatório:', error);
    }
};
onMounted(async () => {
    // Exibe o toast se houver uma mensagem global
    if (store.getGlobalMessage) {
        // Usando o getter
        toast.add({
            severity: 'warn',
            summary: 'Acesso Negado',
            detail: store.getGlobalMessage,
            life: 3000
        });

        // Limpa a mensagem global após exibir o toast
        store.clearGlobalMessage();
    }

    checkPermission();
    if (canViewLastRecalls.value) {
        fetchUltimasRetiradas();
        fetchMaisRetirados();
        fetchEstoqueBaixo();
        obterDadosResumo();
    }
});
const chartOptions = {
    responsive: true,
    scales: {
        y: {
            type: 'category',
            labels: ['Offline', 'Online'] // Define as categorias, sem necessidade de callback
        },
        x: {
            title: {
                display: true,
                text: 'Horário'
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    }
};

const estoquebaixo = ref([]);
</script>

<template>
    <div class="grid grid-cols-12">
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <h5>Keep Alive</h5>
                <Chart type="line" :data="lineData" :options="chartOptions" />
            </div>

            <div v-if="canViewLastRecalls" class="card card-item">
                <LastRecalls :products="products" />
            </div>
        </div>
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <div class="title" style="display: flex; align-items: center">
                    <h5 style="margin-right: 5px">Itens com estoque baixo</h5>
                </div>
                <DataTable :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" :value="estoquebaixo" removableSort responsiveLayout="scroll">
                    <Column field="nome" header="Item" sortable style="width: 30%">
                        <template #body="{ data }">
                            <span class="tooltip-target" v-tooltip="data.nome">{{ data.nome }}</span>
                        </template></Column
                    >
                    <Column field="sku" header="SKU" class="table-cell" sortable style="width: 10%"></Column>
                    <Column field="quantidade" header="Quant." class="table-cell" sortable style="width: 8%"></Column>
                    
                    <template #empty>
                        <div class="empty-message" style="text-align: center; padding: 20px; color: gray">Não há itens com o estoque baixo.</div>
                    </template>
                </DataTable>
            </div>

            <div v-if="canViewLastRecalls" class="card card-item">
                <MostRecalled :most="most" />
            </div>
        </div>
    </div>
</template>

<style>
.grid-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Ajusta o número de colunas automaticamente */
    gap: 16px; /* Espaçamento entre os cards */
}

.card-item {
    height: 350px; /* Defina uma altura fixa */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden; /* Evita que o conteúdo saia do card */
}
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
