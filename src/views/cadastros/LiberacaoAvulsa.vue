<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';

/**
 * Importa as funcionalidades reactive e ref do Vue para gerenciar estados reativos.
 */
import { reactive, ref, onMounted, computed } from 'vue';
import { useDataStore } from '@/store/dataStore.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import * as formatservices from '@/helpers/HelperUtils.js';
import laService from '@/Services/laService.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
    id_funcionario: '',
    limiteRetirada: new Date(),
    enviarEmail: false
});
const funcionarioOptions = computed(() => dataStore.funcionariosOptions);
const listaFuncionarios = computed(() => {
    return funcionarioOptions.value.filter((f) => f.value !== null);
});
const produtosOptions = computed(() => dataStore.produtosOptions);
const ListaProdutos = computed(() => {
    return produtosOptions.value.filter((produto) => produto.value !== null);
});
const ListaProdutoFuncionario = ref([]);
const deleteProductDialog = ref(false);
const itemDialog = ref(false);
const selectedProduct = ref(null);
/**
 * Flag reativa para controlar se o email será enviado.
 * Valores possíveis:
 * - true: o email será enviado.
 * - false: o email não será enviado.
 */
const codigo = ref('');
const codigoMensagem = ref('');
const erroMensagem = ref('');
const AbrirDialogoCodigo = ref(false);
const format = (date) => {
    return formatservices.formatDateToString(date);
};
const gerarCodigo = async () => {
    loading.value = true;
    try {
        const data = formatservices.preparelaData(ListaProdutoFuncionario.value, libAvulsa);
        const response = await laService.adicionar(data);
        codigo.value = `Código gerado: ${response.data.codigo}`;
        erroMensagem.value = '';
    } catch (error) {
        erroMensagem.value = `Erro na criação do código: ${error.message}`;
        codigoMensagem.value = '';
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
        AbrirDialogoCodigo.value = true;
    }
};
const adicionarProduto = () => {
    if (!selectedProduct.value) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: t('product_empty_list') });
        return;
    }
    if (!selectedProduct.value.value) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: 'todos não e um valor valido' });
        return;
    }
    const produtoLabel = selectedProduct.value.label || selectedProduct.value.nome;
    const produtoExistente = ListaProdutoFuncionario.value.find((item) => item.nome_produto === produtoLabel);

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        ListaProdutoFuncionario.value.push({
            ...selectedProduct.value,
            nome_produto: selectedProduct.value.label,
            quantidade: 1
        });
    }
};
const editarProduto = () => {
    const index = ListaProdutoFuncionario.value.findIndex((item) => item.value === selectedProduct.value.value);
    if (index !== -1) {
        // Atualiza a quantidade do produto na lista com a quantidade do sp
        ListaProdutoFuncionario.value[index].quantidade = selectedProduct.value.quantidade;
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            life: 3000,
            detail: t('product_updated')
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            life: 3000,
            detail: t('product_not_found')
        });
    }

    hideDialog();
};
const removerProduto = () => {
    // Procura o índice do produto na lista usando o id_produto
    const index = ListaProdutoFuncionario.value.findIndex((item) => item.id_produto === selectedProduct.value.id_produto);

    if (index !== -1) {
        ListaProdutoFuncionario.value.splice(index, 1);
        toast.add({ severity: 'success', summary: 'Sucesso', life: 3000, detail: t('product_removed') });
    } else {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: t('product_not_found') });
    }

    hideDialog();
};
const hideDialog = () => {
    itemDialog.value = false;
    deleteProductDialog.value = false;
};
const confirmDeleteProduct = (item) => {
    selectedProduct.value = { ...item };
    deleteProductDialog.value = true;
};
const editItem = (selectedItem) => {
    selectedProduct.value = { ...selectedItem };
    itemDialog.value = true;
};
onMounted(async () => {
    loading.value = true;
    try {
        listaFuncionarios.value = dataStore.funcionarios || (await dataStore.fetchFuncionarios());
        ListaProdutos.value = dataStore.produtos || (await dataStore.fetchProdutos());
    } catch (error) {
        erroMensagem.value = `Erro ao carregar dados: ${error.message}`;
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <!-- Estrutura principal da interface -->
    <div class="card">
        <!-- Define que o conteúdo será exibido em 12 colunas no grid -->

        <!-- Título do card -->
        <h5 class="my-6 ml-2 text-2xl">{{ t('one_time_release') }}</h5>

        <!-- Grid interno para organizar os campos de entrada -->
        <div class="card my-6 mx-0 p-fluid grid">
            <!-- Campo para a matrícula -->
            <div class="full lg:col-4 md:col-12 sm:col-12">
                <label for="matricula">{{ t('employee') }}:</label>
                <!-- Campo de texto vinculado ao modelo libAvulsa.matricula -->
                <Dropdown class="my-2" v-model="libAvulsa.id_funcionario" :options="listaFuncionarios" optionLabel="label" optionValue="value" placeholder="Selecione um Funcionario" />
                <!-- <InputText class="my-2" v-model="libAvulsa.matricula" id="matricula" type="text" /> -->
                <!-- Mensagem esperada: Nenhuma validação direta implementada -->
            </div>

            <!-- Campo para o prazo de retirada -->
            <div class="full lg:col-4 md:col-6 sm:col-12">
                <label for="prazo"> {{ t('withdrawal_deadline') }}:</label>
                <!-- Componente AutoComplete para o prazo -->
                <VueDatePicker class="my-2" v-model="libAvulsa.limiteRetirada" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />
                <!-- Mensagem esperada: Campo sempre desabilitado (placeholder fixo). -->
            </div>
            <!-- Campo para o voucher -->
            <div class="full lg:col-8 md:col-12 sm:col-12">
                <label for="voucher">{{ t('product') }}:</label>
                <!-- Campo de texto vinculado ao modelo libAvulsa.voucher -->
                <Dropdown class="my-2" v-model="selectedProduct" :options="ListaProdutos" optionLabel="label" placeholder="Selecione um Produto" :virtualScrollerOptions="{ itemSize: 30 }" />
                <!-- <InputText class="my-2" v-model="libAvulsa.voucher" id="voucher" /> -->
                <!-- Mensagem esperada: Nenhuma validação direta implementada -->
            </div>
            <div class="full lg:col-4 md:col-12 sm:col-12 pt-5 mt-2">
                <!-- Campo de texto vinculado ao modelo libAvulsa.voucher -->
                <Button label="Adicionar" icon="pi pi-check" severity="info" @click="adicionarProduto()" />
                <!-- Mensagem esperada: Nenhuma validação direta implementada -->
            </div>
            <div class="col-12">
                <DataTable class="mt-3" :value="ListaProdutoFuncionario" tableStyle="min-width: 50rem" stripedRows>
                    <template #empty>{{ t('employee_itens_empty') }} </template>
                    <Column field="nome_produto" sortable style="width: 45%" :header="t('name')"></Column>
                    <Column field="quantidade" :header="t('quantity')"></Column>
                    <Column field="codigo" :header="t('code')"></Column>
                    <Column style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <!-- Checkbox para enviar email -->
            <div class="full lg:col-12 md:col-12 sm:col-12">
                <div class="flex align-items-center">
                    <!-- Checkbox que ativa ou desativa a flag enviarEmail -->
                    <Checkbox v-model="libAvulsa.enviarEmail" inputId="sim" name="enviarEmail" value="Sim" class="mx-1" />
                    <label for="enviarEmail" class="mx-2">Desejo receber um aviso por e-mail</label>
                </div>
                <!-- Mensagem esperada: 
                             - Quando marcado: enviarEmail = true.
                             - Quando desmarcado: enviarEmail = false. -->
            </div>
        </div>

        <!-- Botão para salvar as informações -->
        <div class="flex align-items-center justify-content-end field col-12">
            <Button label="Salvar" icon="pi pi-check" severity="info" @click="gerarCodigo" class="full mt-2" />
            <!-- Mensagem esperada ao clicar:
                         - Liberação registrada com sucesso (toast com mensagem de sucesso). -->
        </div>
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" :header="$t('item_edit')" :draggable="false" :modal="true" class="p-fluid">
            <div>
                <div class="p-fluid formgrid grid">
                    <div class="field lg:col-12 md:col-6 sm:col-4">
                        <label for="name">{{ t('name') }}:</label>
                        <InputText disabled v-model="selectedProduct.nome_produto" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-4">
                        <label for="Quantidade">{{ t('quantity') }}</label>
                        <InputText id="Quantidade" v-model="selectedProduct.quantidade" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="$t('cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('save')" icon="pi pi-check" text @click="editarProduto" />
            </template>
        </Dialog>
        <Dialog v-model:visible="deleteProductDialog" :draggable="false" :style="{ width: '450px' }" :header="$t('dialog_delete_item')" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedProduct.codigo">
                    {{ t('dialog_delete_employee', { name: selectedProduct.nome_produto }) }}
                </span>
            </div>
            <template #footer>
                <Button :label="$t('no')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('yes')" icon="pi pi-check" text @click="removerProduto" />
            </template>
        </Dialog>
        <LoadingSpinner v-if="loading" />
        <Message v-if="codigoMensagem" severity="success" :text="codigoMensagem" />

        <!-- Exibe a mensagem de erro se existir -->
        <Message v-if="erroMensagem" severity="error" :text="erroMensagem" />
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
