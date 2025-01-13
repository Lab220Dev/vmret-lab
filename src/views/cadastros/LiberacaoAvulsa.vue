<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';

/**
 * Importa as funcionalidades reactive e ref do Vue para gerenciar estados reativos.
 */
import { reactive, ref } from 'vue';

/**
 * Inicializa o toast para exibir notificações ao usuário.
 */
const toast = useToast();

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
    matricula: '',
    voucher: '',
    sku: '',
    dm: '',
    mp: '',
    prazo: '',
    email: ''
});

/**
 * Flag reativa para controlar se o email será enviado.
 * Valores possíveis:
 * - true: o email será enviado.
 * - false: o email não será enviado.
 */
const enviarEmail = ref(false);

/**
 * Lista de opções de DMs disponíveis.
 * Cada objeto possui:
 * - nome: String representando o nome do DM.
 * - code: Código identificador único para o DM.
 */
const libOptions = ref([
    { nome: 'DM 1', code: 'plt1' },
    { nome: 'DM 2', code: 'plt2' }
]);

/**
 * Lista de opções para molas e portas.
 * Cada objeto possui:
 * - mp: String que descreve a mola ou porta.
 */
const molaOptions = ref([{ mp: 'Mola 1' }, { mp: 'Mola 2' }, { mp: 'Porta 1' }, { mp: 'Porta 2' }]);

/**
 * Função para salvar os dados de liberação.
 * Quando chamada, exibe uma mensagem de sucesso ao usuário.
 * Possíveis mensagens:
 * - 'Liberação registrada': Exibida quando os dados são salvos com sucesso.
 * - Mensagens de erro não foram implementadas aqui, mas podem ser adicionadas para validações.
 */
const saveLiberacao = () => {
    // Exibe uma notificação de sucesso com duração de 3000ms.
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Liberação registrada', life: 3000 });
};

// logquery (mantido como solicitado, caso necessário para logs futuros)
// console.log('logquery');
</script>

<template>
    <!-- Estrutura principal da interface -->
    <div class="grid">
        <!-- Define que o conteúdo será exibido em 12 colunas no grid -->
        <div class="col-12">
            <!-- Card para agrupar o conteúdo da liberação avulsa -->
            <div class="card">
                <!-- Título do card -->
                <h5 class="mt-2">Liberação Avulsa</h5>

                <!-- Grid interno para organizar os campos de entrada -->
                <div class="mt-5 mx-0 p-fluid grid">
                    <!-- Campo para a matrícula -->
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="matricula">Matrícula:</label>
                        <!-- Campo de texto vinculado ao modelo libAvulsa.matricula -->
                        <InputText class="my-2" v-model="libAvulsa.matricula" id="matricula" type="text" />
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Campo para o voucher -->
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="voucher">Voucher:</label>
                        <!-- Campo de texto vinculado ao modelo libAvulsa.voucher -->
                        <InputText class="my-2" v-model="libAvulsa.voucher" id="voucher" />
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Campo para o SKU -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="sku">SKU:</label>
                        <!-- Campo de texto vinculado ao modelo libAvulsa.sku -->
                        <InputText class="my-2" v-model="libAvulsa.sku" id="sku" />
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Dropdown para selecionar o DM -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Dropdown com as opções de DMs -->
                        <Dropdown
                            class="my-2"
                            id="dm"
                            v-model="libAvulsa.dm"
                            :options="libOptions"
                            optionLabel="nome"
                            placeholder="Escolha uma DM"
                        />
                        <!-- Mensagem esperada: Nenhuma validação direta implementada -->
                    </div>

                    <!-- Dropdown para selecionar a mola ou porta -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="mp">Mola ou Porta:</label>
                        <!-- Dropdown para seleção de molas ou portas -->
                        <!-- É desabilitado se nenhum DM for selecionado -->
                        <Dropdown
                            class="my-2"
                            id="mp"
                            v-model="libAvulsa.mp"
                            :options="molaOptions"
                            optionLabel="mp"
                            :disabled="!libAvulsa.dm"
                            placeholder="Selecione uma Mola ou Porta"
                        />
                        
                        <!-- Mensagens esperadas:
                             - Se DM não for selecionado: Dropdown desabilitado.
                             - Caso contrário: Dropdown habilitado. -->
                    </div>

                    <!-- Campo para o prazo de retirada -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="prazo">Prazo de Retirada:</label>
                        <!-- Componente AutoComplete para o prazo -->
                        <AutoComplete class="my-2" disabled placeholder="11/11/1111" />
                        <!-- Mensagem esperada: Campo sempre desabilitado (placeholder fixo). -->
                    </div>

                    <!-- Checkbox para enviar email -->
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <div class="flex align-items-center">
                            <!-- Checkbox que ativa ou desativa a flag enviarEmail -->
                            <Checkbox
                                v-model="enviarEmail"
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
                        @click="saveLiberacao"
                        class="full mt-2"
                    />
                    <!-- Mensagem esperada ao clicar:
                         - Liberação registrada com sucesso (toast com mensagem de sucesso). -->
                </div>
            </div>
        </div>
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

