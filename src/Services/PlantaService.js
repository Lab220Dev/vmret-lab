import axios from '@/axios.js'; // Importa a instância personalizada do axios para realizar requisições HTTP.

const plantaService = { // Declara um objeto chamado plantaService que contém vários métodos assíncronos
  async listarPlantas(idCliente) { // Declara um método assíncrono chamado listarPlantas que recebe um idCliente como parâmetro
    const data = { id_cliente: idCliente }; // Cria um objeto data com a propriedade id_cliente definida como o idCliente fornecido
    return axios.post('/plantas/listar', data); // Faz uma requisição POST usando axios para a URL '/plantas/listar' com os dados fornecidos e retorna a resposta
  },
  async listarPlantasPaginado(data) {
    return axios.post('/plantas/listarPaginando', data);
  },
  async adicionarPlanta(planta) {
    return axios.post('/plantas/adicionar', planta);
  },

  async atualizarPlanta(planta) {
    return axios.post('/plantas/atualizar', planta);
  },

  async deletarPlanta(data) {
  try {
    return axios.post('/plantas/deletePlanta', data); // Envia uma requisição POST para deletar um setor com os dados fornecidos.
  
      } catch (error) {
        // Caso ocorra um erro, loga a mensagem de erro no console.
        console.error('Erro ao deletar plantas:', error.message);
        
        // Lança o erro novamente, permitindo que o chamador lide com ele.
        throw error; 
      }
    },
  }

// Exporta o serviço `plantaService` para ser utilizado em outros módulos.
export default plantaService;
