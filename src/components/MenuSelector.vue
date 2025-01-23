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
import { ref, computed, watch, onMounted } from 'vue';//reactive e ref são usados para reatividade, onMounted é um hook(função especial) para executar 
import axios from '@/axios.js';//Instância configurada do Axios para fazer requisições HTTP
import { useToast } from 'primevue/usetoast';//Função para mostrar notificações

//definindo as propriedades (props) que o componente irá receber (as props são passadas pelo componente pai)
/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {number} selectedPerfil - Identificador do perfil selecionado.
 * @property {Array} initialMenus - Menus iniciais passados pelo componente pai.
 * @property {number} id_cliente - Identificador único do cliente.
 */
const props = defineProps({
    selectedPerfil: Number, // A propriedade `selectedPerfil` recebe um número (identificador do perfil selecionado)
    initialMenus: Array, // recebe um array de menus iniciais
    id_cliente: Number // `id_cliente` recebe um número (identificador único do cliente)
});

// Usando o `useToast` para criar uma instância que facilita a exibição de notificações na interface do usuário.
// O `toast` é uma função que permite mostrar notificações (como sucesso ou erro) de forma visual.
const toast = useToast(); 

// Criando variáveis reativas (usando `ref`) para armazenar os menus e submenus selecionados.
/**
 * Menus selecionados.
 * 
 * @type {Array<string>}
 */

const selectedMenus = ref([]); // Variável reativa para armazenar os menus selecionados (inicialmente um array vazio)
const selectedSubmenus = ref([]); // Variável reativa para armazenar os submenus selecionados (inicialmente um array vazio)
const selectedSubsubmenus = ref([]); // Variável reativa para armazenar os subsubmenus selecionados (inicialmente um array vazio)

// Definindo uma nova variável reativa para armazenar a estrutura hierárquica dos menus, submenus e subsubmenus.
// A estrutura de menus pode ser complexa, então a utilização de `ref` permite acompanhar mudanças na estrutura como um todo.
const structuredMenus = ref([]); // Armazena a estrutura completa de menus (principal, submenus e subsubmenus). Inicialmente é um array vazio.

