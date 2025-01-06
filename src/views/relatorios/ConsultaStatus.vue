<script setup>
// Importa funções e componentes necessários do Vue
import { ref, onMounted } from 'vue'; // Funções para reatividade e ciclo de vida
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente de seleção de data
import axios from '@/axios.js'; // Instância do axios para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Store de autenticação para acessar dados do usuário
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de loading para indicar requisições em andamento

// Variáveis reativas
const liberAv = ref([ // Opções de filtro para as liberações avulsas (matrícula ou voucher)
    { label: 'Matrícula', value: '1' },
    { label: 'Voucher', value: '2' }
]);

const loading = ref(false); // Controle do estado de carregamento
const relatorio = ref({ // Dados para a busca de liberações avulsas
    busca: ''
});
const LiberacaoAvulsa = ref([]); // Armazenamento dos dados do relatório de liberações avulsas

const modalVisible = ref(false); // Controle de visibilidade do modal para alterar prazo
const novoPrazo = ref(''); // Variável para armazenar o novo prazo selecionado

const integracao = ref(null); // Valor selecionado no radio button para definir o tipo de filtro (matrícula ou voucher)
const userid = ref(''); // Valor do input de matrícula ou voucher
const store = useAuthStore(); // Acesso à store de autenticação para pegar os dados do usuário logado

// Mock de dados para exibição na tabela
const libMock = ref([ 
    { status: 'Ativo', voucher: 'A123', matricula: 'BTK123', nome: 'Alguém', dataliberacao: '00/00/0000', nome2: 'Ninguém', token: '27', dataret: '32/13/3000', dm: '10', compartimento: '6' },
    { status: 'Inativo', voucher: 'B456', matricula: 'BTK456', nome: 'Não sei', dataliberacao: '00/00/0000', nome2: 'Ninguém', token: '27', dataret: '32/13/3000', dm: '6', compartimento: '10' }
]);

/**
 * Função para gerar o relatório de liberações avulsas.
 * Envia dados do filtro (matrícula ou voucher) para o backend e retorna os dados correspondentes.
 */
const relatorioLA = async () => {
    loading.value = true; // Inicia o carregamento

    const data = { 
        id_cliente: store.userIdCliente, // ID do cliente vindo da store de autenticação
        id_usuario: store.userId, // ID do usuário logado
        tipo_filtro: integracao.value, // Tipo de filtro (1 para Matrícula, 2 para Voucher)
        valor_filtro: userid.value // Valor a ser filtrado (matrícula ou voucher)
    };

    try {
        // Faz a requisição POST para o backend com os dados fornecidos
        const response = await axios.post('/Estoque/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Adiciona o token de autorização no cabeçalho
            }
        });
        LiberacaoAvulsa.value = response.data; // Armazena os dados da resposta na variável LiberacaoAvulsa
    } catch (error) {
        // Caso ocorra um erro, exibe no console e exibe uma mensagem de erro
        console.error('Erro ao gerar o Relatório de Liberações Avulsas:', error); // Exibe erro no console
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar o relatório.', life: 3000 }); // Mensagem de erro
    } finally {
        loading.value = false; // Finaliza o carregamento independentemente do sucesso ou falha
    }
};

const selectedItem = ref(null); // Variável para armazenar o item selecionado na tabela

/**
 * Função chamada quando uma linha da tabela é selecionada.
 * Exibe o modal para alterar o prazo de retirada.
 */
const onRowSelect = (event) => {
    selectedItem.value = event.data; // Armazena o item selecionado
    modalVisible.value = true; // Mostra o modal
};

/**
 * Função para salvar o novo prazo de retirada.
 * (Lógica de salvar não implementada, apenas exibe o valor no console por enquanto)
 */
const salvar = () => {
    // Implementar lógica para salvar o novo prazo
    console.log('Novo Prazo:', novoPrazo.value); // Exibe o novo prazo no console
    modalVisible.value = false; // Fecha o modal após salvar
};

/**
 * Função para fechar o modal sem salvar.
 */
const fechar = () => {
    modalVisible.value = false; // Fecha o modal
};

/**
 * Função para lidar com a seleção de linha na tabela, chamando a função onRowSelect.
 * @param {Object} event - O evento de seleção da linha.
 */
