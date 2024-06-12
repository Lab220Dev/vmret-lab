<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Menu',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            {
                label: 'Relatorios',
                icon: 'pi pi-fw pi-globe',

                items: [
                    { label: 'Retiradas Realizadas', icon: 'pi pi-fw pi-id-card', to: '', disabled: true },
                    { label: 'Estoques da DM', icon: 'pi pi-fw pi-check-square', to: '', disabled: true },
                    { label: 'Itens Mais Retirados', icon: 'pi pi-fw pi-bookmark', to: '', disabled: true },
                    { label: 'Retiradas Avulsas', icon: 'pi pi-fw pi-exclamation-circle', to: '', disabled: true },
                    { label: 'Historicos de Abastecimentos', icon: 'pi pi-fw pi-mobile', to: '', disabled: true },
                    { label: 'Status da DM', icon: 'pi pi-fw pi-table', to: '', disabled: true },
                    { label: 'Fichas de Retiradas', icon: 'pi pi-fw pi-list', to: '', disabled: true },
                    { label: 'Logs', icon: 'pi pi-fw pi-share-alt', to: '', disabled: true },
                ]
            }, {
                label: 'Configurações', icon: 'pi pi-fw pi-globe',
                items: [
                    { label: 'Dispenser Machines', icon: 'pi pi-fw pi-eye', to: '', disabled: true },
                    { label: 'Liberação Avulsa', icon: 'pi pi-fw pi-globe', target: '_blank', disabled: true },
                    { label: 'Tema', icon: 'pi pi-fw pi-globe', target: '_blank', disabled: true }
                ]
            },
            {
                label: 'Importações',
                icon: 'pi pi-fw pi-prime',
                to: '',
                disabled: true
            },
            {
                label: 'Cadastros',
                icon: 'pi pi-fw pi-briefcase',
                disabled: false,
                items: [
                    {
                        label: 'funcionarios',
                        icon: 'pi pi-fw pi-globe',
                        to: '/cadastros/funcionarios',
                        disabled: false
                    },
                    {
                        label: 'usuarios',
                        icon: 'pi pi-fw pi-pencil',
                        items: [
                            {
                                label: 'Web',
                                icon: 'pi pi-fw pi-bookmark',
                                to: '',
                                disabled: true
                            },
                            {
                                label: 'Liberação Avulsa',
                                icon: 'pi pi-fw pi-bookmark',
                                to: '',
                                disabled: true
                            }
                        ]
                    },
                    {
                        label: 'DM',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Centro de Custo',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Setor/diretoria',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Função/Nivel Hierarquico',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Planta',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Produtos',
                        icon: 'pi pi-fw pi-bookmark',
                        to: ''
                    },
                ]
            }]
    },


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
