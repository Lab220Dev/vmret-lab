<script setup>
import { ref,reactive ,onMounted} from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios.js';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const store = useAuthStore();
const DMSelecionada = ref(null)
const loading = ref(false);
const Dados = ref([]);
const validador = ref(false)
const primeiraInteracao = ref(null)
const Integracao = reactive({
    ClienteID:'',
    UserID:'',
    URL:'',
    Chave:'',
    ChaveAPI:''
});

const fetchDadosIniciais = async () => {
    loading.value = true;
    try {
        const data = {
            id_cliente: store.userIdCliente,
            id_usuario: store.userId
        };
        const response = await axios.post('/DM/recuperarInfo', data);
            primeiraInteracao.value = true;
            Dados.value = response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            validador.value = true;
            toast.add({
                severity: 'warn',
                summary: 'Info',
                detail: `${error.response?.data?.message || 'Maquina sem integração'}`,
                life: 3000
            });
        } else {
            console.error('Erro ao carregar Itens:', error);
        }
    } finally {
        loading.value = false;
    }
};

const handleDMChange = () =>{
    primeiraInteracao.value = false;
    const selectedDM = Dados.value.find((c) => c.ID_DM === DMSelecionada.value);
    if (selectedDM) {
        Integracao.UserID=selectedDM.UserID;
        Integracao.URL=selectedDM.URL;
        Integracao.ClienteID=selectedDM.ClienteID;
        Integracao.Chave=selectedDM.Chave;
        Integracao.ChaveAPI=selectedDM.ChaveAPI;
    }
}
const salvarIntegracao = async () => {
    try {
        let data ={
            id_cliente: store.userIdCliente,
            ID_DM: DMSelecionada.value,
            ClienteID: Integracao.ClienteID,
            UserID: Integracao.UserID,
            URL: Integracao.URL,
            Chave: Integracao.Chave,
            ChaveAPI: Integracao.ChaveAPI
        }
        loading.value = true;

        const response = await axios.post('/DM/updateInfo', data);
        if (response.status === 200 || response.status === 201) {
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Dados de integração salvos com sucesso!',
                life: 3000
            });
        } else {
            throw new Error('Falha ao salvar dados de integração');
        }
    } catch (error) {            
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: `${error.response?.data?.message || 'Erro ao salvar dados de integração'}`,
            life: 3000
        });
        console.error('Erro ao salvar dados de integração:', error);
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchDadosIniciais();
});
</script>

<template>
    <div class="card" >
        <h2 class="my-6 ml-2 text-2xl">Configurações de Integração</h2>
            <Dropdown
                :options="Dados"
                :virtualScrollerOptions="{ itemSize: 30 }"
                :filter="true"
                :filterBy="'Identificacao'"
                :disabled="validador"
                v-model="DMSelecionada"
                optionLabel="Identificacao"
                optionValue="ID_DM"
                placeholder="Selecione uma DM"
                @change="handleDMChange()"
            />
            <InlineMessage v-if="!validador && primeiraInteracao" severity="info">Selecione uma Dm</InlineMessage>
        <form @submit.prevent="salvarIntegracao">
            <div class="p-fluid grid">
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="userid">UserID API:</label>
                    <InputText class="my-2" id="userid" v-model="Integracao.UserID" type="text" :disabled="validador"/>
                </div>
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="senha">URL API:</label>
                    <InputText class="my-2" id="senha" v-model="Integracao.URL" type="text":disabled="validador"/>
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="idcliente">IdCliente API:</label>
                    <InputText class="my-2" id="idcliente" v-model="Integracao.ClienteID" type="text" :disabled="validador"/>
                </div>                
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chaveapi">senha API:</label>
                    <InputText class="my-2" id="chaveapi" v-model="Integracao.ChaveAPI" type="text" :disabled="validador"/>
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chave">Chave:</label>
                    <Textarea v-model="Integracao.Chave" class="my-2 overflow-hidden" style="min-height: 20px" inputClass="w-full"
                        rows="2" cols="30" :disabled="validador"/>
                </div>
                <div class="full lg:col-12 md:col-12 sm:col-12">
                    <Button type="submit" label="Sincronizar" icon="pi pi-check" class="mt-4" :disabled="validador"/>
                </div>
            </div>
        </form>
    </div>
    <LoadingSpinner v-if="loading" />
</template>

<style scoped>
.full {
    width: 100%;
}
</style>
