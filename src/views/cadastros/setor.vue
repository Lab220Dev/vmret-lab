<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaSetor = ref([]);
const ListaProdutoSetor = ref([]);
const ListaProdutoSelecionados = ref([]);
const editVisible = ref(false);
let setor = reactive({
    nome: '',
    codigo: '',
    id_centro_custo:''
})
const submitForm = () => {
    if (editVisible.value) {
        atualizarsetor();
    } else {
        adicionarsetor();
    }

};
const fetchSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaSetor.value = response.data;

    } catch (error) {
        console.error('Erro ao buscar Setores:', error);
    }
};
const adicionarSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...setor
    };
    try {
        const response = await axios.post('/setor/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchSetor();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao adicionar um Setor:', error);
    }
};
const atualizarSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...planta
    };
    try {
        const response = await axios.post('/setor/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchSetor();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao atualizar Setor:', error);
    }
};
const atualizarProdutoSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...ListaProdutoSelecionados
    };
    try {
        const response = await axios.post('/setor/atualizarproduto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchSetor();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao atualizar os produtos do setor Setor:', error);
    }
};
const fetchProdutoSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: setor.id_setor
    };
    try {
        const response = await axios.post('/setor/fetchProdutoSetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaProdutoSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao recuperar os produtos do setor:', error);
    }
};
const onRowSelect = (event) => {
    planta = event.data;
    active.value = 1;
    editVisible.value = true;
};
onMounted(() => {
    fetchSetor();
});
const resetForm = () => {
  setor.codigo ='';
  setor.id_centro_custo ='';
  setor.nome ='';
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Lista de Setores">
                        <DataTable :value="ListaPlanta" tableStyle="min-width: 50rem" :rowHover="true" stripedRows
                            dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                            <Column field="codigo" header="Codigo"></Column>
                            <Column field="id_centro_custo" header="Centro de Custo"></Column>
                            <Column field="nome" header="Setor(Nome)"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Adicionar Setor ">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="codigo">Codigo</label>
                                        <InputText id="codigo" v-model="setor.codigo" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Setor(Nome)</label>
                                        <InputText id="nome" v-model="setor.nome" required />
                                    </div>


                                    <div v-if="integração">
                                        <div class="field lg:col-12 md:col-6 sm:col-4">
                                            <label for="userid">UserID</label>
                                            <InputText id="userid" v-model="planta.userId" required />
                                        </div>
                                        <div class="field lg:col-12 md:col-6 sm:col-4">
                                            <label for="senha">Senha</label>
                                            <InputText id="senha" v-model="planta.senha" required />
                                        </div>
                                        <div class="field lg:col-12 md:col-6 sm:col-4">
                                            <label for="urlapi">URL</label>
                                            <InputText id="urlapi" v-model="planta.urlapi" required />
                                        </div>
                                        <div class="field lg:col-12 md:col-6 sm:col-4">
                                            <label for="idcliente">IDCliente</label>
                                            <InputText id="idcliente" v-model="planta.clienteid" required />
                                        </div>
                                    </div>

                                </div>
                                <div class="grid justify-content-end flex-wrap">
                                    <Button label="Adicionar Planta" type="submit" />
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>