<script setup>
import { reactive, ref, onMounted, watch } from 'vue'; // Funções reativas e hooks do Vue.js
import { useToast } from 'primevue/usetoast'; // Função para mostrar notificações
import { FilterMatchMode } from 'primevue/api'; // Modo de filtro para tabelas, como CONTAINS ou EQUALS
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Spinner de carregamento
import MenuSelector from '@/components/MenuSelector.vue'; // Seleção de menus hierárquicos
import clientesService from '@/services/clientesService'; // Serviço para manipulação de dados de clientes
import { validarCNPJ } from '@/helpers/HelperValidacao.js'; // Função para validar CNPJ
import { resetClienteForm } from '@/helpers/formHelper'; // Função para resetar o formulário de cliente
import { formatDate } from '@/helpers/HelperUtils.js'; // Função para formatação de datas (não utilizada diretamente)

/**
 * Declaração de variáveis reativas com `ref` e `reactive` do Vue
 */
const active = ref(0); // Controle do índice ativo (0 indica nenhuma etapa selecionada)
const show = ref(false); // Controle da visibilidade de algum componente (não utilizado diretamente)
const toast = useToast(); // Instância da função de notificação
const loading = ref(false); // Flag de carregamento (indica se o sistema está processando dados)
const ListaClientes = ref([]); // Lista de clientes, inicialmente vazia
const visible = ref(false); // Controle da visibilidade do formulário de cliente
const deleteClienteDialog = ref(false); // Controle da exibição do diálogo de exclusão de cliente
const item = ref({}); // Armazena o cliente selecionado para exclusão
const selectedPerfil = ref(null); // Armazena o perfil selecionado para o cliente
const structuredMenus = ref([]); // Estrutura de menus hierárquicos selecionados para o cliente
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que procura valores que contenham o texto fornecido
});

/**
 * Objeto `cliente` reativo para armazenar os dados do cliente atual.
 * Cada propriedade é reativa, ou seja, qualquer alteração nas propriedades atualizará a interface automaticamente.
 */
let cliente = reactive({
    nome: '', // Nome do cliente
    cnpj: '', // CNPJ do cliente
    ativo: true, // Se o cliente está ativo (booleano)
    usar_api: false, // Se o cliente pode usar API (booleano)
    textoretirada: '' // Campo de texto associado ao cliente (não especificado)
});

/**
 * Lista de opções de perfil que pode ser selecionada para o cliente.
 * As opções são 'Master', 'Operador', e 'Avulso' com valores associados.
 */
const perfilOptions = [
    { label: 'Master', value: 1 }, // Perfil Master
    { label: 'Operador', value: 3 }, // Perfil Operador
    { label: 'Avulso', value: 4 } // Perfil Avulso
];

/**
 * Função chamada quando uma linha de cliente é selecionada na tabela.
 * Preenche o objeto `cliente` com os dados da linha selecionada e faz outras configurações de visibilidade e menus.
 * 
 * @param {Object} event - O evento de seleção da linha, contendo os dados do cliente selecionado.
 */
const onRowSelect = (event) => {
    cliente = reactive({ ...event.data }); // Preenche o objeto `cliente` com os dados da linha selecionada
    active.value = 1; // Altera o índice ativo para 1 (indicando que o cliente está sendo editado)
    visible.value = true; // Torna o formulário visível para edição
    structuredMenus.value = cliente.menus || []; // Carrega a estrutura de menus (caso exista)
    console.log('Menus Estruturados:', structuredMenus.value); // Exibe os menus estruturados no console
};

/**
 * Função responsável por resetar o formulário de cliente.
 * Limpa todos os dados do formulário, incluindo o campo `structuredMenus`.
 */
const resetForm = () => {
    cliente = reactive({
        nome: '', // Reseta nome do cliente
        cnpj: '', // Reseta CNPJ do cliente
        ativo: true, // Reseta o status de ativo
        usar_api: false, // Reseta a permissão de uso de API
        textoretirada: '' // Reseta o campo adicional de texto
    });
    structuredMenus.value = []; // Limpa a estrutura de menus associada ao cliente
};

/**
 * Função chamada ao submeter o formulário.
 * Dependendo da visibilidade do formulário, ele pode ser para adicionar ou atualizar um cliente.
 */
const submitForm = () => {
    if (visible.value) {
        // Se o formulário estiver visível, indica que é uma atualização de cliente
        atualizarCliente();
    } else {
        // Caso contrário, trata-se da adição de um novo cliente
        adicionarCliente();
    }
};

/**
 * Função assíncrona para adicionar um novo cliente.
 * Chama o serviço `clientesService.adicionarCliente` para salvar os dados no servidor.
 * 
 * @async
 */
const adicionarCliente = async () => {
    try {
        await clientesService.adicionarCliente(cliente); // Chama o serviço para adicionar o cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente adicionado' }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
        resetClienteForm(cliente); // Limpa o formulário após adicionar o cliente
        active.value = 0; // Reseta o índice ativo para 0 (volta para a visão geral)
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar cliente' });
    }
};

