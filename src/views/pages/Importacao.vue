<template>
  <div class="card">
    <!-- Dropdown para Seleção do Tipo de Importação -->
    <Dropdown 
      v-model="selectedImportType" 
      :options="importTypes" 
      optionLabel="label" 
      optionValue="value" 
      placeholder="Selecione o Tipo de Importação" 
      @change="onImportTypeChange" 
    />

    <!-- Mensagem de Erro para Tipos Não Implementados -->
    <div v-if="showErrorMessage" class="p-mt-3">
      <Message severity="error">Funcionalidade ainda não implementada.</Message>
    </div>

    <!-- Upload de Arquivo -->
    <FileUpload
      v-if="showFileUpload"
      mode="basic"
      chooseLabel="Selecionar Arquivo"
      @select="handleFileUpload"
      accept=".csv"
    />

    <!-- Mapeamento das Colunas -->
    <div v-if="fileData.length && selectedImportType === 'funcionarios'" class="mapping-section">
      <h3>Mapeamento das Colunas</h3>
      
      <div class="columns-mapping">
        <div v-for="(expected, index) in expectedColumns" :key="index" class="column-item">
          <div class="expected-column">{{ expected }}</div>
          <div class="document-column">
            <Dropdown 
              v-model="mappedColumns[expected]" 
              :options="fileColumns" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Selecione a Coluna"
            />
          </div>
        </div>
      </div>

      <Button label="Construir Tabela de Dados" @click="buildDataTable" class="p-mt-3" />
    </div>

    <!-- Resumo dos Dados Importados -->
    <div v-if="dataTableBuilt" class="import-summary">
      <h3>Resumo da Importação</h3>
      <p>Total de Registros: {{ fileData.length }}</p>
      <p>Número de Registros com Erros: {{ invalidData.length }}</p>
      <p>Número de Novos Registros: {{ newRecords.length }}</p>

      <!-- Tabela de Dados Inválidos -->
      <DataTable v-if="invalidData.length" :value="invalidData" editable="cell">
        <Column 
          v-for="field in currentFields" 
          :key="field" 
          :field="field" 
          :header="fieldLabels[field]" 
          editor="input" 
        />
      </DataTable>

      <!-- Botão de Envio -->
      <Button label="Enviar para o Backend" @click="submitData" :disabled="invalidData.length > 0" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';
import Papa from 'papaparse';

const toast = useToast();
const store = useAuthStore();

const selectedImportType = ref(null);
const fileData = ref([]);
const invalidData = ref([]);
const newRecords = ref([]);
const showErrorMessage = ref(false);
const showFileUpload = ref(false);
const dataTableBuilt = ref(false);
const mappedColumns = ref({});
const fileColumns = ref([]);
const expectedColumns = ref([]);

// Definindo os labels para as colunas
const fieldLabels = {
  'Nome': 'Nome',
  'Matricula': 'Matrícula',
  'Data de Admissão': 'Data de Admissão',
  'CPF': 'CPF',
  'RG': 'RG',
  'CTPS': 'CTPS',
  'Email': 'Email',
  'Centro de Custo': 'Centro de Custo',
  'Planta': 'Planta',
  'Setor': 'Setor',
  'Função': 'Função',
  'Status': 'Status',
  'Hora Inicial': 'Hora Inicial',
  'Hora Final': 'Hora Final',
  'Segunda': 'Segunda',
  'Terça': 'Terça',
  'Quarta': 'Quarta',
  'Quinta': 'Quinta',
  'Sexta': 'Sexta',
  'Sábado': 'Sábado',
  'Domingo': 'Domingo'
};

const currentFields = computed(() => {
  return Object.values(mappedColumns.value).filter(column => column); // Retorna apenas os campos mapeados
});

// Ajustando as colunas esperadas para o tipo de importação "funcionarios"
const importTypes = ref([
  { label: 'Centro Custo', value: 'cdc' },
  { label: 'Função', value: 'funcao' },
  { label: 'Setores', value: 'setor' },
  { label: 'Produto', value: 'produto' },
  { label: 'Itens do Setor', value: 'Itens' },
  { label: 'Planta', value: 'planta' },
  { label: 'Funcionário', value: 'funcionarios' }
]);

const fieldsByImportType = {
  funcionarios: [
    'Nome', 'Matricula', 'Data de Admissão', 'CPF', 'RG', 'CTPS', 'Email', 
    'Centro de Custo', 'Planta', 'Setor', 'Função', 'Status', 
    'Hora Inicial', 'Hora Final', 'Segunda', 'Terça', 'Quarta', 
    'Quinta', 'Sexta', 'Sábado', 'Domingo'
  ]
};

const onImportTypeChange = () => {
  if (selectedImportType.value === 'funcionarios') {
    expectedColumns.value = fieldsByImportType[selectedImportType.value];
    showErrorMessage.value = false;
    showFileUpload.value = true;
  } else {
    showErrorMessage.value = true;
    showFileUpload.value = false;
    expectedColumns.value = [];
  }
};

const handleFileUpload = (event) => {
  const file = event.files[0];
  processFile(file);
};

const processFile = (file) => {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      fileColumns.value = results.meta.fields.map(field => ({ label: field, value: field }));
      fileData.value = results.data;
      prefillMappedColumns();
      invalidData.value = fileData.value.filter((item) => !validateRow(item));
      newRecords.value = fileData.value.filter((item) => validateRow(item) && !item.existingRecord);
    },
    error: (error) => {
      console.error("Erro ao processar o arquivo CSV:", error);
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao processar o arquivo CSV.', life: 3000 });
    }
  });
};

const prefillMappedColumns = () => {
  expectedColumns.value.forEach((expected) => {
    const matchedColumn = fileColumns.value.find(fileColumn => isSimilar(expected, fileColumn.value));
    if (matchedColumn) {
      mappedColumns.value[expected] = matchedColumn.value;
    } else {
      mappedColumns.value[expected] = '';
    }
  });
};

const isSimilar = (expected, actual) => {
  return expected.toLowerCase().replace(/\s+/g, '') === actual.toLowerCase().replace(/\s+/g, '');
};

const validateRow = (row) => {
  return row && row.Nome && row.Matricula && row.CPF;
};

const buildDataTable = () => {
  dataTableBuilt.value = true;
};

const submitData = async () => {
  try {
    const response = await axios.post('/import/mass', {
      id_cliente: store.userIdCliente,
      data: fileData.value
    }, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Dados enviados com sucesso!', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar os dados.', life: 3000 });
    console.error('Erro ao enviar dados:', error);
  }
};
</script>

<style scoped>
.columns-mapping {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expected-column {
  flex: 1;
  font-weight: bold;
}

.document-column {
  flex: 2;
}
</style>
