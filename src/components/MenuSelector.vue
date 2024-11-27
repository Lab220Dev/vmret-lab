<template>
    <div class="card">
        <div class="container flex justify-content-between align-items-center" style="width: 100%;">
        <h4 class="ml-3" style="white-space: nowrap;">Selecione os Menus:</h4>
        <div class="button-container">
            <Button class="mr-2 mt-5 mb-4" @click="toggleSelectAll(true)">Selecionar Todos</Button>
            <Button class="mt-5 mb-4" @click="toggleSelectAll(false)">Desselecionar Todos</Button>
        </div>
    </div>
        <!-- Menus Principais -->
        <!-- Menu em 3 colunas -->
        <div class="menu-grid mt-6 ">
            <div v-for="(menu, index) in filteredMenus" :key="index" class="menu-column">
                <div class="menu-checkbox">
                    <Checkbox class="mb-3" v-model="selectedMenus" :value="menu.name" />
                    <label class="mx-1 mb-3 inline-flex">{{ menu.name }}</label>

                    <!-- Exibir Submenus -->
                    <div v-if="selectedMenus.includes(menu.name)" class="submenu-checkbox">
                        <div v-for="submenu in menu.submenus" :key="submenu.name">
                            <Checkbox class="mb-3" v-model="selectedSubmenus" :value="submenu.name" />
                            <label class="mx-1 mb-3 inline-flex">{{ submenu.name }}</label>

                            <!-- Exibir Subsubmenus -->
                            <div v-if="selectedSubmenus.includes(submenu.name)" class="subsubmenu-checkbox">
                                <div v-for="subsubmenu in submenu.subsubmenus" :key="subsubmenu.name">
                                    <Checkbox class="mb-3" v-model="selectedSubsubmenus" :value="subsubmenu.name" />
                                    <label class="mx-1 mb-3 inline-flex">{{ subsubmenu.name }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mr-1 mt-8 grid justify-content-end"><Button class="botao" v-if="selectedPerfil" label="Salvar Configurações" @click="submitMenu" /></div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from '@/axios.js';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    selectedPerfil: Number,
    initialMenus: Array,
    id_cliente:Number
});

const toast = useToast();
const selectedMenus = ref([]);
const selectedSubmenus = ref([]);
const selectedSubsubmenus = ref([]);

// Esta nova ref armazenará a estrutura hierárquica dos menus, submenus e subsubmenus
const structuredMenus = ref([]);

const menus = {
    1: [
        // Master
        {
            name: 'Relatórios',
            submenus: [
                {
                    name: 'Estoque',
                    subsubmenus: [{ name: 'Estoque da DM' }]
                },
                {
                    name: 'Retiradas e Devoluções',
                    subsubmenus: [{ name: 'Retiradas Realizadas' }, { name: 'Itens Mais Retirados' }, { name: 'Retirada Avulsas por Exceções' }, { name: 'Fichas de Retiradas' }, { name: 'Devoluções' }]
                },
                {
                    name: 'Operacional',
                    subsubmenus: [{ name: 'Histórico de Abastecimento' }, { name: 'Status DM' }, { name: 'Log' }]
                }
            ]
        },
        {
            name: 'Cadastros',
            submenus: [
                { name: 'Funcionários' },
                {
                    name: 'Usuários',
                    subsubmenus: [{ name: 'Usuário WEB' }, { name: 'Usuários DMs' }, { name: 'Liberação Avulsa' }]
                },
                { name: 'Centros de Custo' },
                { name: 'Setor/Diretoria' },
                { name: 'Função/Nível Hierárquico' },
                { name: 'Plantas' },
                { name: 'Produtos' }
            ]
        },
        {
            name: 'EndPoints',
            submenus: [{ name: 'Entrada' }, { name: 'Saída' }]
        },
        {
            name: 'Importações',
            submenus: [{ name: 'Importações' }]
        },
        {
            name: 'Configurações',
            submenus: [{ name: 'Lista de DM' }, { name: 'Liberação Avulsa' }, { name: 'Gerenciamento de Serviços' }, { name: 'Cadastro de Video' }, { name: 'Termo de compromisso' }]
        }
    ],
    3: [
        // Operador
        {
            name: 'Relatórios',
            submenus: [
                {
                    name: 'Estoque',
                    subsubmenus: [{ name: 'Estoque da DM' }]
                },
                {
                    name: 'Operacional',
                    subsubmenus: [{ name: 'Status da DM' }]
                },
                {
                    name: 'Retiradas e Devoluções',
                    subsubmenus: [{ name: 'Retiradas Realizadas' }, { name: 'Itens Mais Retirados' }, { name: 'Devoluções' }]
                }
            ]
        },
        {
            name: 'Dispenser Machines',
            submenus: [{ name: 'Lista de Itens não Alocados' }, { name: 'Lista de DMs' }]
        },
        {
            name: 'Produtos',
            submenus: [{ name: 'Lista de Produtos' }]
        }
    ],
    4: [
        // Avulso
        {
            name: 'Liberação Avulsa',
            submenus: []
        },
        {
            name: 'Consultar Status de Liberação Avulsa',
            submenus: []
        }
    ]
};

