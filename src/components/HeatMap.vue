<template>
    <div class="card heatmap-container" :style="{ '--max-machines': maxMachines }">
        <!-- Verificar se os dados estão carregados -->
        <template v-if="isDataLoaded">
            <!-- Cabeçalho do Heatmap -->
            <div class="heatmap-row header-row">
                <div class="heatmap-cell header-cell">Cliente</div>
                <div v-for="index in maxMachines" :key="index" class="heatmap-cell header-cell">Máquina {{ index }}</div>
            </div>

            <!-- Corpo do Heatmap -->
            <div v-for="cliente in clientes" :key="cliente.id" class="heatmap-row">
                <!-- Nome do Cliente -->
                <div class="heatmap-cell client-cell">{{ cliente.nome }}</div>

                <!-- Status das Máquinas -->
                <div v-for="index in maxMachines" :key="index" class="heatmap-cell clickable" :class="getMachineStatusClass(cliente.dms?.[index - 1])" @click="showMachineDetails(cliente.dms?.[index - 1])">
                    {{ cliente.dms?.[index - 1]?.status || 'N/A' }}
                </div>
            </div>
        </template>

        <!-- Skeleton quando os dados ainda estão sendo carregados -->
        <template v-else>
            <div class="heatmap-row header-row">
                <div class="heatmap-cell header-cell">
                    <Skeleton width="100%" height="20px" />
                </div>
                <div v-for="index in maxMachinesPlaceholder" :key="index" class="heatmap-cell header-cell">
                    <Skeleton width="100%" height="20px" />
                </div>
            </div>
            <div v-for="index in clientsPlaceholder" :key="index" class="heatmap-row">
                <div class="heatmap-cell client-cell">
                    <Skeleton width="80%" height="20px" />
                </div>
                <div v-for="index in maxMachinesPlaceholder" :key="index" class="heatmap-cell">
                    <Skeleton width="100%" height="20px" />
                </div>
            </div>
        </template>

        <!-- Pop-up com Detalhes da Máquina -->
        <Dialog v-model:visible="showDialog" header="Detalhes da Máquina" :modal="true" :closable="true" :style="{ width: '50vw' } " :draggable="false">
            <div>
                <p><strong>Nome:</strong> {{ selectedMachine?.name }}</p>
                <p><strong>Última Notificação:</strong> {{ selectedMachine?.lastNotification || 'Não disponível' }}</p>
                <p><strong>Último Ping Online:</strong> {{ selectedMachine?.lastPing || 'Desconhecido' }}</p>
            </div>

            <!-- Gráfico -->
            <div class="chart-container">
                <Chart type="line" :data="chartData" :options="chartOptions" />
            </div>

            <!-- DataTable com Últimas Retiradas -->
            <h5>Últimas Retiradas</h5>
            <DataTable 
            v-model:expandedRows="expandedRows" 
            :value="selectedMachine?.lastWithdrawals || []" 
            responsiveLayout="scroll"  
            dataKey="id_retirada">

            <!-- Vincula as linhas expandidas à variável reativa "expandedRows", permitindo controle sobre quais linhas estão expandidas -->
            <!-- Define o valor da tabela como as retiradas da máquina selecionada (selectedMachine). Caso não haja dados, utiliza um array vazio -->
            <!-- Define o layout responsivo para que a tabela seja rolável quando a tela for estreita -->
            <!-- Define a chave única "id_retirada" para cada linha da tabela, usada para identificar de forma exclusiva os itens de dados -->
            
                <Column expander style="width: 3rem"></Column>
                <Column field="id_retirada" header="ID"></Column>
                <Column field="id_funcionario" header="Funcionário"></Column>
                <Column field="forma_autenticacao" header="Autenticação"></Column>

                <template #expansion="slotProps">
                    <h5>Itens da Retirada {{ slotProps.data.id_retirada }}</h5>
                    <ul>
                        <li v-for="item in slotProps.data.itens" :key="item.sku">{{ item.nome }} - Qtd: {{ item.quantidade }} (SKU: {{ item.sku }})</li>
                    </ul>
                </template>
            </DataTable>
            <template #footer>
                <Button label="Fechar" icon="pi pi-times" class="p-button-danger" @click="showDialog = false" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
// Importa funções da Vue para reatividade e computação
import { ref, computed } from 'vue'; // ref é usado para criar variáveis reativas e computed para variáveis derivadas

/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {Array<clientes>} clientes - Lista de clientes recebida como propriedade do componente
 */
const props = defineProps({//defineProps é usado para definir as propriedades do componente
    clientes: Array // Define que a propriedade 'clientes' será um array, sendo a lista de clientes
});

