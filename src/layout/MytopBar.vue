<script setup>
// Importa as funções reativas e de ciclo de vida do Vue
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'; //`ref`: Cria referências reativas para elementos DOM ou variáveis no componente.`onMounted`: Executa código quando o componente é montado na tela.`onBeforeUnmount`: Executa código antes do componente ser desmontado.

// Acessa as funções do layout, como alternar o menu lateral
import { useLayout } from '@/layout/composables/layout';

// Usado para navegação entre as rotas
import { useRouter } from 'vue-router';

// Acessa a store de contagem regressiva para obter o tempo restante
import { useCountdownStore } from '@/store/countdown';

// Importa a URL da imagem do logo
import imageUrl from '@/assets/images/LogoDMBranco.png';

// Importa o componente VueCountdown para exibir o tempo de contagem regressiva
import VueCountdown from '@chenfengyuan/vue-countdown';

// Acessa a store de autenticação para obter os dados do usuário
import { useAuthStore } from '@/store/authStore.js';
import 'primeicons/primeicons.css'; // Import PrimeIcons styles
// Importa o arquivo CSS de bandeiras.
import '@/assets/demo/flags/flags.css';

// Importa a função useI18n da biblioteca vue-i18n para internacionalização.
import { useI18n } from 'vue-i18n';

// Obtém as funções de tradução (t) e de alteração de idioma (locale) do vue-i18n.
const { t, locale } = useI18n();

const { onMenuToggle } = useLayout(); //Desestruturação de funções do layout, como alternar o menu lateral.

const store = useAuthStore(); //Acessa a store de autenticação para obter dados do usuário.

const router = useRouter(); //Usamos o router para navegar entre as páginas.

const outsideClickListener = ref(null); //Referência para o listener de clique fora do menu. Inicialmente, está definido como `null`.

const topbarMenuActive = ref(true); //Controle de visibilidade do menu superior. Inicialmente, o menu está ativo (visível).

//Obtém o nome e a role (papel) do usuário no sistema a partir do store de autenticação.
const nome = store.userName;
const role = store.userRole;

const countdownStore = useCountdownStore(); //Acessa a store de contagem regressiva para obter o tempo restante.
const millisecondsRemaining = countdownStore.millisecondsRemaining; //O valor de `millisecondsRemaining` será utilizado para mostrar a contagem regressiva.

onMounted(() => {
    bindOutsideClickListener(); // Liga o listener de clique fora do menu
    // Se o tempo restante for maior que zero, inicia a contagem regressiva.
    if (millisecondsRemaining > 0) {
        startCountdown();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener(); // Desliga o listener de clique fora do menu
});

const bindOutsideClickListener = () => {
    //Função para adicionar o listener de clique fora do menu.
    if (!outsideClickListener.value) {
        //O listener verifica se o clique foi fora do menu e fecha o menu.
        outsideClickListener.value = (event) => {
            //Verifica se o listener de clique fora do menu já foi adicionado
            if (isOutsideClicked(event)) {
                //Se ainda não foi adicionado, o código entra no bloco condicional e adiciona o listener.
                topbarMenuActive.value = false; //A função `isOutsideClicked` verifica se o clique foi fora do menu.Se verdadeiro, o menu será fechado, definindo `topbarMenuActive` como `false`.
            }
        };
        document.addEventListener('click', outsideClickListener.value); //Adiciona o evento de clique no documento para que o listener de clique fora do menu seja executado.O código espera que o `outsideClickListener` seja acionado quando o clique ocorrer.
    }
};

const unbindOutsideClickListener = () => {
    //Função para remover o listener de clique fora do menu.
    if (outsideClickListener.value) {
        //Verifica se o listener existe antes de removê-lo.

        document.removeEventListener('click', outsideClickListener); //Caso o listener esteja presente, ele é removido e a referência é limpa.
        outsideClickListener.value = null;
    }
};

/**
 * Função para verificar se o clique foi fora do menu.
 *
 * @param {Event} event - O evento de clique.
 * @returns {boolean} Retorna `true` se o clique foi fora do menu.
 */
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return false; //Se o menu não estiver ativo (visível), a função retorna `false` para não realizar a verificação.

    const topbarEl = document.querySelector('.layout-topbar-sair-button'); //Seleciona o botão de sair da barra superior.

    // Verifica se o clique foi fora do botão de sair, retornando `true` para fechar o menu.
    return !(topbarEl === event.target || topbarEl.contains(event.target));
};

const fazerLogoff = () => {
    // Função para realizar o logoff do usuário.
    store.$reset(); // Reseta o estado do store de autenticação

    // Limpa os dados de armazenamento local e de sessão
    localStorage.clear();
    sessionStorage.clear();

    // Limpa todos os cookies
    document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'; //Limpa todos os cookies definindo a data de expiração no passado, removendo-os.
    });

    store.logout(); // Executa o logoff no store de autenticação
    router.push({ name: 'login' }); // Redireciona para a página de login
};

/**
 * Função que inicia a contagem regressiva.
 * @returns {boolean} Retorna `true` para indicar que a contagem foi iniciada.
 */
