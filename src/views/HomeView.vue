<script setup>
import { onMounted, shallowRef , defineAsyncComponent } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const store = useAuthStore(); 
const atual = shallowRef(null); 
const checkPermission = () => {
    if (store.userRole === 'Master' || store.userRole === 'Operador') {
        canViewLastRecalls.value = true; 
    }
};
const DashPorTipo = () => {
    const userRole = store.userRole;

    switch (userRole) {
        case 'Administrador':
        atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardAdmin.vue'));
            break;
        case 'Master':
        atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardMaster.vue'));
            break;
        case 'Operador':
        atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardOperador.vue'));
            break;
        case 'Avulso':
        atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardAvulso.vue'));
            break;
        default:
            console.error('Papel de usuário não reconhecido:', userRole);
    }
};

onMounted(() => {
    if (store.getGlobalMessage) {
        toast.add({
            severity: 'warn',
            summary: 'Acesso Negado',
            detail: store.getGlobalMessage,
            life: 3000
        });
        store.clearGlobalMessage();
    }

    DashPorTipo();
});
</script>

<template>
        <component v-if="atual" :is="atual" />
</template>
