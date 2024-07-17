<script setup>
import MyMenu from './myMenu.vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import imageUrl from '@/assets/images/LogoDMBranco.png';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import { useRouter } from 'vue-router';
import { useCountdownStore } from '@/store/countdown';

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
</script>

<template>
    <div class="formgrid grid">
        <div class="field col-3">
            <Avatar icon="pi pi-user" class="mr-2" size="xlarge" shape="circle" />
        </div>
        <div class="field col-6 mt-3">
            <h6 class="m-0">{{ nome }}</h6>
            <span style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span>
        </div>
    </div>
    <MyMenu></MyMenu>
</template>

<style lang="scss" scoped>
@media (min-width: 770px) {
    .formgrid {
        display: none;
    }
}
.span {
    color: rgba(255, 255, 255, 0.5);
}
</style>
