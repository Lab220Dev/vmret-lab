<script setup>
import { prepareNomadData } from '@/helpers/formHelper.js';
import { formatStringDate } from '@/helpers/HelperUtils.js';
import { ref } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useToast } from 'primevue/usetoast';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService.js';
const filtros = ref({
    ativacao: '',
    evento: '',
    status: '',
    data_inicio: null,
    data_fim: null,
    id_dm: ''
});
const listaAtivacoes = [
    { label: 'Todos', value: null },
    { label: 'Nomad', value: 'nomad' }
];

const listaEventos = [
    { label: 'Todos', value: null },
    { label: 'API: Enviar status', value: 'Enviar Status API' },
    { label: 'API: QrCode Invalido', value: 'Enviar Status QrCode Invalido' },
    { label: 'API: Gerar QR Code', value: 'PegarTokenAPI' },
    { label: 'API: Validar QR Code', value: 'ValidarQrCode' },
    { label: 'Maquina: Sincronizar', value: 'Sincronizar' },
    { label: 'Maquina: Liberar cartão', value: 'Liberar cartão' },
    { label: 'Maquina: Erro', value: 'erro' }
];

const listaStatus = [
    { label: 'Todos', value: null },
    { label: 'Catch', value: 'Catch' },
    { label: 'Erro', value: 'Erro' },
    { label: 'Falha', value: 'Falha' },
    { label: 'Log', value: 'Log' },
    { label: 'QrCode', value: 'QrCode' },
    { label: 'Retirada', value: 'Retirada' },
    { label: 'Sucesso', value: 'Sucesso' }
];

const listaDMs = [
    { label: 'Todos', value: null },
    { label: 'DM 001', value: 1 }
];

const dados = ref([]);
const carregando = ref(false);
const toast = useToast();

const buscarRelatorio = async () => {
    carregando.value = true;
    try {
        const data = prepareNomadData(filtros.value);
        const response = await monitoramentoService.relatorio(data);
        dados.value = response;

        if (dados.value.length === 0) {
            toast.add({ severity: 'warn', summary: 'Não há dados para serem exibidos', detail: 'Verifique os critérios de busca e tente novamente', life: 5000 });
        }
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar dados', life: 3000 });
    } finally {
        carregando.value = false;
    }
};
</script>
<template>
    <div class="card vh">
        <div class="form">
            <div class="p-fluid formgrid grid col-12">
                <!-- Filtro ID_DM -->
                <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12 py-0 my-0">
                    <label for="id_dm">DM:</label>
                    <Select class="drop" filter v-model="filtros.id_dm" :options="listaDMs" optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>

                <!-- Filtro Ativação -->
                <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12 py-0 my-0">
                    <label for="ativacao">{{ $t('activation') }}:</label>
                    <Select class="drop" filter v-model="filtros.ativacao" :options="listaAtivacoes" optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>

                <!-- Filtro Evento -->
                <div class="field xl:col-4 lg:col-4 md:col-6 sm:col-12 py-0 my-0">
                    <label for="evento">{{ $t('event') }}:</label>
                    <Select class="drop" filter v-model="filtros.evento" :options="listaEventos" optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>

                <!-- Filtro Status -->
                <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12 py-2 my-2">
                    <label for="status">Status:</label>
                    <Select class="drop" filter v-model="filtros.status" :options="listaStatus" optionLabel="label" optionValue="value" :placeholder="$t('all')" />
                </div>
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
            </div>
        </div>

        <DataTable :value="dados" stripedRows paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" showGridlines responsiveLayout="scroll" class="mt-5" tableStyle="min-width: 50rem; table-layout: fixed;">
            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty> {{ $t('empty_message') }}</template>

            <Column field="Ativacao" :header="$t('activation')" sortable class="table-cell" />
            <Column field="Evento" :header="$t('event')" sortable class="table-cell" />
            <Column field="Status" header="Status" sortable class="table-cell" />
            <Column field="Url" header="URL" class="table-cell">
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: slotProps.data.Url }">{{ slotProps.data.Url }}</span>
                </template>
            </Column>
            <Column field="body" header="Body" class="table-cell">
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: slotProps.data.body }">{{ slotProps.data.body }}</span>
                </template>
            </Column>
            <Column field="Data" header="Data" class="table-cell">
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: formatStringDate(slotProps.data.Data) }">{{ formatStringDate(slotProps.data.Data) }}</span>
                </template>
            </Column>
            <Column field="Retorno" :header="$t('return')" class="table-cell">
                <template #body="slotProps">
                    <span v-tooltip.left="{ value: slotProps.data.Retorno }">{{ slotProps.data.Retorno }}</span>
                </template>
            </Column>
        </DataTable>

        <LoadingSpinner v-if="carregando" />
    </div>
</template>
