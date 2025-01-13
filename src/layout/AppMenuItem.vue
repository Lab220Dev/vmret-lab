<script setup>
  /**
   * Importa funções necessárias do Vue e outras dependências.
   * @module
   */
  import { ref, onBeforeMount, watch } from 'vue'; // 'ref' para reatividade, 'onBeforeMount' para execução antes da montagem do componente, 'watch' para observar mudanças em dados reativos
  import { useRoute } from 'vue-router'; // Função para acessar as informações da rota atual
  import { useLayout } from '@/layout/composables/layout'; // Função personalizada para obter as configurações e o estado do layout

  /**
   * Obtém a rota atual da aplicação.
   * @constant {RouteLocationNormalized} route - Objeto da rota atual da aplicação.
   */
  const route = useRoute();

  /**
   * Desestrutura as funções e dados do layout.
   * @constant {Object} layoutConfig - Contém configurações do layout.
   * @constant {Object} layoutState - Contém o estado atual do layout.
   * @function setActiveMenuItem - Função para definir o item de menu ativo.
   * @function onMenuToggle - Função para alternar a visibilidade do menu.
   */
  const { layoutConfig, layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

  /**
   * Definição das propriedades do componente.
   * @typedef {Object} Props
   * @property {Object} item - Item do menu.
   * @property {number} index - Índice do item de menu.
   * @property {boolean} root - Se o item é de nível raiz.
   * @property {string|null} parentItemKey - Chave do item pai, se houver.
   */
  const props = defineProps({
    item: {
      type: Object,
      default: () => ({}) // Valor padrão vazio para o item de menu
    },
    index: {
      type: Number,
      default: 0 // Valor padrão do índice é 0
    },
    root: {
      type: Boolean,
      default: true // Valor padrão de 'root' é true
    },
    parentItemKey: {
      type: String,
      default: null // Valor padrão de 'parentItemKey' é null
    }
  });

  /**
   * Variáveis reativas para controle de estado.
   * @constant {Ref<string>} abletext - Classe para itens de menu habilitados.
   * @constant {Ref<string>} disabledtext - Classe para itens de menu desabilitados.
   * @constant {Ref<boolean>} isActiveMenu - Indica se o item de menu está ativo.
   * @constant {Ref<string|null>} itemKey - Chave única do item de menu.
   */
  const abletext = ref('layout-menuitem-text'); // Classe para itens de menu habilitados
  const disabledtext = ref('layout-menuitem-text-disabled'); // Classe para itens de menu desabilitados
  const isActiveMenu = ref(false); // Indica se o item de menu está ativo
  const itemKey = ref(null); // Chave única do item de menu

  /**
   * Inicializa a chave do item de menu antes do componente ser montado.
   * A função é chamada apenas uma vez antes da montagem do componente.
   */
  onBeforeMount(() => {
    // Define a chave do item do menu, utilizando o índice e a chave do item pai
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    /**
     * Verifica se o item de menu é o ativo.
     * Se o item de menu ativo corresponder à chave do item atual ou for um item filho, define o item como ativo.
     */
    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
  });

  /**
   * Observa mudanças no item de menu ativo e atualiza o estado.
   * @function
   * @param {string} newVal - Novo valor do item ativo.
   */
  watch(
    () => layoutConfig.activeMenuItem.value, // Observa mudanças no item de menu ativo
    (newVal) => {
      /**
       * Atualiza o estado de ativo do item de menu comparando a chave do item com o valor da nova chave ativa.
       */
      isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
  );

  /**
   * Função chamada quando o item de menu é clicado.
   * Se o item estiver desabilitado, impede a propagação do clique.
   * @param {MouseEvent} event - O evento de clique.
   * @param {Object} item - O item de menu que foi clicado.
   */
  const itemClick = (event, item) => {
    if (item.disabled) {
      event.stopImmediatePropagation(); // Impede a propagação do clique se o item estiver desabilitado
      return; // Não faz nada se o item estiver desabilitado
    }

    const { overlayMenuActive, staticMenuMobileActive } = layoutState;

    /**
     * Se o item for um link (com 'to' ou 'url') e o menu estiver sobreposto ou for um menu móvel,
     * fecha o menu ao clicar em um item de navegação.
     */
    if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
      onMenuToggle(); // Alterna a visibilidade do menu
    }

    /**
     * Se houver um comando associado ao item, executa-o.
     * O comando recebe um objeto contendo o evento original e o item.
     */
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    /**
     * Verifica se o item tem sub-itens e, se o item estiver ativo, usa a chave do item pai, 
     * caso contrário, usa a chave do item atual.
     */
    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    /**
     * Define o item de menu ativo com a chave do item.
     */
    setActiveMenuItem(foundItemKey);
  };

  /**
   * Função que verifica se a rota ativa corresponde ao item.
   * @param {Object} item - O item de menu a ser verificado.
   * @returns {boolean} - Retorna true se o caminho da rota for igual ao 'to' do item.
   */
  const checkActiveRoute = (item) => {
    return route.path === item.to; // Verifica se o caminho da rota corresponde ao destino do item
  };
</script>

<template>
  <!-- Item de menu, com classes dinâmicas dependendo se é raiz e se está ativo -->
  <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
    <!-- Exibe o texto do item de menu se for um item de nível raiz e visível -->
    <div v-if="root && item.visible !== false" :class="{'layout-menuitem-root-text': item.class}">
      {{ item.label }}
    </div>

    <!-- Link do item de menu, que pode ser um href ou um router-link -->
    <a 
      v-if="(!item.to || item.items) && item.visible !== false"
      :href="item.url" 
      @click="itemClick($event, item, index)" 
      :class="item.class" 
      :target="item.target" 
      tabindex="0"
    >
      <i :class="item.icon" class="layout-menuitem-icon"></i>
      <span :class="[item.disabled ? disabledtext : abletext]">{{ item.label }}</span>
      <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
    </a>

    <!-- Router Link para navegação de rota -->
    <router-link 
      v-if="item.to && !item.items && item.visible !== false"
      @click="itemClick($event, item, index)" 
      :class="[item.class, { 'active-route': checkActiveRoute(item) }]" 
      tabindex="0" 
      :to="item.to"
    >
      <i :class="item.icon" class="layout-menuitem-icon"></i>
      <span class="layout-menuitem-text">{{ item.label }}</span>
      <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
    </router-link>

    <!-- Submenu com animação de transição -->
    <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
      <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
        <app-menu-item 
          v-for="(child, i) in item.items" 
          :key="child" 
          :index="i" 
          :item="child" 
          :parentItemKey="itemKey" 
          :root="false"
        />
      </ul>
    </Transition>
  </li>
</template>

<style lang="scss" scoped></style>
