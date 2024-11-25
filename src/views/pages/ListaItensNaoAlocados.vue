<script setup>
import { FilterMatchMode } from 'primevue/api';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const loading = ref(false);
const store = useAuthStore();
const itens = ref([]); 
const sincronizado = ref(false); 
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const emptyMessage = ref('Nenhum item encontrado');

const fetchItensNaoAlocadas = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/naoalocados/recuperar', data);
        itens.value = response.data; 
        if (response.data.length === 0) {
            emptyMessage.value = 'Nenhum produto registrado';
        }
        sincronizado.value = false; 
    } catch (error) {
        if (error.response && error.response.status === 404) {
            emptyMessage.value = 'Nenhum produto registrado';
        } else {
            emptyMessage.value = 'Erro ao carregar itens não alocados';
            console.error('Erro ao carregar itens não alocados:', error);
        }
    } finally {
        loading.value = false;
    }
};

const sincronizar = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/naoalocados/sincronizar', data);
        itens.value = response.data.flatMap(cliente => 
            cliente.produtosComStatus.map(item => ({
                ...item.produto,  
                status: item.status 
            }))
        );
        sincronizado.value = true; 
    } catch (error) {
        console.error('Erro ao sincronizar itens:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchItensNaoAlocadas();
});
</script>

<template>
    <div class="card vh">
        <h5 class="my-4 text-2xl">Itens não alocados</h5>

        <!-- Botão Sincronizar -->
        <div class="mb-4 flex justify-content-end">
            <Button label="Sincronizar" icon="pi pi-refresh" class="p-button-secondary" @click="sincronizar" />
        </div>

        <DataTable v-model:filters="filters" :value="itens" 
        stripedRows 
        showGridlines 
        paginator 
        removableSort
        :rows="10"
        :sortOrder="1"
        :sortField="'codigo'"   
        :rowsPerPageOptions="[5, 10, 20, 50]" rowHover
        :globalFilterFields="['nome', 'quantidadeReferencia', 'codigo']" 
        selectionMode="single"
        tableStyle="min-width: 50rem; table-layout: fixed;">
        <template #header>
                            <div class="flex justify-content-between align-items-center ">
                                <div class="flex justify-content-start">
                                    <span>Total de registros: {{ itens.length }}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                                </div>
                            </div>
                        </template>
            <template #empty>{{ emptyMessage }}</template>

            <Column field="nome" sortable style="width: 70%" header="Item"></Column>
            <Column field="quantidadeReferencia" sortable style="width: 15%" header="Quantidade" class="text-center"></Column>
            <Column field="codigo" sortable style="width: 15%" header="CA"></Column>
            <Column v-if="sincronizado" header="Status">
                <template #body="slotProps">
                    <span>{{ slotProps.data.status }}</span>
                </template>
            </Column>
        </DataTable>
    </div>

    <LoadingSpinner v-if="loading" />
</template>

<style lang="css" scoped>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow: hidden;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
