<template>
    <!-- Exibe o modal de carregamento se a propriedade isLoading for verdadeira -->
    <div class="loading-overlay">   <!-- Exibe o modal de carregamento se isLoading for verdadeiro -->
        <div class="loading-container"> <!-- Container do modal de carregamento -->
            <div class="loading-spinner"></div> <!-- Spinner de carregamento -->
            <p style="margin-top: 15px; color: #333">{{t('load_spinner')}}</p>  <!-- Exibe a mensagem de carregamento -->
        </div>
    </div>
</template>

<script setup>  // Importa as funções 'defineProps' e 'useI18n' do Vue para criação de propriedades e internacionalização
import { useI18n } from 'vue-i18n'; // Importa a função 'useI18n' do Vue para internacionalização
const { t } = useI18n();    // Função para exibir notificações
</script>

<style>
/* Estilo para o modal de carregamento */
.loading-overlay {  /* Define o estilo do modal de carregamento */
    position: fixed;/* Posiciona o modal de carregamento fixo na tela */
    top: 0;/* Alinha o modal ao topo da tela */
    left: 0;/* Alinha o modal à esquerda da tela */
    width: 100%;/* Largura total */
    height: 100%;/* Altura total */
    background: rgba(0, 0, 0, 0.5); /* Fundo semitransparente */
    display: flex;/* Exibe os elementos em linha */
    justify-content: center;/* Centraliza os elementos horizontalmente */
    align-items: center;/* Centraliza os elementos verticalmente */
    z-index: 9999 !important; /* Garante que o modal ficará acima de outros conteúdos */
}

/* Estilo do container do modal de carregamento */
.loading-container {    /* Define o estilo do container do modal de carregamento */
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
.loading-spinner {  /* Define o estilo do spinner de carregamento */
    border: 8px solid #f3f3f3; /* Cor de fundo do círculo */
    border-top: 8px solid #3b82f6; /* Cor do segmento superior */
    border-radius: 50%;/* Borda arredondada */
    width: 40px;/* Largura */
    height: 40px;/* Altura */
    animation: spin 1s linear infinite; /* Animação de rotação */
    margin-bottom: 10px; /* Espaçamento inferior */
}

/* Animação de rotação do spinner */
@keyframes spin {   /* Define a animação de rotação */
    0% {/* Define o estado inicial da animação */
        transform: rotate(0deg);/* Define a rotação inicial */
    }   
    100% {/* Define o estado final da animação */
        transform: rotate(360deg);/* Define a rotação final */
    }
}
</style>
