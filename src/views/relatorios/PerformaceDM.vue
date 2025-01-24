<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para selecionar datas
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de filtro global da PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa a funcionalidade de toast da PrimeVue
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS do VueDatePicker
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'; // Importa hooks do Vue.js
import axios from '@/axios.js'; // Importa a instância axios configurada para requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store para autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente LoadingSpinner para mostrar o carregamento

// Declarações de variáveis reativas
const showDialog = ref(false); // Controla a visibilidade do diálogo de mensagem de erro
const dialogMessage = ref(''); // Armazena a mensagem a ser exibida no diálogo

// Acesso ao store de autenticação
const store = useAuthStore(); // Acessa o store de autenticação para pegar o usuário e o token
const toast = useToast(); // Inicializa o toast para exibição de mensagens rápidas

// Mensagens
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem exibida quando não há resultados
const todosOption = { label: 'Todos', value: null }; // Opção "Todos" para dropdowns

// Dados dos dropdowns
const ListaFuncionarios = ref(null); // Lista de funcionários
const dms = ref([todosOption]); // Lista de DMs
const plantas = ref([todosOption]); // Lista de plantas
const setor = ref([todosOption]); // Lista de setores
const centroCusto = ref([todosOption]); // Lista de centros de custo

// Filtros de busca
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para a busca
});

const show = ref(false); // Controla a exibição do painel de detalhes
const selectedItem = ref([]); // Armazena o item selecionado na tabela

const loading = ref(false); // Controla o estado de carregamento
const relatorio = ref({
    dm: '', // DM selecionado
    id_planta: '', // Planta selecionada
    id_centro_custo: '', // Centro de custo selecionado
    id_setor: '', // Setor selecionado
    id_funcionario: '', // Funcionário selecionado
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data de início (primeiro dia do mês atual)
    data_final: new Date() // Data final (data atual)
});

/**
 * Função para formatar uma data no formato dd/MM/yyyy.
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada no padrão "dd/MM/yyyy"
 */
const format = (date) => {
    const day = date.getDate(); // Pega o dia
    const month = date.getMonth() + 1; // Pega o mês (ajustando porque o índice começa em 0)
    const year = date.getFullYear(); // Pega o ano

    return `${day}/${month}/${year}`; // Retorna a data formatada como string
};

// Função para converter uma data para formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Converte para ISO se a data for válida
};

// Função de busca dos dados
const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente (obtido do store)
        id_dm: relatorio.value.dm === null ? undefined : relatorio.value.dm, // ID da DM, se não for 'Todos', define o valor
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta, // ID da planta, se não for 'Todos', define o valor
        id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo, // ID do centro de custo, se não for 'Todos', define o valor
        id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor, // ID do setor, se não for 'Todos', define o valor
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // ID do funcionário, se não for 'Todos', define o valor
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início formatada
        data_final: toISODate(relatorio.value.data_final) // Data final formatada
    };

    try {
        loading.value = true; // Ativa o estado de carregamento
        const response = await axios.post('relatorioItems/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });

        retiradas.value = response.data; // Armazena os dados recebidos
        // Se a busca retornar sem resultados
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.'; // Mensagem indicando que não há dados
        } else {
            emptyMessage.value = ''; // Limpa a mensagem se houver dados
        }

        // Se não houver dados, exibe um diálogo de erro
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.'; // Mensagem de erro
            showDialog.value = true; // Exibe o diálogo de erro
        }
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error); // Exibe o erro no console se ocorrer
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

// Função chamada ao selecionar uma linha na tabela
const onRowSelect = (event) => {
    show.value = true; // Exibe os detalhes do item
    selectedItem.value = event.data.Detalhes; // Armazena os detalhes do item selecionado

    // Scrolar a tela para o grid de detalhes ao selecionar algum item
    nextTick(() => {
        const detailsCard = document.querySelector('.details-card'); // Seleciona o cartão de detalhes
        if (detailsCard) {
            detailsCard.scrollIntoView({ behavior: 'smooth' }); // Rola até o cartão suavemente
        }
    });
};

// Função para voltar para a tabela principal de dados
const voltar = () => {
    show.value = false; // Oculta os detalhes
    selectedItem.value = {}; // Limpa os detalhes do item
};

// Referência à tabela
const dt = ref(null);

// Função para gerar CSV a partir dos dados
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Cria o cabeçalho a partir das chaves do primeiro item
    const rows = data.map((row) => Object.values(row).join(',')).join('\n'); // Converte os dados em linhas CSV
    return `${headers}\n${rows}`; // Retorna o conteúdo CSV
};

