<template>
    <div class="card">  <!-- Card principal -->
        <div class="container flex justify-content-between align-items-center" style="width: 100%"> <!-- Container com layout flexível -->
            <h4 class="ml-3" style="white-space: nowrap">{{ t('select_menu') }}:</h4>   <!-- Título do card -->
            <div class="button-container">  <!-- Container para os botões -->
                <Button class="mr-2 mt-5 mb-4" @click="toggleSelectAll(true)">{{ t('select_all') }}</Button>    <!-- Botão para selecionar todos -->
                <Button class="mt-5 mb-4" @click="toggleSelectAll(false)">{{ t('deselect') }}</Button>  <!-- Botão para desmarcar todos -->
            </div>
        </div>
        <!-- Menus Principais -->
        <!-- Menu em 3 colunas -->
        <div class="menu-grid mt-6">
            <div v-for="(menu, index) in filteredMenus" :key="index" class="menu-column">   <!-- Itera sobre os menus filtrados -->
                <div class="menu-checkbox"> <!-- Container do menu -->
                    <Checkbox class="mb-3" v-model="selectedMenus" :value="menu.name" />    <!-- Checkbox para selecionar o menu -->
                    <label class="mx-1 mb-3 inline-flex">{{ menu.name }}</label>    <!-- Exibe o nome do menu -->

                    <!-- Exibir Submenus -->
                    <div v-if="selectedMenus.includes(menu.name)" class="submenu-checkbox"> <!-- Exibe os submenus se o menu estiver selecionado -->
                        <div v-for="submenu in menu.submenus" :key="submenu.name">  <!-- Itera sobre os submenus do menu -->
                            <Checkbox class="mb-3" v-model="selectedSubmenus" :value="submenu.name" />  <!-- Checkbox para selecionar o submenu -->
                            <label class="mx-1 mb-3 inline-flex">{{ submenu.name }}</label> <!-- Exibe o nome do submenu -->

                            <!-- Exibir Subsubmenus -->
                            <div v-if="selectedSubmenus.includes(submenu.name)" class="subsubmenu-checkbox">    <!-- Exibe os subsubmenus se o submenu estiver selecionado -->
                                <div v-for="subsubmenu in submenu.subsubmenus" :key="subsubmenu.name">  <!-- Itera sobre os subsubmenus do submenu -->
                                    <Checkbox class="mb-3" v-model="selectedSubsubmenus" :value="subsubmenu.name" />    <!-- Checkbox para selecionar o subsubmenu -->
                                    <label class="mx-1 mb-3 inline-flex">{{ subsubmenu.name }}</label>  <!-- Exibe o nome do subsubmenu -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mr-1 mt-8 grid justify-content-end"><Button class="botao" v-if="selectedPerfil" :label="t('saveMenu')" @click="submitMenu" /></div> <!-- Botão para salvar as seleções -->
    </div>
</template>

<script setup>  // Importa as funções 'defineProps' e 'useI18n' do Vue para criação de propriedades e internacionalização
import { ref, computed, watch, onMounted } from 'vue'; //reactive e ref são usados para reatividade, onMounted é um hook(função especial) para executar
import axios from '@/axios.js'; //Instância configurada do Axios para fazer requisições HTTP
import { useToast } from 'primevue/usetoast'; //Função para mostrar notificações
import { useI18n } from 'vue-i18n'; //Função para internacionalização
const { t } = useI18n();
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

const toast = useToast(); //toast para exibir mensagens de erro ou sucesso

const selectedMenus = ref([]); // Variável reativa para armazenar os menus selecionados (inicialmente um array vazio)
const selectedSubmenus = ref([]); // Variável reativa para armazenar os submenus selecionados (inicialmente um array vazio)
const selectedSubsubmenus = ref([]); // Variável reativa para armazenar os subsubmenus selecionados (inicialmente um array vazio)

const structuredMenus = ref([]); // Armazena a estrutura completa de menus (principal, submenus e subsubmenus). Inicialmente é um array vazio.

const menus = computed(() => ({
    //'menus' cria a estrutura conforme o identificador do perfil
    1: [
        // Master
        {
            name: t('relatorios'),
            submenus: [
                {
                    name: t('estoque'),
                    subsubmenus: [{ name: t('estoque_da_dm') }]
                },
                {
                    name: t('retiradas_e_devolucoes'),
                    subsubmenus: [{ name: t('retiradas_realizadas') }, { name: t('itens_mais_retirados') }, { name: t('retirada_avulsas_por_excecoes') }, { name: t('fichas_de_retiradas') }, { name: t('devolucoes') }]
                },
                {
                    name: t('operacional'),
                    subsubmenus: [{ name: t('historico_de_abastecimento') }, { name: t('status_dm') }, { name: t('log') }]
                }
            ]
        },
        {
            name: t('cadastros'),
            submenus: [
                { name: t('funcionarios') },
                {
                    name: t('usuarios'),
                    subsubmenus: [{ name: t('usuarios_web') }, { name: t('usuarios_dms') }, { name: t('liberacao_avulsa') }]
                },
                { name: t('centros_de_custo') },
                { name: t('setor_diretoria') },
                { name: t('funcao_nivel_hierarquico') },
                { name: t('plantas') },
                { name: t('produtos') }
            ]
        },
        {
            name: t('endpoints'),
            submenus: [{ name: t('entrada') }, { name: t('saida') }]
        },
        {
            name: t('importacoes'),
            submenus: [{ name: t('importacoes') }]
        },
        {
            name: t('configuracoes'),
            submenus: [{ name: t('lista_de_dm') }, { name: t('liberacao_avulsa') }, { name: t('cadastro_de_servicos') }, { name: t('gerenciamento_de_videos') }, { name: t('termo_de_compromisso') }]
        }
    ],
    3: [
        // Operador
        {
            name: t('relatorios'),
            submenus: [
                {
                    name: t('estoque'),
                    subsubmenus: [{ name: t('estoque_da_dm') }]
                },
                {
                    name: t('operacional'),
                    subsubmenus: [{ name: t('status_dm') }]
                },
                {
                    name: t('retiradas_e_devolucoes'),
                    subsubmenus: [{ name: t('retiradas_realizadas') }, { name: t('itens_mais_retirados') }, { name: t('devolucoes') }]
                }
            ]
        },
        {
            name: t('dispenser_machines'),
            submenus: [{ name: t('unallocated_items_list') }, { name: t('lista_dms') }]
        },
        {
            name: t('produtos'),
            submenus: [{ name: t('list_products') }]
        }
    ],
    4: [
        // Avulso
        {
            name: t('liberacao_avulsa'),
            submenus: []
        },
        {
            name: t('check_one_time_release_status'),
            submenus: []
        }
    ]
}));

