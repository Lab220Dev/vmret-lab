<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const active = ref(0);
const store = useAuthStore();
const loading = ref(false);
const toast = useToast();
const todosOption = { label: 'Todos', value: null };
const visible = ref(false);
const senha = ref('');
const senhaAlterada = ref(false);
const SenhaBE = ref('');
const errors = ref({});
const deleteUsuarioDialog = ref(false);
const item = ref({});

const plantas = ref([todosOption]);
let usuario = reactive({
    nome: '',
    login: '',
    senha: '',
    ativo: true
});
const ListaUsuario = ref([]);

const onRowSelect = (event) => {
    visible.value = true;
    usuario = event.data;
    senha.value = usuario.senha;
    SenhaBE.value = usuario.senha;
    senhaAlterada.value = false; // Reseta a flag de senha alterada
    active.value = 1;
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
};
const validateForm = () => {
    errors.value = {};
    validateSenha();
    return Object.keys(errors.value).every((key) => errors.value[key] === null);
};
const validateSenha = () => {
    if (senha.value !== usuario.senha) {
        errors.value.senha = 'A senha NÃO é a mesma';
    } else {
        errors.value.senha = null;
    }
};
const selectedVM = ref([]);
const DMOptions = ref([]);
const ListaDMS = ref([]);
const isSameSenha = () => {
    return usuario.senha === SenhaBE.value;
};
const saveUsuario = async () => {
    let data = null;

    if (store.userRole === 'Administrador') {
        data = {};
        data = usuario;
        data.id_usuario = store.userId;
    } else {
        data = {};
        data = usuario;
        data.id_cliente = store.userIdCliente;
        data.id_usuario = store.userId;
    }
    try {
        const response = await axios.post('/UDM/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario DM criado', life: 3000 });

        fetchUsuarios();
        visible.value = true;
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
        const response = await axios.post('/UDM/atualizar', data, {
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
        const response = await axios.post('/plantas/listar', data, {
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
        data = ''; // Set to an empty string if the role is "Administrador"
    } else {
        data = {}; // Initialize data as an empty object
        data.id_cliente = store.userIdCliente; // Set the value property
    }
    try {
        const response = await axios.post('/UDM/listar', data, {
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
const fetchDMS = async () => {
    loading.value = true;
    let data = null;

    if (store.userRole === 'Administrador') {
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
    fetchDMS();
});
const deleteUsuariodes = (itm) => {
    item.value = itm;
    deleteUsuarioDialog.value = true;
};
const deleteUsuario = async (item) => {
    loading.value = true;
    let data = { id: item.id, id_usuario: store.userId };
    try {
        await axios.post('/UDM/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Ciente Deletada', life: 3000 });
        deleteUsuarioDialog.value = false;
        fetchUsuarios();
        active.value = 0;
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a planta.', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};
const resetForm = () => {
    (usuario.nome = ''),
        (usuario.email = ''),
        (usuario.perfil = ''),
        (usuario.planta = ''),
        (usuario.senha = ''),
        (usuario.login = ''), // Resetando o login
        (usuario.ativo = true),
        (senha.value = ''), // Resetando o campo "Confirme a Senha"
        (SenhaBE.value = ''), // Resetando a senha original armazenada
        (senhaAlterada.value = false); // Resetando a flag de senha alterada
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Usuários Dispenser Machines</h5>
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Listar  Usuário DM">
                        <div class="col-12">
                            <DataTable :value="ListaUsuario" selectionMode="single" tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect" paginator :rows="10">
                                <Column field="nome" header="Nome"></Column>
                                <Column field="login" header="Login"></Column>
                                <Column field="ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteUsuariodes(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel :header="visible ? 'Editar  Usuário DM' : 'Adicionar  Usuário DM'">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full xl:col-8 lg:col-8 md:col-8 sm:col-12">
                                <label for="name">Nome:</label>
                                <InputText class="my-2" v-model="usuario.nome" id="name" type="text" />
                            </div>

                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">Senha:</label>
                                <InputText class="my-2" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>

                            <div class="full xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label for="email">Login:</label>
                                <InputText class="my-2" v-model="usuario.login" id="email" />
                            </div>

                            <div class="full xl:col-2 flex flex-column align-items-center m-0 lg:col-2 md:col-2 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">Usuario Ativo?</label>
                                <div class="grid mt-3">
                                    <InputSwitch v-model="usuario.ativo" inputId="switch2" class="mr-2" />
                                    <span class="ml-2">{{ usuario.ativo ? 'Sim' : 'Não' }}</span>
                                </div>
                            </div>

                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">Confirme a Senha:</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>

                            <div class="flex align-items-center justify-content-end field col-12">
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarUsuario" />
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteUsuariodes(usuario)" />
                                <Button style="width: 15%" class="buttons flex align-items-center justify-content-center m-2 mr-0" label="Voltar" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                <Button v-if="!visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="submitForm" />
                            </div>
                        </div>
                        <div class="col-12" v-if="visible">
                            <DataTable v-model:selection="selectedVM" :value="ListaDMS" dataKey="code" tableStyle="width:100% min-width: 50rem" :size="small">
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                <Column field="ID_DM" header="Id Maquina" class="col-12 md:col-6" :style="{ width: '30%' }"> </Column>
                                <Column field="Identificacao" header="Nome" class="col-12 md:col-6" :style="{ width: '70%' }"> </Column>
                            </DataTable>
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
@media (max-width: 780px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
