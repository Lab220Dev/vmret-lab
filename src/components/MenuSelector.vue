<template>
    <div>
        <h4>Selecione os Menus:</h4>
        <div v-for="(menu, index) in filteredMenus" :key="index" class="menu-checkbox">
            <Checkbox v-model="selectedMenus" :value="menu.name" />
            <label>{{ menu.name }}</label>

            <!-- Exibir Submenus -->
            <div v-if="selectedMenus.includes(menu.name)" class="submenu-checkbox">
                <div v-for="submenu in menu.submenus" :key="submenu.name">
                    <Checkbox v-model="selectedSubmenus" :value="submenu.name" />
                    <label>{{ submenu.name }}</label>

                    <!-- Exibir Submenus de Submenus -->
                    <div v-if="selectedSubmenus.includes(submenu.name)" class="subsubmenu-checkbox">
                        <div v-for="subsubmenu in submenu.subsubmenus" :key="subsubmenu.name">
                            <Checkbox v-model="selectedSubsubmenus" :value="subsubmenu.name" />
                            <label>{{ subsubmenu.name }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    selectedPerfil: Number,
});

const selectedMenus = ref([]);
const selectedSubmenus = ref([]);
const selectedSubsubmenus = ref([]);

const menus = {
    1: [ // Master
        {
            name: "Relatórios",
            submenus: [
                {
                    name: "Estoque",
                    subsubmenus: [{ name: "Estoque da DM" }]
                },
                {
                    name: "Retiradas e Devoluções",
                    subsubmenus: [{ name: "Retiradas Realizadas" },
                    { name: "Itens Mais Retirados" },
                    { name: "Retirada Avulsas por Exceções/Voucher" },
                    { name: "Fichas de Retiradas" },
                    { name: "Devoluções" }]
                },
                {
                    name: "Operacional",
                    subsubmenus: [{ name: "Histórico de Abastecimento" },
                    { name: "Status DM" },
                    { name: "Log" }]
                }
            ]
        }, {
            name: "Configurações",
            submenus: [
                {
                    name: "Lista de DM"
                },
                {
                    name: "Liberação Avulsa",
                },
                {
                    name: "Tema",
                },
                {
                    name: "Termo de compromisso - Ficha Retirada",
                }
            ]
        }, {
            name: "Importações",
            submenus: [
                {
                    name: "Importações"
                }
            ]
        }, {
            name: "EndPoints",
            submenus: [
                {
                    name: "Entrada"
                },
                {
                    name: "Saída"
                }
            ]
        }, {
            name: "Cadastros",
            submenus: [
                {
                    name: "Funcionários"
                },
                {
                    name: "Usuários",
                    subsubmenus: [
                        { name: "Usuário WEB" },
                        { name: "Usuários DMs" },
                        { name: "Liberação Avulsa" }]
                },
                {
                    name: "Centros de Custo"
                },
                {
                    name: "Setor/Diretoria",
                },
                {
                    name: "Função/Nível Hierárquico"
                },
                {
                    name: "Plantas"
                },
                {
                    name: "Produtos"
                }
            ]
        },
    ],
    3: [ // Operador
        {
            name: "Relátorios",
            submenus: [
                {
                    name: "Estoque",
                    subsubmenus: [{ name: "Estoque da DM" }]
                },
                {
                    name: "Operacional",
                    subsubmenus: [{ name: "Status da DM" }]
                },
                {
                    name: "Retiradas e Devoluções",
                    subsubmenus: [{ name: "Retiradas Realizadas" },
                    { name: "Itens Mais Retirados" },
                    { name: "Devoluções" },]
                }
            ]
        }, {
            name: "Dispenser Machines",
            submenus: [
                { name: "Lista de Itens não Alocados" },
                { name: "Lista de DMs" }
            ]
        }, {
            name: "Produtos",
            submenus: [
                { name: "Lista de Produtos" }
            ]
        },
        // Outros menus para Operador
    ],
    4: [ // Avulso
        {
            name: "Liberação Avulsa"
        },
        {
            name: "Consultar Status de Liberação Avulsa"
        }
    ]
};
console.log('selectedPerfil:', props.selectedPerfil);
const filteredMenus = computed(() => {
    // Logando os menus filtrados para verificar se estão sendo retornados corretamente
    const result = menus[props.selectedPerfil] || [];
    console.log('filteredMenus:', result);
    return result;
});

const emits = defineEmits(['update:selectedMenus', 'update:selectedSubmenus', 'update:selectedSubsubmenus']);

watch([selectedMenus, selectedSubmenus, selectedSubsubmenus], () => {
    console.log('selectedMenus:', selectedMenus.value);
    console.log('selectedSubmenus:', selectedSubmenus.value);
    console.log('selectedSubsubmenus:', selectedSubsubmenus.value);

    emits('update:selectedMenus', selectedMenus.value);
    emits('update:selectedSubmenus', selectedSubmenus.value);
    emits('update:selectedSubsubmenus', selectedSubsubmenus.value);
}, { deep: true });
</script>

<style scoped>
.menu-checkbox,
.submenu-checkbox,
.subsubmenu-checkbox {
    margin-bottom: 10px;
    margin-left: 20px;
}
</style>