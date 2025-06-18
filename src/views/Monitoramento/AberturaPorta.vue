<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { prepareNomadData2 } from '@/helpers/formHelper.js';
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService.js';
import { gerarEbaixarCSV, gerarEbaixarJSON, isMobileDevice, formatStringDate2 } from '@/helpers/HelperUtils.js';
import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png';

const filtros = ref({
    data_inicio: null, // Data de início do filtro
    data_fim: null // Data de fim do filtro
});

const abertPorta = ref([]);
const carregando = ref(false);
const toast = useToast();

const buscarRelatorio = async () => {
    carregando.value = true;
    try {
        const data = prepareNomadData2(filtros.value);
        const response = await monitoramentoService.relatorioAberturaPorta(data);
        abertPorta.value = response;

        // Caso não haja registros, exibe uma mensagem de erro
        if (abertPorta.value.length === 0) {
            toast.add({ severity: 'warn', summary: 'Não há dados para serem exibidos', detail: 'Verifique os critérios de busca e tente novamente', life: 5000 });
        }
    } catch (err) {
        console.log(abertPorta.value[0]);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar dados', life: 3000 });
    } finally {
        carregando.value = false;
    }
};

const exportCSV = () => {
    gerarEbaixarCSV('Relatório de Abastecimento', abertPorta.value);
};

// Exportação de dados em formato JSON
const exportJSON = () => {
    gerarEbaixarJSON('Relatório de Abastecimento', abertPorta.value);
};

const isMobile = isMobileDevice();

onMounted(() => {
    buscarRelatorio();
});
</script>

<template>
    <div class="card vh">
        <div class="p-fluid formgrid grid col-12">
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12 py-2 my-2">
                <label for="data_inicio">{{ $t('initial_date') }}:</label>
                <VueDatePicker class="drop" v-model="filtros.data_inicio" :format="'dd/MM/yyyy'" locale="pt-BR" showIcon :showOnFocus="false" auto-apply :enable-time-picker="false" :placeholder="$t('initial_date_placeholder')" teleport="body" />
            </div>
            <!-- Filtro Data Fim -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12 pb-0 mb-0">
                <label for="data_fim">{{ $t('end_date') }}:</label>
                <VueDatePicker class="drop" v-model="filtros.data_fim" :format="'dd/MM/yyyy'" locale="pt-BR" showIcon :showOnFocus="false" auto-apply :enable-time-picker="false" :placeholder="$t('end_date_placeholder')" teleport="body" />
            </div>

            <!-- Botão de buscar -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12 pt-5 mt-3 pb-0 mb-0">
                <Button class="filtrar w-full" :label="$t('filter_data')" icon="pi pi-search" @click="buscarRelatorio" />
            </div>

            <!-- Botão para exportar dados em CSV -->
            <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                <Button class="exportar w-full m-1" icon="pi pi-file" :label="$t('export_csv')" @click="exportCSV"></Button>

                <Button class="exportar w-full m-1" icon="pi pi-file" :label="$t('export_json')" @click="exportJSON"></Button>
            </div>
        </div>

        <div v-if="!isMobile" class="flex justify-content-start align-items-center">
            <!-- Imagem para exportar dados em CSV -->
            <div class="">
                <img :src="exportCsv" alt="Export CSV" @click="exportCSV" style="cursor: pointer" width="70" height="70" />
            </div>

            <!-- Imagem para exportar dados em JSON -->
            <div class="">
                <img :src="exportJson" alt="Export JSON" @click="exportJSON" style="cursor: pointer" width="70" height="70" />
            </div>
        </div>

        <DataTable :value="abertPorta" stripedRows paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" showGridlines responsiveLayout="scroll" class="mt-5" tableStyle="min-width: 50rem; table-layout: fixed;" sortable>
            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty> {{ $t('empty_message') }}</template>

            <Column field="Name" :header="$t('name')" sortable class="table-cell" />
            <Column field="data" :header="$t('date')" class="table-cell">
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: formatStringDate2(slotProps.data.data) }">{{ formatStringDate2(slotProps.data.data) }}</span>
                </template>
            </Column>
        </DataTable>

        <LoadingSpinner v-if="carregando" />
    </div>
</template>
