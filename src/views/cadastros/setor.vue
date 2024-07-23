<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import '@vuepic/vue-datepicker/dist/main.css';
import { useAuthStore } from '@/store/authStore.js';

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaSetor = ref([]);
const ListaItensSetor = ref([]);
const itemDialog = ref(false);
const ListaItensSelecionados = ref([]);
const deleteSetorDialog = ref(false);
const visible = ref(false);
const integracao = ref(false);


let setor = reactive({
    codigo: '',
    nome: '',
    centro: ''
});

const onRowSelect = (event) => {
    setor = event.data;
    visible.value = true;
    active.value = 1;
    loadSetor();
};

const submitForm = () => {
    if (visible.value) {
        atualizarSetor();
    } else {
        adicionarSetor();
    }
};
const loadSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar Setores:', error);
    }
};

const adicionarSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...setor
    };
    try {
        const response = await axios.post('/setor/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar um Setor:', error);
    }
};

const deleteSetor = async () => {
    let data = { id_setor: setor.id_setor };
    try {
        await axios.post('/setor/deleteSetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Setor Deletado', life: 3000 });
        deleteSetorDialog.value = false;
        loadSetor();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o setor.', life: 3000 });
    }
    active.value = 0;
};

const atualizarSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...setor
    };
    try {
        const response = await axios.post('/setor/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Setor:', error);
    }
};

const atualizarProdutoSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...ListaItensSelecionados
    };
    try {
        const response = await axios.post('/setor/atualizarproduto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar os produtos do setor Setor:', error);
    }
};

const fetchProdutoSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: setor.id_setor
    };
    try {
        const response = await axios.post('/setor/fetchProdutoSetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaItensSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao recuperar os produtos do setor:', error);
    }
};

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadSetor();
        visible.value = false;
    }
});

const resetForm = () => {
    setor.codigo = '';
    setor.nome = '';
    setor.id_centro_custo = '';
    integracao.value = false;
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadSetor();
    dms.value = mockData;
});


/* dados mockados */
const relatorio = ref({
    dm: ''
});
const formatedDMOptions = ref([]);
const dms = ref([]);

watch(dms, (newValue) => {
    if (newValue) {
        fetchSelectedDMs();
    }
});

//itens relacionados ao centro de custo
const ItensSetor = ref([
    { sku: 123, quantidade: 1 },
    { sku: 647, quantidade: 1 },
    { sku: 563, quantidade: 1 },
    { sku: 436, quantidade: 1 },
    { sku: 279, quantidade: 1 }
]);

const ItensSetorAdm = ref([
    { name: 'Post-it', sku: 98374, quantidade: 0 },
    { name: 'caderno', sku: 827642, quantidade: 0 },
    { name: 'corretivo', sku: 7462, quantidade: 0 },
    { name: 'clipe de papel', sku: 2978264, quantidade: 0 }
]);

