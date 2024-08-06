<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import { FilterMatchMode } from 'primevue/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const dialogMessage = ref('');
const selectedItem = ref(null);
const toast = useToast();
const active = ref(0);
const store = useAuthStore();
const loading = ref(false);
let DM = reactive({
    Ativo: '',
    Chave: '',
    ClienteID: '',
    ClienteNome: '',
    Created: '',
    Enviada: '',
    ID_CR_Usuario: '',
    ID_DM: '',
    IDcliente: '',
    Identificacao: '',
    Integracao: '',
    Numero: '',
    OP_Biometria: '',
    OP_Facial: '',
    OP_Senha: '',
    URL: '',
    Updated: '',
    UserID: '',
    Versao: '',
});
const show = ref(false)
const showDialogDVM = ref(false)
const showDialogDItem = ref(false)
const showDialogProduto = ref(false)
const ListaProdutos = ref([]);
const ListaProdutosFiltradp = ref([]);
const ListaClientes = ref([])
const visible = ref(false);
const ListaItens = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const produtoSelecionado = ref({
    id_produto:'',
    Porta:'',
    Motor1:'',
    Motor2:'',
    Controladora:''

})
const ListaDMS = ref([]);
const todosOption = { label: 'Todos', value: null };
const plantas = ref([todosOption]);
const fetchDMS = async () => {
    loading.value = true;
    let data = null;

    if (admin) {
        data = '';
    } else {
        data = {};
        data.id_cliente = store.userIdCliente;
    }
    try {
        const response = await axios.post('/DM/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaDMS.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
const deleteItem = async (item) => {
    dialogMessage.value = `Você tem certeza que deseja excluir o item ${item.Nome_Produto}?`;
    showDialogDItem.value = true;
    selectedItem.value = item;
};

const confirmDelete = async () => {
    if (!selectedItem.value) return;
    console.log(selectedItem.value)
    loading.value = true;

    try {
        const response = await axios.post('/DM/deleteItem', { id_item: selectedItem.value.id_item }, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        
        fetchItemDM();

        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído com sucesso',life: 3000 });
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir item' ,life: 3000});
    } finally {
        loading.value = false;
        showDialogDItem.value = false;
        selectedItem.value = null;
    }
};

const cancelDelete = () => {
    showDialogDItem.value = false;
    selectedItem.value = null;
};
const fetchItemDM = async () =>{
    loading.value = true

    try {
        const data = {
            id_dm : DM.ID_DM
        };
        const response = await axios.post('/DM/listaritens', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaItens.value = response.data;
    }catch(error){
        console.error('Erro ao carregar Itens:', error);
    }finally{
        loading.value = false;
    }

};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

const onRowSelect = async (event) => {
    DM = event.data;
    if(!admin()){
        show.value = true;
        fetchItemDM();
        listarProduto();
    }else{
        active.value = 1;
    }
};
const admin = () => {
    return store.userRole === "Administrador";
};
const formatDate = (value) => {
    if (!value) {
        return '';
    }

    try {
        const date = new Date(value);

        if (isNaN(date)) {
            throw new Error('Data inválida');
        }

        // Ajustar a data para o fuso horário local
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        const day = String(localDate.getDate()).padStart(2, '0');
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const year = localDate.getFullYear();
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};
const listarProduto = async () =>{
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        loading.value = true
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization:`Bearer ${store.token}` 
            }
        });
        ListaProdutos.value = response.data.map(({ id_produto, codigo,nome }) => ({
            label: `${codigo} | ${nome}`,
            value: id_produto
        }));
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }finally {
        loading.value = false; // Desativando loading
    }
}
const adicioanrProduto = async () =>{
    const data = {
        id_cliente: store.userIdCliente,
        ...produtoSelecionado.value,
        id_dm:DM.ID_DM
    };
    try {
        loading.value = true
        const response = await axios.post('/DM/adicionarItens', data, {
            headers: {
                Authorization:`Bearer ${store.token}` 
            }
        });
        showDialogProduto.value=false;
        resetProdutoSelecionado();
        fetchItemDM();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }finally {
        loading.value = false; // Desativando loading
    }
}
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        //fetchUsuarios();
        visible.value = false;
    }
});
onMounted(() => {
    fetchIdPlanta();
    fetchCliente();
    fetchDMS();
});