function startCountdown() {
    return true; //Retorna `true`, mas não realiza nenhuma ação adicional.
}

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
    return String(value).padStart(2, '0'); //Garante que o valor tenha pelo menos dois caracteres, preenchendo com zero à esquerda, se necessário.
}
const alterarLingua = (idioma) => {
    locale.value = idioma; // Altera o idioma globalmente
    const nomeIdioma = t(idiomasMapeados[idioma]);
    store.globalMessage = `${t('languageChanged')}: ${nomeIdioma}`;
};
const idiomasMapeados = {
    //Idiomas permitidos
    pt: 'portuguese',
    en: 'english',
    es: 'spanish'
};
const menu = ref(); //Menu de opções, com o item de "Fazer Logoff".
const menuLingua = ref(); //Contém a configuração do menu suspenso.
// Computa os itens do menu de opções.
const items = computed(() => [
    {
        label: t('options'), // Rótulo do menu de opções.
        items: [
            {
                label: t('logout'), // Rótulo do item de logoff.
                icon: 'pi pi-power-off', // Ícone do item de logoff.
                command: fazerLogoff // Chama a função de logoff quando o item for selecionado.
            }
        ]
    }
]);

// Computa os itens do menu de idiomas.
const linguas = computed(() => [
    {
        label: t('languageOptions'), // Rótulo do menu de opções de idioma.
        items: [
            {
                label: t('portuguese'), // Rótulo para o idioma português.
                icon: 'custom-icon flag flag-br', // Ícone da bandeira do Brasil.
                command: () => alterarLingua('pt') // Altera o idioma para português quando o item for selecionado.
            },
            {
                label: t('english'), // Rótulo para o idioma inglês.
                icon: 'custom-icon flag flag-us', // Ícone da bandeira dos Estados Unidos.
                command: () => alterarLingua('en') // Altera o idioma para inglês quando o item for selecionado.
            },
            {
                label: t('spanish'), // Rótulo para o idioma espanhol.
                icon: 'custom-icon flag flag-ar', // Ícone da bandeira da Argentina.
                command: () => alterarLingua('es') // Altera o idioma para espanhol quando o item for selecionado.
            }
        ]
    }
]);
const notificacoesNovas = computed(() => store.getQtdMessage);

const abrirNotificacoes = () => {
    router.push({ name: 'Mensagens' }); 
};
const toggleLingua = (event) => {
    //Alterna a visibilidade do menu usando a referência `menu`.
    menuLingua.value.toggle(event); //O evento de clique é passado para a função `toggle` para garantir o controle do estado do menu.
};
const toggle = (event) => {
    //Função para alternar a visibilidade do menu de opções.
    menu.value.toggle(event); //O evento de clique.
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
            <div class="mt-3 field pic ">
                <Avatar icon="pi pi-user" class="formgrid" size="large" shape="circle" />
            </div>

            <!-- Exibe nome do usuário, seu papel e o relógio com contagem regressiva -->
            <div class="formgrid field ml-2" style="display: flex; flex-direction: column; align-items: flex-start">
                <h6 class="usuario mt-3 m-0">{{ nome }}</h6>
                <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span>
                <div class="relogio mt-1 mr-0" style="align-self: flex-start">
                    <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd"> {{ padZero(minutes) }}:{{ padZero(seconds) }} </vue-countdown>
                </div>
            </div>
            <div class="formgrid mt-2 p-overlay-badge">
                <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="abrirNotificacoes">
                    <i class="pi pi-envelope" />
                    <span v-if="notificacoesNovas > 0" class="p-badge">{{ notificacoesNovas }}</span>
                </button>
            </div>

            <div class="formgrid mt-2">
                <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggleLingua($event)">
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
    font-size: 10pt; /* Define o tamanho da fonte para 10 pontos */
    font-weight: bold; /* Define o peso da fonte como negrito */
    color: #efae33; /* Define a cor do texto como um tom de amarelo */
    padding-top: 0px; /* Define o preenchimento superior como 0 pixels */
    margin-left: 0px; /* Define a margem esquerda como 0 pixels */
    margin-right: 10px; /* Define a margem direita como 10 pixels */
}

.layout-topbar .layout-topbar-sair-button i {
    font-size: 1.25rem;
}

.layout-topbar {
    display: flex; /* Ensure it's a flex container */
}

.layout-topbar .layout-topbar-button:hover {
    outline: 0 none;
    outline-offset: 0;
    transition: box-shadow 0.2s;
    background-color: #ffffff;
}

.layout-topbar .layout-topbar-button {
    outline: 0 none;
    outline-offset: 0;
    transition: box-shadow 0.2s;
    background-color: #052C65;
    color:#768497;
    border: none;
}

.layout-topbar .layout-menu-button {
    order: 0;
    margin-left: 2rem;
    background-color: #052C65;
    color:#768497;
}


.layout-topbar .layout-menu-button:hover {
    order: 0;
    margin-left: 2rem;
    background-color: #ffffff;
}

.usuario {
    font-size: 12px; /* Define o tamanho da fonte para 12 pixels */
    color:#FFFCFA;
}

.p-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.p-avatar.p-avatar-xl {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
}

.pi-user {
    font-size: 1.5rem;
    width: 28px;
    height: 28px;
}

.role {
    color: rgba(255, 255, 255, 0.5); /* Define a cor do texto como branco com 50% de opacidade */
    font-size: 10px; /* Define o tamanho da fonte para 10 pixels */
}

.custom-icon {
    display: inline-block; /* Define o elemento como um bloco inline */
    width: 30px; /* Define a largura como 30 pixels */
    height: 20px; /* Define a altura como 20 pixels */
    background-size: contain; /* Define o tamanho do fundo para conter o conteúdo */
    margin-right: 8px; /* Define a margem direita como 8 pixels */
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
.p-overlay-badge {
    position: relative;
    display: inline-block;
}

.p-overlay-badge .p-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  background-color: #2196f3; /* azul chamativo */
  color: white;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 10px;
  height: 18px;
  line-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
