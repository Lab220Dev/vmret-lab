<script setup>
//Importando as funções do Vue.js, além de outras dependências
import { reactive, ref, onMounted, watch } from 'vue'; //reactive e ref são usados para reatividade, onMounted é um hook(função especial) para executar código ao montar o componente, watch observa mudanças em valores reativos
import { useToast } from 'primevue/usetoast'; //Função para mostrar notificações
import { FilterMatchMode } from 'primevue/api'; //modos de filtro (como CONTAINS, EQUALS, etc)
import LoadingSpinner from '@/components/LoadingSpinner.vue'; //carregamento (spinner)
import MenuSelector from '@/components/MenuSelector.vue'; //seleciona menus
import clientesService from '@/services/clientesService';
import { validarCNPJ } from '@/helpers/HelperValidacao.js';
import { resetClienteForm } from '@/helpers/formHelper';
import { formatDate } from '@/helpers/HelperUtils.js';

const active = ref(0); //Controle do índice ativo
const show = ref(false); //Controla a exibição de algum componente
const toast = useToast(); //Função que exibe as notificações
const loading = ref(false); //Flag de carregamento enquanto os dados estão sendo processados
const ListaClientes = ref([]); //lista de clientes, inicialmente vazia
const visible = ref(false); //controla a visibilidade de um formulário ou componente
const deleteClienteDialog = ref(false); //controla a exibição do diálogo de exclusão de cliente
const item = ref({}); //Objeto que armazena o cliente selecionado para exclusão
const selectedPerfil = ref(null); //Salva o perfil selecionado para o cliente
const structuredMenus = ref([]); //Estrutura dos menus hierárquicos selecionados para o cliente
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } //Filtro global para pesquisa, que usa o modo "contains", ou seja, que contenha o valor
});

let cliente = reactive({
    //variáveis que podem ser reatribuídas
    nome: '', // nome do cliente.
    cnpj: '', //CNPJ do cliente.
    ativo: true, //se o cliente está ativo.
    usar_api: false, //se o cliente pode usar API (booleano).
    textoretirada: '' //Algum campo de texto associado ao cliente (não especificado no código).
});

const perfilOptions = [
    { label: 'Master', value: 1 }, //perfil 'Master'
    { label: 'Operador', value: 3 }, //perfil 'Operador'
    { label: 'Avulso', value: 4 } //perfil 'Avulso'
];

const onRowSelect = (event) => {
    cliente = reactive({ ...event.data }); //preenche o objeto 'cliente' com os dados da linha selecionada no grid
    active.value = 1; //altera o índice ativo para a próxima etapa/página.
    visible.value = true; //Torna o formulário visível.
    structuredMenus.value = cliente.menus || []; //Carrega os menus estruturados, se existirem.
    console.log('Menus Estruturados:', structuredMenus.value);
};

const resetForm = () => {
    //função responsável por limpar o formulário e reiniciar seus valores
    //Reseta o objeto `cliente` para seus valores iniciais, utilizando `reactive` para tornar as mudanças reativas
    cliente = reactive({
        nome: '', //Nome do cliente, inicializado como uma string vazia
        cnpj: '', // CNPJ do cliente, inicializado como uma string vazia
        ativo: true, // Estado de ativação do cliente, inicializado como `true` (ativo)
        usar_api: false, // Se o cliente pode ou não usar API, inicializado como `false`
        textoretirada: '' // Campo de texto adicional relacionado ao cliente, inicializado como uma string vazia
    });
    // Limpa a estrutura de menus associada ao cliente
    structuredMenus.value = [];
};

const submitForm = () => {
    if (visible.value) {
        //Se o formulário estiver visível, é uma atualização.
        atualizarCliente();
    } else {
        //se não, é um novo cliente.
        adicionarCliente();
    }
};

const adicionarCliente = async () => {
    try {
        await clientesService.adicionarCliente(cliente);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente adicionado' });
        loadClientes();
        resetClienteForm(cliente);
        active.value = 0;
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar cliente' });
    }
};

const atualizarCliente = async () => {
    try {
        await clientesService.atualizarCliente(cliente);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado' });
        loadClientes();
        resetClienteForm(cliente);
        active.value = 0;
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar cliente' });
    }
};

const deleteClientedes = (itm) => {
    item.value = itm; //armazena o cliente selecionado
    deleteClienteDialog.value = true; //exibe o diálogo de exclusão
};

const deleteCliente = async (clienteId) => {
    try {
        await clientesService.deletarCliente(clienteId);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado' });
        loadClientes();
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao deletar cliente' });
    }
};

const loadClientes = async () => {
    loading.value = true;
    try {
        ListaClientes.value = await clientesService.listarClientes();
    } catch (error) {
        console.error(error.message);
    } finally {
        loading.value = false;
    }
};

const errors = reactive({
    //Responsável por armazenar os erros de cnpj
    cnpj: ''
});

const validateCNPJField = () => {
    errors.cnpj = validarCNPJ(cliente.cnpj) ? '' : 'CNPJ inválido';
};

//Função de watcher para monitorar mudanças no valor de active
//Quando active muda para 0, reseta o formulário e recarrega a lista de clientes
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetClienteForm(cliente); //Chama a função para resetar o formulário
        loadClientes(); // Chama a função para recarregar a lista de clientes
        visible.value = false; // Esconde o formulário ou outro conteúdo dependendo do valor de visible
    }
});

//onMounted do Vue, executado quando o componente é montado
//carrega a lista de clientes ao carregar a página
onMounted(() => {
    loadClientes(); //Chama a função para carregar os clientes quando o componente for montado
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
                        ><!-- Filtragem global na tabela -->
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
                        <div class="card">
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
