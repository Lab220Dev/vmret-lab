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

//formato da data
const formatDateTime = (date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : null;
};
</script>

<template>
    <div class="card">
        <div class="header" style="display: flex;">
            <div class="title" style="display: flex; align-items: center;">
                <h5 style="margin-right: 5px;">Itens mais retirados</h5>
            </div>

            <i v-tooltip="'Itens mais retirados nos últimos 6 meses.'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray;"></i>
            
        </div>
        <DataTable :value="props.most" :rows="5" paginator responsiveLayout="scroll">
            <Column field="ProdutoNome" header="Item" sortable style="width: 40%;"></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 30%;"></Column>
            <Column field="TotalQuantidade" header="Quantidade" sortable style="width: 30%;"></Column>
        </DataTable>
    </div>
</template>

<style>
.card {
    position: relative;
    margin-bottom: 0 !important;
    align-content: start;
}
.header {
    margin-bottom: 1em;
}
.grid {
    margin: 0;
    
}
</style>
