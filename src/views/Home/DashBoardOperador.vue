<template>
<Estoque :estoque="estoque" :dms="maquinas" :loading="loading" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore.js';
import Estoque from '@/components/Estoque.vue';
const store = useAuthStore();
const dataStore = useDataStore();
const estoque = ref([])
const maquinas = ref([])
const loading = ref(false);
const fetchData = async () => {
    loading.value = true;
    const data = { id_cliente: store.userIdCliente };
    try {
        // Dados para Tabela de Estoque
        const repostaEstoqueBaixo = await axios.post('/Estoque/outro', data);
        estoque.value = repostaEstoqueBaixo.data;
        maquinas.value = dataStore.dms || await dataStore.fetchListaDms();

    } catch (error) {
        console.error('Erro ao carregar dados do Master:', error);
    }finally{
        loading.value = false;
    }
};


onMounted(() => {
    fetchData();
});

</script>

<style></style>
