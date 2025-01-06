<script setup>
import { reactive, ref, onMounted, watch } from 'vue'; // Importação das funções do Vue.
import { useToast } from 'primevue/usetoast'; // Importação do hook para exibição de toast messages.
import { useAuthStore } from '@/store/authStore.js'; // Importação do store de autenticação.
import { FilterMatchMode } from 'primevue/api'; // Importação do filtro de correspondência.
import axios from '@/axios.js'; // Instância do axios configurado para chamadas HTTP.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importação do componente de spinner de carregamento.
import { useDataStore } from '@/store/dataStore.js'; // Importação do store de dados.

const active = ref(0); // Variável reativa para controlar a aba ativa.
const dataStore = useDataStore(); // Instância do store de dados.
const store = useAuthStore(); // Instância do store de autenticação.
const loading = ref(false); // Variável para controlar o estado de carregamento.
const toast = useToast(); // Instância para exibição de toast.
const todosOption = { label: 'Todos', value: null }; // Opção de filtro para "Todos".
const visible = ref(false); // Variável para controlar a visibilidade do formulário de edição de usuário.
const senha = ref(''); // Variável reativa para senha.
const senhaAlterada = ref(false); // Flag para indicar se a senha foi alterada.
const SenhaBE = ref(''); // Variável para armazenar a senha original do backend.
const plantas = ref([todosOption]); // Opção inicial de plantas.
const isAdmin = ref(false); // Flag para verificar se o usuário é administrador.
const item = ref({}); // Objeto reativo para armazenar informações do item selecionado.
const errors = ref({}); // Objeto para armazenar mensagens de erro de validação de formulário.
const ListaClientes = ref([]); // Lista de clientes.
let usuario = reactive({
    nome: '',
    email: '',
    role: '',
    planta: '',
    senha: '',
    ativo: true
}); // Objeto reativo para armazenar informações do usuário.
const ListaUsuario = ref([]); // Lista de usuários.
const dropdownItems = ref([ // Opções de roles para o usuário.
    { label: 'Gestor', value: 'Gestor' },
    { label: 'Master', value: 'Master' },
    { label: 'Operador', value: 'Operador' },
    { label: 'Liberação Avulsa', value: 'Avulso' }
]);

// Filtros globais para a tabela de usuários.
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filteredCount = ref(0); // Contador de usuários filtrados.

const deleteUsuarioDialog = ref(false); // Controle da visibilidade do diálogo de confirmação de exclusão.
const onRowSelect = (event) => {
    visible.value = true; // Torna o formulário visível.
    usuario = event.data; // Preenche o formulário com os dados do usuário selecionado.
    senha.value = usuario.senha; // Preenche o campo de senha.
    SenhaBE.value = usuario.senha; // Armazena a senha original do backend.
    senhaAlterada.value = false; // Reseta a flag de alteração da senha.
    active.value = 1; // Altera a aba para a edição do usuário.
};

/**
 * Função de validação de e-mail.
 * Verifica se o e-mail é válido de acordo com o padrão de regex.
 */
const validateEmail = () => {
    const email = usuario.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão de validação de e-mail.
    if (!email || !emailPattern.test(email)) {
        errors.value.email = 'E-mail inválido'; // Se o e-mail não for válido, exibe erro.
    } else {
        errors.value.email = null; // Caso válido, limpa o erro.
    }
};

/**
 * Função de validação de senha.
 * Verifica se a senha fornecida no formulário é igual à senha original.
 */
const validateSenha = () => {
    if (senha.value !== usuario.senha) {
        errors.value.senha = 'A senha NÃO é a mesma'; // Exibe erro se as senhas não coincidirem.
    } else {
        errors.value.senha = null; // Caso as senhas coincidam, limpa o erro.
    }
};

/**
 * Função para comparar a senha no backend com a senha fornecida.
 */
const isSameSenha = () => {
    return usuario.senha === SenhaBE.value; // Retorna true se as senhas forem iguais.
};

