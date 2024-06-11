<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Relatorios',
        items: [
            { label: 'Retiradas Realizadas', icon: 'pi pi-fw pi-id-card', to: '/relatorios/retiradasrealizadas' },
            { label: 'Estoques da DM', icon: 'pi pi-fw pi-check-square', to: '/relatorios/estoquedm' },
            { label: 'Itens Mais Retirados', icon: 'pi pi-fw pi-bookmark', to: '/relatorios/itemsmaisretirados' },
            { label: 'Retiradas Avulsas', icon: 'pi pi-fw pi-exclamation-circle', to: '/relatorios/retiradasavulsas' },
            { label: 'Historicos de Abastecimentos', icon: 'pi pi-fw pi-mobile', to: '/relatorios/historicosabastecimento', class: 'rotated-icon' },
            { label: 'Status da DM', icon: 'pi pi-fw pi-table', to: '/relatorios/statusdm' },
            { label: 'Fichas de Retiradas', icon: 'pi pi-fw pi-list', to: '/relatorios/fichasretiradas' },
            { label: 'Logs', icon: 'pi pi-fw pi-share-alt', to: '/relatorios/logs' },
        ]
    },
    {
        label: 'Configurações',
        items: [
            { label: 'Dispenser Machines', icon: 'pi pi-fw pi-eye', to: '/pages/crud', badge: 'NEW' },
            { label: 'Liberação Avulsa', icon: 'pi pi-fw pi-globe', url: 'https://www.primefaces.org/primeblocks-vue', target: '_blank' },
            { label: 'Tema', icon: 'pi pi-fw pi-globe', url: 'https://www.primefaces.org/primeblocks-vue', target: '_blank' }
        ]
    },
    {
        label: 'Importações',
        items: [
            { label: 'Importações', icon: 'pi pi-fw pi-prime', to: '/utilities/icons' },
        ]
    },
    {
        label: 'Cadastros',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'funcionarios',
                icon: 'pi pi-fw pi-globe',
                to: '/cadastros/funcionarios'
            },
            {
                label: 'usuarios',
                icon: 'pi pi-fw pi-pencil',
                items: [
                    {
                        label: 'Web',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/cadastros/web'
                    },
                    {
                        label: 'Liberação Avulsa',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/cadastros/Avulsa'
                    }
                ]
            }, ,
            {
                label: 'DM',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/DM'
            },
            {
                label: 'Centro de Custo',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/cdc'
            },
            {
                label: 'Setor/diretoria',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/setor'
            },
            {
                label: 'Função/Nivel Hierarquico',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/funcao'
            },
            {
                label: 'Planta',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/planta'
            },
            {
                label: 'Produtos',
                icon: 'pi pi-fw pi-bookmark',
                to: '/cadastros/produtos'
            },
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
