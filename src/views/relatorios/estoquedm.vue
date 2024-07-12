<script setup>
import { ref } from 'vue';

const relatorio = ref({
    vm: ''
})
const formatedVMOptions = ref([]);
const dms = ref([]);
</script>

<template>
    <div class="card">
        <div class="mb-5">
            <Dropdown id="vm" v-model="relatorio.vm" :options="formatedVMOptions" optionLabel="label"
                optionValue="value" placeholder="Seleciona A VM:" />
        </div>

        <DataTable :value="dms" stripedRows showGridlines paginator :rows="10" dataKey="id" filterDisplay="row"
            :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <Column field="sku" header="SKU"></Column>
            <Column field="produto" header="Produto"></Column>
            <Column field="posicao" header="Posição"></Column>
            <Column field="quantidade_atual" header="Quantidade Atual"></Column>
            <Column field="quantidade_minima" header="Quantidade Minima"></Column>
            <Column field="capacidade" header="Capacidade"></Column>
        </DataTable>
    </div>

</template>
<style>
.card {
    overflow-x: auto;
}
</style>