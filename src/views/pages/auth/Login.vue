<script setup>

import { ref } from 'vue'; 
import { useRouter } from 'vue-router'
import axios from '@/axios.js'
import { useAuthStore } from '@/store/authStore';

const router = useRouter()
const username = ref('');
const password = ref('');
const error = ref(null);
const forgotPassword = ref(false);
const authStore = useAuthStore();

function resetPassword() {
    alert("O link de recuperação foi enviado com sucesso! Verifique a caixa de entrada seu email. Contate o nosso suporte caso continue enfrentando problemas para logar: suporte@lab220.com.br"); // função que vai abrir uma "messagebox" se a operação for concluida
    forgotPassword.value = false;
}
const login = async () => {
    try {
        const response = await axios.post('/login', {
            email: username.value,
            senha: password.value,
        });
        if (response.status === 200) {
            authStore.login({ token: response.data.token, usuario: response.data.Usuario });
            // localStorage.setItem('usuario:', JSON.stringify(response.data.Usuario));
            router.push({ name: 'Dashboard' });// Redirecionar para o dashboard
        }
    } catch (err) {
        error.value = err.response?.data?.message || err.message;
    }
};
</script>

<template>
    <Splitter class="flex justify-content-center align-items-center min-h-screen" style="height: 300px">
        <SplitterPanel
            class="colunaesquerda flex-column h-screen justify-content-center align-items-center text-left m-0"
            :size="65">
            <div class="flex align-items-center">
                <svg class="align-items-center justify-content-center" xmlns="http://www.w3.org/2000/svg" width="6em"
                    height="6em" viewBox="2 2 22 22">
                    <path fill="#494c57"
                        d="m11.614 13.98l4.908 4.922c.39.391.99.36 1.286-.106a8.99 8.99 0 0 0 1.393-4.815a9.005 9.005 0 0 0-1.972-5.631zM9 14.396V7.041a7.008 7.008 0 0 0-6 6.939C3 17.856 6.134 21 10 21a6.946 6.946 0 0 0 4.186-1.403zm7.331-8.183c.39-.391.365-.999-.089-1.313a10.925 10.925 0 0 0-4.251-1.765c-.544-.1-.991.312-.991.865v7.56z" />
                </svg>

                <div class="block justify-content-center">
                    <h1 class="align-items-center justify-content-center text-800 font-italic m-0">VM<span
                            class="font-bold text-blue-600 mt-0 mb-0">WEB</span></h1>
                    <H4 class="text-lg m-0">Sistema de Gerenciamento de Dispenser Machines</H4>
                </div>
            </div>


        </SplitterPanel>

        <SplitterPanel class="flex colunadireita flex-column h-screen justify-content-between bg-white" :size="35"
            :minSize="30">
            <div class="logolab">
                <img id="img" src="@\assets\images\LogoLabSF.png" alt="Logo da empresa">
            </div>
            <div>

                <div class="login">
                    <form id="form-login" method="post" autocomplete="off">
                        <div v-if="!forgotPassword">
                            <h2 class="text-blue-600 text-5xl">Vamos começar!</h2>
                            <h4>Para acessar o sistema, preencha os campos abaixo.</h4>
                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block texto-cinza-500">Email:</label>
                                <input type="email" v-model="username" name="email" id="email" class="formstyle"
                                    placeholder="Digite o seu email" autocomplete="on">
                            </div>

                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block texto-cinza-500">Senha:</label>
                                <input type="password" v-model="password" name="senha" id="senha" class="formstyle"
                                    placeholder="Digite a sua senha" autocomplete="on">
                            </div>
                            <button id="btn_button"
                                class="login-button text-white bg-blue-600 hover:bg-orange-500 w-full cursor-pointer py-3 px-3 border-round-sm"
                                @click.prevent="login">LOGIN</button>
                                <div v-if="error" class="error">{{ error }}</div>
                            <h6 class="mt-3 text-center">
                                <a href="#" @click.prevent="forgotPassword = true"
                                    class="text-blue-500 font-semibold hover:text-orange-500">Esqueceu sua senha?</a>
                            </h6>
                        </div>
                        <div v-else>
                            <h2 class="text-blue-600 text-5xl">Esqueceu sua senha?</h2>
                            <h4>Insira seu email para recuperar seu acesso:</h4>
                            <div class="form mb-3">
                                <label class="mb-2 inline font-semibold inline-block texto-cinza-500">Email:</label>
                                <input type="email" name="reset-email" id="reset-email" class="formstyle"
                                    placeholder="Digite o seu email" autocomplete="on">
                            </div>
                            <button @click="resetPassword"
                                class="login-button text-white bg-blue-600 hover:bg-orange-500 w-full cursor-pointer py-3 px-3 border-round-sm">Enviar
                                link de recuperação</button>
                            <h6 class="mt-3 text-center">
                                <a href="#" @click.prevent="forgotPassword = false"
                                    class="text-blue-500 font-semibold hover:text-orange-500">Voltar para login</a>
                            </h6>
                        </div>
                    </form>
                </div>
            </div>
            <div>
                <p class="text-color-secondary text-sm">Visite nosso site <a href="https://www.lab220.com.br/"
                        class="text-blue-500 font-semibold hover:text-orange-500">lab220.com.br</a></p>
            </div>
        </SplitterPanel>
    </Splitter>
</template>


<style>
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


.p-splitter-gutter {
    display: none;
}

label.erro {
    color: red;
    font-weight: 450;
}

.login-button {
    transition: all 0.5s ease;
    border: none;
}

.login-button:hover {
    background-color: #fb5c2b;
    transform: scale(1.02);
}
</style>