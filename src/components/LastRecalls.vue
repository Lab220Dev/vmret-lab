<script setup>
import { defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

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
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};
</script>

<template>
    <div class="card">
        <h5>Últimas Retiradas</h5>
        <DataTable :value="props.products" :rows="5" paginator responsiveLayout="scroll">
            <Column field="id_dm" header="Máquina" sortable style="width: 25%"></Column>
            <Column field="ProdutoSKU" header="SKU" sortable style="width: 15%"></Column>
            <Column field="ProdutoDescricao" header="Descrição" sortable style="width: 30%"></Column>
            <Column field="Dia" header="Data e Hora" sortable style="width: 30%">
                <template #body="slotProps">
                    {{ toISODate(slotProps.data.Dia) }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>
