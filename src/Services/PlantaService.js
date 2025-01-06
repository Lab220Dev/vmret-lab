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

  async deletarPlanta(idPlanta) {
    const data = { id_planta: idPlanta };
    return axios.post('/planta/deletePlanta', data);
  },
};

export default plantaService;
