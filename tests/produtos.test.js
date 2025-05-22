import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils'; // Para testar o componente Vue
import Produto from '@/views/cadastros/produtos.vue';
import produtoService from '@/services/produtoService';
import { flushPromises } from '@vue/test-utils'; // Para esperar as promessas
import { createPinia, setActivePinia } from 'pinia';

const toastMock = vi.fn();

vi.mock('primevue/usetoast', () => ({
    useToast: () => ({
        add: toastMock
    })
}));

vi.mock('@/store/dataStore.js', () => ({
  useDataStore: () => ({
    plantasOptions: [],
    fetchPlantas: vi.fn().mockResolvedValue(), // Mock da função fetchPlantas
    invalidatProdutoCache: vi.fn(),
  }),
}));

vi.mock('@/store/authStore.js', () => ({
  useAuthStore: () => ({
    userIdCliente: '123', // Mock do ID do cliente
    token: 'mock-token', // Mock do token de autenticação
    userId: '456', // Mock do ID do usuário
  }),
}));

vi.mock('@/services/produtoService', () => ({
  default: {
    listarProdutos: vi.fn(),
    adicionarProduto: vi.fn(),
    atualizarProduto: vi.fn(),
    deletarProduto: vi.fn(),
    obterImagem: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
    createRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        resolve: vi.fn(),
        currentRoute: { value: {} },
        beforeEach: vi.fn(),
        afterEach: vi.fn()
    })),
    createWebHistory: vi.fn()
}));

vi.mock('vue-i18n', () => ({
    createI18n: () => ({
        global: {
            t: (key) => key // Mock da função de tradução
        }
    }),
    useI18n: () => ({
        t: (key) => key // Mock da função de tradução
    })
}));

describe('Cadastro de Produto', () => {
    let wrapper;
    let mockAdicionarProduto;
    let pinia;

    pinia = createPinia();
    setActivePinia(pinia);

    beforeEach(() => {
      produtoService.listarProdutos.mockResolvedValue({
        data: {
          produtos: [
            {
              id: 1,
              codigo: '123',
              nome: 'Produto de Teste',
              descricao: 'Descrição do produto',
              especificacoes: 'Especificações',
              id_tipoProduto: 1,
              id_planta: 1,
              unidade_medida: 'Unidade',
              validadedias: 30,
              quantidademinima: 5,
            },
          ],
          totalRecords: 1,
        },
      });
    
      // Mock da função `adicionarProduto`
      mockAdicionarProduto = produtoService.adicionarProduto.mockResolvedValue({});
    

        // Cria o wrapper do componente
        wrapper = shallowMount(Produto, {
            global: {
                plugins: [pinia], // Registra o Pinia no teste
                mocks: {
                    // Mock de funções como `toast.add`, `t`, etc.
                    toast: { add: vi.fn() },
                    t: (key) => key, // Mock da função `t`
                    $t: (key) => key // Mock da função `$t` usada no template
                }
            }
        });
    });

    it('deve salvar um produto com sucesso', async () => {
        // Preenche os campos do formulário
        Object.assign(wrapper.vm.produto, {
            codigo: '123',
            nome: 'Produto de Teste',
            descricao: 'Descrição do produto',
            especificacoes: 'Especificações',
            id_tipoProduto: 1,
            id_planta: 1,
            unidade_medida: 'Unidade',
            validadedias: 30,
            quantidademinima: 5
        });

        // Chama a função de salvar o produto
        await wrapper.vm.saveProduto();

        // Espera o mock da chamada da API resolver
        await flushPromises();

        // Verifica se o serviço `adicionarProduto` foi chamado
        expect(mockAdicionarProduto).toHaveBeenCalledTimes(1);
        expect(mockAdicionarProduto).toHaveBeenCalledWith(
            expect.objectContaining({
                codigo: '123',
                nome: 'Produto de Teste',
                descricao: 'Descrição do produto',
                especificacoes: 'Especificações',
                id_tipoProduto: 1,
                id_planta: 1,
                unidade_medida: 'Unidade',
                validadedias: 30,
                quantidademinima: 5
            }),
            expect.any(Object) // Mock do contexto de autenticação
        );
    });

    it('deve exibir um erro caso falhe ao salvar', async () => {
        // Simula um erro na chamada do serviço
        mockAdicionarProduto.mockRejectedValue(new Error('Erro de teste'));

        // Chama a função de salvar o produto
        await wrapper.vm.saveProduto();

        // Espera o mock da chamada da API resolver
        await flushPromises();

        // Verifica se o toast de erro foi exibido
        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                severity: 'error',
                summary: 'title_error',
                detail: 'product_added_error'
            })
        );
    });
});
