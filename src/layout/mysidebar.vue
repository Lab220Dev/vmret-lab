<script setup>
import MyMenu from './myMenu.vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import imageUrl from '@/assets/images/LogoDMBranco.png';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const nome = store.userName;
const role = store.userRole;
</script>

<template>
    <Image :src="imageUrl" width="250" class="mt-12" />
    <div class="relogio justify-content text-center p-4">
        <vue-countdown :time="60 * 60 * 1000" v-slot="{ minutes, seconds }">
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
