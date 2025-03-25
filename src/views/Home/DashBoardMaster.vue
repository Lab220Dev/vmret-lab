<script setup>
import { ref, onMounted, computed } from 'vue';  // Importa as funções do Vue: ref (para criar variáveis reativas), onMounted (para ciclo de vida do componente), e computed (para propriedades computadas)
import LastRecalls from '@/components/LastRecalls.vue';  // Importa o componente LastRecalls (últimos recall)
import MostRecalled from '@/components/MostRecalled.vue';  // Importa o componente MostRecalled (produtos mais recallados)
import LowInventory from '@/components/LowInventory.vue';  // Importa o componente LowInventory (produtos com estoque baixo)
import dashboardService from '@/services/dashboardService';  // Importa o serviço dashboardService, que fornece dados para o dashboard
import { useI18n } from 'vue-i18n';  // Importa o hook 'useI18n' para utilizar funcionalidades de internacionalização (i18n)

const produtos = ref([]);  // Cria uma referência reativa chamada 'produtos' que inicialmente é um array vazio
const maisretirados = ref([]);  // Cria uma referência reativa chamada 'maisretirados' que inicialmente é um array vazio
const dadosDM = ref(null);  // Cria uma referência reativa chamada 'dadosDM' que inicialmente é null
const estoqueBaixo = ref([]);  // Cria uma referência reativa chamada 'estoqueBaixo' que inicialmente é um array vazio
const { t } = useI18n();  // Desestrutura o método 't' de useI18n para traduzir textos com base na configuração de idiomas

const fetchData = async () => {  // Declara uma função assíncrona chamada 'fetchData' que será responsável por buscar os dados
    try {  // Bloco que tenta executar a requisição para carregar os dados
        const result = await dashboardService.fetchMasterData();  // Faz a requisição para o serviço 'dashboardService' e armazena o resultado
        produtos.value = result.produtos;  // Atribui os produtos retornados pela requisição à variável 'produtos'
        maisretirados.value = result.maisRetirados;  // Atribui os produtos mais retirados retornados pela requisição à variável 'maisretirados'
        dadosDM.value = result.keepAlive;  // Atribui os dados de keepAlive (dados persistentes) à variável 'dadosDM'
        estoqueBaixo.value = result.estoqueBaixo;  // Atribui os itens com estoque baixo à variável 'estoqueBaixo'
    } catch (error) {  // Se ocorrer algum erro durante a requisição
        console.error('Erro ao carregar dados do Master:', error);  // Exibe o erro no console para fins de depuração
    }
};

onMounted(() => {  // Hook do Vue que é chamado automaticamente quando o componente é montado
    fetchData();  // Chama a função 'fetchData' para carregar os dados necessários
});
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
