<template>
  <!-- Componente de diálogo para confirmação de exclusão -->
  <Dialog header="Deletar Item" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false"><!-- Propriedades do diálogo -->
    <p>{{ dialogMessage }}</p><!-- Mensagem de confirmação de exclusão -->
    <!-- Rodapé do diálogo com botões para cancelar ou confirmar -->
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" /><!-- Botão de cancelar -->
      <Button label="OK" icon="pi pi-check" @click="confirmDelete" /><!-- Botão de confirmar -->
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';//ref é usado para reatividade

/**
* Propriedades e variáveis do componente.
*
* @typedef {Object} Props
* @property {string} dialogMessage - Mensagem a ser exibida no diálogo de confirmação de exclusão.
*/

/**
* Variáveis reativas do componente.
*
* @typedef {Object} ReactiveState
* @property {boolean} showDialog - Controla a visibilidade do diálogo de exclusão.
* @property {string} dialogMessage - Mensagem que será exibida no diálogo de confirmação.
*/
const showDialog = ref(false); // Controla a visibilidade do diálogo
const dialogMessage = ref(''); // Mensagem a ser exibida no diálogo

/**
* Função chamada ao confirmar a exclusão. Emite um evento 'confirm-delete'.
*
* @function confirmDelete
*/
const confirmDelete = () => {
  emit('confirm-delete'); // Emite evento para o componente pai confirmar a exclusão
};

/**
* Função chamada ao cancelar a exclusão. Fecha o diálogo.
*
* @function cancelDelete
*/
const cancelDelete = () => {
  showDialog.value = false; // Fecha o diálogo
};
</script>