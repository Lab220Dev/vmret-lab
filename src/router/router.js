import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
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
                    name: 'cadastros de funcionarios',
                    component: () => import('@/views/cadastros/funcionarios.vue')
                },

                {
                    path: '/cadastros/usuarios/web',
                    name: 'overlay',
                    component: () => import('@/views/cadastros/usuarios/web.vue')
                },
                {
                    path: '/cadastros/usuarios/avulsa',
                    name: 'media',
                    component: () => import('@/views/cadastros/usuarios/Avulsa.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
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
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/utilities/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
