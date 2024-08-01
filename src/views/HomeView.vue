<script setup>
import { onMounted, ref, reactive } from 'vue';
import axios from '@/axios.js';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import { useAuthStore } from '@/store/authStore'; //valida o token

// Usa a store
const store = useAuthStore(); // useStore é chamado aqui

const canViewLastRecalls = ref(false); // controle de exibição

// metodo de permissão
const checkPermission = () => {
    // aqui faz a verificação
    if (store.userRole === 'Master' || store.userRole === 'Operador') {
        canViewLastRecalls.value = true; //se for verdade, mostra, do contrário não exibe e nem renderiza
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
        const response = await axios.post('/relatorioItems/ultimos', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // o token está sendo passado
            }
        });
        products.value = response.data; // Atualiza os dados do produto
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
        const response = await axios.post('/relatorioItems/listarMaisRet', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // o token está sendo passado
            }
        });
        most.value = response.data; // Atualiza os dados do produto
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
    checkPermission();
    if (canViewLastRecalls.value) {
        fetchUltimasRetiradas();
        fetchMaisRetirados(); // busca só se tiver permissão
    }
});
</script>

<template>
    <div class="grid">
        <!-- 4 cards pequenos -->
        <div class="col-12 xl:col-3 lg:col-3 md:col-6 sm:12 mb-0">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <!--card 1-->
                    <div>
                        <span class="block text-500 font-medium mb-3">Orders</span>
                        <div class="text-900 font-medium text-xl">152</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
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
                    <!--card 2-->
                    <div>
                        <span class="block text-500 font-medium mb-3">Revenue</span>
                        <div class="text-900 font-medium text-xl">$2.100</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
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
                    <!--card 3-->
                    <div>
                        <span class="block text-500 font-medium mb-3">Customers</span>
                        <div class="text-900 font-medium text-xl">28441</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
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
                    <!--card 4-->
                    <div>
                        <span class="block text-500 font-medium mb-3">Comments</span>
                        <div class="text-900 font-medium text-xl">152 Unread</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">85 </span>
                <span class="text-500">responded</span>
            </div>
        </div>
        <!--primeira coluna -->
        <div class="col-12 xl:col-6 lg:col-6 md:col-6 sm:12 pb-0 mb-0" v-if="canViewLastRecalls">
            <div class="card mb-0 dash">
                <h5>Keep Alive</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>

            <div v-if="canViewLastRecalls">
                <div class="card mb-0">
                    <LastRecalls :products="products" />
                </div>
            </div>
        </div>

        <!--segunda coluna-->
        <div class="col-12 xl:col-6 lg:col-6 md:col-6 sm:12">
            <!-- falta tabela ainda para popular os itens baixos-->
            <div class="card mb-0" v-if="canViewLastRecalls">
                <div class="header" style="display: flex">
                    <div class="title" style="display: flex; align-items: center">
                        <h5 style="margin-right: 5px">Itens com estoque baixo</h5>
                    </div>
                    <i v-tooltip="''" class="mt-1 pi pi-info-circle"
                        style="cursor: pointer; font-size: 1.2em; color: gray"></i>
                </div>
                <DataTable :rows="5" responsiveLayout="scroll">
                    <Column field="ProdutoNome" header="Item" sortable style="width: 40%"></Column>
                    <Column field="ProdutoSKU" header="SKU" sortable style="width: 30%"></Column>
                    <Column field="TotalQuantidade" header="Quantidade" sortable style="width: 30%"></Column>
                </DataTable>
            </div>
            <div v-if="canViewLastRecalls">
                <div class="card mb-0">
                    <MostRecalled :most="most" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
