<script setup>
import { FilterMatchMode } from 'primevue/api';  // Importa o modo de filtro para uso no DataTable do PrimeVue
import '@vuepic/vue-datepicker/dist/main.css';  // Importa o estilo do componente de data picker
import { ref, onMounted, computed } from 'vue';  // Importa o Vue para uso de referências reativas e lifecycle hooks
import axios from '@/axios.js';  // Importa a instância de axios configurada para realizar as requisições HTTP
import { useAuthStore } from '@/store/authStore.js';  // Importa o store de autenticação para acessar dados do usuário
import LoadingSpinner from '@/components/LoadingSpinner.vue';  // Importa o componente de loading spinner para exibição enquanto a página está carregando
import { useI18n } from 'vue-i18n';
import{isMobEnabled} from '@/helpers/HelperUtils.js';  
const { t } = useI18n();
// Refs para armazenar os dados e controlar o estado do componente
const loading = ref(false);  // Ref que controla o estado de carregamento
const store = useAuthStore();  // Acessa o store de autenticação para obter dados do cliente
const itens = ref([]);  // Ref que irá armazenar os itens não alocados retornados pela API
const sincronizado = ref(false);  // Ref que controla se a sincronização foi realizada
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }  // Configuração de filtro global (filtro por conteúdo)
});
const emptyMessage = computed(() => t('employee_no_availble_item'));  // Mensagem padrão quando não há itens retornados
const mob = ref(false);
/**
 * Função responsável por buscar os itens não alocados
 */
const fetchItensNaoAlocadas = async () => {
    const data = {
        id_cliente: store.userIdCliente  // Envia o ID do cliente, obtido do store de autenticação
    };

    loading.value = true;  // Ativa o estado de carregamento para mostrar o spinner

    try {
        // Realiza a requisição para o backend para recuperar os itens não alocados
        const response = await axios.post('/naoalocados/recuperar', data);
        
        itens.value = response.data;  // Armazena os itens retornados na variável `itens`
        
        // Se a resposta não contém itens, define a mensagem de "nenhum produto registrado"
        if (response.data.length === 0) {
            emptyMessage.value = t('external_product_empty');  // Atualiza a mensagem de "nenhum item encontrado"
        }

        sincronizado.value = false;  // Marca que ainda não foi realizada a sincronização

    } catch (error) {
        // Verifica se o erro é um 404, o que indica que não há dados disponíveis
        if (error.response && error.response.status === 404) {
            emptyMessage.value = t('external_product_empty');  // Atualiza a mensagem de erro se não encontrar dados
        } else {
            // Caso contrário, exibe uma mensagem de erro genérica
            emptyMessage.value = t('external_product_list_error');  // Exibe uma mensagem padrão de erro
            console.error('Erro ao carregar itens não alocados:', error);  // Exibe o erro no console para debug
        }
    } finally {
        loading.value = false;  // Finaliza o carregamento, independentemente de erro ou sucesso
    }
};

/**
 * Função responsável por sincronizar os itens não alocados com o backend
 */
const sincronizar = async () => {
    const data = {
        id_cliente: store.userIdCliente  // Envia o ID do cliente para a requisição de sincronização
    };

    loading.value = true;  // Ativa o estado de carregamento

    try {
        // Realiza a requisição para o backend para sincronizar os itens
        const response = await axios.post('/naoalocados/sincronizar', data);
        
        // Processa a resposta e mapeia os produtos e seus respectivos status
        itens.value = response.data.flatMap(cliente => 
            cliente.produtosComStatus.map(item => ({
                ...item.produto,  // Desestrutura o produto e mantém suas propriedades
                status: item.status  // Adiciona o status do produto à estrutura
            }))
        );

        sincronizado.value = true;  // Marca que a sincronização foi realizada

    } catch (error) {
        // Se ocorrer erro na sincronização, exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('external_product_list_sync_error'), life: 3000 }); // Mensagem de erro
        console.error('Erro ao sincronizar itens:', error);  // Loga o erro de sincronização
    } finally {
        loading.value = false;  // Finaliza o carregamento após a tentativa de sincronização
    }
};