const handleRowSelection = async (event) => {
    await onRowSelect(event); // Chama a função para tratar a seleção da linha
};

// Função chamada quando o componente for montado (comentada pois a fetch ainda não está implementada)
// onMounted(() => {
//     // fetchbusca();
// });
</script>

<template>
    <div class="card vh">
        <h5 class="my-4 mx-3">Consultar Status de Liberações Avulsas</h5>
        <div class="card">
            <!-- Container principal com duas colunas -->
            <div class="grid">
                <!-- Coluna 1: Filtrar por e Radio Buttons -->
                <div class="lg:col-6 md:col-12 sm:col-12 align-items-center">
                    <label for="liberAv" class="ml-3 mt-3">Filtrar por:</label>
                    <div class="flex flex-wrap">
                        <div v-for="option in liberAv" :key="option.value" class="flex align-items-center mt-3 ml-4">
                            <RadioButton v-model="integracao" :inputId="option.value" class="ml-4" name="searchOption" :value="option.value" />
                            <label :for="option.value" class="ml-2">{{ option.label }}</label>
                        </div>
                    </div>
                </div>

                <!-- Coluna 2: Campo de busca e botão de filtro -->
                <div class="lg:col-6 md:col-12 flex-column lg:flex-row align-items-center justify-content-end flex">
                    <div class="mb-3 lg:mb-0">
                        <div v-if="integracao === '1'" class="align-items-center">
                            <label for="userid" class="mr-2 nowrap">Informe a matrícula:</label>
                            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
                        </div>
                        <div v-if="integracao === '2'" class="align-items-center">
                            <label for="userid" class="mr-2 nowrap">Informe o voucher:</label>
                            <InputText id="userid" v-model="userid" class="my-2 w-full" required />
                        </div>
                    </div>
                    <Button class="mt-3 w-20rem ml-2" style="width: 160px" type="button" label="Filtrar" icon="pi pi-search" severity="info" @click="libMock" />
                </div>
            </div>

            <!-- Tabela de resultados -->
            <DataTable class="mt-2" selectionMode="single" :value="libMock" stripedRows showGridlines paginator :rows="10" dataKey="SKU" @row-select="handleRowSelection" :rowsPerPageOptions="[5, 10, 20, 50]" :tableStyle="{ width: '100%' }">
                <!-- Definição das colunas da tabela -->
                <Column field="status" header="Status"></Column>
                <Column field="voucher" header="Voucher"></Column>
                <Column field="matricula" header="Matrícula"></Column>
                <Column field="nome" header="Nome"></Column>
                <Column field="dataliberacao" header="Data da Liberação"></Column>
                <Column field="nome2" header="Liberado por"></Column>
                <Column field="token" header="Token"></Column>
                <Column field="dataret" header="Data de retirada"></Column>
                <Column field="dm" header="DM"></Column>
                <Column field="compartimento" header="Compartimento"></Column>
            </DataTable>
            <LoadingSpinner v-if="loading" /> <!-- Exibe o componente de carregamento -->
            
            <!-- Modal para alterar prazo -->
            <Dialog :header="selectedItem ? `Alterar Prazo de Retirada: ${selectedItem.nome}` : 'Alterar Prazo de Retirada'" v-model:visible="modalVisible" modal>
                <div v-if="selectedItem">
                    <label for="novoPrazo">Novo Prazo:</label>
                    <InputText id="novoPrazo" v-model="novoPrazo" class="w-full mt-2" />
                </div>
                <div class="mt-4">
                    <Button label="Salvar" @click="salvar" />
                    <Button label="Cancelar" class="p-button-secondary" @click="fechar" />
                </div>
            </Dialog>
        </div>
    </div>
</template>

<style scoped>
/* Estilos gerais para os componentes */
.card {
    overflow-x: auto;
    padding: 1rem;
    position: relative;
}

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.drop {
    width: 100%;
}

.nowrap {
    white-space: nowrap;
}

@media (max-width: 768px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
    .box {
        width: 50vw;
    }
}

@media (min-width: 769px) {
    .box {
        width: 40vw;
    }
}

@media (min-width: 900px) {
    .box {
        width: 30vw;
    }
}

.card {
    overflow: hidden; /* Garante que o conteúdo não transborde */
    box-sizing: border-box; /* Inclui o padding e borda no cálculo do tamanho do elemento */
}
</style>
