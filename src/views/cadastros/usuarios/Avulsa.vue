<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';
const toast = useToast();

const libAvulsa = reactive({
    nome:'',
    usuario:'',
    perfil:'',
    planta:'',
    senha:'',
    Status:''
});
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
                <h5>Novo Usuario de Liberação Avulsa</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="name">Nome</label>
                        <InputText v-model="libAvulsa.nome"id="name" type="text" />
                    </div>
                    <div class="field col-12">
                        <label for="usuario">Usuario</label>
                        <InputText v-model="libAvulsa.usuario"id="usuario" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="planta">Planta</label>
                        <Dropdown id="planta" v-model="libAvulsa.planta" :options="plantaOptions" optionLabel="nome"
                            placeholder="Escolha um" ></Dropdown>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="senha">Senha</label>
                        <InputText id="senha" v-model="libAvulsa.senha" type="password" />
                    </div>

                <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario"
                class="m-2" />
                </div>

            </div>
        </div>
    </div>
</template>
