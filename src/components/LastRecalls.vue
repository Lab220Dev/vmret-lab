<script setup>
import { defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';

//  toast para exibir mensagens de erro ou sucesso
const toast = useToast();

// Defina os props
const props = defineProps({
    products: {
        type: Array,
        required: true
    }
});

//formato da data
const formatDateTime = (date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : null;
};
</script>

<template>
        <div class="header" style="display: flex;">
            <div class="title" style="display: flex; align-items: center;">
                <h5 style="margin-right: 5px;">Últimas retiradas</h5>
            </div>

            <i v-tooltip="'Limitado aos últimos 5 itens retirados.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray;"></i>
            
        </div>
        <DataTable :value="props.products" :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" removableSort responsiveLayout="scroll">
            <Column field="Identificacao" header="Máquina"  sortable style="width: 20%">
                <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.Identificacao" >{{ data.Identificacao }}</span>
            </template></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 15%"></Column>
            <Column field="ProdutoDescricao" header="Descrição" sortable style="width: 35%">
                <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.ProdutoDescricao" >{{ data.ProdutoDescricao }}</span>
            </template></Column>
            <Column field="Dia" header="Data e Hora" sortable style="width: 30%">
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.Dia) }}
                </template>
            </Column>
        </DataTable>
</template>
<style>

.tooltip-target {
    cursor: pointer;
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    display: inline-block; 
    max-width: 100%;
}

.v-tooltip {
    max-width: 400px; 
    white-space: normal; 
}
</style>