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

        <DataTable :value="props.most" :rows="5" responsiveLayout="scroll">
            <Column field="ProdutoNome" header="Item" sortable style="width: 40%;"></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 30%;"></Column>
            <Column field="NumeroDeRetiradas" header="Quantidade" sortable style="width: 30%;"></Column>
        </DataTable>
 
</template>

<style>
</style>
