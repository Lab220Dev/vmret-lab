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
        <Dialog v-model:visible="showDialog" header="Detalhes da Máquina" :modal="true" :closable="true" :style="{ width: '50vw' }">
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
            <DataTable v-model:expandedRows="expandedRows" :value="selectedMachine?.lastWithdrawals || []" responsiveLayout="scroll"  dataKey="id_retirada">
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
import { ref, computed } from 'vue';

const props = defineProps({
    clientes: Array
});

// Reatividade para o Dialog
const showDialog = ref(false);
const selectedMachine = ref(null);
const expandedRows = ref([]);

const showMachineDetails = (machine) => {
    if (!machine) return;

    // Atualiza os dados da máquina selecionada
    selectedMachine.value = {
        ...machine,
        lastNotification: machine.lastNotification || 'Não disponível',
        lastPing: machine.lastPing || 'Desconhecido',
        lastWithdrawals: machine.lastWithdrawals || [] // Deve conter um array de objetos [{ id, data, produto }]
    };

    // Exibe o dialog
    showDialog.value = true;
    console.log(selectedMachine.value.lastWithdrawals)
};

// Calcula o número máximo de máquinas para alinhar o grid
const maxMachines = computed(() => {
    if (!props.clientes || props.clientes.length === 0) {
        return 0; // Nenhum cliente, nenhum grid
    }
    return Math.max(...props.clientes.map((client) => client.dms?.length || 0));
});

// Determina a classe de estilo com base no status da máquina
const getMachineStatusClass = (machine) => {
    if (!machine) return 'unknown';
    return machine.status === 'online' ? 'online' : 'offline';
};

// Verifica se os dados estão carregados
const isDataLoaded = computed(() => {
    return props.clientes && props.clientes.length > 0;
});

// Placeholders para Skeletons
const maxMachinesPlaceholder = 5; // Número de máquinas fictício
const clientsPlaceholder = 3; // Número de clientes fictício

// Dados para o gráfico no Dialog
const chartData = computed(() => {
    return selectedMachine.value?.chartData || { labels: [], datasets: [] };
});

const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
            position: 'top'
        }
    },
    scales: {
        y: {
            type: 'category',
            labels: ['Online', 'Offline'],
            ticks: {
                font: { size: 14 }
            },
            grid: { display: true }
        },
        x: {
            ticks: {
                font: { size: 14 }
            },
            grid: { display: false }
        }
    },
    elements: {
        point: { radius: 5 }
    }
};
</script>

<style>
/* Container Principal */
.heatmap-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
/* Card de Detalhes */
.details-card {
    margin-top: 20px;
    padding: 20px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
/* Cabeçalho do Card */
.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
/* Lista de Retiradas */
.withdrawals-list {
    list-style-type: none;
    padding: 0;
    margin: 10px 0;
}
.withdrawals-list li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
}

.withdrawals-list i {
    margin-right: 10px;
    color: #4caf50;
}
/* Linha do Heatmap */
.heatmap-row {
    display: grid;
    grid-template-columns: 200px repeat(var(--max-machines), 1fr); /* Substituir por variável CSS */
    align-items: center;
    gap: 5px;
}
/* Gráfico */
.chart-container {
    margin-top: 20px;
    height: 300px;
}

/* Estilos do Heatmap */
.clickable {
    cursor: pointer;
}
/* Célula com Status */
.heatmap-cell {
    text-align: center;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

/* Estilo do Cabeçalho */
.header-row .heatmap-cell {
    font-weight: bold;
    background-color: #f4f4f4;
}

/* Nome do Cliente */
.client-cell {
    font-weight: bold;
    background-color: #f9f9f9;
}

/* Status das Máquinas */
.online {
    background-color: #4caf50;
    color: white;
}

.offline {
    background-color: #f44336;
    color: white;
}

.unknown {
    background-color: #e0e0e0;
    color: black;
}
</style>
