<script setup>
/**
 * Importações necessárias para o funcionamento do componente.
 * 
 * @module
 */

// Importa as funções reativas do Vue, como 'ref', 'reactive' e 'onMounted'.
import { ref, reactive, onMounted } from 'vue'; // Usado para gerenciar o estado reativo e os hooks de ciclo de vida.

// Importa o componente de carregamento personalizado.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Exibe um spinner durante o carregamento de dados.

// Importa a loja de autenticação, que contém as informações do usuário e do cliente.
import { useAuthStore } from '@/store/authStore.js'; // Permite acessar o estado de autenticação do usuário e cliente.

// Importa a instância do Axios configurada para realizar as requisições HTTP.
import axios from '@/axios.js'; // Responsável por enviar as requisições HTTP para o backend.

// Importa o sistema de toast para notificações do PrimeVue.
import { useToast } from 'primevue/usetoast'; // Sistema de notificações (toast) para exibir mensagens ao usuário.

import dmService from '@/services/DmService'; // Serviço para manipulação de dados

const toast = useToast(); // Instancia o sistema de toast para mostrar mensagens de sucesso, erro ou aviso ao usuário.

const store = useAuthStore(); // Acessa o store de autenticação para obter as informações do usuário e cliente logados.
const DMSelecionada = ref(null); // Declara uma variável reativa para armazenar a DM (unidade de dados) selecionada.
const loading = ref(false); // Declara uma variável reativa para controlar o estado de carregamento da página.
const Dados = ref([]); // Declara uma variável reativa para armazenar os dados recuperados da integração.
const validador = ref(false); // Declara uma variável booleana para validar se houve erro ou falha na integração.
const primeiraInteracao = ref(null); // Flag para identificar se é a primeira vez que o componente interage com os dados.


// Objeto reativo para armazenar as informações de integração.
const Integracao = reactive({
    ClienteID: '', // Armazena o ID do Cliente.
    UserID: '', // Armazena o ID do Usuário.
    URL: '', // Armazena a URL da API para integração.
    Chave: '', // Armazena a chave de autenticação para a integração.
    ChaveAPI: '' // Armazena a chave API necessária para a integração.
});

/**
 * Função para buscar os dados iniciais ao carregar o componente.
 * Faz uma requisição ao backend para recuperar as informações da DM.
 */
const fetchDadosIniciais = async () => {
    loading.value = true; // Marca o estado de carregamento como verdadeiro.

    try {
        // Prepara os dados para enviar ao backend para buscar informações da DM.
        const data = {
            id_cliente: store.userIdCliente, // Obtém o ID do Cliente do store de autenticação.
            id_usuario: store.userId // Obtém o ID do Usuário logado do store de autenticação.
        };

        // Envia uma requisição POST para buscar os dados da DM.
        const response = await dmService.infoEntrada(data);

        primeiraInteracao.value = true; // Marca que a primeira interação foi realizada.
        Dados.value = response.data; // Armazena os dados recebidos da resposta na variável 'Dados'.
    } catch (error) {
        // Trata erros que ocorrem durante a requisição.
        if (error.response && error.response.status === 401) { // Verifica se o erro é 401 (não autorizado).
            validador.value = true; // Marca a falha na integração.
            toast.add({
                severity: 'warn', // Exibe a notificação como aviso.
                summary: 'Info', // Título da notificação.
                detail: `${error.response?.data?.message || 'Máquina sem integração'}`, // Detalhes do erro, se disponíveis.
                life: 3000 // Duração da notificação.
            });
        } else {
            // Caso ocorra outro tipo de erro, exibe um erro no console.
            console.error('Erro ao carregar Itens:', error); // Loga o erro completo no console.
        }
    } finally {
        loading.value = false; // Finaliza o carregamento, independentemente do resultado da requisição.
    }
};

/**
 * Função para lidar com a troca da DM selecionada.
 * Atualiza as informações de integração com base na DM escolhida pelo usuário.
 */
const handleDMChange = () => {
    primeiraInteracao.value = false; // Marca que a interação com a DM foi realizada.
    const selectedDM = Dados.value.find((c) => c.ID_DM === DMSelecionada.value); // Encontra a DM selecionada nos dados.

    if (selectedDM) {
        // Se a DM for encontrada, atualiza as informações de integração.
        Integracao.UserID = selectedDM.UserID; // Atualiza o ID do Usuário.
        Integracao.URL = selectedDM.URL; // Atualiza a URL da API.
        Integracao.ClienteID = selectedDM.ClienteID; // Atualiza o ID do Cliente.
        Integracao.Chave = selectedDM.Chave; // Atualiza a chave de autenticação.
        Integracao.ChaveAPI = selectedDM.ChaveAPI; // Atualiza a chave API.
    }
};

