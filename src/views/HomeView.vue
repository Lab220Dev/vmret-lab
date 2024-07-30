<script setup>
import { onMounted, ref, reactive } from 'vue';
import axios from 'axios';
import LastRecalls from '@/components/LastRecalls.vue';
import MostRecalled from '@/components/MostRecalled.vue';
import { useAuthStore } from '@/store/authStore'; //valida o token

axios.defaults.baseURL = 'http://localhost:3000/api';

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
        <!--cards-->
        <div class="xl:col-3 lg:col-3 md:col-6 sm:12 m-0">
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
        <div class="xl:col-3 lg:col-3 md:col-6 sm:12">
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
        <div class="xl:col-3 lg:col-3 md:col-6 sm:12">
            <div class="card mb-0">
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
        <div class="xl:col-3 lg:col-3 md:col-6 sm:12">
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
    
        <div class="xl:col-6 lg:col-6 md:col-6 sm:12">
            <!--chart-->
            <div class="card">
                <h5>Keep Alive</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>
        </div>

 <div v-if="canViewLastRecalls" class="xl:col-6 lg:col-6 md:col-6 sm:12">
            <MostRecalled :most="most" />
 </div>

        <!-- começo do componente de últimas retiradas, só se for permitido -->
        <div v-if="canViewLastRecalls" class="xl:col-6 lg:col-6 md:col-6 sm:12">
            <LastRecalls :products="products" />
        </div>
        <!-- fim do componente de últimas retiradas -->

        <div class="xl:col-6 lg:col-6 md:col-6 sm:12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5>Itens com estoque baixo</h5>
                    <div>
                        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu1.toggle($event)"></Button>
                        <Menu ref="menu1" :popup="true" :model="items"></Menu>
                    </div>
                </div>
                <span class="block text-600 font-medium mb-3">TODAY</span>
                <ul class="p-0 mx-0 mt-0 mb-4 list-none">
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-dollar text-xl text-blue-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Richard Jones
                            <span class="text-700">has purchased a blue t-shirt for <span class="text-blue-500">79$</span></span>
                        </span>
                    </li>
                    <li class="flex align-items-center py-2">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-download text-xl text-orange-500"></i>
                        </div>
                        <span class="text-700 line-height-3">Your request for withdrawal of <span class="text-blue-500 font-medium">2500$</span> has been initiated.</span>
                    </li>
                </ul>
                <span class="block text-600 font-medium mb-3">YESTERDAY</span>
                <ul class="p-0 m-0 list-none">
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-dollar text-xl text-blue-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Keyser Wick
                            <span class="text-700">has purchased a black jacket for <span class="text-blue-500">59$</span></span>
                        </span>
                    </li>
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-question text-xl text-pink-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Jane Davis
                            <span class="text-700">has posted a new questions about your product.</span>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style scoped>
.grid {
    margin: 0;
    
}
.card {
    margin-bottom: 0 !important;
    align-content: start;
}

</style>