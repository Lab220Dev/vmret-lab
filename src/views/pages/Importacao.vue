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
      <div v-if="invalidData.length" class="p-mt-3">
        <h4>Dados Inválidos</h4>
        <DataTable :value="invalidData" editable="cell">
          <Column 
            v-for="field in currentFields" 
            :key="field" 
            :field="field" 
            :header="fieldLabels[field]"
            :style="getCellStyle(rowData.errors, field)"
            editor="input" 
          />
        </DataTable>
      </div>

      <!-- Tabela de Dados Válidos -->
      <div v-if="newRecords.length" class="p-mt-3">
        <h4>Dados Válidos</h4>
        <DataTable :value="newRecords">
          <Column 
            v-for="field in currentFields" 
            :key="field" 
            :field="field" 
            :header="fieldLabels[field]"
          />
        </DataTable>
      </div>

      <!-- Botão de Envio -->
      <Button label="Enviar para o Backend" @click="submitData" :disabled="invalidData.length > 0" />
    </div>
  </div>
  <LoadingSpinner v-if="loading" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';
import Papa from 'papaparse';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

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
const loading = ref(false);

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
  return expectedColumns.value.filter(column => mappedColumns.value[column]);
});

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

// Função para normalizar texto (remover acentos, espaços e caracteres especiais) e converter para camelCase
function normalizarChave(texto) {
  return texto
    .normalize("NFD") // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-zA-Z0-9]/g, ' ') // Remover caracteres especiais
    .replace(/\s+(.)/g, function(match, group1) { 
      return group1.toUpperCase(); 
    }) // Convertendo para camelCase
    .replace(/\s/g, '') // Remover espaços restantes
    .replace(/^(.)/, function(match, group1) {
      return group1.toLowerCase();
    }); // Converter a primeira letra para minúscula
}

// Função para validar as linhas
const validateRow = (row) => {
  const errors = {};

  // Validações básicas para determinar se a linha é válida
  if (!row.Nome || row.Nome.trim() === '') {
    errors.Nome = 'Nome é obrigatório';
  }
  if (!row.Matricula || row.Matricula.trim() === '') {
    errors.Matricula = 'Matrícula é obrigatória';
  }
  if (!row.CPF || !isValidCPF(row.CPF)) {
    errors.CPF = 'CPF inválido';
  }

  // Adicione outras validações conforme necessário

  return Object.keys(errors).length > 0 ? errors : null;
};

// Exemplo de validação de CPF (pode ser substituída pela lógica real)
const isValidCPF = (cpf) => {
  // Lógica para validar CPF
  return cpf.length === 14; // Simplificado para o exemplo
};

// Passo 1: Carregar o arquivo e fazer o mapeamento automático
const handleFileUpload = (event) => {
  const file = event.files[0];
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results && results.meta && results.data.length > 0) {
        fileColumns.value = results.meta.fields.map(field => ({ label: field, value: field }));
        fileData.value = results.data;
        prefillMappedColumns();

        // Exibir o mapeamento ao usuário
        // O mapeamento será ajustado manualmente pelo usuário antes de prosseguir
      } else {
        console.error("Erro ao processar o arquivo CSV: Dados ou cabeçalho ausentes.");
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Arquivo CSV inválido.', life: 3000 });
      }
    },
    error: (error) => {
      console.error("Erro ao processar o arquivo CSV:", error);
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao processar o arquivo CSV.', life: 3000 });
    }
  });
};

// Função para pré-mapear as colunas
const prefillMappedColumns = () => {
  expectedColumns.value.forEach((expected) => {
    // Procura uma coluna fornecida que seja similar à coluna esperada
    const matchedColumn = fileColumns.value.find(fileColumn => isSimilar(expected, fileColumn.value));
    if (matchedColumn) {
      mappedColumns.value[expected] = matchedColumn.value; // Mapeamento bem-sucedido
    } else {
      console.warn(`Coluna não mapeada: ${expected}`);
      mappedColumns.value[expected] = ''; // Deixa em branco se não mapeado
    }
  });
};

// Passo 2: Revisão Manual do Mapeamento
// O usuário faz os ajustes manuais no mapeamento através da interface.

// Passo 3: Processar os dados após confirmação do mapeamento
const buildDataTable = () => {
  invalidData.value = [];
  newRecords.value = [];

  // Agora que o usuário confirmou o mapeamento, processamos os dados
  fileData.value.forEach(row => {
    const validationErrors = validateRow(row);
    const mappedRow = {};

    expectedColumns.value.forEach((expected) => {
      const column = mappedColumns.value[expected];
      mappedRow[expected] = column && row[column] !== undefined ? row[column] : null;
    });

    if (validationErrors) {
      invalidData.value.push({ ...mappedRow, errors: validationErrors });
    } else if (!row.existingRecord) {
      newRecords.value.push(mappedRow);
    }
  });

  dataTableBuilt.value = true; // Agora podemos construir a tabela com os dados corretos
};

// Função para verificar a similaridade das colunas
const isSimilar = (expected, actual) => {
  return expected.toLowerCase().replace(/\s+/g, '') === actual.toLowerCase().replace(/\s+/g, '');
};

// Função para estilizar as células com base em erros
const getCellStyle = (errors, field) => {
  return errors && errors[field] ? 'background-color: #fdd; border-color: #f00;' : '';
};

// Função para enviar os dados para o backend, normalizando as chaves no momento do envio
const submitData = async () => {
  loading.value = true;
  try {
    const normalizedRecords = newRecords.value.map(record => {
      const normalizedRecord = {};
      Object.keys(record).forEach(key => {
        const normalizedKey = normalizarChave(key);
        normalizedRecord[normalizedKey] = record[key];
      });
      return normalizedRecord;
    });

    const response = await axios.post('/import/mass', {
      tipo: selectedImportType.value,
      id_cliente: store.userIdCliente,
      data: normalizedRecords
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Dados enviados com sucesso!', life: 3000 });
  } catch (error) {
    const errorMessage = `Erro na importação: ${error.response?.data?.error || 'Erro desconhecido.'}`;
    toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 5000 });
    console.error('Erro ao enviar dados:', error);
  } finally {
        loading.value = false; // Desativando loading
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

.import-summary {
  margin-top: 20px;
}

.p-mt-3 {
  margin-top: 1rem;
}
</style>
