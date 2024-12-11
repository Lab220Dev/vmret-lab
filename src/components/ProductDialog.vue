<template>
  <!-- Componente de Diálogo para Adicionar Produto -->
  <Dialog class="" header="Adicionar Produto" :visible.sync="showDialogProduto" :modal="true" :closable="false">
      <div class="box card">
          <div class="grid">
              <!-- Campos do formulário para adicionar produto (a serem definidos) -->
          </div>
      </div>
      <!-- Botões de Ação: Cancelar e Salvar -->
      <div class="flex justify-content-end gap-2 mt-4">
          <Button type="button" label="Cancelar" severity="secondary" @click="closeDialog" />
          <Button type="button" label="Salvar" @click="saveProduto" />
      </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'; // Importa a função 'ref' do Vue para criar variáveis reativas

// Variável reativa que controla a visibilidade do dialog
const showDialogProduto = ref(false);

// Função para salvar o produto e emitir evento
const saveProduto = async () => {
  // Emite um evento 'save-produto' para o componente pai
  emit('save-produto');
};

// Função para fechar o diálogo
const closeDialog = () => {
  showDialogProduto.value = false; // Torna o diálogo invisível
};
</script>