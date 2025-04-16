<template>
    <div class="validation-container card">
        <!-- Título da página de mapeamento -->
        <h3 class="text-center my-4">Mapeamento de Campos - Funcionários</h3>
        <Divider class="mt-0 mb-2" />
        <!-- Container das colunas para mapeamento -->
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
            <!-- Loop para gerar um item de mapeamento para cada coluna esperada -->
            <div v-for="(expected, index) in expectedColumns" :key="index" class="grid align-items-baseline">
                <div class="col-6 py-0">
                    <!-- Rótulo para o nome da coluna esperada -->
                    <label class="text-l font-semibold">{{ expected }}:</label>
                </div>
                <div class="col-6 py-0">
                    <!-- Select para selecionar a coluna do arquivo carregado -->
                    <Select class="w-full" v-model="mappedColumns[expected]" :options="availableOptions(expected)" optionLabel="label" optionValue="value" placeholder="Selecione um campo" @change="handleMappingChange(expected)" />
                </div>
                <hr/>
                <Divider/>
            </div>
        </div>
        <!-- Mensagem de erro caso o mapeamento não esteja completo -->
        <p v-if="!isMappingComplete" class="text-red-500 card">Por favor, complete o mapeamento de todos os campos.</p>
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'; // Importando hooks do Vue para reatividade e observação
import Select from 'primevue/select'; // Componente Select do PrimeVue para seleção de opções
import { isValidEmail, isValidCPF, isSetorExists, isPlantaExists, isCentroCustoExists, isFuncaoExists } from '@/helpers/HelperValidacao.js'; // Importa funções de validação personalizadas
import { useToast } from 'primevue/usetoast'; // Utilizado para exibir mensagens de sucesso, erro ou aviso ao usuário.

// Props recebidas do componente pai
/**
 * @type {Object} props
 * @property {Array<Object>} fileData - Dados do arquivo enviado pelo componente pai, onde cada item é uma linha do arquivo.
 */
const props = defineProps(['fileData']); // Recebe os dados do arquivo enviado, como uma lista de objetos
const toast = useToast(); // Instância do sistema de notificações do PrimeVue.

// Emissão de eventos para o componente pai
/**
 * @function emit
 * @param {string} dados-validos - Emite os dados válidos para o componente pai.
 * @param {string} dados-invalidos - Emite os dados inválidos para o componente pai.
 * @param {string} mapeamento-completo - Emite o status de mapeamento completo para o componente pai.
 */
const emit = defineEmits(['dados-validos', 'dados-invalidos', 'mapeamento-completo']); // Emite eventos para o componente pai

const expectedColumns = ref([
    'Nome',
    'CPF',
    'Matrícula',
    'Email',
    'Senha',
    'data_admissao',
    'RG',
    'CTPS',
    'Centro_Custo',
    'Planta',
    'Setor',
    'Funcao',
    'Status',
    'hora_inicial',
    'hora_final',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
]);
const requiredColumns = [
  'Nome',
  'CPF',
  'Matrícula',
  'Email',
  'data_admissao',
  'RG',
  'CTPS',
  'Centro_Custo',
  'Planta',
  'Setor',
  'Funcao',
  'Status',
  'hora_inicial',
  'hora_final'
];
// Colunas disponíveis no arquivo carregado (extraídas dos dados do arquivo)
/**
 * @type {Ref<Array<{label: string, value: string}>>} fileColumns
 * Extrai as colunas do primeiro item do arquivo carregado para mapear os dados corretamente.
 */
const fileColumns = computed(() => Object.keys(props.fileData[0] || {}).map((field) => ({ label: field, value: field })));

// Mapeamento das colunas (onde cada campo esperado será mapeado para uma coluna do arquivo)
const mappedColumns = ref({}); // Armazena o mapeamento das colunas. Cada chave é o nome da coluna esperada e o valor é o nome da coluna mapeada do arquivo.

/**
 * @type {ComputedRef<boolean>} isMappingComplete
 * Computed property que retorna 'true' se todas as colunas esperadas estiverem mapeadas corretamente.
 */
const isMappingComplete = computed(() => requiredColumns.every((field) => mappedColumns.value[field])); // Verifica se todas as colunas esperadas foram mapeadas

// Observa se o mapeamento está completo e inicia a validação dos dados
watch(isMappingComplete, (isComplete) => {
    if (isComplete) {
        validarDados(); // Chama a função de validação assim que o mapeamento estiver completo
    } else {
        emit('mapeamento-completo', false); // Emite 'false' se o mapeamento não estiver completo
    }
});

/**
 * Função que retorna as opções disponíveis para mapear uma coluna do arquivo
 * @param {string} currentField - O nome da coluna que está sendo mapeada
 * @returns {Array<Object>} - Lista de opções de mapeamento para o campo atual
 */
