<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import '@vuepic/vue-datepicker/dist/main.css';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { useDataStore } from '@/store/dataStore.js';
import setorService from '@/Services/SetorService.js';
import { resetSetorForm,applyGlobalFilter } from '@/helpers/formHelper.js';
import { enrichData } from '@/helpers/HelperUtils.js';

const active = ref(0);
const store = useAuthStore();
const dataStore = useDataStore();
const toast = useToast();
const ListaSetor = ref([]);
const ListaItensSetor = ref([]);
const ItensSetor = ref([]);
const itemDialog = ref(false);
const ListaItensSelecionados = ref([]);
const deleteSetorDialog = ref(false);
const deleteProductDialog = ref(false);
const visible = ref(false);
const editVisible = ref(false);
const integracao = ref(false);
const item = ref({});
const selectedProduct = ref({});
const itemsSelecionadosSetor = ref([]);
const todosOption = { label: 'Todos', value: null };
const centroCusto = ref([todosOption]);
const loading = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filteredCount = ref(0);

let setor = reactive({
    codigo: '',
    nome: '',
    id_centro_custo: ''
});
const produtoSelecionado = ref({
    id_produto: '',
    quantidade: ''
});
const onRowSelect = (event) => {
    setor = event.data;
    active.value = 1;
    editVisible.value = true;
    fetchProdutoSetor();
    fetchListaItemSetor();
};

const onRowSelectItem = (event) => {
    // Atribuir o item selecionado ao `item`
    item.value = { ...event.data }; // Cria uma cópia do item selecionado
    itemDialog.value = true; // Abre o dialog de edição
};

const submitForm = () => {
    if (editVisible.value) {
        atualizarSetor();
    } else {
        adicionarSetor();
    }
};

const loadSetor = async () => {
    const data = { id_cliente: store.userIdCliente };

    try {
        loading.value = true;
        const response = await setorService.listarSetores(data, store.token);
        ListaSetor.value = response.data;
        filteredCount.value = ListaSetor.value.length
    } catch (error) {
        console.error('Erro ao listar setores:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao listar setores.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const adicionarSetor = async () => {
    const enrichedSetor = enrichData(setor);

    try {
        loading.value = true;
        await setorService.adicionarSetor(enrichedSetor);
        dataStore.invalidateSetorCache();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Setor salvo com sucesso!', life: 3000 });
        loadSetor();
        resetForm();
        active.value = 0;
    } catch (error) {
        console.error('Erro ao adicionar setor:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar setor.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

watch(
  () => filters.value.global.value,
  () => {
    filteredCount.value = applyGlobalFilter(ListaSetor.value, filters.value.global.value).length;
  },
  { immediate: true }
);

const deleteSetor = async () => {
    const enrichedSetor = enrichData(setor);

    try {
        loading.value = true;
        await setorService.deletarSetor(enrichedSetor);
        dataStore.invalidateSetorCache();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Setor Deletado com sucesso!', life: 3000 });
        loadSetor();
        resetForm();
        active.value = 0;
    } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar setor.', life: 3000 });
    } finally {
        loading.value = false;
    }
    active.value = 0;
};

const atualizarSetor = async () => {
    const enrichedSetor = enrichData(setor);

    try {
        loading.value = true;
        await setorService.atualizarSetor(enrichedSetor);
        dataStore.invalidateSetorCache();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Setor atualizado com sucesso!', life: 3000 });
        loadSetor();
        resetForm();
        active.value = 0;
    } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar setor.', life: 3000 });
    } finally {
        loading.value = false;
    }
};
const fetchListaItemSetor = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: setor.id_setor
    };
    try {
        const response = await setorService.listarItensDisponiveis(data);
        ItensSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao listar itens:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadSetor();
        visible.value = false;
        editVisible.value = false;
    }
});

const resetForm = () => {
    resetSetorForm(setor);
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

const loadData = async () => {
    try {
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc());
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
};
onMounted(() => {
    loadSetor();
    loadData();
});

const atualizarProdutoSetor = async () => {
  const data = {
    id_cliente: store.userIdCliente,
    id_produto: item.value.id_produto,
    id_setor: item.value.id_setor,
    qtd_limite: item.value.quantidade,
  };

  loading.value = true;
  try {
    await setorService.atualizarProdutoSetor(data);
    fetchListaItemSetor();
    itemDialog.value = false;

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Produto atualizado com sucesso!',
      life: 3000,
    });
  } catch (error) {
    console.error('Erro ao atualizar o produto:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao atualizar o produto. Verifique a quantidade e tente novamente.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const fetchProdutoSetor = async () => {
  const data = { id_cliente: store.userIdCliente, id_setor: setor.id_setor };

  try {
    const response = await setorService.fetchProdutoSetor(data);
    ListaItensSetor.value = response.data.map(({ id_produto, nome }) => ({
      label: nome,
      value: id_produto,
    }));
  } catch (error) {
    console.error('Erro ao recuperar os produtos do setor:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao recuperar os produtos do setor.',
      life: 3000,
    });
  }
};

