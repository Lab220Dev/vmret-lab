<script setup>
  // Importa funções necessárias do Vue e outras dependências
  import { ref, onBeforeMount, watch } from 'vue'; // ref para reatividade, onBeforeMount para execução antes do componente ser montado, watch para observar mudanças
  import { useRoute } from 'vue-router'; // Função para obter informações sobre a rota atual
  import { useLayout } from '@/layout/composables/layout'; // Função personalizada para obter as configurações e o estado do layout

  // Obtém a rota atual
  const route = useRoute();

  // Desestrutura as funções e dados do layout
  const { layoutConfig, layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

  // Definição das propriedades do componente
  const props = defineProps({
    item: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    root: {
      type: Boolean,
      default: true
    },
    parentItemKey: {
      type: String,
      default: null
    }
  });

  // Variáveis reativas para controle de estado
  const abletext = ref('layout-menuitem-text'); // Classe para itens de menu habilitados
  const disabledtext = ref('layout-menuitem-text-disabled'); // Classe para itens de menu desabilitados
  const isActiveMenu = ref(false); // Indica se o item de menu está ativo
  const itemKey = ref(null); // Chave do item de menu

  // Inicializa a chave do item de menu antes do componente ser montado
  onBeforeMount(() => {
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    // Verifica se o item é o item ativo
    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
  });

  // Observa mudanças no item de menu ativo e atualiza o estado
  watch(
    () => layoutConfig.activeMenuItem.value,
    (newVal) => {
      isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
  );

  // Função que lida com o clique do item de menu
  const itemClick = (event, item) => {
    if (item.disabled) {
      event.stopImmediatePropagation(); // Se o item estiver desabilitado, impede a propagação do clique
      return;
    }

    const { overlayMenuActive, staticMenuMobileActive } = layoutState;

    // Fecha o menu se um item de navegação for clicado em um menu móvel ou sobreposto
    if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
      onMenuToggle();
    }

    // Executa o comando, se houver
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    // Define o item de menu ativo
    setActiveMenuItem(foundItemKey);
  };

  // Função para verificar se a rota ativa corresponde ao item
  const checkActiveRoute = (item) => {
    return route.path === item.to;
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