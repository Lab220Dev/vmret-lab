<template>
    <!-- Contêiner principal da página, sem classe ou estilo específico aplicado -->
    <div class="">

        <!-- Título da seção, explicando o conteúdo da página -->
        <div>
          <h5 class="my-4 text-2xl">Termo de compromisso - Ficha Retirada</h5>
          <!-- Editor de texto, vinculado ao modelo de dados "content" -->
          <Editor v-model="content"></Editor>
        </div>

        <!-- Exibe o componente de carregamento enquanto a operação de salvamento está em andamento -->
        <LoadingSpinner v-if="loading" />

        <!-- Botão para salvar o conteúdo do editor -->
        <Button class="mt-3 justify-content-end flex" style="width: 20%; " type="button" label="Salvar Texto" icon="pi pi-pencil" severity="info" @click="SalvarTexto" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Importa os hooks ref e onMounted do Vue
import axios from '@/axios.js'; // Importa a instância axios configurada para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados do usuário
import Editor from '@/components/Editor.vue'; // Importa o componente de Editor (provavelmente um editor de texto rico)
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento

// Declaração de variáveis reativas
const content = ref(''); // Variável que contém o conteúdo do editor, inicializado como string vazia
const store = useAuthStore(); // Acessa o store de autenticação para pegar dados do usuário e token
const loading = ref(false); // Variável que indica se o processo de carregamento está em andamento (inicialmente falso)

// Função responsável por salvar o conteúdo no servidor
const SalvarTexto = async () => {
    // Prepara os dados que serão enviados na requisição
    const data = {
        id_cliente: store.userIdCliente,  // ID do cliente (obtido do store de autenticação)
        Texto: content.value             // Conteúdo do editor
    };

    console.log('Dados a serem enviados:', data); // Log para debugar e verificar os dados que serão enviados

    loading.value = true; // Indica que o processo de carregamento começou
    try {
        // Envia os dados para o servidor usando o método POST
        await axios.post('/termo/Salvar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`  // Inclui o token de autenticação no cabeçalho da requisição
            }
        });
        // Se a requisição for bem-sucedida, o servidor irá salvar o conteúdo do editor
    } catch (error) {
        // Em caso de erro, exibe uma mensagem de erro no console
        console.error('Erro ao salvar texto:', error);
    } finally {
        // Em qualquer caso (sucesso ou erro), desativa o indicador de carregamento
        loading.value = false;
    }
};

// Função responsável por recuperar o conteúdo salvo anteriormente
const RecuperarTexto = async () => {
    // Prepara os dados que serão enviados na requisição
    const data = {
        id_cliente: store.userIdCliente // ID do cliente (novamente obtido do store de autenticação)
    };

    loading.value = true; // Inicia o indicador de carregamento
    try {
        // Realiza uma requisição POST para recuperar o conteúdo salvo do servidor
        const response = await axios.post('/termo/recuperar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação
            }
        });
        
        // Verifica se o servidor retornou um conteúdo válido
        if (response.data[0].Texto) {
            content.value = response.data[0].Texto; // Atualiza o conteúdo do editor com o texto recuperado
        }
    } catch (error) {
        // Caso ocorra algum erro ao recuperar o conteúdo, o log do erro é comentado por enquanto.
        // console.error('Erro ao recuperar texto:', error);
    } finally {
        // Após a operação de recuperação, desativa o indicador de carregamento
        loading.value = false;
    }
};

// Hook do Vue.js que é chamado quando o componente é montado (aparece na tela)
onMounted(() => {
    // Quando o componente for montado, recupera o conteúdo salvo (se houver)
    RecuperarTexto();
});
</script>

<style scoped>
.vh {
  height: 100vh;  /* Define a altura da tela como 100% da altura da janela */
}
</style>
