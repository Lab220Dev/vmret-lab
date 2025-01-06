<script setup>
/**
 * Importações das dependências e componentes necessários.
 */
import { reactive, ref, onMounted, watch } from 'vue'; // Importação de funções reativas do Vue.
import { useToast } from 'primevue/usetoast'; // Importa o componente de toast para notificações.
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação.
import axios from '@/axios.js'; // Importa a instância do Axios para requisições HTTP.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente para exibir loading.
import { FilterMatchMode } from 'primevue/api'; // Importa modos de filtragem da PrimeVue.

/**
 * Filtro utilizado para busca global na lista de plantas.
 * @type {Object}
 */
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

/**
 * Representa a aba ativa no componente.
 * 0 para lista de plantas, 1 para formulário.
 * @type {number}
 */
const active = ref(0);

/**
 * Acessa o store de autenticação para obter informações do usuário.
 */
const store = useAuthStore();

/**
 * Componente de toast para exibir mensagens ao usuário.
 */
const toast = useToast();

/**
 * Lista de plantas carregadas da API.
 * @type {Array}
 */
const ListaPlanta = ref([]);

/**
 * Define se o formulário está visível ou não.
 * @type {boolean}
 */
const visible = ref(false);

/**
 * Define se a integração está ativa.
 * @type {boolean}
 */
const integracao = ref(false);

/**
 * Define se o diálogo de exclusão de planta está visível.
 * @type {boolean}
 */
const deletePlantaDialog = ref(false);

/**
 * Indica se o estado de carregamento (loading) está ativo.
 * @type {boolean}
 */
const loading = ref(false);

/**
 * Contador do número de itens filtrados na lista.
 * @type {number}
 */
const filteredCount = ref(0);

/**
 * Representa os dados de uma planta.
 * @type {Object}
 */
let planta = reactive({
    nome: '',
    id_planta: '',
    userId: '',
    senha: '',
    urlapi: '',
    clienteid: ''
});

/**
 * Evento disparado ao selecionar uma linha na tabela de plantas.
 * Carrega os detalhes da planta selecionada.
 * @param {Object} event - Evento disparado ao selecionar a linha.
 */
const onRowSelect = (event) => {
    planta = event.data; // Define os dados da planta selecionada.
    active.value = 1; // Alterna para a aba do formulário.
    visible.value = true; // Torna o formulário visível.
    loadPlanta(); // Carrega os dados detalhados da planta.
};

/**
 * Submete o formulário para adicionar ou atualizar uma planta.
 */
const submitForm = () => {
    if (visible.value) {
        atualizarPlanta(); // Chama a função para atualizar a planta.
    } else {
        adicionarPlanta(); // Chama a função para adicionar uma nova planta.
    }
};

/**
 * Carrega a lista de plantas do servidor.
 * @async
 * @throws {Error} Caso ocorra erro ao listar plantas.
 */
const loadPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    loading.value = true; // Ativando loading.
    try {
        const response = await axios.post('/plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaPlanta.value = response.data; // Armazena a lista de plantas.
        filteredCount.value = ListaPlanta.value.length; // Atualiza o contador de itens filtrados.
    } catch (error) {
        console.error('Erro ao listar plantas:', error); // Loga o erro no console.
        // Mensagem de erro esperada: Falha na conexão ou erro interno do servidor.
    } finally {
        loading.value = false; // Desativando loading.
    }
};

/**
 * Observa mudanças no filtro global e atualiza o contador de itens filtrados.
 */
watch(
    () => filters.value.global.value, // Observa mudanças no valor do filtro.
    () => {
        filteredCount.value = ListaPlanta.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Valor do filtro em minúsculas.
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor contém o filtro.
        }).length;
    },
    { immediate: true } // Executa imediatamente após a inicialização.
);

/**
 * Adiciona uma nova planta ao servidor.
 * @async
 * @throws {Error} Caso ocorra erro ao adicionar planta.
 */
const adicionarPlanta = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        ...planta // Copia os dados da planta para a requisição.
    };
    loading.value = true; // Ativando loading.
    try {
        const response = await axios.post('/plantas/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadPlanta(); // Recarrega a lista de plantas.
        active.value = 0; // Retorna para a aba de lista.
        resetForm(); // Limpa o formulário.
    } catch (error) {
        console.error('Erro ao adicionar planta:', error); // Loga o erro no console.
        // Mensagem de erro esperada: Falha na conexão, dados inválidos ou erro interno do servidor.
    } finally {
        loading.value = false; // Desativando loading.
    }
};

const deletePlanta = async () => {
    let data = { id_planta: planta.id_planta };
    loading.value = true;
    try {
        await axios.post('/planta/deletePlanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Planta Deletada', life: 3000 });
        deletePlantaDialog.value = false;
        loadPlanta();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a planta.', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
    active.value = 0;
};

const atualizarPlanta = async () => {
    const data = {
        id_usuario: store.userId,
        id_cliente: store.userIdCliente,
        ...planta
    };
    loading.value = true;
    try {
        const response = await axios.post('/plantas/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        loadPlanta();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar Plantas:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadPlanta();
        visible.value = false;
    }
});

