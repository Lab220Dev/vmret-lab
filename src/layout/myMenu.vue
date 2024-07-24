<script setup>
import { ref,onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';
import AppMenuItem from './AppMenuItem.vue';

const model2 = ref([
    {
        "items": [
        {
            "label": "Dashboard",
            "icon": "pi pi-fw pi-chart-pie",
            "to": null
        },
        {
            "label": "Relatórios",
            "icon": "pi pi-fw pi-list",
            "to": null,
            "items": [
                {
                    "label": "Retiradas Realizadas",
                    "icon": null,
                    "to": "/relatorios/retiradasrealizadas"
                },
                {
                    "label": "Estoques da DM",
                    "icon": null,
                    "to": "/relatorios/estoquedm"
                },
                {
                    "label": "Itens Mais Retirados",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Retirada Avulsas por Exceções/Voucher",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Historico de Abastecimento",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Status DM",
                    "icon": null,
                    "to": "/relatorios/statusdm"
                },
                {
                    "label": "Fichas Retiradas",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Log",
                    "icon": null,
                    "to": null
                }
            ]
        },
        {
            "label": "Configurações",
            "icon": "pi pi-fw pi-cog",
            "to": null,
            "items": [
                {
                    "label": "Lista de DM",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Liberação Avulsa",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Tema",
                    "icon": null,
                    "to": null
                }
            ]
        },
        {
            "label": "Importações",
            "icon": "pi pi-fw pi-upload",
            "to": null,
            "items": [
                {
                    "label": "Importações",
                    "icon": null,
                    "to": null
                }
            ]
        },
        {
            "label": "EndPoints",
            "icon": "pi pi-fw pi-cloud",
            "to": null,
            "items": [
                {
                    "label": "Entrada",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Saida",
                    "icon": null,
                    "to": null
                }
            ]
        },
        {
            "label": "Cadastros",
            "icon": "pi pi-fw pi-user-plus",
            "to": null,
            "items": [
                {
                    "label": "Funcionários",
                    "icon": null,
                    "to": "/cadastros/funcionarios"
                },
                {
                    "label": "Usuários",
                    "icon": null,
                    "to": null,
                    "items": [
                        {
                            "label": "Usuário WEB",
                            "icon": null,
                            "to": "/cadastros/usuarios/Web"
                        },
                        {
                            "label": "Liberação avulsa",
                            "icon": null,
                            "to": "/cadastros/usuarios/Avulsa"
                        },
                        {
                            "label": "DM",
                            "icon": null,
                            "to": "/cadastros/usuarios/DM"
                        }
                    ]
                },
                {
                    "label": "Centro de Custo",
                    "icon": null,
                    "to": "/cadastros/cdc"
                },
                {
                    "label": "Setor/Diretoria",
                    "icon": null,
                    "to": null
                },
                {
                    "label": "Função/Nivel Hierarquico",
                    "icon": null,
                    "to": "/cadastros/funcao"
                },
                {
                    "label": "Planta",
                    "icon": null,
                    "to": "/cadastros/planta"
                },
                {
                    "label": "Produtos",
                    "icon": null,
                    "to": "/cadastros/produtos"
                }
            ]
        }
    ]
    },


]);
const store = useAuthStore();
const model= ref([{items:[]}])

const buildMenu = () => {
    model.value = [
        {
            items: store.menuItems
        }
    ];
};
onMounted(() => {
    buildMenu();
});
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
