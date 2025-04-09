import { toISODate, formatStringDate } from '@/helpers/HelperUtils'; // Supondo que essa função já exista
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para realizar operações relacionadas a relatórios.
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF para gerar PDFs
import autoTable from 'jspdf-autotable'; // Importa a biblioteca autoTable do jsPDF para gerar tabelas em PDFs.
import html2canvas from 'html2canvas'; // Importa a biblioteca html2canvas para converter HTML em imagens.
import i18n from '@/i18n'; // Importa a função de tradução do vue-i18n
import clientesService from '../Services/ClientesService'; // Importa o serviço de clientes para realizar operações relacionadas a clientes.
import funcionarioService from '../Services/funcionarioService'; // Importa o serviço de funcionários para realizar operações relacionadas a funcionários.

// const jsdom = require("jsdom"); 

const { t } = i18n.global; // Obtém a função de tradução do vue-i18n
const store = useAuthStore(); // Obtém o store de autenticação para acessar informações do usuário autenticado.

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
        case 'Fichas Retiradas':
            // Retorna os dados preparados para o relatório de Logs.
            return {
                ...baseData, // Inclui a base de dados com o ID do cliente.
                id_planta: relatorio.value.id_planta || undefined, // Adiciona o ID da planta, ou undefined se não existir.
                id_funcionario: relatorio.value.id_funcionario, // Adiciona o ID do funcionário.
                data_inicio: toISODate(relatorio.value.data_inicio), // Converte a data de início para o formato ISO.
                data_final: toISODate(relatorio.value.data_final) // Converte a data final para o formato ISO.
            };
        default:
            // Se o tipo do relatório não for reconhecido, retorna apenas a base de dados com o ID do cliente.
            return baseData;
    }
};

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

