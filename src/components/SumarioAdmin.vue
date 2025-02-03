<template>
    <div class="grid">
        <!-- Máquinas Online vs Offline -->
        <div class="col-4">
            <div class="card card-item">
                <h5>{{$t('machines_online_offline')}}</h5>
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
                <h5>{{$t('sent_notifications')}}</h5>
                <div class="chart-container" v-if="isDataLoaded">
                    <Chart type="bar" :data="notificationsChartData" :options="barChartOptions" />
                    <template v-if="!notificationsChartDataReady"><p class="text-center text-gray-500">{{$t('no_notifications')}}</p></template>
                  </div>
                  <div v-else>
                    <Skeleton width="100%" height="150px" />
                </div>
            </div>
        </div>

        <!-- Clientes com Mais Retiradas -->
        <div class="col-4">
            <div class="card card-item">
                <h5>{{$t('clients_most_withdrawal')}}</h5>
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
import { useI18n } from 'vue-i18n';
/**
 * Define as propriedades que o componente aceita.
 * Neste caso, o componente espera uma propriedade chamada "dados", que é um objeto.
 * 
 * @typedef {Object} Props
 * @property {Object} dados - Dados do gráfico que serão utilizados no componente.
 */
 const props = defineProps({
    dados: Object // A propriedade "dados" contém os dados a serem usados para renderizar os gráficos.
});

/**
 * Computed property que verifica se os dados foram carregados.
 * Retorna `true` se a propriedade "dados" não for vazia, caso contrário, retorna `false`.
 * 
 * @type {ComputedRef<boolean>}
 */
const isDataLoaded = computed(() => !!props.dados && Object.keys(props.dados).length > 0);
const { t } = useI18n();
/**
 * Opções específicas para gráficos de barras.
 * Define a configuração para os gráficos de barras, incluindo aspectos como a manutenção da proporção,
 * a visibilidade das linhas de grade, a configuração das escalas e o estilo das barras.
 * 
 * @type {Object}
 */
const barChartOptions = {
  maintainAspectRatio: false, // Desativa a manutenção da proporção do gráfico
  responsive: true, // Habilita o gráfico responsivo
  plugins: {
    legend: {
      position: "bottom" // Posiciona a legenda na parte inferior do gráfico
    }
  },
  scales: {
    x: {
      display: true, // Exibe o eixo X
      grid: {
        drawBorder: false, // Não desenha a borda do grid
        display: false // Remove as linhas de grade no eixo X
      }
    },
    y: {
      display: true, // Exibe o eixo Y
      grid: {
        drawBorder: false, // Não desenha a borda do grid
        display: false // Remove as linhas de grade no eixo Y
      },
      ticks: {
        beginAtZero: true, // Faz o gráfico começar do zero
        max: 250 // Define o valor máximo do eixo Y
      }
    }
  },
  elements: {
    bar: {
      barPercentage: 0.6, // Largura das barras (60% da largura disponível)
      categoryPercentage: 0.8 // Espaçamento entre as categorias (80% do espaço disponível)
    }
  }
};

/**
 * Opções específicas para gráficos Doughnut/Pie (Pizza).
 * Define a configuração para gráficos do tipo Doughnut ou Pie, como a manutenção da proporção,
 * a visibilidade da legenda e a remoção das bordas das fatias do gráfico.
 * 
 * @type {Object}
 */
const doughnutChartOptions = {
  maintainAspectRatio: false, // Desativa a manutenção da proporção do gráfico
  responsive: true, // Habilita o gráfico responsivo
  plugins: {
    legend: {
      position: "bottom" // Posiciona a legenda na parte inferior do gráfico
    }
  },
  elements: {
    arc: {
      borderWidth: 0 // Remove as bordas das fatias do gráfico
    }
  }
};

/**
 * Computed property para os dados do gráfico de Máquinas Online vs Offline.
 * Este gráfico mostra a quantidade de máquinas online e offline, com base nos dados fornecidos.
 * 
 * @type {ComputedRef<Object>}
 */
const machinesChartData = computed(() => ({
    labels: ['Online', 'Offline'], // Labels do gráfico
    datasets: [
        {
            data: [
                props.dados.dms?.online?.count || 0, // Contagem das máquinas online
                props.dados.dms?.offline?.count || 0 // Contagem das máquinas offline
            ],
            backgroundColor: ['#4caf50', '#f44336'] // Cores de fundo para cada barra
        }
    ]
}));

/**
 * Computed property que verifica se as notificações estão prontas para serem exibidas.
 * Retorna `true` se as notificações (email ou push) forem maiores que zero.
 * 
 * @type {ComputedRef<boolean>}
 */
const notificationsChartDataReady = computed(() => {
    const { email = 0, push = 0 } = props.dados.notificacoes || {}; // Desestrutura as notificações
    return email > 0 || push > 0; // Retorna true se houver notificações
});

/**
 * Computed property para os dados do gráfico de Notificações Enviadas.
 * Este gráfico mostra a quantidade de notificações enviadas por email e por push.
 * 
 * @type {ComputedRef<Object>}
 */
const notificationsChartData = computed(() => ({
    labels: ['E-mail', 'Push'], // Labels do gráfico
    datasets: [
        {
            label: t('notifications'), // Rótulo para a legenda do gráfico
            data: [
                props.dados.notificacoes?.email || 0, // Número de notificações por email
                props.dados.notificacoes?.push || 0 // Número de notificações push
            ],
            backgroundColor: ['#2196f3', '#ffc107'] // Cores de fundo para cada fatia
        }
    ]
}));

/**
 * Computed property para os dados do gráfico de Clientes com Mais Retiradas.
 * Este gráfico mostra os clientes com mais retiradas, com base nas informações fornecidas.
 * 
 * @type {ComputedRef<Object>}
 */
const clientsChartData = computed(() => ({
    labels: props.dados.clientes?.map(cliente => cliente.name) || [], // Nomes dos clientes
    datasets: [
        {
            data: props.dados.clientes?.map(cliente => cliente.value) || [], // Valores das retiradas dos clientes
            backgroundColor: ['#4caf50', '#2196f3', '#ffc107'] // Cores de fundo para as barras
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
