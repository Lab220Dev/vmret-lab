<script setup>
// Importações necessárias
import { ref, reactive, onMounted } from 'vue'; // Importa as funções reativas do Vue
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de carregamento
import { useAuthStore } from '@/store/authStore.js'; // Importa a loja de autenticação
import axios from '@/axios.js'; // Importa a instância do axios configurada
import { useToast } from 'primevue/usetoast'; // Importa o sistema de toast (notificações)

const toast = useToast(); // Instancia o toast para mostrar mensagens

const store = useAuthStore(); // Acessa o store de autenticação para pegar informações do usuário
const DMSelecionada = ref(null); // Ref para armazenar a DM selecionada no dropdown
const loading = ref(false); // Ref para controle de estado de carregamento
const Dados = ref([]); // Ref para armazenar os dados da integração
const validador = ref(false); // Validador para desabilitar campos e controle de erro
const primeiraInteracao = ref(null); // Flag para saber se é a primeira interação com os dados

// Objeto reativo para armazenar as informações da integração
const Integracao = reactive({
    ClienteID: '', // ID do Cliente
    UserID: '', // ID do Usuário
    URL: '', // URL da API
    Chave: '', // Chave de autenticação
    ChaveAPI: '' // Chave da API
});

// Função para buscar os dados iniciais ao carregar o componente
const fetchDadosIniciais = async () => {
    loading.value = true; // Inicia o carregamento

    try {
        // Prepara os dados para enviar ao backend
        const data = {
            id_cliente: store.userIdCliente, // Cliente ID obtido do store
            id_usuario: store.userId // User ID obtido do store
        };

        // Envia a requisição para o backend para buscar as informações da DM
        const response = await axios.post('/DM/recuperarInfo', data);

        primeiraInteracao.value = true; // Define que já houve interação inicial
        Dados.value = response.data; // Armazena os dados recebidos na variável Dados
    } catch (error) {
        // Se a resposta do erro for 401 (não autorizado)
        if (error.response && error.response.status === 401) {
            validador.value = true; // Marca que a integração falhou
            toast.add({
                severity: 'warn', // Tipo de notificação (aviso)
                summary: 'Info', // Título da notificação
                detail: `${error.response?.data?.message || 'Máquina sem integração'}`, // Mensagem de erro
                life: 3000 // Duração da notificação em milissegundos
            });
        } else {
            // Para outros tipos de erro, apenas loga no console
            console.error('Erro ao carregar Itens:', error);
        }
    } finally {
        loading.value = false; // Finaliza o carregamento, independente do resultado
    }
};

// Função para lidar com a troca da DM selecionada
const handleDMChange = () => {
    primeiraInteracao.value = false; // Marca que a interação com a DM foi realizada
    const selectedDM = Dados.value.find((c) => c.ID_DM === DMSelecionada.value); // Encontra a DM selecionada nos dados

    if (selectedDM) {
        // Se uma DM for encontrada, atualiza os dados de integração
        Integracao.UserID = selectedDM.UserID;
        Integracao.URL = selectedDM.URL;
        Integracao.ClienteID = selectedDM.ClienteID;
        Integracao.Chave = selectedDM.Chave;
        Integracao.ChaveAPI = selectedDM.ChaveAPI;
    }
};

// Função para salvar os dados de integração
const salvarIntegracao = async () => {
    try {
        // Prepara os dados a serem enviados para o backend
        let data = {
            id_cliente: store.userIdCliente, // Cliente ID
            ID_DM: DMSelecionada.value, // DM Selecionada
            ClienteID: Integracao.ClienteID, // ID do Cliente
            UserID: Integracao.UserID, // ID do Usuário
            URL: Integracao.URL, // URL da API
            Chave: Integracao.Chave, // Chave de autenticação
            ChaveAPI: Integracao.ChaveAPI // Chave da API
        };

        loading.value = true; // Inicia o carregamento

        // Envia os dados para o backend
        const response = await axios.post('/DM/updateInfo', data);

        // Se a resposta for de sucesso (status 200 ou 201)
        if (response.status === 200 || response.status === 201) {
            toast.add({
                severity: 'success', // Tipo de notificação (sucesso)
                summary: 'Sucesso', // Título da notificação
                detail: 'Dados de integração salvos com sucesso!', // Mensagem de sucesso
                life: 3000 // Duração da notificação
            });
        } else {
            // Se não for sucesso, lança um erro
            throw new Error('Falha ao salvar dados de integração');
        }
    } catch (error) {
        // Se ocorrer algum erro ao salvar os dados
        toast.add({
            severity: 'error', // Tipo de notificação (erro)
            summary: 'Erro', // Título da notificação
            detail: `${error.response?.data?.message || 'Erro ao salvar dados de integração'}`, // Mensagem de erro
            life: 3000 // Duração da notificação
        });

        console.error('Erro ao salvar dados de integração:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Finaliza o carregamento
    }
};
// Chama a função para buscar os dados assim que o componente é montado
onMounted(() => {
    fetchDadosIniciais();
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
