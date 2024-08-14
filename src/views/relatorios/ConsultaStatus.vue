<script setup>
import { ref, onMounted } from 'vue';

import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const liberAv = ref([
    { label: 'Matrícula', value: '1' },
    { label: 'Voucher', value: '2' }
]);

const loading = ref(false);
const relatorio = ref({
    busca: ''
});
const LiberacaoAvulsa = ref([]);
const integracao = ref(null); // Ref para o valor do radio button selecionado
const userid = ref(''); // Ref para o valor do input text
const store = useAuthStore();

const fetchbusca = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/Estoque/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        busca.value = response.data.map(({ ID_DM, Numero }) => ({
            label: `${Numero}`,
            value: ID_DM
        }));
    } catch (error) {
        console.error('Erro ao listar busca:', error);
    } finally {
        loading.value = false;
    }
};

const relatorioLA = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente,
        id_usuario: store.userId,
        ...relatorio.value
    };
    try {
        const response = await axios.post('/Estoque/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        LiberacaoAvulsa.value = response.data;
    } catch (error) {
        console.error('Erro ao gerar o Relatorio de Liberações Avulsas:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchbusca();
});
</script>

<template>
    <div class="card vh">
        <h5 class="my-4 mx-3">Consultar Status de Liberações Avulsas</h5>
            <div class="card ">
                <!-- Container principal com duas colunas -->
                <div class="grid ">
                    <!-- Coluna 1: Filtrar por e Radio Buttons -->
                    <div class=" lg:col-6 md:col-12 sm:col-12 align-items-center">
                        <label for="liberAv" class="ml-3 mt-3">Filtrar por:</label>
                        <div class="flex flex-wrap">
                            <div v-for="option in liberAv" :key="option.value" class="flex align-items-center mt-3 ml-4">
                                <RadioButton v-model="integracao" :inputId="option.value"  class="ml-4" name="searchOption" :value="option.value" />
                                <label :for="option.value" class="ml-2">{{ option.label }}</label>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-6 md:col-12 flex-column lg:flex-row align-items-center justify-content-end flex">
    <div class="mb-3 lg:mb-0">
        <div v-if="integracao === '1'" class="align-items-center">
            <label for="userid" class="mr-2">Informe a matrícula:</label>
            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
        </div>
        <div v-if="integracao === '2'" class="align-items-center">
            <label for="userid" class="mr-2">Informe o voucher:</label>
            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
        </div>
    </div>
    <Button class="mt-3 w-20rem ml-2" style="width: 160px" type="button" label="Filtrar" icon="pi pi-search" severity="info" />
</div>
        </div>
        <DataTable class="mt-2" value="LiberacaoAvulsa" stripedRows showGridlines paginator :rows="10" dataKey="SKU" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <Column field="status" header="Status"></Column>
            <Column field="voucher" header="Voucher"></Column>
            <Column field="matricula" header="Matrícula"></Column>
            <Column field="nome" header="Nome"></Column>
            <Column field="dataliberacao" header="Data da Liberação"></Column>
            <Column field="nome2" header="Liberado por"></Column>
            <Column field="token" header="Token"></Column>
            <Column field="dataret" header="Data de retirada"></Column>
            <Column field="dm" header="DM"></Column>
            <Column field="compartimento" header="Compartimento"></Column>
        </DataTable>
        <LoadingSpinner v-if="loading" />
    </div>
    </div>
</template>

<style scoped>
.card {
    overflow-x: auto;
    padding: 1rem;
    position: relative;
}

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.drop {
    width: 100%;
}

/* @media (max-width: 1024px) {
    .card .flex {
        flex-direction: column;
        align-items: flex-start;
    }

    .card .flex.align-items-center {
        width: 100%;
    }

    .card .flex.align-items-center .ml-4 {
        margin-left: 0;
        margin-top: 1rem;
    }

    .card .flex.align-items-center label {
        width: 100%;
        text-align: left;
    }
} */

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
