<template>
    <div class="card justify-content-center">
        <Stepper v-model:activeStep="active" value="1" linear>
            <StepList>
                <Step value="1"> </Step>
                <Step value="2"></Step>
                <Step value="3"></Step>
            </StepList>
            <!-- Passo 1: Seleção e Upload -->
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1">
                    <div class="flex flex-column gap-2 mx-auto" style="min-height: 16rem; max-width: 20rem">
                        <div class="text-center mt-3 mb-0 text-xl font-semibold">Selecione o Tipo de Importação</div>
                        <hr class="mt-0 mb-4" />
                        <Select v-model="selectedImportType" :options="importTypes" optionLabel="label" optionValue="value" placeholder="Selecione o Tipo de Importação" @change="carregarComponente" />
                        <div v-if="selectedImportType" class="mt-3 card border-1 upload">
                            <FileUpload mode="basic" chooseLabel="Selecionar Arquivo" @select="handleFileUpload" accept=".csv" />
                        </div>
                        <p v-if="uploadError" class="!text-red-500">{{ uploadError }}</p>
                        <Button label="Próximo" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" :disabled="!fileUploaded" />
                    </div>
                </StepPanel>

                <!-- Passo 2: Validação Dinâmica -->

                <StepPanel v-slot="{ activateCallback }" value="2">
                    <div>
                        <component v-if="componenteAtual" :is="componenteAtual" :fileData="fileData" @dados-validos="handleDadosValidos" @dados-invalidos="handleDadosInvalidos" @mapeamento-completo="updateValidacaoConcluida" />
                        <div class="flex justify-content-between mt-4">
                            <Button label="Voltar" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                            <Button label="Próximo" icon="pi pi-arrow-right" :disabled="!validacaoConcluida" @click="activateCallback('3')" />
                        </div>
                    </div>
                </StepPanel>

                <!-- Passo 3: Resumo e Edição -->
                <StepPanel v-slot="{ activateCallback }" value="3">
                    <div class="flex flex-column gap-2 mx-0" style="min-height: 16rem; max-width: 100%">
                        <!-- Resumo Geral -->
                        <div class="grid col-12 mx-0">
                            <div class="grid col-12 gap-3 justify-content-center">
                                <h3 class="text-center">Resumo da Importação</h3>
                                <Divider class="mt-0 mb-4" />
                            </div>
                            <hr class="mt-0 mb-4" />
                            <div class="grid col-12 gap-3 justify-content-center">
                                <div class="col-3 card text-center nowrap" style="height: 150px">
                                    <h4 class="nowrap">Registros Processados</h4>
                                    <p class="font-bold text-2xl">{{ dadosValidos.length + dadosInvalidos.length }}</p>
                                </div>
                                <div class="col-3 card text-center" style="height: 150px">
                                    <h4>Registros Válidos</h4>
                                    <p class="text-green-500 font-bold text-2xl">{{ dadosValidos.length }}</p>
                                </div>
                                <div class="col-3 card text-center" style="height: 150px">
                                    <h4>Registros Inválidos</h4>
                                    <p class="red-500 font-bold text-2xl">{{ dadosInvalidos.length }}</p>
                                </div>
                            </div>
                        </div>
                        <!-- Contêiner Gráfico e Tabela -->
                        <div>
                            <!-- Gráfico de Pizza -->
                            <div v-if="dadosValidos.length || dadosInvalidos.length">
                                <Chart type="pie" :data="chartData" style="max-width: 300px; margin: auto" />
                            </div>
                            <p v-else class="text-center">Carregando dados do gráfico...</p>
                        </div>

                        <div v-if="dadosInvalidos.length">
                            <div class="toggle-container flex justify-content-end align-items-center my-5">
                                <span>Editar na Plataforma:</span>
                                <ToggleSwitch class="ml-3" v-model="isEditingEnabled" />
                            </div>
                            <!-- Modo de edição habilitado -->
                            <div v-if="isEditingEnabled">
                                <h4 class="font-normal">Registros Inválidos</h4>
                                <hr class="mt-0 pt-0"/>
                                <DataTable :value="dadosInvalidos" size="small" editMode="cell" showGridlines  @cell-edit-complete="onCellEditComplete" @cell-edit-cancel="onCellEditCancel" style="max-width: 70vw;">
                                    <!-- A tabela exibe os dados provenientes de 'dadosInvalidos', com a possibilidade de edição de células. -->
                                    <!-- A classe CSS 'p-datatable-sm' aplica um estilo compacto à tabela. -->
                                    <!-- Ao completar a edição de uma célula, a função 'onCellEditComplete' é chamada, e ao cancelar a edição, a função 'onCellEditCancel' é acionada. -->
                                    <!-- A tabela possui rolagem ativada e um limite de altura de 200px, permitindo que os dados além dessa altura sejam rolados. -->
                                    <!-- A rolagem virtual (lazy loading) é ativada, carregando dados conforme necessário, com um item tendo altura de 20px. -->
                                    <!-- Coluna Nome Completo Congelada -->
                                    <Column field="Nome" header="Nome Completo" style="min-width: 150px; font-weight: bold; position: sticky; left: 0; z-index: 1; background-color: #f5f5f5" />
                                    <Column v-for="(field, index) in fields.filter((f) => f !== 'Nome')" :key="`column-${index}`" :field="field" :header="fieldLabels[field] || field" class="table-cell">
                                        <template #body="{ data, field }">
                                            <span :style="{ color: data.errors && data.errors[field] ? 'red' : 'inherit'}">
                                                {{ data[field] }}
                                            </span>
                                        </template>
                                        <template #editor="{ data, field }">
                                            <InputText v-model="data[field]" />
                                        </template>
                                    </Column>
                                </DataTable>
                                <div class="flex justify-content-between mt-4 border-primary-500 p-4">
                                    <Button label="Revalidar Dados" icon="pi pi-refresh" @click="revalidateData" />
                                </div>
                            </div>
                            <!-- Modo de edição desabilitado -->
                            <div v-else>
                                <h4>Registros Inválidos</h4>
                                <hr class="mt-0 pt-0"/>
                                <DataTable :value="dadosInvalidos" size="small" scrollable showGridlines  style="max-width: 70vw;">
                                    <!-- A tabela exibe os dados provenientes de 'dadosInvalidos' -->
                                    <!-- A classe 'p-datatable-sm' aplica um estilo compacto à tabela -->
                                    <!-- A rolagem é habilitada, permitindo que a tabela seja rolada quando o conteúdo exceder a altura definida -->
                                    <!-- A altura da área visível da tabela é definida como 400px, ativando a rolagem para os dados além desse limite -->
                                    <!-- Coluna Nome Completo Congelada -->
                                    <Column field="Nome" header="Nome Completo" frozen alignFrozen="left" style="min-width: 150px; font-weight: bold;  background-color: #f5f5f5" />
                                    <!-- Outras Colunas -->
                                    <Column v-for="(field, index) in fields.filter((f) => f !== 'Nome')" :key="`column-${index}`" :field="field" :header="fieldLabels[field] || field" class="table-cell">
                                        <template #body="{ data, field }">
                                            <span v-tooltip.top="data.errors && data.errors[field]" :style="{ color: data.errors && data.errors[field] ? 'red' : 'inherit' }">
                                                {{ data[field] }}
                                            </span>
                                        </template>
                                    </Column>
                                </DataTable>
                                <div class="flex justify-content-between mt-4 border-primary-500 p-4">
                                    <Button label="Baixar CSV com Erros" icon="pi pi-download" class="p-button-info" @click="downloadErrors" />
                                    <div class="flex align-items-center">
                                        <FileUpload mode="basic" chooseLabel="Reenviar Arquivo Corrigido" @select="handleFileReupload" accept=".csv" class="file-upload-left" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Mensagem quando não houver erros -->
                        <div v-else>
                            <p class="text-center text-green-500 mt-4">Todos os registros foram validados com sucesso!</p>
                        </div>
                    </div>
                    <div class="flex justify-content-between mt-4">
                        <!-- Botão Voltar -->
                        <div class="mt-4">
                            <Button label="Voltar" class="w-10rem" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                        </div>
                        <!-- Botão de Envio -->
                        <div class="mt-4">
                            <Button label="Enviar Dados" icon="pi pi-send" class="p-button-success w-10rem" @click="submitData()" />
                        </div>
                    </div>
                    <Dialog header="Envio Concluído" v-model:visible="enviadoSucesso" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                        <p class="text-center">Os dados foram enviados com sucesso!</p>
                        <template #footer>
                            <Button
                                :label="$t('ok')"
                                icon="pi pi-check"
                                @click="
                                    () => {
                                        enviadoSucesso = false;
                                        activateCallback('1');
                                    }
                                "
                                class="p-button-text"
                            />
                        </template>
                    </Dialog>
                </StepPanel>
            </StepPanels>
        </Stepper>
        <!--diálogo de sucesso -->
    </div>
    <LoadingSpinner v-if="loading" />
