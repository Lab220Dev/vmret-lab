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
                    component: () => import('@/views/HomeView.vue')
                },
                {
                    path: '/relatorios/retiradasrealizadas',
                    name: 'retiradasrealizadas',
                    component: () => import('@/views/relatorios/retiradasrealizadas.vue')
                },
                {
                    path: '/relatorios/estoquedm',
                    name: 'estoquedm',
                    component: () => import('@/views/relatorios/estoquedm.vue')
                },
                {
                    path: '/relatorios/itemsmaisretirados',
                    name: 'itemsmaisretirados',
                    component: () => import('@/views/relatorios/itemsmaisretirados.vue')
                },
                {
                    path: '/relatorios/retiradasavulsas',
                    name: 'retiradasavulsas',
                    component: () => import('@/views/relatorios/retiradasavulsas.vue')
                },
                {
                    path: '/relatorios/historicosabastecimento',
                    name: 'historicosabastecimento',
                    component: () => import('@/views/relatorios/historicosabastecimento.vue')
                },
                {
                    path: '/relatorios/statusdm',
                    name: 'statusdm',
                    component: () => import('@/views/relatorios/statusdm.vue')
                },
                {
                    path: '/relatorios/fichasretiradas',
                    name: 'fichasretiradas',
                    component: () => import('@/views/relatorios/fichasretiradas.vue')
                },
                {
                    path: '/relatorios/logs',
                    name: 'logs',
                    component: () => import('@/views/relatorios/logs.vue')
                },
                {
                    path: '/cadastros/funcionarios',
                    name: 'cadastros de Funcionários',
                    component: () => import('@/views/cadastros/funcionarios.vue')
                },
                {
                    path: '/cadastros/produtos',
                    name: 'cadastros de Produtos',
                    component: () => import('@/views/cadastros/produtos.vue')
                },
                {
                    path: '/cadastros/usuarios/web',
                    name: 'Cadastro Usuario',
                    component: () => import('@/views/cadastros/usuarios/web.vue')
                },
                {
                    path: '/cadastros/usuarios/avulsa',
                    name: 'Cadastro Liberação Avulsa',
                    component: () => import('@/views/cadastros/usuarios/Avulsa.vue')
                },
                {
                    path: '/cadastros/usuarios/dm',
                    name: 'Cadastro DM',
                    component: () => import('@/views/cadastros/usuarios/dm.vue')
                },
                {
                    path: '/cadastros/cdc',
                    name: 'Cadastro de Centro de Custo',
                    component: () => import('@/views/cadastros/cdc.vue')
                },
                {
                    path: '/cadastros/funcao',
                    name: 'Cadastro de Função',
                    component: () => import('@/views/cadastros/funcao.vue')
                },
                {
                    path: '/cadastros/planta',
                    name: 'Cadastro de Plantas',
                    component: () => import('@/views/cadastros/planta.vue')
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
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
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

export default router;
