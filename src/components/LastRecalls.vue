<script setup>
import { defineProps } from 'vue'; // defineProps para declarar propriedades
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { format } from 'date-fns'; // Função para formatar a data
const toast = useToast(); // Função para exibir notificações 
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Defina os props
/**
 * @typedef {Object} most
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
const props = defineProps({//defineProps é usado para definir as propriedades do componente
    products: {//products é um array de objetos
        type: Array,//define que products é um array
        required: true//define que products é obrigatório
    }
});

/**
 * Função para formatar a data e hora no formato 'dd/MM/yyyy HH:mm'.
 * 
 * @function formatDateTime
 * @param {string} date - Data em formato de string a ser formatada.
 * @returns {string|null} - Data formatada ou null se não houver data.
 */
const formatDateTime = (date) => {//formatDateTime é uma função que recebe uma data como parâmetro
    return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : null;//retorna a data formatada ou null se não houver data
};

const truncatedText = (text) => {//truncatedText é uma função que recebe um texto como parâmetro
    return text.length > 20 ? text.substring(0, 20) + '...' : text;//retorna o texto truncado se tiver mais de 20 caracteres
};
</script>

<template>
  <!-- Cabeçalho da tabela -->
  <div class="header " style="display: flex">
    <div class="title mb-0" style="display: flex; align-items: center">
      <h5 style="margin-right: 5px">{{ $t('latest_withdrawals') }}</h5>
    </div>
    
    <!-- Ícone com tooltip explicativo -->
    <i v-tooltip="'Limitado aos últimos 5 itens retirados.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray"></i>
  </div>

  <!-- Tabela de dados com os produtos retirados -->
  <DataTable 
  :value="props.products" 
  removableSort 
    :rows="5" 
    size="Normal"
    columnResizeMode="fit"
    responsiveLayout="scroll" 
    class="mt-3">

  <!-- A tabela exibe os dados provenientes de "props.products" -->
   <!-- Define o número de linhas visíveis por página como 5 -->
    <!-- Aplica um estilo específico de largura mínima e layout fixo para a tabela -->
     <!-- Faz com que a tabela tenha um layout responsivo, com rolagem horizontal em telas menores -->
    
    <!-- Coluna de identificação da máquina -->
    <Column field="Identificacao" style="width: 10%;" :header="t('machine')" sortable >
      <template #body="{ data }">
        <span class="tooltip-target" v-tooltip="data.Identificacao">{{ data.Identificacao }}</span>
      </template>
    </Column>
    
    <!-- Coluna de SKU do produto -->
    <Column field="ProdutoSKU" style="width: 10%; text-align: center;" :header="t('SKU')" sortable ></Column>
    
    <!-- Coluna de descrição do produto -->
    <Column field="ProdutoDescricao" class="table-cell" :header="t('description')" sortable style="width: 80%"">
      <template #body="{ data }">
        <span class="tooltip-target" v-tooltip="data.ProdutoDescricao">{{ data.ProdutoDescricao }}</span>
      </template>
    </Column>
    
    <!-- Coluna de data e hora da retirada -->
    <Column field="Dia" style="width: 10%;" class="table-cell" :header="t('date_time')" sortable >
      <template #body="slotProps">
        {{ formatDateTime(slotProps.data.Dia) }} <!-- Exibe a data formatada -->
      </template>
    </Column>

    <!-- Mensagem exibida quando não há dados na tabela -->
    <template #empty>
      <div class="empty-message" style="text-align: center; padding: 20px; color: gray">{{ $t('sem_retirada') }}</div>
    </template>
  </DataTable>
</template>

<style >
.table-cell {
    overflow: hidden !important;  /* Oculta o texto que excede o tamanho da célula */
    white-space: nowrap; /* Impede quebra de linha */
    text-overflow: ellipsis; /* Exibe reticências (...) quando o texto excede o tamanho */
    
}

/* Estilos para a exibição de tooltip */
.tooltip-target { /* Estilo para o elemento que exibirá o tooltip */
    cursor: pointer;  /* Altera o cursor para indicar que o elemento é clicável */
    white-space: nowrap;  /* Impede quebra de linha */
    overflow: hidden; /* Oculta o texto que excede o tamanho */
    text-overflow: ellipsis;  /* Exibe reticências (...) quando o texto excede o tamanho */
    display: inline-block;  /* Exibe o elemento como um bloco */
    max-width: 100%;  /* Define a largura máxima como 100% */
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {  /* Estilo para o tooltip */
    max-width: 400px; /* Define a largura máxima do tooltip */
    white-space: normal;  /* Permite que o texto quebre em várias linhas */
}
</style>