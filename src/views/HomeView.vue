<script setup>
import { onMounted, ref, reactive } from 'vue';
import axios from '@/axios.js';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import { useAuthStore } from '@/store/authStore'; // Importa a store
import { useToast } from 'primevue/usetoast'; // Importa o toast

// Usa a store
const store = useAuthStore();
const toast = useToast(); // Inicializa o toast

const canViewLastRecalls = ref(false); // Controle de exibição

// Método de permissão
const checkPermission = () => {
    // Verifica a permissão do usuário
    if (store.userRole === 'Master' || store.userRole === 'Operador') {
        canViewLastRecalls.value = true; // Se for permitido, exibe os componentes
    }
};

const products = ref([]);
const most = ref([]);

const lineData = reactive({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
});

const items = ref([{ label: 'Ir ao relatório', icon: 'pi pi-chevron-right' }]);

const lineOptions = ref(null);

const fetchUltimasRetiradas = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/ultimos', data);
        products.value = response.data; // Atualiza os dados dos produtos
    } catch (error) {
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    }
};

const fetchMaisRetirados = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/relatorioItems/listarMaisRet', data);
        most.value = response.data; // Atualiza os dados dos produtos mais retirados
    } catch (error) {
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    }
};

onMounted(() => {
    // Exibe o toast se houver uma mensagem global
    if (store.getGlobalMessage) { // Usando o getter
        toast.add({
            severity: 'warn',
            summary: 'Acesso Negado',
            detail: store.getGlobalMessage,
            life: 3000
        });
        
        // Limpa a mensagem global após exibir o toast
        store.clearGlobalMessage();
    }

    checkPermission();
    if (canViewLastRecalls.value) {
        fetchUltimasRetiradas();
        fetchMaisRetirados(); // Busca só se tiver permissão
    }
});
const estoquebaixo = ref([
  { ProdutoNome: 'Produto 1', ProdutoSKU: 'SKU001', TotalQuantidade: 10 },
  { ProdutoNome: 'Produto 2', ProdutoSKU: 'SKU002', TotalQuantidade: 15 },
  { ProdutoNome: 'Produto 3', ProdutoSKU: 'SKU003', TotalQuantidade: 8 },
  { ProdutoNome: 'Produto 4', ProdutoSKU: 'SKU004', TotalQuantidade: 12 },
  { ProdutoNome: 'Produto 5', ProdutoSKU: 'SKU005', TotalQuantidade: 5 }
]);
</script>

<template>
    <div class="grid grid-cols-12">
        <!--cards-->
        <div class="col-12 xl:col-3 lg:col-3 md:col-6 sm:12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Orders</span>
                        <div class="text-900 font-medium text-xl">152</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">24 new </span>
                <span class="text-500">since last visit</span>
            </div>
        </div>
        <div class="col-12 xl:col-3 lg:col-3 md:col-6 sm:12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Revenue</span>
                        <div class="text-900 font-medium text-xl">$2.100</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">%52+ </span>
                <span class="text-500">since last week</span>
            </div>
        </div>
        <div class="col-12 xl:col-3 lg:col-3 md:col-6 sm:12">
            <div class="card">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Customers</span>
                        <div class="text-900 font-medium text-xl">28441</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">520 </span>
                <span class="text-500">newly registered</span>
            </div>
        </div>
        <div class="col-12 xl:col-3 lg:col-3 md:col-6 sm:12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Comments</span>
                        <div class="text-900 font-medium text-xl">152 Unread</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">85 </span>
                <span class="text-500">responded</span>
            </div>
        </div>

        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12 ">
            <div class="card card-item">
                <h5>Keep Alive</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>

            <div v-if="canViewLastRecalls" class="card card-item">
                <LastRecalls :products="products" />
            </div>
        </div>

        <div class="col-12 xl:col-6 lg:col-6 md:col-12 sm:12">
            <div class="card card-item">
                <div class="title" style="display: flex; align-items: center">
                    <h5 style="margin-right: 5px">Itens com estoque baixo</h5>
                </div>

                <!-- <i v-tooltip="'Itens mais retirados nos últimos 6 meses.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray"></i> -->

                <DataTable :rows="5" :value="estoquebaixo" responsiveLayout="scroll">
                    <Column field="ProdutoNome" header="Item" sortable style="width: 50%"></Column>
                    <Column field="ProdutoSKU" header="SKU" sortable style="width: 30%"></Column>
                    <Column field="TotalQuantidade" header="Quantidade" sortable style="width: 20%"></Column>
                </DataTable>
            </div>

            <div v-if="canViewLastRecalls" class="card card-item">
                <MostRecalled :most="most" />
            </div>
        </div>
    </div>
</template>

<style>
.grid-container {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Ajusta o número de colunas automaticamente */
  gap: 16px; /* Espaçamento entre os cards */
}

.card-item {
  height: 350px; /* Defina uma altura fixa */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Evita que o conteúdo saia do card */
}

</style>
