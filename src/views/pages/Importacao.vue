<template>
    <div class="card justify-content-center">
        <Stepper v-model:activeStep="active">
            <!-- Passo 1: Seleção e Upload -->
            <StepperPanel>
                <template #header="{ index, clickCallback }">
                    <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                        <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                            <i class="pi pi-list" />
                        </span>
                    </button>
                </template>
                <template #content="{ nextCallback }">
                    <div class="flex flex-column gap-2 mx-auto" style="min-height: 16rem; max-width: 20rem">
                        <div class="text-center mt-3 mb-3 text-xl font-semibold">Selecione o Tipo de Importação</div>
                        <Dropdown v-model="selectedImportType" :options="importTypes" optionLabel="label" optionValue="value" placeholder="Selecione o Tipo de Importação" @change="carregarComponente" />
                        <div v-if="selectedImportType" class="mt-3">
                            <FileUpload mode="basic" chooseLabel="Selecionar Arquivo" @select="handleFileUpload" accept=".csv" />
                        </div>
                        <p v-if="uploadError" class="text-red-500">{{ uploadError }}</p>
                        <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" :disabled="!fileUploaded" />
                    </div>
                </template>
            </StepperPanel>

            <!-- Passo 2: Validação Dinâmica -->
            <StepperPanel>
                <template #header="{ index, clickCallback }">
                    <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                        <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                            <i class="pi pi-cog" />
                        </span>
                    </button>
                </template>
                <template #content="{ prevCallback, nextCallback }">
                    <div>
                        <component v-if="componenteAtual" :is="componenteAtual" :fileData="fileData" @dados-validos="handleDadosValidos" @dados-invalidos="handleDadosInvalidos" @mapeamento-completo="updateValidacaoConcluida" />
                        <div class="flex justify-content-between mt-4">
                            <Button label="Voltar" icon="pi pi-arrow-left" @click="prevCallback" />
                            <Button label="Próximo" icon="pi pi-arrow-right" :disabled="!validacaoConcluida" @click="nextCallback" />
                        </div>
                    </div>
                </template>
            </StepperPanel>

            <!-- Passo 3: Resumo e Edição -->
            <StepperPanel>
                <template #header="{ index, clickCallback }">
                    <button class="bg-transparent border-none inline-flex flex-column gap-2" @click="clickCallback">
                        <span :class="['border-round border-2 w-3rem h-3rem inline-flex align-items-center justify-content-center', { 'bg-primary border-primary': index <= active, 'surface-border': index > active }]">
                            <i class="pi pi-check-circle" />
                        </span>
                    </button>
                </template>
                <template #content="{ prevCallback }">
                    <div class="flex flex-column gap-2 mx-auto" style="min-height: 16rem; max-width: 100%">
                        <!-- Resumo Geral -->
                        <div class="summary">
                            <h3 class="text-center">Resumo da Importação</h3>
                            <div class="summary-cards flex gap-3 justify-content-center">
                                <div class="card summary-card">
                                    <h4>Registros Processados</h4>
                                    <p class="summary-value">{{ dadosValidos.length + dadosInvalidos.length }}</p>
                                </div>
                                <div class="card summary-card">
                                    <h4>Registros Válidos</h4>
                                    <p class="summary-value text-green-500">{{ dadosValidos.length }}</p>
                                </div>
                                <div class="card summary-card">
                                    <h4>Registros Inválidos</h4>
                                    <p class="summary-value text-red-500">{{ dadosInvalidos.length }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Contêiner Gráfico e Tabela -->
                        <div class="chart-table-container">
                            <!-- Gráfico de Pizza -->
                            <div class="chart-container">
                                <Chart type="pie" :data="chartData" style="max-width: 300px; margin: auto" />
                            </div>
                        </div>

                        <div v-if="dadosInvalidos.length">
                            <div class="toggle-container">
                                <span>Editar na Plataforma:</span>
                                <InputSwitch v-model="isEditingEnabled" />
                            </div>

                            <!-- Modo de edição habilitado -->
                            <div v-if="isEditingEnabled">
                                <h4>Registros Inválidos</h4>
                                <DataTable
                                    :value="dadosInvalidos"
                                    editMode="cell"
                                    class="p-datatable-sm"
                                    @cell-edit-complete="onCellEditComplete"
                                    @cell-edit-cancel="onCellEditCancel"
                                    scrollable
                                    scrollHeight="200px"
                                    :virtualScrollerOptions="{ itemSize: 20 }"
                                >
                                    <Column v-for="field in fields" :key="field" :field="field" :header="fieldLabels[field] || field" :style="{ backgroundColor: '#fff5f5' }">
                                        <template #editor="{ data, field }">
                                            <InputText v-model="data[field]" />
                                        </template>
                                    </Column>
                                    <Column field="errors" header="Erro" :body="formatErrors" :style="{ color: 'red' }" />
                                </DataTable>
                                <Button label="Revalidar Dados" icon="pi pi-refresh" class="mt-3" @click="revalidateData" />
                            </div>

                            <!-- Modo de edição desabilitado -->
                            <div v-else>
                                <h4>Registros Inválidos</h4>
                                <DataTable :value="dadosInvalidos" class="p-datatable-sm" scrollable scrollHeight="400px">
                                    <!-- Coluna Nome Completo Congelada -->
                                    <Column field="Nome" header="Nome Completo" frozen alignFrozen="left" style="min-width: 200px; background-color: #f9f9f9; font-weight: bold" />

                                    <!-- Outras Colunas -->
                                    <Column v-for="field in fields.filter((f) => f !== 'Nome')" :key="field" :field="field" :header="fieldLabels[field]" style="min-width: 150px" />

                                    <!-- Coluna de Erros -->
                                    <Column field="errors" header="Erro" :body="formatErrors" style="min-width: 200px; color: red" />
                                </DataTable>
                                <Button label="Baixar CSV com Erros" icon="pi pi-download" class="mt-3 p-button-secondary" @click="downloadErrors" />
                                <FileUpload mode="basic" chooseLabel="Reenviar Arquivo Corrigido" @select="handleFileReupload" accept=".csv" />
                            </div>
                        </div>

                        <!-- Mensagem quando não houver erros -->
                        <div v-else>
                            <p class="text-center text-green-500 mt-4">Todos os registros foram validados com sucesso!</p>
                        </div>
                    </div>
                    <!-- Botão de Envio -->
                    <div class="flex justify-content-end mt-4">
                        <Button label="Enviar Dados" icon="pi pi-send" class="p-button-success" @click="submitData" />
                    </div>
                    <!-- Botão Voltar -->
                    <div class="flex pt-4 justify-content-start">
                        <Button label="Voltar" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
                    </div>
                </template>
            </StepperPanel>
        </Stepper>
    </div>
</template>

<script setup>
import { ref, shallowRef, defineAsyncComponent, computed, watch } from 'vue';
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';

import { normalizeDate, generateCSV, downloadCSV } from '@/helpers/HelperUtils';
import { processFileUpload, processFileReupload, revalidateData,formatErrors,exportInvalidData } from '@/helpers/HelperImportacao.js';
import { validateRow, getFieldLabels } from '@/helpers/HelperImportacao.js';
// Estados reativos
const active = ref(0);
const selectedImportType = ref(null);
const fileUploaded = ref(false);
const fileData = ref([]);
const dadosValidos = ref([]);
const dadosInvalidos = ref([]);
const uploadError = ref(null);
const componenteAtual = shallowRef(null);
const validacaoConcluida = ref(false);
const isEditingEnabled = ref(false);
const fields = computed(() => Object.keys(fieldLabels.value));
const fieldLabels = ref({});

// Carregar componente dinamicamente
const carregarComponente = () => {
    switch (selectedImportType.value) {
        case 'funcionarios':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/ValidacaoFuncionario.vue'));
            break;
        case 'produtos':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/ValidacaoProduto.vue'));
            break;
        case 'centro_custo':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/ValidacaoCdc.vue'));
            break;
        default:
            componenteAtual.value = null;
    }
    fieldLabels.value = getFieldLabels(selectedImportType.value);
};
const updateValidacaoConcluida = (estado) => {
    validacaoConcluida.value = estado;
};
// Tipos de importação
const importTypes = ref([
    { label: 'Funcionário', value: 'funcionarios' },
    { label: 'Produto', value: 'produtos' },
    { label: 'Centro de Custo', value: 'centro_custo' }
]);
const downloadErrors = () => {
    exportInvalidData(fields.value, dadosInvalidos.value);
};
// Eventos
const handleFileUpload = (event) => {
    processFileUpload(
        event.files[0],
        (data) => {
            fileData.value = data;
            fileUploaded.value = true;
        },
        (error) => {
            uploadError.value = error;
        }
    );
};
// Processar o reupload do arquivo corrigido
const handleFileReupload = (event) => {
    processFileReupload(
        event.files[0],
        (data) => {
            const { validData, remainingInvalidData } = revalidateData(data, validateRow, selectedImportType.value);
            dadosValidos.value.push(...validData);
            dadosInvalidos.value = remainingInvalidData;
        },
        (error) => console.error(error)
    );
};

const handleDadosValidos = (dados) => {
    dadosValidos.value = dados;
};

const handleDadosInvalidos = (dados) => {
    dadosInvalidos.value = dados;
};
// Dados do Gráfico
const chartData = computed(() => ({
    labels: ['Válidos', 'Inválidos'],
    datasets: [
        {
            data: [dadosValidos.value.length, dadosInvalidos.value.length],
            backgroundColor: ['#4caf50', '#f44336']
        }
    ]
}));

const submitData = () => {
    // Enviar dados válidos para o backend
    console.log('Enviando dados válidos:', validData.value);
};
// Função chamada quando a edição é concluída
const onCellEditComplete = (event) => {
    const { data, newValue, field } = event;
    data[field] = newValue;
    const errors = validateRow(data, selectedImportType.value); // Revalida a linha inteira após edição
    data.errors = errors;

    if (Object.keys(errors).length === 0) {
        // Se não houver erros, mover para os dados válidos
        dadosValidos.value.push(data);
        dadosInvalidos.value = dadosInvalidos.value.filter((row) => row !== data);
    }
};
// Função chamada ao cancelar a edição
const onCellEditCancel = (event) => {
    console.log('Edição cancelada para:', event);
};
watch(selectedImportType, () => {
    fieldLabels.value = getFieldLabels(selectedImportType.value);
});
</script>

<style scoped>
.card {
    padding: 2rem;
}

.p-stepper {
    flex-basis: 40rem;
}

.columns-mapping {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.column-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.expected-column {
    font-weight: bold;
    width: 30%;
}

.text-red-500 {
    color: red;
}
.summary {
    margin-bottom: 2rem;
}

.summary-cards {
    display: flex;
    gap: 1rem;
}

.summary-card {
    text-align: center;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.summary-value {
    font-size: 1.5rem;
    font-weight: bold;
}

.invalid-table,
.valid-table {
    margin-top: 2rem;
}

.p-datatable-sm {
    font-size: 0.875rem;
}
.chart-table-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
    margin-top: 2rem;
}

.chart-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.invalid-table {
    flex: 2;
}
</style>
