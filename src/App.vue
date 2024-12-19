<script setup>

import { isLoading } from '@/router/router.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue'; //Carrega o aquivo do componente de carregamento
</script>
<template>
    <!-- Exibe o modal de carregamento se a propriedade isLoading for verdadeira -->
    <LoadingSpinner v-if="isLoading" />
    <router-view />
</template>

<style scoped></style>