/**
 * Função assíncrona para atualizar os dados de um cliente existente.
 * Chama o serviço `clientesService.atualizarCliente` para salvar as alterações no servidor.
 * 
 * @async
 */
const atualizarCliente = async () => {
    try {
        await clientesService.atualizarCliente(cliente); // Chama o serviço para atualizar o cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado' }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
        resetClienteForm(cliente); // Limpa o formulário após atualizar os dados
        active.value = 0; // Reseta o índice ativo para 0
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar cliente' });
    }
};

/**
 * Função chamada para iniciar o processo de exclusão de um cliente.
 * Exibe um diálogo de confirmação antes de excluir o cliente.
 * 
 * @param {Object} itm - O cliente selecionado para exclusão.
 */
const deleteClientedes = (itm) => {
    item.value = itm; // Armazena o cliente selecionado para exclusão
    deleteClienteDialog.value = true; // Exibe o diálogo de confirmação de exclusão
};

/**
 * Função assíncrona para deletar um cliente do sistema.
 * Chama o serviço `clientesService.deletarCliente` para remover o cliente do banco de dados.
 * 
 * @param {string} clienteId - O ID do cliente a ser deletado.
 * @async
 */
const deleteCliente = async (clienteId) => {
    try {
        await clientesService.deletarCliente(clienteId); // Chama o serviço para deletar o cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado' }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao deletar cliente' });
    }
};

/**
 * Função assíncrona para carregar a lista de clientes.
 * Chama o serviço `clientesService.listarClientes` para obter os dados dos clientes.
 * 
 * @async
 */
const loadClientes = async () => {
    loading.value = true; // Ativa o indicador de carregamento
    try {
        ListaClientes.value = await clientesService.listarClientes(); // Carrega os dados dos clientes
    } catch (error) {
        // Em caso de erro, exibe a mensagem no console
        console.error(error.message);
    } finally {
        // Desativa o indicador de carregamento após a tentativa de carregamento
        loading.value = false;
    }
};

/**
 * Objeto reativo para armazenar os erros de validação do formulário.
 * Neste caso, está sendo validado o campo CNPJ.
 */
const errors = reactive({
    cnpj: '' // Erro relacionado ao CNPJ, se houver
});

/**
 * Função para validar o campo CNPJ.
 * Se o CNPJ for inválido, a mensagem de erro é atualizada.
 */
const validateCNPJField = () => {
    errors.cnpj = validarCNPJ(cliente.cnpj) ? '' : 'CNPJ inválido'; // Se o CNPJ for inválido, exibe a mensagem de erro
};

/**
 * `watch` do Vue: observa mudanças na variável `active`.
 * Quando `active` muda para 0, reseta o formulário e recarrega a lista de clientes.
 * 
 * @param {number} newIndex - Novo valor de `active` após a mudança.
 * @param {number} oldIndex - Valor antigo de `active`.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetClienteForm(cliente); // Reseta o formulário
        loadClientes(); // Recarrega a lista de clientes
        visible.value = false; // Esconde o formulário
    }
});

/**
 * `onMounted` do Vue: Executa quando o componente é montado.
 * Carrega a lista de clientes ao montar a página.
 */
onMounted(() => {
    loadClientes(); // Chama a função para carregar os clientes assim que o componente for montado
});

</script>

