<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

// Gerar relatório
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const generatePDF = () => {
    const doc = new jsPDF();
    
     // Configurar cor do fundo
     doc.setFillColor(255, 255, 255); // Branco
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Preencher fundo

    // Configurar cor do texto e bordas
    doc.setTextColor(0, 0, 0); // Preto
    doc.setDrawColor(0, 0, 0); // Preto

    doc.setFillColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('LAB220 - Sistema de Gerenciamento de Dispenser Machines', 14, 10);

    doc.setFontSize(16);
    doc.text('FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO', 14, 20);

    doc.setFontSize(12); //tamanho do texto
    doc.text(`Testando a geração de arquivo com tabelas`, 14, 30)
     doc.text(`NOME: ${selectedItem.value.id_funcionario || 'Nome do funcionário'}`, 14, 35);
    // doc.text(`N° DE REGISTRO: ${selectedItem.value.numero_registro || 'Número de registro'}`, 14, 40);
    // doc.text(`DATA DE ADMISSÃO: ${selectedItem.value.data_admissao || 'Data de admissão'}`, 14, 50);
    // doc.text(`FUNÇÃO: ${selectedItem.value.funcao || 'Função do funcionário'}`, 14, 60);
    // doc.text(`SEÇÃO: ${selectedItem.value.secao || 'Seção'}`, 14, 70);

    const tableColumn = ["DT RETIRADA", "QUANT", "UNID", "DESCRIÇÃO DO EQUIPAMENTO", "N° DO C.A", "AUTENTICAÇÃO"]; //tentativa de tabela
    const tableRows = retiradas.value.map(item => [
        item.dataRetirada || '',
        item.quantidade || '',
        item.descricao || '',
        item.numeroCA || '',
        item.autenticacao || ''
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 80,
    theme: 'grid',
    styles: {
            fillColor: [255, 255, 255], // Fundo das células branco
            textColor: [0, 0, 0], // Texto preto
            lineColor: [0, 0, 0], // Cor das linhas
            lineWidth: 0.25 // Largura das linhas
        },
        headStyles: {
            fillColor: [255, 255, 255], // Fundo do cabeçalho preto
            textColor: [0, 0, 0], // Texto do cabeçalho branco
            lineWidth: 0.25
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240], // Cor alternativa para linhas
        }
 });

    doc.text('______________________________________', 14, doc.autoTable.previous.finalY + 20);
    doc.text('Assinatura do funcionário', 14, doc.autoTable.previous.finalY + 30);

    doc.save('LAB220 - Sistema de Gerenciamento de Vending Machines.pdf');
};

const showDialog = ref(false);
const dialogMessage = ref('');

const loading = ref(false);

const store = useAuthStore();
const toast = useToast();
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const todosOption = { label: 'Todos', value: null };
const historico = ref([]);
const ListaFuncionarios = ref([todosOption]);;
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const retiradas = ref([]);
const plantas = ref([todosOption]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref([]);
const relatorio = ref({
    id_planta: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
});

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,       
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };
    try {
        loading.value = true
        const response = await axios.post('relatorios/gerarficha', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = '';
        }
        // Aqui você define o selectedItem com o nome do funcionário
        if (relatorio.value.id_funcionario) {
            const funcionario = ListaFuncionarios.value.find(f => f.value === relatorio.value.id_funcionario);
            selectedItem.value = {
                nome: funcionario ? funcionario.label : 'Nome do funcionário'
            };
        }
    } catch (error) {
        console.error('Erro ao buscar fichas:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
}; 

const toISODate = (date) => {
    return date.toISOString().split('T')[0];
};

const voltar = () => {
    show.value = true;
    selectedItem.value = {};
};

const dt = ref(null);


const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarplanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantas.value = [todosOption, ...response.data.map(({ id_planta }) => ({
            label: `Planta  ${id_planta}`,
            value: id_planta
        }))];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};

const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncionarios.value = [todosOption,...response.data.map((funcionario) => ({
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }))];
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};
const closeAllDropdowns = () => {
  if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
  if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
};

const handleDatepickerOpen = () => {
  closeAllDropdowns();
};
onMounted(() => {
    fetchIdPlanta();
    fetchFuncionarios();
});



</script>

<template>
    <div class="card">
        <div class="form">
            <div class="grid mt-3 mx-1 px-1">
                <h5 class="my-4 text-2xl">Fichas Retiradas</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" 
                        :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos"
                        ref="dropdown1"/>
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" 
                        :options="ListaFuncionarios" optionLabel="label" optionValue="value"
                        ref="dropdown2" placeholder="Todos"/>
                    </div>
                    <div class="field datepicker xl:col-2 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker class=" drop" v-model="relatorio.data_inicio" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false"
                        @open="handleDatepickerOpen" teleport="body" placeholder="Selecione uma data"/>
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-6 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker class="datepicker" v-model="relatorio.data_final" showIcon :showOnFocus="false" 
                        :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" teleport="body" placeholder="Selecione uma data"
                        @open="handleDatepickerOpen"/>
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-6 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Gerar Ficha" icon="pi pi-download" severity="info" @click="generatePDF" />
                    </div>

                    
                </div>
                
                <Card v-if="!show">
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="" :visible.sync="showDialog" style="width: 50vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
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
