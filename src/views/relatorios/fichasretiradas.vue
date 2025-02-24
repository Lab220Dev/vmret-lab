<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para seleção de datas
import { FilterMatchMode } from 'primevue/api'; // Importa a API de filtros do PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa a função `useToast` do PrimeVue para mostrar mensagens de notificação
import '@vuepic/vue-datepicker/dist/main.css'; // Importa os estilos do VueDatePicker
import { ref, onMounted } from 'vue'; // Importa funções do Vue: `ref` para reatividade e `onMounted` para ciclo de vida do componente
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de autenticação para obter dados de usuário e token
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import { formatDateToString } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import {GerarPdfRetirada} from '@/helpers/RelatorioHelper.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const showDialog = ref(false); // Controla a exibição de um diálogo
const dialogMessage = ref(''); // Mensagem exibida no diálogo
const loading = ref(false); // Obtém o store de autenticação
const toast = useToast(); // Instancia o toast para notificações
const todosOption = { label: 'Todos', value: null }; // Opção padrão para filtros
const plantas = ref([todosOption]); // Lista de plantas disponíveis para seleção
const ListaFuncionariosOriginal = ref([]); // Lista original de funcionários
const ListaFuncionarios = ref([]); // Lista filtrada de funcionários
const dataStore = useDataStore();
// Filtros para a DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para busca na tabela
});
const selectedItem = ref({}); // Item selecionado (funcionário)

const relatorio = ref({
    id_planta: '', // ID da planta
    id_funcionario: '', // ID do funcionário
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data de início (primeiro dia do mês atual)
    data_final: new Date() // Data final (data atual)
});

/**
 * Função para filtrar a lista de funcionários com base na planta selecionada.
 */
const filterFuncionarios = () => {
    if (relatorio.value.id_planta) {
        // Se houver uma planta selecionada
        ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
            const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true; // Filtra os funcionários pela planta
            return matchesPlanta; // Retorna os funcionários que atendem ao critério de planta
        });
    } else {
        ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Se não houver filtro, exibe todos os funcionários
    }
};

/**
 * Função para gerar o PDF do relatório.
 * Caso o funcionário não tenha sido selecionado, exibe um alerta.
 */
const generatePDF = async () => {
    try {
        loading.value = true;
        await GerarPdfRetirada(selectedItem, relatorio);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
    }
};

/**
 * Função para fechar todos os dropdowns abertos.
 */
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown1 se estiver visível
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown2 se estiver visível
};
const selecionaFuncionario = () => {
    selectedItem.value = ListaFuncionariosOriginal.value.find((funcionario) => funcionario.value === relatorio.value.id_funcionario);
};
/**
 * Função para tratar a abertura do Datepicker.
 */
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha os dropdowns ao abrir o Datepicker
};
const loadData = async () => {
    loading.value = true;
    try {
        plantas.value = dataStore.plantas || (await dataStore.fetchPlantas());
        ListaFuncionariosOriginal.value = await relatorioService.listaFuncionario();
        ListaFuncionarios.value = ListaFuncionariosOriginal.value;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', life: 3000, detail: error.message });
    } finally {
        loading.value = false;
    }
};
// Função executada quando o componente é montado
onMounted(() => {
    loadData();
});
</script>

<template>
    <!-- Card principal que contém o formulário de filtros e informações -->
    <div class="card">
        <div class="form">
            <!-- Título da página "Fichas de Retiradas" <h5 class="my-6 ml-2 text-2xl">{{t('fichas_de_retiradas')}}<hr/></h5>-->
            <div class="text-center">
                 
            </div>
            <!-- Grid do formulário, com margens e espaçamento definidos -->
            <div class="">
                <div class="p-0 m-0 p-fluid formgrid grid col-12">
                    <!-- Campo de seleção para a Planta -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">{{t('factory')}}:</label>
                        <!-- Componente Dropdown para selecionar a planta, com lista de opções fornecida por 'plantas' -->
                        <Dropdown filter class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')" ref="dropdown1" @change="filterFuncionarios" />
                    </div>
                    <!-- Campo de seleção para Funcionário -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">{{t('employee')}}:</label>
                        <!-- Componente Dropdown para selecionar o funcionário, com lista de opções fornecida por 'ListaFuncionarios' -->
                        <Dropdown filter class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" ref="dropdown2" :placeholder="$t('all')" @change="selecionaFuncionario"/>
                    </div>
                    <!-- Campo de seleção para Data Inicial -->
                    <div class="field datepicker xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <!-- Componente VueDatePicker para selecionar a data inicial, com o formato de data "dd/MM/yyyy" -->
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            :placeholder="$t('initial_date_placeholder')" 
                        />
                    </div>
                    <!-- Campo de seleção para Data Final -->
                    <div class="field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <VueDatePicker
                            class="datepicker"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="formatDateToString"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            teleport="body"
                            :placeholder="$t('end_date_placeholder')"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <!-- Botão para gerar a ficha -->
                    <div class="ml-0 pl-0 field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <Button class="filtrar" type="button" :label="$t('generate_pdf')" icon="pi pi-download" severity="info" @click="generatePDF" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Exibe um spinner de carregamento se "loading" for verdadeiro -->
    <LoadingSpinner v-if="loading" />

    <!-- Diálogo que exibe mensagens de alerta ou erro -->
    <Dialog header="" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>

        <!-- Rodapé do diálogo com um botão OK -->
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style scoped>
.card {
    overflow-x: auto;
    overflow: visible; /* Permite que os elementos filhos excedam os limites do pai */
}

.datepicker {
    position: relative; /* Necessário para o posicionamento absoluto funcionar corretamente */
}

.vue-datepicker {
    position: absolute; /* Permite que o DatePicker ultrapasse os limites do grid */
    z-index: 1050; /* Garante que o DatePicker fique acima de outros elementos */
}

.datatable-wrapper {
    overflow: hidden;
    width: 100vw;
}

.filtrar {
    margin-top: 25px;
    width: 179px;
}

.drop {
    width: 100%;
}

.vue-datepicker {
    z-index: 1050; /* Assegura que o menu do date picker seja exibido acima de outros elementos */
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap;
    text-align: left;
}
</style>
