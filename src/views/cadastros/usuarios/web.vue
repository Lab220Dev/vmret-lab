<script setup>
// Importação dos hooks e bibliotecas do Vue e PrimeVue
import { reactive, ref, onMounted, watch, computed } from 'vue'; // Importação das funções do Vue.
import { useToast } from 'primevue/usetoast'; // Importação do hook para exibição de toast messages.
import { useAuthStore } from '@/store/authStore.js'; // Importação do store de autenticação.
import { FilterMatchMode } from '@primevue/core/api'; // Importação do filtro de correspondência.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importação do componente de spinner de carregamento.
import { useDataStore } from '@/store/dataStore.js'; // Importação do store de dados.
import { FormatarListaCliente } from '@/helpers/DMHelper.js';//Importa a função FormatarListaCliente do arquivo DMHelper.js localizado na pasta helpers
import { prepareListData } from '@/helpers/HelperUtils.js';//Importa a função prepareListData do arquivo HelperUtils.js localizado na pasta helpers
import usuarioService from '@/services/usuarioService';//Importa o serviço usuarioService do arquivo usuarioService.js localizado na pasta services
import plantaService from '@/services/plantaService';//Importa o serviço plantaService do arquivo plantaService.js localizado na pasta services
import { resetUsuario } from '@/helpers/formHelper.js';//Importa a função resetUsuario do arquivo formHelper.js localizado na pasta helpers
import { useI18n } from 'vue-i18n';//Importa o hook useI18n da biblioteca vue-i18n para internacionalização
const { t } = useI18n();//Desestruturação do hook useI18n para obter a função t, que é usada para tradução

// Variáveis reativas para controle da aplicação
const active = ref("0");// Variável reativa para controlar a aba ativa.
const dataStore = useDataStore(); // Instância do store de dados.
const store = useAuthStore(); // Instância do store de autenticação.
const loading = ref(false); // Variável para controlar o estado de carregamento.
const toast = useToast(); // Instância para exibição de toast.
const todosOption = { label: 'Todos', value: null }; // Opção de filtro para "Todos".
const visible = ref(false); // Variável para controlar a visibilidade do formulário de edição de usuário.
const senha = ref(''); // Variável reativa para senha.
const senhaAlterada = ref(false); // Flag para indicar se a senha foi alterada.
const SenhaBE = ref(''); // Variável para armazenar a senha original do backend.
const plantas = computed(() => dataStore.plantasOptions);// Opção inicial de plantas.
const isAdmin = ref(false); // Flag para verificar se o usuário é administrador.
const item = ref({}); // Objeto reativo para armazenar informações do item selecionado.
const errors = ref({}); // Objeto para armazenar mensagens de erro de validação de formulário.
const ListaClientes = ref([]); // Lista de clientes.
let usuario = reactive({// Objeto reativo para armazenar informações do usuário.
    nome: '',
    email: '',
    role: '',
    planta: '',
    senha: '',
    ativo: true,
    id_cliente: ''
}); 
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'nome', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
const ListaUsuario = ref([]); // Lista de usuários.

const selectItems = computed(() => [
    // Opções de roles para o usuário.
    { label: t('manager'), value: 'Gestor' },
    { label: t('master'), value: 'Master' },
    { label: t('operator'), value: 'Operador' },
    { label: t('one_time_release'), value: 'Avulso' }
]);

// Filtros globais para a tabela de usuários.
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filteredCount = ref(0); // Contador de usuários filtrados.

const deleteUsuarioDialog = ref(false); // Controle da visibilidade do diálogo de confirmação de exclusão.

/**
 * Função de validação de e-mail.
 * Verifica se o e-mail é válido de acordo com o padrão de regex.
 */
