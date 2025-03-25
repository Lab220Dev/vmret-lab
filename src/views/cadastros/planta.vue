<script setup>
import { reactive, ref, onMounted, watch } from 'vue'; // Importa funções reativas e de ciclo de vida do Vue
import { useToast } from 'primevue/usetoast'; // Importa o hook useToast da biblioteca primevue para exibir notificações
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente LoadingSpinner
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de correspondência de filtro da biblioteca primevue
import plantaService from '@/services/plantaService.js'; // Importa o serviço plantaService
import { resetPlantaForm, applyGlobalFilter } from '@/helpers/formHelper'; // Importa funções auxiliares para manipulação de formulários
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados
import { isMobEnabled, prepareListData } from '@/helpers/HelperUtils.js'; // Importa funções auxiliares
import { useI18n } from 'vue-i18n'; // Importa o hook useI18n da biblioteca vue-i18n para internacionalização

const { t } = useI18n(); // Desestruturação do hook useI18n para obter a função t, que é usada para tradução

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Define o filtro global com o modo de correspondência CONTAINS
});

const active = ref(0); // Cria uma referência reativa para controlar o índice ativo
const store = useAuthStore(); // Inicializa o store de autenticação
const dataStore = useDataStore(); // Inicializa o store de dados
const toast = useToast(); // Inicializa o hook useToast para exibir notificações
const ListaPlanta = ref([]); // Cria uma referência reativa para armazenar a lista de plantas
const visible = ref(false); // Cria uma referência reativa para controlar a visibilidade
const integracao = ref(false); // Cria uma referência reativa para controlar a integração
const deletePlantaDialog = ref(false); // Cria uma referência reativa para controlar a visibilidade do diálogo de exclusão de planta
const loading = ref(false); // Cria uma referência reativa para controlar o estado de carregamento
const Mob = ref(false); // Cria uma referência reativa para controlar o estado de mobilidade
const filteredCount = ref(0); // Cria uma referência reativa para armazenar a contagem de registros filtrados

let planta = reactive({
    nome: '',
    id_planta: '',
    userId: '',
    senha: '',
    codigo: '',
    urlapi: '',
    clienteid: ''
}); // Cria um objeto reativo para armazenar os dados da planta

const lazyParams = ref({
    first: 0, // Índice inicial
    rows: 10, // Número de registros por página
    sortField: 'id_planta', // Campo padrão para ordenação
    sortOrder: 1, // Ordem padrão (1 = ascendente, -1 = descendente)
    filters: {} // Filtros aplicados
});
const onRowSelect = (event) => { // Declara uma função chamada onRowSelect
    planta = event.data; // Define a planta selecionada com os dados do evento
    active.value = 1; // Define o índice ativo como 1
    visible.value = true; // Define a visibilidade como true
    loadPlanta(); // Carrega os dados da planta
};

