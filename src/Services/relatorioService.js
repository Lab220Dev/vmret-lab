import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.
import { prepararDadosRelatorio, organizarFuncionarios } from '@/helpers/RelatorioHelper.js'; // Importa as funções auxiliares `prepararDadosRelatorio` e `organizarFuncionarios` de um helper para manipulação de dados de relatórios.

// Define uma constante com o texto padrão que será utilizado em algum relatório.
const TextoPadrao =
    '1- Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente ao da praça.\n2- Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.\n3- Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo, ao setor competente.\n4- Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.';

const relatorioService = {
    /**
     * Consulta o status de um relatório específico.
     *
     * @param {Object} relatorio - Objeto contendo os dados do relatório para consulta.
     * @returns {Promise} Retorna a Promise da requisição axios que contém os dados do status do relatório.
     * @throws {Error} Lança um erro caso a consulta falhe, com uma mensagem explicativa.
     */
    async consultaStatus(relatorio) {
        try {
            // Prepara os dados do relatório chamando a função `prepararDadosRelatorio` com o tipo de consulta e os dados do relatório.
            const data = prepararDadosRelatorio('Consulta Status', relatorio);

            // Realiza uma requisição POST para o endpoint '/Conslta/relatorio' com os dados preparados.
            const response = await axios.post('/Conslta/relatorio', data);

            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.
            throw new Error(`Erro ao consultar status: ${error.message}`);
        }
    },
    async devolucoes(relatorio) {
        try {
            const data = prepararDadosRelatorio('Devoluções', relatorio);
            // Realiza uma requisição POST para o endpoint '/devolucoes/relatorio' com os dados preparados.
            const response = await axios.post('/devolucoes/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async estoquedm(relatorio) {
        try {
            const data = prepararDadosRelatorio('Estoque', relatorio);
            // Realiza uma requisição POST para o endpoint '/Estoque/listar' com os dados preparados.
            const response = await axios.post('/Estoque/listar', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async fichasRetiradas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Fichas Retiradas', relatorio);
            // Realiza uma requisição POST para o endpoint '/fichasretiradas/relatorio' com os dados preparados.
            const response = await axios.post('/fichasretiradas/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async historicoAbastecimento(relatorio) {
        try {
            const data = prepararDadosRelatorio('Histórico Abastecimento', relatorio);
            // Realiza uma requisição POST para o endpoint '/HistoricoAbastecimento/relatorio' com os dados preparados.
            const response = await axios.post('/HistoricoAbastecimento/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async itemsMaisRetiradas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Itens mais Retirados', relatorio);
            // Realiza uma requisição POST para o endpoint 'relatorioItems/relatorio' com os dados preparados.
            const response = await axios.post('relatorioItems/relatorio', data);

            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async logDesktop(relatorio) {
        try {
            const data = prepararDadosRelatorio('LogsDesk', relatorio);
            // Realiza uma requisição POST para o endpoint '/Log/relatoriodesk' com os dados preparados.
            const response = await axios.post('/Log/relatoriodesk', data);
            console.log(response.data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async logs(relatorio) {
        try {
            const data = prepararDadosRelatorio('Logs', relatorio);
            // Realiza uma requisição POST para o endpoint '/Log/relatorio' com os dados preparados.
            const response = await axios.post('/Log/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async retiradaRealizadas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Retiradas Realizadas', relatorio);
            // Realiza uma requisição POST para o endpoint 'relatorioRetiRe/relatorio' com os dados preparados.
            const response = await axios.post('/relatorioRetiRe/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async retiradaAvulsas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Retiradas Avulsas', relatorio);
            // Realiza uma requisição POST para o endpoint '/retiradasAvulsas/relatorio com os dados preparados.
            const response = await axios.post('/retiradasAvulsas/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async statusDM(relatorio) {
        try {
            const data = prepararDadosRelatorio('StatusDM', relatorio);
            // Realiza uma requisição POST para o endpoint '/SDM/relatorio' com os dados preparados.
            const response = await axios.post('/SDM/relatorio', data);
            // Retorna os dados da resposta da requisição.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async listaFuncionario() {
        try {
            const data = prepararDadosRelatorio('funcionario', '');
            // Realiza uma requisição POST para o endpoint '/funcionarios/listaRelatorio' com os dados preparados.
            const response = await axios.post('/funcionarios/listaRelatorio', data);
            // Retorna os dados da resposta da requisição.
            return organizarFuncionarios(response.data);
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    },
    async listaOperador() {
        try {
            const data = prepararDadosRelatorio('Operador', '');
            // Realiza uma requisição POST para o endpoint '/funcionarios/listarOperarios' com os dados preparados.
            const response = await axios.post('/funcionarios/listarOperarios', data);
            // Retorna os dados da resposta da requisição.
            return organizarFuncionarios(response.data);
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    },
    async TextoFicha() {
        try {
            const data = prepararDadosRelatorio('Texto', '');
            // Realiza uma requisição POST para o endpoint 'fichasretiradas/textoFicha' com os dados preparados.
            const response = await axios.post('fichasretiradas/textoFicha', data);
            // Retorna os dados da resposta da requisição.
            return response.data[0]?.TextoFicha || TextoPadrao;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, lança um novo erro com uma mensagem detalhada.

            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    },
    async Cabecalho() { // Declara um método assíncrono chamado Cabecalho
        try { // Inicia um bloco try para capturar possíveis erros
            const response = await fetch('/cabecalho.html'); // Faz uma requisição para obter o arquivo 'cabecalho.html'
            if (!response.ok) { // Verifica se a resposta não está OK (status diferente de 200-299)
                throw new Error('Erro ao carregar o cabeçalho'); // Lança um erro com a mensagem 'Erro ao carregar o cabeçalho'
            }
            return await response.text(); // Retorna o conteúdo do cabeçalho como texto
        } catch (error) { // Captura qualquer erro que ocorrer durante a requisição
            console.error('Erro ao recuperar o cabeçalho:', error); // Loga a mensagem de erro no console
            return ''; // Retorna uma string vazia em caso de erro
        }
    }
};
// Exporta o serviço `relatorioService` para que ele possa ser utilizado em outros módulos.
export default relatorioService;
