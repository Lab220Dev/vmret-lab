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

const toggle = (event) => menu.value.toggle(event);
const toggleLingua = (event) => menuLingua.value.toggle(event);
</script>

<template>
    <div class="flex layout-topbar justify-content-between align-items-center">
        <div class="flex align-items-center">
            <!-- Link para a página do Dashboard -->
            <router-link :to="{ name: 'DashboardMonitoramento' }">
                <img src="@/assets/images/LogoDMBranco.png" width="200" />
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
    font-size: 10pt;
    font-weight: bold;
    color: #efae33;
}

.usuario {
    font-size: 12px;
}

.role {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.custom-icon {
    display: inline-block;
    width: 30px;
    height: 20px;
    background-size: contain;
    margin-right: 8px;
}
</style>
