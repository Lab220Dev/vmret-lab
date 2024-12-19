<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import cdcService from '@/services/cdcService';
import { resetCDCForm } from '@/helpers/formHelper'
const active = ref(0);
const toast = useToast();
const centroCusto = ref([]);
const visible = ref(false);
const deleteCentroDialog = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filteredCount = ref(0);

let cdc = reactive({
    Nome: '',
    Codigo: '',
    ID_CentroCusto: ''
});

const onRowSelect = async (event) => {
    cdc = event.data;
    visible.value = true;
    active.value = 1;
};

const loadCentroCusto = async () => {
  try {
    centroCusto.value = await cdcService.listarCentrosDeCusto();
    filteredCount.value = centroCusto.value.length;
  } catch (error) {
    console.error(error.message);
  }
};

const submitForm = async () => {
  try {
    if (visible.value) {
      await cdcService.atualizarCentro(cdc);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro atualizado!' });
    } else {
      await cdcService.adicionarCentro(cdc);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro adicionado!' });
    }
    loadCentroCusto();
    resetCDCForm(cdc);
    active.value = 0;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }
};

const deleteCentro = async () => {
  try {
    await cdcService.deletarCentro(cdc);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Centro deletado!' });
    deleteCentroDialog.value = false;
    loadCentroCusto();
    resetCDCForm(cdc);
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar o centro de custo' });
  }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetCDCForm(cdc);
        loadCentroCusto();
        visible.value = false;
    }
});

watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = centroCusto.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || '';
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length;
    },
    { immediate: true }
);

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadCentroCusto();
});
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Centros de Custo">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="centroCusto"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        stripedRows
                        removableSort
                        paginator
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        dataKey="id"
                        :sortField="'Codigo'"
                        :globalFilterFields="['Codigo', 'Nome']"
                        :metaKeySelection="false"
                        @rowSelect="handleRowSelection"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty> Nenhum centro de custo adicionado. </template>

                        <Column field="Codigo" sortable header="Código"></Column>
                        <Column field="Nome" sortable header="Centro de Custo (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? 'Editar Centro de Custo' : 'Adicionar Centro de Custo'" v-model:activeIndex="active">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_centro_custo">Código:</label>
                                        <InputText class="my-2" id="id_centro_custo" v-model="cdc.Codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Centro de Custo (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="cdc.Nome" required />
                                    </div>
                                </div>

                                <!-- <div class="flex justify-content-between mt-5 flex-wrap">
                                    <div class="flex align-items-center">
                                        <Button label="Limpar Campos" icon="pi pi-eraser" @click="resetForm" />
                                    </div> -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarCDC" />
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteCentroDialog = true" />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarCentro" />
                                </div>
                                <!-- </div> -->
                            </form>
                        </div>

                        <div class="mr-1 mt-7 grid justify-content-end flex-wrap"></div>

                        <Dialog header="Deletar Centro de Custo" v-model:visible="deleteCentroDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar o centro de custo <b>{{ cdc.Codigo }}</b> - <b>{{ cdc.Nome }}</b> ?</span
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