// Função para exportar os dados em formato CSV
const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {
        // Se retiradas.value for um array, agregue detalhes de cada produto
        const detalhesAgregados = retiradas.value.flatMap((produto) => {
            if (Array.isArray(produto.Detalhes)) {
                return produto.Detalhes; // Se detalhes for um array, retorna os itens
            } else {
                console.warn(`Detalhes não é um array para o produto ${produto.ProdutoID}`); // Log de aviso se detalhes não for um array
                return []; // Retorna um array vazio
            }
        });

        // Gera o conteúdo CSV
        const csvContent = generateCSV(detalhesAgregados);

        // Cria um Blob e link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Items_Mais_Retiradas.csv'); // Define o nome do arquivo
        document.body.appendChild(link);
        link.click(); // Inicia o download
        document.body.removeChild(link); // Remove o link da página
    } else {
        console.error('retiradas.value não é um array.'); // Mensagem de erro se retiradas.value não for um array
    }
};

// Função para exportar os dados em formato JSON
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2); // Converte os dados em formato JSON
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.json'); // Define o nome do arquivo
    document.body.appendChild(link);
    link.click(); // Inicia o download
    document.body.removeChild(link); // Remove o link da página
};

// Função para buscar DMs
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente para a requisição
    };
    try {
        const response = await axios.post('/relatorioItems/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });
        // Preenche o array de DMs com a resposta da API
        dms.value = [
            todosOption, // Opção "Todos"
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`, // Label da DM
                value: ID_DM // Valor da DM
            }))
        ];
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Exibe o erro no console se ocorrer
    }
};

// Função para buscar plantas
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente para a requisição
    };
    try {
        const response = await axios.post('relatorioItems/listarPlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });
        // Preenche a lista de plantas com a resposta da API
        plantas.value = [
            todosOption, // Opção "Todos"
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`, // Label da planta
                value: id_planta // Valor da planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error); // Exibe o erro no console se ocorrer
    }
};

// Função para buscar setores
const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente para a requisição
    };
    try {
        const response = await axios.post('relatorioItems/listarSetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });
        // Preenche a lista de setores com a resposta da API
        setor.value = [
            todosOption, // Opção "Todos"
            ...response.data.map(({ id_setor }) => ({
                label: `Setor  ${id_setor}`, // Label do setor
                value: id_setor // Valor do setor
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error); // Exibe o erro no console se ocorrer
    }
};

// Função para buscar centros de custo
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente para a requisição
    };
    try {
        const response = await axios.post('relatorioItems/listarCdC', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });
        // Preenche a lista de centros de custo com a resposta da API
        centroCusto.value = [
            todosOption, // Opção "Todos"
            ...response.data.map(({ id_centro_custo }) => ({
                label: `Centro de Custo  ${id_centro_custo}`, // Label do centro de custo
                value: id_centro_custo // Valor do centro de custo
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error); // Exibe o erro no console se ocorrer
    }
};

// Função para buscar funcionários
const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente para a requisição
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autenticação
            }
        });
        // Preenche a lista de funcionários com a resposta da API
        ListaFuncionarios.value = response.data.map((funcionario) => ({
            label: funcionario.nome, // Nome do funcionário
            value: funcionario.id_funcionario // ID do funcionário
        }));
    } catch (error) {
        console.error('Erro ao carregar usuários:', error); // Exibe o erro no console se ocorrer
    }
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Se o dropdown1 estiver aberto, fecha
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Se o dropdown2 estiver aberto, fecha
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Se o dropdown3 estiver aberto, fecha
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Se o dropdown4 estiver aberto, fecha
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Se o dropdown5 estiver aberto, fecha
};

// Função chamada ao abrir o datepicker
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns ao abrir o datepicker
};

// Função executada ao montar o componente
onMounted(() => {
    fetchDM(); // Chama a função para buscar as DMs
    fetchIdPlanta(); // Chama a função para buscar as plantas
    fetchSetorDiretoria(); // Chama a função para buscar os setores/diretorias
    fetchFuncionarios(); // Chama a função para buscar os funcionários
    fetchCentroCusto(); // Chama a função para buscar os centros de custo
});
</script>

