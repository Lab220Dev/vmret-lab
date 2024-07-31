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
const plantas = ref([todosOption]);
const isAdmin = ref(false)
const usuario = reactive({
    nome: '',
    email: '',
    perfil: '',
    planta: '',
    senha: '',
    Status: ''
});
const ListaUsuario = ref([])
const dropdownItems = ref([
    { name: 'Gestor', value: 'gestor' },
    { name: 'Master', value: 'master' },
    { name: 'Operador', value: 'operador' },
    { name: 'Liberação Avulsa', value: 'avulsa' }
]);
const onRowSelect = (event) => {
    show.value = true;
    usuario.value = event.data;
};

const voltar = () => {
    active.value = 0;
    resetForm();
};
const submitForm = () => {
    if (visible.value) {
        atualizarUsuario();
    } else {
        saveUsuario();
    }
};
const saveUsuario = async () => {
    const data = {
        ...usuario
    };
    try {
        const response = await axios.post('/usuario/adicionar', data, {
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
        ...usuario
    };
    try {
        const response = await axios.post('/usuario/atualizar', data, {
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
        plantas.value = [todosOption, ...response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }))];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};
const fetchUsuarios = async () => {
    loading.value = true;
    let data = null;

    if (store.userRole === "Administrador") {
        data = ''; 
        isAdmin.value=true;
    } else {
        data = {};
        data.id_cliente =  store.userIdCliente ;
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
    usuario.nome = '',
        usuario.Status = true,
        usuario.email = '',
        usuario.perfil = '',
        usuario.planta = '',
        usuario.senha = ''
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Usuário Web</h5>
                <TabView v-model:activeIndex="active">
                    <TabPanel header="Listar  Usuário Web">
                        <div class="col-12">
                            <DataTable :value="ListaUsuario" selectionMode="single" tableStyle="min-width: 25%"
                                :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false"
                                @rowSelect="onRowSelect" paginator :rows="10">
                                <Column field="id_usuario" header="Id"></Column>
                                <Column field="nome" header="Nome"></Column>
                                <Column field="email" header="E-mail"></Column>
                                <Column v-if="isAdmin" field="nome_cliente" header="Cliente"></Column>
                                <Column field="role" header="role"></Column>
                                <Column field="ativo" header="Ativo">
                                    <template #body="{ data }">
                                        <i class="pi"
                                            :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                    </template>
                                </Column>
                                <Column field="last_login" header="Último Login">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.last_login)) }}
                                    </template>
                                </Column>
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                            @click="deleteUsuario(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Adicionar Usuário Web">
                        <h5 class="mt-2">{{ visible ? 'Editar ' : 'Novo ' }}Usuário Web</h5>
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Nome:</label>
                                <InputText class="my-2" v-model="usuario.nome" id="name" type="text" />
                            </div>
                            <div class="full lg:col-7 md:col-7 sm:col-12">
                                <label for="email">E-mail:</label>
                                <InputText class="my-2" v-model="usuario.email" id="email" />
                            </div>
                            <div class="full lg:col-5 md:col-5 sm:col-12">
                                <label for="senha">Senha:</label>
                                <InputText class="my-2" id="senha" v-model="usuario.senha" type="password" />
                            </div>
                            <div class="full lg:col-5 md:col-5 sm:col-12">
                                <label for="senha">Confirme a Senha:</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" />
                            </div>
                            <div class="full lg:col-4 md:col-4 sm:col-12">
                                <label for="perfil">Perfil:</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.perfil" :options="dropdownItems"
                                    optionLabel="label" optionValue="value" placeholder="Escolha um"></Dropdown>
                            </div>
                            <div class="full lg:col-4 md:col-4 sm:col-12">
                                <label for="planta">Planta:</label>
                                <Dropdown class="my-2" id="planta" v-model="usuario.planta" :options="plantas"
                                    optionLabel="label" optionValue="value" placeholder="Todos"></Dropdown>
                            </div>

                            <div class="full lg:col-4 md:col-4 sm:col-12">
                                <label class="mt-3 ml-4" for="switch2">Usuario Ativo?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="usuario.status" inputId="switch2" />
                            </div>
                            <div class="flex align-items-center justify-content-end field col-12">
                                <Button v-if="visible" style="width: 15%;"
                                    class="buttons flex align-items-center justify-content-center m-2" label="Atualizar"
                                    icon="pi pi-refresh" severity="primary" @click="atualizarFuncionario" />
                                <Button v-if="visible" style="width: 15%;"
                                    class="buttons flex align-items-center justify-content-center m-2" label="Excluir"
                                    icon="pi pi-trash" severity="danger" @click="deleteFuncionarioDialog = true" />
                                <Button style="width: 15%;"
                                    class="flex align-items-center justify-content-center m-2 mr-0" label="Voltar"
                                    icon="pi pi-trash" severity="primary" @click="voltar()" />
                                <Button v-if="!visible" style="width: 15%;"
                                    class="buttons flex align-items-center justify-content-center m-2" label="Salvar"
                                    icon="pi pi-check" severity="info" @click="submitForm" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
                <Dialog header="Deletar Usuario" v-model:visible="deleteUsuarioDialog" style="width: 400px"
                    :modal="true" :closable="false">
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            Você tem certeza que deseja deletar o Usuario <b>{{ item.id_cliente }}</b> - <b>{{ item.nome
                                }}</b>
                            ?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" @click="deleteFuncionarioDialog = false"
                            class="p-button-text" />
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
}
</style>
