import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore.js';
const dataStore = useDataStore();
const store = useAuthStore();
const dashboardService = {
  async fetchAdminData() {
    try {
      const [dadosResponse, listaResponse, notificacoesResponse] = await Promise.all([
        axios.post('/dashboard/DadosClientes'),
        axios.post('/dashboard/ResumoDados'),
        axios.post('/dashboard/UltimasNotificacoes'),
      ]);

      return {
        dados: dadosResponse.data,
        lista: listaResponse.data,
        notificacoes: notificacoesResponse.data,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Admin:', error.message);
      throw new Error('Falha ao carregar dados do Admin');
    }
  },

  async fetchMasterData() {
    const data = { id_cliente:store.userIdCliente };

    try {
      const [produtosResponse, maisRetiradosResponse, keepAliveResponse, estoqueBaixoResponse] = await Promise.all([
        axios.post('/relatorioItems/ultimos', data),
        axios.post('/relatorioItems/listarMaisRet', data),
        axios.post('/SDM/resumo', data),
        axios.post('/Estoque/ItensEstoqueBaixo', data),
      ]);

      return {
        produtos: produtosResponse.data.slice(0, 5),
        maisRetirados: maisRetiradosResponse.data.slice(0, 5),
        keepAlive: keepAliveResponse.data,
        estoqueBaixo: estoqueBaixoResponse.data.slice(0, 5),
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Master:', error.message);
      throw new Error('Falha ao carregar dados do Master');
    }
  },

  async fetchOperadorData() {
    const data = { id_cliente: store.userIdCliente };

    try {
      const estoqueResponse = await axios.post('/Estoque/outro', data);
      const maquinas = dataStore.dms || (await dataStore.fetchListaDms());

      return {
        estoque: estoqueResponse.data,
        maquinas,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Operador:', error.message);
      throw new Error('Falha ao carregar dados do Operador');
    }
  },
};

export default dashboardService;
