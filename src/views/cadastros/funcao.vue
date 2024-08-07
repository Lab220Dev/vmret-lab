<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaFuncao = ref([]);
const visible = ref(false);
const todosOption = { label: 'Todos', value: null };
const centroCusto = ref([todosOption]);
const loading = ref(false);
const deleteFuncaoDialog = ref(false);

let funcao = reactive({
    codigo: '',
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
    loading.value = true;
    try {
        const response = await axios.post('/funcao/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncao.value = response.data;
    } catch (error) {
        console.error('Erro ao listar Funções e Diretorias:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
const adicionarFuncao = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...funcao
    };
    loading.value = true;
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
    } finally {
        loading.value = false; // Desativando loading
    }
};

const deleteFuncao = async () => {
    let data = { id_funcao: funcao.id_funcao };
    loading.value = true;
    try {
        await axios.post('/funcao/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Função Deletada', life: 3000 });
        deleteFuncaoDialog.value = false;
        loadFuncao();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a função', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const atualizarFuncao = async () => {
    loading.value = true;
    const data = {
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
    } finally {
        loading.value = false; // Desativando loading
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

const loadCentroCusto = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCusto.value = [todosOption, ...response.data.map(({ ID_CentroCusto, Nome }) => ({
            label: `DM  ${Nome}`,
            value: ID_CentroCusto
        }))];
    } catch (error) {
        console.error('Erro ao listar centros de custo:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
onMounted(() => {
    loadFuncao();
    loadCentroCusto();
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Funções">
                <div class="col-12">
                    <DataTable :value="ListaFuncao" selectionMode="single" tableStyle="min-width: 25%" stripedRows
                        dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <template #empty> Nenhuma Função adicionada. </template>
                        <Column field="id_funcao" header="Código"></Column>
                        <Column field="nome" header="Função (Nome)"></Column>
                        <Column field="id_centro_custo" header="Centro de Custo (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Função" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_funcao">Código da Função:</label>
                                        <InputText class="my-2" id="id_funcao" v-model="funcao.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Função (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="funcao.nome" required />
                                    </div>
                                    <div class="field lg:col-4 md:col-6 sm:col-6">
                                        <label for="perfil">Centro de Custo:</label>
                                        <Dropdown class="drop" v-model="funcao.id_centro_custo"
                                            :options="centroCusto" optionLabel="label" optionValue="value"
                                            placeholder="Todos" ref="dropdown3" />
                                    </div>
                                </div>
                                <!-- <div class="flex justify-content-between mt-5 flex-wrap">
                                    <div class="flex align-items-center">
                                        <Button label="Limpar Campos" icon="pi pi-eraser" @click="resetForm" />
                                    </div> -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" style="width: 15%;"
                                        class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                        icon="pi pi-check" severity="primary" @click="atualizarFuncao" />
                                    <Button v-if="visible" style="width: 15%;"
                                        class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir"
                                        icon="pi pi-trash" severity="danger" @click="deleteFuncaoDialog = true" />
                                    <Button v-if="!visible" style="width: 15%;"
                                        class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                        icon="pi pi-check" severity="info" @click="adicionarFuncao" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>
                        <Dialog header="Deletar Função" v-model:visible="deleteFuncaoDialog" style="width: 400px"
                            :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar essa função? <b>{{ funcao.id_funcao }}</b> -
                                    <b>{{
                                        funcao.nome }}</b> ?</span>
                            </div>

                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deleteFuncaoDialog = false"
                                    class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deleteFuncao" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
