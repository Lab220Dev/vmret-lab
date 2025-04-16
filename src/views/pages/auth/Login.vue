<script setup>
// Importação dos hooks e funções necessárias
import { ref, computed , onMounted} from 'vue'; // Importa o hook ref para criar variáveis reativas
import { useRouter } from 'vue-router'; // Importa o hook useRouter para navegação entre páginas
import axios from '@/axios.js'; // Importa a instância configurada do axios para realizar requisições HTTP
import { useAuthStore } from '@/store/authStore'; // Importa o store de autenticação para gerenciar o estado do usuário
import { useCountdownStore } from '@/store/countdown'; // Importa o store para controlar a contagem regressiva (timer de sessão)
import LoadingModal from '@/components/LoadingModal.vue'; // Importa o componente de modal de carregamento (loading)
import { useI18n } from 'vue-i18n';
import arflag from '@/assets/demo/ar.svg';
import brflag from '@/assets/demo/br.svg';
import usflag from '@/assets/demo/us.svg';
const { t, locale } = useI18n();
// Variáveis reativas
const isLoading = ref(false); // Controla o estado de carregamento (loading)
const router = useRouter(); // Instancia o hook de navegação do Vue Router
const username = ref(''); // Armazena o nome de usuário (email) para login
const mail = ref(''); // Armazena o email para recuperação de senha
const password = ref(''); // Armazena a senha para login
const error = ref(null); // Armazena qualquer mensagem de erro
const forgotPassword = ref(false); // Controla a visualização do formulário de recuperação de senha
const authStore = useAuthStore(); // Instancia o store de autenticação
const countdownStore = useCountdownStore(); // Instancia o store de contagem regressiva para a sessão
const selectedLanguage = ref();
/**
 * Função para lidar com a recuperação de senha
 * @returns {Promise<void>} Retorna uma Promise que, ao ser resolvida, finaliza o processo de recuperação de senha
 */
const resetPassword = async () => {
    isLoading.value = true; // Ativa o carregamento enquanto o pedido está sendo feito
    error.value = ''; // Limpa qualquer erro anterior
    try {
        // Envia o pedido de recuperação de senha para a API
        const response = await axios.post('/recuperar', {
            email: mail.value // Envia o email do usuário para recuperação
        });
        // Verifica se o código de status da resposta é 200 (OK)
        if (response.status === 200) {
            // Exibe uma mensagem de sucesso caso o link de recuperação tenha sido enviado corretamente
            alert(t('login_alert'));
            forgotPassword.value = false; // Altera a tela de recuperação para a tela de login novamente
        }
    } catch (err) {
        console.error(err); // Adiciona um log para depuração do erro
        // Define a mensagem de erro para exibição, ou usa uma mensagem genérica
        error.value = err.response?.data || 'Erro desconhecido'; // Caso não haja mensagem de erro, usa a padrão
    } finally {
        isLoading.value = false; // Desativa o carregamento quando a requisição for concluída (seja com sucesso ou falha)
    }
};
const changeLanguage = () => {
    const selected = linguas.value.find((lang) => lang.value === selectedLanguage.value.value);
    if (selected) {
        selectedLanguage.value = selected;
        locale.value = selected.value; // Atualiza o idioma no Vue I18n
    }
};
/**
 * Função para realizar o login do usuário
 * @returns {Promise<void>} Retorna uma Promise que, ao ser resolvida, realiza o login e redireciona para a Dashboard
 */
