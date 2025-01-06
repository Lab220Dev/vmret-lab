<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'; // Importa funções do Vue para reatividade e ciclo de vida do componente
import { useLayout } from '@/layout/composables/layout'; // Acessa funções relacionadas ao layout
import { useRouter } from 'vue-router'; // Usado para navegação entre as rotas
import { useCountdownStore } from '@/store/countdown'; // Acessa o store que controla o tempo de contagem regressiva
import imageUrl from '@/assets/images/LogoDMBranco.png'; // Importa a URL da imagem do logo
import VueCountdown from '@chenfengyuan/vue-countdown'; // Importa o componente VueCountdown para exibir o tempo de contagem regressiva
import { useAuthStore } from '@/store/authStore.js'; // Acessa o store de autenticação para obter dados do usuário

// Desestruturação de funções do layout, como alternar o menu lateral
const { onMenuToggle } = useLayout();

// Acessa o store de autenticação
const store = useAuthStore();
const router = useRouter();

// Referência para o listener de clique fora do menu
const outsideClickListener = ref(null);
// Controle de visibilidade do menu superior
const topbarMenuActive = ref(true);

// Obtém o nome e a role (papel) do usuário no sistema a partir do store de autenticação
const nome = store.userName; // Nome do usuário
const role = store.userRole; // Papel do usuário

// Acessa o store de contagem regressiva para obter o tempo restante
const countdownStore = useCountdownStore();
const millisecondsRemaining = countdownStore.millisecondsRemaining; // Tempo restante em milissegundos

// Método chamado quando o componente é montado
onMounted(() => {
    bindOutsideClickListener(); // Liga o listener de clique fora do menu

    // Se o tempo restante for maior que zero, inicia a contagem regressiva
    if (millisecondsRemaining > 0) {
        startCountdown(); // Inicia a contagem regressiva
    }
});

// Método chamado antes do componente ser desmontado
onBeforeUnmount(() => {
    unbindOutsideClickListener(); // Desliga o listener de clique fora do menu
});

// Função para adicionar o listener de clique fora do menu
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) { // Verifica se o listener já foi adicionado
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) { // Verifica se o clique foi fora do menu
                topbarMenuActive.value = false; // Fecha o menu
            }
        };
        document.addEventListener('click', outsideClickListener.value); // Adiciona o evento de clique no documento
    }
};

// Função para remover o listener de clique fora do menu
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) { // Verifica se o listener existe
        document.removeEventListener('click', outsideClickListener); // Remove o evento de clique do documento
        outsideClickListener.value = null; // Limpa a referência do listener
    }
};

// Função para verificar se o clique foi fora do menu
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return; // Se o menu não estiver ativo, não faz nada

    const topbarEl = document.querySelector('.layout-topbar-sair-button'); // Obtém o botão de sair da barra superior

    // Retorna verdadeiro se o clique foi fora do botão de sair, fechando o menu
    return !(topbarEl === event.target || topbarEl.contains(event.target));
};

// Função para realizar o logoff do usuário
const fazerLogoff = () => {
    store.$reset(); // Reseta o estado do store de autenticação

    // Limpa os dados de armazenamento local e de sessão
    localStorage.clear();
    sessionStorage.clear();

    // Limpa todos os cookies
    document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'; // Define a data de expiração no passado para remover o cookie
    });

    store.logout(); // Executa o logoff no store de autenticação
    router.push({ name: 'login' }); // Redireciona para a página de login
};

// Função que inicia a contagem regressiva (não faz nada, mas pode ser expandida)
function startCountdown() {
    return true; // Retorna verdadeiro, mas não realiza nenhuma ação. Pode ser expandido para lógica adicional.
}

// Função chamada quando a contagem regressiva termina
function onCountdownEnd() {
    store.logout(); // Faz logoff quando a contagem regressiva chega ao fim
    router.push({ name: 'login' }); // Redireciona para a página de login
}

