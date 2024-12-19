<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { useDataStore } from '@/store/dataStore.js';
import funcaoService from '@/services/funcaoService';
import { resetFuncaoForm } from '@/helpers/formHelper';

const dataStore = useDataStore();

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaFuncao = ref([]);
const visible = ref(false);
const todosOption = { label: 'Todos', value: null };
const centroCusto = ref([todosOption]);
const loading = ref(false);
const deleteFuncaoDialog = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filteredCount = ref(0);

let funcao = reactive(resetFuncaoForm());

const onRowSelect = (event) => {
    funcao = event.data;
    visible.value = true;
    active.value = 1;
};

const submitForm = async () => {
  try {
    loading.value = true;
    if (visible.value) {
      await funcaoService.atualizarFuncao(funcao);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função atualizada' });
    } else {
      await funcaoService.adicionarFuncao(funcao);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função adicionada' });
    }
    loadFuncoes();
    active.value = 0;
    funcao = reactive(resetFuncaoForm());
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar função' });
  } finally {
    loading.value = false;
  }
};

const loadFuncoes = async () => {
  loading.value = true;
  try {
    ListaFuncao.value = await funcaoService.listarFuncoes();
    filteredCount.value = ListaFuncao.value.length;
  } catch (error) {
    console.error(error.message);
  } finally {
    loading.value = false;
  }
};

watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = ListaFuncao.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const deleteFuncao = async () => {
  loading.value = true;
  try {
    await funcaoService.deletarFuncao(funcao.id_funcao);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função deletada' });
    loadFuncoes();
    deleteFuncaoDialog.value = false;
    funcao = reactive(resetFuncaoForm());
    active.value = 0;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao deletar função' });
  } finally {
    loading.value = false;
  }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        funcao = reactive(resetFuncaoForm());
        loadFuncoes();
        visible.value = false;
    }
});

const loadData = async () => {
    try {
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc());
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
};
onMounted(() => {
  loadFuncoes();
  loadData();
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Funções">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaFuncao"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        stripedRows
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        dataKey="id"
                        :globalFilterFields="['id_funcao', 'nome', 'id_centro_custo']"
                        :sortField="'id_funcao'"
                        :metaKeySelection="false"
                        :sortOrder="1"
                        @rowSelect="onRowSelect"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <span>Total de registros: {{ filteredCount }}</span>

                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>

                        <template #empty> Nenhuma função adicionada </template>
                        <Column field="id_funcao" sortable header="Código"></Column>
                        <Column field="nome" sortable header="Função (Nome)"></Column>
                        <Column field="id_centro_custo" sortable header="Centro de Custo (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? 'Editar Função' : 'Adicionar Função'" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
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
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="perfil">Centro de Custo:</label>
                                        <Dropdown class="my-2" v-model="funcao.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                                    </div>
                                </div>
                                <!-- <div class="flex justify-content-between mt-5 flex-wrap">
                                    <div class="flex align-items-center">
                                        <Button label="Limpar Campos" icon="pi pi-eraser" @click="resetForm" />
                                    </div> -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarFuncao" />
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteFuncaoDialog = true" />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarFuncao" />
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
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
