<script setup>
import { ref, onMounted } from 'vue';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';

const store = useAuthStore();
const products = ref([]);
const most = ref([]);

const fetchAdminData = async () => {
    const data = { id_cliente: store.userIdCliente };

    try {
        const recallsResponse = await axios.post('/relatorioItems/ultimos', data);
        const mostRecalledResponse = await axios.post('/relatorioItems/listarMaisRet', data);

        products.value = recallsResponse.data.slice(0, 5);
        most.value = mostRecalledResponse.data.slice(0, 5);
    } catch (error) {
        console.error('Erro ao carregar dados do Admin:', error);
    }
};

onMounted(() => {
    fetchAdminData();
});
</script>

<template>
    <div>
        <h3>Admin Dashboard</h3>
        <LastRecalls :products="products" />
        <MostRecalled :most="most" />
    </div>
</template>
