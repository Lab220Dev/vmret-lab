<template>
    <div class="validation-container">  <!-- Container de validação -->
        <h3 class="text-center">Mapeamento de Campos - Funcionários</h3>    <!-- Título do mapeamento -->
        <div class="columns-mapping">   <!-- Container de mapeamento de colunas -->
            <div v-for="(expected, index) in expectedColumns" :key="index" class="column-item"> <!-- Itera sobre as colunas esperadas -->
                <label class="expected-column">{{ expected }}</label>   <!-- Exibe o nome da coluna esperada -->
                <Dropdown v-model="mappedColumns[expected]" :options="fileColumns" optionLabel="label" optionValue="value" placeholder="Selecione a Coluna" />  <!-- Dropdown para selecionar a coluna mapeada -->
            </div>
        </div>
        <p v-if="!isMappingComplete" class="text-red-500">Por favor, complete o mapeamento de todos os campos.</p>  <!-- Mensagem de erro caso o mapeamento não esteja completo -->
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';  // Importa as funcionalidades reativas e de observação do Vue
import Dropdown from 'primevue/dropdown';  // Importa o componente Dropdown do PrimeVue
import { isValidEmail, isValidCPF } from '@/helpers/HelperValidacao.js'; // Importa funções para validação de email e CPF

// Props recebidas do componente pai
/**
 * @type {Object} props
 * @property {Array} fileData - Dados do arquivo enviado pelo componente pai, onde cada item representa uma linha de dados.
 */
const props = defineProps(['fileData']);    // Define as propriedades recebidas do componente pai

/**
 * Emite eventos para o componente pai
 * 
 * @event dados-validos - Envia os dados válidos para o componente pai
 * @event dados-invalidos - Envia os dados inválidos para o componente pai
 * @event mapeamento-completo - Indica se o mapeamento foi completado
 */
const emit = defineEmits(['dados-validos', 'dados-invalidos', 'mapeamento-completo']);  // Define os eventos emitidos pelo componente

/**
 * @type {Ref<Array<string>>} expectedColumns
 * Lista das colunas esperadas para o mapeamento dos dados dos funcionários.
 */
const expectedColumns = ref(['Nome', 'CPF', 'Matrícula', 'Email']); // Define as colunas esperadas

/**
 * @type {Ref<Array<{ label: string, value: string }>>} fileColumns
 * Mapeamento das colunas do arquivo carregado. Cada item possui 'label' e 'value', ambos referindo-se a uma coluna.
 */
const fileColumns = ref(Object.keys(props.fileData[0] || {}).map((field) => ({ label: field, value: field })));

/**
 * @type {Ref<Object>} mappedColumns
 * Objeto de mapeamento das colunas, onde a chave é o nome da coluna esperada e o valor é a coluna mapeada do arquivo carregado.
 */
const mappedColumns = ref({});

/**
 * @type {ComputedRef<boolean>} isMappingComplete
 * Computed que verifica se todas as colunas esperadas estão mapeadas. Retorna 'true' se o mapeamento estiver completo.
 */
const isMappingComplete = computed(() => expectedColumns.value.every((field) => mappedColumns.value[field]));   // Verifica se o mapeamento está completo

// Observa mudanças no estado do mapeamento
watch(isMappingComplete, (isComplete) => {  // Observa mudanças no estado do mapeamento
    if (isComplete) {   // Se o mapeamento estiver completo
        validarDados(); // Inicia a validação dos dados automaticamente quando o mapeamento estiver completo
    } else {    // Se o mapeamento não estiver completo
        emit('mapeamento-completo', false); // Emite 'false' caso o mapeamento seja incompleto
    }
});

/**
 * Função que valida os dados do arquivo carregado. Divide os dados em válidos e inválidos.
 */
