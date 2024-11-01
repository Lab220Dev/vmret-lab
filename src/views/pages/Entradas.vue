<script setup>
import { reactive } from 'vue';

const Integracao = reactive({
    Integracao: false,
    UserID: '',
    senha: '',
    ClienteID: '',
    Chave: ''
});

// Função de salvar
const salvarIntegracao = () => {
    // Lógica para salvar os dados da integração
    console.log('Dados de Integração salvos:', Integracao);
    // Aqui você pode adicionar uma chamada para salvar os dados no backend
    // Exemplo:
    // axios.post('/sua-rota-de-api', Integracao)
    //      .then(response => console.log('Sucesso:', response))
    //      .catch(error => console.error('Erro:', error));
};
</script>

<template>
    <div class="card" >
        <h2 class="my-6 ml-2 text-2xl">Configurações de Integração</h2>
        <form @submit.prevent="salvarIntegracao">
            <div class="p-fluid grid">
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="userid">UserID API:</label>
                    <InputText class="my-2" id="userid" v-model="Integracao.UserID" type="password" />
                </div>
                <div class="mt-4 lg:col-6 md:col-6 sm:col-12">
                    <label for="senha">Senha API:</label>
                    <InputText class="my-2" id="senha" v-model="Integracao.senha" type="password" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="idcliente">IdCliente API:</label>
                    <InputText class="my-2" id="idcliente" v-model="Integracao.ClienteID" type="password" />
                </div>
                <div class="lg:col-6 md:col-6 sm:col-12">
                    <label for="chave">Chave:</label>
                    <Textarea v-model="Integracao.Chave" class="my-2 overflow-hidden" style="min-height: 20px" inputClass="w-full"
                        rows="2" cols="30" />
                </div>
                <div class="full lg:col-12 md:col-12 sm:col-12">
                    <Button type="submit" label="Sincronizar" icon="pi pi-check" class="mt-4" />
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.full {
    width: 100%;
}
</style>
