<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaPlanta = ref([]);
const editVisible = ref(false);
const integração = ref(false);
let planta = reactive({
    nome: '',
    codigo: '',
    userId: '',
    senha: '',
    urlapi: '',
    clienteid: ''
})
const submitForm = () => {

    if (editVisible.value) {
        atualizarFuncao();
    } else {
        adicionarFuncao();
    }

};
const fetchPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/planta/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaPlanta.value = response.data;

    } catch (error) {
        console.error('Erro ao buscar Plantas:', error);
    }
};
const adicionarPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...planta
    };
    try {
        const response = await axios.post('/planta/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchPlanta();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao adicionar Plantas:', error);
    }
};
const atualizarPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...planta
    };
    try {
        const response = await axios.post('/planta/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        fetchPlanta();
        active.value = 0;
        resetForm();

    } catch (error) {
        console.error('Erro ao atualizar Plantas:', error);
    }
};
const onRowSelect = (event) => {
    planta = event.data;
    active.value = 1;
    editVisible.value = true;
};
onMounted(() => {
    fetchPlanta();
});
const resetForm = () => {
    planta.nome = '';
    planta.codigo = '';
    planta.clienteid = '';
    planta.senha = '';
    planta.url ='';
    planta.userId ='';
    integração.value = false;
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Lista de Plantas">
                        <DataTable :value="ListaPlanta" tableStyle="min-width: 50rem" :rowHover="true" stripedRows
                            dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                            <Column field="codigo" header="Centro de Custo"></Column>
                            <Column field="nome" header="Planta(Nome)"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Adicionar Planta ">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="codigo">Codigo</label>
                                        <InputText id="codigo" v-model="planta.codigo" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Planta(Nome)</label>
                                        <InputText id="nome" v-model="planta.codigo" required />
                                    </div>
                                    <InputSwitch v-model="integração" inputId="switch1" />
                                    <label for="switch1">Tem Integração?</label>

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