<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para seleção de datas
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o estilo do VueDatePicker
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'; // Importa os hooks do Vue (ref, onMounted, etc.)
import axios from '@/axios.js'; // Importa o axios para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de loading (spinner)
const store = useAuthStore(); // Instancia o store de autenticação

/* Dados mockados para o relatório */
const relatorio = ref({
    id_DM: '', // ID da DM (Data Migration)
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data de início do relatório (primeiro dia do mês)
    data_final: new Date() // Data final do relatório (data atual)
});

const loading = ref(false); // Variável reativa para controlar o estado de carregamento
const dms = ref([]); // Variável reativa para armazenar a lista de DMs
const formatedDms = ref([]); // Lista reativa para armazenar os DMs formatados (não utilizada atualmente)
const select1 = ref(null); // Referência para o primeiro select 

// Função que será chamada quando o componente for montado
onMounted(() => {
    fetchDMS(); // Carrega os DMs ao montar o componente
});

/**
 * Função para buscar a lista de DMs do servidor
 * Espera-se que a resposta contenha uma lista de DMs.
 * Se a requisição falhar, um erro será mostrado no console.
 */
const fetchDMS = async () => {
    loading.value = true; // Ativa o estado de carregamento
    const data = {
        id_cliente: store.userIdCliente // Passa o ID do cliente autenticado
    };
    try {
        // Realiza a requisição POST para buscar os DMs
        const response = await axios.post('/Estoque/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Passa o token de autenticação no cabeçalho
            }
        });
        // Mapeia a resposta para um formato esperado para a select 
        dms.value = response.data.map(({ ID_DM, Numero }) => ({
            label: `${Numero}`, // Exibe o número da DM como label
            value: ID_DM // O ID da DM será o valor selecionado
        }));
    } catch (error) {
        console.error('Erro ao listar DMS:', error); // Caso ocorra um erro, loga no console
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função para formatar uma data no formato dd/MM/yyyy.
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada no padrão "dd/MM/yyyy"
 */
const format = (date) => {
    const day = date.getDate(); // Pega o dia da data
    const month = date.getMonth() + 1; // Pega o mês da data (+1, pois os meses começam de 0)
    const year = date.getFullYear(); // Pega o ano da data

    return `${day}/${month}/${year}`; // Retorna a data formatada
};

const dt = ref(null); // Referência para a DataTable (não utilizada diretamente)

const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Cria o cabeçalho do CSV com as chaves dos objetos
    const rows = data.map((row) => Object.values(row).join(',')).join('\n'); // Cria as linhas do CSV com os valores dos objetos
    return `${headers}\n${rows}`; // Junta o cabeçalho com as linhas e retorna como string CSV
};

/**
 * Função para exportar os dados como CSV.
 * Espera-se que o array 'retiradas' contenha os dados.
 * Se o array não estiver presente ou não for válido, um erro será logado no console.
 */
const exportCSV = () => {
    if (Array.isArray(retiradas.value)) {
        // Verifica se 'retiradas' é um array
        // Agrega detalhes de cada produto
        const detalhesAgregados = retiradas.value.flatMap((produto) => {
            if (Array.isArray(produto.Detalhes)) {
                // Verifica se 'Detalhes' é um array
                return produto.Detalhes; // Retorna os detalhes se forem válidos
            } else {
                console.warn(`Detalhes não é um array para o produto ${produto.ProdutoID}`); // Se 'Detalhes' não for um array, loga um aviso
                return []; // Retorna um array vazio
            }
        });

        // Gera o conteúdo CSV
        const csvContent = generateCSV(detalhesAgregados);

        // Cria um Blob e link para download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Items_Mais_Retiradas.csv'); // Define o nome do arquivo a ser baixado
        document.body.appendChild(link);
        link.click(); // Simula um clique para iniciar o download
        document.body.removeChild(link); // Remove o link do DOM após o clique
    } else {
        console.error('retiradas.value não é um array.'); // Loga um erro se 'retiradas' não for um array
    }
};

/**
 * Função para exportar os dados como JSON.
 * Espera-se que 'retiradas' seja um array válido.
 * Caso contrário, o JSON gerado estará vazio.
 */
