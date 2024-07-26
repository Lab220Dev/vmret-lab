<script setup>
import { ref, onMounted } from 'vue';

const relatorio = ref({
    dm: ''
});
const formatedDMOptions = ref([]);
const dms = ref([]);

const mockData = [
    { SKU: 1, produto: 'Produto 1', posicao: 'Posição 1', quantidade_atual: 'QA1', quantidade_minima: 'QM1', capacidade: 'CAP1' },
    { SKU: 2, produto: 'Produto 2', posicao: 'Posição 2', quantidade_atual: 'QA2', quantidade_minima: 'QM2', capacidade: 'CAP2' },
    { SKU: 3, produto: 'Produto 3', posicao: 'Posição 3', quantidade_atual: 'QA3', quantidade_minima: 'QM3', capacidade: 'CAP3' },
    { SKU: 4, produto: 'Produto 4', posicao: 'Posição 4', quantidade_atual: 'QA4', quantidade_minima: 'QM4', capacidade: 'CAP4' },
    { SKU: 5, produto: 'Produto 5', posicao: 'Posição 5', quantidade_atual: 'QA5', quantidade_minima: 'QM5', capacidade: 'CAP1' },
    { SKU: 6, produto: 'Produto 6', posicao: 'Posição 6', quantidade_atual: 'QA6', quantidade_minima: 'QM6', capacidade: 'CAP1' },
    { SKU: 7, produto: 'Produto 7', posicao: 'Posição 7', quantidade_atual: 'QA7', quantidade_minima: 'QM7', capacidade: 'CAP1' },
    { SKU: 8, produto: 'Produto 8', posicao: 'Posição 8', quantidade_atual: 'QA8', quantidade_minima: 'QM8', capacidade: 'CAP1' },
    { SKU: 9, produto: 'Produto 9', posicao: 'Posição 9', quantidade_atual: 'QA9', quantidade_minima: 'QM9', capacidade: 'CAP1' },
    { SKU: 10, produto: 'Produto 10', posicao: 'Posição 10', quantidade_atual: 'QA10', quantidade_minima: 'QM10', capacidade: 'CAP10' }
];

onMounted(() => {
    dms.value = mockData;
});
</script>

<template>
    <div class="card vh ">
        <h5 class="my-4 text-2xl">Estoques da DM</h5>
        <div class="my-5 mt-3">
            <Dropdown id="dm" v-model="relatorio.dm" :options="formatedDMOptions" optionLabel="label" optionValue="value" placeholder="Selecione a DM" />
        </div>

        <DataTable :value="dms" stripedRows showGridlines paginator :rows="10" dataKey="SKU" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
            <Column field="SKU" header="SKU"></Column>
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

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
