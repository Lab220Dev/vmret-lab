<script setup>
import { defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';

//  toast para exibir mensagens de erro ou sucesso
const toast = useToast();

// Defina os props
const props = defineProps({
    most: {
        type: Array,
        required: true
    }
});

</script>

<template>

        <div class="header" style="display: flex;">
            <div class="title" style="display: flex; align-items: center;">
                <h5 style="margin-right: 5px;">Itens mais retirados</h5>
            </div>

            <i v-tooltip="'Itens mais retirados nos últimos 6 meses.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray;"></i>
        </div>

        <DataTable :value="props.most" removableSort :rows="5" tableStyle="min-width: 20rem; table-layout: fixed;" responsiveLayout="scroll">
            <Column field="ProdutoNome" header="Item" sortable style="width: 60%;">
                <template #body="{ data }">
                <span class="tooltip-target" v-tooltip="data.ProdutoNome" >{{ data.ProdutoNome }}</span>
            </template></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 15%;"></Column>
            <Column field="NumeroDeRetiradas" header="Quant." sortable style="width: 15%;"></Column>
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
