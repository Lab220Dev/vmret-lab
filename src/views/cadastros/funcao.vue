<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaFuncao = ref([])
const editVisible = ref(false);
let funcao = reactive({
    nome: '',
    codigo: ''
})
const submitForm = () => {

    if (editVisible.value) {
        atualizarFuncao();
    } else {
        adicionarFuncao();
    }

};
const fetchFuncao = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/funcao/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncao.value = response.data;

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const adicionarFuncao = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...funcao 
    };
    try {
        const response = await axios.post('/funcao/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchFuncao();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const atualizarFuncao = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...funcao 
    };
    try {
        const response = await axios.post('/cdc/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchFuncao();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};
const onRowSelect = (event) => {
    funcao = event.data;
    active.value = 1;
    editVisible.value = true;
};
onMounted(() => {
    fetchFuncao();
});
const resetForm = () =>{
    funcao.nome ='',
    funcao.codigo='',
    funcao.id_centro_custo=''
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Lista de Funções">
                        <DataTable :value="ListaFuncao" tableStyle="min-width: 50rem" :rowHover="true" stripedRows
                            dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                            <Column field="id_centro_custo" header="Centro de Custo"></Column>
                            <Column field="id_funcao" header="Função"></Column>
                            <Column field="nome" header="Nome"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Adicionar Função ">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Função(nome)</label>
                                        <InputText id="nome" v-model="funcao.nome" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Codigo da Função</label>
                                        <InputText id="nome" v-model="funcao.codigo" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="cdc">Centro de Custo(Nome)</label>
                                        <InputText id="cdc" v-model="funcao.cdc" required />
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