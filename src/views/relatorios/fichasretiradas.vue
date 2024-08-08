<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useRouter } from 'vue-router'
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

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const generatePDF = async () => {
    console.log('Gerando PDF para:', selectedItem.value); // Verifica o conteúdo de selectedItem

    if (!selectedItem.value || !selectedItem.value.nome) {
        console.error('Nome do funcionário não encontrado!');
        return;
    }

    const id_cliente = store.userIdCliente; // Supondo que o ID do cliente está disponível no store
    const textoFicha = await fetchTextoFicha(id_cliente);

    const doc = new jsPDF('l');

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB220 - Sistema de Gerenciamento de Dispenser Machines', 165, 200);

    doc.setFontSize(14);
    doc.text('FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(0, 0, 0); // Cor da borda
    doc.setLineWidth(0.25); // Largura da linha
    doc.rect(14, 30, 270, 6); // Desenha o retângulo da linha 1

    // Texto Linha 1
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOME:',15, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.nome || 'Nome do funcionário'}`, 32, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('N° DE REGISTRO: ',107, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.numero_registro || 'Número de registro'}`, 145, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA DE ADMISSÃO: ',205, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.data_admissao || 'Data de admissão'}`, 250, 35);

    // Linha 2
    doc.rect(14, 36, 270, 6); // Desenha o retângulo da linha 2

    // Texto Linha 2
    doc.setFont('helvetica', 'bold');
    doc.text('FUNÇÃO:', 15, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.funcao || 'Função do funcionário'}`, 36, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('SETOR:', 170, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.secao || 'Seção'}`, 187, 41);


    doc.setFontSize(11);
    const text = `1- Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente ao da praça.\n2- Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.\n3- Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo, ao setor competente.\n4- Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.\n${textoFicha}`;

    doc.text(text, 14, 50, { maxWidth: 270 });

    const tableColumn = ['DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];
    const tableRows = retiradas.value.map((item) => [item.dataRetirada || '', item.quantidade || '', item.descricao || '', item.numeroCA || '', item.autenticacao || '']);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
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

    doc.setFontSize(14);
    doc.text('______________________________________', 14, doc.autoTable.previous.finalY + 30);
    doc.text('Assinatura do funcionário', 14, doc.autoTable.previous.finalY + 50);
    doc.save(`LAB220 - ${selectedItem.value.nome || 'Funcionario'}.pdf`);
};

const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

const voltar = () => {
    show.value = true;
    selectedItem.value = {};
};

const dt = ref(null);


const fetchTextoFicha = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('/fichasretiradas/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        return response.data[0]?.TextoFicha || "Nada encontrado"; 
    } catch (error) {
        console.error('Erro ao buscar texto da ficha:', error);
        return;
    
    }
};

const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('plantas/listar', data, {
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
            label: funcionario.id_funcionario,
            value: funcionario.nome
        }));
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};

const onFuncionarioChange = async (event) => {
    const id_funcionario = event.value;
    if (id_funcionario) {
        try {
            const response = await axios.post(`/funcionarios/listar/`, {
                headers: {
                    Authorization: `Bearer ${store.token}`
                }
            });
            selectedItem.value = response.data.map((funcionario) => ({
                label: funcionario.nome,
                value: funcionario.id_funcionario
            }));
            console.log('Funcionário selecionado:', selectedItem.value);
        } catch (error) {
            console.error('Erro ao buscar dados do funcionário:', error);
        }
    } else {
        selectedItem.value = {};
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
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown @change="onFuncionarioChange()" class="drop" v-model="selectedItem.nome" :options="ListaFuncionarios" optionLabel="value" optionValue="value" ref="dropdown2" placeholder="Todos" />
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
