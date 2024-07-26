<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const centroCusto = ref([]);
const visible = ref(false);
const ListaCentro = ref([]);
const deleteCentroDialog = ref(false);

let cdc = reactive({
    nome: '',
    id_centro_custo: ''
});

const onRowSelect = async (event) => {
    cdc = event.data;
    visible.value = true;
    active.value = 1;
    loadCentroCusto();
};

const submitForm = () => {
    if (visible.value) {
        atualizarCDC();
    } else {
        adicionarCentro();
    }
};

const loadCentroCusto = async () => {
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
        console.error('Erro ao listar centros de custo:', error);
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
        loadCentroCusto();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar centro de custo:', error);
    }
};

const deleteCentro = async () => {
    let data = { id_centro_custo: cdc.id_centro_custo };
    try {
        await axios.post('/cdc/deleteCentro', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // const index = ListaCentro.value.findIndex((f) => f.id_centro_custo === cdc.id_centro_custo);
        // if (index !== -1) {
        //     ListaCentro.value.splice(index, 1);
        // }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Centro Deletado', life: 3000 });
        deleteCentroDialog.value = false;
        loadCentroCusto();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o centro de custo', life: 3000 });
    }
    active.value = 0;
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
        loadCentroCusto();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar centros de custo:', error);
    }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadCentroCusto();
        visible.value = false;
    }
});

const resetForm = () => {
    (cdc.nome = ''), (cdc.codigo = ''), (cdc.id_centro_custo = '');
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadCentroCusto();
});
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Centros de Custo">
                <div class="col-12">
                    <DataTable :value="centroCusto" selectionMode="single" tableStyle="min-width: 25%" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <Column field="id_centro_custo" header="Código"></Column>
                        <Column field="nome" header="Centro de Custo (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <TabPanel header="Adicionar Centro de Custo" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_centro_custo">Código:</label>
                                        <InputText class="my-2" id="id_centro_custo" v-model="cdc.id_centro_custo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Centro de Custo (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="cdc.nome" required />
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

                        <Dialog header="Deletar Centro de Custo" v-model:visible="deleteCentroDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar esse centro de custo? <b>{{ cdc.id_centro_custo }}</b> - <b>{{ cdc.nome }}</b> ?</span
                                >
                            </div>

                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deleteCentroDialog = false" class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deleteCentro" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>
<style>
@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>