const validarDados = () => {    // Função para validar os dados
    const validos = []; // Lista de dados válidos
    const invalidos = []; // Lista de dados inválidos
    // Filtra as linhas que não são nulas ou vazias
    const linhasUteis = props.fileData.filter(row =>    // Filtra as linhas úteis
        Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '')  // Verifica se há valores não nulos ou vazios
    );

    // Itera sobre as linhas úteis para validar cada registro
    linhasUteis.forEach((row, rowIndex) => {    // Itera sobre as linhas úteis
        const mappedRow = {}; // Armazena os dados mapeados da linha
        const errors = {}; // Armazena os erros encontrados durante a validação

        // Mapeia os campos esperados com base no mapeamento
        expectedColumns.value.forEach((expectedField) => {  // Itera sobre os campos esperados
            const mappedField = mappedColumns.value[expectedField];  // Obtém o campo mapeado
            mappedRow[expectedField] = mappedField ? row[mappedField] : null;  // Adiciona o valor ao mappedRow
        });

        // Valida os campos
        if (!mappedRow.Nome || mappedRow.Nome.trim() === '') {  // Valida o campo 'Nome'
            errors.Nome = 'Nome é obrigatório'; // Mensagem de erro caso o nome esteja vazio
        }
        if (!mappedRow.CPF || !isValidCPF(mappedRow.CPF)) {     // Valida o campo 'CPF'
            errors.CPF = 'CPF inválido'; // Mensagem de erro caso o CPF seja inválido
        }
        if (!mappedRow.Matrícula || String(mappedRow.Matrícula).trim() === '') {    // Valida o campo 'Matrícula'
            errors.Matrícula = 'Matrícula é obrigatória'; // Mensagem de erro caso a matrícula esteja vazia
        }
        if (!mappedRow.Email || !isValidEmail(mappedRow.Email)) {   // Valida o campo 'Email'
            errors.Email = 'Email inválido'; // Mensagem de erro caso o email seja inválido
        }

        // Classifica os registros em válidos ou inválidos
        if (Object.keys(errors).length > 0) {   // Se houver erros
            invalidos.push({ rowIndex, ...mappedRow, errors }); // Adiciona os dados inválidos à lista de 'invalidos'
        } else {
            validos.push(mappedRow); // Adiciona os dados válidos à lista de 'validos'
        }
    });

    console.log('Registros válidos:', validos); // Log dos registros válidos
    console.log('Registros inválidos:', invalidos); // Log dos registros inválidos

    // Emite os dados validados para o componente pai
    emit('dados-validos', validos); // Envia os dados válidos
    emit('dados-invalidos', invalidos); // Envia os dados inválidos
    emit('mapeamento-completo', validos.length > 0 || invalidos.length > 0); // Emite se o mapeamento foi completado
};

</script>

<style scoped>
/* Estilo para o container de validação */
.validation-container {
    max-width: 600px; /* Define a largura máxima do container como 600px, garantindo que ele não ultrapasse esse tamanho */
    margin: 0 auto; /* Centraliza o container horizontalmente, usando margem automática à esquerda e direita */
    padding: 20px; /* Adiciona um padding de 20px ao redor do conteúdo dentro do container, criando espaço interno */
}

/* Estilo para o contêiner de mapeamento de colunas */
.columns-mapping {
    display: flex; /* Define o layout flexbox, permitindo que os itens internos sejam distribuídos de maneira flexível */
    flex-direction: column; /* Organiza os itens dentro do container de forma vertical (coluna) */
    gap: 1rem; /* Adiciona um espaço de 1rem entre os elementos dentro da coluna (espaçamento entre os itens) */
}

/* Estilo para cada item de coluna dentro do mapeamento */
.column-item {
    display: flex; /* Utiliza o layout flexbox para os itens, permitindo alinhamento e justificação dos elementos internos */
    align-items: center; /* Alinha verticalmente os itens ao centro do container, garantindo que o conteúdo fique alinhado */
    justify-content: space-between; /* Distribui os itens dentro do item de coluna, com o máximo de espaço possível entre eles */
}

/* Estilo para a coluna esperada dentro do mapeamento de colunas */
.expected-column {
    font-weight: bold; /* Define o peso da fonte como negrito, destacando visualmente esta coluna como importante */
    width: 30%; /* Define a largura da coluna como 30% do tamanho total do container pai, garantindo que ela ocupe uma parte da largura */
}

</style>
