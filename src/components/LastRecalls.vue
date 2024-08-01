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
        <DataTable :value="props.products" :rows="5" responsiveLayout="scroll">
            <Column field="id_dm" header="Máquina" sortable style="width: 20%"></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 15%"></Column>
            <Column field="ProdutoDescricao" header="Descrição" sortable style="width: 30%"></Column>
            <Column field="Dia" header="Data e Hora" sortable style="width: 35%">
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.Dia) }}
                </template>
            </Column>
        </DataTable>
</template>
<style>

</style>