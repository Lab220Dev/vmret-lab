<template>
    <div class="card vh">
        <!-- Contêiner principal da card com altura total da tela (vh) -->
        <h5 class="my-6 ml-2 text-2xl">Estoque da DM</h5>
        <!-- Título principal da página com margens e tamanho de fonte -->

        <!-- Seção do filtro para selecionar a DM -->
        <div class="my-2">
            <label for="dm" class="ml-2">DM:</label>
            <!-- Rótulo (label) para o Dropdown de DM -->

            <!-- Componente Dropdown para selecionar a DM -->
            <Dropdown id="dm" style="width: 20%" v-model="selectedDM" :options="props.dms" optionLabel="label" optionValue="value" placeholder="Todos" class="mb-2 ml-2" />
        </div>

        <!-- Exibe um componente de LoadingSpinner caso a propriedade 'loading' seja verdadeira -->
        <LoadingSpinner v-if="loading" />

        <!-- Componente DataTable para exibir o estoque -->
        <DataTable
            class="mt-3"
            :value="filteredEstoque"
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            selectionMode="single"
            :metaKeySelection="false"
            :sortOrder="1"
            :sortField="'Posicao'"
            :tableStyle="{ width: '100%' }"
        >
            <!-- Template para exibir uma mensagem caso não haja dados -->
            <template #empty>
                {{ emptyMessage }}  <!-- Exibe a mensagem de vazio definida em 'emptyMessage' -->
            </template>

            <!-- Coluna de SKU -->
            <Column field="sku" class="table-cell" sortable header="SKU" />
            <!-- Coluna de Produto -->
            <Column field="nome" sortable header="Produto">
                <!-- Exibe o nome do produto com tooltip -->
                <template #body="{ data }">
                    <span v-tooltip="data.nome">{{ data.nome }}</span>
                </template>
            </Column>
            <!-- Coluna de Posição com tooltip condicional -->
            <Column field="Posicao" sortable style="text-align: center" header="Posição">
                <template #body="{ data }">
                    <span
                        v-tooltip="data.modelo === '2018' ? 'Placa / Mola ' : data.modelo === '2023' ? 'Andar / Posição' : 'Placa / Motor'"
                    >
                        {{ data.Posicao }}  <!-- Exibe o valor da posição com tooltip baseado no modelo -->
                    </span>
                </template>
            </Column>
            <!-- Coluna de Quantidade Atual -->
            <Column field="quantidade" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Atual'">Quant. Atual</span>  <!-- Tooltip explicativo no cabeçalho -->
                </template>
            </Column>
            <!-- Coluna de Quantidade Mínima -->
            <Column field="quantidademinima" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Mínima'">Quant. Mín.</span>  <!-- Tooltip explicativo no cabeçalho -->
                </template>
            </Column>
            <!-- Coluna de Capacidade -->
            <Column field="capacidade" sortable style="text-align: center" header="Capacidade" />
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';  // Importa as funções 'ref' e 'computed' do Vue para criação de variáveis reativas
import LoadingSpinner from '@/components/LoadingSpinner.vue';  // Importa o componente de carregamento

// Definindo a estrutura inicial do relatório
const relatorio = ref({
    id_dm: ''
});

// Definindo as propriedades que são passadas ao componente (Props)
const props = defineProps({
    estoque: {
        type: Array,  // Define que 'estoque' é um array
        required: true  // 'estoque' é obrigatório
    },
    dms: {
        type: Array,  // Define que 'dms' é um array
        required: true  // 'dms' é obrigatório
    },
    loading: {
        type: Boolean,  // 'loading' é um valor booleano
        required: true  // 'loading' é obrigatório
    }
});

// Filtro global para a pesquisa
const filters = ref({
    global: { value: '' }
});

// Mensagem exibida quando não há itens para mostrar
const emptyMessage = ref('Nenhum item encontrado.');

// Variável reativa que representa o estado de carregamento
const loading = ref(false);

// Variável reativa que contém o valor selecionado da DM
const selectedDM = ref(null);

// Computed que filtra os itens de estoque com base na DM selecionada
const filteredEstoque = computed(() => {
    if (!selectedDM.value) {
        emptyMessage.value = 'Nenhum item encontrado.';  // Se nenhuma DM for selecionada, exibe mensagem padrão
        return props.estoque;  // Retorna todos os itens do estoque
    }
    // Obtém o label da DM selecionada
    const selectedDMLabel = props.dms.find((dm) => dm.value === selectedDM.value)?.label || 'DM desconhecida';
    
    // Filtra o estoque com base no ID da DM selecionada
    const resultadoFiltrado = props.estoque.filter((item) => item.ID_DM === selectedDM.value);
    
    // Verifica se há itens após o filtro e ajusta a mensagem de vazio
    if (resultadoFiltrado.length === 0) {
        emptyMessage.value = `Nenhum item encontrado para a DM selecionada (${selectedDMLabel}).`;
    } else {
        emptyMessage.value = '';  // Limpa a mensagem de vazio se houver itens
    }
    
    // Retorna o estoque filtrado
    return resultadoFiltrado;
});

</script>

<style>
.card {
    padding: 1rem;  /* Adiciona um preenchimento de 1rem em todos os lados da card */
    border-radius: 0.5rem;  /* Arredonda os cantos da card */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* Adiciona uma sombra sutil ao redor da card */
    background-color: white;  /* Define o fundo da card como branco */
}
</style>
