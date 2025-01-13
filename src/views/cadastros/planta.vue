
<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import plantaService from '@/services/plantaService.js';
import { resetPlantaForm,applyGlobalFilter} from '@/helpers/formHelper';
import { useDataStore } from '@/store/dataStore.js';

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const active = ref(0);
const store = useAuthStore();
const dataStore = useDataStore();
const toast = useToast();
const ListaPlanta = ref([]);
const visible = ref(false);
const integracao = ref(false);
const deletePlantaDialog = ref(false);
const loading = ref(false);

const filteredCount = ref(0);

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
  loading.value = true;
  try {
    const response = await plantaService.listarPlantas(store.userIdCliente, store.token);
    ListaPlanta.value = response.data;
    filteredCount.value = ListaPlanta.value.length;
  } catch (error) {
    console.error('Erro ao listar plantas:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao listar plantas.', life: 3000 });
  } finally {
    loading.value = false;
  }
};

watch(
  () => filters.value.global.value,
  () => {
    filteredCount.value = applyGlobalFilter(ListaPlanta.value, filters.value.global.value).length;
  },
  { immediate: true }
);

const adicionarPlanta = async () => {
  loading.value = true;
  try {
    await plantaService.adicionarPlanta(
      { id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta },
      store.token
    );
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Planta adicionada com sucesso!', life: 3000 });
    loadPlanta();
    active.value = 0;
    resetPlantaForm(planta);
  } catch (error) {
    console.error('Erro ao adicionar planta:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar planta.', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const deletePlanta = async () => {
    let data = { id_planta: planta.id_planta }
  loading.value = true;
  try {
        // await axios.post('/plantas/deletePlanta', data, {
        //     headers: {
        //         Authorization: `Bearer ${store.token}`
        //     }
        // });
        await plantaService.deletarPlanta(data);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Planta deletada com sucesso!', life: 3000 });
    dataStore.invalidatePlantasCache();
    deletePlantaDialog.value = false;
    loadPlanta();
    active.value = 0;
    //resetPlantaForm(planta);
  } catch (error) {
    console.error('Erro ao deletar planta:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar planta.', life: 3000 });
  } finally {
    loading.value = false;
  }
};


const atualizarPlanta = async () => {
  loading.value = true;
  try {
    await plantaService.atualizarPlanta(
      { id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta },
      store.token
    );
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Planta atualizada com sucesso!', life: 3000 });
    loadPlanta();
    active.value = 0;
    resetPlantaForm(planta);
  } catch (error) {
    console.error('Erro ao atualizar planta:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar planta.', life: 3000 });
  } finally {
    loading.value = false;
  }
};

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadPlanta();
        visible.value = false;
    }
});

const resetForm = () => resetPlantaForm(planta);

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => loadPlanta());
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Plantas">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaPlanta"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        paginator
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        removableSort
                        stripedRows
                        :globalFilterFields="['id_planta', 'nome']"
                        :sortField="'id_planta'"
                        :sortOrder="1"
                        dataKey="id"
                        :metaKeySelection="false"
                        @rowSelect="handleRowSelection"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> Nenhuma planta adicionada. </template>
                        <Column field="id_planta" sortable header="Planta de Custo"></Column>
                        <Column field="nome" sortable header="Planta (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? 'Editar Planta' : 'Adicionar Planta'">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">Código:</label>
                                        <InputText class="my-2" id="id_planta" v-model="planta.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Planta (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="planta.nome" required />
                                    </div>
                                    <InputSwitch class="grid mt-3 ml-3" v-model="integracao" inputId="switch1" />
                                    <label class="mt-3 ml-4" for="switch1">Tem integração?</label>

                                    <div v-if="integracao" class="card mt-4">
                                        <div v-if="integracao" class="my-3 grid">
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="userid">UserID:</label>
                                                <InputText class="my-2" id="userid" v-model="planta.userid" required />
                                            </div>
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="senha">Senha:</label>
                                                <InputText class="my-2" id="senha" v-model="planta.senha" required />
                                            </div>
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="urlapi">URL:</label>
                                                <InputText class="my-2" id="urlapi" v-model="planta.urlapi" required />
                                            </div>
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="idcliente">ID Cliente:</label>
                                                <InputText class="my-2" id="idcliente" v-model="planta.clientid" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarPlanta" />
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deletePlantaDialog = true" />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarPlanta" />
                                </div>
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
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style scoped>
.overflow-scroll {
    overflow: scroll;
    resize: none;
}

@media (max-width: 1024px) {
    .text-center {
        margin: 2px;
    }
}

.field {
    padding: 4.5px;
}

.buttons {
    width: 200px;
}

.titulo {
    white-space: pre-wrap;
    text-align: center;
}

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