// Reatividade para o Dialog
const showDialog = ref(false); // A variável reativa 'showDialog' controla a visibilidade do diálogo (false significa que o diálogo está fechado)
const selectedMachine = ref(null); // A variável reativa 'selectedMachine' armazena os dados da máquina selecionada (inicialmente null)
const expandedRows = ref([]); // A variável reativa 'expandedRows' mantém o estado das linhas expandidas (inicialmente um array vazio)

// Função que mostra os detalhes da máquina selecionada
/**
 * Exibe os detalhes da máquina selecionada no diálogo.
 *
 * @param {Object} machine - O objeto da máquina a ser exibido
 */
const showMachineDetails = (machine) => {//função para exibir os detalhes da máquina selecionada
    if (!machine) return; // Se a máquina não for válida (null ou undefined), não faz nada

    // Atualiza os dados da máquina selecionada
    selectedMachine.value = {//atualiza os dados da máquina selecionada
        ...machine, // Espalha todas as propriedades da máquina selecionada
        lastNotification: machine.lastNotification || 'Não disponível', // Se lastNotification não existir, define um valor padrão
        lastPing: machine.lastPing || 'Desconhecido', // Se lastPing não existir, define um valor padrão
        lastWithdrawals: machine.lastWithdrawals || [] // Se lastWithdrawals não existir, define um array vazio
    };

    // Exibe o diálogo após a seleção
    showDialog.value = true; // Atualiza a variável 'showDialog' para true, fazendo o diálogo aparecer
    console.log(selectedMachine.value.lastWithdrawals); // Exibe no console os 'lastWithdrawals' da máquina selecionada
};

// Calcula o número máximo de máquinas para alinhar o grid
/**
 * Calcula o número máximo de máquinas a serem exibidas, baseado na quantidade de DM's de cada cliente.
 *
 * @returns {number} O número máximo de máquinas baseado na maior quantidade de DM's de um cliente
 */
const maxMachines = computed(() => {//função para calcular o número máximo de máquinas
    if (!props.clientes || props.clientes.length === 0) {//se não houver clientes ou a lista de clientes estiver vazia
        return 0; // Se a lista de clientes estiver vazia ou não existir, retorna 0, ou seja, não há máquinas para exibir
    }
    return Math.max(...props.clientes.map((client) => client.dms?.length || 0)); // Calcula o número máximo de DM's para alinhar o grid
});

// Determina a classe de estilo com base no status da máquina
/**
 * Retorna a classe de estilo apropriada para o status da máquina.
 * Se a máquina estiver online, a classe será 'online', caso contrário, será 'offline'.
 *
 * @param {Object} machine - O objeto que representa a máquina
 * @returns {string} A classe de status da máquina ('online' ou 'offline')
 */
const getMachineStatusClass = (machine) => {//função para determinar a classe de estilo com base no status da máquina
    if (!machine) return 'unknown'; // Se a máquina não for válida, retorna 'unknown' (status desconhecido)
    return machine.status === 'online' ? 'online' : 'offline'; // Se o status da máquina for 'online', retorna 'online', caso contrário, 'offline'
};

// Verifica se os dados estão carregados
/**
 * Verifica se os dados dos clientes estão carregados.
 *
 * @returns {boolean} Retorna verdadeiro se os dados dos clientes estiverem carregados (cliente existe e lista não está vazia)
 */
const isDataLoaded = computed(() => {//função para verificar se os dados dos clientes estão carregados
    return props.clientes && props.clientes.length > 0; // Retorna true se a lista de clientes não for nula e tiver pelo menos um cliente
});

// Placeholders para Skeletons
const maxMachinesPlaceholder = 5; // Número de máquinas fictícias para exibição enquanto os dados reais estão sendo carregados
const clientsPlaceholder = 3; // Número de clientes fictícios para exibição enquanto os dados reais estão sendo carregados

// Dados para o gráfico no Dialog
/**
 * Dados computados para o gráfico dentro do diálogo.
 * Se não houver dados, retorna um objeto vazio com arrays vazios.
 *
 * @returns {Object} Um objeto com dados para o gráfico (labels e datasets)
 */
const chartData = computed(() => {//função para fornecer os dados do gráfico no diálogo
    return selectedMachine.value?.chartData || { labels: [], datasets: [] }; // Se houver 'chartData' na máquina selecionada, retorna ele; caso contrário, retorna um objeto vazio
});

// Configurações do gráfico
/**
 * Configurações de opções para o gráfico exibido no diálogo.
 * As configurações incluem ajustes no comportamento da legenda, escalas e elementos do gráfico.
 */