export async function GerarPdfRetiradapt(funcionarioSelecionado, relatorio) {
    try {
        // Verifica se o funcionário selecionado está definido e não está vazio.
        if (!funcionarioSelecionado?.value || Object.keys(funcionarioSelecionado.value).length === 0) {
            throw new Error('Funcionário não selecionado'); // Lança um erro se o funcionário não estiver selecionado.
        }
        const textoFicha = await relatorioService.TextoFicha(); // Obtém o texto da ficha do serviço de relatórios.
        const retiradas = await relatorioService.fichasRetiradas(relatorio); // Obtém as retiradas do serviço de relatórios com base no relatório fornecido.
        const doc = new jsPDF('l'); // Cria um novo documento PDF em modo paisagem.
        doc.setFillColor(255, 255, 255); // Define a cor de fundo do documento como branco
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Desenha o retângulo de fundo
        doc.setTextColor(0, 0, 0); // Define a cor do texto como preto
        doc.setDrawColor(0, 0, 0); // Define a cor das linhas do PDF

        const addFooter = () => {
            doc.setFontSize(12); // Define o tamanho da fonte
            doc.setFont('helvetica', 'bold'); // Define a fonte como Helvetica em negrito
            doc.text(`LAB220 - ${t('dm_management_system')}`, 14, 205); // Título do documento
        };

        addFooter(); // Adiciona o rodapé ao PDF

        doc.setFontSize(14); // Altera o tamanho da fonte
        doc.text(`${t('EQUIPMENT_DELIVERY_FORM_DOC')}`, doc.internal.pageSize.width / 2, 20, { align: 'center' }); // Subtítulo centralizado
        doc.setFontSize(12); // Define novamente o tamanho da fonte
        doc.setFont('helvetica', 'normal'); // Define a fonte como normal

        doc.setDrawColor(0, 0, 0); // Define a cor da borda
        doc.setLineWidth(0.25); // Largura da linha da borda
        doc.rect(14, 30, 270, 6); // Desenha o retângulo da linha 1

        // Linha 1: NOME, N° DE REGISTRO e DATA DE ADMISSÃO
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('NAME_DOC')}:`, 15, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(`${funcionarioSelecionado.value.label || ''}`, 30, 35); // Exibe o nome do funcionário
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('REGISTRATION_NUMBER_DOC')}:`, 107, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(`${funcionarioSelecionado.value.matricula || ''}`, 145, 35); // Exibe o número de matrícula
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('ADMISSION_DATE_DOC')}:`, 203, 35);
        doc.setFont('helvetica', 'normal');
        doc.text(`${funcionarioSelecionado.value.data_admissao ? new Date(funcionarioSelecionado.value.data_admissao).toLocaleDateString('pt-BR') : ''}`, 248, 35); // Exibe a data de admissão

        // Linha 2
        doc.rect(14, 36, 270, 6); // O retângulo da linha 2

        // Texto Linha 2: FUNÇÃO e SETOR
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('FUNCTION_DOC')}:`, 15, 41);
        doc.setFont('helvetica', 'normal');
        doc.text(` ${funcionarioSelecionado.value.id_funcao || ''}`, 37, 41); // Exibe a função
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('SECTOR_DOC')}:`, 107, 41);
        doc.setFont('helvetica', 'normal');
        doc.text(` ${funcionarioSelecionado.value.id_setor || ''}`, 126, 41); // Exibe o setor

        doc.setFontSize(11); // Define o tamanho da fonte
        const text = `${textoFicha}`; // Obtém o texto da ficha

        doc.text(text, 14, 55, { maxWidth: 270 }); // Exibe o texto da ficha

        // Verifica se a resposta das retiradas não é um array ou se está vazia.
        if (!Array.isArray(retiradas.data) || retiradas.data.length === 0) {
            doc.setFontSize(12); // Define o tamanho da fonte para 12.
            doc.setFont('helvetica', 'bold'); // Define a fonte como Helvetica em negrito.
            doc.text(`${t('no_data_doc')}`, doc.internal.pageSize.width / 2, 90, { align: 'center' }); // Adiciona um texto centralizado informando que nenhum dado foi encontrado.
        } else {
            // Definição da tabela
            const tableColumn = [`${t('ITEM_NAME_DOC')}`, `${t('WITHDRAWAL_DATE_DOC')}`, `${t('QUANT_DOC')}`, `${t('UNIT_DOC')}`, `${t('DESCRIPTION_DOC')}`, `${t('CA_NUMBER_DOC')}`, `${t('AUTHENTICATION_DOC')}`];
            const tableRows = retiradas.data.map((item) => {
                // Mapeia os dados das retiradas para as linhas da tabela.
                try {
                    if (i18n.global.locale.value === 'en') {
                        // Se a língua selecionada for inglês, traduz alguns campos.
                        return [
                            item.ProdutoNome || '',
                            formatStringDate(item.Dia) || '',
                            item.Quantidade || '',
                            item.unidade_medida || '',
                            item.ProdutoDescricao || '',
                            item.ProdutoSKU || '',
                            item.Forma_Autenticacao === 'Senha' ? 'Password' : item.Forma_Autenticacao || ''
                        ];
                    } else {
                        // Caso contrário, retorna os dados no idioma padrão.
                        return [item.ProdutoNome || '', formatStringDate(item.Dia) || '', item.Quantidade || '', item.unidade_medida || '', item.ProdutoDescricao || '', item.ProdutoSKU || '', item.Forma_Autenticacao || ''];
                    }
                } catch (error) {
                    // Loga o erro no console.
                    console.error('Erro:', error);
                    return [
                        // Retorna os dados mesmo em caso de erro.
                        item.ProdutoNome || '',
                        formatStringDate(item.Dia) || '',
                        item.Quantidade || '',
                        item.unidade_medida || '',
                        item.ProdutoDescricao || '',
                        item.ProdutoSKU || '',
                        item.Forma_Autenticacao || ''
                    ];
                }
            });

            // Configura a tabela no documento PDF usando a biblioteca autoTable.
            autoTable(doc, {
                head: [tableColumn], // Define as colunas do cabeçalho da tabela.
                body: tableRows, // Define as linhas do corpo da tabela.
                width: 270, // Define a largura da tabela.
                startY: 85, // Define a posição Y inicial da tabela.
                theme: 'grid', // Define o tema da tabela como 'grid'.
                styles: {
                    fillColor: [255, 255, 255], // Define a cor de preenchimento das células como branco.
                    textColor: [0, 0, 0], // Define a cor do texto como preto.
                    lineColor: [0, 0, 0], // Define a cor das linhas como preto.
                    lineWidth: 0.25, // Define a largura das linhas.
                    fontSize: 10 // Define o tamanho da fonte.
                },
                headStyles: {
                    fillColor: [220, 220, 220], // Define a cor de preenchimento do cabeçalho como cinza claro.
                    textColor: [0, 0, 0], // Define a cor do texto do cabeçalho como preto.
                    fontStyle: 'bold', // Define o estilo da fonte do cabeçalho como negrito.
                    lineWidth: 0.25, // Define a largura das linhas do cabeçalho.
                    halign: 'center' // Alinha o texto do cabeçalho ao centro.
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245] // Define a cor de preenchimento das linhas alternadas como cinza muito claro.
                },
                columnStyles: {
                    0: { cellWidth: 50, halign: 'center' }, // Define a largura e o alinhamento da primeira coluna.
                    1: { cellWidth: 40 }, // Define a largura da segunda coluna.
                    2: { cellWidth: 20, halign: 'center' }, // Define a largura e o alinhamento da terceira coluna.
                    3: { cellWidth: 20, halign: 'center' }, // Define a largura e o alinhamento da quarta coluna.
                    4: { cellWidth: 70 }, // Define a largura da quinta coluna.
                    5: { cellWidth: 30, halign: 'center' }, // Define a largura e o alinhamento da sexta coluna.
                    6: { cellWidth: 40, halign: 'center' } // Define a largura e o alinhamento da sétima coluna.
                },
                didDrawPage: (data) => {
                    // Adiciona o cabeçalho em cada página
                    addFooter();

                    // Adiciona o número da página no rodapé
                    const pageCount = doc.internal.getNumberOfPages(); // Obtém o número total de páginas
                    const pageSize = doc.internal.pageSize; // Obtém o tamanho da página
                    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight(); // Obtém a altura da página
                    doc.setFontSize(10); // Define o tamanho da fonte para 10
                    // Adiciona o número da página no formato "X de Y" no rodapé
                    doc.text(`${data.pageNumber} de ${pageCount}`, 280, pageHeight - 200);
                }
            });
        }
        const finalY = doc.autoTable?.previous?.finalY ? doc.autoTable.previous.finalY + 30 : 120; // Posição Y final da tabela
        doc.setFontSize(12);
        doc.text(`${t('date')}:`, 30, finalY); // Exibe o campo de data
        doc.text('_______/_______/_______', 40, finalY); // Linha para o campo de data

        doc.setFontSize(12);
        doc.text('______________________________________', 180, finalY);
        doc.text(`${t('employee_signature')}`, 200, finalY + 10);
        doc.save(`LAB220 - ${funcionarioSelecionado.value.label || t('employee')}.pdf`);
    } catch (error) {
        throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
}

// Exporta a função GerarPdfRetiradaEs, que gera um PDF de retirada em espanhol.
export async function GerarPdfRetiradaEs(funcionarioSelecionado, relatorio) {
    try {
        // Verifica se o funcionário selecionado está definido e não está vazio.
        if (!funcionarioSelecionado.value || Object.keys(funcionarioSelecionado.value).length === 0) {
            throw new Error('Empleado no seleccionado'); // Lança um erro se o funcionário não estiver selecionado.
        }

        const cabecalhoHTML = await relatorioService.Cabecalho(); // Obtém o HTML dinamicamente
        const dadosCliente = await clientesService.fetchDadosCliente(store.userIdCliente); // Obtém os dados do cliente
        const dadosfuncionario = await funcionarioService.fetchdadosfuncionario(funcionarioSelecionado.value.value); // Obtém os dados do funcionário
        const div = document.createElement('div');
        // Define o conteúdo HTML do cabeçalho.
        div.innerHTML = cabecalhoHTML;

        // Adiciona o elemento div ao corpo do documento.
        document.body.appendChild(div);

        // Preenche os campos do cabeçalho com os dados do cliente e do funcionário.
        div.querySelector('#razon-social').textContent = dadosCliente.nome || 'No informado'; // Nome do cliente.
        div.querySelector('#cuit').textContent = dadosCliente.cpfcnpj || 'No informado'; // CPF/CNPJ do cliente.
        div.querySelector('#direccion').textContent = dadosCliente.endereco || 'No informado'; // Endereço do cliente.
        div.querySelector('#cp').textContent = dadosCliente.cep || 'No informado'; // CEP do cliente.
        div.querySelector('#localidad').textContent = dadosCliente.cidade || 'No informado'; // Cidade do cliente.
        div.querySelector('#provincia').textContent = dadosCliente.estado || 'No informado'; // Estado do cliente.
        div.querySelector('#dni').textContent = dadosfuncionario.cpf || 'No informado'; // CPF do funcionário.
        div.querySelector('#nombre-trabajador').textContent = funcionarioSelecionado.value.label || 'No informado'; // Nome do funcionário.
        div.querySelector('#puesto').textContent = dadosfuncionario.funcao_nome || 'No informado'; // Função do funcionário.
        div.querySelector('#elementos').textContent = dadosfuncionario.elementos || 'No informado'; // Elementos do funcionário.

        // Converter HTML do cabeçalho em imagem
        await new Promise(resolve => setTimeout(resolve, 300)); // Espera o DOM aplicar os estilos
const canvas = await html2canvas(div, { scale: 2 }); // Converte o conteúdo do elemento div em um canvas com uma escala de 2 para aumentar a resolução.

        const imgData = canvas.toDataURL('image/png'); // Converte o canvas em uma URL de imagem no formato PNG.
        document.body.removeChild(div); // Remove o elemento do DOM

        // Criar o PDF
        const pdf = new jsPDF('l');
        const pageWidth = pdf.internal.pageSize.width || 210; // Largura total da página
        const margin = 10; // Margem da página
        const imgWidth = pageWidth - 2 * margin; // Mantém a largura da imagem dentro da página
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantém proporção

        pdf.addImage(imgData, 'PNG', margin, 10, imgWidth, imgHeight); // Adiciona a imagem ao PDF

        // Buscar dados da ficha e retiradas
        const retiradas = await relatorioService.fichasRetiradas(relatorio);

        pdf.setDrawColor(0, 0, 0); // Define a cor da borda
        pdf.setFillColor(143, 143, 143); // Define a cor de fundo
        pdf.setLineWidth(0.1); // Largura da linha da borda

        // Adicionar borda ao redor da página
        pdf.rect(10, 10, imgWidth, 180); // Desenha o retângulo ao redor da página

        let posY = imgHeight + 10; // Posição Y inicial para a tabela
        const itemsPerPage = 15; // Itens por página
        let itemCount = 0; // Contador de itens

        for (let i = 0; i < retiradas.data.length; i += itemsPerPage) {
            if (i > 0) {
                pdf.addPage(); // Adiciona uma nova página

                // Adicionar borda ao redor da página
                pdf.rect(10, 10, imgWidth, 180); // Desenha o retângulo ao redor da página
                posY = 10; // Posição Y inicial para a tabela
            }
            const tabelaDiv = document.createElement('div'); // Cria um elemento div para conter a tabela
            // Define o conteúdo HTML da tabela.
            tabelaDiv.innerHTML = `
    <table border="1" style="border-collapse: collapse; width: 100%; text-align: left; border: 1px solid rgb(0, 0, 0); color: rgb(0, 0, 0);">
         <thead>
         <tr style="background-color:rgb(143, 143, 143); height: 10px; text-align: center; border: 1px solid rgb(0, 0, 0);">
             <tr style="background-color:rgb(255, 255, 255); height: 30px; text-align: center;">
                 <th style="width: 35px; background-color:rgb(143, 143, 143); border: 1px solid rgb(0, 0, 0);"> </th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Producto</th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Tipo // Modelo</th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Marca</th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Cantidad</th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Fecha</th>
                 <th style="border: 1px solid rgb(0, 0, 0);">Firma</th>
             </tr>
         </thead>
         <tbody>
                    ${retiradas.data
                        .slice(i, i + itemsPerPage)
                        .map(
                            (item, index) => `
                                <tr style="height: 35px; border: 1px solid rgb(0, 0, 0);">
                                    <td style="text-align: center; border: 1px solid rgb(0, 0, 0);">${i + index + 1}</td>
                                    <td style="padding: 5px; border: 1px solid rgb(3, 3, 3);">${item.ProdutoNome || ''}</td>
                                    <td style="padding: 5px; border: 1px solid rgb(0, 0, 0);">${item.modelo || ''}</td>
                                    <td style="padding: 5px; border: 1px solid rgb(0, 0, 0);">${item.marca || ''}</td>
                                    <td style="text-align: center; border: 1px solid rgb(0, 0, 0);">${item.Quantidade || ''}</td>
                                    <td style="text-align: center; border: 1px solid rgb(0, 0, 0);">${formatStringDate(item.Dia) || ''}</td>
                                    <td style="padding: 5px; text-align: center; border: 1px solid rgb(0, 0, 0);">${item.Forma_Autenticacao === 'Senha' ? 'Contraseña' : item.Forma_Autenticacao || ''}</td>                 
                                </tr>
                            `
                        )
                        .join('')}
         </tbody>
     </table>
 `;

            document.body.appendChild(tabelaDiv); // Adiciona o elemento div ao corpo do documento.

            // Capturar a tabela como imagem
            const tabelaCanvas = await html2canvas(tabelaDiv, { scale: 2 });
            const tabelaImgData = tabelaCanvas.toDataURL('image/png');
            document.body.removeChild(tabelaDiv);

            // Definir posição para inserir a tabela abaixo do cabeçalho no PDF
            //let posY = imgHeight + 11;
            let tabelaWidth = pageWidth - 2 * margin;
            let tabelaHeight = (tabelaCanvas.height * tabelaWidth) / tabelaCanvas.width;

            // Adicionar tabela ao PDF
            pdf.addImage(tabelaImgData, 'PNG', margin, posY, tabelaWidth, tabelaHeight);
            itemCount += itemsPerPage;

            const rodapediv = document.createElement('div');
            rodapediv.innerHTML = `
     <div>
        <div style="width: 100%; height: 150px; border: 1px solid rgb(0, 0, 0);color: rgb(0, 0, 0);">
               <p style="margin-left:5px; font-size: 12px; font-weight: bold; font-style: italic;">Información adicional:</p>
         </div>
     </div>
 `;
            document.body.appendChild(rodapediv); // Adiciona o elemento rodapediv ao corpo do documento.
            const rodapeCanvas = await html2canvas(rodapediv, { scale: 2 }); // Converte o conteúdo do elemento rodapediv em um canvas com uma escala de 2 para aumentar a resolução.
            const rodapeImgData = rodapeCanvas.toDataURL('image/png'); // Converte o canvas em uma URL de imagem no formato PNG.
            document.body.removeChild(rodapediv); // Remove o elemento rodapediv do corpo do documento.

            let rodapeWidth = pageWidth - 2 * margin; // Largura da imagem do rodapé
            let rodapeHeight = (rodapeCanvas.height * rodapeWidth) / rodapeCanvas.width; // Mantém proporção
            let rodapeY = 168; // Posição Y do rodapé no PDF

            pdf.addImage(rodapeImgData, 'PNG', margin, rodapeY, rodapeWidth, rodapeHeight); // Adiciona a imagem ao PDF

            // Adicionar texto "Generado por Lab 220 by www.lab220.com.br" centralizado
            const footerText = 'Generado por Lab 220 by www.lab220.com.br';
            pdf.setFontSize(5);
            const textWidth = pdf.getTextWidth(footerText); // Obtém a largura do texto do rodapé.
            const textX = (pageWidth - textWidth) / 2; // Centraliza o texto horizontalmente
            const textY = 293; // Posição Y do texto no final da página
            pdf.text(footerText, textX, textY); // Adiciona o texto ao PDF
        }

        // Adicionar contagem de páginas
        const pageCount = pdf.internal.getNumberOfPages();
        // Itera sobre cada página para adicionar a numeração.
        for (let j = 1; j <= pageCount; j++) {
            pdf.setPage(j); // Define a página atual.
            const pageSize = pdf.internal.pageSize; // Obtém o tamanho da página.
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight(); // Obtém a altura da página.
            const text = `${j} de ${pageCount}`; // Define o texto da numeração da página.
            const textWidth = pdf.getTextWidth(text); // Obtém a largura do texto da numeração.
            pdf.setFontSize(6); // Define o tamanho da fonte para 6.
            // Adiciona o texto da numeração da página no rodapé.
            pdf.text(text, pageWidth - textWidth - margin, pageHeight - 4);
        }

        // Salva o PDF com o nome "Entrega_EPI_" seguido do nome do funcionário ou "Empleado" se o nome não estiver disponível.
        pdf.save(`Entrega_EPI_${funcionarioSelecionado.value.label || 'Empleado'}.pdf`);
    } catch (error) {
        // Lança um erro se houver um problema ao gerar o PDF, incluindo a mensagem de erro original.
        throw new Error(`Error al generar PDF: ${error.message}`);
    }
}
// Exporta a função GerarPdfRetirada, que gera um PDF de retirada com base na língua selecionada.
export async function GerarPdfRetirada(funcionarioSelecionado, relatorio) {
    // Obtém a língua selecionada do objeto i18n.
    const linguaSelecionada = i18n.global.locale.value;

    // Se a língua selecionada for espanhol ('es'), chama a função para gerar o PDF em espanhol.
    if (linguaSelecionada === 'es') {
        await GerarPdfRetiradaEs(funcionarioSelecionado, relatorio);
    } else {
        // Caso contrário, chama a função para gerar o PDF no idioma padrão.
        await GerarPdfRetiradapt(funcionarioSelecionado, relatorio);
    }
}

/**
 * Converts complex HTML content into plain text with specific formatting rules.
 *
 * - Text nodes are added as-is, trimmed of whitespace.
 * - Headings (H1, H2, H3) are converted to uppercase and surrounded by newlines.
 * - Paragraphs (P) are added with a newline at the end.
 * - List items (LI) are prefixed with a dash or bullet, depending on the parent list type.
 * - Ordered lists (OL) prefix items with their index followed by a dash.
 * - Unordered lists (UL) prefix items with a bullet (•).
 * - Other elements are recursively processed.
 *
 * @param {string} html - The HTML string to be converted into plain text.
 * @returns {string} The formatted plain text representation of the HTML content.
 */
export function htmlComplexoParaTexto(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
  
    let resultado = '';
  
    function processarElemento(el) {
      if (el.nodeType === Node.TEXT_NODE) {
        resultado += el.textContent.trim();
      } else if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
        resultado += '\n' + el.textContent.trim().toUpperCase() + '\n';
      } else if (el.tagName === 'P') {
        resultado += el.textContent.trim() + '\n';
      } else if (el.tagName === 'LI') {
        resultado += '- ' + el.textContent.trim() + '\n';
      } else if (el.tagName === 'OL' || el.tagName === 'UL') {
        el.querySelectorAll('li').forEach(li => {
          if (el.tagName === 'OL') {
            const index = Array.from(el.children).indexOf(li) + 1;
            resultado += `${index}- ${li.textContent.trim()}\n`;
          } else {
            resultado += `• ${li.textContent.trim()}\n`;
          }
        });
      } else {
        el.childNodes.forEach(processarElemento);
      }
    }
  
    container.childNodes.forEach(processarElemento);
  
    return resultado.trim();
  }
  
