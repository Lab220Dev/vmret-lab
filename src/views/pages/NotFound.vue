<script setup>
  // Este script setup está vazio, sem lógica de Vue.js ou operações dentro dele.
  // Em um cenário de erro 404, normalmente não haveria necessidade de lógica adicional aqui.
</script>

<template>
    <!-- Contêiner principal que preenche toda a tela com uma altura mínima de 100vh e largura mínima de 100vw -->
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        
        <!-- Flex container que organiza os elementos dentro do 404 page com alinhamento vertical e horizontal no centro -->
        <div class="flex flex-column align-items-center justify-content-center">

            <!-- Logo exibido na parte superior da página 404, com um tamanho fixo e margem inferior -->
            <img src="/demo/images/notfound/logo-blue.svg" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            
            <!-- Caixa de fundo com gradiente azul, arredondado, utilizado para conter as informações da página 404 -->
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                
                <!-- Cartão com as informações principais do erro 404, possui bordas arredondadas e padding -->
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    
                    <!-- Número "404", que é o código de erro HTTP padrão para "Página Não Encontrada", estilizado com uma cor azul -->
                    <span class="text-blue-500 font-bold text-3xl">404</span>
                    
                    <!-- Título "Not Found", com uma fonte forte, texto em negrito e tamanho grande para destacar o erro -->
                    <h1 class="text-900 font-bold text-3xl lg:text-5xl mb-2">Not Found</h1>
                    
                    <!-- Mensagem informando que o recurso solicitado não está disponível -->
                    <div class="text-600 mb-5">Requested resource is not available.</div>
                    
                    <!-- Link para a página inicial, representado por uma seção clicável -->
                    <router-link to="/" class="w-full flex align-items-center py-5 border-300 border-bottom-1">
                        
                        <!-- Ícone de uma tabela (relacionado ao FAQ), com um fundo ciano, bordas arredondadas e tamanho fixo -->
                        <span class="flex justify-content-center align-items-center bg-cyan-400 border-round" style="height: 3.5rem; width: 3.5rem">
                            <i class="text-50 pi pi-fw pi-table text-2xl"></i> <!-- Ícone de uma tabela -->
                        </span>
                        
                        <!-- Texto associado ao primeiro link, com título e uma descrição do FAQ -->
                        <span class="ml-4 flex flex-column">
                            <span class="text-900 lg:text-xl font-medium mb-0 block">Frequently Asked Questions</span>  <!-- Título: "FAQ" -->
                            <span class="text-600 lg:text-xl">Ultricies mi quis hendrerit dolor.</span>  <!-- Descrição do FAQ -->
                        </span>
                    </router-link>
                    
                    <!-- Link para o "Solution Center", representado por uma seção clicável -->
                    <router-link to="/" class="w-full flex align-items-center py-5 border-300 border-bottom-1">
                        
                        <!-- Ícone de um círculo de pergunta (relacionado à ajuda ou suporte), com fundo laranja -->
                        <span class="flex justify-content-center align-items-center bg-orange-400 border-round" style="height: 3.5rem; width: 3.5rem">
                            <i class="pi pi-fw pi-question-circle text-50 text-2xl"></i> <!-- Ícone de uma pergunta -->
                        </span>
                        
                        <!-- Texto associado ao link de "Solution Center" -->
                        <span class="ml-4 flex flex-column">
                            <span class="text-900 lg:text-xl font-medium mb-0">Solution Center</span>  <!-- Título: "Solution Center" -->
                            <span class="text-600 lg:text-xl">Phasellus faucibus scelerisque eleifend.</span>  <!-- Descrição: Informações sobre soluções -->
                        </span>
                    </router-link>
                    
                    <!-- Link para o "Permission Manager", representado por uma seção clicável -->
                    <router-link to="/" class="w-full flex align-items-center mb-5 py-5 border-300 border-bottom-1">
                        
                        <!-- Ícone de um cadeado (relacionado ao gerenciamento de permissões), com fundo roxo -->
                        <span class="flex justify-content-center align-items-center bg-indigo-400 border-round" style="height: 3.5rem; width: 3.5rem">
                            <i class="pi pi-fw pi-unlock text-50 text-2xl"></i> <!-- Ícone de desbloqueio -->
                        </span>
                        
                        <!-- Texto associado ao link de "Permission Manager" -->
                        <span class="ml-4 flex flex-column">
                            <span class="text-900 lg:text-xl font-medium mb-0">Permission Manager</span>  <!-- Título: "Permission Manager" -->
                            <span class="text-600 lg:text-xl">Accumsan in nisl nisi scelerisque</span>  <!-- Descrição: Informações sobre gerenciamento de permissões -->
                        </span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
