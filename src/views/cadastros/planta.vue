<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaPlanta = ref([]);
const visible = ref(false);
const integracao = ref(false);
const deletePlantaDialog = ref(false);

let planta = reactive({
    nome: '',
    id_planta: '',
    userId: '',
    senha: '',
    urlapi: '',
    clienteid: ''
});

const onRowSelect = (event) => {
    planta = event.data;
    active.value = 1;
    visible.value = true;
    loadPlanta();
};

const submitForm = () => {
    if (visible.value) {
        atualizarPlanta();
    } else {
        adicionarPlanta();
    }
};

const loadPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaPlanta.value = response.data;
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
    }
};

const adicionarPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...planta
    };
    try {
        const response = await axios.post('/plantas/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadPlanta();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar planta:', error);
    }
};

const deletePlanta = async () => {
    let data = { id_planta: planta.id_planta };
    try {
        await axios.post('/planta/deletePlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // const index = ListaPlanta.value.findIndex((f) => f.id_Planta === planta.id_Planta);
        // if (index !== -1) {
        //     ListaPlanta.value.splice(index, 1);
        // }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Planta Deletada', life: 3000 });
        deletePlantaDialog.value = false;
        loadPlanta();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a planta.', life: 3000 });
    }
    active.value = 0;
};

const atualizarPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...planta
    };
    try {
        const response = await axios.post('/plantas/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadPlanta();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Plantas:', error);
    }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadPlanta();
        visible.value = false;
    }
});

const resetForm = () => {
    planta.nome = '';
    planta.id_planta = '';
    planta.clienteid = '';
    planta.senha = '';
    planta.url = '';
    planta.userId = '';
    integracao.value = false;
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadPlanta();
});
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Plantas">
                <div class="col-12">
                    <DataTable :value="ListaPlanta" selectionMode="single" tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <Column field="id_planta" header="Planta de Custo"></Column>
                        <Column field="nome" header="Planta (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Planta" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="id_planta">Código:</label>
                                        <InputText id="id_planta" v-model="planta.id_planta" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Planta (Nome):</label>
                                        <InputText id="nome" v-model="planta.nome" required />
                                    </div>
                                    <InputSwitch class="ml-3" v-model="integracao" inputId="switch1" />
                                    <label class="ml-2" for="switch1">Tem integração?</label>

                                    <div v-if="integracao" class="card mt-4">
                                        <div v-if="integracao" class="my-3 grid">
                                            <div class="field lg:col-6 md:col-6 sm:col-4">
                                                <label for="userid">UserID:</label>
                                                <InputText id="userid" v-model="planta.userId" required />
                                            </div>
                                            <div class="field lg:col-6 md:col-6 sm:col-4">
                                                <label for="senha">Senha:</label>
                                                <InputText id="senha" v-model="planta.senha" required />
                                            </div>
                                            <div class="field lg:col-6 md:col-6 sm:col-4">
                                                <label for="urlapi">URL:</label>
                                                <InputText id="urlapi" v-model="planta.urlapi" required />
                                            </div>
                                            <div class="field lg:col-6 md:col-6 sm:col-4">
                                                <label for="idcliente">ID Cliente:</label>
                                                <InputText id="idcliente" v-model="planta.clienteid" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- <div class="flex justify-content-between mt-5 flex-wrap">
                                    <div class="flex align-items-center">
                                        <Button label="Limpar Campos" icon="pi pi-eraser" @click="resetForm" />
                                    </div> -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Atualizar" icon="pi pi-refresh" severity="primary" @click="atualizarPlanta" />
                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deletePlantaDialog = true" />
                                    <Button v-if="!visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarPlanta" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>
                        
                        <Dialog header="Deletar Planta" v-model:visible="deletePlantaDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar essa planta? <b>{{ planta.id_planta }}</b> - <b>{{ planta.nome }}</b> ?</span
                                >
                            </div>

                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deletePlantaDialog = false" class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deletePlanta" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>
