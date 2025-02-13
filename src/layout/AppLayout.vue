<script setup>
// Importa funções do Vue para reatividade, observação e referências
import { computed, watch, ref } from 'vue'; // ref para reatividade, watch para observar mudanças, computed para valores derivados
import MyTopBar from './MytopBar.vue'; // Importa o componente da barra superior
import AppFooter from './AppFooter.vue'; // Importa o componente do rodapé
import MySideBar from './mysidebar.vue'; // Importa o componente da barra lateral
import { useLayout } from '@/layout/composables/layout'; // Função personalizada para obter configurações e estado do layout
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
const { layoutConfig, layoutState, isSidebarActive } = useLayout();

// Variável reativa para controlar o estado de carregamento
const loading = ref(false);

// Variável para armazenar a função de listener para cliques fora da sidebar
const outsideClickListener = ref(null);

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
// Observa mudanças no estado da sidebar e ativa/desativa o listener de clique externo
watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener(); // Ativa o listener de clique externo se a sidebar estiver ativa
    } else {
        unbindOutsideClickListener(); // Desativa o listener de clique externo se a sidebar não estiver ativa
    }
});
watch(
    () => store.globalMessage,
    (newMessage) => {
        if (newMessage) {
            exibirMensagemGlobal(newMessage);
        }
    }
);
/**
 * Computed para determinar as classes dinâmicas do contêiner com base nas configurações de layout.
 * As classes variam com o tema e modo do menu.
 */
const containerClass = computed(() => {
    return {
        'layout-theme-light': layoutConfig.darkTheme.value === 'light', // Tema claro
        'layout-theme-dark': layoutConfig.darkTheme.value === 'dark', // Tema escuro
        'layout-overlay': layoutConfig.menuMode.value === 'overlay', // Menu sobreposto
        'layout-static': layoutConfig.menuMode.value === 'static', // Menu fixo
        'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static', // Menu fixo inativo
        'layout-overlay-active': layoutState.overlayMenuActive.value, // Menu sobreposto ativo
        'layout-mobile-inactive': !layoutState.staticMenuMobileActive.value, // Menu no mobile inativo
        'layout-mobile-active': layoutState.staticMenuMobileActive.value, // Menu no mobile ativo
        'p-ripple-disabled': layoutConfig.ripple.value === false // Desativa o efeito ripple
    };
});

/**
 * Função para adicionar um listener de clique fora, que fecha o menu ao clicar fora da sidebar ou do topo.
 */
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false; // Fecha o menu sobreposto
                layoutState.staticMenuMobileActive.value = false; // Fecha o menu lateral no mobile
                layoutState.menuHoverActive.value = false; // Desativa o menu de hover
            }
        };
        document.addEventListener('click', outsideClickListener.value); // Adiciona o listener
    }
};

/**
 * Função para remover o listener de clique externo.
 */
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value); // Remove o listener
        outsideClickListener.value = null;
    }
};

/**
 * Função para verificar se o clique ocorreu fora da sidebar ou do botão de menu.
 * @param {Event} event - Evento de clique.
 * @returns {boolean} - Retorna true se o clique foi fora da sidebar e do topo.
 */
const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar'); // Sidebar
    const topbarEl = document.querySelector('.layout-menu-button'); // Botão do menu no topo

    // Verifica se o clique foi fora dos elementos mencionados
    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div>
        <!-- Exibe o componente de carregamento enquanto a variável 'loading' for verdadeira -->
        <LoadingSpinner v-if="loading" />

        <!-- Exibe o layout principal quando 'loading' for falso -->
        <div v-else class="layout-wrapper" :class="containerClass">
            <!-- Barra superior do layout -->
            <MyTopBar></MyTopBar>

            <!-- Sidebar -->
            <div class="layout-sidebar">
                <MySideBar></MySideBar>
            </div>

            <!-- Conteúdo principal -->
            <div class="layout-main-container">
                <div class="layout-main">
                    <!-- Roteamento para as páginas internas -->
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
