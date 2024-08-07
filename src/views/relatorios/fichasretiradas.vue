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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const showDialog = ref(false);
const dialogMessage = ref('');

const loading = ref(false);

const store = useAuthStore();
const toast = useToast();
const emptyMessage = ref('Ainda não foi feita nenhuma busca');
const todosOption = { label: 'Todos', value: null };
const historico = ref([]);
const ListaFuncionarios = ref([todosOption]);
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

// const gerarRelatorioPDF = async () => {
//     const data = {
//         id_cliente: store.userIdCliente
//     };

//     try {
//         const response = await axios.post('fichasretiradas/gerarPDF', data, {
//             responseType: 'blob', // Importante para o download do PDF
//             headers: {
//                 Authorization: `Bearer ${store.token}`
//             }
//         });

//         const blob = new Blob([response.data], { type: 'application/pdf' });
//         const link = document.createElement('a');
//         link.href = window.URL.createObjectURL(blob);
//         link.download = 'Fichas Retiradas.pdf';
//         link.click();
//     } catch (error) {
//         console.error('Erro ao gerar relatório PDF:', error);
//     }
// };

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
        loading.value = true;
        const response = await axios.post('fichasRetiradas/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        retiradas.value = response.data;
        if (Array.isArray(retiradas.value) && retiradas.value.length === 0) {
            dialogMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
            showDialog.value = true;
        }
        if (retiradas.value.length === 0) {
            emptyMessage.value = 'Nenhum dado encontrado. Por favor, verifique sua consulta.';
        } else {
            emptyMessage.value = '';
        }
    } catch (error) {
        console.error('Erro ao buscar fichas:', error);
    } finally {
        loading.value = false; // Desativando loading
    }
};

const generatePDF = () => {
    console.log('Gerando PDF para:', selectedItem.value); // Verifica o conteúdo de selectedItem

    const doc = new jsPDF();

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    doc.text('LAB220 - Sistema de Gerenciamento de Dispenser Machines', 14, 10);
    doc.setFontSize(16);
    doc.text('FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Adicione este log para verificar o nome
    console.log('Nome do funcionário:', selectedItem.value.nome);

    // Certifique-se de que selectedItem.value.nome existe e é uma string
    doc.text(`NOME: ${selectedItem.value.nome ? selectedItem.value.nome : 'Nome do funcionário'}`, 14, 35);

    const tableColumn = ['DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];
    const tableRows = retiradas.value.map((item) => [item.dataRetirada || '', item.quantidade || '', item.descricao || '', item.numeroCA || '', item.autenticacao || '']);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.25,
            fontSize: 10
        },
        headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.25,
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 20 },
            3: { cellWidth: 70 },
            4: { cellWidth: 30 },
            5: { cellWidth: 30 }
        }
    });

    doc.text('______________________________________', 14, doc.autoTable.previous.finalY + 20);
    doc.text('Assinatura do funcionário', 14, doc.autoTable.previous.finalY + 30);
    doc.save('LAB220 - Sistema de Gerenciamento de Vending Machines.pdf');
};

const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
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
        plantas.value = [
            todosOption,
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`,
                value: id_planta
            }))
        ];
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
        ListaFuncionarios.value = response.data.map((funcionario) => ({
            label: funcionario.nome,
            value: funcionario.id_funcionario
        }));
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
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" ref="dropdown2" placeholder="Todos" />
                    </div>
                    <div class="field datepicker xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            @open="handleDatepickerOpen"
                            teleport="body"
                            placeholder="Selecione uma data"
                        />
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <label for="perfil">Data Final:</label>
                        <VueDatePicker
                            class="datepicker"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            teleport="body"
                            placeholder="Selecione uma data"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Gerar Ficha" icon="pi pi-download" severity="info" @click="generatePDF" />
                    </div>

                    <div class="field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" label="Buscar" icon="pi pi-search" severity="info" @click="buscar" />
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
