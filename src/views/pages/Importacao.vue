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
                                    <!-- A tabela exibe os dados provenientes de 'dadosInvalidos', com a possibilidade de edição de células. -->
                                    <!-- A classe CSS 'p-datatable-sm' aplica um estilo compacto à tabela. -->
                                    <!-- Ao completar a edição de uma célula, a função 'onCellEditComplete' é chamada, e ao cancelar a edição, a função 'onCellEditCancel' é acionada. -->
                                    <!-- A tabela possui rolagem ativada e um limite de altura de 200px, permitindo que os dados além dessa altura sejam rolados. -->
                                    <!-- A rolagem virtual (lazy loading) é ativada, carregando dados conforme necessário, com um item tendo altura de 20px. -->

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
                                    <!-- A tabela exibe os dados provenientes de 'dadosInvalidos' -->
                                    <!-- A classe 'p-datatable-sm' aplica um estilo compacto à tabela -->
                                    <!-- A rolagem é habilitada, permitindo que a tabela seja rolada quando o conteúdo exceder a altura definida -->
                                    <!-- A altura da área visível da tabela é definida como 400px, ativando a rolagem para os dados além desse limite -->

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
/**
 * Importação de módulos necessários para o funcionamento da aplicação.
 */
import { ref, shallowRef, defineAsyncComponent, computed, watch } from 'vue'; // Funções do Vue para criar reatividade e componentes dinâmicos
import Stepper from 'primevue/stepper'; // Componente para exibir etapas de progresso
import StepperPanel from 'primevue/stepperpanel'; // Painel de cada etapa do stepper
import Dropdown from 'primevue/dropdown'; // Componente de Dropdown (lista suspensa)
import FileUpload from 'primevue/fileupload'; // Componente de upload de arquivos
import Button from 'primevue/button'; // Componente de botão
import Chart from 'primevue/chart'; // Componente para renderizar gráficos
import DataTable from 'primevue/datatable'; // Componente para exibir tabelas de dados

import { normalizeDateTime, generateCSV, downloadCSV } from '@/helpers/HelperUtils'; // Funções auxiliares para normalização de data, geração e download de CSV
import { processFileUpload, processFileReupload, revalidateData, formatErrors, exportInvalidData } from '@/helpers/HelperImportacao.js'; // Funções para processamento de upload e reupload de arquivos
import { validateRow, getFieldLabels } from '@/helpers/HelperImportacao.js'; // Funções para validação de dados e obtenção de rótulos de campos

// Estados reativos definidos com ref, que armazenam e reagem a mudanças no estado da aplicação
/**
 * @type {import('vue').Ref<number>}
 * Armazena o índice da etapa ativa no componente Stepper
 */
const active = ref(0);

/**
 * @type {import('vue').Ref<string | null>}
 * Armazena o tipo de importação selecionado (funcionarios, produtos, centro_custo)
 */
const selectedImportType = ref(null);

/**
 * @type {import('vue').Ref<boolean>}
 * Indica se o arquivo foi carregado com sucesso
 */
const fileUploaded = ref(false);

/**
 * @type {import('vue').Ref<Array>}
 * Armazena os dados do arquivo carregado
 */
const fileData = ref([]);

/**
 * @type {import('vue').Ref<Array>}
 * Dados válidos após a validação
 */
const dadosValidos = ref([]);

/**
 * @type {import('vue').Ref<Array>}
 * Dados inválidos após a validação
 */
const dadosInvalidos = ref([]);

/**
 * @type {import('vue').Ref<string | null>}
 * Mensagem de erro no upload de arquivo
 */
const uploadError = ref(null);

/**
 * @type {import('vue').ShallowRef<any>}
 * Componente atualmente carregado com base no tipo de importação selecionado
 */
const componenteAtual = shallowRef(null);

/**
 * @type {import('vue').Ref<boolean>}
 * Indica se a validação foi concluída
 */
const validacaoConcluida = ref(false);

/**
 * @type {import('vue').Ref<boolean>}
 * Controla se a edição de células de dados está habilitada
 */
const isEditingEnabled = ref(false);

/**
 * @type {import('vue').ComputedRef<string[]>}
 * Campos disponíveis para a validação com base no tipo de importação selecionado
 */
const fields = computed(() => Object.keys(fieldLabels.value));

/**
 * @type {import('vue').Ref<Object>}
 * Rótulos dos campos para exibição na UI
 */
const fieldLabels = ref({});

/**
 * Função para carregar o componente dinamicamente baseado no tipo de importação selecionado.
 * A função será chamada sempre que o tipo de importação mudar.
 *
 * @returns {void}
 */
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
    // Atualiza os rótulos de campos com base no tipo de importação selecionado
    fieldLabels.value = getFieldLabels(selectedImportType.value);
};

/**
 * Atualiza o estado de "validacaoConcluida" com o valor passado.
 * Essa função pode ser chamada para indicar se a validação dos dados foi concluída.
 *
 * @param {boolean} estado - Estado da validação (verdadeiro ou falso)
 * @returns {void}
 */
