<script setup>
import { FilterMatchMode } from 'primevue/api';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const loading = ref(false);
const store = useAuthStore();
const itens = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const fetchItensNãoAlocadas = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        // const response = await axios.post('/funcionarios/listar', data, {
        //     headers: {
        //         Authorization: `Bearer ${store.token}`
        //     }
        // });
        itens.value = [];
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }finally{
        loading.value = false;
    }
};
onMounted(() => {
    fetchItensNãoAlocadas();
});
</script>

<template>
    <div class="card vh">
        <div class="datatable-wrapper">
            <DataTable v-model:filters="filters" :value="itens" stripedRows showGridlines paginator :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]" rowHover 
                :globalFilterFields="['ProdutoNome', 'descricao', 'ProdutoSKU']" selectionMode="single"
                :tableStyle="{ width: '100%' }">
                <template #header>
                    <div class="flex justify-content-end">
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                        </IconField>
                    </div>
                </template>
                <template #empty>{{ emptyMessage }} </template>
                <Column field="ProdutoNome" sortable header="Item"></Column>
                <Column field="quantidade_no_periodo" sortable header="Quantidade" class="text-center"></Column>
                <Column field="ProdutoSKU" sortable header="CA"></Column>
            </DataTable>
        </div>
    </div>
    
    <LoadingSpinner v-if="loading" />
</template>

<style lang="css" scoped></style>