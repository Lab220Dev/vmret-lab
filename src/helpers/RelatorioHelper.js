import { toISODate } from '@/helpers/HelperUtils'; // Supondo que essa função já exista
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import relatorioService from '@/Services/relatorioService.js';
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF para gerar PDFs
import autoTable from 'jspdf-autotable';
import html2canvas from "html2canvas";
import { parse } from 'date-fns';
import { formatDateToString } from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import i18n from '@/i18n'; // Importa a função de tradução do vue-i18n
import clientesService from '../Services/ClientesService';
import funcionarioService from '../Services/funcionarioService';
const store = useAuthStore();

/**
 * Prepara os dados do relatório com base no tipo de relatório fornecido e nos valores do relatório.
 * A função retorna um objeto com as informações necessárias para o tipo de relatório específico.
 *
 * @param {string} tipoRelatorio - O tipo do relatório para o qual os dados estão sendo preparados (ex.: 'Devoluções', 'Estoque').
 * @param {Object} relatorio - O objeto contendo os valores específicos para o relatório.
 * @param {Object} relatorio.value - O objeto interno que contém os valores do relatório.
 * @param {string} relatorio.value.id_dm - O ID do documento de movimentação (DM), quando aplicável.
 * @param {string} relatorio.value.id_funcionario - O ID do funcionário, quando aplicável.
 * @param {string} relatorio.value.id_planta - O ID da planta, quando aplicável.
 * @param {string} relatorio.value.id_centro_custo - O ID do centro de custo, quando aplicável.
 * @param {string} relatorio.value.id_setor - O ID do setor, quando aplicável.
 * @param {string} relatorio.value.data_inicio - A data de início para o filtro, quando aplicável.
 * @param {string} relatorio.value.data_final - A data final para o filtro, quando aplicável.
 * @param {string} relatorio.value.id_operador - O ID do operador, quando aplicável.
 * @param {string} relatorio.value.dia - O dia do relatório, quando aplicável.
 *
 * @returns {Object} O objeto com os dados preparados para o relatório, de acordo com o tipo.
 */
