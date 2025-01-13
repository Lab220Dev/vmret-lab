<template>
  <!-- Componente DataTable exibindo a lista de notificações -->
  <DataTable 
  :value="validListanoti" 
  :responsiveLayout="'scroll'" 
  class="card">
    
  <!-- A tabela exibe os dados provenientes de "validListanoti" -->
   <!-- Faz com que a tabela tenha um layout responsivo, com rolagem horizontal em telas menores -->
    <!-- Encapsula a tabela dentro de um card -->

    <!-- Coluna 'cliente' para exibir o nome do cliente -->
    <Column field="cliente" header="Cliente"></Column>
    
    <!-- Coluna 'tipo' para exibir o tipo da notificação -->
    <Column field="tipo" header="Tipo"></Column>
    
    <!-- Coluna 'date' para exibir a data da notificação -->
    <Column field="date" header="Data"></Column>
    
    <!-- Coluna 'status' para exibir o status da notificação -->
    <Column field="status" header="Status"></Column>

    <!-- Template personalizado para exibição quando não há dados -->
    <template #empty>
      <!-- Mensagem de 'vazio' quando não há notificações disponíveis -->
      <p class="text-center">Sem notificações disponíveis</p>
    </template>
  </DataTable>
</template>

<script setup>
import { computed } from 'vue';  // Importa a função 'computed' do Vue para definir uma propriedade computada

/**
 * Define as propriedades que o componente espera receber.
 * 
 * @typedef {Object} Props
 * @property {Array} listanoti - A lista de notificações, que deve ser um array. Se não fornecida, será um array vazio por padrão.
 */
 const props = defineProps({
  listanoti: {  // Propriedade 'listanoti' que deve ser um array
      type: Array,  // Espera um valor do tipo Array
      default: () => []  // Se não for fornecido, o valor padrão será um array vazio
  }
});

/**
 * Computed property para garantir que 'listanoti' seja um array válido.
 * Verifica se a propriedade 'listanoti' é um array e, se não for, retorna um array vazio.
 * 
 * @type {ComputedRef<Array>} A computed property que retorna a lista de notificações, ou um array vazio.
 */
const validListanoti = computed(() => {
  // Verifica se a propriedade 'listanoti' é um array
  // Se for, retorna a lista; se não for, retorna um array vazio
  return Array.isArray(props.listanoti) ? props.listanoti : [];
});
</script>