const validateEmail = () => {
    const email = usuario.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão de validação de e-mail.
    if (!email || !emailPattern.test(email)) {
        errors.value.email = t('invalid_email'); // Se o e-mail não for válido, exibe erro.
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
        errors.value.senha = t('invalid_password'); // Exibe erro se as senhas não coincidirem.
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
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await fetchUsuarios(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await fetchUsuarios(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await fetchUsuarios(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
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
        const response = await usuarioService.deletarUsuario(data);
        if (response.status === 200) {
            deleteUsuarioDialog.value = false; // Fecha o diálogo se a exclusão for bem-sucedida.
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('delete_web_user_sucess'), life: 3000 }); // Exibe uma notificação de sucesso.
            fetchUsuarios(); // Recarrega a lista de usuários.
        }
    } catch (error) {
        console.error('Erro ao deletar os usuários:', error); // Log do erro de exclusão.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('delete_web_user_fail'), life: 3000 }); // Notificação de erro.
        loading.value = false;
    } finally {
        loading.value = false; // Garantia de que o carregamento será desativado após a tentativa.
    }
};

/**
 * Função para voltar à tela inicial.
 */
const voltar = () => {
    value.value = "0"; // Retorna para a aba de listagem de usuários.
    resetForm(); // Reseta o formulário.
};

/**
 * Função para enviar o formulário.
 * Verifica se o formulário é válido e realiza a ação de adicionar ou atualizar o usuário.
 */
const submitForm = () => {
    if (validateForm()) {
        // Verifica se o formulário é válido.
        if (visible.value) {
            atualizarUsuario(); // Se visível, realiza a atualização do usuário.
        } else {
            saveUsuario(); // Se não visível, adiciona um novo usuário.
        }
    }
};

const saveUsuario = async () => {//Função para adicionar um novo usuário.
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
        const response = await usuarioService.adicionarUsuario(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('add_web_user_sucess'), life: 3000 }); // Exibe uma notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = "0"; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao adicionar Usuario:', error); // Log do erro de adição.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('add_web_user_fail'), life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
    loading.value = false; // Ativa o carregamento.
};

const atualizarUsuario = async () => {//Função para atualizar um usuário.
    loading.value = true; // Ativa o carregamento durante a atualização.
    const data = {
        ...usuario,
        id_usuario_pedinte: store.userId // Inclui o id do usuário solicitante.
    };
    if (isSameSenha()) {
        // Verifica se a senha não foi alterada.
        delete data.senha; // Se a senha não foi alterada, remove do objeto de dados.
    }
    try {
        const response = await usuarioService.atualizarUsuario(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('update_web_user_sucess'), life: 3000 }); // Notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = "0"; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        console.error('Erro ao atualizar o Usuario:', error); // Log de erro.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('update_web_user_fail'), life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento após a operação.
    }
};

/**
 * Função para buscar as plantas associadas ao cliente.
 */
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: usuario.id_cliente // Passa o id do cliente.
    };
    try {
        const response = await plantaService.listarPlantaSimples(data);
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
const fetchUsuarios = async (page = 1) => {
    loading.value = true; // Ativa o carregamento ao buscar usuários.
    const params = {
        first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
        rows: lazyParams.value.rows, // Número de registros por página
        sortField: lazyParams.value.sortField, // Campo para ordenação
        sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
        filters: lazyParams.value.filters // Filtros aplicados
    };
    const data = prepareListData(params);
    if (store.userRole === 'Administrador') {
        isAdmin.value = true; // Marca que o usuário é administrador.
        fetchCliente(); // Chama a função para buscar os clientes.
    }
    try {
        const response = await usuarioService.listarUsuariosPaginado(data);
        ListaUsuario.value = response.data.usuarios; // Atualiza a lista de usuários.
        filteredCount.value = response.data.totalRecords; // Atualiza o contador de usuários filtrados.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao carregar usuários:', error); // Log de erro.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_user_list'), life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
};

/**
 * Observador de mudanças nos filtros globais.
 * Atualiza o contador de usuários filtrados com base no filtro.
 */
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = ListaUsuario.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro.
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo contém o valor do filtro.
        }).length; // Atualiza o contador.
    },
    { immediate: true }
); // Chama imediatamente após a inicialização.