</template>

<script setup>
/**
 * Importação de módulos necessários para o funcionamento da aplicação.
 */
import { ref, shallowRef, defineAsyncComponent, computed, watch } from 'vue'; // Funções do Vue para criar reatividade e componentes dinâmicos
import Tooltip from 'primevue/tooltip'; // Importa a diretiva Tooltip do PrimeVue
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Select from 'primevue/select'; // Componente de Select (lista suspensa)
import FileUpload from 'primevue/fileupload'; // Componente de upload de arquivos
import Button from 'primevue/button'; // Componente de botão
import Chart from 'primevue/chart'; // Componente para renderizar gráficos
import DataTable from 'primevue/datatable'; // Componente para exibir tabelas de dados
import ImportService from '@/Services/ImportService.js';
import { processFileUpload, processFileReupload, revalidateData, formatErrors, exportInvalidData } from '@/helpers/HelperImportacao.js'; // Funções para processamento de upload e reupload de arquivos
import { validateRow, getFieldLabels, resetImportacao } from '@/helpers/HelperImportacao.js'; // Funções para validação de dados e obtenção de rótulos de campos
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de loading spinner para exibição enquanto a página está carregando
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const toast = useToast(); //toast para exibir mensagens de erro ou sucesso

// Estados reativos definidos com ref, que armazenam e reagem a mudanças no estado da aplicação
/**
 * @type {import('vue').Ref<number>}
 * Armazena o índice da etapa ativa no componente Stepper
 */