//tabela de dados
const mockData =  [
    { "codigo": 1, "nome": "Setor 1", "centro": "Centro 1" },
    { "codigo": 2, "nome": "Setor 2", "centro": "Centro 2" },
    { "codigo": 3, "nome": "Setor 3", "centro": "Centro 3" },
    { "codigo": 4, "nome": "Setor 4", "centro": "Centro 4" },
    { "codigo": 5, "nome": "Setor 5", "centro": "Centro 5" },
    { "codigo": 6, "nome": "Setor 6", "centro": "Centro 6" },
    { "codigo": 7, "nome": "Setor 7", "centro": "Centro 7" },
    { "codigo": 8, "nome": "Setor 8", "centro": "Centro 8" },
    { "codigo": 9, "nome": "Setor 9", "centro": "Centro 9" },
    { "codigo": 10, "nome": "Setor 10", "centro": "Centro 10" }
];
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Setores">
                <div class="col-12">
                    <DataTable :value="dms" stripedRows tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" paginator :rows="10" dataKey="codigo"  :metaKeySelection="false" @rowSelect="handleRowSelection" >
                        <Column field="codigo" header="Código"></Column>
                        <Column field="nome" header="Setor (Nome)"></Column>
                        <Column field="centro" header="Centro de Custo"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Setor">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="codigo">Código:</label>
                                        <InputText id="codigo" v-model="setor.codigo" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="nome">Setor (Nome):</label>
                                        <InputText id="nome" v-model="setor.nome" required />
                                    </div>
                                    <div class="field lg:col-12 md:col-6 sm:col-4">
                                        <label for="id_centro_custo">Centro de Custo (Nome):</label>
                                        <InputText id="id_centro_custo" v-model="setor.id_centro_custo" required />
                                    </div>
                                </div>
                                <TabView>
                                    <TabPanel header="Itens Disponíveis">
                                        <DataTable :value="ItensSetor" stripedRows dataKey="sku" v-model:selection="setor.itemsSelecionadosSetor" selectionMode="multiple">
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column field="prazo" header="Prazo"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <TabPanel header="Itens do Funcionario">
                                        <Button class="buttons" label="Adicionar Itens" @click="visible = true" />
                                        <!-- data table que exibe os items adicionados -->
                                        <DataTable :value="ListaItensSelecionados" tableStyle="min-width: 50rem" stripedRows dataKey="sku">
                                            <Column field="name" header="Nome"></Column>
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column style="min-width: 8rem">
                                                <template #body="slotProps">
                                                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                                                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </TabPanel>
                                </TabView>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <!-- <Button label="Adicionar" type="submit" /> -->

                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Atualizar" icon="pi pi-refresh" severity="primary" @click="atualizarSetor" />
                                    <Button v-if="visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteSetorDialog = true" />
                                    <Button v-if="!visible" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarSetor" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :modal="true" class="p-fluid">
                    <div>
                        <div class="p-fluid formgrid grid">
                            <div class="field lg:col-12 md:col-6 sm:col-4">
                                <label for="name">Nome:</label>
                                <InputText disabled v-model="item.name" id="name" type="text"></InputText>
                            </div>
                            <div class="field lg:col-4 md:col-6 sm:col-4">
                                <label for="Quantidade">Quantidade</label>
                                <InputText id="Quantidade" v-model="item.quantidade" />
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                        <Button label="Salvar" icon="pi pi-check" text @click="SalvarProduto" />
                    </template>
                </Dialog>
                <Dialog v-model:visible="visible" modal header="Adicionar Itens do Funcionário">
                    <div class="grid">
                        <div class="col-12">
                            <label for="Produto" class="font-semibold col-2">Produto</label>
                            <Dropdown v-model="selectedProduct" :options="ItensSetorAdm" optionLabel="name" placeholder="Selecione um produto" class="col-8 p-0" />
                        </div>
                        <div class="col-12">
                            <label for="Quantidade" class="font-semibold w-6rem">Quantidade</label>
                            <InputNumber id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                        </div>
                    </div>
                    <div class="flex justify-content-end gap-2">
                        <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                        <Button type="button" label="Adicionar" @click="SalvarProduto"></Button>
                    </div>
                </Dialog>
                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Deletar Item" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="item">
                            Você tem certeza que quer deletar o Item <b>{{ item.name }}</b> ?
                        </span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
                        <Button label="Sim" icon="pi pi-check" text @click="deleteProduct" />
                    </template>
                </Dialog>
                <Dialog header="Deletar Setor" v-model:visible="deleteSetorDialog" style="width: 400px" :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            Você tem certeza que deseja deletar esse setor? <b>{{ setor.id_setor }}</b> - <b>{{ setor.nome }}</b> ?
                        </span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" @click="deleteSetorDialog = false" class="p-button-text" />
                        <Button label="Sim" icon="pi pi-check" @click="deleteSetor" class="p-button-text" />
                    </template>
                </Dialog>
            </TabPanel>
        </TabView>
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
    .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>