const resetForm = () => {
    planta.nome = '';
    planta.codigo = '';
    planta.id_planta = '';
    planta.clienteid = '';
    planta.senha = '';
    planta.url = '';
    planta.userId = '';
    integracao.value = false;
};

const handleRowSelection = async (event) => {
    await onRowSelect(event);
};

onMounted(() => {
    loadPlanta();
});
</script>

<template>
    <!-- Container principal para o componente de Listagem e Adição de Plantas -->
    <div class="card vh">
        <!-- TabView para alternar entre as abas 'Listar Plantas' e 'Adicionar/Editar Planta' -->
        <TabView v-model:activeIndex="active">
            <!-- Aba para listar plantas -->
            <TabPanel header="Listar Plantas">
                <div class="col-12">
                    <!-- DataTable para exibir a lista de plantas -->
                    <DataTable
                        v-model:filters="filters" 
                        :value="ListaPlanta" 
                        selectionMode="single" 
                        tableStyle="min-width: 25%" 
                        paginator 
                        :rowsPerPageOptions="[5, 10, 20, 50]" 
                        :rows="10" <
                        removableSort 
                        stripedRows 
                        :globalFilterFields="['id_planta', 'nome']" 
                        :sortField="'id_planta'" 
                        :sortOrder="1" 
                        dataKey="id" 
                        :metaKeySelection="false" 
                        @rowSelect="handleRowSelection" 
                    >
                        <!-- Cabeçalho da tabela -->
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <!-- Exibição do total de registros filtrados -->
                                <div class="font-semibold">
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <!-- Campo de busca global -->
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <!-- Mensagem exibida quando não há dados -->
                        <template #empty> Nenhuma planta adicionada. </template>
                        <!-- Colunas da tabela -->
                        <Column field="id_planta" sortable header="Planta de Custo"></Column>
                        <Column field="nome" sortable header="Planta (Nome)"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <!-- Aba para adicionar ou editar uma planta -->
            <TabPanel :header="visible ? 'Editar Planta' : 'Adicionar Planta'">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <!-- Formulário para adicionar ou editar planta -->
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <!-- Campo para o código da planta -->
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">Código:</label>
                                        <InputText class="my-2" id="id_planta" v-model="planta.codigo" required />
                                    </div>
                                    <!-- Campo para o nome da planta -->
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">Planta (Nome):</label>
                                        <InputText class="my-2" id="nome" v-model="planta.nome" required />
                                    </div>
                                    <!-- Interruptor para ativar integração -->
                                    <InputSwitch class="grid mt-3 ml-3" v-model="integracao" inputId="switch1" />
                                    <label class="mt-3 ml-4" for="switch1">Tem integração?</label>

                                    <!-- Campos adicionais para integração -->
                                    <div v-if="integracao" class="card mt-4">
                                        <div v-if="integracao" class="my-3 grid">
                                            <!-- Campo UserID -->
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="userid">UserID:</label>
                                                <InputText class="my-2" id="userid" v-model="planta.userId" required />
                                            </div>
                                            <!-- Campo Senha -->
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="senha">Senha:</label>
                                                <InputText class="my-2" id="senha" v-model="planta.senha" required />
                                            </div>
                                            <!-- Campo URL -->
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="urlapi">URL:</label>
                                                <InputText class="my-2" id="urlapi" v-model="planta.urlapi" required />
                                            </div>
                                            <!-- Campo ID Cliente -->
                                            <div class="full lg:col-6 md:col-6 sm:col-12">
                                                <label for="idcliente">ID Cliente:</label>
                                                <InputText class="my-2" id="idcliente" v-model="planta.clienteid" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- Botões para salvar ou excluir planta -->
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarPlanta" />
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Excluir" icon="pi pi-trash" severity="danger" @click="deletePlantaDialog = true" />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarPlanta" />
                                </div>
                            </form>
                        </div>

                        <!-- Diálogo para confirmação de exclusão -->
                        <Dialog header="Deletar Planta" v-model:visible="deletePlantaDialog" style="width: 400px" :modal="true" :closable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class="">
                                    Você tem certeza que deseja deletar essa planta? <b>{{ planta.id_planta }}</b> - <b>{{ planta.nome }}</b> ?</span
                                >
                            </div>

                            <!-- Rodapé do diálogo com botões de confirmação ou cancelamento -->
                            <template #footer>
                                <Button label="Não" icon="pi pi-times" @click="deletePlantaDialog = false" class="p-button-text" />
                                <Button label="Sim" icon="pi pi-check" @click="deletePlanta" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <!-- Componente de carregamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style scoped>
.overflow-scroll {
    overflow: scroll;
    resize: none;
}

@media (max-width: 1024px) {
    .text-center {
        margin: 2px;
    }
}

.field {
    padding: 4.5px;
}

.buttons {
    width: 200px;
}

.titulo {
    white-space: pre-wrap;
    text-align: center;
}

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
