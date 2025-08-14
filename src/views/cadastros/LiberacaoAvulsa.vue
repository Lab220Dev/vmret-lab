<script setup>
/**
 * Importa o composable useToast do PrimeVue, usado para exibir mensagens de notificação.
 */
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import { reactive, ref, onMounted, computed } from 'vue';
import { useDataStore } from '@/store/dataStore.js';
import '@vuepic/vue-datepicker/dist/main.css';
import * as formatservices from '@/helpers/HelperUtils.js';
import laService from '@/Services/laService.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const listaDIPs = ref([]);
const dipSelecionado = ref(null);
const dipsComPosicoes = ref([]);
const loading = ref(false);
const toast = useToast();
const dataStore = useDataStore();
const posicaoSelecionada = ref(null);
const dialogoPosicao = ref(false);
const posicaoOcupada = ref(false);
const detalhesPosicao = ref({});
const itemCache = ref({}); // objeto com chave = id_dm e valor = lista de itens
const itensAtuais = ref([]);
const listaArmarios = ref([]);
const listaPosicoes = ref([]);
const produtosOptions = computed(() => dataStore.produtosOptions);
const ListaProdutoFuncionario = ref([]);
const deleteProductDialog = ref(false);
const itemDialog = ref(false);
const selectedProduct = ref(null);
const dmSelecionado = ref(null);
const codigo = ref('');
const codigoMensagem = ref('');
const erroMensagem = ref('');
const AbrirDialogoCodigo = ref(false);
const novaRequisicao = ref('');

const salvarRequisicao = async () => {
    if (!dmSelecionado.value) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: t('select_locker') });
        return;
    }
    try {
        const response = await laService.adicionar({
            id_dm: dmSelecionado.value,
            requisicao: novaRequisicao.value
        });
        codigoMensagem.value = response.data.codigo;
        toast.add({ severity: 'success', summary: 'Sucesso', life: 3000, detail: t('liberation_successful') });
        codigo.value = response.data.codigo;
        AbrirDialogoCodigo.value = true;
    } catch (error) {
        erroMensagem.value = error.message || t('liberation_error');
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: erroMensagem.value });
    }
};

async function carregarDIPsComPosicoes() {
    dipsComPosicoes.value = []; // limpa

    if (!dmSelecionado.value) return;

    try {
        const response = await laService.listarDIPs(dmSelecionado.value);
        const dips = response.data;

        for (const dip of dips) {
            const responsePos = await laService.listarPosicoes({
                id_dm: dmSelecionado.value,
                dips: [{ tipo: dip.Tipo_Controladora, dip: dip.DIP }]
            });

            dipsComPosicoes.value.push({
                tipo: dip.Tipo_Controladora,
                dip: dip.DIP,
                posicoes: responsePos.data.map((p) => ({
                    index: p.Posicao, // mantém numeração real do banco
                    ocupado: p.ocupado || false, // se precisar marcar ocupação
                    item: p.item || null
                }))
            });
        }
    } catch (error) {
        console.error('Erro ao carregar DIPs e posições:', error);
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: 'Falha ao carregar DIPs e posições' });
    }
}

function aoClicarNaPosicao(pos) {
    posicaoSelecionada.value = pos.index;
    const item = itensAtuais.value.find((i) => i.Posicao === pos.index);

    if (item) {
        posicaoOcupada.value = true;
        detalhesPosicao.value = item;
    } else {
        posicaoOcupada.value = false;
        novaRequisicao.value = '';
    }

    dialogoPosicao.value = true;
}

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
    if (!novaRequisicao.value) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos' });
        return;
    }
    const novoItem = {
        id_dm: dmSelecionado.value,
        Posicao: posicaoSelecionada.value, // respeitando o campo usado no `gridPosicoes`
        nome_produto: 'Novo item manual', // você pode mudar conforme necessário
        requisicao: novaRequisicao.value
    };
    itensAtuais.value.push(novoItem);
    const cache = itemCache.value[dmSelecionado.value] || [];
    cache.push(novoItem);
    itemCache.value[dmSelecionado.value] = cache;
    console.log('Enviar para backend:', novoItem);
    dialogoPosicao.value = false;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item adicionado' });
}

onMounted(async () => {
    loading.value = true;
    try {
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
        <!-- Grid interno para organizar os campos de entrada -->
        <!-- 1. Select de DM -->
        <div class="lg:col-4 md:col-12 sm:col-12 mb-5">
            <label class="m-3 text-lg">DM:</label>
            <Select class="my-2 w-8" v-model="dmSelecionado" :options="listaArmarios" optionLabel="label" optionValue="value" @change="carregarDIPsComPosicoes" />
        </div>

        <div class="flex flex-wrap gap-2 container-portas text-center">
            <div v-for="dipItem in dipsComPosicoes" :key="dipItem.tipo + '_' + dipItem.dip" class="my-4 mx-2">
                <label class="text-md font-semibold">
                    {{ dipItem.tipo }}<span v-if="dipItem.tipo !== '2018'"> DIP {{ dipItem.dip }}</span>
                </label>
                <div class="grid-portas ml-2 mt-2">
                    <div v-for="pos in dipItem.posicoes" :key="pos.index" class="porta p-3 border-1 border-round font-bold cursor-pointer"
                        :style="{ backgroundColor: pos.ocupado ? '#ef4444' : '#22c55e', color: '#fff' }"
                        @click="aoClicarNaPosicao(pos)"
                    >
                        <div class="text-sm font-semibold">{{ t('position') }} {{ pos.index }}</div>
                        <div v-if="pos.ocupado && pos.item && pos.item.requisicao" class="text-xs mt-1">Req: {{ pos.item.requisicao }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botão para salvar as informações -->
        <div class="flex align-items-center justify-content-end field col-12">
            <Button label="Salvar" icon="pi pi-check" severity="info" @click="salvarRequisicao" class="full mt-2" />
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
                        <strong>{{ t('code') }}:</strong> {{ detalhesPosicao.codigo }}
                    </p>
                </div>
            </template>

            <template v-else>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="requisicao" class="mr-4">Nº Requisição: </label>
                        <InputText id="requisicao" class="full" v-model="novaRequisicao" />
                    </div>
                    <!-- <div class="field col-12">
                        <label>{{ t('withdrawal_deadline') }}</label>
                        <VueDatePicker v-model="novaDataLimite" showIcon :showOnFocus="false" :format="format" :locale="locale" auto-apply :enable-time-picker="false" />
                    </div> -->
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

<style scoped>
.container-portas {
    background-color: #e5e5e562; /* fundo cinza como no exemplo */
    justify-content: space-around;
}

.grid-portas {
    display: grid;
    grid-template-columns: repeat(2, auto); /* duas portas por linha */
    background-color: #e5e5e5; /* fundo cinza como no exemplo */
    padding: 10px;
    border-radius: 6px;
    width: fit-content; /* ajusta à quantidade de portas */
}

.porta {
    width: 80px;
    height: 60px;
}
</style>