/**
 * Função para salvar as informações de integração no backend.
 * Envia os dados preenchidos pelo usuário para o backend.
 */
const salvarIntegracao = async () => {
    try {
        // Prepara os dados para serem enviados para o backend.
        let data = {
            id_cliente: store.userIdCliente, // ID do Cliente, obtido do store de autenticação.
            ID_DM: DMSelecionada.value, // ID da DM selecionada.
            ClienteID: Integracao.ClienteID, // ID do Cliente preenchido.
            UserID: Integracao.UserID, // ID do Usuário preenchido.
            URL: Integracao.URL, // URL da API preenchida.
            Chave: Integracao.Chave, // Chave de autenticação preenchida.
            ChaveAPI: Integracao.ChaveAPI // Chave API preenchida.
        };

        loading.value = true; // Marca o estado de carregamento como verdadeiro enquanto a requisição é feita.

        // Envia uma requisição POST para salvar as informações da integração.
        const response = await axios.post('/DM/updateInfo', data);

        // Se a resposta for de sucesso (status 200 ou 201), exibe uma notificação de sucesso.
        if (response.status === 200 || response.status === 201) {
            toast.add({
                severity: 'success', // Notificação de sucesso.
                summary: 'Sucesso', // Título da notificação.
                detail: 'Dados de integração salvos com sucesso!', // Detalhe da notificação.
                life: 3000 // Duração da notificação.
            });
        } else {
            // Se a resposta não for sucesso (status diferente de 200 ou 201), lança um erro.
            throw new Error('Falha ao salvar dados de integração');
        }
    } catch (error) {
        // Se ocorrer um erro durante a requisição, exibe uma notificação de erro.
        toast.add({
            severity: 'error', // Notificação de erro.
            summary: 'Erro', // Título da notificação.
            detail: `${error.response?.data?.message || 'Erro ao salvar dados de integração'}`, // Detalhes do erro.
            life: 3000 // Duração da notificação.
        });

        console.error('Erro ao salvar dados de integração:', error); // Loga o erro no console para depuração.
    } finally {
        loading.value = false; // Finaliza o carregamento, independentemente do resultado da requisição.
    }
};

// Chama a função para buscar os dados assim que o componente é montado.
onMounted(() => {
    fetchDadosIniciais(); // Chama a função para buscar os dados da integração ao montar o componente.
});

</script>

<template>
    <div class="card">
        <h2 class="my-6 text-2xl">Configurações de Integração</h2>

        <div class="justify-content-between align-items-baseline flex">
            <!-- Dropdown para selecionar a DM -->
            <Dropdown
                :options="Dados"
                :virtualScrollerOptions="{ itemSize: 30 }"
                :filter="true"
                :filterBy="'Identificacao'"
                :disabled="validador"
                class="mb-5"
                v-model="DMSelecionada"
                optionLabel="Identificacao"
                optionValue="ID_DM"
                placeholder="Selecione uma DM"
                @change="handleDMChange()"
            />
            <!-- Mensagem informativa caso não haja interação e validador não esteja ativo -->
            <InlineMessage class="inlinemessage " v-if="!validador && primeiraInteracao" severity="info"> Selecione uma DM para continuar </InlineMessage>
        </div>

        <!-- Formulário para editar e salvar as configurações da integração -->

        <form @submit.prevent="salvarIntegracao">
            <div class="p-fluid grid">
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="userid">UserID API:</label>
                    <InputText class="my-2" id="userid" v-model="Integracao.UserID" type="text" :disabled="validador" />
                </div>
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="senha">URL API:</label>
                    <InputText class="my-2" id="senha" v-model="Integracao.URL" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="idcliente">IdCliente API:</label>
                    <InputText class="my-2" id="idcliente" v-model="Integracao.ClienteID" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chaveapi">senha API:</label>
                    <InputText class="my-2" id="chaveapi" v-model="Integracao.ChaveAPI" type="text" :disabled="validador" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chave">Chave:</label>
                    <Textarea v-model="Integracao.Chave" class="my-2 overflow-hidden" style="min-height: 20px" inputClass="w-full" rows="2" cols="30" :disabled="validador" />
                </div>
                <div class="full lg:col-12 md:col-12 sm:col-12">
                    <Button type="submit" label="Sincronizar" icon="pi pi-check" class="mt-4" :disabled="validador" />
                </div>
            </div>
        </form>
    </div>
    <!-- Componente de loading que aparece durante a requisição -->
    <LoadingSpinner v-if="loading" />
</template>

<style scoped>
.full {
    width: 100%;  /* A largura do elemento que ocupa toda a linha */
}
</style>
