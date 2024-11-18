<script setup>
//Importando as funções do Vue.js, além de outras dependências
import { reactive, ref, onMounted, watch } from 'vue'; //reactive e ref são usados para reatividade, onMounted é um hook(função especial) para executar código ao montar o componente, watch observa mudanças em valores reativos
import { useToast } from 'primevue/usetoast'; //Função para mostrar notificações
import { useAuthStore } from '@/store/authStore.js'; //Usando a store de autenticação para pegar dados do usuário autenticado
import axios from '@/axios.js'; //Instância configurada do Axios para fazer requisições HTTP
import { FilterMatchMode } from 'primevue/api'; //modos de filtro (como CONTAINS, EQUALS, etc)
import LoadingSpinner from '@/components/LoadingSpinner.vue'; //carregamento (spinner)
import MenuSelector from '@/components/MenuSelector.vue'; //seleciona menus
import { useDataStore } from '@/store/dataStore.js';//importa dados

const active = ref(0); //Controle do índice ativo 
const show = ref(false); //Controla a exibição de algum componente
const store = useAuthStore(); //Usando a store de autenticação para acessar dados do usuário
const toast = useToast(); //Função que exibe as notificações
const loading = ref(false); //Flag de carregamento enquanto os dados estão sendo processados
const ListaClientes = ref([]); //lista de clientes, inicialmente vazia
const visible = ref(false); //controla a visibilidade de um formulário ou componente
const deleteClienteDialog = ref(false); //controla a exibição do diálogo de exclusão de cliente
const item = ref({}); //Objeto que armazena o cliente selecionado para exclusão
const selectedPerfil = ref(null); //Salva o perfil selecionado para o cliente
const structuredMenus = ref([]); //Estrutura dos menus hierárquicos selecionados para o cliente
const dataStore = useDataStore();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } //Filtro global para pesquisa, que usa o modo "contains", ou seja, que contenha o valor
});

let cliente = reactive({ //variáveis que podem ser reatribuídas
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
};

const submitForm = () => {
    if (visible.value) { //Se o formulário estiver visível, é uma atualização.
        atualizarCliente();
    } else { //se não, é um novo cliente.
        adicionarCliente();
    }
};

const adicionarCliente = async () => {
    const data = {
        ...cliente, //dados do cliente
        id_usuario: store.userId //captura o ID do usuário logado
    };
    loading.value = true; //tiva o carregamento enquanto a requisição está sendo feita
    try {
        await axios.post('/admin/cliente/adicionar', data); //Faz uma requisição POST para adicionar o cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente adicionado com sucesso!', life: 3000 }); //Exibe uma notificação de sucesso
        loadCliente(); //Carrega a lista de clientes
        active.value = 0; //Reseta o índice ativo
        resetForm(); //Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar cliente.', life: 3000 }); //Exibe uma notificação de erro
        console.error('Erro ao adicionar cliente:', error); //Log de erro
    } finally {
        loading.value = false; //desativa o carregamento
    }
};

const atualizarCliente = async () => {
    const data = {
        id_usuario: store.userId, //ID do usuário logado
        id_cliente: cliente.id_cliente, //ID do cliente a ser atualizado
        ...cliente //dados do cliente a serem atualizados
    };
    loading.value = true;
    try {
        await axios.post('/admin/cliente/atualizar', data); //Requisição para atualizar os dados
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado com sucesso!', life: 3000 });
        loadCliente(); //Recarrega a lista de clientes
        active.value = 0; //Reseta o índice ativo
        resetForm(); //Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar cliente.', life: 3000 });
        console.error('Erro ao atualizar cliente:', error);
    } finally {
        loading.value = false; //Desativa o carregamento
    }
};

const deleteClientedes = (itm) => {
    item.value = itm; //armazena o cliente selecionado
    deleteClienteDialog.value = true; //exibe o diálogo de exclusão
};

const deleteCliente = async (item) => {
    loading.value = true; //Ativa o carregamento
    let data = { id_cliente: item.id_cliente, id_usuario: store.userId }; //Dados necessários para a exclusão
    try {
        await axios.post('/admin/cliente/deletar', data); //Requisição para deletar o cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado com sucesso.', life: 3000 });
        deleteClienteDialog.value = false; //Fecha o diálogo de exclusão
        loadCliente(); //Recarrega a lista de clientes
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar cliente.', life: 3000 });
    } finally {
        loading.value = false; //Desativa o carregamento
    }
};

// Função atualizada para enviar a estrutura hierárquica de menus
const submitMenu = async () => {
    const simpleStructuredMenus = JSON.parse(JSON.stringify(structuredMenus.value.value)); //cria uma cópia simples da estrutura de menus
    console.log('Structured Menus Before Submission:', simpleStructuredMenus); //Log para depuração
    console.log('Structured Menus:', structuredMenus.value); //Log para depuração
    const data = {
        id_cliente: cliente.id_cliente, //ID do cliente
        perfil: selectedPerfil.value, //Perfil selecionado
        menus: simpleStructuredMenus //menus estruturados a serem enviados
    };

    loading.value = true; //Ativa o carregamento
    try {
        await axios.post('/admin/cliente/salvarMenus', data); //equisição para salvar os menus do cliente
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações de menu salvas com sucesso.', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações de menu.', life: 3000 });
        console.error('Erro ao salvar menus:', error);
    } finally {
        loading.value = false; //Desativa o carregamento
    }
};

