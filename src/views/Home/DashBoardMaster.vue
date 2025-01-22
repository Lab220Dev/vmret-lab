<script setup>
import { ref, onMounted } from 'vue';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';
import dashboardService from '@/services/dashboardService';

const store = useAuthStore();
const produtos = ref([]);
const maisretirados = ref([]);
const dadosDM = ref(null);
const estoqueBaixo = ref([]); // Itens com estoque baixo

const fetchData = async () => {
    const data = { id_cliente: store.userIdCliente };

    try {
        const result = await dashboardService.fetchMasterData();
        produtos.value = result.produtos;
        maisretirados.value = result.maisRetirados;
        dadosDM.value = result.keepAlive;
        estoqueBaixo.value = result.estoqueBaixo;
    } catch (error) {
        console.error('Erro ao carregar dados do Master:', error);
    }
};

onMounted(() => {
    fetchData();
});

// Configuração do gráfico "Keep Alive"
const chartOptions = {
    responsive: true,
    scales: {
        y: {
            type: 'category',
            labels: ['Offline', 'Online']
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
</script>

<template>
    <div class="grid grid-cols-12">
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <h5 class="my-3">Keep Alive</h5>
                <Chart type="line" :data="dadosDM" :options="chartOptions" />
            </div>

            <div class="card card-item">
                <LastRecalls :products="produtos" />
            </div>
        </div>
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <div class="title" style="display: flex; align-items: center">
                    <h5 style="margin-right: 5px">Itens com estoque baixo</h5>
                </div>
                <DataTable :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" :value="estoqueBaixo" removableSort responsiveLayout="scroll" class="mt-3">
                    <!-- A tabela exibe os dados provenientes de 'estoqueBaixo' -->
                    <!-- Exibe 5 linhas por página, com a opção de ordenação removível nas colunas -->
                    <!-- Aplica um estilo com largura mínima de 20rem e layout fixo para garantir que as colunas tenham larguras constantes -->
                    <!-- Quando a tela for pequena, a tabela ficará rolável horizontalmente (layout responsivo) -->
                    <Column field="sku" header="SKU" class="table-cell" sortable style="width: 10%"></Column>
                    <Column field="quantidade" header="Quant." class="table-cell" sortable style="width: 8%"></Column>

                    <Column field="nome" header="Item" sortable style="width: 30%">
                        <template #body="{ data }">
                            <span class="tooltip-target" v-tooltip="data.nome">{{ data.nome }}</span>
                        </template></Column
                    >

                    <template #empty>
                        <div class="empty-message" style="text-align: center; padding: 20px; color: gray">Não há itens com o estoque baixo.</div>
                    </template>
                </DataTable>
            </div>

            <div class="card card-item">
                <MostRecalled :most="maisretirados" />
            </div>
        </div>
    </div>
</template>

<style>
.card {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
}

.card-item {
    height: 350px; /* Defina uma altura fixa */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden; /* Evita que o conteúdo saia do card */
}
.grid-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Ajusta o número de colunas automaticamente */
    gap: 16px; /* Espaçamento entre os cards */
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
