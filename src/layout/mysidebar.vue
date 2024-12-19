<script setup>
  // Importação de componentes e funções necessários
  import MyMenu from './myMenu.vue'; // Importa o componente MyMenu para exibir o menu do usuário
  import VueCountdown from '@chenfengyuan/vue-countdown'; // Importa o componente VueCountdown para exibir o tempo de contagem regressiva
  import { ref, onMounted } from 'vue'; // Importa funções do Vue para reatividade e ciclo de vida do componente
  import { useAuthStore } from '@/store/authStore.js'; // Acessa o store de autenticação para obter dados do usuário
  import { useRouter } from 'vue-router'; // Usado para navegação entre as rotas
  import { useCountdownStore } from '@/store/countdown'; // Acessa o store que controla o tempo de contagem regressiva
  import { useLayout } from '@/layout/composables/layout'; // Acessa funções relacionadas ao layout

  // Desestruturação de funções do layout
  const { onMenuToggle } = useLayout();

  // Acessa o store de autenticação
  const store = useAuthStore();
  const router = useRouter();
  
  // Obtém o nome e a role (papel) do usuário no sistema a partir do store
  const nome = store.userName;
  const role = store.userRole;

  // Acessa o store de contagem regressiva
  const countdownStore = useCountdownStore();
  const millisecondsRemaining = countdownStore.millisecondsRemaining;

  // Função que inicia a contagem regressiva
  function startCountdown() {
    return true;
  }

  // Função que é chamada quando a contagem regressiva chega ao fim
  function onCountdownEnd() {
    store.logout(); // Faz logout do usuário
    router.push({ name: 'login' }); // Redireciona para a página de login
  }

  // Função que é executada quando o componente é montado
  onMounted(() => {
    if (millisecondsRemaining > 0) {
      startCountdown(); // Inicia a contagem se ainda houver tempo restante
    }
  });

  // Função auxiliar para garantir que os números da contagem tenham 2 dígitos
  function padZero(value) {
    return String(value).padStart(2, '0');
  }

  // Função para realizar o logoff do usuário
  const fazerLogoff = () => {
    store.$reset(); // Reseta o estado do store de autenticação

    // Limpa os dados armazenados localmente
    localStorage.clear();
    sessionStorage.clear();

    // Exclui todos os cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });

    store.logout(); // Realiza o logout
    router.push({ name: 'login' }); // Redireciona para a página de login
  };

  // Referência reativa para o menu
  const menu = ref();

  // Itens de menu, incluindo a opção de logoff
  const items = ref([
    {
      label: 'Opções',
      items: [
        {
          label: 'Fazer Logoff',
          icon: 'pi pi-power-off', // Ícone de logoff
          command: fazerLogoff // Ação de logoff
        }
      ]
    }
  ]);

  // Função que escuta cliques fora do menu e fecha o menu se um clique fora for detectado
  const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
      outsideClickListener.value = (event) => {
        if (isOutsideClicked(event)) {
          topbarMenuActive.value = false; // Fecha o menu se um clique fora for detectado
        }
      };
      document.addEventListener('click', outsideClickListener.value); // Adiciona o ouvinte de evento
    }
  };

  // Verifica se o clique foi fora do elemento do menu
  const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const topbarEl = document.querySelector('.layout-topbar-sair-button');
    return !(topbarEl === event.target || topbarEl.contains(event.target)); // Verifica se o clique foi fora do menu
  };

  // Função para alternar o estado do menu
  const toggle = (event) => {
    menu.value.toggle(event); // Alterna o estado do menu (aberto/fechado)
  };
</script>

<template>
  <hr class="linha mb-0">
  <div class=" p-0 flex align-items-center justify-content-start mt-1 " style="flex-grow: 1">
    <!-- Exibe a imagem do usuário -->
    <div class=" pic col-2 p-1 mt-3">
      <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" />
    </div>

    <!-- Exibe o nome do usuário, role e relógio (contagem regressiva) -->
    <div class="formgrid col-10 p-0 ml-4" style="display: flex; flex-direction: column; align-items: flex-start">
      <h6 class="usuario mt-3 m-0">{{ nome }}</h6> <!-- Nome do usuário -->
      <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span> <!-- Papel do usuário -->
      <div class="relogio mt-1 mr-0" style="align-self: flex-start">
        <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd">
          {{ padZero(minutes) }}:{{ padZero(seconds) }} <!-- Exibe a contagem regressiva -->
        </vue-countdown>
      </div>
    </div>
  </div>
  <hr class="linha mt-3">
  <MyMenu></MyMenu> <!-- Exibe o menu do usuário -->
</template>

<style lang="scss" scoped>
  /* Estilos responsivos e personalizados */
  @media (min-width: 767px) {
    .formgrid,
    .button,
    .usuario,
    .relogio,
    .role,
    .linha {
      display: none !important; /* Oculta os elementos para telas maiores que 767px */
    }
  }
  
  .usuario {
    font-size: 14px; /* Tamanho da fonte do nome do usuário */
  }

  .role {
    color: rgba(255, 255, 255, 0.5); /* Cor do texto do papel do usuário */
    font-size: 10px; /* Tamanho da fonte do papel */
  }

  .relogio {
    font-size: 10pt; /* Tamanho da fonte do relógio */
    font-weight: bold; /* Negrito */
    color: #EFAE33; /* Cor do texto do relógio */
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
  }

  .pi-power-off {
    color: #ffffff; /* Cor do ícone de logoff */
    font-size: 20px; /* Tamanho do ícone */
  }

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

  .pic {
    width: 40px; /* Tamanho da imagem do usuário */
  }
</style>