const menus = { //'menus' cria a estrutura conforme o identificador do perfil
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

// A função `computed` é usada para criar uma propriedade computada que depende de outras variáveis reativas.
// A propriedade computada `filteredMenus` retorna os menus filtrados com base no perfil selecionado.
// Se `menus[props.selectedPerfil]` não existir ou for undefined, ela retorna um array vazio.
const filteredMenus = computed(() => menus[props.selectedPerfil] || []);

/**
 * Inicializa a seleção de menus, submenus e subsubmenus quando o componente é montado.
 * 
 * Verifica se há menus iniciais passados como propriedades e os seleciona automaticamente.
 * 
 * @returns {void}
 */
onMounted(() => {
    if (props.initialMenus) {    // Verifica se o `props.initialMenus` foi passado (não é null ou undefined)
        props.initialMenus.forEach((menu) => { // Itera sobre os menus recebidos (inicialmente definidos pelo componente pai)
            if (!selectedMenus.value.includes(menu.name)) {// Verifica se o menu já foi selecionado (evitar duplicações)
                selectedMenus.value.push(menu.name); // Adiciona o nome do menu à lista de menus selecionados
                menu.submenus?.forEach((submenu) => { // Verifica se o menu possui submenus
                    selectedSubmenus.value.push(submenu.name); // Adiciona o nome do submenu à lista de submenus selecionados
                    submenu.subsubmenus?.forEach((subsubmenu) => { // Verifica se o submenu possui subsubmenus
                        selectedSubsubmenus.value.push(subsubmenu.name); // Adiciona o nome do subsubmenu à lista de subsubmenus selecionados
                    });
                });
            }
        });
        console.log(props.initialMenus)// Exibe os menus iniciais no console (útil para debug)
    }
});

/**
 * Estrutura os menus selecionados de forma hierárquica.
 * Filtra os menus, submenus e subsubmenus de acordo com os itens selecionados.
 * 
 * @returns {void}
 */
const buildStructuredMenus = () => {
    structuredMenus.value = filteredMenus.value    // Atualiza a variável reativa `structuredMenus` com um array de menus filtrados e estruturados
        .filter((menu) => selectedMenus.value.includes(menu.name))// Filtra os menus, incluindo apenas aqueles cujos nomes estão presentes em `selectedMenus`
        .map((menu) => {
            const structuredSubmenus = menu.submenus // Para cada menu selecionado, filtra e estrutura seus submenus
                .filter((submenu) => selectedSubmenus.value.includes(submenu.name)) // Inclui apenas submenus selecionados
                .map((submenu) => {
                    const structuredSubsubmenus = submenu.subsubmenus // Para cada submenu selecionado, filtra e estrutura seus subsubmenus (se existirem)
                        ? submenu.subsubmenus.filter((subsubmenu) => selectedSubsubmenus.value.includes(subsubmenu.name)) // Inclui apenas subsubmenus selecionados
                        : [];
                    return { ...submenu, subsubmenus: structuredSubsubmenus }; // Retorna o submenu com a lista de subsubmenus filtrados
                });
            return { ...menu, submenus: structuredSubmenus };// Retorna o menu com a lista de submenus filtrados e estruturados
        });
};

/**
 * Envia os dados dos menus e submenus selecionados para o servidor.
 * 
 * Envia uma requisição HTTP POST com as configurações de menu do cliente.
 * Exibe uma notificação de sucesso ou erro após a requisição.
 *
 * @returns {Promise<void>}
 */
const submitMenu = async () => {
    const data = {  // Cria um objeto `data` com os dados necessários para enviar ao servidor
        id_cliente: props.id_cliente, // ID do cliente
        perfil: props.selectedPerfil, // Perfil selecionado
        menus: structuredMenus.value // Menus estruturados que serão enviados
    };
    
    try {
        await axios.post('/admin/cliente/salvarMenus', data); // Envia os dados para a API utilizando o Axios, que foi previamente configurado para as requisições HTTP
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações de menu salvas com sucesso.', life: 3000 });// Exibe uma notificação de sucesso ao usuário após a requisição ser bem-sucedida

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações de menu.', life: 3000 });// Exibe uma notificação de erro caso a requisição falhe
        console.error('Erro ao salvar menus:', error);// Loga o erro no console para depuração

    } finally {
        // O bloco `finally` é usado para garantir que qualquer limpeza necessária ou finalização ocorra (não utilizado neste caso)
    }
};

/**
 * Alterna a seleção de todos os menus, submenus e subsubmenus.
 * 
 * @param {boolean} selectAll - Se `true`, seleciona todos os itens. Se `false`, desmarca todos os itens.
 * @returns {void}
 */
const toggleSelectAll = (selectAll) => {
    selectedMenus.value = selectAll ? filteredMenus.value.map((menu) => menu.name) : [];    // Se `selectAll` for verdadeiro, seleciona todos os menus filtrados; caso contrário, limpa a seleção
    selectedSubmenus.value = selectAll     // Se `selectAll` for verdadeiro, seleciona todos os submenus de todos os menus filtrados
        ? filteredMenus.value.flatMap((menu) => menu.submenus.map((submenu) => submenu.name)) 
        : [];
    
    selectedSubsubmenus.value = selectAll     // Se `selectAll` for verdadeiro, seleciona todos os subsubmenus de todos os submenus de todos os menus filtrados
        ? filteredMenus.value.flatMap((menu) => menu.submenus.flatMap((submenu) => (submenu.subsubmenus || []).map((subsubmenu) => subsubmenu.name))) 
        : [];

    buildStructuredMenus();// Atualiza a estrutura hierárquica de menus com base nas seleções

};

const emits = defineEmits(['update:structuredMenus']);// Função para emitir eventos para o componente pai

/**
 * Observa mudanças nas seleções de menus, submenus e subsubmenus.
 * 
 * Sempre que qualquer uma dessas variáveis mudar, a função `buildStructuredMenus` é chamada
 * para atualizar a estrutura hierárquica dos menus.
 * 
 * @param {Array} selectedMenus - Menus selecionados.
 * @param {Array} selectedSubmenus - Submenus selecionados.
 * @param {Array} selectedSubsubmenus - Subsubmenus selecionados.
 * @returns {void}
 */
watch(
    [selectedMenus, selectedSubmenus, selectedSubsubmenus],
    () => {
        buildStructuredMenus(); // Atualiza a estrutura hierárquica com base nas novas seleções
        console.log('Emitting Structured Menus:', structuredMenus.value); // Loga a estrutura para depuração
        emits('update:structuredMenus', structuredMenus.value); // Emite um evento para o componente pai com os menus atualizados
    },
    { deep: true } // A opção `deep` garante que mudanças profundas em arrays e objetos também sejam observadas
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
