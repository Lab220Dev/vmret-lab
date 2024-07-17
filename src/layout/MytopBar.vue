<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useCountdownStore } from '@/store/countdown';
import imageUrl from '@/assets/images/LogoDMBranco.png';
import MyMenu from './myMenu.vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import { useAuthStore } from '@/store/authStore.js';

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(true);
const router = useRouter();
const store = useAuthStore();
const nome = store.userName;
const role = store.userRole;

const countdownStore = useCountdownStore();
const millisecondsRemaining = countdownStore.millisecondsRemaining;

onMounted(() => {
    bindOutsideClickListener();

    if (millisecondsRemaining > 0) {
        startCountdown();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

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

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const topbarEl = document.querySelector('.layout-topbar-sair-button');

    return !(topbarEl === event.target || topbarEl.contains(event.target));
};

const fazerLogoff = () => {
    store.$reset();

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
        document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });

    store.logout(); 
    router.push({ name: 'login' }); 
};


/*const confirmLogoff = () => {
    if (confirm('Deseja realmente efetuar logoff?')) {
        fazerLogoff();
    }
};
*/

function startCountdown() {
    return true;
}

function onCountdownEnd() {
    store.logout();
    router.push({ name: 'login' });
}
    
function padZero(value) {
    return String(value).padStart(2, '0');
}

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

const toggle = (event) => {
    menu.value.toggle(event);
};

</script>

<template>
    <!-- logo e hamburguer -->
    <div class="flex layout-topbar justify-content-between align-items-center">
        <div class="flex align-items-center">
            <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <Image :src="imageUrl" width="250" class="mt-12" />
        </div>

        <!-- sair, usuario e role -->
        <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
            <i class="pi pi-ellipsis-v">
            </i>
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </button>

        <div class="flex align-items-center justify-content-end" style="position: relative; flex-grow: 1;">
            <div class="formgrid flex align-items-center" style="margin-right: 60px;">
                <div class="mt-3 field col-3">
                    <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" />
                </div>
                <div class="formgrid field col-6 ml-3">
                    <h6 class="usuario mt-3 m-0">{{ nome }}</h6>
                    <span class='role' style="color: rgba(255,255,255,.5)">{{ role }}</span>
                </div>
            </div>
            <!-- Relógio -->
            <div class="relogio" style="position: absolute; right: 0;">
                <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd">{{ padZero(minutes) }}:{{ padZero(seconds) }}</vue-countdown>
            </div>
        </div>
    </div>
</template>

<style scoped>
.relogio {
    font-size: 20pt;
    font-weight: bold;
    color: white;
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
}

.usuario {
    width: 110px;
}

.role {
    color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
    .formgrid {
        display: none;
    }
}

@media (max-width: 424px) {
    .relogio {
        display: none;
    }
    
}
</style>
