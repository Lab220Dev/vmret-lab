<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';

/**
 * Importa as funcionalidades reactive e ref do Vue para gerenciar estados reativos.
 */
import { reactive, ref,onMounted } from 'vue';
import { useDataStore } from '@/store/dataStore.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import * as formatservices from '@/helpers/HelperUtils.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
// import servicoGenerico from '@/Services/genericService.js';
/**
 * Inicializa o toast para exibir notificações ao usuário.
 */
const loading = ref(false);
const toast = useToast();
const dataStore = useDataStore();
/**
 * Objeto reativo que armazena os dados do formulário de liberação avulsa.
 * Campos:
 * - matricula: String que representa a matrícula do funcionário.
 * - voucher: String para o código do voucher.
 * - sku: String que identifica o SKU do produto.
 * - dm: String que identifica o DM selecionado.
 * - mp: String que representa a mola ou porta selecionada.
 * - prazo: String para o prazo de liberação.
 * - email: String para o email do funcionário.
 */
const libAvulsa = reactive({
    id_funcionario:'',
    id_produto:'',
    limiteRetirada:new Date(),
    enviarEmail: false,
});
const listaFuncionarios = ref([]);
const ListaProdutos = ref([]);

/**
 * Flag reativa para controlar se o email será enviado.
 * Valores possíveis:
 * - true: o email será enviado.
 * - false: o email não será enviado.
 */
const codigo = ref('');
const AbrirDialogoCodigo = ref(false);
const format = (date) => {
   return formatservices.formatDateToString(date);
};
const gerarCodigo = async () =>{
    loading.value = true;
    try {
        // const response = await servicoGenerico.gerarCodigo(libAvulsa);
        codigo.value = response.data.codigo;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro',life:3000, detail: error.message });
    }finally{
        loading.value = false;
        AbrirDialogoCodigo.value = true;
    }
}
onMounted(async () => {
    listaFuncionarios.value = dataStore.funcionarios || await dataStore.fetchFuncionarios();
    ListaProdutos.value = dataStore.produtos || await dataStore.fetchProdutos();
});
// logquery (mantido como solicitado, caso necessário para logs futuros)
// console.log('logquery');
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

