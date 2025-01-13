import { toISODate } from '@/helpers/HelperUtils'; // Supondo que essa função já exista
import { useAuthStore } from '@/store/authStore.js'; 
const store = useAuthStore();
/**
 * Prepara os dados para relatórios.
 * @param {string} tipoRelatorio - O tipo do relatório.
 * @param {Object} relatorio - Os valores do formulário.
 * @param {Object} store - O estado global (usuário, cliente, etc.).
 * @returns {Object} - O objeto de dados preparado.
 */
export const prepararDadosRelatorio=(tipoRelatorio, relatorio) =>{
    const baseData = {
        id_cliente: store.userIdCliente,
    };
    switch (tipoRelatorio) {
        case  'Devoluções':
            return {
            ...baseData,
            id_dm: relatorio.value.id_dm || undefined,
            id_funcionario: relatorio.value.id_funcionario || undefined,
            data_inicio: toISODate(relatorio.value.data_inicio),
            data_final: toISODate(relatorio.value.data_final),
        };
        case 'Estoque':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm,
        };
        case 'Retiradas Realizadas':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.id_dm || undefined,
                id_planta: relatorio.value.id_planta || undefined,
                id_centro_custo: relatorio.value.id_centro_custo || undefined,
                id_setor: relatorio.value.id_setor || undefined,
                id_funcionario: relatorio.value.id_funcionario || undefined,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final),
        };
        case  'Itens mais Retirados':
            return {
                ...baseData,
            id_usuario: store.userId,
            id_dm: relatorio.value.id_dm || undefined,
            id_planta: relatorio.value.id_planta || undefined,
            id_centro_custo: relatorio.value.id_centro_custo || undefined,
            id_setor: relatorio.value.id_setor || undefined,
            id_funcionario: relatorio.value.id_funcionario || undefined,
            data_inicio: toISODate(relatorio.value.data_inicio),
            data_final: toISODate(relatorio.value.data_final),
        };
        case 'Histórico Abastecimento':
            return {
                ...baseData,
                id_usuario: store.userId,
                id_dm: relatorio.value.dm || undefined,
                id_funcionario: relatorio.value.id_funcionario || undefined,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final),
                id_operador: relatorio.value.id_operador,
        };
        case 'StatusDM':
            return {
                ...baseData,
            id_usuario: store.userId,
            id_dm: relatorio.value.id_dm,
            dia: relatorio.value.dia.toISOString(),
        };
        case  'Logs':
            return {
                ...baseData,
                id_dm: relatorio.value.dm,
                id_usuario: relatorio.value.id_usuario,
                id_funcionario: relatorio.value.id_funcionario,
                operacao: relatorio.value.id_operacao,
                data_inicio: toISODate(relatorio.value.data_inicio),
                data_final: toISODate(relatorio.value.data_final),
        };
        default:
            return baseData;
    }
}
/**
 * Adiciona a opção 'Todos' e organiza os dados de funcionários.
 * @param {Array} funcionarios - Lista de funcionários retornada pela API.
 * @returns {Array} - Lista formatada com a opção 'Todos' e os funcionários organizados.
 */
export function organizarFuncionarios(funcionarios) {
    // Mapeia os dados e adiciona a opção 'Todos' no início
    const listaFormatada = funcionarios.map(funcionario => ({
        label: funcionario.nome, // Nome do funcionário
        value: funcionario.id_funcionario, // ID do funcionário
        id_setor: funcionario.id_setor, // ID do setor
        id_funcao: funcionario.id_funcao, // ID da função
        id_planta: funcionario.id_planta, // ID da planta
        id_centro_custo: funcionario.id_centro_custo // ID do centro de custo
    }));

    // Adiciona a opção 'Todos' no início da lista
    return [{ label: 'Todos', value: null }, ...listaFormatada];
}
