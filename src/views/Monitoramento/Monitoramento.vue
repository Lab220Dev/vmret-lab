<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { prepareNomadData } from '@/helpers/formHelper';
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService';
import { gerarEbaixarCSV, gerarEbaixarJSON, isMobileDevice, formatStringDate } from '@/helpers/HelperUtils.js'; // Importa funções utilitárias
import '@vuepic/vue-datepicker/dist/main.css';
const { t, locale } = useI18n();
import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png';
const filtros = ref({
    id_dm: null,
    tipo_retorno: null,
    qrCode_valido: null,
    data_inicio: null,
    data_fim: null
});
const listaDMs = [
    { label: 'Todos', value: null },
    { label: 'DM 1', value: 1 }
];

const toast = useToast();
const listaTiposRetorno = [
    { label: 'Todos', value: null },
    { label: 'Passou Produto', value: 'EXOK00' },
    { label: 'NAO caiu produto', value: 'EXNOK' },
    { label: 'Processo Ok sem cuidar produto', value: 'EXOKST' },
    { label: 'Outros erros', value: 'OUTROS' }
];

const listaQrValido = [
    { label: 'Todos', value: null },
    { label: 'Válido', value: '1' },
    { label: 'Inválido', value: '0' }
];
const dados = ref([]);
const carregando = ref(false);

/**
 * Função assíncrona responsável por buscar o relatório de retirada.
 *
 * - Define o estado de carregamento como verdadeiro antes de iniciar a operação.
 * - Prepara os dados necessários para a requisição utilizando a função `prepareNomadData`.
 * - Envia a requisição ao serviço `monitoramentoService.relatorioRetirada` com o payload preparado.
 * - Atualiza a variável `dados` com a resposta obtida.
 * - Em caso de erro, exibe uma mensagem de erro no console.
 * - Garante que o estado de carregamento seja definido como falso ao final da operação,
 *   independentemente de sucesso ou falha.
 *
 * @async
 * @function buscarRelatorio
 * @returns {Promise<void>} Não retorna valor, mas atualiza os estados reativos `carregando` e `dados`.
 */
const buscarRelatorio = async () => {
    carregando.value = true;
    try {
        const payload = prepareNomadData(filtros.value);
        const response = await monitoramentoService.relatorioRetirada(payload);
        dados.value = response;

        // Caso não haja registros, exibe uma mensagem de erro
        if (dados.value.length === 0) {
            toast.add({ severity: 'warn', summary: 'Não há dados para serem exibidos', detail: 'Verifique os critérios de busca e tente novamente', life: 5000 });
        }
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
    } finally {
        carregando.value = false;
    }
};
const exportCSV = () => {
    gerarEbaixarCSV('Relatorio de Monitoramento', dados.value);
};

// Exportação de dados em formato JSON
const exportJSON = () => {
    gerarEbaixarJSON('Relatorio de Monitoramento', dados.value);
};
const isMobile = isMobileDevice();

onMounted(() => {
    buscarRelatorio();
});

function tratarMensagemMaquin(StringMaquina) {
    switch (StringMaquina) {
        case 'EXOK00':
            return 'Passou Produto';
        case 'EXNOK':
            return 'NAO caiu produto';
        case 'EXOKST':
            return ' Processo Ok sem cuidar produto';
        case 'EXLINIV':
            return 'Linha fora de limites';
        case 'EXCOLINV':
            return 'Coluna fora de limites';
        case 'EXTONF':
            return ' Sem motor ligado na saída';
        case 'EXLIMCORR':
            return ' Corrente maxima atingida';
        case 'EXTOST00':
            return 'Timeout de volta';
        case 'EXSC00':
            return 'Sobrecorrente na Coluna';
        case 'EXSC01':
            return 'Sobrecorrente na Linha';
        case 'N':
            return 'Sem resposta da maquina';
        default:
            return StringMaquina;
    }
}
</script>
<template>
    <div class="card vh">
        <div class="form">
            <div class="p-fluid formgrid grid col-12">
                <!-- Filtro ID_DM -->
                <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12 py-0 my-0">
                    <label for="id_dm">DM:</label>
                    <Select v-model="filtros.id_dm" :options="listaDMs" optionLabel="label" optionValue="value" class="drop" :placeholder="$t('all')" />
                </div>

                <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                    <Button class="exportar" icon="pi pi-file" :label="$t('export_csv')" @click="exportCSV"></Button>
                </div>

                <!-- Botão para exportar dados em JSON -->
                <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                    <Button class="exportar" icon="pi pi-file" :label="$t('export_json')" @click="exportJSON"></Button>
                </div>
                <!-- Botão Buscar -->
                <div class="field pt-3 mt-3 xl:col-3 lg:col-4 md:col-6 sm:col-12 pb-0 mb-0">
                    <Button class="filtrar w-full" :label="$t('filter_data')" icon="pi pi-search" @click="buscarRelatorio" />
                </div>
            </div>
            <div v-if="!isMobile" class="flex justify-content-start align-items-center ">
                <!-- Imagem para exportar dados em CSV -->
                <div class="">
                    <img :src="exportCsv" alt="Export CSV" @click="exportCSV" style="cursor: pointer" width="70" height="70" />
                </div>

                <!-- Imagem para exportar dados em JSON -->
                <div class="">
                    <img :src="exportJson" alt="Export JSON" @click="exportJSON" style="cursor: pointer" width="70" height="70" />
                </div>
            </div>
        </div>

        <DataTable :value="dados" stripedRows showGridlines paginator :rows="50" :rowsPerPageOptions="[50, 100, 500]" rowHover tableStyle="min-width: 50rem; table-layout: fixed;" :loading="carregando">
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{ $t('totalRecords') }}: {{ dados.length }}</span>
                    </div>
                </div>
            </template>

            <template #empty> {{ $t('noData') }} </template>

            <Column field="Nome" :header="$t('ProdutoNome')" sortable style="width: 15%;" />
            <Column field="ID_DM" :header="$t('MaquinaID')" sortable style="width: 12%;"/>
    
             <Column field="Qr_Code" :header="$t('QRCode')" sortable class="table-cell" style="width: 50%;">
            <template #body="slotProps">
                <span v-tooltip.left="{ value: slotProps.data.Qr_Code }">{{ slotProps.data.Qr_Code }}</span>

            </template> </Column>
    
            <Column field="Dia" :header="$t('date')" sortable>
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: formatStringDate(slotProps.data.Dia) }">{{ formatStringDate(slotProps.data.Dia) }}</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style>
.anim {
    overflow: hidden;
    white-space: nowrap;
    border-right: 0.15em solid #fb2b2b;
    width: 0ch;
    animation: typing 5s steps(5) infinite normal;
}

@keyframes typing {
    from {
        width: 0ch;
    }
    to {
        width: 3ch;
    }
}
</style>
