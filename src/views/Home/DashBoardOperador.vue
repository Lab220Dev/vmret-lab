<template>
<Estoque :estoque="estoque" :dms="maquinas" :loading="loading" />
</template>

<script setup>
import { ref, onMounted } from 'vue';  // Importa as funções 'ref' e 'onMounted' do Vue para criar variáveis reativas e executar código quando o componente for montado
import dashboardService from '@/services/dashboardService';  // Importa o serviço 'dashboardService' que será responsável por buscar os dados
import Estoque from '@/components/Estoque.vue';  // Importa o componente 'Estoque' (presumivelmente para exibir informações de estoque)

const estoque = ref([]);  // Cria uma referência reativa chamada 'estoque' que inicialmente é um array vazio
const maquinas = ref([]);  // Cria uma referência reativa chamada 'maquinas' que inicialmente é um array vazio
const loading = ref(false);  // Cria uma referência reativa chamada 'loading' que inicialmente é 'false', indicando que os dados não estão sendo carregados
const fetchData = async () => {  // Declara uma função assíncrona chamada 'fetchData'
    loading.value = true;  // Define 'loading' como 'true' para indicar que os dados estão sendo carregados
    try {  // Tenta executar a requisição para carregar os dados
        const result = await dashboardService.fetchOperadorData();  // Faz a requisição para o serviço 'dashboardService' e armazena o resultado
        estoque.value = result.estoque;  // Atribui os dados de estoque retornados pela requisição à variável 'estoque'
        maquinas.value = result.maquinas;  // Atribui os dados das máquinas retornados pela requisição à variável 'maquinas'
    } catch (error) {  // Se ocorrer algum erro durante a requisição
        console.error('Erro ao carregar dados do Master:', error);  // Exibe o erro no console
    } finally {  // Bloco 'finally' que sempre será executado após o 'try' e 'catch'
        loading.value = false;  // Define 'loading' como 'false', indicando que o carregamento foi concluído
    }
};

onMounted(() => {  // Hook do Vue que é chamado automaticamente quando o componente é montado
    fetchData();  // Chama a função 'fetchData' para carregar os dados do operador (estoque e máquinas)
});
</script>

<style></style>
