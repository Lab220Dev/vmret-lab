<script setup>
/**
 * Importação dos módulos necessários para o funcionamento deste componente.
 * 
 * - isLoading: Variável que indica se o conteúdo está carregando, que é utilizada para controlar a exibição do modal de carregamento.
 * - LoadingSpinner: Componente de spinner de carregamento a ser exibido enquanto o conteúdo está sendo carregado.
 */
import { isLoading } from '@/router/router.js';  // Importa a variável isLoading que indica se a aplicação está carregando, normalmente gerenciada por um estado global ou store.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Carrega o componente de carregamento que será exibido enquanto a página/carregamento estiver em andamento.

</script>

<template>
    <!-- Condicionalmente renderiza o componente de LoadingSpinner se a variável isLoading for verdadeira -->
    <!-- Exibe o modal de carregamento enquanto isLoading for true, isso significa que algo está sendo carregado -->
    <LoadingSpinner v-if="isLoading" />
    <!-- Exibe o conteúdo da rota (componente correspondente à URL ativa) -->
    <!-- O <router-view /> renderiza o componente da rota que é carregado dinamicamente -->
    <router-view />
</template>

<style scoped>
/* Nenhum estilo foi adicionado para este componente até o momento */
</style>

