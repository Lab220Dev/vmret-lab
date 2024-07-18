<script setup>
import { ref } from 'vue';

const relatorio = ref({
    dm: ''
})
const formatedDMOptions = ref([]);
const dms = ref([]);
</script>

<template>
    <div class="card">
        <div class="mb-5">
            <Dropdown id="dm" v-model="relatorio.dm" :options="formatedDMOptions" optionLabel="label"
                optionValue="value" placeholder="Selecione a DM" />
        </div>

        <DataTable :value="dms" stripedRows showGridlines paginator :rows="10" dataKey="id" filterDisplay="row"
            :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <Column field="sku" header="SKU"></Column>
            <Column field="produto" header="Produto"></Column>
            <Column field="posicao" header="Posição"></Column>
            <Column field="quantidade_atual" header="Quantidade Atual"></Column>
            <Column field="quantidade_minima" header="Quantidade Mínima"></Column>
            <Column field="capacidade" header="Capacidade"></Column>
        </DataTable>
    </div>

</template>
<style>
.card {
    overflow-x: auto;
}
</style>