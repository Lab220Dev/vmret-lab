<script setup>
import { ref, onMounted, computed } from 'vue';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import LowInventory from '@/components/LowInventory.vue';
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
        <div class="col-12 xl:col-12 lg:col-12 md:col-12 sm:12">
            <div class="card card-item">
                <LastRecalls :products="produtos" />
            </div>
        </div>
        <div class="col-12 xl:col-6 lg:col-6 md:col-6 sm:12">
            <div class="card card-item">
                <LowInventory :low="estoqueBaixo" />
            </div>
        </div>
        <div class="col-12 xl:col-6 lg:col-6 md:col-6 sm:12">
            <div class="card card-item">
                <MostRecalled :most="maisretirados" />
            </div>
        </div>
    </div>
</template>

<style scoped>
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
.table-cell {
    overflow: hidden; /* Oculta o texto que excede o tamanho da célula */
    white-space: nowrap; /* Impede quebra de linha */
    text-overflow: ellipsis; /* Exibe reticências (...) quando o texto excede o tamanho */
}

/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
