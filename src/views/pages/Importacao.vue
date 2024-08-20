<template>
    <div>
      <!-- Dropdown para Seleção do Tipo de Importação -->
      <Dropdown v-model="selectedImportType" :options="importTypes" placeholder="Selecione o Tipo de Importação" />
      <FileUpload
        v-if="selectedImportType"
        mode="basic"
        chooseLabel="Selecionar Arquivo"
        @select="handleFileUpload"
      />
  
      <!-- Resumo dos Dados -->
      <div v-if="fileData.length">
        <h3>Resumo da Importação</h3>
        <p>Total de Registros: {{ fileData.length }}</p>
        <p>Número de Registros com Erros: {{ invalidData.length }}</p>
        <p>Número de Novos Registros: {{ newRecords.length }}</p>
  

        <DataTable v-if="invalidData.length" :value="invalidData" editable="cell">
          <Column v-for="field in currentFields" :key="field" :field="field" :header="fieldLabels[field]" editor="input" />
        </DataTable>
  

        <Button label="Enviar para o Backend" @click="submitData" :disabled="invalidData.length > 0" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';

  const selectedImportType = ref(null);
  
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
    funcao: ['nome', 'codigo', 'id_centro_custo'],
    cdc: ['Nome', 'Codigo'],
    setor: ['name', 'codigo', 'id_centro_custo'],
    produto: ['nome', 'codigo', 'id_planta', 'id_tipoProduto', 'id_categoria', 'unidade_medida', 'validadedias', 'descricao'],
    Itens: ['productName', 'price', 'category'],
    planta: ['Nome', 'Codigo'],
    funcionarios: ['Nome', 'Matricula', 'data_admissao', 'CPF', 'RG', 'CTPS', 'email', 'id_centro_custo', 'id_planta', 'id_setor', 'id_funcao', 'status', 'hora_inicial', 'hora_final', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  };
  
  const fieldLabels = {
    nome: 'Nome',
    codigo: 'Código',
    id_centro_custo: 'Centro de Custo',
    id_planta: 'Planta',
    id_tipoProduto: 'Tipo de Produto',
    id_categoria: 'Categoria',
    unidade_medida: 'Unidade de Medida',
    validadedias: 'Validade (Dias)',
    descricao: 'Descrição',
    productName: 'Nome do Produto',
    price: 'Preço',
    category: 'Categoria',
    Matricula: 'Matrícula',
    data_admissao: 'Data de Admissão',
    CPF: 'CPF',
    RG: 'RG',
    CTPS: 'CTPS',
    email: 'Email',
    id_setor: 'Setor',
    id_funcao: 'Função',
    status: 'Status',
    hora_inicial: 'Hora Inicial',
    hora_final: 'Hora Final',
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };
  
  const currentFields = computed(() => {
    return selectedImportType.value ? fieldsByImportType[selectedImportType.value] : [];
  });
  
  const fileData = ref([]);
  
  const invalidData = ref([]);
  
  const newRecords = ref([]);
  
  const handleFileUpload = (event) => {
    const file = event.files[0];
    processFile(file);
  };
  
  const processFile = (file) => {
  
    invalidData.value = fileData.value.filter((item) => !item.valid);
    newRecords.value = fileData.value.filter((item) => item.valid && !item.existingRecord);
  };
  
  const submitData = async () => {
   const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true;
    try {
        const response = await axios.post('/import/mass', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaPlanta.value = response.data;
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
    } finally {
        loading.value = false; // Desativando loading
    };
  } 
  </script>
  
  <style scoped>
  </style>
  