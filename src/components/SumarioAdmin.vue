<template>
    <div class="grid">  <!-- Grid para alinhar os cartões -->
        <!-- Máquinas Online vs Offline -->
        <div class="col-4"> <!-- Coluna com largura de 4/12 -->
            <div class="card card-item">  <!-- Cartão com estilo específico -->
                <h5>{{$t('machines_online_offline')}}</h5>  <!-- Título do cartão -->
                <div class="chart-container " v-if="isDataLoaded">  <!-- Container do gráfico -->
                    <Chart type="doughnut" :data="machinesChartData" :options="doughnutChartOptions" /> <!-- Gráfico de rosca -->
                </div>
                <div v-else>
                    <Skeleton width="100%" height="150px" />  <!-- Exibe um esqueleto de carregamento -->
                </div>
            </div>
        </div>

        <!-- Notificações Enviadas -->
        <div class="col-4"> <!-- Coluna com largura de 4/12 -->
            <div class="card card-item">  <!-- Cartão com estilo específico -->
                <h5>{{$t('sent_notifications')}}</h5> <!-- Título do cartão -->
                <div class="chart-container" v-if="isDataLoaded"> <!-- Container do gráfico -->
                    <Chart type="bar" :data="notificationsChartData" :options="barChartOptions" />  <!-- Gráfico de barras -->
                    <template v-if="!notificationsChartDataReady"><p class="text-center text-gray-500">{{$t('no_notifications')}}</p></template>  <!-- Exibe uma mensagem caso não haja notificações -->
                  </div>
                  <div v-else>  <!-- Exibe um esqueleto de carregamento -->
                    <Skeleton width="100%" height="150px" />  <!-- Exibe um esqueleto de carregamento -->
                </div>
            </div>
        </div>

        <!-- Clientes com Mais Retiradas -->
        <div class="col-4"> <!-- Coluna com largura de 4/12 -->
            <div class="card card-item">  <!-- Cartão com estilo específico -->
                <h5>{{$t('clients_most_withdrawal')}}</h5>  <!-- Título do cartão -->
                <div class="chart-container" v-if="isDataLoaded"> <!-- Container do gráfico -->
                    <Chart type="pie" :data="clientsChartData" :options="doughnutChartOptions" /> <!-- Gráfico de pizza -->
                </div>
                <div v-else>
                    <Skeleton width="100%" height="150px" />  <!-- Exibe um esqueleto de carregamento -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>  // Configuração do script
import { ref, computed } from 'vue';    // Importa as funções 'ref' e 'computed' do Vue para criação de variáveis reativas
import { useI18n } from 'vue-i18n'; // Importa a função 'useI18n' do Vue para internacionalização
/**
 * Define as propriedades que o componente aceita.
 * Neste caso, o componente espera uma propriedade chamada "dados", que é um objeto.
 * 
 * @typedef {Object} Props
 * @property {Object} dados - Dados do gráfico que serão utilizados no componente.
 */
 const props = defineProps({  // Define as propriedades do componente
    dados: Object // A propriedade "dados" contém os dados a serem usados para renderizar os gráficos.
});

/**
 * Computed property que verifica se os dados foram carregados.
 * Retorna `true` se a propriedade "dados" não for vazia, caso contrário, retorna `false`.
 * 
 * @type {ComputedRef<boolean>}
 */
const isDataLoaded = computed(() => !!props.dados && Object.keys(props.dados).length > 0);  // Verifica se os dados foram carregados
const { t } = useI18n();  // Função para traduzir textos
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
  plugins: {  // Configurações dos plugins
    legend: { // Configurações da legenda
      position: "bottom" // Posiciona a legenda na parte inferior do gráfico
    }
  },
  scales: { // Configurações das escalas
    x: {  // Configurações do eixo X
      display: true, // Exibe o eixo X
      grid: { // Configurações da grade
        drawBorder: false, // Não desenha a borda do grid
        display: false // Remove as linhas de grade no eixo X
      }
    },
    y: {  // Configurações do eixo Y
      display: true, // Exibe o eixo Y
      grid: { // Configurações da grade
        drawBorder: false, // Não desenha a borda do grid
        display: false // Remove as linhas de grade no eixo Y
      },
      ticks: {  // Configurações dos ticks
        beginAtZero: true, // Faz o gráfico começar do zero
        max: 250 // Define o valor máximo do eixo Y
      }
    }
  },
  elements: { // Configurações dos elementos
    bar: {  // Configurações das barras
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
const doughnutChartOptions = {  // Configurações do gráfico de rosca
  maintainAspectRatio: false, // Desativa a manutenção da proporção do gráfico
  responsive: true, // Habilita o gráfico responsivo
  plugins: {  // Configurações dos plugins
    legend: { // Configurações da legenda
      position: "bottom" // Posiciona a legenda na parte inferior do gráfico
    }
  },
  elements: { // Configurações dos elementos
    arc: {  // Configurações do arco
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
const machinesChartData = computed(() => ({ // Dados do gráfico de máquinas online vs offline
    labels: ['Online', 'Offline'], // Labels do gráfico
    datasets: [ // Conjunto de dados
        {
            data: [ // Dados das máquinas online e offline
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
const notificationsChartDataReady = computed(() => {  // Verifica se há notificações
    const { email = 0, push = 0 } = props.dados.notificacoes || {}; // Desestrutura as notificações
    return email > 0 || push > 0; // Retorna true se houver notificações
});

/**
 * Computed property para os dados do gráfico de Notificações Enviadas.
 * Este gráfico mostra a quantidade de notificações enviadas por email e por push.
 * 
 * @type {ComputedRef<Object>}
 */
const notificationsChartData = computed(() => ({  // Dados do gráfico de notificações enviadas
    labels: ['E-mail', 'Push'], // Labels do gráfico
    datasets: [ // Conjunto de dados
        {
            label: t('notifications'), // Rótulo para a legenda do gráfico
            data: [ // Dados das notificações por email e push
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
const clientsChartData = computed(() => ({  // Dados do gráfico de clientes com mais retiradas
    labels: props.dados.clientes?.map(cliente => cliente.name) || [], // Nomes dos clientes
    datasets: [ // Conjunto de dados
        {
            data: props.dados.clientes?.map(cliente => cliente.value) || [], // Valores das retiradas dos clientes
            backgroundColor: ['#4caf50', '#2196f3', '#ffc107'] // Cores de fundo para as barras
        }
    ]
}));
</script>

<style>
.card-item {  /* Estilo para os cartões */
    padding: 20px;  /* Adiciona um preenchimento de 20px em todos os lados do cartão */
    border-radius: 8px; /* Arredonda os cantos do cartão */
    background-color: rgb(255, 255, 255) !important;  /* Define o fundo do cartão como branco */
    /* Ajuste para manter os cartões do mesmo tamanho */
    display: flex;  
    flex-direction: column;   /* Alinha os elementos verticalmente */
    justify-content: space-between; /* Distribui o espaço entre os elementos */
    height: 250px; /* Altura fixa para todos os cartões */
}
.chart-container canvas { /* Estilo para os gráficos */
    max-height: 300px; /* Altura máxima para os gráficos */
}
.chart-container {  /* Estilo para o container dos gráficos */
    flex: 1; /* O gráfico ocupará o espaço disponível */
    position: relative;
}
</style>
