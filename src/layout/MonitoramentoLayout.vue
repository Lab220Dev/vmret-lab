<script setup>
// Importa funções do Vue para reatividade, observação e referências
import {  watch, ref } from 'vue'; // ref para reatividade, watch para observar mudanças, computed para valores derivados
import MyTopBar from './MonitoramentoTopBar.vue'; // Importa o componente da barra superior
import AppFooter from './AppFooter.vue'; // Importa o componente do rodapé

import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de spinner de carregamento
import { useAuthStore } from '@/store/authStore'; // Importa o store de autenticação
import { useToast } from 'primevue/usetoast'; // Importa o hook de notificações do PrimeVue
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Instancia o toast para exibir notificações ao usuário
const toast = useToast();
// Acessa a store de autenticação para pegar dados do usuário (como o papel)
const store = useAuthStore();
// Obtém as configurações e o estado do layout através da função useLayout

// Variável reativa para controlar o estado de carregamento
const loading = ref(false);


const exibirMensagemGlobal = (mensagem) => {
    if (mensagem) {
        toast.add({
            severity: "info", // Tipo de mensagem
            summary: t('notification'), // Título do toast
            detail: mensagem, // Mensagem do store
            life: 3000, // Duração do toast
        });

        // Limpa a mensagem após exibição para evitar duplicações
        store.clearGlobalMessage();
    }
};

watch(
    () => store.globalMessage,
    (newMessage) => {
        if (newMessage) {
            exibirMensagemGlobal(newMessage);
        }
    }
);

</script>

<template>
    <div>
        <!-- Exibe o componente de carregamento enquanto a variável 'loading' for verdadeira -->
        <LoadingSpinner v-if="loading" />

        <!-- Exibe o layout principal quando 'loading' for falso -->
        <div v-else class="layout-wrapper" :class="containerClass">
            <!-- Barra superior do layout -->
            <MyTopBar></MyTopBar>
            <!-- Conteúdo principal -->
            <div class="layout-main-container">
                <div class="layout-main">
                    <router-view></router-view>
                </div>

                <!-- Rodapé do layout -->
                <AppFooter></AppFooter>
            </div>
        </div>

        <!-- Componente de notificações (Toast) -->
        <Toast />
    </div>
</template>

<style lang="scss" scoped></style>
