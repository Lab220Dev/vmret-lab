<template>
<Estoque :estoque="estoque" :dms="maquinas" :loading="loading" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dashboardService from '@/services/dashboardService';
import Estoque from '@/components/Estoque.vue';
const estoque = ref([])
const maquinas = ref([])
const loading = ref(false);
const fetchData = async () => {
    loading.value = true;
    try {
        const result = await dashboardService.fetchOperadorData();
        estoque.value = result.estoque;
        maquinas.value = result.maquinas;

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
