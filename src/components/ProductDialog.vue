<!-- ProdutoDialog.vue -->
<template>
    <Dialog class="" header="Adicionar Produto" :visible.sync="showDialogProduto" :modal="true" :closable="false">
      <div class="box card">
        <div class="grid">
          <!-- Campos do formulário para adicionar produto -->
        </div>
      </div>
      <div class="flex justify-content-end gap-2 mt-4">
        <Button type="button" label="Cancelar" severity="secondary" @click="closeDialog" />
        <Button type="button" label="Salvar" @click="saveProduto" />
      </div>
    </Dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const showDialogProduto = ref(false);
  
  const saveProduto = async () => {
      emit('save-produto');
  };
  
  const closeDialog = () => {
      showDialogProduto.value = false;
  };
  </script>
  