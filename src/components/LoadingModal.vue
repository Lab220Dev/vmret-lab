<template>
  <!-- Exibe o modal de carregamento se a propriedade isLoading for verdadeira -->
  <div v-if="isLoading" class="loading-modal">  <!-- Exibe o modal de carregamento se isLoading for verdadeiro -->
    <div class="loading-container"> <!-- Container do modal de carregamento -->
      <div class="spinner"></div> <!-- Spinner de carregamento -->
      <p>{{t('load_spinner')}}</p>  <!-- Exibe a mensagem de carregamento -->
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'; // defineProps para declarar propriedades
import { useI18n } from 'vue-i18n';//useI18n é usado para internacionalização
const { t } = useI18n();
// Definindo a propriedade 'isLoading' que controla a exibição do modal
/**
 * Propriedades do componente
 * 
 * @typedef {Object} Props
 * @property {boolean} isLoading - Controla a visibilidade do modal de carregamento. Se verdadeiro, o modal será exibido.
 */
const props = defineProps({//defineProps é usado para definir as propriedades do componente
  isLoading: {//isLoading é uma propriedade do tipo booleano
    type: Boolean,//define que isLoading é do tipo booleano
    required: true,//define que isLoading é obrigatório
  },
});
</script>

<style scoped>
/* Estilo para o modal de carregamento */
.loading-modal {
  position: fixed;/* Posiciona o modal de carregamento fixo na tela */
  top: 0;/* Alinha o modal ao topo da tela */
  left: 0;/* Alinha o modal à esquerda da tela */
  width: 100%;/* Largura total */
  height: 100%;/* Altura total */
  background: rgba(0, 0, 0, 0.5); /* Fundo semitransparente */
  display: flex;/* Exibe os elementos em linha */
  justify-content: center;/* Centraliza os elementos horizontalmente */
  align-items: center;/* Centraliza os elementos verticalmente */
  z-index: 9999; /* Garante que o modal ficará acima de outros conteúdos */
}

/* Estilo do container do modal de carregamento */
.loading-container {
  background: white;/* Cor de fundo do container */
  padding: 20px;/* Espaçamento interno */
  border-radius: 10px;/* Borda arredondada */
  display: flex;/* Exibe os elementos em linha */
  flex-direction: column;/* Alinha os elementos verticalmente */
  align-items: center;/* Alinha os elementos ao centro */
  justify-content: center;/* Centraliza os elementos */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra suave */
}

/* Estilo do spinner de carregamento */
.spinner {
  border: 8px solid #f3f3f3; /* Cor de fundo do círculo */
  border-top: 8px solid #3b82f6; /* Cor do segmento superior */
  border-radius: 50%; /* Borda arredondada */
  width: 40px;  /* Largura do spinner */
  height: 40px; /* Altura do spinner */
  animation: spin 1s linear infinite; /* Animação de rotação */
  margin-bottom: 10px; /* Espaçamento inferior */
}

/* Animação de rotação do spinner */
@keyframes spin {/*define a animação de rotação do spinner*/
  0% { transform: rotate(0deg); }/*define o início da animação*/
  100% { transform: rotate(360deg); }/*define o fim da animação*/
}
</style>