const active = ref('0');
const loading = ref(false); // Ref que controla o estado de carregamento

/**
 * @type {import('vue').Ref<string | null>}
 * Armazena o tipo de importação selecionado (funcionarios, produtos, centro_custo)
 */
const selectedImportType = ref(null);

/**
 * @type {import('vue').Ref<boolean>}
 * Indica se o arquivo foi carregado com sucesso
 */
const fileUploaded = ref(false); // Indicates whether a file has been successfully uploaded

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
        case 'planta':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/ValidacaoPlanta.vue'));
            break;
        case 'setor':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/ValidacaoSetor.vue'));
            break;
        case 'funcao':
            componenteAtual.value = defineAsyncComponent(() => import('@/components/Validacaofuncao.vue'));
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
    { label: 'Planta', value: 'planta' },
    { label: 'Setor', value: 'setor' },
    { label: 'Função', value: 'funcao' },
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
            fileUploaded.value = true; // Set to true when the file is successfully uploaded
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

const submitData = async () => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        await ImportService.mass(dadosValidos.value, selectedImportType.value);
        toast.add({ severity: 'Sucess', summary: t('title_sucess'), detail: t('sucess'), life: 3000 });
        resetImportacao({
            active,
            selectedImportType,
            fileUploaded,
            fileData,
            dadosValidos,
            dadosInvalidos,
            uploadError,
            componenteAtual,
            validacaoConcluida,
            isEditingEnabled,
            fieldLabels
        });
        enviadoSucesso.value = true; // Exibe o diálogo após o envio
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Erro ao importar dados.', detail: 'Verifique os dados e tente novamente.', life: 3000 }); // Exibe uma notificação de erro caso a requisição falhe
    } finally {
        loading.value = false; // Finaliza o carregamento após a tentativa de sincronização
    }
};

const enviadoSucesso = ref(false); // Indica se os dados foram enviados com sucesso

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
const onCellEditComplete = async (event) => {
    const { data, newValue, field, index } = event;
    data[field] = newValue; // Atualiza o valor no campo editado

    // Revalida a célula editada
    const errors = await validateRow(data, selectedImportType.value);
    const cellKey = `${index}-${field}`; // Combinação única de índice da linha e campo
    data.errors = []; // Adiciona os erros ao objeto de dados
    data.errors = errors; // Adiciona os erros ao objeto de dados

    // Atualiza as listas de dados válidos e inválidos
    if (Object.keys(errors).length === 0) {
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
    color: red !important;
}

.text-green-500 {
    color: green !important;
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

.bluebutton {
    background-color: #007bff;
    color: white;
}

.upload {
    border: #007bff9d solid 1px;
    background-color: rgba(100, 168, 237, 0.152);
}

.file-upload-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.file-upload-left .p-fileupload-content {
    margin-right: 10px; /* Espaço entre o texto e o botão */
}
</style>
