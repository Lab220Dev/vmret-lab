<script setup>
/**
 * Importação dos módulos necessários do Vue.js e PrimeVue
 */
import { onMounted, shallowRef, defineAsyncComponent,watch } from 'vue'; // Importação dos hooks do Vue.js
import { useAuthStore } from '@/store/authStore'; // Importa o store de autenticação
import { useToast } from 'primevue/usetoast'; // Importa o hook de notificações do PrimeVue

// Instancia o toast para exibir notificações ao usuário
const toast = useToast(); 

// Acessa a store de autenticação para pegar dados do usuário (como o papel)
const store = useAuthStore(); 

// Ref reativa para controlar o componente da dashboard que será carregado dinamicamente
const atual = shallowRef(null); 
/**
 * Exibe mensagens globais do store, incluindo mudanças de idioma.
 */
 const exibirMensagemGlobal = (mensagem) => {
    if (mensagem) {
        toast.add({
            severity: "info", // Tipo de mensagem
            summary: "Notificação", // Título do toast
            detail: mensagem, // Mensagem do store
            life: 3000, // Duração do toast
        });

        // Limpa a mensagem após exibição para evitar duplicações
        store.clearGlobalMessage();
    }
};
/**
 * Função para carregar a dashboard correspondente com base no papel do usuário.
 * A dashboard é carregada dinamicamente com o Vue's defineAsyncComponent.
 */
const DashPorTipo = () => {
    // Acessa o papel do usuário na store
    const userRole = store.userRole;

    // Realiza a escolha da dashboard de acordo com o papel do usuário
    switch (userRole) {
        case 'Administrador':
            // Se o papel for 'Administrador', carrega a dashboard de administrador
            atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardAdmin.vue'));
            break;
        case 'Master':
            // Se o papel for 'Master', carrega a dashboard de master
            atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardMaster.vue'));
            break;
        case 'Operador':
            // Se o papel for 'Operador', carrega a dashboard de operador
            atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardOperador.vue'));
            break;
        case 'Avulso':
            // Se o papel for 'Avulso', carrega a dashboard avulsa
            atual.value = defineAsyncComponent(() => import('@/views/Home/DashBoardAvulso.vue'));
            break;
        default:
            // Se o papel não for reconhecido, exibe um erro no console
            console.error('Papel de usuário não reconhecido:', userRole); 
            // A mensagem de erro deve ser exibida no console do navegador
    }
};
watch(
    () => store.globalMessage,
    (newMessage) => {
        if (newMessage) {
            exibirMensagemGlobal(newMessage);
        }
    }
);
/**
 * Hook 'onMounted' do Vue.js é executado assim que o componente é montado
 * É utilizado para realizar a inicialização dos dados e verificar permissões.
 */
onMounted(() => {
    // Verifica se existe alguma mensagem global na store
    if (store.getGlobalMessage) {
        exibirMensagemGlobal(store.getGlobalMessage);
    }
    // Chama a função que decide qual dashboard carregar com base no papel do usuário
    DashPorTipo();
});
</script>

<template>
    <!-- Renderiza dinamicamente o componente correspondente com base na variável 'atual' -->
    <component v-if="atual" :is="atual" />
    <!-- 'v-if="atual"' verifica se a variável 'atual' contém um componente válido -->
    <!-- ':is="atual"' permite a renderização do componente dinâmico -->
</template>
