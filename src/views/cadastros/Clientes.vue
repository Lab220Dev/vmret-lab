<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'; // Funções reativas e hooks do Vue.js
import { useToast } from 'primevue/usetoast'; // Função para mostrar notificações
import { FilterMatchMode } from 'primevue/api'; // Modo de filtro para tabelas, como CONTAINS ou EQUALS
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Spinner de carregamento
import MenuSelector from '@/components/MenuSelector.vue'; // Seleção de menus hierárquicos
import clientesService from '@/services/clientesService'; // Serviço para manipulação de dados de clientes
import { isValidDoc } from '@/helpers/HelperValidacao.js'; // Função para validar CNPJ
import { resetClienteForm } from '@/helpers/formHelper'; // Função para resetar o formulário de cliente
import { formatDate,prepareListData } from '@/helpers/HelperUtils.js'; // Função para formatação de datas (não utilizada diretamente)
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
const progressValue = ref(0); 
const item = ref({}); // Armazena o cliente selecionado para exclusão
const selectedPerfil = ref(null); // Armazena o perfil selecionado para o cliente
const structuredMenus = ref([]); // Estrutura de menus hierárquicos selecionados para o cliente
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que procura valores que contenham o texto fornecido
});
const filteredCount = ref(0);
const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'id_cliente', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
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
const perfilOptions  = computed(() => [
    { label: t('master'), value: 1 }, // Perfil Master
    { label: t('operator'), value: 3 }, // Perfil Operador
    { label: t('one_time'), value: 4 } // Perfil Avulso
]);
function debounce(func, wait = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
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

const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    loadClientes(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    loadClientes(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    loadClientes(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
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
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('client_add_sucess'), life: 3000  }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
        resetClienteForm(cliente); // Limpa o formulário após adicionar o cliente
        active.value = 0; // Reseta o índice ativo para 0 (volta para a visão geral)
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary:t('title_error'), detail: t('client_add_fail'), life: 3000  });
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
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('client_update_sucess'), life: 3000  }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
        resetClienteForm(cliente); // Limpa o formulário após atualizar os dados
        active.value = 0; // Reseta o índice ativo para 0
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary:  t('title_sucess'), detail: t('client_update_fail'), life: 3000  });
    }
};


const deleteClientedes = (itm) => {
    item.value = itm; // Armazena o cliente selecionado para exclusão
    deleteClienteDialog.value = true; // Exibe o diálogo de confirmação de exclusão
};

const deleteCliente = async (clienteId) => {
    progressValue.value = 0; // Reseta a barra de progresso
    let eventSource = null; 

    try {
        // 🔹 Enviar a requisição para iniciar a exclusão
        //await clientesService.deletarCliente(clienteId); 

        // 🔹 Agora iniciar a escuta do progresso
        eventSource = new EventSource(`/admin/cliente/deletar`,{id_cliente: clienteId});
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            progressValue.value = data[clienteId] || 0; // Atualiza progresso
            console.log('Progresso:', progressValue.value); // Exibe o progresso no console
        };

        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado com progresso', life: 3000 });
        loadClientes();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao deletar cliente', life: 3000 });
    } finally {
        if (eventSource) eventSource.close(); // Fecha a conexão SSE
        deleteClienteDialog.value = false;
    }
};

const deleteClienteWithProgress = async (clienteId) => {
    try {
        await clientesService.deletarCliente(clienteId); // Chama o serviço para deletar o cliente
        toast.add({ severity: 'success', summary:  t('title_sucess'), detail: t('client_delete_sucess'), life: 3000  }); // Exibe uma mensagem de sucesso
        loadClientes(); // Recarrega a lista de clientes
    } catch {
        // Caso ocorra um erro, exibe uma mensagem de erro
        toast.add({ severity: 'error', summary:  t('title_sucess'), life:3000,detail: t('client_delete_fail'), life: 3000  });
    }finally{
        deleteClienteDialog.value = false; // Fecha o diálogo de confirmação de exclusão
    }
};
/**
 * Função assíncrona para carregar a lista de clientes.
 * Chama o serviço `clientesService.listarClientes` para obter os dados dos clientes.
 *
 * @async
 */
const loadClientes = async (page = 1) => {
    loading.value = true; // Ativa o indicador de carregamento
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };
        const data = prepareListData(params);
        const result = await clientesService.listarClientesPaginado(data); // Carrega os dados dos clientes
        ListaClientes.value = result.clientesComMenu;
        filteredCount.value = result.totalRecords;
    } catch (error) {
        // Em caso de erro, exibe a mensagem no console
        console.error(error.message);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('load_initial_data'), life: 3000 }); // Notificação de erro.

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
const debouncedFilterChange = debounce(() => {
    onFilterChange();
}, 300);
/**
 * Função para validar o campo CNPJ.
 * Se o CNPJ for inválido, a mensagem de erro é atualizada.
 */
