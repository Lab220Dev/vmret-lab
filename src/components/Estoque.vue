<template>
    <div class="card vh">
        <h5 class="my-6 ml-2 text-2xl">Estoque da DM</h5>
        <div class="my-2">
            <label for="dm" class="ml-2">DM:</label>
            <Dropdown
                id="dm"
                style="width: 20%"
                v-model="selectedDM"
                :options="props.dms"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos"
                class="mb-2 ml-2"
            />
        </div>
        <LoadingSpinner v-if="loading" />
        <DataTable
            class="mt-3"
            :value="filteredEstoque"
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            selectionMode="single"
            :metaKeySelection="false"
            :sortOrder="1"
            :sortField="'Posicao'"
            :tableStyle="{ width: '100%' }">

            <template #empty>
                {{ emptyMessage }}
            </template>

            <Column field="sku" class="table-cell" sortable header="SKU" />
            <Column field="nome" sortable header="Produto">
                <template #body="{ data }">
                    <span v-tooltip="data.nome">{{ data.nome }}</span>
                </template>
            </Column>
            <Column field="Posicao" sortable style="text-align: center" header="Posição">
                <template #body="{ data }">
                    <span
                        v-tooltip="data.modelo === '2018' ? 'Placa / Mola ' : data.modelo === '2023' ? 'Andar / Posição' : 'Placa / Motor'"
                    >
                        {{ data.Posicao }}
                    </span>
                </template>
            </Column>
            <Column field="quantidade" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Atual'">Quant. Atual</span>
                </template>
            </Column>
            <Column field="quantidademinima" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Mínima'">Quant. Mín.</span>
                </template>
            </Column>
            <Column field="capacidade" sortable style="text-align: center" header="Capacidade" />
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const relatorio = ref({
    id_dm: ''
});

const props = defineProps({
    estoque: {
        type: Array,
        required: true
    },
    dms: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        required: true
    }
});

const filters = ref({
    global: { value: '' }
});

const emptyMessage = ref('Nenhum item encontrado.');
const loading = ref(false);
const selectedDM = ref(null);
const filteredEstoque = computed(() => {
    if (!selectedDM.value) {
        emptyMessage.value = 'Nenhum item encontrado.';
        return props.estoque; 
    }
    const selectedDMLabel = props.dms.find((dm) => dm.value === selectedDM.value)?.label || 'DM desconhecida';
    const resultadoFiltrado = props.estoque.filter((item) => item.ID_DM === selectedDM.value);
    if (resultadoFiltrado.length === 0) {
        emptyMessage.value = `Nenhum item encontrado para a DM selecionada (${selectedDMLabel}).`;
    } else {
        emptyMessage.value = '';
    }
    return resultadoFiltrado;
});

</script>

<style>
.card {
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: white;
}
</style>
