<script setup>
import { defineProps } from 'vue'; // defineProps para declarar propriedades
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { format } from 'date-fns'; // Função para formatar a data
import { useI18n } from 'vue-i18n';
const toast = useToast(); //toast para exibir mensagens de erro ou sucesso
const { t } = useI18n();//t é usado para traduzir textos

/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {Array<most>} most - Lista de produtos mais retirados, contendo a identificação da máquina, SKU, descrição e data/hora.
 */
const props = defineProps({//defineProps é usado para definir as propriedades do componente
    most: {//most é um array de objetos
        type: Array,//define que most é um array
        required: true//define que most é obrigatório
    }
});
</script>

<!-- Template do componente -->
<template>
    <div class="header" style="display: flex">  <!-- Cabeçalho da tabela -->
        <div class="title mb-0" style="display: flex; align-items: center"> <!-- Título do cabeçalho -->
            <h5 style="margin-right: 5px">{{ $t('most_withdrawn_items') }}</h5> 
        </div>

        <i v-tooltip="'Itens mais retirados nos últimos 6 meses.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray"></i>
    </div>  <!-- Ícone com tooltip explicativo -->

    <!-- DataTable exibindo os itens mais retirados -->
    <DataTable 
    :value="props.most" 
    removableSort 
    :rows="5" 
    size="Normal"
    columnResizeMode="fit"
    responsiveLayout="scroll" 
    class="mt-3">
        <!-- A tabela exibe os dados provenientes de "props.most" -->
        <!-- O usuário pode remover a ordenação clicando na coluna de ordenação -->
        <!-- Define o número de linhas visíveis por página como 5 -->
        <!-- Aplica um estilo específico de largura mínima e layout fixo para a tabela -->
        <!-- Faz com que a tabela tenha um layout responsivo, com rolagem horizontal em telas menores -->

        <!-- Coluna para exibir o SKU do produto -->
        <Column field="ProdutoSKU" :header="t('SKU')" style="width: 10%;" sortable>
            <template #body="{ data }">
                            <span class="tooltip-target" v-tooltip="data.ProdutoSKU">{{ data.ProdutoSKU }}</span>
                        </template></Column>
        <!-- Coluna para exibir o nome do produto -->
        <Column field="ProdutoNome" :header="t('item')" sortable>
            <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.ProdutoNome">{{ data.ProdutoNome }}</span>
            </template></Column
        >
        <!-- Coluna para exibir o número de retiradas -->
        <Column field="NumeroDeRetiradas" :header="t('quantity')" style="width: 10%; text-align: center;" sortable ></Column>
        <!-- Mensagem exibida caso não haja dados na tabela -->
        <template #empty>
            <div class="empty-message" style="text-align: center; padding: 20px; color: gray">{{ $t('sem_retirada') }}</div>
        </template>
    </DataTable>
</template>

<style>
/* Estilo para os itens com tooltip (informações extras ao passar o mouse) */
.tooltip-target {
    cursor: pointer; /* Aponta o cursor para indicar que é interativo */
    white-space: nowrap; /* Impede a quebra de linha dentro do texto */
    overflow: hidden; /* Oculta qualquer texto que ultrapasse o limite da área */
    text-overflow: ellipsis; /* Exibe "..." para indicar que o texto foi cortado */
    display: inline-block; /* Permite o controle de largura e altura */
    max-width: 100%; /* Garante que o texto ocupe todo o espaço disponível */
}

/* Estilo para o conteúdo do tooltip */
.v-tooltip {
    max-width: 400px; /* Limita a largura do conteúdo do tooltip */
    white-space: normal; /* Permite quebra de linha no tooltip */
}
</style>