// Função para formatar valores de tempo, garantindo dois dígitos
function padZero(value) {
    return String(value).padStart(2, '0'); // Adiciona um zero à esquerda se necessário
}

// Menu de opções, com o item de "Fazer Logoff"
const menu = ref(); // Referência do menu
const items = ref([  // Itens do menu
    {
        label: 'Opções', // Título da categoria de opções
        items: [ // Itens dentro da categoria
            {
                label: 'Fazer Logoff', // Rótulo do item
                icon: 'pi pi-power-off', // Ícone do item
                command: fazerLogoff // Função chamada ao selecionar o item (faz logoff)
            }
        ]
    }
]);

// Função para alternar a visibilidade do menu
const toggle = (event) => {
    menu.value.toggle(event); // Alterna a visibilidade do menu usando a referência
};
</script>

<template>
    <!-- Barra superior com logo, menu e relógio -->
    <div class="flex layout-topbar justify-content-between align-items-center">
        <div class="flex align-items-center">
            <!-- Botão de menu para alternar o layout do menu lateral -->
            <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
                <i class="pi pi-bars"></i> <!-- Ícone do menu hamburguer -->
            </button>
            <!-- Link para a página do Dashboard -->
            <router-link :to="{ name: 'Dashboard' }" class="mt-12 ml-2">
                <Image :src="imageUrl" width="200" href="/index.html" /> <!-- Logo da empresa -->
            </router-link>
        </div>

        <!-- Seção de usuário, imagem, nome e role -->
        <div class="flex align-items-center justify-content-end mt-1" style="flex-grow: 1">
            <!-- Imagem de avatar do usuário -->
            <div class="mt-3 field pic">
                <Avatar icon="pi pi-user" class="formgrid" size="xlarge" shape="circle" /> <!-- Ícone de usuário -->
            </div>

            <!-- Exibe nome do usuário, seu papel e o relógio com contagem regressiva -->
            <div class="formgrid field ml-2" style="display: flex; flex-direction: column; align-items: flex-start">
                <h6 class="usuario mt-3 m-0">{{ nome }}</h6> <!-- Nome do usuário -->
                <span class="role" style="color: rgba(255, 255, 255, 0.5)">{{ role }}</span> <!-- Papel do usuário -->
                <div class="relogio mt-1 mr-0" style="align-self: flex-start">
                    <!-- Componente VueCountdown exibindo o tempo restante -->
                    <vue-countdown :time="millisecondsRemaining" v-slot="{ minutes, seconds }" @start="startCountdown" @end="onCountdownEnd">
                        {{ padZero(minutes) }}:{{ padZero(seconds) }} <!-- Formata minutos e segundos -->
                    </vue-countdown>
                </div>
            </div>

            <!-- Botão de menu com opções como 'Fazer Logoff' -->
            <div class="formgrid mt-2">
                <button type="button" class="p-link layout-topbar-sair-button layout-topbar-button m-0" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu">
                    <i class="pi pi-ellipsis-v"></i> <!-- Ícone de opções -->
                </button>
                <!-- Menu suspenso com opções -->
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.relogio {
    font-size: 10pt; /* Define o tamanho da fonte do relógio */
    font-weight: bold; /* Deixa a fonte em negrito */
    color: #efae33; /* Define a cor do texto do relógio */
    padding-top: 0px;
    margin-left: 0px;
    margin-right: 10px;
}

.usuario {
    font-size: 12px; /* Tamanho da fonte do nome do usuário */
}

.role {
    color: rgba(255, 255, 255, 0.5); /* Cor cinza para o papel do usuário */
    font-size: 10px; /* Tamanho pequeno para o papel */
}

/* Estilos para telas pequenas (menor que 767px) */
@media (max-width: 767px) {
    .relogio,
    .usuario,
    .role,
    .pic {
        display: none; /* Esconde elementos no layout em telas pequenas */
    }
}
</style>
