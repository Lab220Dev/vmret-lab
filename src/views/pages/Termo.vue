<template>
    <div class="">
        <div>
          <h5 class="my-4 text-2xl">Termo de compromisso - Ficha Retirada</h5>
          <Editor v-model="content"></Editor>
        </div>
        
        <LoadingSpinner v-if="loading" />
    <Button class="mt-3 justify-content-end flex" style="width: 20%; " type="button" label="Salvar Texto" icon="pi pi-pencil" severity="info" @click="SalvarTexto" /></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import Editor from '@/components/Editor.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const content = ref('');

const store = useAuthStore();
const loading = ref(false);

const SalvarTexto = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        Texto: content.value
    };

    console.log('Dados a serem enviados:', data); // Log para verificar o conteúdo

    loading.value = true;
    try {
        await axios.post('/termo/Salvar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
    } catch (error) {
        console.error('Erro ao salvar texto:', error);
    } finally {
        loading.value = false;
    }
};

const RecuperarTexto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/termo/recuperar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        if (response.data[0].Texto) {
            content.value = response.data[0].Texto;
        }
    } catch (error) {
        // console.error('Erro ao recuperar texto:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    RecuperarTexto();
});
</script>

<style scoped>
.vh {
  height: 100vh;
}</style>