/**
 * Função de validação do formulário.
 * Valida todos os campos e retorna true se o formulário for válido.
 */
const validateForm = () => {
    errors.value = {}; // Limpa os erros antes de validar.
    validateSenha(); // Valida a senha.
    validateEmail(); // Valida o e-mail.
    return Object.keys(errors.value).every((key) => errors.value[key] === null); // Retorna true se não houver erros.
};

/**
 * Função que abre o diálogo de exclusão do usuário.
 */
const deletUsuariodes = (itm) => {
    item.value = itm; // Define o item a ser excluído.
    deleteUsuarioDialog.value = true; // Exibe o diálogo de confirmação.
};

/**
 * Função que realiza a exclusão do usuário.
 * @param {Object} item O usuário a ser excluído.
 */
const deleteUsuario = async (item) => {
    loading.value = true; // Ativa o carregamento enquanto processa a exclusão.
    let data = { id_usuario_delete: item.id_usuario, id_usuario: store.userId, id_cliente: store.userIdCliente }; // Dados para exclusão.
    try {
        const response = await axios.post('/usuarios/deletar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação com o token.
            }
        });
        if (response.status === 200) {
            deleteUsuarioDialog.value = false; // Fecha o diálogo se a exclusão for bem-sucedida.
            fetchUsuarios(); // Recarrega a lista de usuários.
        }
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao deletar os usuários:', error); // Log do erro de exclusão.
    } finally {
        loading.value = false; // Garantia de que o carregamento será desativado após a tentativa.
    }
};

/**
 * Função para voltar à tela inicial.
 */
const voltar = () => {
    active.value = 0; // Retorna para a aba de listagem de usuários.
    resetForm(); // Reseta o formulário.
};

/**
 * Função para enviar o formulário.
 * Verifica se o formulário é válido e realiza a ação de adicionar ou atualizar o usuário.
 */
const submitForm = () => {
    if (validateForm()) { // Verifica se o formulário é válido.
        if (visible.value) {
            atualizarUsuario(); // Se visível, realiza a atualização do usuário.
        } else {
            saveUsuario(); // Se não visível, adiciona um novo usuário.
        }
    }
};

/**
 * Função para adicionar um novo usuário.
 */
const saveUsuario = async () => {
    let data = null;
    if (store.userRole === 'Administrador') {
        data = {}; // Dados para o administrador.
        data = usuario;
        data.id_usuario = store.userId; // Define o id do usuário a partir do store.
    } else {
        data = {}; // Dados para o cliente.
        data = usuario;
        data.id_cliente = store.userIdCliente; // Define o id do cliente.
        data.id_usuario = store.userId; // Define o id do usuário.
    }
    try {
        const response = await axios.post('/usuarios/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação com o token.
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 }); // Exibe uma notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = 0; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao adicionar Usuario:', error); // Log do erro de adição.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
    loading.value = true; // Ativa o carregamento.
};

/**
 * Função para atualizar um usuário.
 */