const updateValidacaoConcluida = (estado) => {
    validacaoConcluida.value = estado;
};

/**
 * Tipos de importação disponíveis no sistema.
 * Cada tipo de importação possui um rótulo legível e um valor associado.
 *
 * @type {import('vue').Ref<Array<{label: string, value: string}>>}
 */
const importTypes = ref([
    { label: 'Funcionário', value: 'funcionarios' },
    { label: 'Produto', value: 'produtos' },
    { label: 'Centro de Custo', value: 'centro_custo' }
]);

/**
 * Função para exportar os dados inválidos para um arquivo CSV.
 * Utiliza a função `exportInvalidData` para gerar o arquivo com os dados inválidos.
 *
 * @returns {void}
 */
const downloadErrors = () => {
    exportInvalidData(fields.value, dadosInvalidos.value);
};

/**
 * Função chamada quando um arquivo é carregado pelo componente FileUpload.
 *
 * @param {Object} event - Evento disparado pelo componente FileUpload
 * @param {Array} event.files - Arquivos carregados pelo usuário
 * @returns {void}
 */
const handleFileUpload = (event) => {
    processFileUpload(
        event.files[0], // Seleciona o primeiro arquivo carregado
        (data) => {
            // Sucesso no upload: atualiza o estado com os dados do arquivo
            fileData.value = data;
            fileUploaded.value = true;
        },
        (error) => {
            // Erro no upload: exibe a mensagem de erro
            uploadError.value = error;
        }
    );
};

/**
 * Função chamada quando um arquivo é re-carregado (upload corrigido) pelo componente FileUpload.
 * Reprocessa os dados e valida novamente.
 *
 * @param {Object} event - Evento disparado pelo componente FileUpload
 * @param {Array} event.files - Arquivos re-carregados
 * @returns {void}
 */
const handleFileReupload = (event) => {
    processFileReupload(
        event.files[0], // Seleciona o primeiro arquivo carregado
        (data) => {
            // Após o reupload, valida os dados
            const { validData, remainingInvalidData } = revalidateData(data, validateRow, selectedImportType.value);
            dadosValidos.value.push(...validData);
            dadosInvalidos.value = remainingInvalidData;
        },
        (error) => console.error(error) // Log de erro caso algo falhe no processo
    );
};

/**
 * Função chamada para atualizar os dados válidos.
 *
 * @param {Array} dados - Dados válidos após a validação
 * @returns {void}
 */
const handleDadosValidos = (dados) => {
    dadosValidos.value = dados;
};

/**
 * Função chamada para atualizar os dados inválidos.
 *
 * @param {Array} dados - Dados inválidos após a validação
 * @returns {void}
 */
const handleDadosInvalidos = (dados) => {
    dadosInvalidos.value = dados;
};

/**
 * Dados para o gráfico que exibe a quantidade de dados válidos e inválidos.
 * A cor do gráfico é determinada pelos valores em 'backgroundColor'.
 *
 * @returns {import('vue').ComputedRef<Object>} Dados para o gráfico
 */
const chartData = computed(() => ({
    labels: ['Válidos', 'Inválidos'],
    datasets: [
        {
            data: [dadosValidos.value.length, dadosInvalidos.value.length],
            backgroundColor: ['#4caf50', '#f44336'] // Verde para válidos e vermelho para inválidos
        }
    ]
}));

/**
 * Função chamada para submeter os dados válidos ao backend.
 *
 * @returns {void}
 */
const submitData = () => {
    console.log('Enviando dados válidos:', validData.value);
};

/**
 * Função chamada quando a edição de uma célula de dados é concluída.
 * Após a edição, a linha é revalidada e movida para a lista de dados válidos ou inválidos.
 *
 * @param {Object} event - Evento disparado após a edição de uma célula
 * @param {Object} event.data - Dados da linha editada
 * @param {any} event.newValue - Novo valor inserido na célula
 * @param {string} event.field - Nome do campo editado
 * @returns {void}
 */
const onCellEditComplete = (event) => {
    const { data, newValue, field } = event;
    data[field] = newValue; // Atualiza o valor no campo editado
    const errors = validateRow(data, selectedImportType.value); // Revalida a linha inteira após edição
    data.errors = errors; // Atribui erros encontrados à linha

    if (Object.keys(errors).length === 0) {
        // Se não houver erros, move para a lista de dados válidos
        dadosValidos.value.push(data);
        dadosInvalidos.value = dadosInvalidos.value.filter((row) => row !== data);
    }
};

/**
 * Função chamada quando a edição de uma célula é cancelada.
 *
 * @param {Object} event - Evento disparado quando a edição é cancelada
 * @returns {void}
 */
const onCellEditCancel = (event) => {
    console.log('Edição cancelada para:', event);
};

/**
 * Observador para monitorar mudanças no tipo de importação selecionado.
 * Quando o tipo de importação muda, os rótulos dos campos são atualizados.
 */
watch(selectedImportType, () => {
    fieldLabels.value = getFieldLabels(selectedImportType.value); // Atualiza os rótulos dos campos
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