const validateCNPJField = () => {
    errors.cnpj = isValidDoc(cliente.cnpj) ? '' : t('error_invalid_cnpj'); // Se o CNPJ for inválido, exibe a mensagem de erro
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
            <TabPanel  :header="$t('client_list')">
                <div class="col-12">
                    <!-- DataTable que exibe a lista de clientes -->
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaClientes"
                        selectionMode="single"
                        tableStyle="min-width: 50rem; table-layout: fixed;"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :totalRecords="filteredCount"
                        stripedRows
                        paginator
                        lazy
                        :rows="lazyParams.value?.rows || 10"
                        dataKey="id"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        @filter="onFilterChange($event)"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                        :globalFilterFields="['id_cliente', 'nome', 'last_login']"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        :sortField="lazyParams.value?.sortField || 'id_cliente'"
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
                                    <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search"  @input="debouncedFilterChange"/>
                                    <!-- Campo de busca -->
                                </IconField>
                            </div>
                        </template>
                        <!--Definição das colunas da tabela -->
                        <Column field="id_cliente" sortable style="width: 7%" header="ID"></Column>
                        <Column field="nome" sortable style="width: 20%" :header="t('name')"></Column>
                        <!--Coluna que mostra se o cliente está ativo, com ícones de status -->
                        <Column field="ativo" sortable style="width: 10%; text-align: center" :header="t('active')">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.ativo, 'pi-times-circle text-red-500': !data.ativo }"></i>
                            </template>
                        </Column>
                        <!--oluna que mostra o último login do cliente formatado -->
                        <Column field="last_login" sortable class="table-cell" style="width: 15%" :header="t('last_login')">
                            <template #body="{ data }">
                                {{ formatDate(new Date(data.last_login)) }}
                                <!-- Formata e exibe a data -->
                            </template>
                        </Column>
                        <!--Coluna com botão de exclusão -->
                        <Column style="width: 10%">
                            <template #body="slotProps">
                                <!--Botão de excluir -->
                                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteClientedes(slotProps.data)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!--Aba de Adicionar ou Editar Cliente -->
            <TabPanel :header="visible ? t('edit_client') : t('add_client')">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <!--Formulário para adicionar ou editar um cliente -->
                            <form @submit.prevent="submitForm">
                                <div class="mt-5 mx-0 p-fluid grid">
                                    <!--Campo para o nome do cliente -->
                                    <div class="full mt-5 lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">{{t('name')}}:</label>
                                        <InputText class="my-2" id="id_planta" v-model="cliente.nome" required />
                                    </div>
                                    <!--Campo para o CNPJ do cliente -->
                                    <div :class="visible ? { 'lg:col-9 md:col-9 sm:col-12': true } : { 'lg:col-12 md:col-12 sm:col-12': true }">
                                        <label for="cnpj">{{t('ein')}}:</label>
                                        <InputMask class="my-2" v-model="cliente.cnpj" id="cnpj" mask="99.999.999/9999-99" :unmask="true" :invalid="!!errors.cnpj" @blur="validateCNPJField" />
                                        <small v-if="errors.cnpj" class="p-error">{{ errors.cnpj }}</small>
                                        <!--Exibe mensagem de erro se houver -->
                                    </div>
                                    <!--campo para selecionar o perfil, aparece apenas se visible for verdadeiro -->
                                    <div :class="visible ? 'lg:col-3 md:col-3 sm:col-12 ' : ''">
                                        <label v-if="visible">{{t('select_profile')}}</label>
                                        <Dropdown v-if="visible" class="my-2" v-model="selectedPerfil" :options="perfilOptions" optionLabel="label" optionValue="value" :placeholder="$t('select_profile')" />
                                    </div>
                                    <!--Campo para ativar ou desativar a integração via API-->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch1">{{t('external_integration')}}</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.usar_api" inputId="switch1" />
                                            <!-- Comutador para a integração -->
                                            <span class="ml-2">{{ cliente.usar_api ?  $t('yes') : $t('no') }}</span>
                                        </div>
                                    </div>
                                    <!--campo para ativar ou desativar o status de cliente ativo -->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch2">{{t('active_client')}}</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.ativo" inputId="switch2" />
                                            <!--Comutador para o status ativo -->
                                            <span class="ml-2">{{ cliente.ativo ?  $t('yes') : $t('no')}}</span>
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
                            <Button v-if="visible" style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')"  icon="pi pi-check" severity="primary" @click="atualizarCliente" />
                            <Button style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('back')" icon="pi pi-arrow-left" severity="primary" @click="active = 0" />
                            <Button v-if="!visible" style="width: 25%; min-width: 100px" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarCliente" />
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>

        <!--caixa de diálogo de confirmação para deletar cliente -->
        <Dialog header="Deletar Cliente" v-model:visible="deleteClienteDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class=""
                    >Você tem certeza que deseja deletar o Cliente <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b> ?</span
                >
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" @click="deleteClienteDialog = false" class="p-button-text" />
                <!-- Botão para cancelar -->
                <Button label="Sim" icon="pi pi-check" @click="deleteCliente(item.id_cliente)" class="p-button-text" />
                <!-- Botão para confirmar a exclusão -->
            </template>
        </Dialog>
        <!-- ProgressBar para mostrar o progresso -->
        <ProgressBar v-if="progressValue > 0"  :value="progressValue" style="height: 20px" />

        
        <!-- Componente de carregamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>