const login = async () => {
    isLoading.value = true; // Ativa o carregamento enquanto o login está sendo realizado
    error.value = ''; // Limpa qualquer erro anterior
    try {
        // Envia as credenciais de login (email e senha) para a API
        const response = await axios.post('/login', {
            email: username.value, // Envia o email como nome de usuário
            senha: password.value // Envia a senha
        });
        // Verifica se o código de status da resposta é 200 (OK)
        if (response.status === 200) {
            // Realiza o login no sistema armazenando o token e os dados do usuário no store
            authStore.login({ token: response.data.token, usuario: response.data.Usuario, menu: response.data.items });
            authStore.setQtdMessage(response.data.Notificacoes);
            // Inicia a contagem regressiva para expiração de sessão (1 hora)
            countdownStore.startCountdown(60 * 60 * 1000);
            // Redireciona para a página principal (Dashboard)
            router.push({ name: 'Dashboard' });
        }
    } catch (err) {
        console.error(err); // Adiciona um log para depuração do erro
        // Define a mensagem de erro para exibição, ou usa uma mensagem genérica
        error.value = err.response?.data || 'Erro desconhecido'; // Caso não haja mensagem de erro, usa a padrão
    } finally {
        isLoading.value = false; // Desativa o carregamento quando o login for concluído (seja com sucesso ou falha)
    }
};

 const linguas = computed(() => [  // Cria uma propriedade computada chamada 'linguas', que retorna uma lista de objetos
    {
        label: t('portuguese'),  // O rótulo para o idioma português, traduzido pela função 't'
        value: 'pt',  // O valor da língua para o idioma português (código do idioma)
        icon: brflag  // O ícone da bandeira do Brasil representando o português
    },
    {
        label: t('english'),  // O rótulo para o idioma inglês, traduzido pela função 't'
        value: 'en',  // O valor da língua para o idioma inglês (código do idioma)
        icon: usflag  // O ícone da bandeira dos Estados Unidos representando o inglês
    },
    {
        label: t('spanish'),  // O rótulo para o idioma espanhol, traduzido pela função 't'
        value: 'es',  // O valor da língua para o idioma espanhol (código do idioma)
        icon: arflag  // O ícone da bandeira da Argentina representando o espanhol
    }
]);

onMounted(() => {
    const browserLang = navigator.language.split('-')[0]; // Pega apenas o "pt", "en", "es"
    const matchedLang = linguas.value.find(lang => lang.value === browserLang); // Encontra no array

    if (matchedLang) {
        selectedLanguage.value = matchedLang; // Define o idioma automaticamente
        locale.value = matchedLang.value; // Atualiza Vue I18n
    } else {
        // Se não encontrar, define um idioma padrão (exemplo: inglês)
        selectedLanguage.value = linguas.value.find(lang => lang.value === 'en');
        locale.value = 'en';
    }
})
</script>

