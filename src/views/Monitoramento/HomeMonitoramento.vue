<script setup>
import { ref, onMounted,  computed } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/authStore';
import { prepareNomadData } from '@/helpers/formHelper';
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService';
import VueDatePicker from '@vuepic/vue-datepicker';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import '@vuepic/vue-datepicker/dist/main.css';
const { t, locale } = useI18n();

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
]

const listaTiposRetorno = [
  { label: 'Todos', value: null },
  { label: 'Passou Produto', value: 'EXOK00' },
  { label: 'NAO caiu produto', value: 'EXNOK' },
  { label: 'Processo Ok sem cuidar produto', value: 'EXOKST' },
  { label: 'Linha fora de limites', value: 'EXLINIV' },
  { label: 'Coluna fora de limites', value: 'EXCOLINV' },
  { label: 'Sem motor ligado na saída', value: 'EXTONF' },
  { label: 'Corrente maxima atingida', value: 'EXLIMCORR' },
  { label: 'Timeout de volta', value: 'EXTOST00' },
  { label: 'Sobrecorrente na Coluna', value: 'EXSC00' },
  { label: 'Sobrecorrente na Linha', value: 'EXSC01' }
]

const listaQrValido = [
  { label: 'Todos', value: null },
  { label: 'Válido', value: '1' },
  { label: 'Inválido', value: '0' }
]
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
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
    } finally {
        carregando.value = false;
    }
};

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
          <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12">
            <label for="id_dm">DM:</label>
            <Dropdown
              v-model="filtros.id_dm"
              :options="listaDMs"
              optionLabel="label"
              optionValue="value"
              class="drop"
              :placeholder="$t('all')"
            />
          </div>
  
          <!-- Filtro Tipo de Retorno -->
          <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12">
            <label for="tipo_retorno">Tipo de Retorno:</label>
            <Dropdown
              v-model="filtros.tipo_retorno"
              :options="listaTiposRetorno"
              optionLabel="label"
              optionValue="value"
              class="drop"
              :placeholder="$t('all')"
            />
          </div>
  
          <!-- Filtro QR Code Válido -->
          <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12">
            <label for="qrCode_valido">QR Code Válido:</label>
            <Dropdown
              v-model="filtros.qrCode_valido"
              :options="listaQrValido"
              optionLabel="label"
              optionValue="value"
              class="drop"
              :placeholder="$t('all')"
            />
          </div>
  
          <!-- Botão Buscar -->
          <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-12">
            <Button class="filtrar" :label="$t('filter_data')" icon="pi pi-search" @click="buscarRelatorio" />
          </div>
        </div>
      </div>
  
      <DataTable
        :value="dados"
        stripedRows
        showGridlines
        paginator
        :rows="50"
        :rowsPerPageOptions="[50, 100, 500]"
        rowHover
        tableStyle="min-width: 50rem"
        :loading="carregando"
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <div>
              <span>{{ $t('totalRecords') }}: {{ dados.length }}</span>
            </div>
          </div>
        </template>
  
        <template #empty> {{ $t('noData') }} </template>
  
        <Column field="Nome" :header="$t('ProdutoNome')" sortable />
        <Column field="ID_DM" :header="$t('MaquinaID')" sortable />
        <Column field="QR_Code_Valido" :header="$t('QRCodeValido')" sortable>
          <template #body="{ data }">
            {{ data.QR_Code_Valido ? 'Válido' : 'Inválido' }}
          </template>
        </Column>
        <Column field="Retorno_Placa" :header="$t('RespostaMaquina')" sortable>
          <template #body="{ data }">
            {{ tratarMensagemMaquin(data.Retorno_Placa) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </template>

<style>
.new-row {
    background-color: #e0ffe0;
}
.updated-row {
    background-color: #fff5e6;
}
.updated-icon {
    margin-left: 5px;
}
.error-message {
    color: red;
    margin-bottom: 1rem;
}
</style>
