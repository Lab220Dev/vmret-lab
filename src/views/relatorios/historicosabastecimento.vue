<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';  // Importação do componente de date picker
import { FilterMatchMode } from 'primevue/api';  // Importação do tipo de filtro para o componente DataTable
import { useToast } from 'primevue/usetoast';  // Importação do serviço de Toast para exibir mensagens
import '@vuepic/vue-datepicker/dist/main.css';  // Importação do CSS do VueDatePicker
import { ref, onMounted, watch } from 'vue';  // Importação das funções reativas e de ciclo de vida do Vue
import axios from '@/axios.js';  // Importação do axios configurado para requisições HTTP
import { useAuthStore } from '@/store/authStore.js';  // Importação do store para autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue';  // Importação do componente de spinner de carregamento

// Definindo referências reativas
const showDialog = ref(false);  // Flag para exibir o modal de mensagem
const dialogMessage = ref('');  // Mensagem exibida no modal
const filteredCount = ref(0);  // Contagem de registros filtrados
const loading = ref(false);  // Flag para exibir o loading spinner
const store = useAuthStore();  // Usando o store para autenticação
const toast = useToast();  // Usando o serviço de toast para exibir mensagens
const emptyMessage = ref('Ainda não foi feita nenhuma busca');  // Mensagem padrão quando não há dados
const dropdown1 = ref(null);  // Referência para o primeiro dropdown (DM)
const dropdown2 = ref(null);  // Referência para o segundo dropdown (Planta)
const dropdown3 = ref(null);  // Referência para o terceiro dropdown (Setor)
const dropdown4 = ref(null);  // Referência para o quarto dropdown (Centro de Custo)
const dropdown5 = ref(null);  // Referência para o quinto dropdown (Operador)
const historico = ref([]);  // Dados do histórico de abastecimento
const todosOption = { label: 'Todos', value: null };  // Opção "Todos" para os filtros
const ListaOperador = ref(null);  // Lista de operadores
const dms = ref([todosOption]);  // Lista de DM's
const plantas = ref([todosOption]);  // Lista de plantas
const setor = ref([todosOption]);  // Lista de setores
const centroCusto = ref([todosOption]);  // Lista de centros de custo
const filters = ref({  // Filtros globais para o DataTable
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);  // Flag para exibir a busca ou o resultado
const selectedItem = ref([]);  // Item selecionado (para exibir mais detalhes)
const relatorio = ref({  // Dados do relatório
    dm: '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_operador: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),  // Data inicial (1º dia do mês atual)
    data_final: new Date()  // Data final (data atual)
});

// Função para formatar data (dia/mês/ano)
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Função para formatar data com horas e minutos
const formatTabela = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${horas}:${minutos}`;
};

// Função para converter data para ISO (utilizada nas requisições)
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

// Função para buscar o histórico de abastecimento
const buscar = async () => {
    const data = {
        id_usuario: store.userId,  // ID do usuário autenticado
        id_cliente: store.userIdCliente,  // ID do cliente
        id_dm: relatorio.value.dm === null ? undefined : relatorio.value.dm,  // Filtro por DM
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,  // Filtro por funcionário
        data_inicio: toISODate(relatorio.value.data_inicio),  // Data de início
        data_final: toISODate(relatorio.value.data_final),  // Data final
        id_operador: relatorio.value.id_operador  // Filtro por operador
    };
    try {
        loading.value = true;  // Ativa o loading
        const response = await axios.post('/HistoricoAbastecimento/relatorio', data);  // Requisição para obter o histórico
        historico.value = response.data;  // Armazena os dados do histórico

        filteredCount.value = historico.value.length;  // Conta o número de registros encontrados

        if (historico.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';  // Mensagem caso não haja dados
        } else {
            emptyMessage.value = '';  // Limpa a mensagem de erro se houver dados
        }
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);  // Erro na requisição
    } finally {
        loading.value = false;  // Desativa o loading após a resposta
    }
};

// Função para voltar à tela inicial
const voltar = () => {
    show.value = true;  // Exibe o painel de busca
    selectedItem.value = {};  // Limpa o item selecionado
};

// Função para gerar CSV
const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');  // Gera cabeçalhos com base nas chaves dos objetos
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');  // Converte os dados em formato CSV
    return `${headers}\n${rows}`;  // Retorna o conteúdo CSV
};

// Função para exportar CSV
const exportCSV = () => {
    const csvContent = generateCSV(historico.value);  // Gera o CSV com os dados do histórico
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });  // Cria um blob com o conteúdo CSV
    const link = document.createElement('a');  // Cria um link para download
    const url = URL.createObjectURL(blob);  // Cria uma URL temporária para o blob
    link.setAttribute('href', url);  // Atribui a URL ao link
    link.setAttribute('download', 'HistoricoAbastecimento.csv');  // Define o nome do arquivo
    document.body.appendChild(link);  // Adiciona o link ao DOM
    link.click();  // Simula um clique no link para baixar o arquivo
    document.body.removeChild(link);  // Remove o link do DOM
};

// Função para exportar JSON
const exportJSON = () => {
    const jsonContent = JSON.stringify(historico.value, null, 2);  // Converte os dados para formato JSON
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });  // Cria um blob com o conteúdo JSON
    const link = document.createElement('a');  // Cria um link para download
    const url = URL.createObjectURL(blob);  // Cria uma URL temporária para o blob
    link.setAttribute('href', url);  // Atribui a URL ao link
    link.setAttribute('download', 'HistoricoAbastecimento.json');  // Define o nome do arquivo
    document.body.appendChild(link);  // Adiciona o link ao DOM
    link.click();  // Simula um clique no link para baixar o arquivo
    document.body.removeChild(link);  // Remove o link do DOM
};

// Função para carregar DM's
const fetchDM = async () => {
    const data = {
        id_cliente: store.userIdCliente  // ID do cliente
    };
    try {
        const response = await axios.post('/relatorioRetiRe/listardm', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Token de autenticação
            }
        });
        dms.value = [
            todosOption,
            ...response.data.map(({ ID_DM, Identificacao }) => ({
                label: `${Identificacao}`,
                value: ID_DM
            }))
        ];  // Atualiza a lista de DM's com os dados da resposta
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error);  // Erro ao carregar DM's
    }
};

// Função para carregar as plantas
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente  // ID do cliente
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Token de autenticação
            }
        });
        plantas.value = [
            todosOption,
            ...response.data.map(({ nome, id_planta }) => ({
                label: `Planta  ${nome}`,
                value: id_planta
            }))
        ];  // Atualiza a lista de plantas com os dados da resposta
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);  // Erro ao buscar plantas
    }
};

// Função para carregar setores
const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente  // ID do cliente
    };
    try {
        const response = await axios.post('Setor/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Token de autenticação
            }
        });
        setor.value = [
            todosOption,
            ...response.data.map(({ id_setor, nome }) => ({
                label: `Setor  ${nome}`,
                value: id_setor
            }))
        ];  // Atualiza a lista de setores com os dados da resposta
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error);  // Erro ao buscar setores
    }
};

// Função para carregar centros de custo
const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente  // ID do cliente
    };
    try {
        const response = await axios.post('cdc/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Token de autenticação
            }
        });
        centroCusto.value = [
            todosOption,
            ...response.data.map(({ ID_CentroCusto, Nome }) => ({
                label: `Centro de Custo  ${Nome}`,
                value: ID_CentroCusto
            }))
        ];  // Atualiza a lista de centros de custo com os dados da resposta
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);  // Erro ao buscar centros de custo
    }
};

// Função para carregar operadores
const fetchOperador = async () => {
    const data = {
        id_cliente: store.userIdCliente  // ID do cliente
    };
    try {
        const response = await axios.post('/funcionarios/listarOperarios', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Token de autenticação
            }
        });
        ListaOperador.value = [
            todosOption,
            ...response.data.map((funcionario) => ({
                label: funcionario.nome,
                value: funcionario.id_operador
            }))
        ];  // Atualiza a lista de operadores com os dados da resposta
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);  // Erro ao carregar operadores
    }
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide();  // Fecha o dropdown do DM
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide();  // Fecha o dropdown da planta
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide();  // Fecha o dropdown do setor
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide();  // Fecha o dropdown do centro de custo
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide();  // Fecha o dropdown do operador
};

// Função para tratar o evento de abertura do date picker
const handleDatepickerOpen = () => {
    closeAllDropdowns();  // Fecha todos os dropdowns ao abrir o date picker
};

// Carrega os dados ao montar o componente
onMounted(() => {
    fetchDM();  // Carrega a lista de DM's
    fetchIdPlanta();  // Carrega a lista de plantas
    fetchSetorDiretoria();  // Carrega a lista de setores
    fetchOperador();  // Carrega a lista de operadores
    fetchCentroCusto();  // Carrega a lista de centros de custo
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <h5 class="my-4 text-2xl">Histórico de Abastecimento</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="dm">DM:</label>
                        <Dropdown class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown2" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Setor:</label>
                        <Dropdown class="drop" v-model="relatorio.id_setor" :options="setor" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown3" />
                    </div>
                    <div class="field lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Centro de Custo:</label>
                        <Dropdown class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown4" />
                    </div>

                    <div class="field lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Operador:</label>
                        <Dropdown class="drop" v-model="relatorio.id_operador" :options="ListaOperador" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown5" />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            placeholder="Selecione uma data inicial"
                        />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            placeholder="Selecione uma data final"
                        />
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                </div>
                <!--  datatable do relatorio -->
                <div class="datatable-wrapper">
                    <DataTable
                        v-model:filters="filters"
                        :value="historico"
                        stripedRows
                        showGridlines
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['ID_DM', 'Data', 'operador', 'item', 'Quantidade', 'Mola']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                        :sortField="'ID_DM'"
                        :sortOrder="1"
                    >
                        <!-- @rowSelect="onRowSelect"  -->
                        <template #header>
                            <div class="flex justify-content-end">
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty>{{ emptyMessage }} </template>
                        <Column field="Maquina" sortable header="DM"></Column>
                        <Column field="Dia" sortable class="table-cell" style="width: 25%" header="Data">
                            <template #body="{ data }">
                                {{ formatTabela(new Date(data.Dia)) }}
                            </template></Column>
                        <Column field="Operador" sortable header="Operador"></Column>
                        <Column field="Nome_Produto" sortable header="Item"></Column>
                        <Column field="quantidade_abastecido" sortable header="Quantidade" class="text-center"></Column>
                        <Column field="posicao" sortable header="Posição"></Column>
                    </DataTable>
                </div>
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="true">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>
<style>
.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow: hidden;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
