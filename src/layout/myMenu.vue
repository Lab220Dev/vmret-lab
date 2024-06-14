<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Menu',
        items: [
            { label: 'Dashboard',
             icon: 'pi pi-fw pi-chart-pie', 
             items:[
             {label: 'Retiradas Realizadas',  to: '',   disabled: true},
             {label: 'Estoques da DM',  to: '', disabled: true },
             {label: 'Metricas da VM', to: '', disabled: true },
             {label: 'Itens Mais Retirados', to: '', disabled: true },
             {label: 'Performace por VM', to: '', disabled: true },
             {label: 'Performace por Horario', to: '', disabled: true },
             {label: 'Status da VM', to: '', disabled: true },
             {label: 'Fichas Retiradas', to: '', disabled: true },

             ]
            },
            {
                label: 'Vending Machines',
                icon: 'pi pi-fw pi-book',

                items: [
                    { label: 'Lista de Itens Não Alocados', to: '', disabled: true },
                    { label: 'Lista de VMs', to: '', disabled: true }
                ]
            }, {
                label: 'Funcionarios', icon: 'pi pi-fw pi-users',
                items: [
                    { label: 'Lista de Funcionarios', to: '/cadastros/funcionarios', disabled: true },
                    { label: 'Adicionar Funcionarios', disabled: true }
                ]
            },
            {
                label: 'Empresa',
                icon: 'pi pi-fw pi-building',
                items: [
                    {
                        label: 'Lista de Usuarios WEB',                       
                        to: '',
                        disabled: false
                    },
                    {
                        label: 'Lista de Usuarios VM',
                        to: '',
                        disabled: true
                    }
                ]
            },
            {
                label: 'CAD Auxiliares Produto',
                icon: 'pi pi-fw pi-list',
                items: [
                    {
                        label: 'Categorias',                       
                        to: '',
                        disabled: false
                    },
                    {
                        label: 'Cores',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Tamanhos',
                        to: '',
                        disabled: true
                    }
                ]
            },
            {
                label: 'CAD Auxiliares Empresas',
                icon: 'pi pi-fw pi-list',
                items: [
                    {
                        label: 'Centro de Custo',                       
                        to: '',
                        disabled: false
                    },
                    {
                        label: 'Setores',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Funções',
                        to: '',
                        disabled: true
                    },
                    {
                        label: 'Plantas',
                        to: '',
                        disabled: true
                    }
                ]
            },
            {
                label: 'Produtoss',
                icon: 'pi pi-fw pi-gift',
                items: [
                    {
                        label: 'Lista de Produto',                       
                        to: '',
                        disabled: false
                    },
                    {
                        label: 'Adicionar Produto',
                        to: '',
                        disabled: true
                    }
                ]
            },
            {
                label: 'Configurações',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Tema',                       
                        to: '',
                        disabled: false
                    },
                    {
                        label: 'Importação de Dados',
                        to: '',
                        disabled: true
                    }
                ]
            }
        
        
        
        
        ]
    },


]);
</script>

<template>
    <ul class="layout-menu">
        <div>

        </div>
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
