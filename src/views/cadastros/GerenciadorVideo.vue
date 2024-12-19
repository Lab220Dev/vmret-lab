<template>
    <div class="card vh">
        <h3 class="mt-6 mb-4">Gerenciamento de Vídeos</h3>
        <hr/>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <div v-else>
            <ConfigInitial v-if="isFirstSetup" :dmList="ListaDMS" @setup-concluido="handleSetupCompleted" />
            <RegularUpload v-else :dmList="ListaDMS" @update-video="handleVideoUpdate" />
        </div>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue';
import axios from '@/axios.js';
import ConfigInitial from '@/components/PrimeiraConfiVideo.vue'; // Componente para configuração inicial
import RegularUpload from '@/components/VideoUpload.vue'; // Componente para uploads regulares
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();
const loading = ref(true); // Estado de carregamento
const errorMessage = ref(''); // Mensagem de erro
const isFirstSetup = ref(false); // Verifica se é a primeira configuração
const ListaDMS = ref([]);

const admin = () => {
    return store.userRole === 'Administrador';
};
const handleVideoUpdate = async ({ dmId, video }) => {
    const dm = ListaDMS.value.find((item) => item.ID_DM === dmId);
    if (dm) {
        dm.Video = video; 
    }
    
    await fetchDMS();
};
const handleSetupCompleted = () => {
    isFirstSetup.value = false; 

    fetchDMS();

};

const fetchDMS = async () => {
    loading.value = true;
    const data = admin() ? {} : { id_cliente: store.userIdCliente };
    try {
        const response = await axios.post('/DM/listar', data);
        ListaDMS.value = response.data;
        isFirstSetup.value = ListaDMS.value.every((dm) => dm.Video === 'N');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar DMs', life: 3000 });
        console.error('Erro ao carregar usuários:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDMS);
</script>

<style scoped>
.error {
    color: red;
    font-weight: bold;
}
</style>
