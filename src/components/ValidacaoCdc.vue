<template>
    <div class="validation-container card">
        <h3 class="text-center my-4">Mapeamento de Campos - Centro de Custo</h3>
        <div class="mt-6">
            <div class="grid mb-4">
                <div class="col-6 pb-0" style="height: 50px">
                    <!-- Rótulo para o nome da coluna esperada -->
                    <div class="gap-2 justify-content-start text-2xl text-center border-primary-500">Campos Esperados</div>
                </div>
                <div class="col-6 pb-0" style="height: 50px">
                    <!-- Rótulo para o nome da coluna esperada -->
                    <div class="gap-2 justify-content-start text-2xl text-center border-primary-500">Campos do Arquivo</div>
                </div>
            </div>
            <div v-for="(expected, index) in expectedColumns" :key="index" class="grid align-items-baseline">
                <div class="col-6 py-0" style="">
                    <!-- Rótulo para o nome da coluna esperada -->
                    <label class="text-l font-semibold">{{ expected }}:</label>
                </div>
                <div class="col-6 py-0">
                    <Select class="w-full" v-model="mappedColumns[expected]" :options="fileColumns" optionLabel="label" optionValue="value" placeholder="Selecione um campo" />
                </div>
                <hr/>
                <Divider class="" />
        </div>
        </div>
        <p v-if="!isMappingComplete" class="text-red-500 card">Por favor, complete o mapeamento de todos os campos.</p>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'; // Importa as funcionalidades reativas e de observação do Vue
import Select from 'primevue/select'; // Importa o componente Select do PrimeVue

// Props recebidas do componente pai
/**
 * @type {Object} props
 * @property {Array} fileData - Dados do arquivo enviado pelo componente pai, onde cada item representa uma linha de dados.
 */
const props = defineProps(['fileData']);

/**
 * Emite eventos para o componente pai
 *
 * @event dados-validos - Envia os dados válidos para o componente pai
 * @event dados-invalidos - Envia os dados inválidos para o componente pai
 * @event mapeamento-completo - Indica se o mapeamento foi completado
 */
const emit = defineEmits(['dados-validos', 'dados-invalidos', 'mapeamento-completo']);

/**
 * @type {Ref<Array<string>>} expectedColumns
 * Lista das colunas esperadas para o mapeamento dos dados dos funcionários.
 */
const expectedColumns = ref(['Nome', 'Codigo']);

/**
 * @type {Ref<Array<{ label: string, value: string }>>} fileColumns
 * Mapeamento das colunas do arquivo carregado. Cada item possui 'label' e 'value', ambos referindo-se a uma coluna.
 */
const fileColumns = computed(() => Object.keys(props.fileData[0] || {}).map((field) => ({ label: field, value: field })));

/**
 * @type {Ref<Object>} mappedColumns
 * Objeto de mapeamento das colunas, onde a chave é o nome da coluna esperada e o valor é a coluna mapeada do arquivo carregado.
 */
const mappedColumns = ref({});

/**
 * @type {ComputedRef<boolean>} isMappingComplete
 * Computed que verifica se todas as colunas esperadas estão mapeadas. Retorna 'true' se o mapeamento estiver completo.
 */
const isMappingComplete = computed(() => expectedColumns.value.every((field) => mappedColumns.value[field]));

// Observa mudanças no estado do mapeamento
watch(isMappingComplete, (isComplete) => {
    if (isComplete) {
        validarDados(); // Inicia a validação dos dados automaticamente quando o mapeamento estiver completo
    } else {
        emit('mapeamento-completo', false); // Emite 'false' caso o mapeamento seja incompleto
    }
});

/**
 * Função que valida os dados do arquivo carregado. Divide os dados em válidos e inválidos.
 */
const validarDados = () => {
    const validos = []; // Lista de dados válidos
    const invalidos = []; // Lista de dados inválidos
    // Filtra as linhas que não são nulas ou vazias
    const linhasUteis = props.fileData.filter((row) => Object.values(row).some((value) => value !== null && value !== undefined && String(value).trim() !== ''));

    // Itera sobre as linhas úteis para validar cada registro
    linhasUteis.forEach((row, rowIndex) => {
        const mappedRow = {}; // Armazena os dados mapeados da linha
        const errors = {}; // Armazena os erros encontrados durante a validação

        // Mapeia os campos esperados com base no mapeamento
        expectedColumns.value.forEach((expectedField) => {
            const mappedField = mappedColumns.value[expectedField]; // Obtém o campo mapeado
            mappedRow[expectedField] = mappedField ? row[mappedField] : null; // Adiciona o valor ao mappedRow
        });

        // Valida os campos
        if (!mappedRow.Nome || mappedRow.Nome.trim() === '') {
            errors.Nome = 'Nome é obrigatório'; // Mensagem de erro caso o nome esteja vazio
        }
        if (!mappedRow.Codigo || mappedRow.Codigo.trim() === '') {
            errors.Código = 'Código e Obrigatorio'; // Mensagem de erro caso o CPF seja inválido
        }

        // Classifica os registros em válidos ou inválidos
        if (Object.keys(errors).length > 0) {
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

<style>
/* Estilo para o container de validação */
.validation-container {
    max-width: 600px; /* Define a largura máxima do container como 600px, garantindo que ele não ultrapasse esse tamanho */
    margin: 0 auto; /* Centraliza o container horizontalmente, usando margem automática à esquerda e direita */
    padding: 20px; /* Adiciona um padding de 20px ao redor do conteúdo dentro do container, criando espaço interno */
}

</style>