const submitForm = () => { // Declara uma função chamada submitForm
    if (visible.value) { // Verifica se a visibilidade é true
        atualizarPlanta(); // Atualiza a planta
    } else {
        adicionarPlanta(); // Adiciona uma nova planta
    }
};
const onFilterChange = async () => {
    lazyParams.value.filters = filters.value; // Atualiza os filtros
    await loadPlanta(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onSortChange = async (event) => {
    lazyParams.value.sortField = event.sortField; // Campo a ser ordenado
    lazyParams.value.sortOrder = event.sortOrder; // Ordem (ascendente/descendente)
    await loadPlanta(Math.ceil(lazyParams.value.first / lazyParams.value.rows) + 1); // Busca os dados
};
const onPageChange = async (event) => {
    lazyParams.value.first = event.first; // Atualiza o índice inicial
    lazyParams.value.rows = event.rows; // Atualiza o número de registros por página
    await loadPlanta(Math.ceil(event.first / event.rows) + 1); // Recalcula a página atual e busca os dados
};
const loadPlanta = async (page = 1) => { // Declara uma função assíncrona chamada loadPlanta
    loading.value = true; // Ativa o estado de loading
    try {
        const params = {
            first: (page - 1) * lazyParams.value.rows, // Calcula o índice inicial com base na página
            rows: lazyParams.value.rows, // Número de registros por página
            sortField: lazyParams.value.sortField, // Campo para ordenação
            sortOrder: lazyParams.value.sortOrder, // Ordem (1 = ascendente, -1 = descendente)
            filters: lazyParams.value.filters // Filtros aplicados
        };
        const data = prepareListData(params);
        const response = await plantaService.listarPlantasPaginado(data);
        ListaPlanta.value = response.data.plantas;
        filteredCount.value = response.data.totalRecords;
    } catch (error) {
        console.error('Erro ao listar plantas:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_listing_error'), life: 3000 });
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

watch(
    () => filters.value.global.value, // Observa mudanças no valor global do filtro
    () => {
        filteredCount.value = applyGlobalFilter(ListaPlanta.value, filters.value.global.value).length; // Atualiza a contagem de registros filtrados
    },
    { immediate: true } // Aciona imediatamente
);

const adicionarPlanta = async () => { // Declara uma função assíncrona chamada adicionarPlanta
    loading.value = true; // Ativa o estado de loading
    try {
        await plantaService.adicionarPlanta({ id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta }, store.token);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_add_sucess'), life: 3000 });
        loadPlanta();
        active.value = 0;
        resetPlantaForm(planta);
    } catch (error) {
        console.error('Erro ao adicionar planta:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_add_fail'), life: 3000 });
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const deletePlanta = async () => { // Declara uma função assíncrona chamada deletePlanta
    let data = { id_planta: planta.id_planta }; // Cria um objeto com o ID da planta a ser deletada
    loading.value = true; // Ativa o estado de loading
    try {
        await plantaService.deletarPlanta(data); // Faz uma requisição para deletar a planta
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_delete_sucess'), life: 3000 }); // Adiciona uma mensagem de sucesso ao toast
        dataStore.invalidatePlantasCache(); // Invalida o cache de plantas no dataStore
        deletePlantaDialog.value = false; // Fecha o diálogo de confirmação de exclusão de planta
        loadPlanta(); // Recarrega a lista de plantas
        active.value = 0; // Define o valor de active como 0
    } catch (error) {
        console.error('Erro ao deletar planta:', error); // Exibe o erro no console
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_delete_error'), life: 3000 }); // Adiciona uma mensagem de erro ao toast
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

const atualizarPlanta = async () => { // Declara uma função assíncrona chamada atualizarPlanta
    loading.value = true; // Ativa o estado de loading
    try {
        await plantaService.atualizarPlanta({ id_usuario: store.userId, id_cliente: store.userIdCliente, ...planta }, store.token);
        toast.add({ severity: 'success', summary: t('title_sucess'), detail: t('factory_update_sucess'), life: 3000 });
        loadPlanta();
        active.value = 0;
        resetPlantaForm(planta);
    } catch (error) {
        console.error('Erro ao atualizar planta:', error);
        toast.add({ severity: 'error', summary: t('title_error'), detail: t('factory_update_fail'), life: 3000 });
    } finally {
        loading.value = false; // Desativa o estado de loading
    }
};

watch(active, (newIndex, oldIndex) => { // Observa mudanças na variável reativa active
    if (newIndex !== oldIndex && newIndex === 0) { // Verifica se o índice mudou e se o novo índice é 0
        resetForm(); // Reseta o formulário
        visible.value = false; // Define a visibilidade como false
    }
});

const resetForm = () => resetPlantaForm(planta); // Declara uma função chamada resetForm que reseta o formulário da planta

onMounted(() => { // Declara uma função assíncrona chamada onMounted
    loadPlanta(); // Carrega os dados da planta
    Mob.value = isMobEnabled(); // Define o valor de Mob com base na função isMobEnabled
});

function debounce(func, wait = 300) { // Declara uma função chamada debounce
    let timeout; // Declara uma variável para armazenar o timeout
    return (...args) => { // Retorna uma função que recebe argumentos
        clearTimeout(timeout); // Limpa o timeout anterior
        timeout = setTimeout(() => func.apply(this, args), wait); // Define um novo timeout para chamar a função após o tempo de espera
    };
}

const debouncedFilterChange = debounce(() => { // Declara uma função chamada debouncedFilterChange que usa debounce para chamar onFilterChange após 300ms
    onFilterChange();
}, 300);
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel :header="$t('list_factories')">
                <div class="col-12">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaPlanta"
                        selectionMode="single"
                        tableStyle="min-width: 25%"
                        paginator
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        lazy
                        :totalRecords="filteredCount"
                        :rows="lazyParams.value?.rows || 10"
                        removableSort
                        stripedRows
                        :globalFilterFields="['id_planta', 'nome']"
                        :sortField="lazyParams.value?.sortField || 'id_planta'"
                        :sortOrder="lazyParams.value?.sortOrder || 1"
                        dataKey="id"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                        @filter="onFilterChange($event)"
                        @page="onPageChange($event)"
                        @sort="onSortChange($event)"
                    >
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <span>{{ $t('total_records',{count: filteredCount})}}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" :placeholder="t('search')" type="search" @input="debouncedFilterChange" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty>{{ t('factory_empty') }} </template>
                        <Column field="id_planta" sortable :header="t('code')"></Column>
                        <Column field="nome" sortable :header="t('factory_name')"></Column>
                    </DataTable>
                </div>
            </TabPanel>
            <TabPanel :header="visible ? t('edit_factory') : t('add_factory')">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <form @submit.prevent="submitForm">
                                <div class="p-fluid formgrid grid m-0 p-0">
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="id_planta">{{ t('code') }}:</label>
                                        <InputText class="my-2" id="id_planta" v-model="planta.codigo" required />
                                    </div>
                                    <div class="full lg:col-12 md:col-12 sm:col-12">
                                        <label for="nome">{{ t('factory_name') }}:</label>
                                        <InputText class="my-2" id="nome" v-model="planta.nome" required />
                                    </div>
                                    
                                </div>
                                <div class="mr-1 mt-4 grid justify-content-end">
                                    <Button v-if="visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="primary" @click="atualizarPlanta" :disabled="Mob" />
                                    <Button
                                        v-if="visible"
                                        style="width: 15%"
                                        class="flex align-items-center justify-content-center m-2 mr-0"
                                        :label="$t('delete')"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        @click="deletePlantaDialog = true"
                                        :disabled="Mob"
                                    />
                                    <Button v-if="!visible" style="width: 15%" class="flex align-items-center justify-content-center m-2 mr-0" :label="$t('save')" icon="pi pi-check" severity="info" @click="adicionarPlanta" :disabled="Mob" />
                                </div>
                            </form>
                        </div>

                        <Dialog :header="$t('factory_dialog')" v-model:visible="deletePlantaDialog" style="width: 400px" :modal="true" :closable="false" :draggable="false">
                            <div class="confirmation-content">
                                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                                <span class=""> {{ t('factory_dialog_text', { id: planta.id_planta, nome: planta.nome }) }}</span>
                            </div>

                            <template #footer>
                                <Button :label="$t('no')" icon="pi pi-times" @click="deletePlantaDialog = false" class="p-button-text" />
                                <Button :label="$t('yes')" icon="pi pi-check" @click="deletePlanta" class="p-button-text" />
                            </template>
                        </Dialog>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style scoped>
.overflow-scroll { /* Define uma classe para permitir rolagem e desativar o redimensionamento */
    overflow: scroll; /* Permite rolagem */
    resize: none; /* Desativa o redimensionamento */
}

@media (max-width: 1024px) { /* Define estilos para telas com largura máxima de 1024px */
    .text-center { /* Define uma classe para centralizar o texto */
        margin: 2px; /* Define uma margem de 2px */
    }
}

.field { /* Define uma classe para campos de formulário */
    padding: 4.5px; /* Define um padding de 4.5px */
}

.buttons { /* Define uma classe para botões */
    width: 200px; /* Define uma largura de 200px */
}

.titulo { /* Define uma classe para títulos */
    white-space: pre-wrap; /* Permite quebra de linha dentro do texto */
    text-align: center; /* Centraliza o texto */
}

@media (max-width: 580px) { /* Define estilos para telas com largura máxima de 580px */
    .full { /* Define uma classe para elementos que ocupam toda a largura */
        flex: 0 0 100%; /* Define o flex-grow, flex-shrink e flex-basis */
        max-width: 100%; /* Define a largura máxima como 100% */
        margin-bottom: 1rem; /* Define uma margem inferior de 1rem */
        width: 100%; /* Define a largura como 100% */
        margin: 1px; /* Define uma margem de 1px */
    }
}
</style>
