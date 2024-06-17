<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-chart-pie',
                to: '/'
            },
            {
                label: 'Relatorios',
                icon: 'pi pi-fw pi-list',
                items: [
                    { label: 'Retiradas Realizadas', to: '', disabled: true },
                    { label: 'Estoques da DM', to: '', disabled: true },
                    { label: 'Itens Mais Retirados', to: '', disabled: true },
                    { label: 'Retirada Avulsas por Exceções/Voucher', to: '', disabled: true },
                    { label: 'Historico de Abastecimento', to: '', disabled: true },
                    { label: 'Status DM', to: '', disabled: true },
                    { label: 'Fichas Retiradas', to: '', disabled: true },
                    { label: 'Log', to: '', disabled: true },
                ]
            },
            {
                label: 'Configurações',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Lista de DM', to: '', disabled: true },
                    { label: 'Liberação A vulsa', to: '', disabled: true },
                    { label: 'Tema', to: '', disabled: true }
                ]
            },
            {label: 'Importações',icon: 'pi pi-fw pi-upload',to: '', disabled: true },
            {
                label: 'EndPoints',
                icon: 'pi pi-fw pi-cloud',
                items:[
                    { label: 'Entrada', to :'' , disabled:true},
                    { label: 'Saida', to :'' , disabled:true},
                ]
            },
            {
                label: 'Cadastros',
                icon: 'pi pi-fw pi-user-plus',
                items:[
                    { label: 'Funcionarios', to :'/cadastros/funcionarios' , disabled:false},
                    { label: 'Usuarios', to :'' , disabled:true},
                    { label: 'Centro de Custo', to :'' , disabled:true},
                    { label: 'Setor/Diretoria', to :'' , disabled:true},
                    { label: 'Função/Nivel Hierarquico', to :'' , disabled:true},
                    { label: 'Planta', to :'' , disabled:true},
                    { label: 'Produto', to :'' , disabled:true},
                ]
            },
            
        ]
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
