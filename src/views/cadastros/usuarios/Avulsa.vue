<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';
const toast = useToast();

const libAvulsa = reactive({
    nome: '',
    usuario: '',
    perfil: '',
    planta: '',
    senha: '',
    Status: ''
});
const plantaOptions = ref([
    { nome: 'Planta 1', code: 'plt1' },
    { nome: 'Planta 2', code: 'plt2' }
]);
const saveUsuario = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Novo usuário de liberação avulsa</h5>
                <div class="mt-5 mx-0 p-fluid grid">
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <label for="name">Nome:</label>
                        <InputText class="my-2" v-model="libAvulsa.nome" id="name" type="text" />
                    </div>
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <label for="usuario">Usuário:</label>
                        <InputText class="my-2" v-model="libAvulsa.usuario" id="usuario" />
                    </div>
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="planta">Planta:</label>
                        <Dropdown class="my-2" id="planta" v-model="libAvulsa.planta" :options="plantaOptions" optionLabel="nome" placeholder="Escolha um"></Dropdown>
                    </div>
                    <div class="full lg:col-8 md:col-6 sm:col-12">
                        <label for="senha">Senha:</label>
                        <InputText class="my-2" id="senha" v-model="libAvulsa.senha" type="password" />
                    </div>
                    <div class="flex align-items-center justify-content-end field col-12">
                        <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario" class="full mt-2" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
