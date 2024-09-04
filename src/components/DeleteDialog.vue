<!-- DeleteDialog.vue -->
<template>
    <Dialog header="Deletar Item" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false">
      <p>{{ dialogMessage }}</p>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
        <Button label="OK" icon="pi pi-check" @click="confirmDelete" />
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const showDialog = ref(false);
  const dialogMessage = ref('');
  
  const confirmDelete = () => {
      emit('confirm-delete');
  };
  
  const cancelDelete = () => {
      showDialog.value = false;
  };
  </script>
  