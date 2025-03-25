<script setup>

import { ref, onMounted } from 'vue';  // Importa as funções 'ref' e 'onMounted' do Vue para criar variáveis reativas e executar código quando o componente for montado

import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente 'VueDatePicker', provavelmente utilizado para selecionar datas na interface 

import axios from '@/axios.js';  // Importa a instância do axios configurada para realizar requisições HTTP, utilizando o arquivo de configuração '@/axios.js'

import { useAuthStore } from '@/store/authStore.js'; // Importa a função 'useAuthStore' do store de autenticação, usada para acessar o estado de autenticação global da aplicação 

import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente 'LoadingSpinner', que provavelmente é usado para exibir um indicador de carregamento na interface 

import relatorioService  from '@/services/relatorioService.js'; // Importa o serviço 'relatorioService', utilizado para interagir com a lógica de geração de relatórios 

const liberAv = ref([  // Cria uma referência reativa chamada 'liberAv', que armazena as opções de liberação
    { label: 'Matrícula', value: '1' },  // A primeira opção, com o rótulo 'Matrícula' e valor '1'
    { label: 'Voucher', value: '2' }     // A segunda opção, com o rótulo 'Voucher' e valor '2'
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
            <DataTable 
            class="mt-2" 
            selectionMode="single" 
            :value="libMock" 
            stripedRows 
            showGridlines 
            paginator 
            :rows="10" 
            dataKey="SKU" 
            @row-select="handleRowSelection" 
            :rowsPerPageOptions="[5, 10, 20, 50]" 
            :tableStyle="{ width: '100%' }">

            <!-- A tabela exibe os dados provenientes de 'libMock', com informações configuradas conforme o modelo de dados. -->
<!-- As linhas da tabela são listradas para alternar as cores de fundo entre linhas ímpares e pares, melhorando a legibilidade. -->
<!-- As linhas de grade (linhas de divisão) são exibidas para separar as células da tabela e melhorar a visualização. -->
<!-- A tabela usa paginação para mostrar os dados em múltiplas páginas, com 10 itens por página, mas com opções para o usuário selecionar 5, 10, 20 ou 50 itens por página. -->
<!-- Quando uma linha é selecionada, o evento 'row-select' é disparado e a função 'handleRowSelection' é chamada para processar a seleção. -->
<!-- O campo 'SKU' é utilizado como a chave única para identificar cada linha na tabela. -->
<!-- A tabela ocupa 100% da largura disponível dentro do seu contêiner. -->
 
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
            <Dialog :header="selectedItem ? `Alterar Prazo de Retirada: ${selectedItem.nome}` : 'Alterar Prazo de Retirada'" v-model:visible="modalVisible" modal :draggable="false">
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
