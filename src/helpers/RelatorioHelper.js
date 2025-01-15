import { toISODate } from '@/helpers/HelperUtils'; // Supondo que essa função já exista
import { useAuthStore } from '@/store/authStore.js';// Importa o store de autenticação para acessar informações do usuário autenticado.
import relatorioService from '@/Services/relatorioService.js';
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF para gerar PDFs
import autoTable from 'jspdf-autotable';
import { parse } from 'date-fns';
import { formatDateToString } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico

const store = useAuthStore();
/**
 * Prepara os dados para relatórios.
 * @param {string} tipoRelatorio - O tipo do relatório.
 * @param {Object} relatorio - Os valores do formulário.
 * @param {Object} store - O estado global (usuário, cliente, etc.).
 * @returns {Object} - O objeto de dados preparado.
 */
export const prepararDadosRelatorio = (tipoRelatorio, relatorio) => {
    const baseData = {
        id_cliente: store.userIdCliente
    };
    switch (tipoRelatorio) {
        case 'Devoluções':
            return {
                ...baseData,
                id_dm: relatorio.value.id_dm || undefined,
                id_funcionario: relatorio.value.id_funcionario || undefined,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final)
            };
        case 'Estoque':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm
            };
        case 'Retiradas Realizadas':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm,
                id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta,
                id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo,
                id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor,
                id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final)
            };
        case 'Itens mais Retirados':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm || undefined,
                id_planta: relatorio.value.id_planta || undefined,
                id_centro_custo: relatorio.value.id_centro_custo || undefined,
                id_setor: relatorio.value.id_setor || undefined,
                id_funcionario: relatorio.value.id_funcionario || undefined,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final)
            };
        case 'Histórico Abastecimento':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.dm || undefined,
                id_funcionario: relatorio.value.id_funcionario || undefined,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final),
                id_operador: relatorio.value.id_operador
            };
        case 'StatusDM':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm,
                dia: relatorio.value.dia.toISOString()
            };
        case 'Logs':
            return {
                ...baseData,
                id_dm: relatorio.value.dm,
                id_usuario: relatorio.value.id_usuario,
                id_funcionario: relatorio.value.id_funcionario,
                operacao: relatorio.value.id_operacao,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final)
            };
        default:
            return baseData;
    }
};
/**
 * Adiciona a opção 'Todos' e organiza os dados de funcionários.
 * @param {Array} funcionarios - Lista de funcionários retornada pela API.
 * @returns {Array} - Lista formatada com a opção 'Todos' e os funcionários organizados.
 */
export function organizarFuncionarios(funcionarios) {
    // Mapeia os dados e adiciona a opção 'Todos' no início
    const listaFormatada = funcionarios.map((funcionario) => ({
        label: funcionario.nome, // Nome do funcionário
        value: funcionario.id_funcionario, // ID do funcionário
        id_setor: funcionario.id_setor, // ID do setor
        id_funcao: funcionario.id_funcao, // ID da função
        id_planta: funcionario.id_planta, // ID da planta
        id_centro_custo: funcionario.id_centro_custo, // ID do centro de custo
        data_admissao: funcionario.data_admissao, // ID do centro de custo
        matricula: funcionario.matricula, // ID do centro de custo
    }));

    // Adiciona a opção 'Todos' no início da lista
    return [{ label: 'Todos', value: null }, ...listaFormatada];
}

/**
 * Generates a PDF report for equipment withdrawal.
 *
 * @param {Object} funcionarioSelecionado - The selected employee object.
 * @param {Object} funcionarioSelecionado.value - The value object containing employee details.
 * @param {string} funcionarioSelecionado.value.label - The name of the employee.
 * @param {string} funcionarioSelecionado.value.matricula - The registration number of the employee.
 * @param {string} funcionarioSelecionado.value.data_admissao - The admission date of the employee.
 * @param {string} funcionarioSelecionado.value.id_funcao - The function ID of the employee.
 * @param {string} funcionarioSelecionado.value.id_setor - The sector ID of the employee.
 * @param {Object} relatorio - The report object containing withdrawal details.
 * @throws {Error} Throws an error if the employee is not selected or if there is an error generating the PDF.
 */
export async function GerarPdfRetirada(funcionarioSelecionado, relatorio) {
    try {
        if (!funcionarioSelecionado) {
            throw new Error('Funcionário não selecionado');
        }
        const textoFicha = await relatorioService.TextoFicha();
        const retiradas = await relatorioService.fichasRetiradas(relatorio);

        const doc = new jsPDF('l');
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
        doc.text(`${funcionarioSelecionado.value.label || ''}`, 30, 35); // Exibe o nome do funcionário
        doc.setFont('helvetica', 'bold');
        doc.text('N° DE REGISTRO:', 107, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(`${funcionarioSelecionado.value.matricula || ''}`, 145, 35); // Exibe o número de matrícula
        doc.setFont('helvetica', 'bold');
        doc.text('DATA DE ADMISSÃO:', 203, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(`${funcionarioSelecionado.value.data_admissao ? new Date(funcionarioSelecionado.value.data_admissao).toLocaleDateString('pt-BR') : ''}`, 248, 35); // Exibe a data de admissão

        // Linha 2
        doc.rect(14, 36, 270, 6); // O retângulo da linha 2

        // Texto Linha 2: FUNÇÃO e SETOR
        doc.setFont('helvetica', 'bold');
        doc.text('FUNÇÃO:', 15, 41);
        doc.setFont('helvetica', 'normal');
        doc.text(` ${funcionarioSelecionado.value.id_funcao || ''}`, 36, 41); // Exibe a função
        doc.setFont('helvetica', 'bold');
        doc.text('SETOR:', 107, 41);
        doc.setFont('helvetica', 'normal');
        doc.text(` ${funcionarioSelecionado.value.id_setor || ''}`, 123, 41); // Exibe o setor

        doc.setFontSize(11); // Define o tamanho da fonte
        const text = `${textoFicha}`; // Obtém o texto da ficha

        doc.text(text, 14, 55, { maxWidth: 270 }); // Exibe o texto da ficha

        // Definição da tabela
        const tableColumn = ['NOME DO ITEM', 'DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];
        
        const tableRows = retiradas.data.map((item) => {
            try {
                const parsedDate = parse(item.Dia, 'dd/MM/yyyy - HH:mm', new Date()); // Faz o parse da data
                const formattedDate = formatDateToString(parsedDate, 'dd/MM/yyyy - HH:mm'); // Formata a data
                return [item.ProdutoNome || '', formattedDate, item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || '']; // Retorna os dados da linha
            } catch (error) {
                console.error('Error parsing date:', error); // Caso ocorra erro ao parsear a data
                return [item.ProdutoNome || '', 'Data inválida', item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || '']; // Retorna dados padrão com "Data inválida"
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
        doc.text('Data:', 30, doc.autoTable.previous.finalY + 30); // Exibe o campo de data
        doc.text('_______/_______/_______', 40, doc.autoTable.previous.finalY + 30); // Linha para o campo de data
    
        doc.setFontSize(12);
        doc.text('______________________________________', 180, doc.autoTable.previous.finalY + 30); 
        doc.text('Assinatura do funcionário', 200, doc.autoTable.previous.finalY + 50); 
        doc.save(`LAB220 - ${funcionarioSelecionado.value.label || 'Funcionario'}.pdf`); 
    } catch (error) {
        throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
}
