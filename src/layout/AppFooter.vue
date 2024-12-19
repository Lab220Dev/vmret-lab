<script setup>
  // Importa a função useLayout para acessar configurações de layout
  import { useLayout } from '@/layout/composables/layout'; 

  // Chama useLayout e obtém a configuração do layout
  const { layoutConfig } = useLayout();

  // Pega a versão do site da variável de ambiente configurada no Vite
  const version = import.meta.env.VITE_APP_VERSION; // Exemplo: "1.0.0"
</script>

<template>
  <!-- Rodapé da aplicação exibindo o nome e a versão do site -->
  <div class="layout-footer">
    <!-- Exibe "Lab 220 v" seguido da versão atual do aplicativo -->
    <span class="font-medium ml-2">Lab 220 v{{ version }}</span>
  </div>
</template>

<style lang="scss" scoped></style>