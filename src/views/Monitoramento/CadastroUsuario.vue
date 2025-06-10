<script setup>
// Importação dos hooks e bibliotecas do Vue e PrimeVue
import { reactive, ref, onMounted, watch, computed } from 'vue'; // Importação das funções do Vue.
import { useToast } from 'primevue/usetoast'; // Importação do hook para exibição de toast messages.
import { FilterMatchMode } from '@primevue/core/api'; // Importação do filtro de correspondência.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importação do componente de spinner de carregamento.
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService'; // Importa o serviço de monitoramento, que deve conter as funções para interagir com a API.
import { resetUsuario } from '@/helpers/formHelper.js'; //Importa a função resetUsuario do arquivo formHelper.js localizado na pasta helpers
import { useI18n } from 'vue-i18n'; //Importa o hook useI18n da biblioteca vue-i18n para internacionalização
const { t } = useI18n(); //Desestruturação do hook useI18n para obter a função t, que é usada para tradução

// Variáveis reativas para controle da aplicação
const active = ref('0'); // Variável reativa para controlar a aba ativa.
const loading = ref(false); // Variável para controlar o estado de carregamento.
const toast = useToast(); // Instância para exibição de toast.
const visible = ref(false); // Variável para controlar a visibilidade do formulário de edição de usuário.
const senha = ref(''); // Variável reativa para senha.
const senhaAlterada = ref(false); // Flag para indicar se a senha foi alterada.
const SenhaBE = ref(''); // Variável para armazenar a senha original do backend.
const item = ref({}); // Objeto reativo para armazenar informações do item selecionado.
const errors = ref({}); // Objeto para armazenar mensagens de erro de validação de formulário.
let usuario = reactive({
    // Objeto reativo para armazenar informações do usuário.
    nome: '',
    senha: '',
    monitoramento: false, // Adicionado para controle de monitoramento
    master: false, // Adicionado para controle de master
    abastecimento: false // Adicionado para controle de abastecimento
});

const ListaUsuario = ref([]); // Lista de usuários.

// Filtros globais para a tabela de usuários.
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filteredCount = ref(0); // Contador de usuários filtrados.

const deleteUsuarioDialog = ref(false); // Controle da visibilidade do diálogo de confirmação de exclusão.

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
 * Função de validação do formulário.
 * Valida todos os campos e retorna true se o formulário for válido.
 */
const validateForm = () => {
    errors.value = {}; // Limpa os erros antes de validar.
    validateSenha(); // Valida a senha.
    return Object.keys(errors.value).every((key) => errors.value[key] === null); // Retorna true se não houver erros.
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await fetchUsuarios(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
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
    let data = {}; // Dados para exclusão.
    try {
        const response = await monitoramentoService.deleteUser(data);
        if (response.status === 200) {
            deleteUsuarioDialog.value = false; // Fecha o diálogo se a exclusão for bem-sucedida.
            toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('delete_mon_user_sucess'), life: 3000 }); // Exibe uma notificação de sucesso.
            fetchUsuarios(); // Recarrega a lista de usuários.
        }
    } catch (error) {
        console.error('Erro ao deletar os usuários:', error); // Log do erro de exclusão.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('delete_mon_user_fail'), life: 3000 }); // Notificação de erro.
        loading.value = false;
    } finally {
        loading.value = false; // Garantia de que o carregamento será desativado após a tentativa.
    }
};
/**
 * Função para voltar à tela inicial.
 */
const voltar = () => {
    value.value = '0'; // Retorna para a aba de listagem de usuários.
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

const saveUsuario = async () => {
    //Função para adicionar um novo usuário.
    let data = null;

    data = {};
    data = usuario;

    try {
        const response = await monitoramentoService.register(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('add_mon_user_sucess'), life: 3000 }); // Exibe uma notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = '0'; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        loading.value = false; // Desativa o carregamento em caso de erro.
        console.error('Erro ao adicionar Usuario:', error); // Log do erro de adição.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('add_mon_user_fail'), life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento.
    }
    loading.value = false; // Ativa o carregamento.
};

const fetchUsuarios = async () => {
    loading.value = true;
    try {
        const usuarios = await monitoramentoService.listarUsuarios();
        console.log('Usuários:', usuarios);
        ListaUsuario.value = usuarios;
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
    } finally {
        loading.value = false;
    }
};