const fetchCliente = async () => {
    loading.value = true; // Ativa o carregamento ao buscar clientes.
    try {
        const response = await usuarioService.listarClientes();
        ListaClientes.value = [...FormatarListaCliente(response.data, true)]; // Atualiza a lista de clientes.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao listar Clientes:', error); // Log de erro.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_client_list'), life: 3000 }); // Notificação de erro.
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

const onRowSelect = (event) => {
    visible.value = true; // Torna o formulário visível.
    Object.assign(usuario, event.data); // Atualiza o objeto reativo com os dados do usuário selecionado.
    senha.value = usuario.senha; // Preenche o campo de senha.
    SenhaBE.value = usuario.senha; // Armazena a senha original do backend.
    senhaAlterada.value = false; // Reseta a flag de alteração da senha.
    active.value = "1";
};

/**
 * Observador da variável `value`, que detecta mudanças nas abas e executa ações.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === "0") {
        // Se mudar para a aba 0 (listagem de usuários).
        senha.value = ''; // Reseta a senha.
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
        if (!dataStore.plantas) await dataStore.fetchPlantas();// Tenta obter as plantas do store ou via API.
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.
        console.error('Erro ao carregar dados iniciais:', error); // Log de erro ao carregar dados.
    }
};
function debounce(func, wait = 300) { // Declara uma função chamada debounce
    let timeout; // Declara uma variável para armazenar o timeout
    return (...args) => { // Retorna uma função que recebe argumentos
        clearTimeout(timeout); // Limpa o timeout anterior
        timeout = setTimeout(() => func.apply(this, args), wait); // Define um novo timeout para chamar a função após o tempo de espera
    };
}
const debouncedFilterChange = debounce(() => { // Declara uma função chamada debouncedFilterChange que usa debounce para chamar onFilterChange após 300ms
    onFilterChange();
}, 300);

onMounted(async () => { // Declara uma função assíncrona chamada onMounted
    if (store.userRole === 'Administrador') { // Verifica se o papel do usuário é 'Administrador'
        await fetchUsuarios(); // Busca a lista de usuários
    } else {
        loadData(); // Carrega os dados ao montar o componente
        fetchUsuarios(); // Recarrega a lista de usuários ao montar
    }
    active.value = "0"; // Define a aba ativa como 0 (listagem de usuários)
    
});

/**
 * Função para resetar o formulário.
 */
const resetForm = () => {
    resetUsuario(usuario); // Reseta o formulário.
    senhaAlterada.value = false; // Reseta a flag de senha alterada.
};
</script>

<template>
    <div class="grid">
        <!-- Container principal da página, com um layout em grid -->
        <div class="col-12">
            <!-- Coluna que ocupa toda a largura da tela -->
            <div class="card">
                <Tabs v-model:value="active" :value="0">
                    <TabList>
                        <!-- Lista de abas (TabList) -->
                        <Tab value="0">{{$t('list_web_users')}}</Tab>
                        <Tab value="1">{{visible ? t('edit_user') : t('add_user')}}</Tab>
                        <!-- Abas para listagem e edição/adicionar usuário -->
                    </TabList>
                    <TabPanels >
                        <TabPanel value="0">
                            <!-- Aba para listagem de usuários -->
                            <div>
                                <DataTable
                                class = "p-datatable p-datatable-striped"
                                    v-model:filters="filters"
                                    :value="ListaUsuario"
                                    stripedRows
                                    paginator
                                    lazy
                                    :totalRecords="filteredCount"
                                    removableSort
                                    :rows="lazyParams.value?.rows || 10"
                                    :rowsPerPageOptions="[5, 10, 20, 50]"
                                    :globalFilterFields="['nome', 'email', 'nome_cliente', 'role', 'last_login']"
                                    selectionMode="single"
                                    tableStyle="min-width: 50rem; table-layout: ;"
                                    ref="dt"
                                    dataKey="id"
                                    :metaKeySelection="false"
                                    @rowSelect="onRowSelect"
                                    @filter="onFilterChange($event)"
                                    @page="onPageChange($event)"
                                    @sort="onSortChange($event)"
                                    :sortOrder="lazyParams.value?.sortOrder || 1"
                                    :sortField="lazyParams.value?.sortField || 'nome'"
                                >
                                    <!-- A tabela exibe os dados provenientes de 'ListaUsuario' -->
                                    <!-- Aplica um estilo de linhas alternadas (listradas) para melhorar a legibilidade -->
                                    <!-- A tabela está paginada, com 10 linhas exibidas por página e opções de 5, 10, 20 ou 50 linhas por página -->
                                    <!-- Permite ao usuário selecionar apenas uma linha por vez -->
                                    <!-- Aplica um estilo de largura mínima de 50rem e layout fixo, garantindo que as colunas tenham larguras constantes -->
                                    <!-- Cria uma referência chamada 'dt' para o componente DataTable, que pode ser acessada diretamente no Vue -->
                                    <!-- Usa o campo 'id' como a chave única para cada linha da tabela -->
                                    <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" (como Ctrl ou Command) -->
                                    <!-- Quando uma linha é selecionada, a função 'onRowSelect' é chamada -->
                                    <!-- A ordenação inicial é feita pelo campo 'nome', de forma crescente -->
                                    <!-- Componente DataTable para exibir a lista de usuários -->
                                    <template #header>
                                        <!-- Cabeçalho da tabela com total de registros e campo de busca -->
                                        <div class="flex justify-content-between mt-4">
                                            <div class="font-semibold">
                                                <span>{{ $t('total_records' ,{count: filteredCount})}}</span>
                                                <!-- Exibe a quantidade de registros filtrados -->
                                            </div>
                                            <IconField iconPosition="left">
                                                <InputIcon>
                                                    <i class="pi pi-search" />
                                                </InputIcon>
                                                <InputText v-model="filters['global'].value" :placeholder="t('search')"  @input="debouncedFilterChange" autocomplete="off"/>
                                                <!-- Campo de busca global para filtrar os usuários -->
                                            </IconField>
                                        </div>
                                    </template>
                                    <template #empty> {{ t('empty_user') }} </template>
                                    <!-- Mensagem exibida quando não houver usuários na tabela -->
                                    <!-- Definição das colunas da tabela -->
                                    <Column field="nome" sortable style="width: 20%" class="table-cell" :header="t('name')">
                                        <!-- Coluna para exibir o nome do usuário -->
                                        <template #body="{ data }">
                                            <span v-tooltip="data.nome">{{ data.nome }}</span>
                                            <!-- Exibe o nome do usuário e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <Column field="email" sortable class="table-cell" style="width: 25%" :header="t('email')">
                                        <!-- Coluna para exibir o e-mail do usuário -->
                                        <template #body="{ data }">
                                            <span v-tooltip="data.email">{{ data.email }}</span>
                                            <!-- Exibe o e-mail do usuário e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <Column v-if="isAdmin" field="nome_cliente" sortable class="table-cell" style="width: 15%" :header="t('client')">
                                        <!-- Coluna para exibir o nome do cliente, visível apenas se o usuário for admin -->
                                        <template #body="{ data }">
                                            <span v-tooltip="data.nome_cliente">{{ data.nome_cliente }}</span>
                                            <!-- Exibe o nome do cliente e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <Column field="role" sortable class="table-cell" style="width: 15%" :header="t('role')">
                                        <!-- Coluna para exibir o papel (role) do usuário -->
                                        <template #body="{ data }">
                                            <span v-tooltip="data.role">{{ data.role }}</span>
                                            <!-- Exibe o papel do usuário e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <Column field="ativo" sortable style="width: 9%; text-align: center" :header="t('active')">
                                        <!-- Coluna para exibir se o usuário está ativo -->
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes': data.ativo, 'pi-times-circle pi-no': !data.ativo }"></i>
                                            <!-- Exibe um ícone de status dependendo se o usuário está ativo ou não -->
                                        </template>
                                    </Column>
                                    <Column field="last_login" sortable class="table-cell" style="width: 17%" :header="t('last_login')">
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
                        <TabPanel value="1">
                            <!-- Aba para edição ou criação de usuário -->
                            <div class="mt-5 mx-0 grid">
                                <!-- Formulário de edição ou adição -->
                                <div class=" xl:col-6 lg:col-6 md:col-12 sm:col-12" >
                                    <label for="name">{{ t('name') }}:</label>
                                    <InputText class="my-2 w-full" v-model="usuario.nome" id="name" type="text"/>
                                    <!-- Campo para nome do usuário -->
                                </div>
                                <div class=" xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                    <label for="email">{{ t('email') }}:</label>
                                    <InputText class="my-2 w-full" v-model="usuario.email" id="email" :invalid="!!errors.email" @blur="validateEmail" />
                                    <!-- Campo para e-mail do usuário, com validação -->
                                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                    <!-- Exibe mensagem de erro se o e-mail for inválido -->
                                </div>
                                <div :class="isAdmin ? 'xl:col-4 lg:col-4 md:col-3 sm:col-12' : 'xl:col-6 lg:col-6 md:col-3 sm:col-12'">
                                    <label for="senha">{{ t('password') }}:</label>
                                    <InputText class="my-2 w-full" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                    <!-- Campo para senha do usuário -->
                                    <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                    <!-- Exibe mensagem de erro se a senha for inválida -->
                                </div>
                                <div :class="isAdmin ? 'xl:col-4 lg:col-4 md:col-3 sm:col-12' : 'xl:col-6 lg:col-6 md:col-3 sm:col-12'">
                                    <label for="senha" class="text-nowrap">{{ t('confirm_password') }}:</label>
                                    <InputText class="my-2 w-full" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                    <!-- Campo para confirmação de senha -->
                                    <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                    <!-- Exibe mensagem de erro se as senhas não coincidirem -->
                                </div>
                                <div v-if="isAdmin" class="xl:col-4 lg:col-4 md:col-12 sm:col-12">
                                    <label for="perfil">{{ t('client') }}:</label>
                                    <Select class="my-2 w-full" id="perfil" v-model="usuario.id_cliente" :options="ListaClientes" optionLabel="label" optionValue="value" :placeholder="$t('choose_one')" @change="fetchIdPlanta"></Select>
                                    <!-- Select para selecionar o cliente, visível apenas se for admin -->
                                </div>
                                <div class=" xl:col-4 flex flex-column align-items-center m-0 lg:col-4 md:col-4 sm:col-12">
                                    <label class="mt-0 text-nowrap" for="switch2">{{ t('active_user') }}</label>
                                    <div class="grid mt-3 w-full align-items-center justify-content-center switch-wrapper">
                                        <ToggleSwitch v-model="usuario.ativo" inputId="switch2" class="mr-2 " />
                                        <span class="ml-2">{{ usuario.ativo ? $t('yes') : $t('no') }}</span>
                                        <!-- Switch para ativar/desativar o usuário -->
                                    </div>
                                </div>
                                <div class=" xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                    <label for="perfil">{{ t('profile') }}:</label>
                                    <Select class="my-2 w-full" id="perfil" v-model="usuario.role" :options="selectItems" optionLabel="label" optionValue="value" :placeholder="$t('choose_one')"></Select>
                                    <!-- Select para selecionar o perfil do usuário -->
                                </div>
                                <div class=" xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                    <label for="planta">{{ t('factory') }}:</label>
                                    <Select class="my-2 w-full" filter id="planta" v-model="usuario.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')"></Select>
                                    <!-- Select para selecionar a planta -->
                                </div>
                                <div class="flex align-items-center justify-content-end field col-12 mt-7">
                                    <!-- Botões de ação -->
                                    <Button v-if="visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" :label="$t('save')" icon="pi pi-check" severity="primary" @click="submitForm()" />
                                    <!-- Botão de salvar se o formulário estiver visível (edição) -->
                                    <Button style="width: 30%" class="buttons flex align-items-center justify-content-center m-2 mr-0" :label="$t('back')" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                    <!-- Botão de voltar -->
                                    <Button v-if="!visible" style="width: 30%" class="buttons flex align-items-center justify-content-center m-2" :label="$t('save')" icon="pi pi-check" severity="primary" @click="submitForm" />
                                    <!-- Botão de salvar se o formulário não estiver visível (adicionar) -->
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <Dialog :header="$t('delete_web_user')" v-model:visible="deleteUsuarioDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                    <!-- Diálogo para confirmar a exclusão do usuário -->
                    <div class="confirmation-content">
                        <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                        <span class="">
                            {{ t('confirm_delete_user', { id: item.id_cliente, name: item.nome }) }}
                        </span>
                        <!-- Exibe confirmação para deletar o usuário selecionado -->
                    </div>
                    <template #footer>
                        <!-- Botões de confirmação ou cancelamento -->
                        <Button :label="$t('no')" icon="pi pi-times" @click="deleteUsuarioDialog = false" class="p-button-text" />
                        <!-- Botão para cancelar a exclusão -->
                        <Button :label="$t('yes')" icon="pi pi-check" @click="deleteUsuario(item)" class="p-button-text" />
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

</style>