const exportJSON = () => {
    const jsonContent = JSON.stringify(retiradas.value, null, 2); // Converte o array de retiradas para um JSON formatado
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' }); // Cria um Blob com o conteúdo JSON
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'RetiradasRealizadas.json'); // Define o nome do arquivo a ser baixado
    document.body.appendChild(link);
    link.click(); // Simula um clique para iniciar o download
    document.body.removeChild(link); // Remove o link do DOM após o clique
};

/**
 * Função que fecha todos os select s caso estejam abertos.
 * Verifica se o Select está visível e o fecha.
 */
const closeAllselects = () => {
    if (select1.value?.overlayVisible)select1.value.hide(); // Verifica se o select 1 está visível e o esconde
};

/**
 * Função que é chamada quando o datepicker é aberto.
 * Fecha todos os select s ao abrir o datepicker.
 */
const handleDatepickerOpen = () => {
    closeAllselects(); // Fecha todos os select s quando o datepicker é aberto
};
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <h5 class="my-4 text-2xl">Métricas da DM</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Div de busca de informações para o relatório -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <!-- Select para selecionar a DM -->
                        <Select class="drop" v-model="relatorio.dm" :options="dms" optionLabel="label" optionValue="value" placeholder="Todos" ref="select 1" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Inicial:</label>
                        <!-- DatePicker para selecionar a data inicial -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            :enable-time-picker="false"
                            auto-apply
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                            placeholder="Selecione uma data inicial"
                        />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">Data Final:</label>
                        <!-- DatePicker para selecionar a data final -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            :enable-time-picker="false"
                            auto-apply
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                            placeholder="Selecione uma data final"
                        />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <!-- Botão de filtrar -->
                        <Button class="filtrar" type="button" label="Filtrar Dados" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <!-- Botão de exportação para CSV -->
                        <Button class="exportar" icon="pi pi-file" label="Exportar CSV" @click="exportCSV"></Button>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <!-- Botão de exportação para JSON -->
                        <Button class="exportar" icon="pi pi-file" label="Exportar JSON" @click="exportJSON"></Button>
                    </div>
                </div>
                <!-- DataTable do relatório -->
                <div class="datatable-wrapper">
                    <DataTable :value="dms" stripedRows showGridlines rowHover :tableStyle="{ width: '100%' }" ref="dt">
                        <!--
    A tabela exibe os dados provenientes de 'dms', que contém as informações sobre os DM (Documentos de Movimentação ou algo semelhante).

    - **:value="dms"**: A variável `dms` contém os dados que serão exibidos na tabela. Cada item de `dms` será exibido como uma linha na tabela.
    
    - **stripedRows**: Aplica um estilo alternado nas linhas da tabela, ou seja, as linhas ímpares terão um fundo diferente das linhas pares. Isso melhora a legibilidade dos dados ao visualizá-los.

    - **showGridlines**: Exibe as linhas de grade na tabela. As linhas de grade ajudam a organizar visualmente os dados, tornando a tabela mais clara e fácil de ler.

    - **rowHover**: Aplica um estilo de destaque nas linhas quando o mouse passa sobre elas. Isso facilita a interação, permitindo que o usuário identifique facilmente a linha sobre a qual o mouse está posicionado.

    - **:tableStyle="{ width: '100%' }"**: Define o estilo da tabela. Aqui, a tabela ocupará toda a largura disponível dentro do seu contêiner pai. Isso garante que a tabela se expanda para preencher a área disponível da tela ou do componente.

    - **ref="dt"**: A referência `dt` é atribuída à tabela. Isso permite acessar e manipular a tabela diretamente no código JavaScript do Vue.js. Por exemplo, você poderia usar `this.$refs.dt` para acessar a instância da tabela, o que pode ser útil para métodos de manipulação de dados ou outras interações programáticas com a tabela.
-->

                        <Column field="total" sortable header="Item"></Column>
                        <Column field="total" sortable header="Quantidade" class="text-center"></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
    <!-- Componente de carregamento (spinner) -->
    <LoadingSpinner v-if="loading" />
</template>

<style>
.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dialog-content {
    padding: 1rem;
}

.dialog-message {
    text-align: justify;
    margin: 0;
}

.card {
    overflow-x: auto;
}

.datatable-wrapper {
    overflow-x: auto;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
}

.drop {
    width: 100%;
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
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
    white-space: nowrap;
    text-align: left;
}
</style>
