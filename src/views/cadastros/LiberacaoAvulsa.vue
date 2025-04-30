<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message'
import { reactive, ref, onMounted, computed } from 'vue';
import { useDataStore } from '@/store/dataStore.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import * as formatservices from '@/helpers/HelperUtils.js';
import laService from '@/Services/laService.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
import { DateTime } from 'luxon';

const timeZone = 'America/Sao_Paulo';
const loading = ref(false);
const toast = useToast();
const dataStore = useDataStore();
const posicaoSelecionada = ref(null);
const dialogoPosicao = ref(false);
const posicaoOcupada = ref(false);
const detalhesPosicao = ref({});
const libAvulsa = reactive({
    id_funcionario: '',
    limiteRetirada: new Date(),
    enviarEmail: false
});
const funcionarioOptions = computed(() => dataStore.funcionariosOptions);
const listaFuncionarios = computed(() => {
    return funcionarioOptions.value.filter((f) => f.value !== null);
});
const itemCache = ref({}); // objeto com chave = id_dm e valor = lista de itens
const itensAtuais = ref([]);
const listaArmarios = ref([]);
const produtosOptions = computed(() => dataStore.produtosOptions);
const ListaProdutos = computed(() => {
    return produtosOptions.value.filter((produto) => produto.value !== null);
});
const ListaProdutoFuncionario = ref([]);
const deleteProductDialog = ref(false);
const itemDialog = ref(false);
const selectedProduct = ref(null);
const dmSelecionado = ref(null);
const codigo = ref('');
const codigoMensagem = ref('');
const erroMensagem = ref('');
const AbrirDialogoCodigo = ref(false);
const novaMatricula = ref('');
const novaRequisicao = ref('');
const novaDataLimite = ref(new Date());
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
function aoClicarNaPosicao(pos) {
    posicaoSelecionada.value = pos.index;
    const item = itensAtuais.value.find((i) => i.Posicao === pos.index);

    if (item) {
        posicaoOcupada.value = true;
        detalhesPosicao.value = item;
    } else {
        posicaoOcupada.value = false;
        novaMatricula.value = '';
        novaRequisicao.value = '';
        novaDataLimite.value = new Date();
    }

    dialogoPosicao.value = true;
}
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
async function carregarItens(id_dm) {
    if (itemCache.value[id_dm]) {
        itensAtuais.value = itemCache.value[id_dm];
        return;
    }

    try {
        const response = await laService.itensLocker(id_dm);
        const dados = response.data;

        itemCache.value[id_dm] = dados;
        itensAtuais.value = dados;
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
}
function adicionarNovoItemNaPosicao() {
    if (!novaMatricula.value || !novaRequisicao.value) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos' });
        return;
    }
    const dataLuxon = DateTime.fromJSDate(novaDataLimite.value).setZone(timeZone);
    const novoItem = {
        id_dm: dmSelecionado.value,
        Posicao: posicaoSelecionada.value, // respeitando o campo usado no `gridPosicoes`
        nome_produto: 'Novo item manual', // você pode mudar conforme necessário
        matricula: novaMatricula.value,
        requisicao: novaRequisicao.value,
        data_limite: dataLuxon.toISO()
    };
    itensAtuais.value.push(novoItem);
    const cache = itemCache.value[dmSelecionado.value] || [];
    cache.push(novoItem);
    itemCache.value[dmSelecionado.value] = cache;
    console.log('Enviar para backend:', novoItem);
    dialogoPosicao.value = false;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item adicionado' });
}
const gridPosicoes = computed(() => {
    const total = listaArmarios.value.find((item) => item.value === dmSelecionado.value)?.posicoes || 0;

    return Array.from({ length: total }, (_, i) => {
        const posicao = i + 1;
        const item = itensAtuais.value.find((i) => i.Posicao === posicao);
        return {
            index: posicao,
            ocupado: !!item,
            item: item || null
        };
    });
});
onMounted(async () => {
    loading.value = true;
    try {
        listaFuncionarios.value = dataStore.funcionarios || (await dataStore.fetchFuncionarios());
        ListaProdutos.value = dataStore.produtos || (await dataStore.fetchProdutos());
        let resultArmarios = await laService.listarLocker();
        listaArmarios.value = resultArmarios.data.map((item) => ({
            label: item.Identificacao,
            value: item.id_dm,
            posicoes: item.total_controladoras
        }));
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
        <h5 class="my-6 ml-2 text-2xl">{{ t('one_time_release') }}</h5>

        <!-- Grid interno para organizar os campos de entrada -->
        <div class="card my-6 mx-0 p-fluid grid">
            <div class="full lg:col-4 md:col-12 sm:col-12">
                <label for="armario">{{ t('locker') }}:</label>
                <Dropdown class="my-2" v-model="dmSelecionado" :options="listaArmarios" optionLabel="label" optionValue="value" @change="carregarItens($event.value)" />
            </div>
        </div>
        <div class="card mt-4">
            <h5 class="text-lg mb-3">{{ t('positions') }}</h5>
            <div class="grid">
                <div
                    v-for="pos in gridPosicoes"
                    :key="pos.index"
                    class="col-2 text-center p-3 border-1 border-round font-bold cursor-pointer"
                    :style="{ backgroundColor: pos.ocupado ? '#ef4444' : '#22c55e', color: '#fff' }"
                    @click="aoClicarNaPosicao(pos)"
                >
                    <div class="text-sm font-semibold">{{ t('position') }} {{ pos.index }}</div>

                    <div v-if="pos.ocupado && pos.item">
                        <div v-if="pos.item.matricula">
                            <div class="text-xs mt-1">Req: {{ pos.item.requisicao || '--' }}</div>
                            <div class="text-xs">Mat: {{ pos.item.matricula }}</div>
                            <div class="text-xs">{{ pos.item.nome_funcionario || '---' }}</div>
                        </div>
                        <div v-else>
                            <div class="text-xs mt-1">Cod: {{ pos.item.ProdutoCodigo }}</div>
                            <div class="text-xs">{{ pos.item.nome_produto }}</div>
                        </div>
                    </div>
                </div>
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
                <div class="formgrid grid">
                    <div class="lg:col-9 md:col-6 sm:col-4">
                        <label for="name">{{ t('name') }}:</label>
                        <InputText class="w-full" disabled v-model="selectedProduct.nome_produto" id="name" type="text" autocomplete="off"></InputText>
                    </div>
                    <div class="lg:col-3 md:col-6 sm:col-4">
                        <label for="Quantidade">{{ t('quantity') }}:</label>
                        <InputText class="w-full" id="Quantidade" v-model="selectedProduct.quantidade" />
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
        <Dialog v-model:visible="dialogoPosicao" :modal="true" :header="t('position') + ' ' + posicaoSelecionada" :style="{ width: '500px' }">
            <template v-if="posicaoOcupada">
                <div class="p-fluid">
                    <p>
                        <strong>{{ t('product') }}:</strong> {{ detalhesPosicao.nome_produto }}
                    </p>
                    <p>
                        <strong>{{ t('code') }}:</strong> {{ detalhesPosicao.codigo }}
                    </p>
                    <p>
                        <strong>{{ t('employee') }}:</strong> {{ detalhesPosicao.matricula || '---' }}
                    </p>
                    <p>
                        <strong>{{ t('withdrawal_deadline') }}:</strong> {{ formatservices.formatDateToString(detalhesPosicao.data_limite) }}
                    </p>
                </div>
            </template>

            <template v-else>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="matricula">{{ t('employee') }}</label>
                        <InputText id="matricula" v-model="novaMatricula" />
                    </div>
                    <div class="field col-12">
                        <label for="requisicao">Nº Requisição</label>
                        <InputText id="requisicao" v-model="novaRequisicao" />
                    </div>
                    <div class="field col-12">
                        <label>{{ t('withdrawal_deadline') }}</label>
                        <VueDatePicker v-model="novaDataLimite" showIcon :showOnFocus="false" :format="format" :locale="locale" auto-apply :enable-time-picker="false" />
                    </div>
                </div>
            </template>

            <template #footer>
                <Button :label="$t('cancel')" icon="pi pi-times" text @click="dialogoPosicao = false" />
                <Button v-if="!posicaoOcupada" label="Adicionar" icon="pi pi-check" @click="adicionarNovoItemNaPosicao" />
            </template>
        </Dialog>
        <LoadingSpinner v-if="loading" />
        <Message v-if="codigoMensagem" severity="success" :text="codigoMensagem" />

        <!-- Exibe a mensagem de erro se existir -->
        <Message v-if="erroMensagem" severity="error" :text="erroMensagem" />
    </div>
</template>

<style>

</style>