const resetProdutoSelecionado = () => {
  produtoSelecionado.value = {
    id_produto: '',
    Porta: '',
    Motor1: '',
    Motor2: '',
    Controladora: ''
  };
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/usuarios/listarPlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantas.value = [todosOption, ...response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }))];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};
const fetchCliente = async () => {
    loading.value = true;
    try {
        const response = await axios.post('/admin/cliente/listar', {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaClientes.value = response.data.map(({ id_cliente, nome }) => ({
            label: nome,
            value: id_cliente
        }));
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};
</script>

<template>
    <div class="grid h-full">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Dispenser Machines</h5>
                <TabView v-model:activeIndex="active" v-if="!show">
                    <TabPanel header="Listar Dispenser Machines">
                        <div class="col-12">
                            <DataTable v-model:filters="filters" :value="ListaDMS" selectionMode="single"
                                tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows
                                dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection" paginator :rows="10"
                                :globalFilterFields="['id_DM', 'nome', 'email', 'nome_cliente', 'local', 'atualizado']">
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                        </IconField>
                                    </div>
                                </template>
                                <Column field="ID_DM" header="Id"></Column>
                                <Column field="Numero" header="Número"></Column>
                                <Column field="Identificacao" header="Identificação"></Column>
                                <Column field="ClienteNome" header="Cliente"></Column>
                                <Column field="local" header="Localização"></Column>
                                <Column field="Ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi"
                                            :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="Updated" header="Atualizado">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.Updated)) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteItem(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Adicionar Dispenser Machines" v-if="admin()">
                        <h5 class="mt-2">{{ visible ? 'Editar ' : 'Nova ' }}Dispenser Machines</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Cliente:</label>
                                <Dropdown class="my-2" v-model="DM.cliente" :options="ListaClientes" optionLabel="label"
                                    optionValue="value" placeholder="Selecione um" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Numero da DM:</label>
                                <InputText class="my-2" v-model="DM.usuario" id="email" />
                            </div>
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Identificação da DM:</label>
                                <InputText class="my-2" v-model="DM.usuario" id="email" />
                            </div>
                            <div class="full lg:col-12 md:col-4 sm:col-12">
                                <label class="mt-3 ml-4" for="switch2">DM Ativo?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.status" inputId="switch2" />
                            </div>
                        </div>
                        <h5 class="mt-2">Opções de DM</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <label for="fim"></label>
                            <div id="fim" class="checkbox-container flex align-content-end flex-wrap">
                                <div class="checkbox-items m-2 flex align-items-end">
                                    <Checkbox v-model="DM.voucher" inputId="Voucher" value="Voucher" :binary="true" />
                                    <label for="Voucher" class="ml-2"> Voucher </label>
                                </div>
                                <div class="checkbox-items m-2 flex align-items-center">
                                    <Checkbox v-model="DM.cracha" inputId="cracha" value="cracha" :binary="true" />
                                    <label for="cracha" class="ml-2"> Crachá </label>
                                </div>
                                <div class="checkbox-items m-2 flex align-items-center">
                                    <Checkbox v-model="DM.biometria" inputId="Biometria" value="Biometria"
                                        :binary="true" />
                                    <label for="Biometria" class="ml-2"> Biometria </label>
                                </div>
                                <div class="checkbox-items m-2 flex align-items-center">
                                    <Checkbox v-model="DM.facial" inputId="Facial" value="Facial" :binary="true" />
                                    <label for="Facial" class="ml-2"> Rec. Facial </label>
                                </div>
                            </div>
                            <div class="full lg:col-12 md:col-4 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Mob" inputId="switch3" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">UserID API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">Senha API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                <label for="senha">IdCliente API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.senha" type="password" />
                            </div>
                            <div class="full lg:col-6 md:col-6 sm:col-6">
                                <label for="codigo">Senha Chave:</label>
                                <Textarea v-model="DM.textoretirada" class="my-2 overflow-scroll" rows="5" cols="30" />
                            </div>
                            <div class="flex align-items-center justify-content-end field col-12">
                                <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario"
                                    class="m-2" />
                            </div>
                        </div>
                        <h5 class="mt-2">Controladoras</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button label="Adicionar Controladoras" icon="pi pi-check" severity="info"
                                @click="adicionarDM" class="full mt-4 mr-2" />
                        </div>
                        <div class="col-12">
                            <DataTable v-model:selection="selectedVM" :value="DMOptions" dataKey="code"
                                tableStyle="width:100% min-width: 50rem" :size="small">
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                <Column field="code" header="Code" class="col-12 md:col-6" :style="{ width: '30%' }">
                                </Column>
                                <Column field="nome" header="Name" class="col-12 md:col-6" :style="{ width: '70%' }">
                                </Column>
                            </DataTable>

                            <div class="flex align-items-center justify-content-end field col-12">
                                <Button v-if="visible" style="width: 15%;"
                                    class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                    icon="pi pi-check" severity="primary" @click="saveDMs" />
                                <Button style="width: 15%;"
                                    class="flex align-items-center justify-content-center m-2 mr-0" label="Voltar"
                                    icon="pi pi-arrow-left" severity="primary" @click="active = 0" />
                                <Button v-if="!visible" style="width: 15%;"
                                    class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar"
                                    icon="pi pi-check" severity="info" @click="adicionarCliente" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
                <div class="card" v-if="show">
                    <h5 class="mt-2">Itens Da VM</h5>
                    <Button class="m-1" label="Adicionar Itens" @click="showDialogProduto = true" />
                    <div class="mt-5 mx-0 p-fluid grid">       
                        <div class="lg:col-12 md:col-12 sm:col-12">
                            <DataTable  :value="ListaItens" selectionMode="single"
                                tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows
                                dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection" paginator :rows="10">
                                <Column field="SKU" header="SKU"></Column>
                                <Column field="Nome_Produto" header="Produto"></Column>
                                <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
                                <Column field="QTD" header="QTD"></Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteItem(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>

                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <Dialog header="Adicionar Produto" :visible.sync="showDialogProduto" style="width: 30vw" :modal="true" :closable="false">
        <div class="grid">
                <div class="col-12">
                    <label for="Produto" class="mr-2 font-semibold col-2">Produto: </label>
                    <Dropdown v-model="produtoSelecionado.id_produto" :options="ListaProdutos" optionLabel="label" optionValue="value" placeholder="Selecione um produto" class="col-8 p-0" />
                </div>
                <div class="col-12">
                    <label for="Porta" class="font-semibold w-6rem mr-2">Porta: </label>
                    <InputNumber id="Porta" v-model="produtoSelecionado.Porta" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>   
                <div class="col-12">
                    <label for="Controladora" class="font-semibold w-6rem mr-2">Controladora: </label>
                    <InputNumber id="Controladora" v-model="produtoSelecionado.Controladora" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>     
                <div class="col-12">
                    <label for="Mola" class="font-semibold w-6rem mr-2">Motor 1: </label>
                    <InputNumber id="Mola" v-model="produtoSelecionado.Motor1" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>                 
                <div class="col-12">
                    <label for="Mola2" class="font-semibold w-6rem mr-2">Motor 2: </label>
                    <InputNumber id="Mola2" v-model="produtoSelecionado.Motor2" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" @click="showDialogProduto = false"></Button>
                <Button type="button" label="Adicionar" @click="adicioanrProduto"></Button>
            </div>
    </Dialog>
    <Dialog header="Deletar Item" :visible.sync="showDialogDItem" style="width: 30vw" :modal="true" :closable="false">
    <p>{{ dialogMessage }}</p>
    <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
        <Button label="OK" icon="pi pi-check" @click="confirmDelete" />
    </template>
</Dialog>
    <Dialog header="Deletar VM" :visible.sync="showDialogDVM" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
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