export const prepararDadosRelatorio = (tipoRelatorio, relatorio) => {
    // Define a base data com o ID do cliente a partir do store.
    const baseData = {
        id_cliente: store.userIdCliente
    };

    // Verifica o tipo do relatório e prepara os dados conforme o tipo específico.
    switch (tipoRelatorio) {
        case 'Devoluções':
            // Retorna os dados preparados para o relatório de Devoluções.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_dm: relatorio.value.id_dm || undefined, // Adiciona o ID do DM, ou undefined se não existir.
                id_funcionario: relatorio.value.id_funcionario || undefined, // Adiciona o ID do funcionário, ou undefined se não existir.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        case 'Estoque':
            // Retorna os dados preparados para o relatório de Estoque.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_usuario: store.userId, // Adiciona o ID do usuário a partir do store.
                id_dm: relatorio.value.id_dm // Adiciona o ID do DM.
            };
        case 'Retiradas Realizadas':
            // Retorna os dados preparados para o relatório de Retiradas Realizadas.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_usuario: store.userId, // Adiciona o ID do usuário a partir do store.
                id_dm: relatorio.value.id_dm === null ? undefined : relatorio.value.id_dm, // Adiciona o ID do DM ou undefined se for nulo.
                id_planta: relatorio.value.id_planta === null ? undefined : relatorio.value.id_planta, // Adiciona o ID da planta ou undefined se for nulo.
                id_centro_custo: relatorio.value.id_centro_custo === null ? undefined : relatorio.value.id_centro_custo, // Adiciona o ID do centro de custo ou undefined se for nulo.
                id_setor: relatorio.value.id_setor === null ? undefined : relatorio.value.id_setor, // Adiciona o ID do setor ou undefined se for nulo.
                id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // Adiciona o ID do funcionário ou undefined se for nulo.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        case 'Itens mais Retirados':
            // Retorna os dados preparados para o relatório de Itens mais Retirados.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_usuario: store.userId, // Adiciona o ID do usuário a partir do store.
                id_dm: relatorio.value.id_dm || undefined, // Adiciona o ID do DM, ou undefined se não existir.
                id_planta: relatorio.value.id_planta || undefined, // Adiciona o ID da planta, ou undefined se não existir.
                id_centro_custo: relatorio.value.id_centro_custo || undefined, // Adiciona o ID do centro de custo, ou undefined se não existir.
                id_setor: relatorio.value.id_setor || undefined, // Adiciona o ID do setor, ou undefined se não existir.
                id_funcionario: relatorio.value.id_funcionario || undefined, // Adiciona o ID do funcionário, ou undefined se não existir.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        case 'Histórico Abastecimento':
            // Retorna os dados preparados para o relatório de Histórico de Abastecimento.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_usuario: store.userId, // Adiciona o ID do usuário a partir do store.
                id_dm: relatorio.value.dm || undefined, // Adiciona o ID do DM, ou undefined se não existir.
                id_funcionario: relatorio.value.id_funcionario || undefined, // Adiciona o ID do funcionário, ou undefined se não existir.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final), // Converte a data final para o formato ISO.
                id_operador: relatorio.value.id_operador // Adiciona o ID do operador.
            };
        case 'StatusDM':
            // Retorna os dados preparados para o relatório de Status de DM.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_usuario: store.userId, // Adiciona o ID do usuário a partir do store.
                id_dm: relatorio.value.id_dm, // Adiciona o ID do DM.
                dia: relatorio.value.dia.toISOString() // Converte o dia para o formato ISO.
            };
        case 'Logs':
            // Retorna os dados preparados para o relatório de Logs.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_dm: relatorio.value.dm, // Adiciona o ID do DM.
                id_usuario: relatorio.value.id_usuario, // Adiciona o ID do usuário.
                id_funcionario: relatorio.value.id_funcionario, // Adiciona o ID do funcionário.
                operacao: relatorio.value.id_operacao, // Adiciona o ID da operação.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        case 'LogsDesk':
            // Retorna os dados preparados para o relatório de Logs.
            return {
                id_cliente: relatorio.value.dm.id_cliente,
                id_dm: relatorio.value.dm.value, // Adiciona o ID do DM.
                id_usuario: relatorio.value.id_usuario, // Adiciona o ID do usuário.
                id_funcionario: relatorio.value.id_funcionario, // Adiciona o ID do funcionário.
                operacao: relatorio.value.id_operacao, // Adiciona o ID da operação.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        default:
            // Se o tipo do relatório não for reconhecido, retorna apenas a base de dados com o ID do cliente.
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
        matricula: funcionario.matricula // ID do centro de custo
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
export async function GerarPdfRetiradapt(funcionarioSelecionado, relatorio) {
    try {
        if (!funcionarioSelecionado?.value || Object.keys(funcionarioSelecionado.value).length === 0) {
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
        // **Verifica se há dados para exibir na tabela**
        if (!retiradas.data?.data || retiradas.data.data.length === 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Nenhum dado encontrado para os critérios fornecidos.', doc.internal.pageSize.width / 2, 90, { align: 'center' });
        } else {
            // Definição da tabela
            const tableColumn = ['NOME DO ITEM', 'DT RETIRADA', 'QUANT', 'UNID', 'DESCRIÇÃO DO EQUIPAMENTO', 'N° DO C.A', 'AUTENTICAÇÃO'];
            const tableRows = retiradas.data.map((item) => {
                try {
                    const parsedDate = parse(item.Dia, 'dd/MM/yyyy - HH:mm', new Date());
                    const formattedDate = formatDateToString(parsedDate, 'dd/MM/yyyy - HH:mm');
                    return [item.ProdutoNome || '', formattedDate, item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || ''];
                } catch (error) {
                    console.error('Erro ao formatar data:', error);
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
        }
        const finalY = doc.autoTable?.previous?.finalY ? doc.autoTable.previous.finalY + 30 : 120;
        doc.setFontSize(12);
        doc.text('Data:', 30, finalY ); // Exibe o campo de data
        doc.text('_______/_______/_______', 40, finalY); // Linha para o campo de data

        doc.setFontSize(12);
        doc.text('______________________________________', 180, finalY);
        doc.text('Assinatura do funcionário', 200, finalY+10);
        doc.save(`LAB220 - ${funcionarioSelecionado.value.label || 'Funcionario'}.pdf`);
    } catch (error) {
        throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
}
export async function GerarPdfRetiradaEs(funcionarioSelecionado, relatorio) {
    try {
        if (!funcionarioSelecionado.value || Object.keys(funcionarioSelecionado.value).length === 0){
            throw new Error('Empleado no seleccionado');
        }

        const cabecalhoHTML = await relatorioService.Cabecalho(); // Obtém o HTML dinamicamente
        const dadosCliente = await clientesService.fetchDadosCliente(store.userIdCliente); // Obtém os dados do cliente
        const dadosfuncionario = await funcionarioService.fetchdadosfuncionario(funcionarioSelecionado.value.value); // Obtém os dados do funcionário
        const div = document.createElement("div");
        div.innerHTML = cabecalhoHTML;
        document.body.appendChild(div);
        div.querySelector("#razon-social").textContent = dadosCliente.nome || "No informado";
        div.querySelector("#cuit").textContent = dadosCliente.cpfcnpj || "No informado";
        div.querySelector("#direccion").textContent = dadosCliente.endereco || "No informado";
        div.querySelector("#cp").textContent = dadosCliente.cep || "No informado";
        div.querySelector("#localidad").textContent = dadosCliente.cidade || "No informado";
        div.querySelector("#provincia").textContent = dadosCliente.estado || "No informado";
        div.querySelector("#dni").textContent = dadosfuncionario.cpf || "No informado";
        div.querySelector("#nombre-trabajador").textContent = funcionarioSelecionado.value.label || "No informado";
        div.querySelector("#puesto").textContent = dadosfuncionario.funcao_nome || "No informado";
        div.querySelector("#elementos").textContent = dadosfuncionario.elementos || "No informado";

        // Converter HTML do cabeçalho em imagem
        const canvas = await html2canvas(div, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        document.body.removeChild(div); // Remove o elemento do DOM

        // Criar o PDF
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.width || 210; // Largura total da página
        const margin = 10;
        const imgWidth = pageWidth - 2 * margin; // Mantém a largura da imagem dentro da página
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantém proporção

        pdf.addImage(imgData, "PNG", margin, 10, imgWidth, imgHeight);

        // Buscar dados da ficha e retiradas
        const retiradas = await relatorioService.fichasRetiradas(relatorio);

        // Criar a tabela de dados no PDF
        pdf.autoTable({
            startY: imgHeight + 10,
            tableWidth: imgWidth, 
            head: [[
                "NOME DO ITEM", "DT RETIRADA", "QUANT", "UNID",
                "DESCRIÇÃO DO EQUIPAMENTO", "N° DO C.A", "AUTENTICAÇÃO"
            ]],
            body: retiradas.data.map(item => [
                item.ProdutoNome || '',
                item.Dia || '',
                item.Quantidade || '',
                item.unidade_medida || '',
                item.ProdutoDescricao || '',
                item.ProdutoSKU || '',
                item.Forma_Autenticacao || ''
            ]),
            theme: "grid",
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 50 },
                5: { cellWidth: 25 },
                6: { cellWidth: 30 }
            }
        });

        // Salvar o PDF corretamente
        pdf.save(`Entrega_EPI_${funcionarioSelecionado.value.label || 'Empleado'}.pdf`);

    } catch (error) {
        throw new Error(`Error al generar PDF: ${error.message}`);
    }
}
export async function GerarPdfRetirada(funcionarioSelecionado, relatorio) {
    const linguaSelecionada = i18n.global.locale.value;
    if (linguaSelecionada === 'es') {
        await GerarPdfRetiradaEs(funcionarioSelecionado, relatorio);
    } else {
        await GerarPdfRetiradapt(funcionarioSelecionado, relatorio);
    }
}
