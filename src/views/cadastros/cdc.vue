<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const centroCusto = ref([])
const editVisible = ref(false);
let cdc = reactive({
    nome: '',
    codigo: ''
})
const submitForm = () => {

    if (editVisible.value) {
        atualizarCDC();
    } else {
        adicionarCentro();
    }

};
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCusto.value = response.data;

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const adicionarCentro = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...cdc 
    };
    try {
        const response = await axios.post('/cdc/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchCentroCusto();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const atualizarCDC = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...cdc 
    };
    try {
        const response = await axios.post('/cdc/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchCentroCusto();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const onRowSelect = (event) => {
    cdc = { ...event.data };
    active.value = 1;
    editVisible.value = true;
};
onMounted(() => {
    fetchCentroCusto();
});
const resetForm = () =>{
    cdc.nome ='',
    cdc.codigo='',
    cdc.id_centro_custo=''
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Lista de Centro de Custo">
                        <DataTable :value="centroCusto" tableStyle="min-width: 50rem" :rowHover="true" stripedRows
                            dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                            <Column field="id_centro_custo" header="Código"></Column>
                            <Column field="nome" header="Nome"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Adicionar de Centro de Custo">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Nome do Centro de Custo</label>
                                        <InputText id="nome" v-model="cdc.nome" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Codigo do Centro de Custo</label>
                                        <InputText id="nome" v-model="cdc.codigo" required />
                                    </div>
                                </div>
                                <div class="grid justify-content-end flex-wrap">
                                    <Button label="Adicionar" type="submit" />
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>