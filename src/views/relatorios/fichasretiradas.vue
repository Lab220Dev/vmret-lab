<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente VueDatePicker para seleção de datas
import { FilterMatchMode } from 'primevue/api'; // Importa a API de filtros do PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa a função `useToast` do PrimeVue para mostrar mensagens de notificação
import '@vuepic/vue-datepicker/dist/main.css'; // Importa os estilos do VueDatePicker
import { ref, onMounted } from 'vue'; // Importa funções do Vue: `ref` para reatividade e `onMounted` para ciclo de vida do componente
import axios from '@/axios.js'; // Importa a instância do Axios configurada para requisições HTTP
import { useRouter } from 'vue-router'; // Importa o `useRouter` do Vue para navegação
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar os dados do usuário autenticado
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento
import { parse } from 'date-fns'; // Importa a função `parse` do `date-fns` para parse de datas

// Gerar relatório
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF para gerar PDFs
import autoTable from 'jspdf-autotable'; // Importa o plugin autoTable do jsPDF para gerar tabelas no PDF

// Variáveis reativas e estados iniciais
const showDialog = ref(false); // Controla a exibição de um diálogo
const dialogMessage = ref(''); // Mensagem exibida no diálogo
const loading = ref(false); // Controle de estado de carregamento
const store = useAuthStore(); // Obtém o store de autenticação
const toast = useToast(); // Instancia o toast para notificações
const emptyMessage = ref('Ainda não foi feita nenhuma busca'); // Mensagem exibida quando não há dados
const todosOption = { label: 'Todos', value: null }; // Opção padrão para filtros
const historico = ref([]); // Histórico de registros de retiradas
const retiradas = ref([]); // Dados das retiradas
const plantas = ref([todosOption]); // Lista de plantas disponíveis para seleção
const ListaFuncionariosOriginal = ref([]); // Lista original de funcionários
const ListaFuncionarios = ref([]); // Lista filtrada de funcionários

// Filtros para a DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para busca na tabela
});
const show = ref(true); // Controle para exibição do conteúdo
const selectedItem = ref({}); // Item selecionado (funcionário)

const relatorio = ref({
    id_planta: '', // ID da planta
    id_funcionario: '', // ID do funcionário
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data de início (primeiro dia do mês atual)
    data_final: new Date() // Data final (data atual)
});

/**
 * Formata uma data no formato 'dd/MM/yyyy'.
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
const format = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) { // Verifica se a data é válida
        return 'Data inválida'; // Se não for uma data válida, retorna mensagem de erro
    }
    const day = date.getDate().toString().padStart(2, '0'); // Formata o dia com dois dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Formata o mês com dois dígitos
    const year = date.getFullYear(); // Obtém o ano
    return `${day}/${month}/${year}`; // Retorna a data no formato 'dd/MM/yyyy'
};

/**
 * Converte uma data para o formato ISO.
 * @param {Date} date - A data a ser convertida.
 * @returns {string|null} - A data no formato ISO ou null se não fornecido.
 */
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null; // Converte a data para ISO ou retorna null se não houver data
};

/**
 * Função para voltar à tela anterior (sem selecionar item).
 */
const voltar = () => {
    show.value = true; // Exibe a tela principal
    selectedItem.value = {}; // Limpa o item selecionado
};

/**
 * Função para buscar o relatório de retiradas.
 * Faz uma requisição para o backend para obter os dados de retiradas baseados no filtro aplicado.
 */
const fetchRelatorio = async () => {
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente do usuário autenticado
        id_funcionario: selectedItem.value.id_funcionario || null, // ID do funcionário selecionado, ou null se não houver seleção
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início do filtro
        data_final: toISODate(relatorio.value.data_final) // Data final do filtro
    };

    try {
        const response = await axios.post('fichasretiradas/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Cabeçalho de autorização com o token do usuário
            }
        });

        if (response.data) { // Se a resposta contiver dados
            retiradas.value = response.data; // Preenche a lista de retiradas com os dados da resposta
        } else {
            console.error('Erro ao buscar relatório: Dados não encontrados'); // Se não houver dados, exibe mensagem de erro
        }
    } catch (error) {
        console.error('Erro ao buscar relatório:', error); // Caso ocorra erro na requisição, exibe o erro no console
    }
};

/**
 * Função para buscar a lista de plantas disponíveis para o cliente.
 */
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente do usuário autenticado
    };
    try {
        const response = await axios.post('plantas/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Cabeçalho de autorização com o token do usuário
            }
        });
        plantas.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map(({ id_planta }) => ({
                label: `Planta  ${id_planta}`, // Formata a descrição da planta
                value: id_planta // Valor do ID da planta
            }))
        ];
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error); // Se houver erro ao buscar plantas, exibe no console
    }
};

/**
 * Função para buscar a lista de funcionários associados a uma planta.
 */
const fetchFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente do usuário autenticado
    };
    try {
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Cabeçalho de autorização com o token do usuário
            }
        });
        ListaFuncionariosOriginal.value = [
            todosOption, // Adiciona a opção "Todos"
            ...response.data.map((funcionario) => ({
                label: funcionario.nome, // Nome do funcionário
                value: funcionario.id_funcionario, // ID do funcionário
                id_planta: funcionario.id_planta // ID da planta do funcionário
            }))
        ];
        ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Inicializa a lista de funcionários
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error); // Se ocorrer erro ao buscar funcionários, exibe no console
    }
};

/**
 * Função para filtrar a lista de funcionários com base na planta selecionada.
 */
const filterFuncionarios = () => {
    if (relatorio.value.id_planta) { // Se houver uma planta selecionada
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
    if (!selectedItem.value.nome) { // Verifica se um funcionário foi selecionado
        showDialog.value = true; // Exibe o diálogo
        dialogMessage.value = 'Por favor, selecione um funcionário.'; // Mensagem no diálogo
        return; // Retorna se nenhum funcionário for selecionado
    }

    // Chama a função para buscar o relatório de retiradas
    await fetchRelatorio();

    const id_cliente = store.userIdCliente; // ID do cliente do usuário autenticado
    const textoFicha = await TextoFicha(id_cliente); // Obtém o texto da ficha

    const doc = new jsPDF('l'); // Cria um novo documento PDF em formato paisagem (landscape)

    doc.setFillColor(255, 255, 255); // Define a cor de fundo do documento como branco
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Desenha o retângulo de fundo
    doc.setTextColor(0, 0, 0); // Define a cor do texto como preto
    doc.setDrawColor(0, 0, 0); // Define a cor das linhas do PDF

    doc.setFontSize(12); // Define o tamanho da fonte
    doc.setFont('helvetica', 'bold'); // Define a fonte como Helvetica em negrito
    doc.text('LAB220 - Sistema de Gerenciamento de Dispenser Machines', 14, 200); // Título do documento

    doc.setFontSize(14); // Altera o tamanho da fonte
    doc.text('FICHA DE CONTROLE E ENTREGA DE EQUIPAMENTO', doc.internal.pageSize.width / 2, 20, { align: 'center' }); // Subtítulo centralizado
    doc.setFontSize(12); // Define novamente o tamanho da fonte
    doc.setFont('helvetica', 'normal'); // Define a fonte como normal

    doc.setDrawColor(0, 0, 0); // Define a cor da borda
    doc.setLineWidth(0.25); // Largura da linha da borda
    doc.rect(14, 30, 270, 6); // Desenha o retângulo da linha 1

    // Linha 1: NOME, N° DE REGISTRO e DATA DE ADMISSÃO
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOME:', 15, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.nome || ''}`, 30, 35); // Exibe o nome do funcionário
    doc.setFont('helvetica', 'bold');
    doc.text('N° DE REGISTRO:', 107, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.matricula || ''}`, 145, 35); // Exibe o número de matrícula
    doc.setFont('helvetica', 'bold');
    doc.text('DATA DE ADMISSÃO:', 203, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedItem.value.data_admissao ? new Date(selectedItem.value.data_admissao).toLocaleDateString('pt-BR') : ''}`, 248, 35); // Exibe a data de admissão

    // Linha 2
    doc.rect(14, 36, 270, 6); // O retângulo da linha 2

    // Texto Linha 2: FUNÇÃO e SETOR
    doc.setFont('helvetica', 'bold');
    doc.text('FUNÇÃO:', 15, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.id_funcao || ''}`, 36, 41); // Exibe a função
    doc.setFont('helvetica', 'bold');
    doc.text('SETOR:', 107, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(` ${selectedItem.value.id_setor || ''}`, 123, 41); // Exibe o setor

    doc.setFontSize(11); // Define o tamanho da fonte
    const text = `${textoFicha}`; // Obtém o texto da ficha

    doc.text(text, 14, 55, { maxWidth: 270 }); // Exibe o texto da ficha

    // Definição da tabela
    const tableColumn = ['NOME DO ITEM', 'DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];

    // Preenche as linhas da tabela com os dados das retiradas
    const tableRows = retiradas.value.map((item) => {
        try {
            const parsedDate = parse(item.Dia, 'dd/MM/yyyy - HH:mm', new Date()); // Faz o parse da data
            const formattedDate = format(parsedDate, 'dd/MM/yyyy - HH:mm'); // Formata a data
            return [item.ProdutoNome || '', formattedDate, item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || '']; // Retorna os dados da linha
        } catch (error) {
            console.error('Error parsing date:', error); // Caso ocorra erro ao parsear a data
            return [item.ProdutoNome || '', 'Data inválida', item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || '']; // Retorna dados padrão com "Data inválida"
        }
    });

    // Gera a tabela no PDF
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
    doc.text('Data:', 30, doc.autoTable.previous.finalY + 30); // Exibe o campo de data
    doc.text('_______/_______/_______', 40, doc.autoTable.previous.finalY + 30); // Linha para o campo de data

    doc.setFontSize(12);
    doc.text('______________________________________', 180, doc.autoTable.previous.finalY + 30); // Linha para assinatura
    doc.text('Assinatura do funcionário', 200, doc.autoTable.previous.finalY + 50); // Texto de assinatura
    doc.save(`LAB220 - ${selectedItem.value.nome || 'Funcionario'}.pdf`); // Salva o PDF com o nome do funcionário
};

/**
 * Função para obter o texto da ficha de controle.
 * @returns {Promise<string>} - Retorna o texto da ficha ou um valor padrão caso ocorra erro.
 */
const TextoFicha = async () => {
    const data = {
        id_cliente: store.userIdCliente // ID do cliente do usuário autenticado
    };
    try {
        const response = await axios.post('fichasretiradas/textoFicha', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Cabeçalho de autorização com o token do usuário
            }
        });
        return (
            response.data[0]?.TextoFicha ||
            '1- Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente ao da praça.\n2- Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.\n3- Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo, ao setor competente.\n4- Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.' // Texto padrão caso não exista resposta
        );
    } catch (error) {
        console.error('Erro ao buscar texto da ficha:', error); // Se ocorrer erro ao buscar o texto da ficha, exibe no console
        return; // Retorna undefined caso ocorra erro
    }
};

/**
 * Função para fechar todos os dropdowns abertos.
 */
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o dropdown1 se estiver visível
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o dropdown2 se estiver visível
};

/**
 * Função para tratar a abertura do Datepicker.
 */
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha os dropdowns ao abrir o Datepicker
};

// Função executada quando o componente é montado
onMounted(() => {
    fetchIdPlanta(); // Busca as opções de plantas
    fetchFuncionarios(); // Busca a lista de funcionários
});

</script>

<template>
    <!-- Card principal que contém o formulário de filtros e informações -->
    <div class="card">
        <div class="form">
            <!-- Grid do formulário, com margens e espaçamento definidos -->
            <div class="grid mt-3 mx-1 px-1">
                <!-- Título da página "Fichas de Retiradas" -->
                <h5 class="my-4 text-2xl">Fichas de Retiradas</h5>
                
                <!-- Exibe os filtros de pesquisa, se "show" for verdadeiro -->
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    
                    <!-- Campo de seleção para a Planta -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="planta">Planta:</label>
                        <!-- Componente Dropdown para selecionar a planta, com lista de opções fornecida por 'plantas' -->
                        <Dropdown 
                            class="drop" 
                            v-model="relatorio.id_planta" 
                            :options="plantas" 
                            optionLabel="label" 
                            optionValue="value" 
                            placeholder="Todos" 
                            ref="dropdown1" 
                            @change="filterFuncionarios" />
                    </div>
                    <!-- Campo de seleção para Funcionário -->
                    <div class="field xl:col-3 lg:col-6 md:col-6 sm:col-6">
                        <label for="perfil">Funcionário:</label>
                        <!-- Componente Dropdown para selecionar o funcionário, com lista de opções fornecida por 'ListaFuncionarios' -->
                        <Dropdown 
                            class="drop" 
                            v-model="selectedItem" 
                            :options="ListaFuncionarios" 
                            optionLabel="label" 
                            optionValue="value" 
                            ref="dropdown2" 
                            placeholder="Todos" />
                    </div>
                    
                    <!-- Campo de seleção para Data Inicial -->
                    <div class="field datepicker xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <label for="perfil">Data Inicial:</label>
                        <!-- Componente VueDatePicker para selecionar a data inicial, com o formato de data "dd/MM/yyyy" -->
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
                    <!-- Campo de seleção para Data Final -->
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
                    <!-- Botão para gerar a ficha -->
                    <div class="field xl:col-2 lg:col-4 md:col-4 sm:col-6">
                        <Button 
                            class="filtrar" 
                            type="button" 
                            label="Gerar Ficha" 
                            icon="pi pi-download" 
                            severity="info" 
                            @click="generatePDF" 
                        />
                    </div>
                </div>

                <!-- Exibe um Card com informações do funcionário se "show" for falso -->
                <Card v-if="!show">
                    <!-- O título do Card é o nome do funcionário -->
                    <template #title>{{ selectedItem.dm }}</template>
                    <template #content>
                        <!-- Botão para voltar ao filtro -->
                        <Button 
                            type="button" 
                            label="Voltar" 
                            icon="pi pi-arrow-left" 
                            severity="info" 
                            @click="voltar" 
                        />
                    </template>
                </Card>
            </div>
        </div>
    </div>
    <!-- Exibe um spinner de carregamento se "loading" for verdadeiro -->
    <LoadingSpinner v-if="loading" />

    <!-- Diálogo que exibe mensagens de alerta ou erro -->
    <Dialog 
        header="" 
        :visible.sync="showDialog" 
        style="width: 50vw" 
        :modal="true"  
        :closable="false"> 
        
        <p>{{ dialogMessage }}</p> 
        
        <!-- Rodapé do diálogo com um botão OK -->
        <template #footer>
            <Button 
                label="OK" 
                icon="pi pi-check" 
                @click="showDialog = false"  
            />
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
