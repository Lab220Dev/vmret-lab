<script setup>
  /**
   * Importação dos componentes e funções necessários para o funcionamento do componente.
   * 
   * Este script importa funções do Vue, componentes personalizados e stores.
   */
   const visible = ref(false);
  // Importa o componente MyMenu, utilizado para exibir o menu do usuário
  import MyMenu from './myMenu.vue'; // Exibe o menu do usuário
  
  // Importa o componente VueCountdown para exibir a contagem regressiva
  import VueCountdown from '@chenfengyuan/vue-countdown'; // Componente de contagem regressiva
  
  // Importa funções do Vue para reatividade e ciclo de vida do componente
  import { ref, onMounted } from 'vue'; // 'ref' cria variáveis reativas, 'onMounted' é executado ao montar o componente
  
  // Importa a store de autenticação para acessar os dados do usuário
  import { useAuthStore } from '@/store/authStore.js'; // Store de autenticação para acessar dados do usuário (nome, papel)
  
  // Importa o router para navegar entre as páginas
  import { useRouter } from 'vue-router'; // Usado para navegação entre as rotas
  
  // Importa a store de contagem regressiva para acessar o tempo restante
  import { useCountdownStore } from '@/store/countdown'; // Acesso à store que controla a contagem regressiva
  
  // Importa o layout do menu
  import { useLayout } from '@/layout/composables/layout'; // Acesso a funções relacionadas ao layout, como a alternância do menu

  const { onMenuToggle } = useLayout(); // Função para alternar o estado do menu (aberto/fechado)

  const store = useAuthStore(); // Acesso à store de autenticação

  const router = useRouter(); // Instância do roteador para navegação

  const nome = store.userName; // Nome do usuário da store de autenticação
  const role = store.userRole; // Papel (role) do usuário da store de autenticação

  const countdownStore = useCountdownStore(); // Acesso à store de contagem regressiva
  const millisecondsRemaining = countdownStore.millisecondsRemaining; // Tempo restante para a contagem regressiva

  /**
   * @returns {boolean} Retorna sempre `true`, indicando que a contagem foi iniciada.
   */
  function startCountdown() {
    return true; // Retorna `true` para indicar que a contagem foi iniciada.
  }

  function onCountdownEnd() {
    store.logout(); // Chama o método de logout da store de autenticação
    router.push({ name: 'login' }); // Redireciona o usuário para a página de login após o logout
  }

  onMounted(() => {
    if (millisecondsRemaining > 0) {
      startCountdown(); // Inicia a contagem regressiva, caso haja tempo restante
    }
  });

  /**
   * Função auxiliar que formata os números da contagem para garantir que tenham 2 dígitos.
   * 
   * @param {number} value - O valor numérico a ser formatado.
   * @returns {string} Retorna o valor numérico formatado com 2 dígitos (ex: '09' ao invés de '9').
   */
  function padZero(value) {
    return String(value).padStart(2, '0'); // Formata para ter sempre 2 dígitos
  }

  const fazerLogoff = () => {
    store.$reset(); // Reseta o estado do store de autenticação, removendo informações do usuário

    // Limpa os dados armazenados no localStorage e sessionStorage
    localStorage.clear(); // Limpa o armazenamento local
    sessionStorage.clear(); // Limpa o armazenamento de sessão

    // Exclui todos os cookies armazenados
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'; // Exclui todos os cookies
    });

    store.logout(); // Realiza o logout do usuário
    router.push({ name: 'login' }); // Redireciona para a página de login
  };

  const menu = ref(); // Referência reativa para o menu

  const items = ref([ // Define o modelo dos itens do menu
    {
      label: 'Opções', // Rótulo do menu
      items: [ // Subitens do menu
        {
          label: 'Fazer Logoff', // Rótulo do item de logoff
          icon: 'pi pi-power-off', // Ícone do item de logoff
          command: fazerLogoff // Ação que será executada ao clicar no item (logoff)
        }
      ]
    }
  ]);

  const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
      outsideClickListener.value = (event) => {
        if (isOutsideClicked(event)) {
          topbarMenuActive.value = false; // Fecha o menu se um clique fora for detectado
        }
      };
      document.addEventListener('click', outsideClickListener.value); // Adiciona o ouvinte de evento para clique
    }
  };

  /**
   * Verifica se o clique foi fora do menu.
   * 
   * @param {Event} event - O evento de clique.
   * @returns {boolean} Retorna `true` se o clique foi fora do menu, caso contrário, `false`.
   */
  const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return; // Se o menu não está ativo, não faz nada

    const topbarEl = document.querySelector('.layout-topbar-sair-button'); // Seleciona o botão de sair da barra superior
    return !(topbarEl === event.target || topbarEl.contains(event.target)); // Verifica se o clique foi fora do botão
  };

  /**
   * Função para alternar o estado do menu (aberto/fechado).
   * 
   * @param {Event} event - O evento de clique.
   */
  const toggle = (event) => {
    menu.value.toggle(event); // Alterna o estado do menu
  };
</script>

<template>
  <div>
    <b-button v-b-toggle.sidebar-no-header>Toggle Sidebar</b-button>
    <b-sidebar id="sidebar-no-header" aria-labelledby="sidebar-no-header-title" no-header shadow>
      <template #default="{ hide }">
        <div class="p-3">
          <h4 id="sidebar-no-header-title">Custom header sidebar</h4>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </p>
          <nav class="mb-3">
            <b-nav vertical>
              <b-nav-item active @click="hide">Active</b-nav-item>
              <b-nav-item href="#link-1" @click="hide">Link</b-nav-item>
              <b-nav-item href="#link-2" @click="hide">Another Link</b-nav-item>
            </b-nav>
          </nav>
          <b-button variant="primary" block @click="hide">Close Sidebar</b-button>
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<style lang="scss" scoped>
  /* Estilos responsivos e personalizados */
  @media (min-width: 767px) {
    .formgrid, .button, .usuario, .relogio, .role, .linha {
      display: none !important; /* Oculta os elementos para telas maiores que 767px */
    }
  }

  /* Estilo para o nome do usuário */
  .usuario {
    font-size: 14px; /* Tamanho da fonte do nome do usuário */
  }

  /* Estilo para o papel (role) do usuário */
  .role {
    color: rgba(255, 255, 255, 0.5); /* Cor do texto do papel */
    font-size: 10px; /* Tamanho da fonte do papel */
  }

  /* Estilo para o relógio da contagem regressiva */
  .relogio {
    font-size: 10pt; /* Tamanho da fonte */
    font-weight: bold; /* Negrito */
    color: #EFAE33; /* Cor do relógio */
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
  }

  /* Estilo do ícone de logoff */
  .pi-power-off {
    color: #ffffff; /* Cor do ícone */
    font-size: 20px; /* Tamanho do ícone */
  }

  /* Estilo para o botão de logoff */
  .button {
    display: flex;
    padding: 0.5rem 1rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    margin-top: auto;
    justify-content: flex-start;
  }

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  /* Estilo para a imagem do usuário */
  .pic {
    width: 40px; /* Tamanho da imagem do usuário */
  }
</style>
