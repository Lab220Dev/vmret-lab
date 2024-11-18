<script setup>
import { isLoading } from '@/router/router.js';
import { watchEffect } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
</script>

<template>
    <LoadingSpinner v-if="isLoading" />
    <router-view />
</template>

<style scoped></style>