const filteredMenus = computed(() => menus.value[props.selectedPerfil] || []); //menus filtrados conforme o perfil selecionado

onMounted(() => {
  const menus = props.initialMenus || []; // já é um array
  if (menus.length > 0) {
    menus.forEach((menu) => {
            if (!selectedMenus.value.includes(menu.name)) {
                selectedMenus.value.push(menu.name);
            }
            menu.submenus?.forEach((submenu) => {
                if (!selectedSubmenus.value.includes(submenu.name)) {
                    selectedSubmenus.value.push(submenu.name);
                }
                submenu.subsubmenus?.forEach((subsubmenu) => {
                    if (!selectedSubsubmenus.value.includes(subsubmenu.name)) {
                        selectedSubsubmenus.value.push(subsubmenu.name);
                    }
                });
            });
        });
        buildStructuredMenus();
    }
});



/**
 * Estrutura os menus selecionados de forma hierárquica.
 * Filtra os menus, submenus e subsubmenus de acordo com os itens selecionados.
 *
 * @returns {void}
 */
const buildStructuredMenus = () => {
    structuredMenus.value = filteredMenus.value
        .filter((menu) => selectedMenus.value.includes(menu.name))
        .map((menu) => {
            const structuredSubmenus = menu.submenus
                .filter((submenu) => selectedSubmenus.value.includes(submenu.name))
                .map((submenu) => {
                    const structuredSubsubmenus = submenu.subsubmenus ? submenu.subsubmenus.filter((subsubmenu) => selectedSubsubmenus.value.includes(subsubmenu.name)) : [];
                    return { ...submenu, subsubmenus: structuredSubsubmenus };
                });
            return { ...menu, submenus: structuredSubmenus };
        });
};

const submitMenu = async () => {
    //função para enviar os menus selecionados para o servidor
    const data = {
        // Cria um objeto `data` com os dados necessários para enviar ao servidor
        id_cliente: props.id_cliente, // ID do cliente
        perfil: props.selectedPerfil, // Perfil selecionado
        menus: structuredMenus.value // Menus estruturados que serão enviados
    };

    try {
        await axios.post('/admin/cliente/salvarMenus', data); // Envia os dados para a API utilizando o Axios, que foi previamente configurado para as requisições HTTP
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações de menu salvas com sucesso.', life: 3000 }); // Exibe uma notificação de sucesso ao usuário após a requisição ser bem-sucedida
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações de menu.', life: 3000 }); // Exibe uma notificação de erro caso a requisição falhe
        console.error('Erro ao salvar menus:', error); // Loga o erro no console para depuração
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
    selectedMenus.value = selectAll ? filteredMenus.value.map((menu) => menu.name) : []; // Se `selectAll` for verdadeiro, seleciona todos os menus filtrados; caso contrário, limpa a seleção
    selectedSubmenus.value = selectAll // Se `selectAll` for verdadeiro, seleciona todos os submenus de todos os menus filtrados
        ? filteredMenus.value.flatMap((menu) => menu.submenus.map((submenu) => submenu.name))
        : [];

    selectedSubsubmenus.value = selectAll // Se `selectAll` for verdadeiro, seleciona todos os subsubmenus de todos os submenus de todos os menus filtrados
        ? filteredMenus.value.flatMap((menu) => menu.submenus.flatMap((submenu) => (submenu.subsubmenus || []).map((subsubmenu) => subsubmenu.name)))
        : [];

    buildStructuredMenus(); // Atualiza a estrutura hierárquica de menus com base nas seleções
};

const emits = defineEmits(['update:structuredMenus']); // Função para emitir eventos para o componente pai

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
/* Menu em 2 colunas */
.menu-grid {    /* Define o estilo do grid de menus */
    display: flex;  /* Exibe os itens em linha */
    flex-wrap: wrap;    /* Quebra a linha se não houver espaço suficiente */
    justify-content: left;      /* Alinha os itens à esquerda */
    gap: 20px; /* Espaçamento entre os itens */
    margin-left: 20px;  /* Margem à esquerda */
}

.menu-column {
    flex-basis: 40%; /* Cada coluna ocupa 30% da largura */
    max-width: 50%; /* Largura máxima de 50% */
}

.submenu-checkbox,
.subsubmenu-checkbox {  /* Define o estilo dos submenus e subsubmenus */
    margin-bottom: 10px;    /* Espaçamento inferior */
    margin-left: 20px;  /* Margem à esquerda */
}

.botao {    /* Define o estilo do botão */
    background-color: #0ea5e9;  /* Cor de fundo */
    border-color: #2dabe6;  /* Cor da borda */
}
</style>
