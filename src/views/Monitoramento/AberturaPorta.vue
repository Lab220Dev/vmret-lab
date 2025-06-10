<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import monitoramentoService from '@/services/Monitoramento/MonitoramentoService.js';
import { gerarEbaixarCSV, gerarEbaixarJSON, isMobileDevice } from '@/helpers/HelperUtils.js';

import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png'; 

const data = ref({
    ID: '', // ID do registro
    ID_User: '',
    Name:'', 
    dia: new Date() // Data selecionada (inicia com a data atual)
});
const emptyMessage = computed(() => t('no_search_made'));// Mensagem padrão caso não haja dados

const abertPorta = ref([]);
const carregando = ref(false);
const toast = useToast();

const buscarRelatorio = async () => {
  carregando.value = true;
  try {
    abertPorta.value = await monitoramentoService.relatorioAberturaPorta(data);
    

    // Caso não haja registros, exibe uma mensagem de erro
    if (abertPorta.value.length === 0) {
            emptyMessage.value = t('no_data_found');
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
     <!-- Botão para exportar dados em CSV -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                        <Button class="exportar w-full m-1" icon="pi pi-file" :label="$t('export_csv')" @click="exportCSV"></Button>
                        
                        <Button class="exportar w-full m-1" icon="pi pi-file" :label="$t('export_json')" @click="exportJSON"></Button>
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
       

    <DataTable
      :value="abertPorta"
      stripedRows
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      showGridlines
      responsiveLayout="scroll"
      class="mt-5"
      tableStyle="min-width: 50rem; table-layout: fixed;"
      sortable 
    >
      <Column field="ID" header="ID" sortable class="table-cell" />
      <Column field="ID_User" header="ID_User" sortable class="table-cell" />
      <Column field="Name" :header="$t('name')" sortable class="table-cell" />
      <Column field="data" :header="$t ('date')" class="table-cell">
  <template #body="slotProps">
    {{ slotProps.data.data }}
  </template>
</Column>
    </DataTable>

    <LoadingSpinner v-if="carregando" />
  </div>
</template>