<template>
    <!-- Card container para o conteúdo -->
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título principal do relatório -->
                <h5 class="my-4 text-2xl">Performace por DM</h5>
                
                <!-- Formulário de filtros -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    
                    <!-- Filtro para selecionar a DM -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Dropdown para selecionar a DM -->
                        <Dropdown class="drop" 
                            v-model="relatorio.dm" 
                            :options="dms" 
                            optionLabel="label" 
                            optionValue="value" 
                            placeholder="Todos" 
                            ref="dropdown1" />
                    </div>
                    
                    <!-- Filtro para selecionar a Data Inicial -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Inicial:</label>
                        <!-- VueDatePicker para selecionar a Data Inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"  
                            showIcon
                            :showOnFocus="false" 
                            :format="format" 
                            locale="pt-BR" 
                            :enable-time-picker="false"  
                            auto-apply  
                            ref="datepicker1"
                            @open="handleDatepickerOpen"  
                            placeholder="Selecione uma data inicial" />
                    </div>
                    
                    <!-- Filtro para selecionar a Data Final -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Final:</label>
                        <!-- VueDatePicker para selecionar a Data Final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final" 
                            showIcon
                            :showOnFocus="false"  
                            :format="format"  
                            locale="pt-BR" 
                            :enable-time-picker="false"  
                            auto-apply  
                            ref="datepicker2"
                            @open="handleDatepickerOpen" 
                            placeholder="Selecione uma data final" />
                    </div>
                    
                    <!-- Botão para filtrar os dados com base nos parâmetros -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="filtrar" 
                            type="button" 
                            label="Filtrar Dados" 
                            icon="pi pi-search" 
                            severity="info" 
                            @click="buscar"  
                        />
                    </div>

                    <!-- Botões de exportação -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" 
                            icon="pi pi-file" 
                            label="Exportar CSV" 
                            @click="exportCSV" 
                        />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Button class="exportar" 
                            icon="pi pi-file" 
                            label="Exportar JSON" 
                            @click="exportJSON"  
                        />
                    </div>
                    
                </div> <!-- Fim do formulário de filtros -->

                <!-- DataTable para exibição dos dados do relatório -->
                <div class="datatable-wrapper">
                    <DataTable
                        v-model:filters="filters"  
                        :value="retiradas"  
                        stripedRows  
                        showGridlines  
                        paginator 
                        :rows="10"  
                        :rowsPerPageOptions="[5, 10, 20, 50]"  
                        rowHover  
                        @rowSelect="onRowSelect"  
                        :globalFilterFields="['ProdutoNome', 'Quantidade', 'ProdutoSKU']" 
                        selectionMode="single" 
                        :tableStyle="{ width: '100%' }" 
                        ref="dt"
                    >
                        <template #header>
                            <div class="flex justify-content-end">
                                <!-- Filtro global para busca -->
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />  <!-- Campo de busca global -->
                                </IconField>
                            </div>
                        </template>
                        <!-- Exibe uma mensagem caso a tabela esteja vazia -->
                        <template #empty>{{ emptyMessage }} </template>
                        
                        <!-- Definição das colunas da tabela -->
                        <Column field="ProdutoNome" sortable header="DM"></Column>  <!-- Nome do produto (DM) -->
                        <Column field="quantidade_no_periodo" sortable header="Quantidade" class="text-center"></Column>  <!-- Quantidade -->
                    </DataTable>
                    
                    <!-- Detalhes do produto selecionado -->
                    <card v-if="show" class="details-card">
                        <template #title>Detalhes do Produto</template>
                        <template #content>
                            <DataTable 
                            :value="selectedItem" 
                                stripedRows 
                                showGridlines 
                                paginator 
                                :rows="10" 
                                :rowsPerPageOptions="[5, 10, 20, 50]" 
                                rowHover
                            >
                                <Column field="ProdutoNome" sortable header="Item"></Column>  <!-- Nome do item -->
                                <Column field="Data" sortable header="Data"></Column>  <!-- Data -->
                                <Column field="Quantidade" sortable header="Quantidade"></Column>  <!-- Quantidade -->
                                <Column field="ProdutoSKU" sortable header="SKU"></Column>  <!-- SKU do produto -->
                            </DataTable>
                        </template>
                    </card>
                </div> <!-- Fim da wrapper da DataTable -->
            </div>
        </div>
    </div>
    
    <!-- Spinner de carregamento -->
    <LoadingSpinner v-if="loading" />

    <!-- Diálogo de erro (caso ocorra algum erro na execução da busca) -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>  <!-- Exibe a mensagem do erro -->
        <template #footer>
            <!-- Botão de OK no diálogo de erro -->
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style scoped>
    /**
     * Estilo para o cabeçalho do Dialog.
     * Utiliza o layout flexível para alinhar o conteúdo de forma responsiva.
     */
    .dialog-header {
        display: flex;  /* Usado para criar um layout flexível onde os itens podem ser alinhados facilmente. */
        align-items: center;  /* Alinha verticalmente os itens dentro do cabeçalho do Dialog, garantindo que fiquem no centro. */
        justify-content: space-between;  /* Distribui os itens igualmente ao longo do cabeçalho com espaço entre eles (ex.: título e botão de fechar). */
    }

    /**
     * Estilo para o conteúdo do Dialog.
     * Aplica um padding ao redor do conteúdo para garantir que o texto e os outros elementos não toquem as bordas do container.
     */
    .dialog-content {
        padding: 1rem;  /* Adiciona um espaçamento de 1rem dentro do Dialog, afastando o conteúdo das bordas. */
    }

    /**
     * Estilo para a mensagem dentro do Dialog.
     * Justifica o texto e remove a margem padrão para um alinhamento mais uniforme.
     */
    .dialog-message {
        text-align: justify;  /* Justifica o texto, fazendo com que ele ocupe toda a largura disponível dentro do parágrafo, com espaçamento entre as palavras. */
        margin: 0;  /* Remove qualquer margem que possa ser aplicada automaticamente ao parágrafo, para um controle mais preciso sobre o layout. */
    }

    /**
     * Estilo para o componente Card.
     * Permite que o conteúdo dentro da Card tenha rolagem horizontal caso exceda o limite do container.
     */
    .card {
        overflow-x: auto;  /* Permite rolagem horizontal se o conteúdo da Card ultrapassar a largura do container. */
    }

    /**
     * Estilo para o wrapper da DataTable.
     * Permite que a tabela tenha rolagem horizontal e ocupa toda a largura da tela.
     */
    .datatable-wrapper {
        overflow-x: auto;  /* Permite rolagem horizontal quando o conteúdo da tabela excede o tamanho da tela. */
        width: 100vw;  /* Define a largura do wrapper como 100% da largura da viewport, ou seja, toda a largura da tela. */
    }

    /**
     * Estilo para o botão de "Filtrar".
     * Adiciona um espaçamento superior para separar visualmente do conteúdo acima.
     */
    .filtrar {
        margin-top: 25px;  /* Cria uma margem superior de 25px para separar o botão "Filtrar" de outros elementos acima dele. */
    }

    /**
     * Estilo para os componentes Dropdown.
     * Garante que os Dropdowns ocupem toda a largura disponível dentro do container.
     */
    .drop {
        width: 100%;  /* Define que os Dropdowns ocupem 100% da largura disponível dentro do campo ou container. */
    }

    /**
     * Estilos específicos para telas com largura máxima de 580px.
     * Ajusta o layout para dispositivos móveis e pequenas telas.
     */
    @media (max-width: 580px) {
        /**
         * Estilo para os campos do formulário em dispositivos com largura inferior a 580px.
         * Faz com que cada campo ocupe 100% da largura da tela, se ajustando a dispositivos móveis.
         */
        .form .field {
            flex: 0 0 100%;  /* Faz com que os campos do formulário ocupem toda a largura disponível, adaptando-se a telas pequenas. */
            max-width: 100%;  /* Garante que o campo nunca ultrapasse 100% da largura do seu container pai. */
            margin-bottom: 1rem;  /* Adiciona uma margem inferior de 1rem entre os campos para melhor espaçamento visual. */
        }

        /**
         * Estilo para o dropdown nos dispositivos móveis.
         * Garante que o dropdown ocupe 100% da largura disponível do campo.
         */
        .form .field .drop {
            width: 100%;  /* Garante que o dropdown ocupe 100% da largura do seu container, ajustando-se a dispositivos móveis. */
        }

        /**
         * Estilo para os botões "Filtrar" e "Exportar" nos dispositivos móveis.
         * Faz com que os botões ocupem toda a largura disponível da tela.
         */
        .form .field .filtrar,
        .form .field .exportar {
            width: 100%;  /* Garante que os botões "Filtrar" e "Exportar" ocupem 100% da largura disponível em dispositivos móveis. */
        }
    }

    /**
     * Estilo para os campos do formulário.
     * Impede que o texto dentro dos campos de formulário se quebre e garante que ele seja alinhado à esquerda.
     */
    .field {
        white-space: nowrap;  /* Impede a quebra de linha dentro do campo, fazendo com que o texto se mantenha em uma única linha (não se quebra). */
        text-align: left;  /* Alinha o conteúdo dentro dos campos de formulário à esquerda, para garantir uma apresentação limpa e padronizada. */
    }
</style>
