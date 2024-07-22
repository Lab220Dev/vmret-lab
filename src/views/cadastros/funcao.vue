<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaFuncao = ref([]);
const visible = ref(false);
const deleteFuncaoDialog = ref(false);

let funcao = reactive({
    id_funcao: '',
    nome: '',
    id_centro_custo: ''
});

const onRowSelect = (event) => {
    funcao = event.data;
    visible.value = true;
    active.value = 1;
    loadFuncao();
};

const submitForm = () => {
    if (visible.value) {
        atualizarFuncao();
    } else {
        adicionarFuncao();
    }
};

const loadFuncao = async () => {
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
        console.error('Erro ao listar Funções e Diretorias:', error);
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
        loadFuncao();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar Funções e Diretorias:', error);
    }
};

const deleteFuncao = async () => {
    let data = { id_centro_custo: cdc.id_centro_custo };
    try {
        await axios.post('/funcao/deleteFuncao', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // const index = ListaFuncao.value.findIndex((f) => f.id_funcao === funcao.id_funcao);
        // if (index !== -1) {
        //     ListaFuncao.value.splice(index, 1);
        // }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Função Deletada', life: 3000 });
        deleteFuncaoDialog.value = false;
        loadFuncao();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a função', life: 3000 });
    }
    active.value = 0;
};

const atualizarFuncao = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...funcao
    };
    try {
        const response = await axios.post('/funcao/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadFuncao();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Funções e Diretorias:', error);
    }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadFuncao();
        visible.value = false;
    }
});

const resetForm = () => {
    (funcao.id_funcao = ''), (funcao.nome = ''), (funcao.id_centro_custo = '');
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadFuncao();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Listar Funções">
                        <DataTable :value="ListaFuncao" selectionMode="single" tableStyle="min-width: 25%" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                            <Column field="id_funcao" header="Código"></Column>
                            <Column field="nome" header="Função (Nome)"></Column>
                            <Column field="id_centro_custo" header="Centro de Custo (Nome)"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Adicionar Função ">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid">
                                    <div class="field lg:col-12 md:col-4 sm:col-12">
                                        <label for="id_funcao">Código da Função</label>
                                        <InputText id="id_funcao" v-model="funcao.id_funcao" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-4 sm:col-12">
                                        <label for="nome">Função (Nome)</label>
                                        <InputText id="nome" v-model="funcao.nome" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-4 sm:col-12">
                                        <label for="id_centro_custo">Centro de Custo (Nome)</label>
                                        <InputText id="id_centro_custo" v-model="funcao.id_centro_custo" required />
                                    </div>
                                </div>
                                <!-- <div class="flex justify-content-between mt-5 flex-wrap">
                                    <div class="flex align-items-center">
                                        <Button label="Limpar Campos" icon="pi pi-eraser" @click="resetForm" />
                                    </div> -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Atualizar" icon="pi pi-refresh" severity="primary" @click="atualizarCDC" />
                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteCentroDialog = true" />
                                    <Button v-if="!visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarCentro" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>
                        <Dialog header="Deletar Função" v-model:visible="deleteFuncaoDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar essa função? <b>{{ funcao.id_funcao }}</b> - <b>{{ funcao.nome }}</b> ?</span
                                >
                            </div>

                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deleteFuncaoDialog = false" class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deleteFuncao" class="p-button-text" />
                            </template>
                        </Dialog>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>
