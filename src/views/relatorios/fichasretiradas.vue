<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import axios from '@/axios.js';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { parse } from 'date-fns'; //converte a data para o pdf

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
//const ListaFuncionarios = ref([todosOption]);
const dropdown1 = ref(null);
const dropdown2 = ref(null);
const retiradas = ref([]);
const plantas = ref([todosOption]);

const ListaFuncionariosOriginal = ref([]);
const ListaFuncionarios = ref([]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const show = ref(true);
const selectedItem = ref({});

const relatorio = ref({
    id_planta: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_final: new Date()
});

const format = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Data inválida';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

const voltar = () => {
    show.value = true;
    selectedItem.value = {};
};

const fetchRelatorio = async () => {
    const data = {
        id_cliente: store.userIdCliente,
        id_funcionario: selectedItem.value.id_funcionario || null,
        data_inicio: toISODate(relatorio.value.data_inicio),
        data_final: toISODate(relatorio.value.data_final)
    };

    try {
        const response = await axios.post('fichasretiradas/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });

        if (response.data) {
            retiradas.value = response.data;
        } else {
            console.error('Erro ao buscar relatório: Dados não encontrados');
        }
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
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
    ListaFuncionariosOriginal.value = [
      todosOption,
      ...response.data.map((funcionario) => ({
        label: funcionario.nome,
        value: funcionario.id_funcionario,
        id_planta : funcionario.id_planta
      }))
    ];
    // Inicialize a lista de funcionários com todos os dados
    ListaFuncionarios.value = ListaFuncionariosOriginal.value;

  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
  }
};

const filterFuncionarios = () => {
  if (relatorio.value.id_planta) {
    ListaFuncionarios.value = ListaFuncionariosOriginal.value.filter((funcionario) => {
      const matchesPlanta = relatorio.value.id_planta ? funcionario.id_planta === relatorio.value.id_planta : true;

      return matchesPlanta;
    });
  } else {
    // Se não tiver filtro, exibe todos os funcionários
    ListaFuncionarios.value = ListaFuncionariosOriginal.value;
  }
};

const generatePDF = async () => {
    if (!selectedItem.value.nome) {
        showDialog.value = true;
        dialogMessage.value = 'Por favor, selecione um funcionário.';
        return;
    }

    // checkDataBeforeGeneratingPDF();

    await fetchRelatorio();

    const id_cliente = store.userIdCliente;
    const textoFicha = await TextoFicha(id_cliente);

    const doc = new jsPDF('l');

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB220 - Sistema de Gerenciamento de Dispenser Machines', 14, 200);

    doc.setFontSize(14);
    doc.text('FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(0, 0, 0); // Cor da borda
    doc.setLineWidth(0.25); // Largura da linha
    doc.rect(14, 30, 270, 6); //  o retângulo da linha 1

    // Texto Linha 1
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOME:', 15, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.nome || ''}`, 30, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('N° DE REGISTRO:', 107, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.matricula || ''}`, 145, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA DE ADMISSÃO:', 203, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.data_admissao ? new Date(selectedItem.value.data_admissao).toLocaleDateString('pt-BR') : ''}`, 248, 35);

    // Linha 2
    doc.rect(14, 36, 270, 6); // o retângulo da linha 2

    // Texto Linha 2
    doc.setFont('helvetica', 'bold');
    doc.text('FUNÇÃO:', 15, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.id_funcao || ''}`, 36, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('SETOR:', 107, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.id_setor || ''}`, 123, 41);

    doc.setFontSize(11);
    const text = `${textoFicha}`;

    doc.text(text, 14, 55, { maxWidth: 270 });

    const tableColumn = ['NOME DO ITEM', 'DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];

    const tableRows = retiradas.value.map((item) => {
        try {
            const parsedDate = parse(item.Dia, 'dd/MM/yyyy - HH:mm', new Date());
            const formattedDate = format(parsedDate, 'dd/MM/yyyy - HH:mm');
            return [item.ProdutoNome || '', formattedDate, item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || ''];
        } catch (error) {
            console.error('Error parsing date:', error);
            return [item.ProdutoNome || '', 'Data inválida', item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || ''];
        }
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        width: 270,
        startY: 85,
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
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 70 },
            5: { cellWidth: 50 }
        }
    });

    doc.setFontSize(12);
    doc.text('Data:', 30, doc.autoTable.previous.finalY + 30);
    doc.text('_______/_______/_______', 40, doc.autoTable.previous.finalY + 30); // Linha para o campo de data

    doc.setFontSize(12);
    doc.text('______________________________________', 180, doc.autoTable.previous.finalY + 30);
    doc.text('Assinatura do funcionário', 200, doc.autoTable.previous.finalY + 50);
    doc.save(`LAB220 - ${selectedItem.value.nome || 'Funcionario'}.pdf`);
};

const TextoFicha = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('fichasretiradas/textoFicha', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        return (
            response.data[0]?.TextoFicha ||
            '1- Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente ao da praça.\n2- Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.\n3- Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo, ao setor competente.\n4- Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.'
        );
    } catch (error) {
        console.error('Erro ao buscar texto da ficha:', error);
        return;
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
                <h5 class="my-4 text-2xl">Fichas de Retiradas</h5>
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <Dropdown class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Todos" ref="dropdown1" @change="filterFuncionarios" />
                    </div>
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <Dropdown class="drop" v-model="selectedItem" :options="ListaFuncionarios" optionLabel="label" optionValue="value" ref="dropdown2" placeholder="Todos" />
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
