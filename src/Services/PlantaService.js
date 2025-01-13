import axios from '@/axios.js';

const plantaService = {
  async listarPlantas(idCliente) {
    const data = { id_cliente: idCliente };
    return axios.post('/plantas/listar', data);
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

export default plantaService;