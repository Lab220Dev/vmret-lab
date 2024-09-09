<script setup>
import { ref, onMounted } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
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

const modalVisible = ref(false);
const novoPrazo = ref(''); // Ref para o novo prazo

const integracao = ref(null); // Ref para o valor do radio button selecionado
const userid = ref(''); // Ref para o valor do input text
const store = useAuthStore();

// const fetchbusca = async () => {
//     loading.value = true;
//     const data = {
//         id_cliente: store.userIdCliente
//     };
//     try {
//         const response = await axios.post('/Estoque/listar', data, {
//             headers: {
//                 Authorization: `Bearer ${store.token}`
//             }
//         });
//         busca.value = response.data.map(({ ID_DM, Numero }) => ({
//             label: `${Numero}`,
//             value: ID_DM
//         }));
//     } catch (error) {
//         console.error('Erro ao listar busca:', error);
//     } finally {
//         loading.value = false;
//     }
// };

const libMock = ref([
    { status: 'Ativo', voucher: 'A123', matricula: 'BTK123', nome: 'Alguém', dataliberacao: '00/00/0000', nome2: 'Ninguém', token: '27', dataret: '32/13/3000', dm: '10', compartimento: '6' },
    { status: 'Inativo', voucher: 'B456', matricula: 'BTK456', nome: 'Não sei', dataliberacao: '00/00/0000', nome2: 'Ninguém', token: '27', dataret: '32/13/3000', dm: '6', compartimento: '10' }
]);

const relatorioLA = async () => {
    loading.value = true;

    const data = {
        id_cliente: store.userIdCliente,
        id_usuario: store.userId,
        tipo_filtro: integracao.value, // Tipo de filtro (1 para Matrícula, 2 para Voucher)
        valor_filtro: userid.value // Valor do filtro (matrícula ou voucher)
    };

    try {
        const response = await axios.post('/Estoque/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        LiberacaoAvulsa.value = response.data;
    } catch (error) {
        console.error('Erro ao gerar o Relatório de Liberações Avulsas:', error);
    } finally {
        loading.value = false;
    }
};


const selectedItem = ref(null);

const onRowSelect = (event) => {
    selectedItem.value = event.data; // Armazena o item selecionado
    modalVisible.value = true; // Mostra o modal
};

const salvar = () => {
    // Implementar lógica para salvar o novo prazo
    console.log('Novo Prazo:', novoPrazo.value);
    modalVisible.value = false;
};

const fechar = () => {
    modalVisible.value = false;
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    // fetchbusca();
});
</script>

<template>
    <div class="card vh">
        <h5 class="my-4 mx-3">Consultar Status de Liberações Avulsas</h5>
        <div class="card">
            <!-- Container principal com duas colunas -->
            <div class="grid">
                <!-- Coluna 1: Filtrar por e Radio Buttons -->
                <div class="lg:col-6 md:col-12 sm:col-12 align-items-center">
                    <label for="liberAv" class="ml-3 mt-3">Filtrar por:</label>
                    <div class="flex flex-wrap">
                        <div v-for="option in liberAv" :key="option.value" class="flex align-items-center mt-3 ml-4">
                            <RadioButton v-model="integracao" :inputId="option.value" class="ml-4" name="searchOption" :value="option.value" />
                            <label :for="option.value" class="ml-2">{{ option.label }}</label>
                        </div>
                    </div>
                </div>

                <div class="lg:col-6 md:col-12 flex-column lg:flex-row align-items-center justify-content-end flex">
                    <div class="mb-3 lg:mb-0">
                        <div v-if="integracao === '1'" class="align-items-center">
                            <label for="userid" class="mr-2 nowrap">Informe a matrícula:</label>
                            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
                        </div>
                        <div v-if="integracao === '2'" class="align-items-center">
                            <label for="userid" class="mr-2 nowrap">Informe o voucher:</label>
                            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
                        </div>
                    </div>
                    <Button class="mt-3 w-20rem ml-2" style="width: 160px" type="button" label="Filtrar" icon="pi pi-search" severity="info" @click="libMock" />
                </div>
            </div>
            <DataTable class="mt-2" selectionMode="single" :value="libMock" stripedRows showGridlines paginator :rows="10" dataKey="SKU" @row-select="handleRowSelection" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
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
            <Dialog :header="selectedItem ? `Alterar Prazo de Retirada: ${selectedItem.nome}` : 'Alterar Prazo de Retirada'" v-model:visible="modalVisible" modal>
                <div v-if="selectedItem">
                    <label for="novoPrazo">Novo Prazo:</label>
                    <InputText id="novoPrazo" v-model="novoPrazo" class="w-full mt-2" />
                </div>
                <div class="mt-4">
                    <Button label="Salvar" @click="salvar" />
                    <Button label="Cancelar" class="p-button-secondary" @click="fechar" />
                </div>
            </Dialog>
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

.nowrap {
    white-space: nowrap;
}

@media (max-width: 768px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
    .box {
        width: 50vw;
    }
}

@media (min-width: 769px) {
    .box {
        width: 40vw;
    }
}

@media (min-width: 900px) {
    .box {
        width: 30vw;
    }
}

.card {
    overflow: hidden; /* Ensure content doesn't overflow */
    box-sizing: border-box; /* Include padding and border in element's total width and height */
}
</style>
