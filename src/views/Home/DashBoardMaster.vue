<script setup>
import { ref, onMounted, computed } from 'vue';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import dashboardService from '@/services/dashboardService';
import { useI18n } from 'vue-i18n';
const produtos = ref([]);
const maisretirados = ref([]);
const dadosDM = ref(null);
const estoqueBaixo = ref([]); // Itens com estoque baixo
const { t } = useI18n();
const fetchData = async () => {
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
const chartOptions = computed(() => ({
    responsive: true,
    scales: {
        y: {
            type: 'category',
            labels: ['Offline', 'Online']
        },
        x: {
            title: {
                display: true,
                text: t('horario') 
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    }
}));
</script>

<template>
    <div class="grid grid-cols-12">
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <h5 class="my-3">{{$t('keep_alive_monitor')}}</h5>
                <Chart type="line" :data="dadosDM" :options="chartOptions" />
            </div>

            <div class="card card-item">
                <LastRecalls :products="produtos" />
            </div>
        </div>
        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <div class="title" style="display: flex; align-items: center">
                    <h5 style="margin-right: 5px">{{ $t('low_inventory_items') }}</h5>
                </div>
                <DataTable :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" :value="estoqueBaixo" removableSort responsiveLayout="scroll" class="mt-3">
                    <!-- A tabela exibe os dados provenientes de 'estoqueBaixo' -->
                    <!-- Exibe 5 linhas por página, com a opção de ordenação removível nas colunas -->
                    <!-- Aplica um estilo com largura mínima de 20rem e layout fixo para garantir que as colunas tenham larguras constantes -->
                    <!-- Quando a tela for pequena, a tabela ficará rolável horizontalmente (layout responsivo) -->
                    <Column field="sku" :header="t('SKU')" class="table-cell" sortable style="width: 10%"></Column>
                    <Column field="quantidade" :header="t('quantity')" class="table-cell" sortable style="width: 8%"></Column>

                    <Column field="nome" :header="t('item')" sortable style="width: 30%">
                        <template #body="{ data }">
                            <span class="tooltip-target" v-tooltip="data.nome">{{ data.nome }}</span>
                        </template></Column
                    >

                    <template #empty>
                        <div class="empty-message" style="text-align: center; padding: 20px; color: gray">{{$t('estoque_sem_itens')}}</div>
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

/* .table-cell: Estilo para as células da tabela */
.table-cell {
    /* Garante que o conteúdo da célula não ultrapasse os limites da célula */
    overflow: hidden;

    /* Impede que o conteúdo quebre a linha */
    white-space: nowrap;

    /* Exibe uma reticência "..." se o conteúdo for muito longo para caber na célula */
    text-overflow: ellipsis;
}
</style>
