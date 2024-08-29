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
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const emptyMessage = ref('Nenhum item encontrado');

const fetchItensNãoAlocadas = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/naoalocados/recuperar', data);
        itens.value = response.data; // Preenche os itens com a resposta
        if (response.data.length === 0) {
            emptyMessage.value = 'Nenhum produto registrado'; // Exibe mensagem se não houver itens
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Se o backend retornar 404, exibe a mensagem personalizada
            emptyMessage.value = 'Nenhum produto registrado';
        } else {
            // Se for outro erro, exibe uma mensagem genérica
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
        itens.value = []
        itens.value = response.data; // precisa limpar e adicionar os itens
    } catch (error) {
        console.error('Erro ao carregar itens não alocados:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchItensNãoAlocadas();
});
</script>

<template>
    <div class="card vh">
        <h5 class="my-4 text-2xl">Itens não alocados</h5>

        <!-- Botão Sincronizar -->
        <div class="mb-4 flex justify-content-end">
            <Button label="Sincronizar" icon="pi pi-refresh" class="p-button-secondary" @click="sincronizar" />
        </div>
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
            <template #empty>{{ emptyMessage }}</template>
            <Column field="nome" sortable header="Item"></Column>
            <Column field="quantidadeReferencia" sortable header="Quantidade" class="text-center"></Column>
            <Column field="ca" sortable header="CA"></Column>
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
