<template>
    <div>
      <h4>Selecione os Menus:</h4>
      <Button @click="toggleSelectAll(true)">Selecionar Todos</Button>
      <Button @click="toggleSelectAll(false)">Desselecionar Todos</Button>
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
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  selectedPerfil: Number,
  initialMenus: Array 
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

const filteredMenus = computed(() => menus[props.selectedPerfil] || []);

// Função para inicializar seleções baseadas nos menus recebidos
onMounted(() => {
  if (props.initialMenus) {
    props.initialMenus.forEach(menu => {
      if (!selectedMenus.value.includes(menu.name)) {
        selectedMenus.value.push(menu.name);
        menu.submenus?.forEach(submenu => {
          selectedSubmenus.value.push(submenu.name);
          submenu.subsubmenus?.forEach(subsubmenu => {
            selectedSubsubmenus.value.push(subsubmenu.name);
          });
        });
      }
    });
  }
});

const toggleSelectAll = (selectAll) => {
  selectedMenus.value = selectAll ? filteredMenus.value.map(menu => menu.name) : [];
  selectedSubmenus.value = selectAll 
    ? filteredMenus.value.flatMap(menu => menu.submenus.map(submenu => submenu.name)) 
    : [];
  selectedSubsubmenus.value = selectAll 
    ? filteredMenus.value.flatMap(menu => menu.submenus.flatMap(submenu => submenu.subsubmenus.map(subsubmenu => subsubmenu.name))) 
    : [];
};

const emits = defineEmits(['update:selectedMenus', 'update:selectedSubmenus', 'update:selectedSubsubmenus']);

watch([selectedMenus, selectedSubmenus, selectedSubsubmenus], () => {
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