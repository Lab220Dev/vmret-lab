<script setup>
import { onMounted, ref, watch } from 'vue'; // Importando hooks do Vue
import VueDatePicker from '@vuepic/vue-datepicker'; // Importando o componente de data
import '@vuepic/vue-datepicker/dist/main.css'; // Importando o CSS do componente de data
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importando o componente de Loading Spinner
import axios from '@/axios.js'; // Importando a instância axios configurada
import { useAuthStore } from '@/store/authStore.js'; // Importando o store de autenticação
import { FilterMatchMode } from 'primevue/api'; // Importando a constante de filtros do PrimeVue
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados (provavelmente para carregar dados externos)
import { getTimeFromString, getDateFromString } from '@/helpers/HelperUtils.js';
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados

// Declarando variáveis reativas
const filteredCount = ref(0); // Contador de itens filtrados
const dataStore = useDataStore(); // Cria uma instância do store de dados
const store = useAuthStore(); // Acesso ao store de autenticação
const relatorio = ref({
    id_dm: '', // ID da DM
    dia: new Date() // Data selecionada (inicia com a data atual)
});
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem padrão caso não haja dados
const todosOption = { label: 'Todos', value: null }; // Opção para "Todos"
const loading = ref(false); // Estado de carregamento (true ou false)
const dms = ref([todosOption]); // Lista de DMs, começando com a opção 'Todos'
const StatusDM = ref([]); // Status das DMs
const dropdown1 = ref(null); // Ref para o dropdown da DM

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para pesquisa
});

// Função chamada quando o componente for montado
onMounted(async () => {
    //fetchDM(); // Chama a função para carregar as DMs
    dms.value = dataStore.dms || (await dataStore.fetchListaDms());
});

// Função para manter os dados atualizados conforme o filtro
const KeepAlive = async () => {
    try {
        loading.value = true;
        StatusDM.value = await relatorioService.statusDM(relatorio);

        filteredCount.value = StatusDM.value.length; // Atualiza o contador de itens filtrados

        // Caso não haja registros, exibe uma mensagem de erro
        if (StatusDM.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        }
    } catch (error) {
        console.error('Erro ao carregar lista de dms:', error); // Caso ocorra erro, imprime a mensagem no console
    } finally {
        loading.value = false; // Desativa o spinner de carregamento
    }
};

// Observa mudanças no filtro global e atualiza o contador de registros filtrados
watch(
    () => filters.value.global.value, // Observa o valor do filtro global
    () => {
        // Filtra os dados de StatusDM conforme o valor do filtro global
        filteredCount.value = StatusDM.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro convertido para minúsculo
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo contém o valor do filtro
        }).length;
    },
    { immediate: true } // Executa imediatamente após a montagem
);

// Função para formatar a data
const formatDate = (date) => {
    const dia = date.getDate().toString().padStart(2, '0'); // Obtém o dia com dois dígitos
    const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Obtém o mês com dois dígitos (começando de 1)
    const ano = date.getFullYear(); // Obtém o ano
    return `${dia}/${mes}/${ano}`; // Retorna a data no formato dd/MM/yyyy
};
// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Verifica se o dropdown está visível e o esconde
};

