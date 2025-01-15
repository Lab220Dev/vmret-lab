import axios from '@/axios.js';
import { prepararDadosRelatorio, organizarFuncionarios } from '@/helpers/RelatorioHelper.js';
const TextoPadrao='1- Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca ou equivalente ao da praça.\n2- Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.\n3- Terminando os serviços ou no caso de rescisão do contrato de trabalho, devolverei o equipamento completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo, ao setor competente.\n4- Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.';
const relatorioService = {
    async consultaStatus(relatorio) {
        try {
            const data = prepararDadosRelatorio('Consulta Status', relatorio);
            const response = await axios.post('/Conslta/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar status: ${error.message}`);
        }
    },
    async devolucoes(relatorio) {
        try {
            const data = prepararDadosRelatorio('Devoluções', relatorio);
            const response = await axios.post('/devolucoes/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async estoquedm(relatorio) {
        try {
            const data = prepararDadosRelatorio('Estoque', relatorio);
            const response = await axios.post('/Estoque/listar', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async fichasRetiradas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Fichas Retiradas', relatorio);
            const response = await axios.post('/fichasretiradas/relatorio', data);
            return response;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async historicoAbastecimento(relatorio) {
        try {
            const data = prepararDadosRelatorio('Histórico Abastecimento', relatorio);
            const response = await axios.post('/HistoricoAbastecimento/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async itemsMaisRetiradas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Itens mais Retirados', relatorio);
            const response = await axios.post('relatorioItems/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async logDesktop(relatorio) {
        try {
            const data = prepararDadosRelatorio('Logs', relatorio);
            const response = await axios.post('/Log/relatoriodesk', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async logs(relatorio) {
        try {
            const data = prepararDadosRelatorio('Logs', relatorio);
            const response = await axios.post('/Log/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async retiradaRealizadas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Retiradas Realizadas', relatorio);
            const response = await axios.post('/relatorioRetiRe/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async retiradaAvulsas(relatorio) {
        try {
            const data = prepararDadosRelatorio('Retiradas Avulsas', relatorio);
            const response = await axios.post('/retiradasAvulsas/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async statusDM(relatorio) {
        try {
            const data = prepararDadosRelatorio('StatusDM', relatorio);
            const response = await axios.post('/SDM/relatorio', data);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao consultar relatorio: ${error.message}`);
        }
    },
    async listaFuncionario() {
        try {
            const data = prepararDadosRelatorio('funcionario', '');
            const response = await axios.post('/funcionarios/listaRelatorio', data);
            return organizarFuncionarios(response.data);
        } catch (error) {
            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    },
    async listaOperador() {
        try {
            const data = prepararDadosRelatorio('Operador', '');
            const response = await axios.post('/funcionarios/listarOperarios', data);
            return organizarFuncionarios(response.data);
        } catch (error) {
            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    },
    async TextoFicha() {
        try {
            const data = prepararDadosRelatorio('Texto', '');
            const response = await axios.post('fichasretiradas/textoFicha', data);
            return (
                response.data[0]?.TextoFicha ||
                TextoPadrao
            );
        } catch (error) {
            throw new Error(`Erro ao consultar dados: ${error.message}`);
        }
    }
};

export default relatorioService;
