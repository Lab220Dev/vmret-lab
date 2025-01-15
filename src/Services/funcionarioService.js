import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore.js';
import { prepareFuncionarioData, prepareprodutoData } from '@/helpers/HelperFuncionario';

const funcionarioService = {
    async listarFuncionarios(data) {
        return axios.post('/funcionarios/listar', data);
    },
    async adicionarFuncionario(funcionario, file) {
        const formData = prepareFuncionarioData(funcionario, file, false);
        return axios.post('/funcionarios/adicionar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    async atualizarFuncionario(funcionario, file) {
        const formData = prepareFuncionarioData(funcionario, file, true);
        return axios.put('/funcionarios/atualizar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    async deleteFuncionario(data) {
        return axios.post('/funcionarios/deleteFuncionario', data);
    },
    async obterImagem(userIdCliente, filename) {
      try {
        return axios.get(`/image/funcionario/${userIdCliente}/${filename}`); // Envia uma requisição GET para obter a imagem do produto.
      } catch (error) {
        // Caso ocorra um erro, loga a mensagem de erro no console.
        console.error('Erro ao carregar imagem do produto:', error.message);
        
        // Lança o erro novamente, permitindo que o chamador lide com ele.
        throw error; 
      }
    },
    async SalvarProduto(funcionario, produto) {
        const data = prepareprodutoData(funcionario, produto);
        return axios.post('/funcionarios/adicionarItem', data);
    },
    async deleteProduct(funcionario, produto) {
        const data = prepareprodutoData(funcionario, produto);
        return axios.post('/funcionarios/deleteItem', data);
    },
    async fetchItensSetor(data) {
        return axios.post('Setor/itensdisponiveissetor', data);
    },
    async fetchHieraquiaOptions() {
        const store = useAuthStore();
        return axios.post('funcionarios/listarhierarquia', { id_cliente: store.userIdCliente });
    }
};

// Exporta o serviço funcionarioService para ser utilizado em outros arquivos ou componentes.
export default funcionarioService;