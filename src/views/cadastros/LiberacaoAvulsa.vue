<script setup>
import { useToast } from 'primevue/usetoast'; // Importa o hook useToast da biblioteca primevue para exibir notificações
import { reactive, ref, onMounted } from 'vue'; // Importa funções reativas e de ciclo de vida do Vue
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para seleção de datas
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o estilo do VueDatePicker
import * as formatservices from '@/helpers/HelperUtils.js'; // Importa todas as funções de ajuda do arquivo HelperUtils.js
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente LoadingSpinner

const loading = ref(false); // Cria uma referência reativa para controlar o estado de carregamento
const toast = useToast(); // Inicializa o hook useToast para exibir notificações
const dataStore = useDataStore(); // Inicializa o store de dados

const libAvulsa = reactive({ // Cria um objeto reativo para armazenar os dados da liberação avulsa
    id_funcionario: '',
    id_produto: '',
    limiteRetirada: new Date(),
    enviarEmail: false,
});

const listaFuncionarios = ref([]); // Cria uma referência reativa para armazenar a lista de funcionários
const ListaProdutos = ref([]); // Cria uma referência reativa para armazenar a lista de produtos
const codigo = ref(''); // Cria uma referência reativa para armazenar o código gerado
const AbrirDialogoCodigo = ref(false); // Cria uma referência reativa para controlar a visibilidade do diálogo de código

const format = (date) => { // Declara uma função chamada format para formatar datas
    return formatservices.formatDateToString(date);
};

const gerarCodigo = async () => { // Declara uma função assíncrona chamada gerarCodigo
    loading.value = true; // Ativa o estado de loading
    try {
        // const response = await servicoGenerico.gerarCodigo(libAvulsa);
        codigo.value = response.data.codigo; // Define o valor do código gerado
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
        AbrirDialogoCodigo.value = true; // Abre o diálogo de código
    }
};

onMounted(async () => { // Declara uma função assíncrona chamada onMounted
    listaFuncionarios.value = dataStore.funcionarios || await dataStore.fetchFuncionarios(); // Carrega a lista de funcionários
    ListaProdutos.value = dataStore.produtos || await dataStore.fetchProdutos(); // Carrega a lista de produtos
});
</script>

<template>
    <!-- Estrutura principal da interface -->
    <div class="card">
        <!-- Define que o conteúdo será exibido em 12 colunas no grid -->
        
                <!-- Título do card -->
                <h5 class="my-6 ml-2 text-2xl">Liberação Avulsa</h5>

                <!-- Grid interno para organizar os campos de entrada -->
                <div class="card my-6 mx-0 p-fluid grid">
                    <!-- Campo para a matrícula -->
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="matricula">Funcionario:</label>
                        <!-- Campo de texto vinculado ao modelo libAvulsa.matricula -->
                        <Dropdown class="my-2" v-model="libAvulsa.id_funcionario" :options="listaFuncionarios" optionLabel="label" optionValue="value" placeholder="Selecione um Funcionario" />
                        <!-- <InputText class="my-2" v-model="libAvulsa.matricula" id="matricula" type="text" /> -->
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Campo para o voucher -->
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="voucher">Produto:</label>
                        <!-- Campo de texto vinculado ao modelo libAvulsa.voucher -->
                        <Dropdown class="my-2" v-model="libAvulsa.id_produto" :options="ListaProdutos" optionLabel="label" optionValue="value" placeholder="Selecione um Produto" :virtualScrollerOptions="{ itemSize: 30 }" />
                        <!-- <InputText class="my-2" v-model="libAvulsa.voucher" id="voucher" /> -->
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Campo para o prazo de retirada -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="prazo">Prazo de Retirada:</label>
                        <!-- Componente AutoComplete para o prazo -->
                        <VueDatePicker class="my-2" v-model="libAvulsa.limiteRetirada" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />
                        <!-- Mensagem esperada: Campo sempre desabilitado (placeholder fixo). -->
                    </div>

                    <!-- Checkbox para enviar email -->
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <div class="flex align-items-center">
                            <!-- Checkbox que ativa ou desativa a flag enviarEmail -->
                            <Checkbox
                                v-model="libAvulsa.enviarEmail"
                                inputId="sim"
                                name="enviarEmail"
                                value="Sim"
                                class="mx-1"
                            />
                            <label for="enviarEmail" class="mx-2">Desejo receber um aviso por e-mail</label>
                        </div>
                        <!-- Mensagem esperada: 
                             - Quando marcado: enviarEmail = true.
                             - Quando desmarcado: enviarEmail = false. -->
                    </div>
                </div>

                <!-- Botão para salvar as informações -->
                <div class="flex align-items-center justify-content-end field col-12">
                    <Button
                        label="Salvar"
                        icon="pi pi-check"
                        severity="info"
                        @click="gerarCodigo"
                        class="full mt-2"
                    />
                    <!-- Mensagem esperada ao clicar:
                         - Liberação registrada com sucesso (toast com mensagem de sucesso). -->
                </div>
            
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style>
/**
 * Estilo responsivo para dispositivos menores que 580px.
 * Ajusta os elementos para ocuparem 100% da largura disponível.
 */
@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>

