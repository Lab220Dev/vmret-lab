<script setup>
import { defineProps } from 'vue'; // defineProps para declarar propriedades
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { format } from 'date-fns'; // Função para formatar a data
const toast = useToast(); // Função para exibir notificações 

// Defina os props
/**
 * @typedef {Object} Product
 * @property {string} Identificacao - Identificação da máquina.
 * @property {string} ProdutoSKU - Código do produto (SKU).
 * @property {string} ProdutoDescricao - Descrição do produto.
 * @property {string} Dia - Data e hora da retirada.
 */

/**
 * Propriedades do componente.
 * 
 * @typedef {Object} Props
 * @property {Array<Product>} products - Lista de produtos retirados, contendo a identificação da máquina, SKU, descrição e data/hora.
 */
const props = defineProps({
    products: {
        type: Array,
        required: true
    }
});

// Função para formatar a data e hora de retirada
/**
 * Função para formatar a data e hora no formato 'dd/MM/yyyy HH:mm'.
 * 
 * @function formatDateTime
 * @param {string} date - Data em formato de string a ser formatada.
 * @returns {string|null} - Data formatada ou null se não houver data.
 */
const formatDateTime = (date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : null;
};
</script>

<template>
  <!-- Cabeçalho da tabela -->
  <div class="header" style="display: flex">
    <div class="title" style="display: flex; align-items: center">
      <h5 style="margin-right: 5px">Últimas retiradas</h5>
    </div>
    
    <!-- Ícone com tooltip explicativo -->
    <i v-tooltip="'Limitado aos últimos 5 itens retirados.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray"></i>
  </div>

  <!-- Tabela de dados com os produtos retirados -->
  <DataTable :value="props.products" :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" removableSort responsiveLayout="scroll">
    
    <!-- Coluna de identificação da máquina -->
    <Column field="Identificacao" header="Máquina" sortable style="width: 20%">
      <template #body="{ data }">
        <span class="tooltip-target" v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
      </template>
    </Column>
    
    <!-- Coluna de SKU do produto -->
    <Column field="ProdutoSKU" header="SKU" sortable style="width: 15%"></Column>
    
    <!-- Coluna de descrição do produto -->
    <Column field="ProdutoDescricao" header="Descrição" sortable style="width: 35%">
      <template #body="{ data }">
        <span class="tooltip-target" v-tooltip="data.ProdutoDescricao">{{ data.ProdutoDescricao }}</span>
      </template>
    </Column>
    
    <!-- Coluna de data e hora da retirada -->
    <Column field="Dia" header="Data e Hora" sortable style="width: 30%">
      <template #body="slotProps">
        {{ formatDateTime(slotProps.data.Dia) }} <!-- Exibe a data formatada -->
      </template>
    </Column>

    <!-- Mensagem exibida quando não há dados na tabela -->
    <template #empty>
      <div class="empty-message" style="text-align: center; padding: 20px; color: gray">Nenhuma retirada foi realizada até o momento.</div>
    </template>
  </DataTable>
</template>

<style>
/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>