import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/app',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/HomeView.vue'),
                    meta: { requiresAuth: true }
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
                    component: () => import('@/views/cadastros/usuarios/Avulsa.vue'),
                    meta: { requiresAuth: true }
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
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/relatorios/ConsultaStatus',
                    name: 'Consulta Status',
                    component: () => import('@/views/relatorios/ConsultaStatus.vue')
                },
                {
                    path: '/cadastros/LiberacaoAvulsa',
                    name: 'Liberação Avulsa',
                    component: () => import('@/views/cadastros/LiberacaoAvulsa.vue')
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
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const token = localStorage.getItem('token');

    if (requiresAuth && !token) {
        next({ name: 'login' });
    } else {
        next();
    }
});
export default router;
