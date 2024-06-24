<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';
const toast = useToast();

const DM = reactive({
    nome: '',
    usuario: '',
    senha: ''
})

const status = ref([
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' }
]);
const confirmar= ref()
const selectedVM = ref([]);
const DMOptions = ref([
    { nome: 'DM 1', code: 'plt1' },
    { nome: 'DM 2', code: 'plt2' },
    { nome: 'DM 3', code: 'plt3' },
    { nome: 'DM 4', code: 'plt4' },
    { nome: 'DM 5', code: 'plt5' },
    { nome: 'DM 6', code: 'plt6' },
    { nome: 'DM 7', code: 'plt7' },
    { nome: 'DM 8', code: 'plt8' },
]);

const saveUsuario = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Novo Usuario DM</h5>
                <div class="p-fluid formgrid grid">
                    <div class="p-fluid formgrid grid lg:col-8 md:col-12 sm:col-12">
                        <div class="field col-12">
                            <label for="name">DM</label>
                            <InputText v-model="DM.nome" id="name" type="text" />
                        </div>
                        <div class="field col-12">
                            <label for="email">Usuario</label>
                            <InputText v-model="DM.usuario" id="email" />
                        </div>
                        <div class="field col-6 md:col-6">
                            <label for="senha">Senha</label>
                            <InputText id="senha" v-model="DM.senha" type="password" />
                        </div>
                        <div class="field col-6 md:col-6">
                            <label for="senha">Confirmar Senha</label>
                            <InputText id="senha" v-model="DM.senha" type="password" />
                        </div>
                        <div class="col-4">
                        <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveUsuario" class="m-2" />
                    </div>
                    </div>
                    <div class="col-4">
                        <Message :closable="false">Campos marcados com * são de preenchimento obrigatório</Message>
                    </div>
                </div>
                <div class="col-8">
                    <DataTable v-model:selection="selectedVM" :value="DMOptions" dataKey="code"
                    tableStyle="width:100% min-width: 50rem" :size="small">
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="code" header="Code"  ></Column>
                    <Column field="nome" header="Name"  ></Column>
                </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>
