<script setup>
import { defineProps } from 'vue'; // defineProps para declarar propriedades
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import { format } from 'date-fns'; // Função para formatar a data
import { useI18n } from 'vue-i18n';
const toast = useToast(); //toast para exibir mensagens de erro ou sucesso
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
 * @property {Array<most>} most - Lista de produtos mais retirados, contendo a identificação da máquina, SKU, descrição e data/hora.
 */
const props = defineProps({//defineProps é usado para definir as propriedades do componente
    low: {//low é um array de objetos
        type: Array,//define que low é um array
        required: true//define que low é obrigatório
    }
});
</script>

<template>
    <div class="header" style="display: flex">
        <div class="title" style="display: flex; align-items: center">
            <h5 style="margin-right: 5px">{{ $t('low_inventory_items') }}</h5>
        </div>
    </div>
    <DataTable :value="props.low" removableSort :rows="5" size="normal" columnResizeMode="fit" responsiveLayout="scroll" class="mt-3">
        <Column field="sku" style="width: 10%" :header="t('SKU')" sortable>
            <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.sku">{{ data.sku }}</span>
            </template>
        </Column>
        <Column field="quantidade" style="width: 10%; text-align: center" :header="t('quantity')" sortable></Column>

        <Column field="nome" :header="t('item')" sortable>
            <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.nome">{{ data.nome }}</span>
            </template>
        </Column>

        <template #empty>
            <div class="empty-message" style="text-align: center; padding: 20px; color: gray">{{ $t('estoque_sem_itens') }}</div>
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