//função responsável por carregar a lista de clientes do servidor
const loadCliente = async () => {
    loading.value = true; //Marca o início do carregamento de dados, alterando a variável `loading` para true

    try {
        //az uma requisição POST para a API, que retorna a lista de clientes com seus menus
        const response = await axios.post('/admin/cliente/listarComMenu');
        
        //atribui os dados retornados pela requisição à lista de clientes
        ListaClientes.value = response.data;
    } catch (error) {
        // Caso ocorra um erro na requisição, exibe no console o erro
        console.error('Erro ao listar clientes:', error);
    } finally {
        // depois da execução, altera o estado de `loading` para false, indicando que o carregamento terminou
        loading.value = false;
    }
};

//função responsável por limpar o formulário e reiniciar seus valores
const resetForm = () => {
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

const errors = reactive({
    cnpj: ''
});

const validateCNPJField = () => {
    //Obtém o valor do CNPJ inserido no formulário armazenado no objeto cliente
    const cnpj = cliente.cnpj; 

    //Verifica se o CNPJ está vazio ou se é inválido utilizando a função validarCNPJ
    //Se o CNPJ não for válido (ou estiver vazio), define uma mensagem de erro no objeto errors
    if (!cnpj || !validarCNPJ(cnpj)) {
        //atribui a mensagem de erro "CNPJ inválido" à propriedade cnpj do objeto errors
        errors.cnpj = 'CNPJ inválido';
    } else {
        // Se o CNPJ for válido, limpa a mensagem de erro associada ao campo cnpj
        errors.cnpj = '';
    }
}

function validarCNPJ(cnpj) {
    //remove qualquer caractere não numérico do CNPJ 
    cnpj = cnpj.replace(/[^\d]+/g, '');

    //verifica se o CNPJ tem 14 dígitos
    if (cnpj === '' || cnpj.length !== 14) return false;

    // Lista de CNPJs inválidos
    const cnpjsInvalidos = [
        "00000000000000", "11111111111111", "22222222222222",
        "33333333333333", "44444444444444", "55555555555555",
        "66666666666666", "77777777777777", "88888888888888",
        "99999999999999"
    ];

    // Se o CNPJ for uma dessas sequências, considera inválido
    if (cnpjsInvalidos.includes(cnpj)) return false;

    // Realiza o cálculo dos dois dígitos verificadores do CNPJ
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho); //parte dos números do CNPJ
    let digitos = cnpj.substring(tamanho); // digitos verificadores
    let soma = 0;
    let pos = tamanho - 7;

    //Cálculo do primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--; 
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11; //Calcula o dígito verificador
    if (resultado != digitos.charAt(0)) return false; //Verifica se o dígito calculado é igual ao fornecido

    // Cálculo do segundo dígito verificador (igual ao primeiro, mas com um número maior de casas)
    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false; //Verifica o segundo dígito verificador

    return true; //rtorna `true` se os dois dígitos verificadores forem válidos
}

