<template>
    <div class="validation-container">
        <!-- Título da página de mapeamento -->
        <h3 class="text-center">Mapeamento de Campos - Funcionários</h3>

        <!-- Container das colunas para mapeamento -->
        <div class="columns-mapping">
            <!-- Loop para gerar um item de mapeamento para cada coluna esperada -->
            <div v-for="(expected, index) in expectedColumns" :key="index" class="column-item">
                <!-- Rótulo para o nome da coluna esperada -->
                <label class="expected-column">{{ expected }}</label>

                <!-- Dropdown para selecionar a coluna do arquivo carregado -->
                <Dropdown
                    v-model="mappedColumns[expected]" 
                    :options="availableOptions(expected)" 
                    optionLabel="label" 
                    optionValue="value" 
                    placeholder="Selecione a Coluna" 
                    @change="handleMappingChange(expected)" 
                />
            </div>
        </div>

        <!-- Mensagem de erro caso o mapeamento não esteja completo -->
        <p v-if="!isMappingComplete" class="text-red-500">Por favor, complete o mapeamento de todos os campos.</p>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'; // Importando hooks do Vue
import Dropdown from 'primevue/dropdown'; // Componente Dropdown para selecionar opções
import { isValidEmail, isValidCPF, isSetorExists, isPlantaExists } from '@/helpers/HelperValidacao.js'; // Funções de validação

// Props recebidas do componente pai
const props = defineProps(['fileData']); // Recebe os dados do arquivo enviado (como uma lista de objetos)

// Emissão de eventos para o componente pai
const emit = defineEmits(['dados-validos', 'dados-invalidos', 'mapeamento-completo']); // Emite eventos para o componente pai

// Colunas esperadas para funcionários (dados esperados)
const expectedColumns = ref(['Nome', 'CPF', 'Matrícula', 'Email', 'Senha', 'data_admissao', 'RG', 'CTPS', 'Centro_Custo', 'Planta', 'Setor', 'Função', 'Status', 'hora_inicial', 'hora_final']);

// Colunas disponíveis no arquivo carregado (extraídas dos dados do arquivo)
const fileColumns = ref(Object.keys(props.fileData[0] || {}).map((field) => ({ label: field, value: field })));

// Mapeamento das colunas (onde cada campo esperado será mapeado para uma coluna do arquivo)
const mappedColumns = ref({});

// Verifica se o mapeamento está completo (se todas as colunas esperadas têm mapeamento)
const isMappingComplete = computed(() => expectedColumns.value.every((field) => mappedColumns.value[field])); 

// Observa se o mapeamento está completo e inicia a validação dos dados
watch(isMappingComplete, (isComplete) => {
    if (isComplete) {
        validarDados(); // Inicia a validação dos dados automaticamente quando o mapeamento está completo
    } else {
        emit('mapeamento-completo', false); // Emite 'false' para o componente pai, caso o mapeamento não esteja completo
    }
});

// Função para obter as opções disponíveis para mapeamento de uma coluna
const availableOptions = (currentField) => {
    // Obtém todas as colunas que ainda não foram mapeadas
    const alreadyMapped = Object.values(mappedColumns.value).filter((v) => v !== null && v !== undefined);
    return fileColumns.value.filter((option) => option.value === mappedColumns.value[currentField] || !alreadyMapped.includes(option.value));
};

// Função chamada quando a coluna mapeada é alterada
const handleMappingChange = (field) => {
    if (!mappedColumns.value[field]) {
        mappedColumns.value[field] = null; // Se o campo não estiver mapeado, atribui null
    }
};

// Função para validar os dados do arquivo
const validarDados = async () => {
    // Arrays para armazenar dados válidos e inválidos
    const validos = [];
    const invalidos = [];

    // Filtra as linhas do arquivo, excluindo as linhas vazias
    const linhasUteis = props.fileData.filter(row =>
        Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '')
    );

    // Itera sobre as linhas úteis do arquivo
    for (const [rowIndex, row] of linhasUteis.entries()) {
        const mappedRow = {}; // Mapeia os campos da linha com base nas colunas mapeadas
        const errors = {}; // Armazena erros de validação

        // Mapeia os campos esperados de acordo com o mapeamento de colunas
        expectedColumns.value.forEach((expectedField) => {
            const mappedField = mappedColumns.value[expectedField]; // Obtém a coluna mapeada para o campo esperado
            mappedRow[expectedField] = mappedField ? row[mappedField] : null; // Atribui o valor da coluna mapeada ou null
        });

        // Valida os campos mapeados

        // Valida o campo "Nome"
        if (!mappedRow.Nome || mappedRow.Nome.trim() === '') {
            errors.Nome = 'Nome é obrigatório'; // Mensagem de erro se o nome estiver vazio
        }

        // Valida o campo "CPF"
        if (!mappedRow.CPF || !isValidCPF(mappedRow.CPF)) {
            errors.CPF = 'CPF inválido'; // Mensagem de erro se o CPF for inválido
        }

        // Valida o campo "Matrícula"
        if (!mappedRow.Matrícula || String(mappedRow.Matrícula).trim() === '') {
            errors.Matrícula = 'Matrícula é obrigatória'; // Mensagem de erro se a matrícula estiver vazia
        }

        // Valida o campo "Email"
        if (!mappedRow.Email || !isValidEmail(mappedRow.Email)) {
            errors.Email = 'Email inválido'; // Mensagem de erro se o email for inválido
        }

        // Valida o campo "Planta"
        if (!mappedRow.Planta || !(await isPlantaExists(mappedRow.Planta))) {
            errors.Planta = 'Planta não registrada ou Invalida'; // Mensagem de erro se a planta for inválida
        }

        // Valida o campo "Setor"
        if (!mappedRow.Setor || !(await isSetorExists(mappedRow.Setor))) {
            errors.Setor = 'Setor não registrado ou Inválido'; // Mensagem de erro se o setor for inválido
        }

        // Classifica a linha como válida ou inválida
        if (Object.keys(errors).length > 0) {
            invalidos.push({ rowIndex, ...mappedRow, errors }); // Adiciona à lista de inválidos se houver erros
        } else {
            validos.push(mappedRow); // Adiciona à lista de válidos caso não haja erros
        }
    }

    console.log('Registros válidos:', validos); // Exibe os registros válidos no console
    console.log('Registros inválidos:', invalidos); // Exibe os registros inválidos no console

    // Emite os dados válidos, inválidos e a informação sobre o mapeamento completo para o componente pai
    emit('dados-validos', validos);
    emit('dados-invalidos', invalidos);
    emit('mapeamento-completo', validos.length > 0 || invalidos.length > 0); // Emite true ou false se o mapeamento está completo
};
</script>

<style scoped>
/* Estilos para o container de validação */
.validation-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

/* Estilo para o container das colunas de mapeamento */
.columns-mapping {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Estilo para cada item de mapeamento de coluna */
.column-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Estilo para os rótulos das colunas esperadas */
.expected-column {
    font-weight: bold;
    width: 30%; /* Define a largura do rótulo */
}
</style>
