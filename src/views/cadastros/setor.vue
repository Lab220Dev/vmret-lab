<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import { useDataStore } from '@/store/dataStore.js';
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js';
import setorService from '@/Services/SetorService.js';
import { useI18n } from 'vue-i18n';
import {resetSetorForm ,resetProdutoSelecionadoSetor } from '@/helpers/formHelper.js';
const { t } = useI18n();
const Mob = ref(false);
const active = ref(0);
const dataStore = useDataStore();
const toast = useToast();
const ListaSetor = ref([]);
const ListaItensSetor = ref([]);
const ItensSetor = ref([]);
const itemDialog = ref(false);
const deleteSetorDialog = ref(false);
const deleteProductDialog = ref(false);
const visible = ref(false);
const editVisible = ref(false);
const integracao = ref(false);
const item = ref({});
const todosOption = { label: 'Todos', value: null };
const centroCusto = ref([todosOption]);
const loading = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filteredCount = ref(0);
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'Codigo', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
let setor = reactive({
    codigo: '',
    nome: '',
    id_centro_custo: ''
});
const produtoSelecionado = ref({
    id_produto: '',
    quantidade: ''
});
const onRowSelect = async (event) => {
    // setor = { ...event.data };
    Object.assign(setor, event.data);
    active.value = 1;
    editVisible.value = true;
    await fetchListaItemSetor();
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadSetor(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadSetor(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadSetor(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
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

const loadSetor = async (page = 1) => {
    loading.value = true;
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };
        const data = prepareListData(params);
        // const response = await setorService.listarSetores();
        const response = await setorService.listarSetoresPaginado(data);
        ListaSetor.value = response.data.setores;
        filteredCount.value = response.data.totalRecords;
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('list_sector_error'), life: 3000 });
        console.error('Erro ao listar Setores:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const adicionarSetor = async () => {
    loading.value = true;
    try {
        await setorService.adicionarSetor(setor);
        dataStore.invalidateSetorCache();
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_added_sucess'), life: 3000 });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: t('sector_added_fail'), life: 3000 });
        console.error('Erro ao adicionar Setores:', error);
    } finally {
        loading.value = false;
    }
};

watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = ListaSetor.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const deleteSetor = async () => {
    loading.value = true;
    try {
        await setorService.deletarSetor(setor);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_deleted_sucess'), life: 3000 });
        dataStore.invalidateSetorCache();
        deleteSetorDialog.value = false;
        loadSetor();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('sector_deleted_fail'), life: 3000 });
    } finally {
        // Desativando loading
        loading.value = false;
    }

    active.value = 0;
};

const atualizarSetor = async () => {
    loading.value = true;
    try {
        await setorService.atualizarSetor(setor);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('sector_update_sucess'), life: 3000 });
        dataStore.invalidateSetorCache();
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('sector_update_fail'), life: 3000 });
        console.error('Erro ao atualizar Setores:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
const fetchListaItemSetor = async () => {
    loading.value = true;
    try {
        const response = await setorService.listarItensDisponiveis(setor);
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
        visible.value = false;
        editVisible.value = false;
    }
});

const resetForm = () => {
    resetSetorForm(setor);
};

const loadData = async () => {
    try {
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc());
        ListaItensSetor.value = dataStore.produtos || (await dataStore.fetchProdutos());
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
        console.error('Erro ao carregar dados iniciais:', error);
    }
};
onMounted(async () => {
    Mob.value = isMobEnabled();
    await loadSetor();
    await loadData();
});

const atualizarProdutoSetor = async () => {
    loading.value = true;
    try {
        await setorService.atualizarProdutoSetor(item.value);
        fetchListaItemSetor();
        itemDialog.value = false;
        toast.add({
            severity: 'success',
            summary: t('title_sucess'),
            detail: t('product_update_sucess'),
            life: 3000
        });
        resetProdutoSelecionadoSetor(produtoSelecionado);
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            detail: t('product_update_error_details'),
            life: 3000
        });
    } finally {
        loading.value = false; // Desativar carregamento
    }
};