const atualizarUsuario = async () => {
    loading.value = true; // Ativa o carregamento durante a atualização.
    const data = {
        ...usuario,
        id_usuario_pedinte: store.userId // Inclui o id do usuário solicitante.
    };
    if (isSameSenha()) { // Verifica se a senha não foi alterada.
        delete data.senha; // Se a senha não foi alterada, remove do objeto de dados.
    }
    try {
        const response = await axios.post('/usuarios/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação com o token.
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB atualizado', life: 3000 }); // Notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = 0; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        console.error('Erro ao atualizar o Usuario:', error); // Log de erro.
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o usuário', life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento após a operação.
    }
};

/**
 * Função para buscar as plantas associadas ao cliente.
 */
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o id do cliente.
    };
    try {
        const response = await axios.post('/usuarios/listarPlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação.
            }
        });
        plantas.value = [
            todosOption,
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`,
                value: id_planta
            }))
        ]; // Atualiza a lista de plantas com as opções recebidas.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        //console.error('Erro ao buscar opções de plantas:', error); // Log de erro comentado.
    }
};

/**
 * Função para buscar a lista de usuários.
 */
const fetchUsuarios = async () => {
    loading.value = true; // Ativa o carregamento ao buscar usuários.
    let data = null;
    if (store.userRole === 'Administrador') {
        data = ''; // Para administradores, não é necessário passar filtros adicionais.
        isAdmin.value = true; // Marca que o usuário é administrador.
        fetchCliente(); // Chama a função para buscar os clientes.
    } else {
        data = {}; // Para outros usuários, precisa filtrar pelo cliente.
        data.id_cliente = store.userIdCliente;
    }
    try {
        const response = await axios.post('/usuarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação.
            }
        });
        ListaUsuario.value = response.data; // Atualiza a lista de usuários.
        filteredCount.value = ListaUsuario.value.length; // Atualiza o contador de usuários filtrados.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao carregar usuários:', error); // Log de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
};

/**
 * Observador de mudanças nos filtros globais.
 * Atualiza o contador de usuários filtrados com base no filtro.
 */
watch(() => filters.value.global.value, () => {
    filteredCount.value = ListaUsuario.value.filter(item => {
        const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro.
        return Object.values(item).some(val => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo contém o valor do filtro.
    }).length; // Atualiza o contador.
}, { immediate: true }); // Chama imediatamente após a inicialização.

const fetchCliente = async () => {
    loading.value = true; // Ativa o carregamento ao buscar clientes.
    try {
        const response = await axios.post('/admin/cliente/listar', {
            headers: {
                Authorization: `Bearer ${store.token}` // Autenticação.
            }
        });
        ListaClientes.value = response.data.map(({ id_cliente, nome }) => ({
            label: nome,
            value: id_cliente
        })); // Atualiza a lista de clientes.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao listar Clientes:', error); // Log de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
};

/**
 * Função para formatar as datas no formato `dd/mm/yyyy hh:mm`.
 * @param {string} value A data a ser formatada.
 * @returns {string} A data formatada.
 */
const formatDate = (value) => {
    if (!value) {
        return ''; // Se o valor for vazio, retorna uma string vazia.
    }

    try {
        const date = new Date(value); // Converte o valor para uma data.

        if (isNaN(date)) {
            throw new Error('Data inválida'); // Se a data for inválida, lança erro.
        }

        // Ajusta a data para o fuso horário local
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        const day = String(localDate.getDate()).padStart(2, '0');
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const year = localDate.getFullYear();
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`; // Retorna a data formatada.
    } catch (error) {
        console.error('Erro ao formatar data:', error); // Log de erro.
        return 'Data inválida'; // Retorna mensagem de erro.
    }
};

/**
 * Observador da variável `active`, que detecta mudanças nas abas e executa ações.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) { // Se mudar para a aba 0 (listagem de usuários).
        resetForm(); // Reseta o formulário.
        fetchUsuarios(); // Recarrega a lista de usuários.
        visible.value = false; // Fecha o formulário de edição.
    }
});

/**
 * Função para carregar os dados iniciais (plantas).
 */
const loadData = async () => {
    try {
        plantas.value = dataStore.plantas || await dataStore.fetchPlantas(); // Tenta obter as plantas do store ou via API.
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Log de erro ao carregar dados.
    }
};

onMounted(() => {
    loadData(); // Carrega os dados ao montar o componente.
    fetchUsuarios(); // Recarrega a lista de usuários ao montar.
});

/**
 * Função para resetar o formulário.
 */
const resetForm = () => {
    (usuario.nome = ''), (usuario.Status = true), (usuario.email = ''), (usuario.perfil = ''), (usuario.id_planta = ''), (usuario.senha = ''); // Reseta os campos do formulário.
    senhaAlterada.value = false; // Reseta a flag de senha alterada.
};
</script>

