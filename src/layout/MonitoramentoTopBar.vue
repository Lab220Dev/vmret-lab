<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useCountdownStore } from '@/store/countdown';
import { useI18n } from 'vue-i18n';
import VueCountdown from '@chenfengyuan/vue-countdown';

const store = useAuthStore();
const router = useRouter();
const countdownStore = useCountdownStore();
const { t, locale } = useI18n();

const nome = store.userName;
const role = store.userRole;
const millisecondsRemaining = countdownStore.millisecondsRemaining;

const menu = ref();
const menuLingua = ref();

const fazerLogoff = () => {
    store.$reset();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });
    store.logout();
    router.push({ name: 'login do monitoramento' });
};

const onCountdownEnd = () => {
    store.logout();
    router.push({ name: 'login do monitoramento' });
};

const padZero = (value) => String(value).padStart(2, '0');

const alterarLingua = (idioma) => {
    locale.value = idioma;
    const nomeIdioma = t(idiomasMapeados[idioma]);
    store.globalMessage = `${t('languageChanged')}: ${nomeIdioma}`;
};

const idiomasMapeados = {
    pt: 'portuguese',
    en: 'english',
    es: 'spanish'
};

const linguas = computed(() => [
    {
        label: t('languageOptions'),
        items: [
            { label: t('portuguese'), icon: 'custom-icon flag flag-br', command: () => alterarLingua('pt') },
            { label: t('english'), icon: 'custom-icon flag flag-us', command: () => alterarLingua('en') },
            { label: t('spanish'), icon: 'custom-icon flag flag-ar', command: () => alterarLingua('es') }
        ]
    }
]);

const items = computed(() => [
    {
        label: t('options'),
        items: [{ label: t('logout'), icon: 'pi pi-power-off', command: fazerLogoff }]
    }
]);
const isAdmin = computed(() => store.userRole === 'admin');
const abrirRelatorio = () => {
    if(isAdmin){
        router.push({ name: 'RelatorioEvento' }); 
    }
};
const toggle = (event) => menu.value.toggle(event);
const toggleLingua = (event) => menuLingua.value.toggle(event);
</script>

<template>
    <div class="flex layout-topbar justify-content-between align-items-center">
        <div class="flex align-items-center ml-3">
            <!-- Link para a página do Dashboard -->
            <router-link :to="{ name: 'DashboardMonitoramento' }">
                <img src="@/assets/images/LogoDMBranco.png" width="200" />
            </router-link>
        </div>

        <!-- Seção de usuário, imagem, nome e role -->
        <div class="mr-2 flex align-items-center justify-content-end mt-1" style="flex-grow: 1">
    <!-- Contêiner para imagem de avatar e informações -->
    <div class="flex align-items-center">
        <!-- Imagem de avatar do usuário -->
        <div class="mr-2">
            <Avatar icon="pi pi-user" class="formgrid" size="large" shape="circle" />
        </div>

        <!-- Nome, papel e relógio -->
        <div class="flex flex-column">
            <h6 class="usuario m-0">{{ nome }}</h6>
            <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span>
            <div class="relogio mt-1">
                <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd">
                    {{ padZero(minutes) }}:{{ padZero(seconds) }}
                </vue-countdown>
            </div>
        </div>
    </div>

    <!-- Botão extra (ex: mensagem, se quiser adicionar) -->
    <div v-if="isAdmin" class="ml-3">
        <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="abrirRelatorio">
            <i class="pi pi-list" />
        </button>
    </div>

    <!-- Botões de idioma e menu -->
    <div class="ml-1">
        <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggleLingua($event)">
            <i class="pi pi-language"></i>
        </button>
        <Menu ref="menuLingua" id="overlay_menu_Lingua" :model="linguas" :popup="true" />
    </div>
    <div class="ml-1">
        <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
            <i class="pi pi-ellipsis-v"></i>
        </button>
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
    </div>
</div>

    </div>
</template>

<style scoped>

.layout-topbar .user-info-container {
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Alinha os itens à esquerda */
}

.relogio {
    font-size: 10pt; /* Define o tamanho da fonte */
    font-weight: bold; /* Define o peso da fonte como negrito */
    color: #efae33; /* Define a cor do texto */
    width: 40px; /* Define uma largura fixa para evitar movimento */
    text-align: left; /* Centraliza o texto */
    position: relative; /* Remove o 'fixed' e usa 'relative' */
    margin-left: 0; /* Ajusta a margem esquerda */
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
