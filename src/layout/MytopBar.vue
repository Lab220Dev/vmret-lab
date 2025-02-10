<script setup>
/**
 * Importações necessárias para o funcionamento do componente
 *
 * Estas importações são responsáveis por trazer funções do Vue, stores, componentes, imagens e utilitários que o componente utiliza.
 */

// Importa as funções reativas e de ciclo de vida do Vue
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
/**
 * Funções importadas:
 * - `ref`: Cria referências reativas para elementos DOM ou variáveis no componente.
 * - `onMounted`: Executa código quando o componente é montado na tela.
 * - `onBeforeUnmount`: Executa código antes do componente ser desmontado.
 */

// Acessa as funções do layout, como alternar o menu lateral
import { useLayout } from '@/layout/composables/layout';
/**
 * `useLayout`: Fornece acesso a funções relacionadas ao layout, como a alternância do menu lateral.
 */

// Usado para navegação entre as rotas
import { useRouter } from 'vue-router';
/**
 * `useRouter`: Utilizado para navegar programaticamente entre as páginas.
 */

// Acessa a store de contagem regressiva para obter o tempo restante
import { useCountdownStore } from '@/store/countdown';
/**
 * `useCountdownStore`: Acesso à store que controla o tempo de contagem regressiva.
 */

// Importa a URL da imagem do logo
import imageUrl from '@/assets/images/LogoDMBranco.png';
/**
 * `imageUrl`: Importa a imagem do logo da empresa para ser exibida no componente.
 */

// Importa o componente VueCountdown para exibir o tempo de contagem regressiva
import VueCountdown from '@chenfengyuan/vue-countdown';
/**
 * `VueCountdown`: Componente para exibir a contagem regressiva.
 */

// Acessa a store de autenticação para obter os dados do usuário
import { useAuthStore } from '@/store/authStore.js';
/**
 * `useAuthStore`: Fornece acesso aos dados do usuário, como nome e papel, da store de autenticação.
 */
import '@/assets/demo/flags/flags.css';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

/*
 * Desestruturação de funções do layout, como alternar o menu lateral.
 */
const { onMenuToggle } = useLayout();

/**
 * Acessa a store de autenticação para obter dados do usuário.
 */
const store = useAuthStore();

/**
 * Usamos o router para navegar entre as páginas.
 */
const router = useRouter();

/**
 * Referência para o listener de clique fora do menu. Inicialmente, está definido como `null`.
 */
const outsideClickListener = ref(null);

/**
 * Controle de visibilidade do menu superior. Inicialmente, o menu está ativo (visível).
 */
const topbarMenuActive = ref(true);

/**
 * Obtém o nome e a role (papel) do usuário no sistema a partir do store de autenticação.
 */
const nome = store.userName;
const role = store.userRole;

/**
 * Acessa a store de contagem regressiva para obter o tempo restante.
 * O valor de `millisecondsRemaining` será utilizado para mostrar a contagem regressiva.
 */
const countdownStore = useCountdownStore();
const millisecondsRemaining = countdownStore.millisecondsRemaining;

/**
 * Método chamado quando o componente é montado.
 * Aqui, ele liga o listener de clique fora do menu e inicia a contagem regressiva, se necessário.
 */
onMounted(() => {
    bindOutsideClickListener(); // Liga o listener de clique fora do menu

    // Se o tempo restante for maior que zero, inicia a contagem regressiva.
    if (millisecondsRemaining > 0) {
        startCountdown();
    }
    /**
     * Se `millisecondsRemaining` for maior que 0, o código entra no bloco condicional.
     * O método `startCountdown` é chamado para iniciar a contagem regressiva.
     * Caso contrário, nenhuma ação é tomada.
     */
});

/**
 * Método chamado antes do componente ser desmontado.
 * Remove o listener de clique fora do menu.
 */
onBeforeUnmount(() => {
    unbindOutsideClickListener(); // Desliga o listener de clique fora do menu
});

/**
 * Função para adicionar o listener de clique fora do menu.
 * O listener verifica se o clique foi fora do menu e fecha o menu.
 */
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        /**
         * Verifica se o listener de clique fora do menu já foi adicionado.
         * Se ainda não foi adicionado, o código entra no bloco condicional e adiciona o listener.
         */
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                /**
                 * A função `isOutsideClicked` verifica se o clique foi fora do menu.
                 * Se verdadeiro, o menu será fechado, definindo `topbarMenuActive` como `false`.
                 */
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
        /**
         * Adiciona o evento de clique no documento para que o listener de clique fora do menu seja executado.
         * O código espera que o `outsideClickListener` seja acionado quando o clique ocorrer.
         */
    }
};

/**
 * Função para remover o listener de clique fora do menu.
 */
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        /**
         * Verifica se o listener existe antes de removê-lo.
         * Caso o listener esteja presente, ele é removido e a referência é limpa.
         */
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

/**
 * Função para verificar se o clique foi fora do menu.
 * Verifica se o evento de clique ocorreu fora do botão de sair na barra superior.
 *
 * @param {Event} event - O evento de clique.
 * @returns {boolean} Retorna `true` se o clique foi fora do menu.
 */
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return false;
    /**
     * Se o menu não estiver ativo (visível), a função retorna `false` para não realizar a verificação.
     * Isso impede a execução da lógica de verificação de clique fora do menu.
     */

    const topbarEl = document.querySelector('.layout-topbar-sair-button');
    /**
     * Seleciona o botão de sair da barra superior.
     * O código espera que o botão tenha a classe `layout-topbar-sair-button`.
     */

    // Verifica se o clique foi fora do botão de sair, retornando `true` para fechar o menu.
    return !(topbarEl === event.target || topbarEl.contains(event.target));
};

