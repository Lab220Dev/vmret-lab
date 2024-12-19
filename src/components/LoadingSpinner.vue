<template>
    <!-- Exibe o modal de carregamento se a propriedade isLoading for verdadeira -->
    <div class="loading-overlay">
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p style="margin-top: 15px; color: #333">Carregando... Aguarde</p>
        </div>
    </div>
</template>

<script setup></script>

<style>
/* Estilo para o modal de carregamento */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Fundo semitransparente */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999 !important; /* Garante que o modal ficará acima de outros conteúdos */
}

/* Estilo do container do modal de carregamento */
.loading-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra suave */
}

/* Estilo do spinner de carregamento */
.loading-spinner {
    border: 8px solid #f3f3f3; /* Cor de fundo do círculo */
    border-top: 8px solid #3b82f6; /* Cor do segmento superior */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite; /* Animação de rotação */
    margin-bottom: 10px; /* Espaçamento inferior */
}

/* Animação de rotação do spinner */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
