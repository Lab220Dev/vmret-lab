<template>
    <div class="grid grid-cols-12">
        <!-- Resumo -->
        <div class="col-12">
            <h5>Resumo</h5>
            <SumarioAdmin :dados="dados" />
        </div>

        <!-- Mapa de Calor -->
        <!-- <div class="col-12">
            <h5>Mapa de Calor</h5>
            <Heatmap :clientes="lista" />
        </div> -->

        <!-- Tabela de Notificações -->
        <div class="col-12">
            <h5>Notificações</h5>
            <Notificacoes :listanoti="formattedListanoti" />
        </div>
    </div>
    <Spinner v-if="loading" />
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import SumarioAdmin from '@/components/SumarioAdmin.vue';
// import Heatmap from '@/components/Heatmap.vue';
import Notificacoes from '@/components/TabelaNotificacoes.vue';
import { useToast } from 'primevue/usetoast';
import Spinner from '@/components/LoadingSpinner.vue'
import dashboardService from '@/services/dashboardService';
const dados = ref({});
const lista = ref([]);
const notifcacoes = ref([]);
const loading = ref(false);
const toast = useToast();

const fetchData = async () => {
    loading.value = true;
     try {
        const result = await dashboardService.fetchAdminData();
    dados.value = result.dados;
    // lista.value = result.lista;
    notifcacoes.value = result.notificacoes;

    } catch (error) {
        console.error('Erro nas requisições:', error); 
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados do dashboard', life: 3000 });
    }finally{
        loading.value = false;
        console.log('Spinner desativado:', loading.value);
    }
};
const formattedListanoti = computed(() => {
    return Array.isArray(notifcacoes.value)
        ? notifcacoes.value
        : [{ cliente: '-', tipo: '-', date: '-', status: 'Sem notificações' }];
});
onMounted(async () => {
   await fetchData();
});
</script>

<style>
.card {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
}

.card-item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.grid-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}
</style>
