<script setup>
  /**
   * Importação das funções e componentes necessários.
   * @module
   */
  
  // Importa 'ref' para criar variáveis reativas e 'onMounted' para executar funções após a montagem do componente
  import { ref, onMounted } from 'vue'; // 'ref' cria reatividade e 'onMounted' executa código após o componente ser montado
  
  // Importa a loja de autenticação para acessar dados sobre os itens do menu
  import { useAuthStore } from '@/store/authStore'; // Acessa o store para obter dados do menu a partir da autenticação do usuário
  
  // Importa o componente de item do menu
  import AppMenuItem from './AppMenuItem.vue'; // Componente para exibir cada item de menu

  /**
   * Acessa a store de autenticação.
   * @constant {Object} store - Store de autenticação para acessar os dados de usuário e menu.
   */
  const store = useAuthStore(); // Obtemos a instância do store para acessar dados relacionados à autenticação

  /**
   * Modelo de dados para os itens do menu.
   * @constant {Ref<Array>} model - Contém a lista de itens do menu.
   */
  const model = ref([{ items: [] }]); // Inicializa a variável reativa 'model' com um objeto que contém um array de itens vazio.

  /**
   * Função para construir o menu.
   * Popula o modelo com os itens de menu obtidos do store de autenticação.
   */
  const buildMenu = () => {
    model.value = [
      {
        items: store.menuItems // Atribui os itens de menu do store à propriedade 'items' no modelo.
      }
    ];
  };

  /**
   * Chama a função 'buildMenu' após o componente ser montado.
   * Executado assim que o Vue terminar de montar o componente.
   */
  onMounted(() => {
    buildMenu(); // Chama a função para preencher o modelo com os itens de menu, quando o componente for montado
  });
</script>

<template>
  <!-- Contêiner de lista de itens de menu -->
  <ul class="layout-menu">
    <!-- Itera sobre os itens no modelo e exibe cada um -->
    <template v-for="(item, i) in model" :key="item">
      <!-- Exibe o componente AppMenuItem se o item não for um separador -->
      <app-menu-item 
        v-if="!item.separator" 
        :item="item"          
        :index="i"            
      />
      
      <!-- Exibe um separador de menu se o item for um separador -->
      <li v-if="item.separator" class="menu-separator"></li> <!-- Exibe um separador de lista -->
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
