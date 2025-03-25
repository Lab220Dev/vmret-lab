<template>
    <div class="grid grid-cols-12">
        <!-- Resumo -->
        <div class="col-12">
            <h5>{{$t('summary')}}</h5>
            <SumarioAdmin :dados="dados" />
        </div>

        <!-- Mapa de Calor -->
        <!-- <div class="col-12">
            <h5>Mapa de Calor</h5>
            <Heatmap :clientes="lista" />
        </div> -->

        <!-- Tabela de Notificações -->
        <div class="col-12">
            <h5>{{$t('sent_notifications')}}</h5>
            <Notificacoes :listanoti="formattedListanoti" />
        </div>
    </div>
    <Spinner v-if="loading" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';  // Importa funções do Vue para criar referências reativas, ciclos de vida e propriedades computadas
import SumarioAdmin from '@/components/SumarioAdmin.vue';  // Importa o componente SumarioAdmin
import Notificacoes from '@/components/TabelaNotificacoes.vue';  // Importa o componente TabelaNotificacoes
import { useToast } from 'primevue/usetoast';  // Importa o hook 'useToast' da biblioteca PrimeVue para exibir notificações
import Spinner from '@/components/LoadingSpinner.vue';  // Importa o componente de Spinner (indicador de carregamento)
import dashboardService from '@/services/dashboardService';  // Importa o serviço que fornece dados para o dashboard
import { useI18n } from 'vue-i18n';  // Importa o hook 'useI18n' para utilizar internacionalização (traduções)

const dados = ref({});  // Cria uma referência reativa chamada 'dados' inicialmente vazia
const lista = ref([]);  // Cria uma referência reativa chamada 'lista' inicialmente vazia
const notifcacoes = ref([]);  // Cria uma referência reativa chamada 'notifcacoes' inicialmente vazia
const loading = ref(false);  // Cria uma referência reativa chamada 'loading' que será utilizada para controlar o estado de carregamento
const toast = useToast();  // Inicializa o toast (notificação de sucesso ou erro) utilizando o hook 'useToast' da PrimeVue
const { t } = useI18n();

const fetchData = async () => {  // Declara uma função assíncrona chamada 'fetchData' para buscar os dados
    loading.value = true;  // Define 'loading' como true, indicando que os dados estão sendo carregados (indicador de carregamento é ativado)
    
    try {  // Bloco de código onde tentamos executar a requisição de dados
        const result = await dashboardService.fetchAdminData();  // Chama o serviço 'fetchAdminData' para obter os dados do dashboard
        dados.value = result.dados;  // Atribui os dados retornados pela requisição à variável 'dados'
        notifcacoes.value = result.notificacoes;  // Atribui as notificações retornadas pela requisição à variável 'notifcacoes'
    } catch (error) {  // Se ocorrer algum erro durante a requisição
        console.error('Erro nas requisições:', error);  // Exibe o erro no console para fins de depuração
        toast.add({  // Exibe uma notificação de erro (toast)
            severity: 'error',  // Tipo de notificação (erro)
            summary: 'Erro',  // Resumo da notificação
            detail: 'Falha ao carregar dados do dashboard',  // Detalhes da notificação
            life: 3000  // A duração da notificação (3 segundos)
        });
    } finally {  // O bloco finally sempre é executado, independentemente de ocorrer erro ou não
        loading.value = false;  // Define 'loading' como false, indicando que o carregamento foi concluído
        console.log('Spinner desativado:', loading.value);  // Exibe no console que o carregamento foi desativado (spinner desligado)
    }
};

const formattedListanoti = computed(() => {  // Cria uma propriedade computada para formatar a lista de notificações
    return Array.isArray(notifcacoes.value)  // Verifica se 'notifcacoes.value' é um array
        ? notifcacoes.value  // Se for um array, retorna o array de notificações
        : [{ cliente: '-', tipo: '-', date: '-', status: t('no_notifications') }];  // Caso contrário, retorna um array com um único item informando que não há notificações
});

onMounted(async () => {  // Função que é executada assim que o componente for montado
    await fetchData();  // Chama a função 'fetchData' para buscar os dados do dashboard
});
</script>

<style>
 .card {
    padding: 20px;  /* Adiciona 20px de espaçamento interno em todos os lados do card */
    border-radius: 8px;  /* Define a borda arredondada com 8px de raio */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);  /* Aplica uma sombra sutil (4px de deslocamento vertical, 8px de desfoque e cor rgba preta com 0.1 de opacidade) */
    background-color: white;  /* Define o fundo do card como branco */
}

.card-item {
    display: flex;  /* Define o layout do item como flexível */
    flex-direction: column;  /* Organiza os elementos do item em uma coluna */
    justify-content: space-between;  /* Distribui os itens ao longo do eixo vertical (espaçamento igual entre os itens) */
    background: #fff;  /* Define o fundo do item como branco */
    border-radius: 8px;  /* Aplica bordas arredondadas com 8px de raio */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);  /* Aplica uma sombra sutil similar ao card */
    overflow: hidden;  /* Oculta qualquer conteúdo que ultrapasse os limites do item */
}

.grid-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  /* Define as colunas de grid para se ajustarem automaticamente, com um mínimo de 200px e tamanho flexível até 1fração do espaço disponível */
    gap: 16px;  /* Define o espaçamento de 16px entre os itens do grid */
}

</style>
