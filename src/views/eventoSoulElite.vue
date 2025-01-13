<template>
    <!-- Título da seção de dados do evento -->
    <h1>Dados do evento</h1>

    <!-- Componente DataTable para exibir os dados em formato tabular -->
    <DataTable
        v-model:filters="filters"
        :value="formattedData"
        stripedRows
        showGridlines
        paginator
        :rows="50"
        :rowsPerPageOptions="[50, 100, 500, 1000]"
        rowHover
        :globalFilterFields="['Nome', 'Telefone', 'RG', 'Retirada', 'dia_retirada', 'hora_retirada']"
        tableStyle="min-width: 50rem; table-layout: fixed;"
        :sortField="'nome'"
        :sortOrder="1"
        filterDisplay="menu"
        :loading="loading"
    >

    <!-- A tabela exibe os dados provenientes de "formattedData" -->
<!-- Aplica um estilo alternado nas linhas da tabela para facilitar a leitura -->
<!-- Exibe as linhas de grade para separar as células -->
<!-- Permite a navegação por páginas, exibindo 50 linhas por página -->
<!-- Oferece opções para escolher o número de itens por página: 50, 100, 500 ou 1000 -->
<!-- Aplica um efeito visual de destaque nas linhas ao passar o mouse sobre elas -->
<!-- Permite filtrar os dados globalmente com base nos campos "Nome", "Telefone", "RG", "Retirada", "dia_retirada" e "hora_retirada" -->
<!-- Define a tabela com largura mínima de 50rem e layout fixo para as colunas -->
<!-- Ordena os dados inicialmente pelo campo "nome" de forma crescente -->
<!-- Exibe os filtros em um menu suspenso ao lado das colunas de pesquisa -->
<!-- Exibe um indicador de carregamento enquanto os dados são carregados -->

        <!-- Template para o cabeçalho da tabela -->
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <!-- Exibe o total de registros -->
                    <span>Total de registros: {{ data.length }}</span>
                </div>

                <!-- Campo de busca global e botão de limpar filtros -->
                <div class="flex justify-content-end align-items-center">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                            <!-- Ícone de pesquisa -->
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                        <!-- Campo de input para filtro global, vinculado à propriedade filters['global'].value -->
                    </IconField>

                    <Button class="ml-4" type="button" icon="pi pi-filter-slash" label="Limpar Filtros" outlined @click="limparFiltros()" />
                    <!-- Botão para limpar filtros, chama a função 'limparFiltros' ao ser clicado -->
                </div>
            </div>
        </template>

        <!-- Template para quando não houver dados -->
        <template #empty> Nenhum registro encontrado </template>

        <!-- Template de carregamento, exibido enquanto os dados estão sendo carregados -->
        <template #loading> Carregando registros encontrados, aguarde... </template>

        <!-- Definição das colunas da tabela -->
        <Column field="Nome" header="Nome" sortable>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'Nome' -->
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo nome" />
            </template>
        </Column>

        <Column field="Telefone" header="Telefone" sortable>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'Telefone' -->
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo telefone" />
            </template>
        </Column>

        <Column field="RG" header="RG" sortable>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'RG' -->
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pelo RG" />
            </template>
        </Column>

        <Column field="dia_retirada" header="Dia" sortable>
            <template #body="slotProps">
                <!-- Exibe a data formatada para 'dia_retirada' -->
                {{ slotProps.data.dia_retirada_formatada }}
            </template>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'dia_retirada', com calendário -->
                <Calendar 
                    v-model="filterModel.value" 
                    dateFormat="dd/mm/yy" 
                    placeholder="Selecione o dia" 
                    :showIcon="true"
                />
            </template>
        </Column>

        <Column field="hora_retirada" header="Hora" sortable>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'hora_retirada' -->
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela hora" />
            </template>
        </Column>

        <Column field="Retirada" header="Retirada" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Exibe um ícone de atualização se a coluna 'Retirada' foi modificada -->
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Retirada')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Retirada }} <!-- Exibe o valor de 'Retirada' -->
                </span>
            </template>
            <template #filter="{ filterModel }">
                <!-- Filtro para a coluna 'Retirada' -->
                <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Procure pela retirada" />
            </template>
        </Column>

    </DataTable>
