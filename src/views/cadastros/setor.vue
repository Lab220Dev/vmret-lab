<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import '@vuepic/vue-datepicker/dist/main.css';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const active = ref(0);
const store = useAuthStore();
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

let setor = reactive({
    codigo: '',
    nome: '',
    id_centro_custo: ''
});
const produtoSelecionado = ref({
    id_produto:'',
    quantidade:''
});
const onRowSelect = (event) => {
setor = event.data;
    active.value = 1;
    editVisible.value = true;
    fetchProdutoSetor();
    fetchListaItemSetor();
};

const submitForm = () => {
    if (editVisible.value) {
        atualizarSetor();
    } else {
        adicionarSetor();
    }
};

const loadSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao listar Funções e Diretorias:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const adicionarSetor = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        ...setor
    };
    loading.value = true;
    try {
        const response = await axios.post('/Setor/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar Funções e Diretorias:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const deleteSetor = async () => {
    let data = { id_setor: setor.id_setor };
    loading.value = true;
    try {
        await axios.post('/Setor/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Função Deletada', life: 3000 });
        deleteSetorDialog.value = false;
        loadSetor();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a função', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const atualizarSetor = async () => {
    loading.value = true;
    const data = {
        ...setor
    };
    try {
        const response = await axios.post('/Setor/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadSetor();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Funções e Diretorias:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
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
            label: `Centro  ${Nome}`,
            value: ID_CentroCusto
        }))];
    } catch (error) {
        console.error('Erro ao listar centros de custo:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
const fetchListaItemSetor = async () => {
    loading.value = true;
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: setor.id_setor
    };
    try {
        const response = await axios.post('/setor/itensdisponiveissetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ItensSetor.value = response.data;
    } catch (error) {
        console.error('Erro ao listar centros de custo:', error);
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
    loadCentroCusto();
});

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
        ListaItensSetor.value = response.data.map(({ id_produto,nome }) => ({
                label: nome,
                value: id_produto
            }));
    } catch (error) {
        console.error('Erro ao recuperar os produtos do setor:', error);
    }
};

const SalvarProduto = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_usuario:store.userId,
        id_produto:produtoSelecionado.value.id_produto,
        quantidade:produtoSelecionado.value.quantidade,
        ...setor
    };
    try {
        const response = await axios.post('/setor/additem', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
    } catch (error) {
        console.error('Erro ao recuperar os produtos do setor:', error);
    }
};

</script>

<template>
    <div class="card vh">
        <!-- inicio do tabview-->
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Setores">
                <div class="col-12">
                    <DataTable :value="ListaSetor" stripedRows selectionMode="single" tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" :rows="10" dataKey="codigo" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <template #empty> Nenhuma Setor adicionada. </template>
                        <Column field="codigo" header="Código"></Column>
                        <Column field="nome" header="Setor (Nome)"></Column>
                        <Column field="id_centro_custo" header="Centro de Custo"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Setor" v-model:activeIndex="active">
                <div class="grid ">
                    <div class="col-12">
                        <div class="card">
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
                                        <Dropdown class="drop" v-model="setor.id_centro_custo"
                                            :options="centroCusto" optionLabel="label" optionValue="value"
                                            placeholder="Todos" ref="dropdown3" />
                                    </div>
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="editVisible" style="width: 15%;" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarSetor" />
                                    <Button v-if="editVisible" style="width: 15%;" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteSetorDialog = true" />
                                    <Button v-if="!editVisible" style="width: 15%;" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarSetor" />
                                </div>
                                <div class="col-12">
                                    <TabView v-if="editVisible">
                                        <TabPanel header="Itens Disponíveis para o Setor">
                                            <Button class="my-3" @click="visible = true" label="Adicionar" />
                                            <DataTable class="" :value="ItensSetor" stripedRows dataKey="sku" v-model="setor.itemsSelecionadosSetor">
                                                <Column field="sku" header="SKU"></Column>
                                                <Column field="nome" header="nome"></Column>
                                                <Column field="qtd_limite" header="Quantidade"></Column>
                                                <Column field="dias" header="Prazo"></Column>
                                            </DataTable>
                                        </TabPanel>
                                    </TabView>

                                    <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :modal="true" class="p-fluid">
                                        <div>
                                            <div class="p-fluid formgrid grid">
                                                <div class="field lg:col-12 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="name">Nome:</label>
                                                    <InputText disabled v-model="item.name" id="name" type="text"></InputText>
                                                </div>
                                                <div class="field lg:col-4 md:col-6 sm:col-4">
                                                    <label class="mr-2" for="Quantidade">Quantidade:</label>
                                                    <InputText id="Quantidade" v-model="item.quantidade" />
                                                </div>
                                            </div>
                                        </div>
                                        <template #footer>
                                            <Button label="Cancelar" icon="pi pi-times" text @click="itemDialog = false" />
                                            <Button label="Salvar" icon="pi pi-check" text @click="SalvarProduto" />
                                        </template>
                                    </Dialog>
                                    <Dialog v-model:visible="visible" modal header="Adicionar Itens do Setor">
                                        <div class="grid">
                                            <div class="col-12">
                                                <label for="Produto" class="mr-2 font-semibold col-2">Produto: </label>
                                                <Dropdown v-model="produtoSelecionado.id_produto" :options="ListaItensSetor"optionLabel="label" optionValue="value" placeholder="Selecione um produto" class="col-8 p-0" />
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
                                    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Deletar Item" :modal="true">
                                        <div class="confirmation-content">
                                            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                                            <span v-if="item"
                                                >Você tem certeza que quer deletar o Item <b>{{ item.name }}</b> ?</span
                                            >
                                        </div>
                                        <template #footer>
                                            <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
                                            <Button label="Sim" icon="pi pi-check" text @click="deleteProduct" />
                                        </template>
                                    </Dialog>
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