// Chama a função de busca de itens não alocados quando o componente é montado
onMounted(() => {
    mob.value = isMobEnabled();
    fetchItensNaoAlocadas();  // Realiza a chamada para carregar os itens não alocados
});
</script>

<template>
    <div class="card vh">  <!-- Cartão de conteúdo -->
        <h5 class="my-4 text-2xl">{{t('external_product_title')}}</h5>  <!-- Título da seção -->

        <!-- Botão para sincronizar os dados com o backend -->
        <div class="mb-4 flex justify-content-end">
            <Button :label="$t('sync')" icon="pi pi-refresh" class="p-button-secondary" @click="sincronizar" :disabled="!mob" />
        </div>

        <!-- DataTable que exibe os itens não alocados -->
        <DataTable 
        v-model:filters="filters" 
        :value="itens"  
            stripedRows 
            showGridlines  
            paginator  
            removableSort  
            :rows="10"  
            :sortOrder="1"  
            :sortField="'codigo'"  
            :rowsPerPageOptions="[5, 10, 20, 50]" 
            rowHover  
            :globalFilterFields="['nome', 'quantidadeReferencia', 'codigo']"  
            selectionMode="single"  
            tableStyle="max-width: 100%; table-layout: fixed;" 
            >

            <!-- Cabeçalho da tabela -->
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div class="flex justify-content-start">
                        <span>{{$t('total_records')}} {{ itens.length }}</span>  <!-- Exibe o número total de registros -->
                    </div>
                    <div>
                        <IconField iconPosition="left">
                            <InputIcon> <!-- Campo de busca -->
                                <i class="pi pi-search" />  <!-- Ícone de busca -->
                            </InputIcon>
                            <InputText v-model="filters['global'].value"  :placeholder="t('search')" type="search" />  <!-- Campo de entrada para busca global -->
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- Mensagem a ser exibida caso a tabela esteja vazia -->
            <template #empty>{{ emptyMessage }}</template>

            <!-- Colunas da tabela -->
            <Column field="nome" sortable style="width: 70%" :header="t('item')"></Column>  <!-- Coluna de nome -->
            <Column field="quantidadeReferencia"  sortable class="text-center table-cell">
                <template #header>
                    <span v-tooltip="$t('quantity')">{{$t('quantity_short')}}</span>
                    <!-- Tooltip para a coluna de quantidade mínima -->
                </template></Column> <!-- Coluna de quantidade -->
            <Column field="codigo" sortable style="width: 10%; text-align: center" :header="t('ca')"></Column>  <!-- Coluna de código -->

            <!-- Coluna adicional de status, visível somente após sincronização -->
            <Column v-if="sincronizado" :header="t('status')">
                <template #body="slotProps">
                    <span>{{ slotProps.data.status }}</span>  <!-- Exibe o status do item -->
                </template>
            </Column>
        </DataTable>
    </div>

    <!-- Componente de loading spinner que aparece enquanto os dados estão sendo carregados -->
    <LoadingSpinner v-if="loading" />
</template>

<style lang="css" scoped>
.card {
    overflow-x: auto;  /* Permite rolagem horizontal na card */
}

.datatable-wrapper {
    overflow: hidden;  /* Impede que a tabela ultrapasse os limites visíveis */
    width: 100vw;  /* Define a largura da tabela como 100% da largura da tela */
}

.filtrar {
    margin-top: 25px;  /* Adiciona margem no topo da área de filtro */
}

.drop {
    width: 100%;  /* Define a largura do dropdown como 100% */
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;  /* Ajusta a largura e margem dos campos em telas pequenas */
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;  /* Impede que o texto quebre em várias linhas */
    text-align: left;  /* Alinha o texto à esquerda */
}
</style>
