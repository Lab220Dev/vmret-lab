<template>
    <div class="validation-container">
        <h3 class="text-center">Mapeamento de Campos - Funcionários</h3>
        <div class="columns-mapping">
            <div v-for="(expected, index) in expectedColumns" :key="index" class="column-item">
                <label class="expected-column">{{ expected }}</label>
                <Dropdown v-model="mappedColumns[expected]" :options="fileColumns" optionLabel="label" optionValue="value" placeholder="Selecione a Coluna" />
            </div>
        </div>
        <p v-if="!isMappingComplete" class="text-red-500">Por favor, complete o mapeamento de todos os campos.</p>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import { isValidEmail,isValidCPF } from '@/helpers/Validadores.js';


// Props recebidas do componente pai
const props = defineProps(['fileData']);

// Emissão de eventos para o componente pai
const emit = defineEmits(['dados-validos', 'dados-invalidos', 'mapeamento-completo']);

// Colunas esperadas para funcionários
const expectedColumns = ref(['Nome', 'CPF', 'Matrícula', 'Email']);

// Colunas disponíveis no arquivo carregado
const fileColumns = ref(Object.keys(props.fileData[0] || {}).map((field) => ({ label: field, value: field })));

// Mapeamento das colunas
const mappedColumns = ref({});

// Verifica se o mapeamento está completo
const isMappingComplete = computed(() => expectedColumns.value.every((field) => mappedColumns.value[field]));

// Observa mudanças no estado do mapeamento
watch(isMappingComplete, (isComplete) => {
    if (isComplete) {
        validarDados(); // Inicia a validação dos dados automaticamente
    } else {
        emit('mapeamento-completo', false); // Emite 'false' caso o mapeamento seja incompleto
    }
});

// Função para validar os dados
const validarDados = () => {
    const validos = [];
    const invalidos = [];
    const linhasUteis = props.fileData.filter(row =>
        Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '')
    );
    linhasUteis.forEach((row, rowIndex) => {
        const mappedRow = {};
        const errors = {};

        expectedColumns.value.forEach((expectedField) => {
            const mappedField = mappedColumns.value[expectedField];
            mappedRow[expectedField] = mappedField ? row[mappedField] : null;
        });

        // Valida os campos
        if (!mappedRow.Nome || mappedRow.Nome.trim() === '') {
            errors.Nome = 'Nome é obrigatório';
        }
        if (!mappedRow.CPF || !isValidCPF(mappedRow.CPF)) {
            errors.CPF = 'CPF inválido';
        }
        if (!mappedRow.Matrícula || String(mappedRow.Matrícula).trim() === '') {
            errors.Matrícula = 'Matrícula é obrigatória';
        }
        if (!mappedRow.Email || !isValidEmail(mappedRow.Email)) {
            errors.Email = 'Email inválido';
        }

        // Classifica os registros
        if (Object.keys(errors).length > 0) {
            invalidos.push({ rowIndex, ...mappedRow, errors });
        } else {
            validos.push(mappedRow);
        }
    });
    console.log('Registros válidos:', validos);
    console.log('Registros inválidos:', invalidos);

    // Emite os dados validados para o componente pai
    emit('dados-validos', validos);
    emit('dados-invalidos', invalidos);
    emit('mapeamento-completo', validos.length > 0 || invalidos.length > 0);
};

</script>

<style scoped>
.validation-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
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
</style>
