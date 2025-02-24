<template>
    <!-- Contêiner principal da página, sem classe ou estilo específico aplicado -->
    <div class="card">

        <!-- Título da seção, explicando o conteúdo da página -->
        <div>
          <h5 class="my-4 text-2xl">{{t('termo_title')}}</h5>
          <!-- Editor de texto, vinculado ao modelo de dados "content" -->
          <Editor v-model="content"></Editor>
        </div>

        <!-- Exibe o componente de carregamento enquanto a operação de salvamento está em andamento -->
        <LoadingSpinner v-if="loading" />

        <!-- Botão para salvar o conteúdo do editor -->
        <Button class="mt-3 justify-content-end flex" style="width: 20%; " type="button" :label="$t('save_text')" icon="pi pi-pencil" severity="info" @click="SalvarTexto" />
    </div>
</template>

<script setup>
/**
 * Importação de módulos e componentes necessários para o funcionamento do componente.
 */
 import { ref, onMounted } from 'vue'; // Importa os hooks 'ref' (para reatividade) e 'onMounted' (para execução após o componente ser montado) do Vue
 import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js'; // Importa a instância do axios, que é uma biblioteca para realizar requisições HTTP, já configurada
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para gerenciar o estado de login e dados do usuário
import Editor from '@/components/Editor.vue'; // Importa o componente de Editor (provavelmente um editor de texto rico)
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento para indicar ao usuário que o conteúdo está sendo carregado
import termoService from '@/Services/termoService.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Declaração de variáveis reativas com Vue.js usando 'ref' para controle de estado no componente
/**
 * @type {import('vue').Ref<string>} 
 * Variável que contém o conteúdo do editor. Inicialmente, é uma string vazia.
 */
const content = ref('');

/**
 * @type {import('vue').Ref<boolean>} 
 * Variável que indica se o processo de carregamento está em andamento. Inicialmente é falso (não carregando).
 */
const loading = ref(false);

// Acessa o store de autenticação, onde o usuário e o token são armazenados
/**
 * @type {ReturnType<typeof useAuthStore>} 
 * Armazena os dados do store de autenticação (dados do usuário e token).
 */
const store = useAuthStore();

const toast = useToast();

/**
 * Função para salvar o conteúdo do editor no servidor.
 * Realiza uma requisição HTTP POST para enviar o conteúdo.
 * 
 * @returns {Promise<void>} 
 * A função é assíncrona e não retorna valor, apenas realiza a operação de salvar.
 */
const SalvarTexto = async () => {
    // Prepara os dados que serão enviados na requisição
    const data = {
        id_cliente: store.userIdCliente,  // ID do cliente (obtido do store de autenticação)
        Texto: content.value             // Conteúdo do editor, que é armazenado em 'content'
    };

    // Log para depuração, exibindo os dados que serão enviados na requisição
    console.log('Dados a serem enviados:', data);

    // Ativa o indicador de carregamento
    loading.value = true;

    try {
        // Envia os dados ao servidor usando uma requisição POST
        await termoService.salvaTermo(data);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('termo_added_detail'), life: 3000 });
        // Se a requisição for bem-sucedida, o servidor salvará o conteúdo do editor
        // Não há necessidade de ação adicional após salvar com sucesso
    } catch (error) {
        // Caso ocorra algum erro durante a requisição, este bloco será executado
        console.error('Erro ao salvar texto:', error); // Loga o erro ocorrido ao tentar salvar o conteúdo

        toast.add({ severity: 'error', summary: t('title_error'), detail: error.message || t('termo_added_error_default'), life: 3000 });
    } finally {
        // Independente de sucesso ou falha, o indicador de carregamento é desativado
        loading.value = false;
    }
};

/**
 * Função para recuperar o conteúdo salvo anteriormente no servidor.
 * Realiza uma requisição HTTP POST para buscar o conteúdo.
 * 
 * @returns {Promise<void>} 
 * A função é assíncrona e não retorna valor, apenas realiza a operação de recuperação.
 */
const RecuperarTexto = async () => {
    // Prepara os dados que serão enviados na requisição para buscar o conteúdo salvo
    const data = {
        id_cliente: store.userIdCliente // ID do cliente (obtido do store de autenticação)
    };

    // Ativa o indicador de carregamento, pois estamos fazendo uma requisição
    loading.value = true;

    try {
        // Realiza a requisição POST para recuperar o conteúdo do servidor
        const response = await termoService.recuperaTermo(data);

        // Verifica se o servidor retornou um conteúdo válido
        if (response.data[0].Texto) {
            content.value = response.data[0].Texto; // Atualiza o conteúdo do editor com o texto recuperado
        }
    } catch (error) {
        // Caso ocorra algum erro durante a requisição de recuperação, este bloco será executado
        // O log foi comentado, mas é importante registrar os erros para depuração
        // console.error('Erro ao recuperar texto:', error);
    } finally {
        // Após a operação de recuperação (seja com sucesso ou falha), desativa o indicador de carregamento
        loading.value = false;
    }
};

/**
 * Hook 'onMounted' do Vue.js, que é executado assim que o componente é montado na tela.
 * Esse hook é usado para chamar a função que recupera o conteúdo salvo assim que o componente estiver disponível.
 */
onMounted(() => {
    // Chama a função para recuperar o conteúdo salvo do servidor assim que o componente for montado
    RecuperarTexto();
});

</script>

<style scoped>
.vh {
  height: 100vh;  /* Define a altura da tela como 100% da altura da janela */
}
</style>