const isSameSenha = () => {
    return usuario.senha === SenhaBE.value; // Retorna true se as senhas forem iguais.
};

const atualizarUsuario = async () => {
    //Função para atualizar um usuário.
    loading.value = true; // Ativa o carregamento durante a atualização.
    const data = {
        ...usuario
    };
    if (isSameSenha()) {
        // Verifica se a senha não foi alterada.
        delete data.senha; // Se a senha não foi alterada, remove do objeto de dados.
    }
    try {
        const response = await monitoramentoService.atualizarUsuario(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('update_mon_user_sucess'), life: 3000 }); // Notificação de sucesso.
        fetchUsuarios(); // Recarrega a lista de usuários.
        active.value = '0'; // Retorna à aba inicial.
        resetForm(); // Reseta o formulário.
    } catch (error) {
        console.error('Erro ao atualizar o Usuario:', error); // Log de erro.
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('update_mon_user_fail'), life: 3000 }); // Notificação de erro.
    } finally {
        loading.value = false; // Desativa o carregamento após a operação.
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

const onRowSelect = (event) => {
    visible.value = true; // Torna o formulário visível.
    Object.assign(usuario, event.data); // Atualiza o objeto reativo com os dados do usuário selecionado.
    senha.value = usuario.senha; // Preenche o campo de senha.
    SenhaBE.value = usuario.senha; // Armazena a senha original do backend.
    senhaAlterada.value = false; // Reseta a flag de alteração da senha.
    active.value = '1';
};

/**
 * Observador da variável `value`, que detecta mudanças nas abas e executa ações.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === '0') {
        // Se mudar para a aba 0 (listagem de usuários).
        senha.value = ''; // Reseta a senha.
        resetForm(); // Reseta o formulário.
        fetchUsuarios(); // Recarrega a lista de usuários.
        visible.value = false; // Fecha o formulário de edição.
    }
});

function debounce(func, wait = 300) {
    // Declara uma função chamada debounce
    let timeout; // Declara uma variável para armazenar o timeout
    return (...args) => {
        // Retorna uma função que recebe argumentos
        clearTimeout(timeout); // Limpa o timeout anterior
        timeout = setTimeout(() => func.apply(this, args), wait); // Define um novo timeout para chamar a função após o tempo de espera
    };
}
const debouncedFilterChange = debounce(() => {
    // Declara uma função chamada debouncedFilterChange que usa debounce para chamar onFilterChange após 300ms
    onFilterChange();
}, 300);

onMounted(async () => {
    await fetchUsuarios(); // Busca a lista de usuários

    active.value = '0'; // Define a aba ativa como 0 (listagem de usuários)

    const searchInput = document.querySelector('[name="unique-search-field"]');
    if (searchInput) {
        searchInput.setAttribute('autocomplete', 'off');
    }
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
                        <Tab value="0">{{ t('ListarUsuarios') }}</Tab>
                        <Tab value="1">{{ t('AdicionarUsuario') }}</Tab>
                        <!-- Abas para listagem e edição/adicionar usuário -->
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <!-- Aba para listagem de usuários -->
                            <div>
                                <DataTable
                                    class="p-datatable p-datatable-striped"
                                    :value="ListaUsuario"
                                    stripedRows
                                    removableSort
                                    :globalFilterFields="['nome', 'monitoramento', 'master', 'abastecimento']"
                                    selectionMode="single"
                                    tableStyle="min-width: 50rem; table-layout: auto;"
                                    ref="dt"
                                    dataKey="id_user"
                                    :metaKeySelection="false"
                                    @rowSelect="onRowSelect"
                                >
                                    <template #empty> {{ t('empty_user') }} </template>
                                    <Column field="nome" sortable style="width: 20%" class="table-cell" :header="t('name')">
                                        <template #body="slotProps">
                                            {{ slotProps.data.nome }}
                                        </template>
                                    </Column>
                                    <Column field="monitoramento" sortable class="table-cell" style="width: 10%" :header="t('monitoring')">
                                        <!-- Coluna para exibir o e-mail do usuário -->
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes': data.monitoramento, 'pi-times-circle pi-no': !data.monitoramento }"></i>
                                        </template>
                                    </Column>
                                    <Column field="master" sortable class="table-cell" style="width: 10%" :header="t('Master')">
                                        <!-- Coluna para exibir o nome do cliente, visível apenas se o usuário for admin -->
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes': data.master, 'pi-times-circle pi-no': !data.master }"></i>
                                            <!-- Exibe o nome do cliente e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <Column field="abastecimento" sortable class="table-cell" style="width: 10%" :header="t('Abastecimento')">
                                        <!-- Coluna para exibir o papel (role) do usuário -->
                                        <template #body="{ data }">
                                            <i class="pi" :class="{ 'pi-check-circle pi-yes': data.abastecimento, 'pi-times-circle pi-no': !data.abastecimento }"></i>
                                            <!-- Exibe o papel do usuário e aplica tooltip -->
                                        </template>
                                    </Column>
                                    <!-- <Column style="width: 10%">
                                        <template #body="slotProps">
                                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deletUsuariodes(slotProps.data)" />
                                            
                                        </template>
                                    </Column> -->
                                </DataTable>
                            </div>
                        </TabPanel>
                        <TabPanel value="1">
                            <!-- Aba para edição ou criação de usuário -->
                            <div class="mt-5 mx-0 grid">
                                <!-- Formulário de edição ou adição -->
                                <div class="xl:col-4 lg:col-4 md:col-12 sm:col-12">
                                    <label for="name">{{ t('name') }}:</label>
                                    <InputText class="my-2 w-full" v-model="usuario.nome" id="name" type="text" autocomplete="off" aria-required="true" />
                                    <!-- Campo para nome do usuário -->
                                </div>
                                <div class="xl:col-4 lg:col-4 md:col-6 sm:col-12">
                                    <label for="senha">{{ t('password') }}:</label>
                                    <InputText class="my-2 w-full" id="senha" v-model="usuario.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" autocomplete="off" />
                                    <!-- Campo para senha do usuário -->
                                    <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                    <!-- Exibe mensagem de erro se a senha for inválida -->
                                </div>
                                <div class="xl:col-4 lg:col-4 md:col-6 sm:col-12">
                                    <label for="senha" class="text-nowrap">{{ t('confirm_password') }}:</label>
                                    <InputText class="my-2 w-full" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" autocomplete="off" aria-required="true" />
                                    <!-- Campo para confirmação de senha -->
                                    <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                                    <!-- Exibe mensagem de erro se as senhas não coincidirem -->
                                </div>
                                <div class="grid col-12 justify-center text-center">
                                    <div class="xl:col lg:col-4 md:col-4 sm:col-12 col-12 flex flex-column align-items-center">
                                        <label class="mt-0 text-nowrap" for="switch-monitoring">{{ t('monitoring') }}</label>
                                        <div class="grid mt-3 w-full align-items-center justify-content-center switch-wrapper">
                                            <ToggleSwitch v-model="usuario.monitoramento" inputId="switch-monitoring" class="mr-2" />
                                            <span class="ml-2">{{ usuario.monitoramento ? $t('yes') : $t('no') }}</span>
                                        </div>
                                    </div>

                                    <div class="xl:col-4 lg:col-4 md:col-4 sm:col-12 col-12 flex flex-column align-items-center">
                                        <label class="mt-0 text-nowrap" for="switch-master">{{ t('Master') }}</label>
                                        <div class="grid mt-3 w-full align-items-center justify-content-center switch-wrapper">
                                            <ToggleSwitch v-model="usuario.master" inputId="switch-master" class="mr-2" />
                                            <span class="ml-2">{{ usuario.master ? $t('yes') : $t('no') }}</span>
                                        </div>
                                    </div>

                                    <div class="xl:col-4 lg:col-4 md:col-4 sm:col-12 col-12 flex flex-column align-items-center">
                                        <label class="mt-0 text-nowrap" for="switch-abastecimento">{{ t('Abastecimento') }}</label>
                                        <div class="grid mt-3 w-full align-items-center justify-content-center switch-wrapper">
                                            <ToggleSwitch v-model="usuario.abastecimento" inputId="switch-abastecimento" class="mr-2" />
                                            <span class="ml-2">{{ usuario.abastecimento ? $t('yes') : $t('no') }}</span>
                                        </div>
                                    </div>
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

<style></style>