const SalvarProduto = async () => {
    loading.value = true;
    try {
        await setorService.adicionarProduto(setor, produtoSelecionado.value);
        fetchListaItemSetor();
        visible.value = false;
        resetProdutoSelecionadoSetor(produtoSelecionado);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_added_sucess'), life: 3000 });
    } catch (error) {
        console.error('Erro ao adicionar item:', error.message);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('employee_product_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const deletarProduto = async () => {
    loading.value = true;
    try {
        await setorService.deletarProduto(item.value);
        fetchListaItemSetor();
        resetProdutoSelecionadoSetor(produtoSelecionado);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('product_delete_sucess'), life: 3000 });
        deleteProductDialog.value = false;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('product_delete_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const deleteProduct = async (itm) => {
    item.value = itm;
    deleteProductDialog.value = true;
};
function debounce(func, wait = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
const debouncedFilterChange = debounce(() => {
    onFilterChange();
}, 300);
</script>

<template>
    <div class="card vh">
        <!-- inicio do tabview-->
        <TabView v-model:activeIndex="active">
            <TabPanel :header="t('list_sector')">
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
                        :totalRecords="totalRecords"
                        :rows="lazyParams.value?.rows || 10"
                        :sortField="lazyParams.value?.sortField || 'codigo'"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        dataKey="codigo"
                        :globalFilterFields="['codigo', 'nome', 'id_centro_custo']"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>{{ $t('total_records',{count: filteredCount})}}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search" @input="debouncedFilterChange" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> {{ t('sector_empty') }} </template>
                        <Column field="codigo" sortable :header="t('code')"></Column>
                        <Column field="nome" sortable :header="t('sector_name')"></Column>
                        <Column field="id_centro_custo" sortable :header="t('cost_center')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- fim do listar -->
            <!-- inicio do adicionar-->
            <TabPanel :header="editVisible ? t('edit_sector') : t('add_sector')" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="codigo">{{ t('code') }}:</label>
                                        <InputText class="my-2" id="codigo" v-model="setor.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ t('sector_name') }}:</label>
                                        <InputText class="my-2" id="nome" v-model="setor.nome" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="centro">{{ t('cost_center_name') }}:</label>
                                        <Dropdown filter class="drop my-2" v-model="setor.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown3" />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="atualizarSetor" :disabled="Mob" />
                                    <Button
                                        v-if="editVisible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deleteSetorDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!editVisible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarSetor" :disabled="Mob" />
                                </div>
                                <div class="col-12">
                                    <TabView v-if="editVisible">
                                        <TabPanel :header="t('sector_available_items')">
                                            <Button class="my-3" @click="visible = true" :label="$t('add')" />
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
                                                <Column field="sku" sortable :header="t('sku')"></Column>
                                                <Column field="nome" :header="t('name')"></Column>
                                                <Column field="qtd_limite" :header="t('quantity')"></Column>
                                                <Column field="dias" :header="t('best_before')"></Column>
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
                                    <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="t('item_edit')" :modal="true" class="p-2" :draggable="false"><hr/>
                                        <div>
                                            <div class="p-fluid formgrid grid">
                                                <div class="field lg:col-12 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="name">{{ t('name') }}:</label>
                                                    <InputText disabled v-model="item.nome" id="name" type="text"></InputText>
                                                </div>
                                                <div class="field lg:col-4 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="Quantidade">{{ t('quantity') }}:</label>
                                                    <InputText id="Quantidade" v-model="item.qtd_limite" />
                                                </div>
                                            </div>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('cancel')" icon="pi pi-times" text @click="itemDialog = false" />
                                            <Button :label="$t('save')" icon="pi pi-check" text @click="atualizarProdutoSetor" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo adicionar item-->
                                    <Dialog v-model:visible="visible" modal :header="t('add_items_to_sector')" :draggable="false">
                                        <div class="grid">
                                            <div class="col-12">
                                                <label for="Produto" class="font-semibold col-2 mr-2">{{ t('product') }}: </label>
                                                <Dropdown
                                                    v-model="produtoSelecionado.id_produto"
                                                    :options="ListaItensSetor"
                                                    :virtualScrollerOptions="{ itemSize: 30 }"
                                                    optionLabel="label"
                                                    optionValue="value"
                                                    :placeholder="$t('select_product')"
                                                    class="col-8 p-0"
                                                />
                                            </div>
                                            <div class="col-12">
                                                <label for="Quantidade" class="font-semibold w-6rem mr-2 ml-3">{{ t('quantity') }}: </label>
                                                <InputNumber id="Quantidade" class="ml-5" v-model="produtoSelecionado.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                                            </div>
                                        </div>
                                        <div class="flex justify-content-end gap-2">
                                            <Button type="button" :label="$t('cancel')" severity="secondary" @click="visible = false"></Button>
                                            <Button type="button" :label="$t('add')" @click="SalvarProduto"></Button>
                                        </div>
                                    </Dialog>

                                    <!-- dialogo deletar produto-->
                                    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" :header="t('dialog_delete_item')" :modal="true" :draggable="false">
                                        <div class="confirmation-content">
                                            <i style="font-size: 2rem" />
                                            <span v-if="item">
                                                {{ t('dialog_delete_employee', { name: item.nome }) }}
                                            </span>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('no')" icon="pi pi-times" text @click="deleteProductDialog = false" />
                                            <Button :label="$t('yes')" icon="pi pi-check" text @click="deletarProduto" />
                                        </template>
                                    </Dialog>

                                    <!-- dialogo deletar setor-->
                                    <Dialog :header="$t('sector_delete_dialog')" v-model:visible="deleteSetorDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                                        <div class="confirmation-content">
                                            <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                            <span>
                                                {{ t('sector_delete_dialog_confirm', { codigo: setor.codigo, nome: setor.nome }) }}
                                            </span>
                                        </div>
                                        <template #footer>
                                            <Button :label="$t('no')" icon="pi pi-times" @click="deleteSetorDialog = false" class="p-button-text" />
                                            <Button :label="$t('yes')" icon="pi pi-check" @click="deleteSetor" class="p-button-text" />
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