<template>
    <!-- Exibe o modal de carregamento enquanto a requisição está sendo processada -->
    <LoadingModal :isLoading="isLoading" />
    <Splitter class="flex justify-content-center align-items-center min-h-screen" style="height: 300px">
        <!-- Painel esquerdo da tela com o logo e título -->
        <SplitterPanel class="colunaesquerda flex-column h-screen justify-content-center align-items-center text-left m-0" :size="65">
            <div class="flex align-items-center">
                <!-- SVG do logo -->
                <svg class="align-items-center justify-content-center" xmlns="http://www.w3.org/2000/svg" width="6em" height="6em" viewBox="2 2 22 22">
                    <path
                        fill="#494c57"
                        d="m11.614 13.98l4.908 4.922c.39.391.99.36 1.286-.106a8.99 8.99 0 0 0 1.393-4.815a9.005 9.005 0 0 0-1.972-5.631zM9 14.396V7.041a7.008 7.008 0 0 0-6 6.939C3 17.856 6.134 21 10 21a6.946 6.946 0 0 0 4.186-1.403zm7.331-8.183c.39-.391.365-.999-.089-1.313a10.925 10.925 0 0 0-4.251-1.765c-.544-.1-.991.312-.991.865v7.56z"
                    />
                </svg>

                <div class="block justify-content-center">
                    <!-- Título do sistema -->
                    <h1 class="align-items-center justify-content-center text-800 font-italic m-0">DM<span class="font-bold mt-0 mb-0 textblue">WEB</span></h1>
                    <h4 class="text-lg m-0">{{ $t('login_title_home') }}</h4>
                </div>
            </div>
        </SplitterPanel>

        <!-- Painel direito da tela com o formulário de login ou recuperação de senha -->
        <SplitterPanel class="flex colunadireita flex-column h-screen justify-content-between bg-white" :size="35" :minSize="30">
            <!-- Logo da empresa -->
            <div class="flex justify-content-between flex-wrap">
                <div class="justify-content-start">
                    <img id="img" src="@/assets/images/LogoLabSF2.png" alt="Logo da empresa" />
                </div>
                <div class="justify-content-end">
                    <Select v-model="selectedLanguage" :options="linguas" optionLabel="label" @change="changeLanguage">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex align-items-center">
                                <img :src="slotProps.value.icon" alt="" class="flag-icon" />
                            </div>
                        </template>

                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <img :src="slotProps.option.icon" alt="" class="flag-icon" />
                                <span>{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </Select>
                </div>
            </div>
            <div>
                <!-- Formulário de login e recuperação de senha -->
                <div class="login">
                    <form id="form-login" method="post" autocomplete="off">
                        <!-- Formulário de login (visível quando forgotPassword é false) -->
                        <div v-if="!forgotPassword">
                            <h2 class="textblue text-5xl">{{ $t('login_inital_text') }}</h2>
                            <h4>{{ $t('login_intial_tex_sub') }}</h4>

                            <!-- Campo de email -->
                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block texto-cinza-500">{{ $t('email') }}:</label>
                                <input type="email" v-model="username" name="email" id="email" class="formstyle" :placeholder="t('login_email_placeholder')" autocomplete="on" />
                            </div>

                            <!-- Campo de senha -->
                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block">{{ $t('password') }}:</label>
                                <input type="password" v-model="password" name="senha" id="senha" class="formstyle" :placeholder="t('login_password_placeholder')" autocomplete="on" />
                            </div>

                            <!-- Exibe mensagem de erro, caso haja -->
                            <div v-if="error" class="div-error">
                                <small class="p-error">{{ error }}</small>
                            </div>

                            <!-- Botão de login -->
                            <button class="btn_button w-full py-3 px-3 border-round-sm text-nowrap" @click.prevent="login">LOGIN</button>

                            <!-- Link para recuperação de senha -->
                            <h6 class="mt-3 text-center">
                                <a href="#" @click.prevent="forgotPassword = true" class="textblue font-semibold">{{$t('login_forgot_password')}}</a>
                            </h6>
                        </div>

                        <!-- Formulário de recuperação de senha (visível quando forgotPassword é true) -->
                        <div v-else>
                            <h2 class="textblue text-5xl">{{ $t('login_forgot_password') }}</h2>
                            <h4>{{ $t('login_recover_email') }}</h4>

                            <!-- Campo de email para recuperação -->
                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block texto-cinza-500">{{$t('email')}}:</label>
                                <input type="email" name="reset-email" id="reset-email" class="formstyle" placeholder="Digite o seu email" autocomplete="on" v-model="mail" />
                            </div>

                            <!-- Botão para enviar o link de recuperação -->
                            <button @click.prevent="resetPassword" class="btn_button w-full py-3 px-3 border-round-sm text-nowrap">{{$t('login_forgot_link')}}</button>

                            <!-- Link para voltar ao login -->
                            <h6 class="mt-3 text-center">
                                <a href="#" @click.prevent="forgotPassword = false" class="textblue font-semibold hover:text-orange-500">{{$t('return_login')}}</a>
                            </h6>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Rodapé com link para o site da empresa -->
            <div>
                <p class="text-sm">{{ $t('site_greet') }} <a href="https://www.lab220.com.br/" class="textblue font-semibold">lab220.com.br</a></p>
            </div>
        </SplitterPanel>
    </Splitter>
</template>

<style>
/* Regras para layout responsivo */
@media (max-width: 768px) {
    .colunaesquerda {
        display: none;
    }
}

@media (min-width: 769px) {
    .colunaesquerda {
        display: flex;
    }
}

@media (max-width: 2560px) {
    .colunadireita {
        border-left: 1px solid #ced4da;
        padding: 40px;
    }
}

.colunaesquerda {
    background: #e4e4e4;
}

.formstyle {
    color: #212229;
    font-weight: 500;
    border-width: 2px;
    border-color: #dee2e6;
    width: 100%;
    height: 38px;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
}

#img {
    border-style: none;
    width: 233px;
    height: 58px;
}

.textblue {
    color: #326fd1;
}

.p-splitter-gutter {
    display: none !important; /* Esconde o separador */
}

.p-error {
    color: red;
    font-weight: bold;
}

.div-error {
    margin-bottom: 1.25rem;
}

.login-button {
    transition: all 0.5s ease;
    border: none;
}

.login-button:hover {
    background-color: #fb5c2b;
    transform: scale(1.02);
}
.flag-icon {
    width: 20px; /* Ajuste o tamanho conforme necessário */
    height: 15px;
    margin-right: 8px;
    vertical-align: middle;
}

.btn_button {
    background-color:#326FD1 !important; 
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin-top: 10px;
    cursor: pointer;
}
.btn_button:hover {
    background-color: #fb5c2b !important;
    transform: scale(1.02);
}

</style>
