<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-chart-pie',
                to: '/dashboard'
            },
            {
                label: 'Relatórios',
                icon: 'pi pi-fw pi-list',
                items: [
                    { label: 'Retiradas Realizadas', to: '/relatorios/retiradasrealizadas', disabled: false },
                    { label: 'Estoques da DM', to: '/relatorios/estoquedm', disabled: false },
                    { label: 'Itens Mais Retirados', to: 'relatorios/itemsmaisretirados', disabled: false },
                    { label: 'Retirada Avulsas por Exceções/Voucher', to: '', disabled: true },
                    { label: 'Histórico de Abastecimento', to: '', disabled: true },
                    { label: 'Status DM', to: '/relatorios/statusdm', disabled: false },
                    { label: 'Fichas Retiradas', to: '', disabled: true },
                    { label: 'Log', to: '', disabled: true },
                ]
            },
            {
                label: 'Configurações',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Lista de DM', to: '', disabled: true },
                    { label: 'Liberação Avulsa', to: '', disabled: true },
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
                    { label: 'Funcionários', to :'/cadastros/funcionarios' , disabled:false},
                    { label: 'Usuários',
                      to :'' ,
                      items:[
                        {label:'Usuários Web', to:'/cadastros/usuarios/Web', disabled:false},
                        {label:'Liberação Avulsa', to:'/cadastros/usuarios/Avulsa', disabled:false},
                        {label:'DM', to:'/cadastros/usuarios/DM', disabled:false},
                      ]},
                    { label: 'Centros de Custo', to :'/cadastros/cdc' , disabled:false},
                    { label: 'Setor/Diretoria', to :'/cadastros/setor' , disabled:true},
                    { label: 'Função/Nível Hierárquico', to :'/cadastros/funcao' , disabled:false},
                    { label: 'Plantas', to :'/cadastros/planta' , disabled:false},
                    { label: 'Produtos', to :'/cadastros/produtos' , disabled:false},
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
