<!-- DMItemList.vue -->
<template>
    <div class="card">
        <h5 class="mt-2">Itens da DM</h5>
        <!-- Botão para adicionar itens à DM -->
        <Button class="m-1" label="Adicionar Itens" @click="emit('add-item')" />

        <div class="mt-5 mx-0 p-fluid grid">
            <!-- Tabela de Itens -->
            <DataTable :value="ListaItens" selectionMode="single" tableStyle="min-width: 25%"
                       :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false"
                       @rowSelect="handleRowSelection" paginator :rows="10">
                <!-- Coluna SKU -->
                <Column field="SKU" header="SKU"></Column>
                <!-- Coluna Produto -->
                <Column field="Nome_Produto" header="Produto"></Column>
                <!-- Coluna Controladora/Placa/Motor -->
                <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
                <!-- Coluna Quantidade -->
                <Column field="QTD" header="QTD"></Column>
                <!-- Coluna de Ação (Excluir) -->
                <Column style="min-width: 8rem">
                    <template #body="slotProps">
                        <!-- Botão de Exclusão -->
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                                @click="deleteItem(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
  
  <script setup>
  import { ref } from 'vue';// ref é usados para reatividade
  import axios from '@/axios.js'; //Instância configurada do Axios para fazer requisições HTTP
  import { useAuthStore } from '@/store/authStore.js';//Usando a store de autenticação para pegar dados do usuário autenticado
  
  const ListaItens = ref([]); //lista de itens, inicialmente vazia
  const store = useAuthStore(); //Usando a store de autenticação para acessar dados do usuário
  const loading = ref(false); //Flag de carregamento enquanto os dados estão sendo processados
  
// Função para carregar itens associados à DM
const fetchItemDM = async () => {
    loading.value = true;  // Ativa o estado de carregamento
    try {
        // Criação do objeto de dados a ser enviado na requisição
        const data = {
            id_dm: DM.ID_DM,  // Identificador único da DM
            id_cliente: store.userIdCliente,  // Identificador do cliente
            id_usuario: store.userId  // Identificador do usuário
        };

        // Realiza uma requisição POST para buscar os itens da DM
        const response = await axios.post('/DM/listaritens', data);

        // Atribui os itens retornados à lista de itens
        ListaItens.value = response.data;
    } catch (error) {
        // Captura e exibe qualquer erro ocorrido durante a requisição
        console.error('Erro ao carregar Itens:', error);
    } finally {
        // Desativa o estado de carregamento, independentemente de sucesso ou falha
        loading.value = false;
    }
};

// Executa a função fetchItemDM quando o componente é montado
onMounted(() => {
    fetchItemDM();
});

// Função para emitir evento de exclusão de um item
const deleteItem = async (item) => {
    emit('delete-item', item);  // Emite o evento 'delete-item' com o item a ser excluído
};

// Função para lidar com a seleção de uma linha
const handleRowSelection = (event) => {
    emit('row-selected', event.data);  // Emite o evento 'row-selected' com os dados da linha selecionada
};
  