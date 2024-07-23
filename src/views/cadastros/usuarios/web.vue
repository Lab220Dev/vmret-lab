<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';
const toast = useToast();

const usuario = reactive({
    nome:'',
    email:'',
    perfil:'',
    planta:'',
    senha:'',
    Status:''
})
const dropdownItems = ref([
    { name: 'Gestor', code: 'gestor' },
    { name: 'Master', code: 'master' },
    { name: 'Operador', code: 'operador' },
    { name: 'Liberação Avulsa', code: 'avulsa' }
]);

const status = ref([
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' }
]);

const plantaOptions = ref([
    {nome:'Planta 1', code:'plt1'},
    {nome:'Planta 2', code:'plt2'}
]);
const saveUsuario = () =>{
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Novo usuário Web</h5>
                <div class=" mt-6 mx-0 p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="name">Nome:</label>
                        <InputText v-model="usuario.nome"id="name" type="text" />
                    </div>
                    <div class="field col-12 md:col-7">
                        <label for="email">E-mail:</label>
                        <InputText v-model="usuario.email"id="email" />
                    </div>
                    <div class="field col-12 md:col-5">
                        <label for="senha">Senha:</label>
                        <InputText id="senha" v-model="usuario.senha" type="password" />
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="perfil">Perfil:</label>
                        <Dropdown id="perfil" v-model="usuario.perfil" :options="dropdownItems" optionLabel="name"
                            placeholder="Escolha um" ></Dropdown>
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="planta">Planta:</label>
                        <Dropdown id="planta" v-model="usuario.planta" :options="plantaOptions" optionLabel="nome"
                            placeholder="Escolha um" ></Dropdown>
                    </div>
                    
                    <div class="field col-12 md:col-4">
                    <label for="status">Status:</label>
                    <Dropdown id="status" v-model="usuario.status" :options="status" optionLabel="name"
                        placeholder="Escolha um"></Dropdown>
                </div>
                <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario"
                class="mt-4 mx-3" />
                </div>

            </div>
        </div>
    </div>
</template>
