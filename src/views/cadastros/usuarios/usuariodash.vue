<script setup>
import { ref, onMounted } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from '@primevue/core/api';
import usuarioService from '@/Services/usuariodashService.js';
import { $t } from '@primeuix/themes';

const { t } = useI18n();
const active = ref(0);
const loading = ref(false);
const filteredCount = ref(0);
const visible = ref(false);
const UsarioDash = ref({
    login: '',
    senha: '',
    superUser: false,
    id_cliente: 0,
    maquinas: []
});
const filter = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filterDM = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const validateSenha = () => {
    if (senha.value !== UsarioDash.value.senha) {
        // Se as senhas não coincidem
        errors.value.senha = $t('invalid_password'); // Mensagem de erro
    } else {
        errors.value.senha = null; // Senha válida, reseta o erro
    }
};
const onRowSelect = (event) => {
    UsarioDash.value = { ...event.data };
    visible.value = true;
    active.value = 1;
}
const senha = ref('');
const errors = ref({ senha: null });
const Maquinas = ref([]);
const Usuarios = ref([]);
const clientes = ref([]);
function invalidData() {
    if (UsarioDash.value.superUser) {
        UsarioDash.value.id_cliente = null;
    }
}const adicionarUsuario = async () => {
  try {
    const response = await usuarioService.adiconarUsuarios(UsarioDash.value);
    console.log("Usuário adicionado:", response.data);
    Usuarios.value = await usuarioService.listarUsuarios();
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error);
  }
};

const editarUsuario = async () => {
  try {
    const data = {
      ...UsarioDash.value,
      senha: UsarioDash.value.senha ? UsarioDash.value.senha : "senhaAntiga"
    };
    const response = await usuarioService.editarUsuarios(data);
    console.log("Usuário editado:", response.data);
   
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
  }
};

const deletarUsuario = async (id) => {
  try {
    const response = await usuarioService.deletarUsuarios({ id });
    console.log("Usuário deletado:", response.data);
    // Atualize sua lista de usuários se necessário
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
  }
};
onMounted(async () => {
    loading.value = true;
    try {
        Maquinas.value = await usuarioService.listarMaquina();
        Usuarios.value = await usuarioService.listarUsuarios();
        clientes.value = await usuarioService.listarClientes();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
});
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Tabs v-model:activeIndex="active">
                    <TabPanel header="Usuario Dash">
                        <DataTable
                            :value="Usuarios"
                            stripedRows
                            paginator
                            :rows="10"
                            removableSort
                            :rowsPerPageOptions="[5, 10, 20, 50]"
                            :globalFilterFields="['nome', 'login']"
                            selectionMode="single"
                            tableStyle="min-width: 50rem; table-layout: fixed;"
                            dataKey="id"
                            :metaKeySelection="false"
                            :sortOrder="1"
                            :sortField="'login'"
                            @rowSelect="onRowSelect" >
                            <template #header>
                                <div class="flex justify-content-between mt-4">
                                    <div>
                                        <span>{{ $t('total_records', { count: filteredCount }) }}</span>
                                    </div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filter['global'].value" :placeholder="t('search')" autocomplete="off"/>
                                    </IconField>
                                </div>
                            </template>
                            <Column field="login" header="login" :sortable="true"></Column>
                            <Column style="min-width: 8rem">
                                <template #body="slotProps">
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="" />
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel :header="visible ? 'editar Usuario' : 'novo Usuario'">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <div class="full xl:col-6 lg:col-6 md:col-8 sm:col-12">
                                <label for="email">{{ $t('login') }}</label>
                                <InputText class="my-2" v-model="UsarioDash.login" id="email" />
                            </div>

                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">{{ $t('password') }}</label>
                                <InputText class="my-2" id="senha" v-model="UsarioDash.senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Exibe erro se a senha for inválida -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>

                            <!-- Campo para confirmar a senha -->
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="senha">{{ $t('confirm_password') }}</label>
                                <InputText class="my-2" id="senha" v-model="senha" type="password" :invalid="!!errors.senha" @blur="validateSenha" />
                                <!-- Exibe erro se as senhas não coincidirem -->
                                <small v-if="errors.senha" class="p-error">{{ errors.senha }}</small>
                            </div>
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="superUser">Usuario Supervisor Complexo</label>
                                <ToggleSwitch v-model="UsarioDash.superUser" :change="invalidData()" />
                            </div>
                            <div class="full xl:col-4 lg:col-4 md:col-4 sm:col-12">
                                <label for="superUser">Cliente</label>
                                <Select v-model="UsarioDash.id_cliente" :options="clientes" :disabled="UsarioDash.superUser" optionLabel="label" optionValue="value" />
                            </div>
                            <!-- Botões para salvar, excluir ou voltar -->
                            <div class="flex align-items-center justify-content-end field col-12 mt-6">
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('save')" icon="pi pi-check" severity="primary"  @click="editarUsuario"  />
                                <Button v-if="visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('delete')" icon="pi pi-trash" severity="danger"  @click="deletarUsuario(UsuarioDash.value.id)" />
                                <Button style="width: 15%" class="buttons flex align-items-center justify-content-center m-2 mr-0" :label="t('back')" icon="pi pi-arrow-left" severity="primary" @click="voltar()" />
                                <Button v-if="!visible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" :label="t('save')" icon="pi pi-check" severity="info" @click="adicionarUsuario"  />
                            </div>

                            <!-- Divider para separar a seção -->
                            <Divider class="mt-4" type="solid" />
                        </div>

                        <!-- Tabela de DMs para associar ao usuário -->
                        <div class="col-12" v-if="UsarioDash.superUser">
                            <DataTable
                                v-model:selection="UsarioDash.maquinas"
                                v-model:filters="filterDM"
                                :value="Maquinas"
                                stripedRows
                                selectionMode="multiple"
                                paginator
                                :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['identificacao', 'nome_cliente']"
                                dataKey="ID_DM"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                :metaKeySelection="false"
                                :size="small"
                                removableSort
                                :sortOrder="1"
                            >
                                <template #header>
                                    <div class="flex justify-content-end">
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filterDM.global.value" :placeholder="t('search')" />
                                        </IconField>
                                    </div>
                                </template>
                                <Column selectionMode="multiple" :style="{ width: '5%' }"></Column>
                                <Column field="nome_cliente" sortable :header="t('client')" class="col-12 md:col-6" :style="{ width: '80%' }"></Column>
                                <Column field="identificacao" sortable :header="t('name')" class="col-12 md:col-6" :style="{ width: '80%' }"></Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