<template>
    <!-- Card Principal -->
    <div class="card">
        <!-- TabView que gerencia as abas de Listar Clientes e Editar/Adicionar Cliente -->
        <TabView v-model:activeIndex="active" v-if="!show">
            <!-- Aba de Listar Clientes -->
            <TabPanel header="Listar Clientes">
                <div class="col-12">
                    <!-- DataTable que exibe a lista de clientes -->
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaClientes"
                        selectionMode="single"
                        tableStyle="min-width: 50rem; table-layout: fixed;"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        stripedRows
                        paginator
                        :rows="10"
                        dataKey="id"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        :globalFilterFields="['id_cliente', 'nome', 'last_login']"
                        :sortOrder="1"
                        :sortField="'id_cliente'"
                        >
                        <!-- Filtragem global na tabela -->
                        <!-- Dados da tabela (lista de clientes) -->
                        <!-- Permite selecionar apenas um item -->
                        <!-- Estilo da tabela -->
                        <!-- Opções de quantidade de itens por página -->
                        <!-- Linhas alternadas para melhorar a legibilidade -->
                        <!-- Habilita paginação -->
                        <!-- Quantidade de linhas por página -->
                        <!-- Chave única para cada cliente (usado na seleção) -->
                        <!-- Desabilita a seleção usando a tecla Meta (como Ctrl) -->
                        <!-- Ação chamada ao selecionar uma linha -->
                        <!-- Campos para pesquisa global -->
                        <!-- Ordem de ordenação inicial -->
                        <!-- Campo inicial para ordenação -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <!--Caixa de pesquisa para busca global -->
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                        <!--Ícone de pesquisa -->
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    <!-- Campo de busca -->
                                </IconField>
                            </div>
                        </template>
                        <!--Definição das colunas da tabela -->
                        <Column field="id_cliente" sortable style="width: 7%" header="ID"></Column>
                        <Column field="nome" sortable style="width: 20%" header="Nome"></Column>
                        <!--Coluna que mostra se o cliente está ativo, com ícones de status -->
                        <Column field="ativo" sortable style="width: 10%; text-align: center" header="Ativo">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                            </template>
                        </Column>
                        <!--oluna que mostra o último login do cliente formatado -->
                        <Column field="last_login" sortable class="table-cell" style="width: 15%" header="Último Login">
                            <template #body="{ data }">
                                {{ formatDate(new Date(data.last_login)) }}
                                <!-- Formata e exibe a data -->
                            </template>
                        </Column>
                        <!--Coluna com botão de exclusão -->
                        <Column style="width: 10%">
                            <template #body="slotProps">
                                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteClientedes(slotProps.data)" />
                                <!--Botão de excluir -->
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!--Aba de Adicionar ou Editar Cliente -->
            <TabPanel :header="visible ? 'Editar Cliente' : 'Adicionar Cliente'">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <!--Formulário para adicionar ou editar um cliente -->
                            <form @submit.prevent="submitForm">
                                <div class="mt-5 mx-0 p-fluid grid">
                                    <!--Campo para o nome do cliente -->
                                    <div class="full mt-5 lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">Nome:</label>
                                        <InputText class="my-2" id="id_planta" v-model="cliente.nome" required />
                                    </div>
                                    <!--Campo para o CNPJ do cliente -->
                                    <div :class="visible ? { 'lg:col-9 md:col-9 sm:col-12': true } : { 'lg:col-12 md:col-12 sm:col-12': true }">
                                        <label for="cnpj">CNPJ:</label>
                                        <InputMask class="my-2" v-model="cliente.cnpj" id="cnpj" mask="99.999.999/9999-99" :unmask="true" :invalid="!!errors.cnpj" @blur="validateCNPJField" />
                                        <small v-if="errors.cnpj" class="p-error">{{ errors.cnpj }}</small>
                                        <!--Exibe mensagem de erro se houver -->
                                    </div>
                                    <!--campo para selecionar o perfil, aparece apenas se visible for verdadeiro -->
                                    <div :class="visible ? 'lg:col-3 md:col-3 sm:col-12 ' : ''">
                                        <label v-if="visible">Selecione o perfil</label>
                                        <Dropdown v-if="visible" class="my-2" v-model="selectedPerfil" :options="perfilOptions" optionLabel="label" optionValue="value" placeholder="Selecione um Perfil" />
                                    </div>
                                    <!--Campo para ativar ou desativar a integração via API-->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch1">Tem integração?</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.usar_api" inputId="switch1" />
                                            <!-- Comutador para a integração -->
                                            <span class="ml-2">{{ cliente.usar_api ? 'Sim' : 'Não' }}</span>
                                        </div>
                                    </div>
                                    <!--campo para ativar ou desativar o status de cliente ativo -->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch2">Cliente Ativo?</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.ativo" inputId="switch2" />
                                            <!--Comutador para o status ativo -->
                                            <span class="ml-2">{{ cliente.ativo ? 'Sim' : 'Não' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <!--seção adicional para configurar menus  -->
                            <div class="mt-6" v-if="visible">
                                <!-- Seção de Seleção de Menu -->
                                <MenuSelector class="mx-auto" v-if="selectedPerfil" :selectedPerfil="selectedPerfil" :initialMenus="structuredMenus.value" :id_cliente="cliente.id_cliente" />
                            </div>
                        </div>
                        <!--botões para salvar ou voltar -->
                        <div class="mr-1 my-7 grid justify-content-end">
                            <Button v-if="visible" style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" label="Atualizar" icon="pi pi-check" severity="primary" @click="atualizarCliente" />
                            <Button style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" label="Voltar" icon="pi pi-arrow-left" severity="primary" @click="active = 0" />
                            <Button v-if="!visible" style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarCliente" />
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <!--caixa de diálogo de confirmação para deletar cliente -->
        <Dialog header="Deletar Cliente" v-model:visible="deleteClienteDialog" style="width: 400px" :modal="true" :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class=""
                    >Você tem certeza que deseja deletar o Cliente <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b> ?</span
                >
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" @click="deleteClienteDialog = false" class="p-button-text" />
                <!-- Botão para cancelar -->
                <Button label="Sim" icon="pi pi-check" @click="deleteCliente(item)" class="p-button-text" />
                <!-- Botão para confirmar a exclusão -->
            </template>
        </Dialog>

        <!-- Componente de carregamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>
