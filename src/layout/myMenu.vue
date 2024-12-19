<script setup>
  // Importação das funções e componentes necessários
  import { ref, onMounted } from 'vue'; // ref para criar variáveis reativas, onMounted para executar funções quando o componente é montado
  import { useAuthStore } from '@/store/authStore'; // Acessa o store de autenticação para recuperar dados do menu
  import AppMenuItem from './AppMenuItem.vue'; // Importa o componente AppMenuItem para exibir os itens de menu

  // Acessa o store de autenticação
  const store = useAuthStore();

  // Variável reativa para armazenar o modelo de itens do menu
  const model = ref([{ items: [] }]);

  /**
   * Função para construir o menu.
   * 
   * Popula o modelo de dados do menu com os itens obtidos do store de autenticação.
   */
  const buildMenu = () => {
    model.value = [
      {
        items: store.menuItems // Obtém os itens de menu do store e os coloca no modelo
      }
    ];
  };

  // Executa a função buildMenu quando o componente é montado
  onMounted(() => {
    buildMenu(); // Chama a função para preencher o modelo com os itens de menu
  });
</script>

<template>
  <!-- Contêiner de lista de itens de menu -->
  <ul class="layout-menu">
    <!-- Itera sobre os itens do modelo para exibir cada um -->
    <template v-for="(item, i) in model" :key="item">
      <!-- Exibe o componente AppMenuItem para cada item, se não for um separador -->
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      
      <!-- Exibe um separador de menu se o item for um separador -->
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>