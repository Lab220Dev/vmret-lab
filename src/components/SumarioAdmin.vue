<template>
    <div class="grid">
        <!-- Máquinas Online vs Offline -->
        <div class="col-4">
            <div class="card card-item">
                <h5>Máquinas Online vs Offline</h5>
                <div class="chart-container " v-if="isDataLoaded">
                    <Chart type="doughnut" :data="machinesChartData" :options="doughnutChartOptions" />
                </div>
                <div v-else>
                    <Skeleton width="100%" height="150px" />
                </div>
            </div>
        </div>

        <!-- Notificações Enviadas -->
        <div class="col-4">
            <div class="card card-item">
                <h5>Notificações Enviadas</h5>
                <div class="chart-container" v-if="isDataLoaded">
                    <Chart type="bar" :data="notificationsChartData" :options="barChartOptions" />
                    <template v-if="!notificationsChartDataReady"><p class="text-center text-gray-500">Nenhuma notificação enviada</p></template>
                  </div>
                  <div v-else>
                    <Skeleton width="100%" height="150px" />
                </div>
            </div>
        </div>

        <!-- Clientes com Mais Retiradas -->
        <div class="col-4">
            <div class="card card-item">
                <h5>Clientes com Mais Retiradas</h5>
                <div class="chart-container" v-if="isDataLoaded">
                    <Chart type="pie" :data="clientsChartData" :options="doughnutChartOptions" />
                </div>
                <div v-else>
                    <Skeleton width="100%" height="150px" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    dados: Object
});
const isDataLoaded = computed(() => !!props.dados && Object.keys(props.dados).length > 0);

// Opções específicas para gráficos de barras
const barChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: "bottom"
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        drawBorder: false,
        display: false // Remove as linhas de grade
      }
    },
    y: {
      display: true,
      grid: {
        drawBorder: false,
        display: false // Remove as linhas de grade
      },
      ticks: {
        beginAtZero: true,
        max: 250 // Define um valor máximo fixo
      }
    }
  },
  elements: {
    bar: {
      barPercentage: 0.6, // Largura das barras
      categoryPercentage: 0.8 // Espaçamento entre as categorias
    }
  }
};

// Opções específicas para gráficos Doughnut/Pie
const doughnutChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: "bottom"
    }
  },
  elements: {
    arc: {
      borderWidth: 0 // Remove bordas das fatias
    }
  }
};
// Gráfico: Máquinas Online vs Offline
const machinesChartData = computed(() => ({
    labels: ['Online', 'Offline'],
    datasets: [
        {
            data: [
                props.dados.dms?.online?.count || 0,
                props.dados.dms?.offline?.count || 0
            ],
            backgroundColor: ['#4caf50', '#f44336']
        }
    ]
}));
const notificationsChartDataReady = computed(() => {
    const { email = 0, push = 0 } = props.dados.notificacoes || {};
    return email > 0 || push > 0;
});

// Gráfico: Notificações Enviadas
const notificationsChartData = computed(() => ({
    labels: ['E-mail', 'Push'],
    datasets: [
        {
            label: 'Notificações',
            data: [
                props.dados.notificacoes?.email || 0,
                props.dados.notificacoes?.push || 0
            ],
            backgroundColor: ['#2196f3', '#ffc107']
        }
    ]
}));

// Gráfico: Clientes com Mais Retiradas
const clientsChartData = computed(() => ({
    labels: props.dados.clientes?.map(cliente => cliente.name) || [],
    datasets: [
        {
            data: props.dados.clientes?.map(cliente => cliente.value) || [],
            backgroundColor: ['#4caf50', '#2196f3', '#ffc107']
        }
    ]
}));
</script>

<style>
.card-item {
    padding: 20px;
    border-radius: 8px;
    background-color: white;
    /* Ajuste para manter os cartões do mesmo tamanho */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 250px; /* Altura fixa para todos os cartões */
}
.chart-container canvas {
    max-height: 300px; /* Altura máxima para os gráficos */
}
.chart-container {
    flex: 1; /* O gráfico ocupará o espaço disponível */
    position: relative;
}
</style>
