<script setup>
import MyMenu from './myMenu.vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import imageUrl from '@/assets/images/LogoDMBranco.png';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import { useRouter } from 'vue-router'

const store = useAuthStore();
const router = useRouter()
const nome = store.userName;
const role = store.userRole;
const counting = ref(false);

function startCountdown() {
  counting.value = true;
}

function onCountdownEnd() {
  counting.value = false;
  store.logout();
  router.push({ name: 'login'})
}
</script>

<template>
    <Image :src="imageUrl" width="250" class="mt-12" />
    <div class="relogio justify-content text-center p-4">
        <vue-countdown :time="60* 60 * 1000" v-slot="{ minutes, seconds }"
         @start="startCountdown" @end="onCountdownEnd">
            {{ minutes }} : {{ seconds }}
        </vue-countdown>    
    </div>
    <div class="formgrid grid">
        <div class="field col-3">
            <Avatar icon="pi pi-user" class="mr-2" size="xlarge" shape="circle" />
        </div>
        <div class="field col-6 mt-3" >
            <h6 class="m-0">{{ nome }}</h6>
            <span style="color: rgba(255,255,255,.5)">{{ role }}</span>
        </div>
    
    </div>
    <MyMenu></MyMenu>
</template>

<style lang="scss" scoped>
.relogio{
    font-size: 22pt;
    font-weight: bold;
    color:white;
}
.span{
    color:rgba(255,255,255,.5)
}
</style>
