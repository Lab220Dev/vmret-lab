<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';

const active = ref(0);
const store = useAuthStore();
const toast = useToast();
const ListaClientes = ref([]);
const visible = ref(false);
const deleteClienteDialog = ref(false);
let cliente = reactive({
    nome: '',
    cpfcnpj: '',
    ativo:true,
    created:new Date(),
    usarApi:false,
    textoretirada:''
});
const onRowSelect = (event) => {
    cliente = event.data;
    active.value = 1;
    visible.value = true;
    loadCliente();
};

const submitForm = () => {
    if (visible.value) {
        atualizarCliente();
    } else {
        adicionarCliente();
    }
};
const adicionarCliente = async () => {
    const data = {
        ...cliente
    };
    try {
        const response = await axios.post('/admin/cliente/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadCliente();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar Clientes:', error);
    }
};

const deleteCliente = async () => {
    let data = { id_cliente: cliente.id_cliente };
    try {
        await axios.post('/admin/ciente/delete', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Ciente Deletada', life: 3000 });
        deleteClienteDialog.value = false;
        loadCliente();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a planta.', life: 3000 });
    }
    active.value = 0;
};
const atualizarCliente = async () => {
    const data = {
        id_cliente: cliente.id_cliente,
        ...cliente
    };
    try {
        const response = await axios.post('/admin/cliente/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadCliente();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Plantas:', error);
    }
};
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadCliente();
        visible.value = false;
    }
});
const resetForm = () => {
    cliente.nome= '',
    cliente.cpfcnpj= '',
    cliente.ativo=true,
    cliente.created=new Date(),
    cliente.usarApi=false,
    cliente.textoretirada=''
};
const loadCliente = async () => {
    try {
        const response = await axios.post('/admin/cliente/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaClientes
        
        .value = response.data;
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
    }
};
onMounted(() => {
    loadCliente();
});

</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Clientes">
                <div class="col-12">
                    <DataTable :value="ListaClientes" selectionMode="single" tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="handleRowSelection">
                        <Column field="id_cliente" header="Id"></Column>
                        <Column field="nome" header="Nome"></Column>
                        <Column field="ativo" header="Ativo"></Column>
                        <Column field="last_login" header="Último Login"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel header="Adicionar Clientes">

            </TabPanel>
        </TabView>
    </div>
</template>

<style lang="scss" scoped></style>