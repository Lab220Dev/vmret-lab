<script setup>
import MyMenu from './myMenu.vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import imageUrl from '@/assets/images/LogoDMBranco.png';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import { useRouter } from 'vue-router';
import { useCountdownStore } from '@/store/countdown';
import { useLayout } from '@/layout/composables/layout';

const { onMenuToggle } = useLayout();

const store = useAuthStore();
const router = useRouter();
const nome = store.userName;
const role = store.userRole;

const countdownStore = useCountdownStore();
const millisecondsRemaining = countdownStore.millisecondsRemaining;

function startCountdown() {
    return true;
}

function onCountdownEnd() {
    //   counting.value = false;
    store.logout();
    router.push({ name: 'login' });
}
onMounted(() => {
    if (millisecondsRemaining > 0) {
        startCountdown();
    }
});

function padZero(value) {
    return String(value).padStart(2, '0');
}

const fazerLogoff = () => {
    store.$reset();

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });

    store.logout();
    router.push({ name: 'login' });
};

const menu = ref();
const items = ref([
    {
        label: 'Opções',
        items: [
            {
                label: 'Fazer Logoff',
                icon: 'pi pi-power-off',
                command: fazerLogoff
            }
        ]
    }
]);

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};

const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const topbarEl = document.querySelector('.layout-topbar-sair-button');

    return !(topbarEl === event.target || topbarEl.contains(event.target));
};

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <div class="flex align-items-center justify-content-start mt-1 " style="flex-grow: 1">
        <!-- Imagem do usuário -->
        <div class="mt-3 field pic">
            <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" />
        </div>

        <!-- Nome, role e relógio -->
        <div class="formgrid field ml-2" style="display: flex; flex-direction: column; align-items: flex-start">
            <h6 class="usuario mt-3 m-0">{{ nome }}</h6>
            <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span>
            <div class="relogio mt-1 mr-0" style="align-self: flex-start">
                <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd"> {{ padZero(minutes) }}:{{ padZero(seconds) }} </vue-countdown>
            </div>
        </div>
    </div>
    <MyMenu></MyMenu>
        <!--Botão <div class="button mt-2">
            <button type="button" class="p-link m-0" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
                <i class="pi pi-power-off"></i>
            </button>
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </div> -->
        

        </template>
    
<style lang="scss" scoped>
@media (min-width: 767px) {
    .formgrid,
    .button,
    .usuario,
    .relogio,
    .role {
        display: none;
    }
}

.usuario {
    font-size: 12px;
}

.role {
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
}

.relogio {
    font-size: 10pt;
    font-weight: bold;
    color: #ff0000;
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
}

.pi-power-off {
    color: #ffffff;
    font-size: 20px;
}

.button {
    display: flex;
    padding: 0.5rem 1rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    margin-top: auto;
    display: flex;
    justify-content: flex-start;
    padding: 0rem;
}

.content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
</style>