const filteredMenus = computed(() => menus[props.selectedPerfil] || []);

// Função para inicializar seleções baseadas nos menus recebidos
onMounted(() => {
    if (props.initialMenus) {
        props.initialMenus.forEach((menu) => {
            if (!selectedMenus.value.includes(menu.name)) {
                selectedMenus.value.push(menu.name);
                menu.submenus?.forEach((submenu) => {
                    selectedSubmenus.value.push(submenu.name);
                    submenu.subsubmenus?.forEach((subsubmenu) => {
                        selectedSubsubmenus.value.push(subsubmenu.name);
                    });
                });
            }
        });
    }
});

// Função para estruturar os menus selecionados em um formato hierárquico
const buildStructuredMenus = () => {
    structuredMenus.value = filteredMenus.value
        .filter((menu) => selectedMenus.value.includes(menu.name)) // Inclui apenas menus selecionados
        .map((menu) => {
            const structuredSubmenus = menu.submenus
                .filter((submenu) => selectedSubmenus.value.includes(submenu.name)) // Inclui apenas submenus selecionados
                .map((submenu) => {
                    const structuredSubsubmenus = submenu.subsubmenus
                        ? submenu.subsubmenus.filter((subsubmenu) => selectedSubsubmenus.value.includes(subsubmenu.name)) // Inclui apenas subsubmenus selecionados
                        : [];
                    return { ...submenu, subsubmenus: structuredSubsubmenus };
                });
            return { ...menu, submenus: structuredSubmenus };
        });
};


const submitMenu = async () => {
    const data = {
        id_cliente: props.id_cliente,
        perfil: props.selectedPerfil,
        menus: structuredMenus.value
    };

    //loading.value = true;
    try {
        await axios.post('/admin/cliente/salvarMenus', data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações de menu salvas com sucesso.', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações de menu.', life: 3000 });
        console.error('Erro ao salvar menus:', error);
    } finally {
       // loading.value = false;
    }
};

const toggleSelectAll = (selectAll) => {
    selectedMenus.value = selectAll ? filteredMenus.value.map((menu) => menu.name) : [];
    selectedSubmenus.value = selectAll ? filteredMenus.value.flatMap((menu) => menu.submenus.map((submenu) => submenu.name)) : [];
    selectedSubsubmenus.value = selectAll ? filteredMenus.value.flatMap((menu) => menu.submenus.flatMap((submenu) => (submenu.subsubmenus || []).map((subsubmenu) => subsubmenu.name))) : [];

    buildStructuredMenus(); // Atualizar a estrutura hierárquica
};

const emits = defineEmits(['update:structuredMenus']);

watch(
    [selectedMenus, selectedSubmenus, selectedSubsubmenus],
    () => {
        buildStructuredMenus();
        console.log('Emitting Structured Menus:', structuredMenus.value);
        emits('update:structuredMenus', structuredMenus.value);
    },
    { deep: true }
);
</script>

<style scoped>
/* Menu em 3 colunas */
.menu-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: left; 
    gap: 20px; /* Espaçamento entre os itens */
    margin-left: 20px;
}

.menu-column {
    flex-basis: 40%; /* Cada coluna ocupa 30% da largura */
    max-width: 50%;
}


.submenu-checkbox,
.subsubmenu-checkbox {
    margin-bottom: 10px;
    margin-left: 20px;
}

.botao {
    background-color: #0ea5e9;
    border-color: #2dabe6;
}
</style>
