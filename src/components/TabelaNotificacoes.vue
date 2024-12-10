<template>
    <DataTable :value="validListanoti" :responsiveLayout="'scroll'" class="card">
      <Column field="cliente" header="Cliente"></Column>
      <Column field="tipo" header="Tipo"></Column>
      <Column field="date" header="Data"></Column>
      <Column field="status" header="Status"></Column>
      <template #empty>
            <p class="text-center">Sem notificações disponíveis</p>
        </template>
    </DataTable>
  </template>
  
  <script setup>
import { computed } from 'vue';
  const props = defineProps({
    listanoti: Array,
    default: () => []
  });
  const validListanoti = computed(() => {
    return Array.isArray(props.listanoti) ? props.listanoti : [];
});
  </script>
  