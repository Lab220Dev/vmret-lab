<script setup>
import { ref } from 'vue';

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

const dropdownItem = ref(null);
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Novo Usuario</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12">
                        <label for="name">Nome</label>
                        <InputText id="name" type="text" />
                    </div>
                    <div class="field col-12">
                        <label for="email">email</label>
                        <InputText id="email" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="perfil">Perfil</label>
                        <Dropdown id="perfil" v-model="dropdownItem" :options="dropdownItems" optionLabel="name"
                            placeholder="Escolha um"></Dropdown>
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="planta">Planta</label>
                        <InputText id="planta" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="senha">Senha</label>
                        <InputText id="senha" type="password" />
                    </div>
                    <div class="field col-12 md:col-3">
                    <label for="status">Status</label>
                    <Dropdown id="status" v-model="dropdownItem" :options="status" optionLabel="name"
                        placeholder="Escolha um"></Dropdown>
                </div>
                </div>

            </div>
        </div>
    </div>
</template>
