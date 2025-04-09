<template>
    <!-- Container principal da página de gerenciamento de vídeos -->
    <div class="card vh">
        <h3 class="mt-6 mb-4">{{$t('gerenciamento_de_videos')}}</h3>
        <hr class="mt-0"/>
        <!-- Exibe mensagem de erro caso haja algum problema -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <div v-else>
            <!-- Se for a primeira configuração, exibe o componente de configuração inicial -->
            <ConfigInitial v-if="isFirstSetup" :dmList="ListaDMS" @setup-concluido="handleSetupCompleted" />
            <!-- Caso contrário, exibe o componente de upload regular de vídeos -->
            <RegularUpload v-else :dmList="ListaDMS" @update-video="handleVideoUpdate" />
        </div>
        <!-- Exibe um spinner de carregamento enquanto os dados estão sendo processados -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
/**
 * Importações de bibliotecas e componentes necessários para o funcionamento do componente.
 */

// Importa hooks do Vue para gerenciamento de estado e ciclo de vida
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue'; 

// Instância do axios para realizar requisições HTTP
import axios from '@/axios.js'; 

// Componente para configuração inicial de vídeos
import ConfigInitial from '@/components/PrimeiraConfiVideo.vue'; 

// Componente para uploads regulares de vídeos
import RegularUpload from '@/components/VideoUpload.vue'; 

// Componente de spinner de carregamento, exibido enquanto os dados estão sendo carregados
import LoadingSpinner from '@/components/LoadingSpinner.vue'; 

// Hook do PrimeVue para exibição de mensagens de sucesso ou erro (toast)
import { useToast } from 'primevue/usetoast'; 

// Store para gerenciamento da autenticação do usuário
import { useAuthStore } from '@/store/authStore.js'; 

import dmService from '@/services/DmService'; // Serviço para manipulação de dados

/**
 * Instâncias das stores e variáveis reativas para gerenciamento de estado.
 */

// Instância da store de autenticação para acessar informações do usuário
const store = useAuthStore(); 

// Instância do toast para exibir mensagens ao usuário
const toast = useToast(); 

// Variável reativa que controla o estado de carregamento
const loading = ref(true); 

// Variável reativa que armazena mensagens de erro
const errorMessage = ref(''); 

// Variável reativa que indica se é a primeira configuração do sistema
const isFirstSetup = ref(false); 

// Lista de DMs (Documentos de Mídia) carregados da API
const ListaDMS = ref([]);

/**
 * Função que retorna se o usuário tem o papel de 'Administrador'.
 * @returns {boolean} Retorna verdadeiro se o usuário for 'Administrador', caso contrário falso.
 */
const admin = () => {
    return store.userRole === 'Administrador'; 
};

/**
 * Função que lida com a atualização de vídeo no DM.
 * Atualiza o vídeo associado ao DM na lista de DMs.
 * @param {Object} param - Parâmetro contendo o ID do DM e o vídeo a ser atualizado.
 * @param {number} param.dmId - ID do DM (Documento de Mídia) a ser atualizado.
 * @param {string} param.video - URL ou identificador do novo vídeo a ser associado ao DM.
 */
const handleVideoUpdate = async ({ dmId, video }) => {
    // Busca o DM correspondente ao ID na lista de DMs
    const dm = ListaDMS.value.find((item) => item.ID_DM === dmId); 
    if (dm) {
        // Atualiza o vídeo associado ao DM
        dm.Video = video; 
    }
    
    // Recarrega a lista de DMs após a atualização
    await fetchDMS();
};

/**
 * Função chamada quando a configuração inicial for concluída.
 * Altera o estado de "isFirstSetup" para falso e recarrega os DMs.
 */
const handleSetupCompleted = () => {
    // Marca que a configuração inicial foi concluída
    isFirstSetup.value = false; 

    // Recarrega os DMs
    fetchDMS();
};

/**
 * Função para carregar a lista de DMs (Documentos de Mídia) a partir da API.
 * Realiza uma requisição HTTP para buscar os DMs, considerando se o usuário é administrador ou não.
 */
const fetchDMS = async () => {
    // Inicia o estado de carregamento
    loading.value = true; 

    // Condicional para verificar se o usuário é administrador ou não
    const data = admin() ? {} : { id_cliente: store.userIdCliente };

    try {
        // Realiza a requisição para buscar os DMs
        const response = await dmService.listarDMs(data); 
        ListaDMS.value = response.data; // Armazena os DMs na variável reativa ListaDMS

        // Se todos os DMs tiverem vídeo 'N', marca que é a primeira configuração
        isFirstSetup.value = ListaDMS.value.every((dm) => dm.Video === 'N'); 
    } catch (error) {
        // Exibe uma mensagem de erro caso ocorra falha na requisição
        toast.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Erro ao carregar DMs', 
            life: 3000 
        });

        // Loga o erro no console para depuração
        console.error('Erro ao carregar DMs:', error); 
    } finally {
        // Finaliza o estado de carregamento
        loading.value = false; 
    }
};

/**
 * Hook do Vue que é executado quando o componente é montado.
 * Carrega a lista de DMs ao inicializar o componente.
 */
onMounted(fetchDMS);

</script>

<style scoped>
/**
 * Estilo para a classe de mensagem de erro.
 * Utiliza a cor vermelha e negrito para destacar a mensagem de erro.
 */
.error {
    color: red;
    font-weight: bold;
}
</style>
