<template>
    <!-- Título da seção de dados do evento -->
    <h1>Dados do evento</h1>
    
    <!-- Componente DataTable para exibir os dados em formato tabular -->
    <DataTable
        v-model:filters="filters"  
        :value="formattedData" 
        stripedRows 
        showGridlines 
        paginator 
        :rows="50" 
        :rowsPerPageOptions="[50, 100, 500, 1000]" 
        rowHover 
        :globalFilterFields="['Nome', 'Telefone', 'Email', 'Foto', 'Retirada', 'dia_retirada', 'hora_retirada', 'arquivo']" 
        
        :tableStyle="{ width: '100%' }" 
        :sortField="'nome'" 
        :sortOrder="1" 
    >

    <!-- A tabela exibe os dados provenientes de "formattedData" -->
<!-- Aplica um estilo de listrado nas linhas da tabela, melhorando a legibilidade -->
<!-- Exibe as linhas de grade para uma melhor visualização das células -->
<!-- Habilita a paginação, dividindo os dados em várias páginas -->
<!-- Define o número de linhas por página como 50, oferecendo ao usuário maior controle sobre a exibição -->
<!-- Permite ao usuário selecionar as linhas usando o campo global de pesquisa nos campos "Nome", "Telefone", etc. -->
<!-- Exibe a tabela com 100% da largura disponível, ajustando-se à área de exibição -->
<!-- Define o campo de ordenação inicial como "nome", com ordem crescente -->
 
        <!-- Template para o cabeçalho da tabela -->
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <!-- Exibe o total de registros -->
                    <span>Total de registros: {{ data.length }}</span>
                </div>
                <div>
                    <!-- Campo de busca global com ícone de pesquisa -->
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" /> <!-- Ícone de pesquisa -->
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                        <!-- Input para o filtro global, ligado ao valor da variável filters['global'].value -->
                    </IconField>
                </div>
            </div>
        </template>

        <!-- Template para quando não houver dados na tabela -->
        <template #empty> Nenhum registro encontrado </template>

        <!-- Definição das colunas da tabela -->
        <Column field="Nome" header="Nome" sortable /> <!-- Exibe a coluna de 'Nome' e torna-a ordenável -->
        <Column field="Telefone" header="Telefone" sortable /> <!-- Exibe a coluna de 'Telefone' e torna-a ordenável -->
        <Column field="Email" header="E-mail" sortable /> <!-- Exibe a coluna de 'Email' e torna-a ordenável -->

        <!-- Coluna para o campo 'dia_retirada', com formatação personalizada -->
        <Column field="dia_retirada" header="Dia" sortable>
            <template #body="slotProps">
                <!-- Exibe a data formatada para 'dia_retirada' -->
                {{ slotProps.data.dia_retirada_formatada }}
            </template>
        </Column>

        <Column field="hora_retirada" header="Hora" sortable /> <!-- Exibe a coluna de 'hora_retirada' e torna-a ordenável -->
        
        <!-- Coluna para o campo 'arquivo', com verificação de atualização -->
        <Column field="arquivo" header="Arquivo" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Exibe ícone de atualização se o campo 'arquivo' foi modificado -->
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('arquivo')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.arquivo }} <!-- Exibe o valor do arquivo -->
                </span>
            </template>
        </Column>

        <!-- Coluna para o campo 'Retirada', com verificação de atualização -->
        <Column field="Retirada" header="Retirada" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Exibe ícone de atualização se o campo 'Retirada' foi modificado -->
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Retirada')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Retirada }} <!-- Exibe o valor da retirada -->
                </span>
            </template>
        </Column>

        <!-- Coluna para o campo 'Video', com verificação de atualização -->
        <Column field="Video" header="Video" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Exibe ícone de atualização se o campo 'Video' foi modificado -->
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Video')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Video }} <!-- Exibe o valor do vídeo -->
                </span>
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
// Importação de funcionalidades do Vue
import { ref, onMounted, onUnmounted, h, computed } from 'vue';

// Computed property para formatar os dados de 'dia_retirada' para exibição
const formattedData = computed(() => {
    return data.value.map((item) => {
        if (item.dia_retirada) {
            // Se 'dia_retirada' estiver presente, formata a data para o formato correto
            const [day, month, year] = item.dia_retirada.split('/');
            const dateInBrasilia = new Date(year, month - 1, day, 0, 0, 0);
            dateInBrasilia.setHours(dateInBrasilia.getHours() + 3); // Ajuste para UTC-3

            // Retorna os dados com a data formatada
            return {
                ...item,
                dia_retirada: dateInBrasilia,
                dia_retirada_formatada: dateInBrasilia.toLocaleDateString('pt-BR') // Formato dd/mm/yyyy para exibição
            };
        } else {
            // Caso não haja 'dia_retirada', retorna dados com valor nulo para o campo de data
            return { ...item, dia_retirada: null, dia_retirada_formatada: '' };
        }
    });
});

// Variáveis reativas para os dados e filtros da tabela
const data = ref([]); // Dados da tabela
const filters = ref({ global: { value: null } }); // Filtros globais de busca

let eventSource; // Variável para armazenar a conexão com o EventSource

// Função chamada quando o componente é montado
onMounted(() => {
    // URL base da API, com fallback para localhost
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Conecta ao EventSource para receber atualizações em tempo real
    eventSource = new EventSource(`${baseURL}/evento/updateDados`);
    
    // Define a função que será chamada quando uma nova mensagem for recebida
    eventSource.onmessage = (event) => {
        try {
            // Tenta analisar os dados recebidos como JSON
            const updates = JSON.parse(event.data);
            
            // Se houver dados, atualiza a variável 'data' com os novos registros
            if (updates) {
                data.value = Array.isArray(updates) ? updates : [];
            } else {
                console.warn('Nenhuma atualização recebida.'); // Aviso se não houver atualizações
            }
        } catch (error) {
            // Exibe um erro no console se ocorrer algum problema ao processar os dados
            console.error('Erro ao processar dados do EventSource:', error);
        }
    };
});

// Função chamada quando o componente é desmontado
onUnmounted(() => {
    // Fecha a conexão com o EventSource ao desmontar o componente
    if (eventSource) {
        eventSource.close();
    }
});

// Função para definir a classe da linha com base no status do dado
function rowClass(data) {
    // Se a linha for nova, aplica a classe 'new-row'
    if (data.isNew) return 'new-row';
    
    // Se a linha tiver colunas atualizadas, aplica a classe 'updated-row'
    if (data.updatedColumns && data.updatedColumns.length > 0) return 'updated-row';
    
    // Caso contrário, não aplica nenhuma classe
    return '';
}
</script>

<style>
/* Estilo para as linhas novas, com fundo verde claro */
.new-row {
    background-color: #e0ffe0;
}

/* Estilo para as linhas atualizadas, com fundo laranja claro */
.updated-row {
    background-color: #fff5e6;
}

/* Estilo para o ícone de atualização (refresh) */
.updated-icon {
    margin-left: 5px;
}
</style>
