/**
 * 
 */
import { createRouter, createWebHistory } from 'vue-router';//Importa as funções necessárias do Vue e outros módulos para configurar as rotas da aplicação.
/**
 * 
 */
import { ref } from 'vue';//Importa o `ref` do Vue, que permite criar variáveis reativas.
/**
 * 
 */
import AppLayout from '@/layout/AppLayout.vue';//Importa o layout principal da aplicação, onde as páginas serão carregadas.
/**
 * 
 */
import { useAuthStore } from '@/store/authStore';//Importa o store de autenticação, que gerencia o estado de login do usuário.
import i18n from '@/i18n'; // Importa o módulo de internacionalização (i18n) para gerenciar traduções e idiomas na aplicação.

/**
 * Variável reativa que controla o estado de carregamento da página.
 * @type {Ref<boolean>}
 */
export const isLoading = ref(false);

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),//A função de histórico do roteador para manter a navegação sem recarregar a página.
    routes: [
        /**
         * Rota principal, a página de login.
         * @type {RouteRecordRaw}
         */
        {
            path: '/',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        /**
         * Rota principal da aplicação (layout de app) com várias páginas filhas.
         * @type {RouteRecordRaw}
         */
        {
            path: '/app',
            component: AppLayout,
            children: [
                /**
                 * Página de dashboard do usuário, que requer autenticação.
                 * @type {RouteRecordRaw}
                 */
                {
                    path: '/dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/HomeView.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/Importacao',
                    name: 'Importações',
                    component: () => import('@/views/pages/Importacao.vue'),
                    meta: { requiresAuth: true, Availability: true }
                },
                {
                    path: '/cadastros/LiberacaoAvulsa',
                    name: 'Liberação Avulsa',
                    component: () => import('@/views/cadastros/LiberacaoAvulsa.vue'),
                    meta: { requiresAuth: true, Availability: true }
                },
                {
                    path: '/relatorios/retiradasrealizadas',
                    name: 'retiradasrealizadas',
                    component: () => import('@/views/relatorios/retiradasrealizadas.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/estoquedm',
                    name: 'estoquedm',
                    component: () => import('@/views/relatorios/estoquedm.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/itemsmaisretirados',
                    name: 'itemsmaisretirados',
                    component: () => import('@/views/relatorios/itemsmaisretirados.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/retiradasavulsas',
                    name: 'retiradasavulsas',
                    component: () => import('@/views/relatorios/retiradasavulsas.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/historicosabastecimento',
                    name: 'historicosabastecimento',
                    component: () => import('@/views/relatorios/historicosabastecimento.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/statusdm',
                    name: 'statusdm',
                    component: () => import('@/views/relatorios/statusdm.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/fichasretiradas',
                    name: 'fichasretiradas',
                    component: () => import('@/views/relatorios/fichasretiradas.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/logs',
                    name: 'logs',
                    component: () => import('@/views/relatorios/logs.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/logmaquina',
                    name: 'logDesk',
                    component: () => import('@/views/relatorios/logDesk.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/Metricasdm',
                    name: 'Metricas da DM',
                    component: () => import('@/views/relatorios/MetricasDM.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/PerformaceDM',
                    name: 'Performace da DM',
                    component: () => import('@/views/relatorios/PerformaceDM.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/devolucoes',
                    name: 'Devoluções',
                    component: () => import('@/views/relatorios/devolucoes.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/relatorios/PerformaceHoraDM',
                    name: 'Performace por Hora da DM',
                    component: () => import('@/views/relatorios/PerformaceHoraDM.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/funcionarios',
                    name: 'cadastros de Funcionários',
                    component: () => import('@/views/cadastros/funcionarios.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/produtos',
                    name: 'cadastros de Produtos',
                    component: () => import('@/views/cadastros/produtos.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/usuarios/web',
                    name: 'Cadastro Usuario',
                    component: () => import('@/views/cadastros/usuarios/web.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/usuarios/avulsa',
                    name: 'Cadastro Liberação Avulsa',
                    component: () => import('@/views/relatorios/ListaRetiradaDisponiveis.vue'),
                    meta: { requiresAuth: true, Availability: true }
                },
                {
                    path: '/cadastros/usuarios/dm',
                    name: 'Cadastro DM',
                    component: () => import('@/views/cadastros/usuarios/dm.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/cdc',
                    name: 'Cadastro de Centro de Custo',
                    component: () => import('@/views/cadastros/cdc.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/setor',
                    name: 'cadastro de Setor',
                    component: () => import('@/views/cadastros/setor.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/funcao',
                    name: 'Cadastro de Função',
                    component: () => import('@/views/cadastros/funcao.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/planta',
                    name: 'Cadastro de Plantas',
                    component: () => import('@/views/cadastros/planta.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/servico',
                    name: 'Gerencia de MicroServiços',
                    component: () => import('@/views/pages/GerenciaMicro.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/Cliente',
                    name: 'Cadastro de Clientes',
                    component: () => import('@/views/cadastros/Clientes.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/UsuarioDM',
                    name: 'Cadastro de Usuarios Dispenser Machine',
                    component: () => import('@/views/cadastros/usuarios/UsuariosDMs.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/cadastros/UsuarioDash',
                    name: 'Cadastro de Usuarios Dashboard de Monitoramento',
                    component: () => import('@/views/cadastros/usuarios/usuariodash.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/Mensagem',
                    name: 'Mensagens',
                    component: () => import('@/views/pages/Mensagem.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/endpoints/entrada',
                    name: 'Endpoints de Entrada',
                    component: () => import('@/views/pages/Entradas.vue')
                },
                {
                    path: '/endpoints/saida',
                    name: 'Endpoints de Saida',
                    component: () => import('@/views/pages/Saida.vue')
                },
                {
                    path: '/relatorios/ConsultaStatus',
                    name: 'Consulta Status',
                    component: () => import('@/views/relatorios/ConsultaStatus.vue')
                },
                {
                    path: '/pages/listaItensNaoAlocados',
                    name: 'Lista de Itens Não Liberados',
                    component: () => import('@/views/pages/ListaItensNaoAlocados.vue')
                },
                {
                    path: '/cadastros/Termo',
                    name: 'Termo de compromisso - Ficha Retirada',
                    component: () => import('@/views/pages/Termo.vue')
                },
                {
                    path: '/cadastros/Importacao',
                    name: 'Importação de dados',
                    component: () => import('@/views/pages/Importacao.vue')
                },
                {
                    path: '/cadastros/Video',
                    name: 'Gerenciamento de Videos',
                    component: () => import('@/views/cadastros/GerenciadorVideo.vue')
                }
            ]
        },
        /**
         * Página de erro 404 caso a rota não seja encontrada.
         * @type {RouteRecordRaw}
         */
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        /**
         * Página de evento, que não requer autenticação.
         * @type {RouteRecordRaw}
         */
        {
            path: '/evento/dados',
            name: 'dados do evento',
            component: () => import('@/views/evento.vue'),
            meta: { requiresAuth: false }
        },
        /**
         * Outra página de evento, para o evento SoulElite24.
         * @type {RouteRecordRaw}
         */
        {
            path: '/evento/SoulElite24',
            name: 'dados do evento SoulElite24',
            component: () => import('@/views/eventoSoulElite.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/evento/nomad',
            name: 'dados do evento Nomad',
            component: () => import('@/views/pages/Nomad.vue'),
            meta: { requiresAuth: false }
        }
    ]
});

/**
 * Gancho de navegação para garantir que o usuário está autorizado antes de acessar certas páginas.
 * @param {Route} to - A rota para a qual o usuário está indo.
 * @param {Route} from - A rota de onde o usuário está vindo.
 * @param {Function} next - Função que deve ser chamada para permitir ou bloquear a navegação.
 */
router.beforeEach((to, from, next) => {

    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const token = localStorage.getItem('token');

    if (requiresAuth && !token) {
        next({ name: 'login' });
    } else if (to.meta.Availability === false) {
        authStore.setGlobalMessage(i18n.global.t('page_unavailable'));
        if (to.name !== 'Dashboard') {
            next({ name: 'Dashboard' });
        } else {
            router.replace({ name: 'Dashboard' });
        }
    } else {
        isLoading.value = true;
        next();
    }
});

// Define uma função que será executada após cada navegação de rota.
router.afterEach(() => {
    // Define o valor de isLoading como falso, indicando que o carregamento da página terminou.
    isLoading.value = false;
});

// Exporta o roteador configurado como o padrão do módulo.
export default router;
