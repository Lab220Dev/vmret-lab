<template>
  <!-- Componente de Diálogo para Adicionar Produto -->
  <Dialog class="" header="Adicionar Produto" :visible.sync="showDialogProduto" :modal="true" :closable="false" :draggable="false">
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

/**
 * Variável reativa que controla a visibilidade do diálogo de produto.
 * Inicialmente, o valor é `false`, indicando que o diálogo está oculto.
 *
 * @type {Ref<boolean>} Referência reativa que armazena um valor booleano indicando se o diálogo está visível ou não.
 */
 const showDialogProduto = ref(false);

/**
 * Função para salvar o produto e emitir um evento para o componente pai.
 * Ela chama o evento 'save-produto' para notificar o componente pai sobre a ação de salvar o produto.
 *
 * @async
 * @returns {Promise<void>} Retorna uma Promise que não resolve nenhum valor, pois é uma operação assíncrona.
 */
const saveProduto = async () => {
  // Emite um evento 'save-produto' para o componente pai
  emit('save-produto');   // Emite evento para o componente pai salvar o produto
};

/**
 * Função para fechar o diálogo de produto.
 * Ela altera a variável reativa `showDialogProduto` para `false`, fazendo o diálogo se tornar invisível.
 */
const closeDialog = () => {
  showDialogProduto.value = false; // Torna o diálogo invisível
};
</script>