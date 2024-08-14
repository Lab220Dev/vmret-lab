<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import { FilterMatchMode } from 'primevue/api';
import axios from '@/axios.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const active = ref(0);
const store = useAuthStore();
const loading = ref(false);
const toast = useToast();
const todosOption = { label: 'Todos', value: null };
const visible = ref(false);
const senha = ref('');
const senhaAlterada = ref(false);
const SenhaBE = ref('');
const plantas = ref([todosOption]);
const isAdmin = ref(false);
const item = ref({});
const errors = ref({});
const ListaClientes = ref([]);
let usuario = reactive({
    nome: '',
    email: '',
    role: '',
    planta: '',
    senha: '',
    ativo: true
});
const ListaUsuario = ref([]);
const dropdownItems = ref([
    { label: 'Gestor', value: 'Gestor' },
    { label: 'Master', value: 'Master' },
    { label: 'Operador', value: 'Operador' },
    { label: 'Liberação Avulsa', value: 'Avulso' }
]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const deleteUsuarioDialog = ref(false);
const onRowSelect = (event) => {
    visible.value = true;
    usuario = event.data;
    senha.value = usuario.senha;
    SenhaBE.value = usuario.senha;
    senhaAlterada.value = false; // Reseta a flag de senha alterada
    active.value = 1;
};
const validateEmail = () => {
    const email = usuario.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        errors.value.email = 'E-mail inválido';
    } else {
        errors.value.email = null;
    }
};
const validateSenha = () => {
    if (senha.value !== usuario.senha) {
        errors.value.senha = 'A senha NÃO é a mesma';
    } else {
        errors.value.senha = null;
    }
};
const isSameSenha = () => {
    return usuario.senha === SenhaBE.value;
};
const validateForm = () => {
    errors.value = {};
    validateSenha();
    validateEmail();
    return Object.keys(errors.value).every((key) => errors.value[key] === null);
};
const deletUsuariodes = (itm) => {
    item.value = itm;
    deleteUsuarioDialog.value = true;
};
const deleteUsuario = async (item) => {
    loading.value = true;
    let data = { id_usuario_delete: item.id_usuario, id_usuario:store.userId, id_cliente:store.userIdCliente};
    try {
        const response = await axios.post('/usuarios/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        if (response.status === 200) {
            deleteUsuarioDialog.value = false;
            fetchUsuarios();
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const voltar = () => {
    active.value = 0;
    resetForm();
};
const submitForm = () => {
    if (validateForm()) {
        if (visible.value) {
            atualizarUsuario();
        } else {
            saveUsuario();
        }
    }
    console.log('o validate te fodeu otario');
};
const saveUsuario = async () => {
    let data = null;

    if (store.userRole === 'Administrador') {
        data = {};
        data = usuario;
        data.id_ususario = store.userId;
    } else {
        data = {};
        data = usuario;
        data.id_cliente = store.userIdCliente;
        data.id_ususario = store.userId;
    }
    try {
        const response = await axios.post('/usuarios/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });

        fetchUsuarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar Usuario:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
    loading.value = true;
};
const atualizarUsuario = async () => {
    loading.value = true;
    const data = {
        ...usuario,
        id_usuario: store.userId
    };
    if (isSameSenha()) {
        delete data.senha;
    }
    try {
        const response = await axios.post('/usuarios/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB atualizado', life: 3000 });

        fetchUsuarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar o Usuario:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
    loading.value = true;
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
        plantas.value = [
            todosOption,
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`,
                value: id_planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};
const fetchUsuarios = async () => {
    loading.value = true;
    let data = null;

    if (store.userRole === 'Administrador') {
        data = '';
        isAdmin.value = true;
        fetchCliente();
    } else {
        data = {};
        data.id_cliente = store.userIdCliente;
    }
    try {
        const response = await axios.post('/usuarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaUsuario.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    } finally {
        loading.value = false; // Desativando loading
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
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        fetchUsuarios();
        visible.value = false;
    }
});
onMounted(() => {
    fetchIdPlanta();
    fetchUsuarios();
});

const resetForm = () => {
    (usuario.nome = ''), (usuario.Status = true), (usuario.email = ''), (usuario.perfil = ''), (usuario.id_planta = ''), (usuario.senha = ''), (senha.value = ''); // Reset senha confirmada
    senhaAlterada.value = false; // Reset flag de senha alterada
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Usuário Web</h5>
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Listar Usuário Web">
                        <div class="col-12">
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaUsuario"
                                selectionMode="single"
                                tableStyle="min-width: 25%"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                stripedRows
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="onRowSelect"
                                paginator
                                :rows="10"
                                :globalFilterFields="['nome', 'email', 'nome_cliente', 'role', 'last_login']"
                            >
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
                                <Column field="id_usuario" header="Id"></Column>
                                <Column field="nome" header="Nome"></Column>
                                <Column field="email" header="E-mail"></Column>
                                <Column v-if="isAdmin" field="nome_cliente" header="Cliente"></Column>
                                <Column field="role" header="role"></Column>
                                <Column field="ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="last_login" header="Último Login">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.last_login)) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deletUsuariodes(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel :header="visible ? 'Editar Usuário Web' : 'Adicionar Usuário Web'">
                        <!-- <h5 class="mt-4">{{ visible ? 'Editar Usuário Web' : '' }}</h5> -->
                        <div class="mt-3 mx-0 p-fluid grid">
                            <div class="full xl:col-12 lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Nome:</label>
                                <InputText class="my-2" v-model="usuario.nome" id="name" type="text" />
                            </div>
                            <div class="full xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label for="email">E-mail:</label>
                                <InputText class="my-2" v-model="usuario.email" id="email" :invalid="!!errors.email" @blur="validateEmail" />
                                <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                            </div>
                            <div class="full xl:col-3 lg:col-3 md:col-3 sm:col-12">
                                <label for="senha">Senha:</label>
                                <InputText class="my-2" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>
                            <div class="full xl:col-3 lg:col-3 md:col-3 sm:col-12">
                                <label for="senha" class="text-nowrap">Confirme a Senha:</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>

                            <div v-if="isAdmin" class="full xl:col-12 lg:col-12 md:col-12 sm:col-12">
                                <label for="perfil">Cliente:</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.id_cliente" :options="ListaClientes" optionLabel="label" optionValue="value" placeholder="Escolha um"></Dropdown>
                            </div>

                            <div class="full xl:col-4 flex flex-column align-items-center m-0 lg:col-4 md:col-4 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">Usuario Ativo?</label>
                                <div class="grid mt-3">
                                    <InputSwitch v-model="usuario.ativo" inputId="switch2" class="mr-2" />
                                    <span class="ml-2">{{ usuario.ativo ? 'Sim' : 'Não' }}</span>
                                </div>
                            </div>
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="perfil">Perfil:</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.role" :options="dropdownItems" optionLabel="label" optionValue="value" placeholder="Escolha um"></Dropdown>
                            </div>

                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="planta">Planta:</label>
                                <Dropdown class="my-2" id="planta" v-model="usuario.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos"></Dropdown>
                            </div>

                            <div class="flex align-items-center justify-content-end field col-12 mt-7">
                                <Button v-if="visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="submitForm()" />
                                <Button style="width: 30%" class="buttons flex align-items-center justify-content-center m-2 mr-0" label="Voltar" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                <Button v-if="!visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="submitForm" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
                <Dialog header="Deletar Usuario" v-model:visible="deleteUsuarioDialog" style="width: 400px" :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            Você tem certeza que deseja deletar o Usuario <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" @click="deleteUsuarioDialog = false" class="p-button-text" />
                        <Button label="Sim" icon="pi pi-check" @click="deleteUsuario(item)" class="p-button-text" />
                    </template>
                </Dialog>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
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
    .buttons {
        width: 50% !important ;
    }
}

.switch-wrapper {
    display: inline-flex;
    align-items: center;
}

.text-nowrap {
    white-space: nowrap;
}
</style>