<template>
    <div class="grid">
        <!-- Container principal da página, com um layout em grid -->
        <div class="col-12">
            <!-- Coluna que ocupa toda a largura da tela -->
            <div class="card">
                <h5 class="mt-2">Usuário Web</h5>
                <!-- Título da página -->
                <TabView v-model:activeIndex="active">
                    <!-- Componente de abas (TabView), controla qual aba está ativa -->
                    <TabPanel header="Listar Usuário Web">
                        <!-- Aba para listagem de usuários -->
                        <div class="">
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaUsuario"
                                stripedRows
                                paginator
                                removableSort
                                :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['nome', 'email', 'nome_cliente', 'role', 'last_login']"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                ref="dt"
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="onRowSelect"
                                :sortOrder="1"
                                :sortField="'nome'"
                            >
                                <!-- Componente DataTable para exibir a lista de usuários -->
                                <template #header>
                                    <!-- Cabeçalho da tabela com total de registros e campo de busca -->
                                    <div class="flex justify-content-between mt-4">
                                        <div class="font-semibold">
                                            <span>Total de registros: {{ filteredCount}}</span>
                                            <!-- Exibe a quantidade de registros filtrados -->
                                        </div>
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                            <!-- Campo de busca global para filtrar os usuários -->
                                        </IconField>
                                    </div>
                                </template>

                                <template #empty> Nenhum usuário adicionado. </template>
                                <!-- Mensagem exibida quando não houver usuários na tabela -->

                                <!-- Definição das colunas da tabela -->
                                <Column field="nome" sortable style="width: 20%" class="table-cell" header="Nome">
                                    <!-- Coluna para exibir o nome do usuário -->
                                    <template #body="{ data }">
                                        <span v-tooltip="data.nome">{{ data.nome }}</span>
                                        <!-- Exibe o nome do usuário e aplica tooltip -->
                                    </template>
                                </Column>
                                <Column field="email" sortable class="table-cell" style="width: 25%" header="E-mail">
                                    <!-- Coluna para exibir o e-mail do usuário -->
                                    <template #body="{ data }">
                                        <span v-tooltip="data.email">{{ data.email }}</span>
                                        <!-- Exibe o e-mail do usuário e aplica tooltip -->
                                    </template>
                                </Column>
                                <Column v-if="isAdmin" field="nome_cliente" sortable class="table-cell" style="width: 15%" header="Cliente">
                                    <!-- Coluna para exibir o nome do cliente, visível apenas se o usuário for admin -->
                                    <template #body="{ data }">
                                        <span v-tooltip="data.nome_cliente">{{ data.nome_cliente }}</span>
                                        <!-- Exibe o nome do cliente e aplica tooltip -->
                                    </template>
                                </Column>
                                <Column field="role" sortable class="table-cell" style="width: 15%" header="Role">
                                    <!-- Coluna para exibir o papel (role) do usuário -->
                                    <template #body="{ data }">
                                        <span v-tooltip="data.role">{{ data.role }}</span>
                                        <!-- Exibe o papel do usuário e aplica tooltip -->
                                    </template>
                                </Column>
                                <Column field="ativo" sortable style="width: 9%; text-align: center" header="Ativo">
                                    <!-- Coluna para exibir se o usuário está ativo -->
                                    <template #body="{ data }">
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                                        <!-- Exibe um ícone de status dependendo se o usuário está ativo ou não -->
                                    </template>
                                </Column>
                                <Column field="last_login" sortable class="table-cell" style="width: 17%" header="Último Login">
                                    <!-- Coluna para exibir a data do último login -->
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.last_login)) }}
                                        <!-- Formata a data do último login antes de exibir -->
                                    </template>
                                </Column>
                                <Column style="width: 10%">
                                    <!-- Coluna para o botão de deletar usuário -->
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deletUsuariodes(slotProps.data)" />
                                        <!-- Botão para deletar o usuário -->
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>

                    <TabPanel :header="visible ? 'Editar Usuário Web' : 'Adicionar Usuário Web'">
                        <!-- Aba para edição ou criação de usuário -->
                        <div class="mt-3 mx-0 p-fluid grid">
                            <!-- Formulário de edição ou adição -->
                            <div class="full xl:col-12 lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Nome:</label>
                                <InputText class="my-2" v-model="usuario.nome" id="name" type="text" />
                                <!-- Campo para nome do usuário -->
                            </div>
                            <div class="full xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label for="email">E-mail:</label>
                                <InputText class="my-2" v-model="usuario.email" id="email" :invalid="!!errors.email" @blur="validateEmail" />
                                <!-- Campo para e-mail do usuário, com validação -->
                                <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                <!-- Exibe mensagem de erro se o e-mail for inválido -->
                            </div>
                            <div class="full xl:col-3 lg:col-3 md:col-3 sm:col-12">
                                <label for="senha">Senha:</label>
                                <InputText class="my-2" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Campo para senha do usuário -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                <!-- Exibe mensagem de erro se a senha for inválida -->
                            </div>
                            <div class="full xl:col-3 lg:col-3 md:col-3 sm:col-12">
                                <label for="senha" class="text-nowrap">Confirme a Senha:</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Campo para confirmação de senha -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                <!-- Exibe mensagem de erro se as senhas não coincidirem -->
                            </div>

                            <div v-if="isAdmin" class="full xl:col-12 lg:col-12 md:col-12 sm:col-12">
                                <label for="perfil">Cliente:</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.id_cliente" :options="ListaClientes" optionLabel="label" optionValue="value" placeholder="Escolha um"></Dropdown>
                                <!-- Dropdown para selecionar o cliente, visível apenas se for admin -->
                            </div>

                            <div class="full xl:col-4 flex flex-column align-items-center m-0 lg:col-4 md:col-4 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">Usuario Ativo?</label>
                                <div class="grid mt-3">
                                    <InputSwitch v-model="usuario.ativo" inputId="switch2" class="mr-2" />
                                    <span class="ml-2">{{ usuario.ativo ? 'Sim' : 'Não' }}</span>
                                    <!-- Switch para ativar/desativar o usuário -->
                                </div>
                            </div>
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="perfil">Perfil:</label>
                                <Dropdown class="my-2" id="perfil" v-model="usuario.role" :options="dropdownItems" optionLabel="label" optionValue="value" placeholder="Escolha um"></Dropdown>
                                <!-- Dropdown para selecionar o perfil do usuário -->
                            </div>

                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="planta">Planta:</label>
                                <Dropdown class="my-2" id="planta" v-model="usuario.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos"></Dropdown>
                                <!-- Dropdown para selecionar a planta -->
                            </div>

                            <div class="flex align-items-center justify-content-end field col-12 mt-7">
                                <!-- Botões de ação -->
                                <Button v-if="visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="submitForm()" />
                                <!-- Botão de salvar se o formulário estiver visível (edição) -->
                                <Button style="width: 30%" class="buttons flex align-items-center justify-content-center m-2 mr-0" label="Voltar" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                <!-- Botão de voltar -->
                                <Button v-if="!visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="submitForm" />
                                <!-- Botão de salvar se o formulário não estiver visível (adicionar) -->
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
                <Dialog header="Deletar Usuario" v-model:visible="deleteUsuarioDialog" style="width: 400px" :modal="true" :closable="false">
                    <!-- Diálogo para confirmar a exclusão do usuário -->
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            Você tem certeza que deseja deletar o Usuario <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b> ?</span
                        >
                        <!-- Exibe confirmação para deletar o usuário selecionado -->
                    </div>
                    <template #footer>
                        <!-- Botões de confirmação ou cancelamento -->
                        <Button label="Não" icon="pi pi-times" @click="deleteUsuarioDialog = false" class="p-button-text" />
                        <!-- Botão para cancelar a exclusão -->
                        <Button label="Sim" icon="pi pi-check" @click="deleteUsuario(item)" class="p-button-text" />
                        <!-- Botão para confirmar a exclusão -->
                    </template>
                </Dialog>
                <LoadingSpinner v-if="loading" />
                <!-- Componente de carregamento (spinner) visível durante operações assíncronas -->
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

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.text-nowrap {
    white-space: nowrap;
}

.table-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>

