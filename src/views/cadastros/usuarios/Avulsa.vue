<script setup>
import { useToast } from 'primevue/usetoast';// Função para exibir notificações
import { reactive, ref } from 'vue';//ref para reatividade,
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const toast = useToast();// Função para exibir notificações

/**
 * Objeto reativo que armazena os dados do usuário a ser criado.
 * 
 * @type {Object}
 * @property {string} nome - Nome do usuário.
 * @property {string} usuario - Nome de usuário.
 * @property {string} perfil - Perfil do usuário (não utilizado no template).
 * @property {string} planta - Planta associada ao usuário.
 * @property {string} senha - Senha do usuário.
 * @property {string} Status - Status do usuário (não utilizado no template).
 */
 const libAvulsa = reactive({
    nome: '',   // Nome do usuário
    usuario: '', // Nome de usuário
    perfil: '',  // (Campo não utilizado no template)
    planta: '',  // Planta associada ao usuário
    senha: '',   // Senha do usuário
    Status: ''   // Status do usuário (não utilizado no template)
});

/**
 * Estado reativo que armazena as opções de plantas disponíveis para o dropdown.
 * 
 * @type {Ref<Array<{ nome: string, code: string }>>}
 */
 const plantaOptions = ref([
    { nome: 'Planta 1', code: 'plt1' }, // Opção para Planta 1
    { nome: 'Planta 2', code: 'plt2' }  // Opção para Planta 2
]);

/**
 * Função chamada quando o botão "Salvar" é clicado para criar um novo usuário.
 * Exibe uma notificação de sucesso após salvar o usuário.
 */
 const saveUsuario = () => {
    // Exibe uma notificação de sucesso quando o usuário é criado
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Usuario WEB criado', life: 3000 });
};

</script>
<template>
    <div class="grid">
        <!-- Container principal do formulário -->
        <div class="col-12">
            <div class="card">
                <!-- Título do formulário -->
                <h5 class="my-6 ml-2 text-2xl">Novo usuário de liberação avulsa</h5>
                <div class="mt-5 mx-0 p-fluid grid">
                    <!-- Campo de Nome do Usuário -->
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <label for="name">Nome:</label>
                        <!-- Input para o nome do usuário -->
                        <InputText class="my-2" v-model="libAvulsa.nome" id="name" type="text" />
                    </div>

                    <!-- Campo de Usuário -->
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <label for="usuario">Usuário:</label>
                        <!-- Input para o nome de usuário -->
                        <InputText class="my-2" v-model="libAvulsa.usuario" id="usuario" />
                    </div>

                    <!-- Campo de Planta -->
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="planta">Planta:</label>
                        <!-- Dropdown para selecionar a planta -->
                        <Dropdown class="my-2" id="planta" v-model="libAvulsa.planta" :options="plantaOptions" optionLabel="nome" placeholder="Escolha um"></Dropdown>
                    </div>

                    <!-- Campo de Senha -->
                    <div class="full lg:col-8 md:col-6 sm:col-12">
                        <label for="senha">Senha:</label>
                        <!-- Input para a senha do usuário (campo do tipo "password") -->
                        <InputText class="my-2" id="senha" v-model="libAvulsa.senha" type="password" />
                    </div>

                    <!-- Botão para salvar os dados -->
                    <div class="flex align-items-center justify-content-end field col-12">
                        <!-- Botão que chama a função 'saveUsuario' quando clicado -->
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
