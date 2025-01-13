<script setup>
  /**
   * Importação dos componentes e funções necessários para o funcionamento do componente.
   * 
   * Este script importa funções do Vue, componentes personalizados e stores.
   */
  
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

  /**
   * Desestruturação das funções fornecidas pelo layout.
   * 
   * `onMenuToggle` é uma função usada para alternar o estado do menu.
   */
  const { onMenuToggle } = useLayout(); // Função para alternar o estado do menu (aberto/fechado)

  /**
   * Acesso à store de autenticação para recuperar dados do usuário.
   * 
   * `store` é uma instância do store de autenticação, responsável por gerenciar o estado global.
   */
  const store = useAuthStore(); // Acesso à store de autenticação

  /**
   * Instancia o roteador para navegação entre as rotas da aplicação.
   * 
   * `router` é usado para fazer redirecionamentos programáticos.
   */
  const router = useRouter(); // Instância do roteador para navegação

  /**
   * Obtém os dados do usuário, como nome e papel (role) da store de autenticação.
   * 
   * `nome` e `role` são extraídos da store para exibição na interface.
   */
  const nome = store.userName; // Nome do usuário da store de autenticação
  const role = store.userRole; // Papel (role) do usuário da store de autenticação

  /**
   * Acesso ao store de contagem regressiva para recuperar o tempo restante.
   * 
   * `millisecondsRemaining` é o tempo em milissegundos que resta antes de um evento (ex: logoff).
   */
  const countdownStore = useCountdownStore(); // Acesso à store de contagem regressiva
  const millisecondsRemaining = countdownStore.millisecondsRemaining; // Tempo restante para a contagem regressiva

  /**
   * Função que inicia a contagem regressiva.
   * 
   * Esta função é um placeholder, pois o componente VueCountdown já lida com o controle do tempo.
   * 
   * @returns {boolean} Retorna sempre `true`, indicando que a contagem foi iniciada.
   */
  function startCountdown() {
    return true; // Retorna `true` para indicar que a contagem foi iniciada.
  }

  /**
   * Função chamada quando a contagem regressiva chega ao fim.
   * 
   * Aqui, o usuário será deslogado e redirecionado para a tela de login.
   */
  function onCountdownEnd() {
    store.logout(); // Chama o método de logout da store de autenticação
    router.push({ name: 'login' }); // Redireciona o usuário para a página de login após o logout
  }

  /**
   * Função executada quando o componente é montado.
   * 
   * Verifica se ainda há tempo restante para a contagem e a inicia, caso haja.
   */
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

  /**
   * Função para realizar o logoff do usuário.
   * 
   * Reseta o estado da store de autenticação, limpa dados locais e exclui cookies.
   */
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

  /**
   * Referência reativa para o menu.
   * 
   * A variável `menu` controla o estado do menu (aberto ou fechado).
   */
  const menu = ref(); // Referência reativa para o menu

  /**
   * Itens do menu, incluindo a opção de logoff.
   * 
   * `items` contém as opções de menu, incluindo o comando de logoff.
   */
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

  /**
   * Função que escuta cliques fora do menu e fecha o menu se um clique fora for detectado.
   * 
   * Adiciona um ouvinte de evento que fecha o menu se o usuário clicar fora dele.
   */
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
  <!-- Linha horizontal separadora -->
  <hr class="linha mb-0">
  
  <div class="p-0 flex align-items-center justify-content-start mt-1" style="flex-grow: 1">
    <!-- Exibe a imagem de perfil do usuário -->
    <div class="pic col-2 p-1 mt-3">
      <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" />
    </div>

    <!-- Exibe o nome do usuário, seu papel e a contagem regressiva -->
    <div class="formgrid col-10 p-0 ml-4" style="display: flex; flex-direction: column; align-items: flex-start">
      <h6 class="usuario mt-3 m-0">{{ nome }}</h6> <!-- Nome do usuário -->
      <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span> <!-- Papel do usuário -->
      
      <!-- Contagem regressiva -->
      <div class="relogio mt-1 mr-0" style="align-self: flex-start">
        <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd">
          {{ padZero(minutes) }}:{{ padZero(seconds) }} <!-- Exibe a contagem regressiva -->
        </vue-countdown>
      </div>
    </div>
  </div>

  <!-- Linha horizontal separadora -->
  <hr class="linha mt-3">
  
  <!-- Exibe o menu -->
  <MyMenu></MyMenu>
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
