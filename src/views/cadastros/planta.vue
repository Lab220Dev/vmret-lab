<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { FilterMatchMode } from 'primevue/api';
import plantaService from '@/services/plantaService.js';
import { resetPlantaForm, applyGlobalFilter } from '@/helpers/formHelper';
import { useDataStore } from '@/store/dataStore.js';
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
const Mob = ref(false);
const filteredCount = ref(0);

let planta = reactive({
    nome: '',
    id_planta: '',
    userId: '',
    senha: '',
    codigo: '',
    urlapi: '',
    clienteid: ''
});
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'id_planta', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
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
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadPlanta(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadPlanta(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadPlanta(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
const loadPlanta = async (page = 1) => {
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
        // const response = await plantaService.listarPlantas(store.userIdCliente, store.token);
        const response = await plantaService.listarPlantasPaginado(data);
        ListaPlanta.value = response.data.plantas;
        filteredCount.value = response.data.totalRecords;
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_listing_error'), life: 3000 });
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
        await plantaService.adicionarPlanta({ id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta }, store.token);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_add_sucess'), life: 3000 });
        loadPlanta();
        active.value = 0;
        resetPlantaForm(planta);
    } catch (error) {
        console.error('Erro ao adicionar planta:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_add_fail'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const deletePlanta = async () => {
    let data = { id_planta: planta.id_planta };
    loading.value = true;
    try {
        await plantaService.deletarPlanta(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_delete_sucess'), life: 3000 });
        dataStore.invalidatePlantasCache();
        deletePlantaDialog.value = false;
        loadPlanta();
        active.value = 0;
        //resetPlantaForm(planta);
    } catch (error) {
        console.error('Erro ao deletar planta:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_delete_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

const atualizarPlanta = async () => {
    loading.value = true;
    try {
        await plantaService.atualizarPlanta({ id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta }, store.token);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_update_sucess'), life: 3000 });
        loadPlanta();
        active.value = 0;
        resetPlantaForm(planta);
    } catch (error) {
        console.error('Erro ao atualizar planta:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_update_fail'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        visible.value = false;
    }
});

const resetForm = () => resetPlantaForm(planta);

onMounted(() => {
    loadPlanta();
    Mob.value = isMobEnabled();
});
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
        <TabView v-model:activeIndex="active">
            <TabPanel :header="$t('list_factories')">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaPlanta"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        paginator
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        lazy
                        :totalRecords="filteredCount"
                        :rows="lazyParams.value?.rows || 10"
                        removableSort
                        stripedRows
                        :globalFilterFields="['id_planta', 'nome']"
                        :sortField="lazyParams.value?.sortField || 'id_planta'"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        dataKey="id"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        @filter="onFilterChange($event)"
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

                        <template #empty>{{ t('factory_empty') }} </template>
                        <Column field="id_planta" sortable :header="t('code')"></Column>
                        <Column field="nome" sortable :header="t('factory_name')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? t('edit_factory') : t('add_factory')">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">{{ t('code') }}:</label>
                                        <InputText class="my-2" id="id_planta" v-model="planta.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ t('factory_name') }}:</label>
                                        <InputText class="my-2" id="nome" v-model="planta.nome" required />
                                    </div>
                                    
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="atualizarPlanta" :disabled="Mob" />
                                    <Button
                                        v-if="visible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deletePlantaDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarPlanta" :disabled="Mob" />
                                </div>
                            </form>
                        </div>

                        <Dialog :header="$t('factory_dialog')" v-model:visible="deletePlantaDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class=""> {{ t('factory_dialog_text', { id: planta.id_planta, nome: planta.nome }) }}</span>
                            </div>

                            <template #footer>
                                <Button :label="$t('no')" icon="pi pi-times" @click="deletePlantaDialog = false" class="p-button-text" />
                                <Button :label="$t('yes')" icon="pi pi-check" @click="deletePlanta" class="p-button-text" />
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