</template>

<script setup>
// Importação de funcionalidades do Vue e do PrimeVue para filtros
import { ref, onMounted, onUnmounted, h, computed } from 'vue';
import { FilterMatchMode, FilterOperator, FilterService } from 'primevue/api';

// Registra um filtro customizado para comparar arrays
FilterService.register('filterByArrayEquals', (arr, value) => {
  if (!value) {
    return true;  // Se o valor do filtro for nulo, sempre retorna verdadeiro
  }
  return arr.includes(value); // Verifica se o valor está presente no array
});

// Computed property para formatar os dados de 'dia_retirada' antes de exibir
const formattedData = computed(() => {
    return data.value.map((item) => {
        if (item.dia_retirada) {
            // Se 'dia_retirada' estiver presente, formata a data
            const [day, month, year] = item.dia_retirada.split('/');
            const dateInBrasilia = new Date(year, month - 1, day, 0, 0, 0);
            dateInBrasilia.setHours(dateInBrasilia.getHours() + 3); // Ajuste para UTC-3

            // Retorna o item com a data formatada
            return {
                ...item,
                dia_retirada: dateInBrasilia,
                dia_retirada_formatada: dateInBrasilia.toLocaleDateString('pt-BR') // Formato dd/mm/yyyy
            };
        } else {
            // Caso não haja 'dia_retirada', retorna dados com valor nulo
            return { ...item, dia_retirada: null, dia_retirada_formatada: '' };
        }
    });
});

// Variáveis reativas para armazenar os dados e filtros da tabela
const data = ref([]); // Armazena os dados a serem exibidos na tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }, // Filtro global
    Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Filtro para 'Nome'
    Telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Filtro para 'Telefone'
    RG: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: 'filterByArrayEquals' }] }, // Filtro customizado para 'RG'
    Retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }, // Filtro para 'Retirada'
    dia_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }, // Filtro para 'dia_retirada'
    hora_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] } // Filtro para 'hora_retirada'
});

// Variável reativa para controlar o status de carregamento
const loading = ref(false);

// Variável para armazenar o EventSource
let eventSource;


// Função chamada quando o componente é montado
onMounted(() => {
    // Define a URL base para a API
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Conecta ao EventSource para obter atualizações em tempo real
    eventSource = new EventSource(`${baseURL}/evento/updateSE24`);
    
    // Configura o handler para quando a mensagem for recebida
    eventSource.onmessage = (event) => {
        try {
            const updates = JSON.parse(event.data);  // Tenta parsear os dados JSON recebidos
            if (updates) {
                data.value = Array.isArray(updates) ? updates : [];  // Atualiza os dados, se válidos
            } else {
                console.warn('Nenhuma atualização recebida.');  // Se a atualização não for válida, exibe um aviso
            }
        } catch (error) {
            console.error('Erro ao processar dados do EventSource:', error);  // Exibe erro caso o parsing falhe
        }
    };
});

// Função chamada quando o componente for desmontado
onUnmounted(() => {
    if (eventSource) {
        eventSource.close(); // Fecha a conexão com o EventSource
    }
});

function rowClass(data) {
    if (data.isNew) return 'new-row';
    if (data.updatedColumns && data.updatedColumns.length > 0) return 'updated-row';
    return '';
}

// Função para limpar os filtros
function limparFiltros() {
    // Reseta os filtros para os valores iniciais
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        Nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        Telefone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        RG: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        Retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        dia_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        hora_retirada: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    };
}
</script>

<style>
.new-row {
    background-color: #e0ffe0; /* Estilo para novas linhas */
}

.updated-row {
    background-color: #fff5e6; /* Estilo para linhas atualizadas */
}

.updated-icon {
    margin-left: 5px; /* Espaçamento para o ícone de atualização */
}
</style>