// Função responsável por formatar a data de forma legível
const formatDate = (value) => {
    // Se o valor da data for vazio ou nulo, retorna uma string vazia
    if (!value) {
        return '';
    }

    try {
        const date = new Date(value); // Converte o valor para um objeto `Date`

        // Verifica se a data é válida
        if (isNaN(date)) {
            throw new Error('Data inválida');
        }

        // Ajusta a data para o fuso horário local
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        // Formata a data em formato DD/MM/YYYY HH:mm
        const day = String(localDate.getDate()).padStart(2, '0'); // Dia com dois dígitos dd
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Mês com dois dígitos MM
        const year = localDate.getFullYear(); // Ano com 4 dígitos yyyy
        const hours = String(localDate.getHours()).padStart(2, '0'); // Hora com dois dígitos HH
        const minutes = String(localDate.getMinutes()).padStart(2, '0'); // Minutos com dois dígitos mm

        //Retorna a data formatada.
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        // se ocorrer um erro ao tentar formatar a data, retorna 'Data inválida'.
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};

//Função de watcher para monitorar mudanças no valor de active
//Quando active muda para 0, reseta o formulário e recarrega a lista de clientes
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm(); //Chama a função para resetar o formulário
        loadCliente(); // Chama a função para recarregar a lista de clientes
        visible.value = false; // Esconde o formulário ou outro conteúdo dependendo do valor de visible
    }
});

//onMounted do Vue, executado quando o componente é montado
//carrega a lista de clientes ao carregar a página
onMounted(() => {
    loadCliente(); //Chama a função para carregar os clientes quando o componente for montado
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
                                        <i class="pi pi-search" /> <!--Ícone de pesquisa -->
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" /> <!-- Campo de busca -->
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
                                {{ formatDate(new Date(data.last_login)) }} <!-- Formata e exibe a data -->
                            </template>
                        </Column>
                        <!--Coluna com botão de exclusão -->
                        <Column style="width: 10%">
                            <template #body="slotProps">
                                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteClientedes(slotProps.data)" /> <!--Botão de excluir -->
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
                                        <small v-if="errors.cnpj" class="p-error">{{ errors.cnpj }}</small> <!--Exibe mensagem de erro se houver -->
                                    </div>
                                    <!--campo para selecionar o perfil, aparece apenas se visible for verdadeiro -->
                                    <div :class="visible ? 'lg:col-3 md:col-3 sm:col-12 ' : ''">
                                        <label v-if="visible">Selecione o perfil</label>
                                        <Dropdown v-if="visible" style="width: 232px" class="my-2" v-model="selectedPerfil" :options="perfilOptions" optionLabel="label" optionValue="value" placeholder="Selecione um Perfil" />
                                    </div>

                                    <!--Campo para ativar ou desativar a integração via API-->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch1">Tem integração?</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.usar_api" inputId="switch1" /> <!-- Comutador para a integração -->
                                            <span class="ml-2">{{ cliente.usar_api ? 'Sim' : 'Não' }}</span>
                                        </div>
                                    </div>
                                    <!--campo para ativar ou desativar o status de cliente ativo -->
                                    <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                        <label class="mt-0 text-nowrap" for="switch2">Cliente Ativo?</label>
                                        <div class="grid mt-3">
                                            <InputSwitch class="mr-2" v-model="cliente.ativo" inputId="switch2" /> <!--Comutador para o status ativo -->
                                            <span class="ml-2">{{ cliente.ativo ? 'Sim' : 'Não' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <!--seção adicional para configurar menus  -->
                            <div class="mt-6" v-if="visible">
                                <MenuSelector class="mx-auto" v-if="selectedPerfil" :selectedPerfil="selectedPerfil" :initialMenus="structuredMenus.value" @update:structuredMenus="structuredMenus.value = $event" />
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
                <span class="">Você tem certeza que deseja deletar o Cliente <b>{{ item.id_cliente }}</b> - <b>{{ item.nome }}</b> ?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" @click="deleteClienteDialog = false" class="p-button-text" /> <!-- Botão para cancelar -->
                <Button label="Sim" icon="pi pi-check" @click="deleteCliente(item)" class="p-button-text" /> <!-- Botão para confirmar a exclusão -->
            </template>
        </Dialog>

        <!-- Componente de carregamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>