const SalvarProduto = async () => {
  const data = {
    id_cliente: store.userIdCliente,
    id_usuario: store.userId,
    id_produto: produtoSelecionado.value.id_produto,
    quantidade: produtoSelecionado.value.quantidade,
    id_setor: setor.id_setor,
  };

  loading.value = true;
  try {
    await setorService.adicionarProduto(data);
    fetchListaItemSetor();
    visible.value = false;

    toast.add({
      severity: 'success',
      summary: 'Produto Adicionado',
      detail: 'O produto foi adicionado com sucesso!',
      life: 3000,
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao adicionar o produto.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};


const deletarProduto = async () => {
  const data = {
    id_cliente: store.userIdCliente,
    id_produto: item.value.id_produto,
    id_setor: item.value.id_setor,
  };

  loading.value = true;
  try {
    await setorService.deletarProduto(data);
    fetchListaItemSetor();

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Produto deletado com sucesso.',
      life: 3000,
    });
    deleteProductDialog.value = false;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao deletar o produto.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};


const deleteProduct = async (itm) => {
    item.value = itm;
    deleteProductDialog.value = true;
};
</script>

<template>
    <div class="card vh">
        <!-- inicio do tabview-->
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Setores">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaSetor"
                        stripedRows
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        :sortField="'codigo'"
                        :sortOrder="1"
                        dataKey="codigo"
                        :globalFilterFields="['codigo', 'nome', 'id_centro_custo']"
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

                        <template #empty> Nenhum setor adicionado. </template>
                        <Column field="codigo" sortable header="Código"></Column>
                        <Column field="nome" sortable header="Setor (Nome)"></Column>
                        <Column field="id_centro_custo" sortable header="Centro de Custo"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- fim do listar -->
            <!-- inicio do adicionar-->
            <TabPanel :header="editVisible ? 'Editar Setor' : 'Adicionar Setor'" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="codigo">Código:</label>
                                        <InputText class="my-2" id="codigo" v-model="setor.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Setor (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="setor.nome" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="centro">Centro de Custo (Nome):</label>
                                        <Dropdown class="drop my-2" v-model="setor.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarSetor" />
                                    <Button v-if="editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteSetorDialog = true" />
                                    <Button v-if="!editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarSetor" />
                                </div>
                                <div class="col-12">
                                    <TabView v-if="editVisible">
                                        <TabPanel header="Itens Disponíveis para o Setor">
                                            <Button class="my-3" @click="visible = true" label="Adicionar" />
                                            <DataTable
                                                class=""
                                                paginator
                                                removableSort
                                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                                :rows="10"
                                                :value="ItensSetor"
                                                stripedRows
                                                dataKey="sku"
                                                v-model="setor.itemsSelecionadosSetor"
                                                @rowSelect="onRowSelectItem"
                                            >
                                                <Column field="sku" sortable header="SKU"></Column>
                                                <Column field="nome" header="Nome"></Column>
                                                <Column field="qtd_limite" header="Quantidade"></Column>
                                                <Column field="dias" header="Prazo"></Column>
                                                <Column style="width: 10%">
                                                    <template #body="slotProps">
                                                        <Button icon="pi pi-pencil" outlined rounded severity="info" @click="onRowSelectItem(slotProps)" />
                                                    </template> </Column
                                                ><Column style="width: 10%">
                                                    <template #body="slotProps">
                                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteProduct(slotProps.data)" />
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </TabPanel>
                                    </TabView>

                                    <!-- dialogo editar item-->
                                    <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :modal="true" class="p-2">
                                        <div>
                                            <div class="p-fluid formgrid grid">
                                                <div class="field lg:col-12 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="name">Nome:</label>
                                                    <InputText disabled v-model="item.nome" id="name" type="text"></InputText>
                                                </div>
                                                <div class="field lg:col-4 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="Quantidade">Quantidade:</label>
                                                    <InputText id="Quantidade" v-model="item.quantidade" />
                                                </div>
                                            </div>
                                        </div>
                                        <template #footer>
                                            <Button label="Cancelar" icon="pi pi-times" text @click="itemDialog = false" />
                                            <Button label="Salvar" icon="pi pi-check" text @click="atualizarProdutoSetor" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo adicionar item-->
                                    <Dialog v-model:visible="visible" modal header="Adicionar Itens do Setor">
                                        <div class="grid">
                                            <div class="col-12">
                                                <label for="Produto" class="font-semibold col-2">Produto: </label>
                                                <Dropdown v-model="produtoSelecionado.id_produto" :options="ListaItensSetor" optionLabel="label" optionValue="value" placeholder="Selecione um produto" class="col-8 p-0" />
                                            </div>
                                            <div class="col-12">
                                                <label for="Quantidade" class="font-semibold w-6rem mr-2">Quantidade: </label>
                                                <InputNumber id="Quantidade" v-model="produtoSelecionado.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                                            </div>
                                        </div>
                                        <div class="flex justify-content-end gap-2">
                                            <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                                            <Button type="button" label="Adicionar" @click="SalvarProduto"></Button>
                                        </div>
                                    </Dialog>

                                    <!-- dialogo deletar produto-->
                                    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Deletar Item" :modal="true">
                                        <div class="confirmation-content">
                                            <i style="font-size: 2rem" />
                                            <span v-if="item"
                                                >Você tem certeza que quer deletar o Item <b>{{ item.nome }}</b> ?</span
                                            >
                                        </div>
                                        <template #footer>
                                            <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
                                            <Button label="Sim" icon="pi pi-check" text @click="deletarProduto" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo deletar setor-->
                                    <Dialog header="Deletar setor?" v-model:visible="deleteSetorDialog" style="width: 400px" :modal="true" :closable="false">
                                        <div class="confirmation-content">
                                            <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                            <span
                                                >Você tem certeza que deseja deletar o setor <b>{{ setor.codigo }}</b> - <b>{{ setor.nome }}</b> ?</span
                                            >
                                        </div>
                                        <template #footer>
                                            <Button label="Não" icon="pi pi-times" @click="deleteSetorDialog = false" class="p-button-text" />
                                            <Button label="Sim" icon="pi pi-check" @click="deleteSetor" class="p-button-text" />
                                        </template>
                                    </Dialog>
                                </div>
                            </form>
                            <!-- fim capos de texto -->
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style>
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