// Função chamada quando o datepicker for aberto
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha o dropdown de DM quando o datepicker abrir
};
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="text-center">
                <h5 class="mt-3 mb-5 text-2xl">
                    Status DM
                    <hr />
                </h5>
            </div>
            <div class="grid mt-3 mx-1 px-1">
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Dropdown para selecionar DM -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <Dropdown id="dm" v-model="relatorio.id_dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Selecione uma DM" class="mr-3 w-full md:w-14rem" style="width: 20%" ref="dropdown1" @change="KeepAlive" />
                    </div>
                    <!-- DatePicker para selecionar a data -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <VueDatePicker
                            class="drop w-full md:w-14rem"
                            v-model="relatorio.dia"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDate"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            placeholder="Selecione uma data"
                            teleport="body"
                            @update:modelValue="KeepAlive"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                </div>
                <!-- Tabela de Status DM -->
                <div class="datatable-wrapper">
                    <DataTable
                        class="mt-3"
                        v-model:filters="filters"
                        :value="StatusDM"
                        stripedRows
                        showGridlines
                        removableSort
                        paginator
                        :rows="10"
                        dataKey="DM"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :globalFilterFields="['Identificacao', 'status', 'dataHora']"
                        selectionMode="single"
                        :metaKeySelection="false"
                        tableStyle="max-width: 100%; table-layout: fixed;"
                        :sortOrder="1"
                        :sortField="'Identificacao'"
                    >
                        <!--
                        A tabela exibe os dados da variável 'StatusDM', que provavelmente representa o status de determinados processos ou eventos (como "DM" - Data Management ou algo similar).
                    
                        - **class="mt-3"**: Aplica uma margem superior de tamanho 3 (geralmente definida pelo framework CSS, como Tailwind CSS), ajudando a separar a tabela de outros elementos ao seu redor.
                    
                        - **v-model:filters="filters"**: A tabela é vinculada a um modelo `filters`, que mantém os critérios de filtro aplicados. Esse modelo se atualiza automaticamente conforme o usuário modifica os filtros. Ao usar `v-model`, a variável `filters` é uma referência bidirecional, permitindo filtrar os dados com base no que o usuário digita ou escolhe.
                    
                        - **:value="StatusDM"**: A tabela recebe os dados de `StatusDM`, que é a variável que contém os registros que serão exibidos na tabela. Cada item dentro de `StatusDM` será uma linha na tabela.
                    
                        - **stripedRows**: Ativa o estilo de "linhas alternadas" (listradas), onde as linhas ímpares e pares possuem cores de fundo diferentes. Isso facilita a leitura, especialmente quando os dados são densos.
                    
                        - **showGridlines**: Exibe as linhas de grade (divisórias entre as células da tabela). Isso torna a visualização dos dados mais clara e organizada.
                    
                        - **removableSort**: Permite que o usuário remova a ordenação de uma coluna. Ao clicar novamente no cabeçalho de uma coluna que está ordenada, a ordenação é revertida.
                    
                        - **paginator**: Habilita a paginação, ou seja, os dados são divididos em páginas. Isso melhora a experiência do usuário ao navegar por grandes volumes de dados.
                    
                        - **:rows="10"**: Define que serão exibidos 10 itens por página. Isso limita o número de registros visíveis por vez, evitando que todos os registros sejam carregados de uma vez.
                    
                        - **dataKey="DM"**: Especifica que a chave única para cada linha de dados é o valor da coluna `DM`. Isso ajuda o componente a gerenciar e identificar de forma única cada linha, o que é útil para ações como ordenação, seleção e paginação.
                    
                        - **:rowsPerPageOptions="[5, 10, 20, 50]"**: O usuário pode escolher o número de registros por página. As opções disponíveis são 5, 10, 20 ou 50 itens por página, proporcionando flexibilidade.
                    
                        - **:globalFilterFields="['Identificacao', 'status', 'dataHora']"**: Define os campos que serão usados no filtro global. Isso significa que, ao digitar um valor no filtro, a tabela irá procurar esse valor nos campos `Identificacao`, `status`, e `dataHora`.
                    
                        - **selectionMode="single"**: Define que a tabela permite selecionar apenas uma linha por vez. Ao clicar em uma linha, ela será selecionada, e o usuário não poderá selecionar outras até desmarcar a seleção.
                    
                        - **:metaKeySelection="false"**: Desativa a funcionalidade de selecionar múltiplas linhas utilizando a tecla Meta (geralmente "Command" no macOS ou "Ctrl" no Windows). Isso garante que a seleção seja exclusiva e única para cada vez.
                    
                        - **tableStyle="min-width: 50rem; table-layout: fixed;"**: Define o estilo da tabela. A tabela terá uma largura mínima de 50rem e o layout das colunas será fixo. Isso significa que as colunas não vão ajustar seu tamanho automaticamente conforme o conteúdo, garantindo um layout consistente.
                    
                        - **:sortOrder="1"**: Define a ordenação dos dados pela coluna especificada em `:sortField`. O valor `1` indica que a ordenação será feita em ordem crescente (do menor para o maior valor da coluna).
                    
                        - **:sortField="'Identificacao'"**: Define que a tabela será ordenada inicialmente pela coluna `Identificacao`. Isso determina qual campo será utilizado para a ordenação ao carregar a tabela.
                    
                    -->
                        <!-- Cabeçalho da Tabela -->
                        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                    <span>Total de registros: {{ filteredCount }}</span>
                                    <!-- Exibe o número total de registros -->
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                        <!-- Campo de busca global -->
                                    </IconField>
                                </div>
                            </div>
                        </template>
                        <!-- Mensagem quando a tabela estiver vazia -->
                        <template #empty> {{ emptyMessage }} </template>
                        <!-- Definição das colunas da tabela -->
                        <Column field="Identificacao" style="width: 20%" sortable header="DM"></Column>
                        <Column field="status" sortable header="Status"></Column>
                        <Column field="dataHora" style="width: 20%; text-align: center" sortable header="Data">
                            <template #body="{ data }">
                                <span v-tooltip="data.dataHora">{{ getDateFromString(data.dataHora) }}</span>
                                <!-- Exibe a data formatada -->
                            </template>
                        </Column>
                        <Column field="Hora" style="width: 15%; text-align: center" sortable header="Hora">
                            <template #body="{ data }">
                                {{ getTimeFromString(data.dataHora) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <!-- Spinner de carregamento -->
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
</template>

<style>
.card {
    overflow-x: auto; /* Permite rolagem horizontal no card */
}

.datatable-wrapper {
    overflow-x: auto; /* Permite rolagem horizontal na tabela */
    width: 100vw; /* Define a largura da tabela como 100% da tela */
}

.filtrar {
    margin-top: 25px; /* Adiciona margem superior ao botão de filtro */
}

.drop {
    width: 100%; /* Faz o dropdown ocupar 100% da largura disponível */
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%; /* Faz os campos ocuparem 100% da largura em telas pequenas */
        max-width: 100%;
        margin-bottom: 1rem; /* Adiciona margem inferior entre os campos */
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
    white-space: nowrap; /* Impede quebra de linha no texto */
    text-align: left; /* Alinha o texto à esquerda */
}
</style>