const availableOptions = (currentField) => {
    // Obtém todas as colunas que já foram mapeadas
    const alreadyMapped = Object.values(mappedColumns.value).filter((v) => v !== null && v !== undefined);
    return fileColumns.value.filter((option) => option.value === mappedColumns.value[currentField] || !alreadyMapped.includes(option.value));
    // Retorna as opções de colunas que ainda não foram mapeadas
};

/**
 * Função que é chamada sempre que o mapeamento de uma coluna é alterado
 * @param {string} field - O nome do campo que foi alterado no mapeamento
 */
const handleMappingChange = (field) => {
    if (!mappedColumns.value[field]) {
        mappedColumns.value[field] = null; // Se o campo não foi mapeado, atribui null para indicar que o mapeamento não foi feito
    }
};

/**
 * Função que valida os dados do arquivo carregado, dividindo os dados entre válidos e inválidos
 */
const validarDados = async () => {
    const validos = []; // Array para armazenar os dados válidos
    const invalidos = []; // Array para armazenar os dados inválidos

    // Filtra as linhas do arquivo, excluindo as linhas vazias
    const linhasUteis = props.fileData.filter((row) => Object.values(row).some((value) => value !== null && value !== undefined && String(value).trim() !== ''));

    // Itera sobre as linhas úteis do arquivo
    for (const [rowIndex, row] of linhasUteis.entries()) {
        const mappedRow = {}; // Mapeia os campos da linha com base nas colunas mapeadas
        const errors = {}; // Armazena erros de validação

        // Mapeia os campos esperados de acordo com o mapeamento de colunas
        expectedColumns.value.forEach((expectedField) => {
            const mappedField = mappedColumns.value[expectedField];
            mappedRow[expectedField] = mappedField ? row[mappedField] : null;

            // Se o campo for um dos dias da semana e não estiver mapeado, usa o padrão "Não"
            if (['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].includes(expectedField) && (!mappedField || !mappedRow[expectedField])) {
                mappedRow[expectedField] = 'Não';
            }

            // Se o campo for "Senha" e não estiver mapeado ou estiver vazio, usa a senha padrão
            if (expectedField === 'Senha' && (!mappedField || !mappedRow[expectedField] || mappedRow[expectedField].trim() === '')) {
                mappedRow[expectedField] = '123456';
                toast.add({ severity: 'warn', summary: 'Senha Padrão', detail: 'Nenhuma coluna de senha mapeada. Será utilizado a senha padrão "123".' });
                console.log('Nenhuma coluna de senha mapeada. Será utilizado a senha padrão "123456".');
            }
        });

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

        if (!mappedRow.Centro_Custo || !( await isCentroCustoExists(mappedRow.Centro_Custo))) {
            errors.Centro_Custo = 'Centro de Custo não registrado ou inválido'; // Mensagem de erro se o centro de custo estiver vazio
        }

        // Valida o campo "Planta"
        if (!mappedRow.Planta || !(await isPlantaExists(mappedRow.Planta))) {
            errors.Planta = 'Planta não registrada ou inválida'; // Mensagem de erro se a planta for inválida
        }

        // Valida o campo "Setor"
        if (!mappedRow.Setor || !(await isSetorExists(mappedRow.Setor))) {
            errors.Setor = 'Setor não registrado ou inválido'; // Mensagem de erro se o setor for inválido
        }

        // Valida o campo "Setor"
        if (!mappedRow.Funcao || !(await isFuncaoExists(mappedRow.Funcao))) {
            errors.Funcao = 'Função não registrada ou inválida'; // Mensagem de erro se o setor for inválido
        }

        // Classifica a linha como válida ou inválida
        if (Object.keys(errors).length > 0) {
            invalidos.push({ rowIndex, ...mappedRow, errors }); // Adiciona à lista de inválidos se houver erros
        } else {
            validos.push(mappedRow); // Adiciona à lista de válidos caso não haja erros
        }
    }

    // Log dos registros válidos e inválidos
    console.log('Registros válidos:', validos); // Exibe os registros válidos no console
    console.log('Registros inválidos:', invalidos); // Exibe os registros inválidos no console

    // Emite os dados válidos, inválidos e a informação sobre o mapeamento completo para o componente pai
    emit('dados-validos', validos); // Envia os dados válidos
    emit('dados-invalidos', invalidos); // Envia os dados inválidos
    emit('mapeamento-completo', validos.length > 0 || invalidos.length > 0); // Emite 'true' ou 'false' se o mapeamento está completo
};
</script>

<style>
/* Estilos para o container de validação */
.validation-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}
</style>