const chartOptions = {//configurações do gráfico
    maintainAspectRatio: false, // A largura e altura do gráfico podem ser ajustadas de acordo com o tamanho do container
    responsive: true, // O gráfico será responsivo e se ajustará ao tamanho da tela
    plugins: {//plugins do gráfico
        legend: {//configurações da legenda
            position: 'top' // A legenda será posicionada no topo do gráfico
        }
    },
    scales: {//configurações das escalas
        y: {//escala Y
            type: 'category', // O eixo Y será categórico
            labels: ['Online', 'Offline'], // As categorias para o eixo Y são 'Online' e 'Offline'
            ticks: {//marcas no eixo Y
                font: { size: 14 } // Define o tamanho da fonte para as marcas no eixo Y
            },
            grid: { display: true } // Exibe a grade para o eixo Y
        },
        x: {//escala X
            ticks: {//marcas no eixo X
                font: { size: 14 } // Define o tamanho da fonte para as marcas no eixo X
            },
            grid: { display: false } // Não exibe a grade para o eixo X
        }
    },
    elements: {//configurações dos elementos do gráfico
        point: { radius: 5 } // Define o tamanho dos pontos no gráfico como 5px
    }
};

</script>

<style>
/* Container Principal */
.heatmap-container {/*container principal*/
    display: flex;/*exibe os elementos em linha*/
    flex-direction: column;/*alinha os elementos em coluna*/
    gap: 10px;/*define o espaçamento entre os elementos*/
}
/* Card de Detalhes */
.details-card {/*card de detalhes*/
    margin-top: 20px;/*margem superior de 20px*/
    padding: 20px;/*preenchimento de 20px*/
    border-radius: 8px;/*borda arredondada de 8px*/
    background-color: #fff;/*fundo branco*/
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);/*sombra sutil*/
}
/* Cabeçalho do Card */
.details-header {/*cabeçalho do card*/
    display: flex;/*exibe os elementos em linha*/
    justify-content: space-between;/*alinha os elementos ao redor*/
    align-items: center;/*alinha os elementos ao centro*/
    margin-bottom: 20px;/*margem inferior de 20px*/
}
/* Lista de Retiradas */
.withdrawals-list {/*lista de retiradas*/
    list-style-type: none;/*remove a estilização padrão da lista*/
    padding: 0;/*remove o preenchimento da lista*/
    margin: 10px 0;/*margem de 10px acima e abaixo*/
}
.withdrawals-list li {/*elementos da lista*/
    display: flex;/*exibe os elementos em linha*/
    align-items: center;/*alinha os elementos ao centro*/
    margin-bottom: 10px;/*margem inferior de 10px*/
    font-size: 14px;/*tamanho da fonte de 14px*/
}

.withdrawals-list i {/*ícone da lista*/
    margin-right: 10px;/*margem à direita de 10px*/
    color: #4caf50;/*cor verde*/
}
/* Linha do Heatmap */
.heatmap-row {
    display: grid;/*exibe os elementos em grid*/
    grid-template-columns: 200px repeat(var(--max-machines), 1fr); /* Substituir por variável CSS */
    align-items: center;/*alinha os elementos ao centro*/
    gap: 5px;/*espaçamento de 5px*/
}
/* Gráfico */
.chart-container {/*container do gráfico*/
    margin-top: 20px;/*margem superior de 20px*/
    height: 300px;/*altura de 300px*/
}

/* Estilos do Heatmap */
.clickable {/*elementos clicáveis*/
    cursor: pointer;/*cursor de ponteiro*/
}
/* Célula com Status */
.heatmap-cell {/*célula do heatmap*/
    text-align: center;/*alinha o texto ao centro*/
    padding: 8px;/*preenchimento de 8px*/
    border: 1px solid #ddd;/*borda de 1px sólida cinza*/
    border-radius: 4px;/*borda arredondada de 4px*/
    font-size: 14px;/*tamanho da fonte de 14px*/
}

/* Estilo do Cabeçalho */
.header-row .heatmap-cell {/*célula do cabeçalho*/
    font-weight: bold;  /* Define o texto em negrito */
    background-color: #f4f4f4;  /* Define a cor de fundo */
}

/* Nome do Cliente */
.client-cell {  /* Define o estilo da célula do cliente */
    font-weight: bold;  /* Define o texto em negrito */
    background-color: #f9f9f9;  /* Define a cor de fundo */
}

/* Status das Máquinas */
.online {   /* Define o estilo para máquinas online */
    background-color: #4caf50;  /* Define a cor de fundo */
    color: white;   /* Define a cor do texto */
}

/* Estilos de Status */
.offline {  /* Define o estilo para máquinas offline */
    background-color: #f44336;  /* Define a cor de fundo */
    color: white;   /* Define a cor do texto */
}
/* Status Desconhecido */
.unknown {  /* Define o estilo para status desconhecido */
    background-color: #e0e0e0;  /* Define a cor de fundo */
    color: black;   /* Define a cor do texto */
}
</style>
