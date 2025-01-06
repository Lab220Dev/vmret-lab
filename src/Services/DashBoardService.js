// Importa a instância configurada do Axios para fazer requisições HTTP.
import axios from '@/axios.js'; 

// Importa o store de autenticação para acessar informações do usuário autenticado.
import { useAuthStore } from '@/store/authStore'; 

// Importa o store de dados, que gerencia cache e dados compartilhados.
import { useDataStore } from '@/store/dataStore.js'; 

// Cria uma instância do store de dados.
const dataStore = useDataStore();

// Cria uma instância do store de autenticação.
const store = useAuthStore();

// Objeto `dashboardService` que contém métodos para interagir com a API de dashboard.
const dashboardService = {
  
  /**
   * Método assíncrono para buscar os dados principais do painel de administração.
   * @returns {Promise<Object>} Um objeto contendo dados para o dashboard de admin.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async fetchAdminData() {
    try {
      // Realiza múltiplas requisições de forma paralela com Promise.all, buscando dados para o painel administrativo.
      const [dadosResponse, listaResponse, notificacoesResponse] = await Promise.all([
        axios.post('/dashboard/DadosClientes'),  // Requisição para buscar dados dos clientes.
        axios.post('/dashboard/ResumoDados'),    // Requisição para buscar um resumo de dados.
        axios.post('/dashboard/UltimasNotificacoes'), // Requisição para buscar últimas notificações.
      ]);

      // Retorna os dados recebidos das requisições.
      return {
        dados: dadosResponse.data,  // Dados dos clientes.
        lista: listaResponse.data,  // Resumo dos dados.
        notificacoes: notificacoesResponse.data,  // Notificações.
      };
    } catch (error) {
      // Em caso de erro, loga a mensagem de erro no console.
      console.error('Erro ao buscar dados do Admin:', error.message);

      // Lança um erro com uma mensagem genérica para indicar falha ao carregar os dados.
      throw new Error('Falha ao carregar dados do Admin');
    }
  },

  /**
   * Método assíncrono para buscar dados específicos para o painel do Master.
   * @returns {Promise<Object>} Um objeto contendo dados específicos para o painel Master.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async fetchMasterData() {
    // Prepara os dados para enviar nas requisições, incluindo o id_cliente obtido do store.
    const data = { id_cliente: store.userIdCliente };

    try {
      // Realiza múltiplas requisições paralelamente com Promise.all para obter dados específicos para o painel Master.
      const [produtosResponse, maisRetiradosResponse, keepAliveResponse, estoqueBaixoResponse] = await Promise.all([
        axios.post('/relatorioItems/ultimos', data),          // Requisição para buscar os últimos produtos.
        axios.post('/relatorioItems/listarMaisRet', data),    // Requisição para buscar os itens mais retirados.
        axios.post('/SDM/resumo', data),                       // Requisição para buscar dados de keep-alive.
        axios.post('/Estoque/ItensEstoqueBaixo', data),       // Requisição para buscar itens com estoque baixo.
      ]);

      // Retorna os dados recebidos das requisições, com algumas listas sendo limitadas a 5 itens.
      return {
        produtos: produtosResponse.data.slice(0, 5),            // Limita os últimos produtos a 5.
        maisRetirados: maisRetiradosResponse.data.slice(0, 5),    // Limita os itens mais retirados a 5.
        keepAlive: keepAliveResponse.data,                        // Dados de keep-alive.
        estoqueBaixo: estoqueBaixoResponse.data.slice(0, 5),      // Limita os itens com estoque baixo a 5.
      };
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao buscar dados do Master:', error.message);

      // Lança um erro com uma mensagem genérica para indicar falha ao carregar os dados do Master.
      throw new Error('Falha ao carregar dados do Master');
    }
  },

  /**
   * Método assíncrono para buscar dados específicos para o painel do Operador.
   * @returns {Promise<Object>} Um objeto contendo dados para o painel do operador.
   * @throws {Error} Se ocorrer um erro durante a requisição.
   */
  async fetchOperadorData() {
    // Prepara os dados para enviar nas requisições, incluindo o id_cliente obtido do store.
    const data = { id_cliente: store.userIdCliente };

    try {
      // Realiza uma requisição para buscar o estoque.
      const estoqueResponse = await axios.post('/Estoque/outro', data);

      // Obtém a lista de DMs, se não estiver disponível no store, realiza uma requisição para obtê-la.
      const maquinas = dataStore.dms || (await dataStore.fetchListaDms());

      // Retorna os dados recebidos das requisições, incluindo o estoque e as DMs.
      return {
        estoque: estoqueResponse.data,  // Dados de estoque.
        maquinas,                      // Dados das máquinas (DMs).
      };
    } catch (error) {
      // Caso ocorra um erro, loga a mensagem de erro no console.
      console.error('Erro ao buscar dados do Operador:', error.message);

      // Lança um erro com uma mensagem genérica para indicar falha ao carregar os dados do Operador.
      throw new Error('Falha ao carregar dados do Operador');
    }
  },
};

// Exporta o objeto `dashboardService` para ser utilizado em outros arquivos ou componentes.
export default dashboardService;