/**
 * Função para realizar o logoff do usuário.
 * Realiza o logout, limpa os dados de armazenamento e redireciona para a página de login.
 */
const fazerLogoff = () => {
    store.$reset(); // Reseta o estado do store de autenticação

    // Limpa os dados de armazenamento local e de sessão
    localStorage.clear();
    sessionStorage.clear();

    // Limpa todos os cookies
    document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
        /**
         * Limpa todos os cookies definindo a data de expiração no passado, removendo-os.
         * O código assume que todos os cookies podem ser removidos dessa maneira.
         */
    });

    store.logout(); // Executa o logoff no store de autenticação
    router.push({ name: 'login' }); // Redireciona para a página de login
};

/**
 * Função que inicia a contagem regressiva.
 * Esta função pode ser expandida com lógica adicional para controlar a contagem, caso necessário.
 *
 * @returns {boolean} Retorna `true` para indicar que a contagem foi iniciada.
 */
function startCountdown() {
    return true;
    /**
     * Retorna `true`, mas não realiza nenhuma ação adicional.
     * A lógica de contagem regressiva pode ser expandida aqui conforme necessário.
     */
}

/**
 * Função chamada quando a contagem regressiva chega ao fim.
 * Realiza o logoff do usuário e redireciona para a página de login.
 */
function onCountdownEnd() {
    store.logout(); // Realiza o logout do usuário
    router.push({ name: 'login' }); // Redireciona para a página de login
}

/**
 * Função para formatar valores de tempo, garantindo que os minutos e segundos tenham dois dígitos.
 *
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado com dois dígitos.
 */
function padZero(value) {
    return String(value).padStart(2, '0');
    /**
     * Garante que o valor tenha pelo menos dois caracteres, preenchendo com zero à esquerda, se necessário.
     */
}
const alterarLingua = (idioma) => {
    locale.value = idioma; // Altera o idioma globalmente
    const nomeIdioma = t(idiomasMapeados[idioma]);
    store.globalMessage = `${t("languageChanged")}: ${nomeIdioma}`;
};
const idiomasMapeados = {
    pt: 'portuguese',
    en: 'english',
    es: 'spanish'
};
/**
 * Menu de opções, com o item de "Fazer Logoff".
 * Contém a configuração do menu suspenso.
 */
const menu = ref();
const menuLingua = ref();
const items = ref([
    {
        label: 'Opções',
        items: [
            {
                label: 'Fazer Logoff',
                icon: 'pi pi-power-off',
                command: fazerLogoff // Chama a função de logoff quando o item for selecionado
            }
        ]
    }
]);
const linguas = computed(() => [
    {
        label: t('languageOptions'),
        items: [
            {
                label: t('portuguese'),
                icon: 'custom-icon flag flag-br',
                command: () => alterarLingua('pt')
            },
            {
                label: t('english'),
                icon: 'custom-icon flag flag-us',
                command: () => alterarLingua('en')
            },
            {
                label: t('spanish'),
                icon: 'custom-icon flag flag-es',
                command: () => alterarLingua('es')
            }
        ]
    }
]);
/**
 * Função para alternar a visibilidade do menu de opções.
 *
 * @param {Event} event - O evento de clique.
 */
const toggle = (event) => {
    menu.value.toggle(event);
    /**
     * Alterna a visibilidade do menu usando a referência `menu`.
     * O evento de clique é passado para a função `toggle` para garantir o controle do estado do menu.
     */
};
const toggleLingua = (event) => {
    menuLingua.value.toggle(event);
};
</script>

<template>
    <div class="flex layout-topbar justify-content-between align-items-center">
        <div class="flex align-items-center">
            <!-- Botão de menu para alternar o layout do menu lateral -->
            <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <!-- Link para a página do Dashboard -->
            <router-link :to="{ name: 'Dashboard' }" class="mt-12 ml-2">
                <Image :src="imageUrl" width="200" href="/index.html" />
            </router-link>
        </div>

        <!-- Seção de usuário, imagem, nome e role -->
        <div class="flex align-items-center justify-content-end mt-1" style="flex-grow: 1">
            <!-- Imagem de avatar do usuário -->
            <div class="mt-3 field pic">
                <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" />
            </div>

            <!-- Exibe nome do usuário, seu papel e o relógio com contagem regressiva -->
            <div class="formgrid field ml-2" style="display: flex; flex-direction: column; align-items: flex-start">
                <h6 class="usuario mt-3 m-0">{{ nome }}</h6>
                <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span>
                <div class="relogio mt-1 mr-0" style="align-self: flex-start">
                    <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd"> {{ padZero(minutes) }}:{{ padZero(seconds) }} </vue-countdown>
                </div>
            </div>

            <div class="formgrid mt-2">
                <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggleLingua($event)" aria-haspopup="true" aria-controls="overlay_menu_Lingua">
                    <i class="pi pi-language"></i>
                </button>
                <Menu ref="menuLingua" id="overlay_menu_Lingua" :model="linguas" :popup="true" :pt="{ item: { 'aria-hidden': false } }" />
            </div>
            <!-- Botão de menu com opções como 'Fazer Logoff' -->
            <div class="formgrid mt-2">
                <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
                    <i class="pi pi-ellipsis-v"></i>
                </button>
                <!-- Menu suspenso com opções -->
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.relogio {
    font-size: 10pt;
    font-weight: bold;
    color: #efae33;
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
}

.usuario {
    font-size: 12px;
}

.role {
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
}
.custom-icon {
    display: inline-block;
    width: 30px;
    height: 20px;
    background-size: contain;
    margin-right: 8px;
}
/* Estilos para telas pequenas (menor que 767px) */
@media (max-width: 767px) {
    .relogio,
    .usuario,
    .role,
    .pic {
        display: none; /* Esconde elementos no layout em telas pequenas */
    }
}
</style>
