<script setup>
import { ref, reactive } from 'vue';//reactive e ref são usados para reatividade
/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {string|null} header - O título do bloco.
 * @property {string|null} code - O código que será exibido no bloco (geralmente em formato de código).
 * @property {boolean} recent - Define se o bloco é recente. Exibe a badge "New" se verdadeiro.
 * @property {boolean} free - Define se o bloco é gratuito. Exibe a badge "Free" se verdadeiro.
 * @property {string|null} containerClass - Classe adicional para o container do bloco.
 * @property {string|null} previewStyle - Estilo customizado para a visualização do bloco.
 */
const props = defineProps({//defineProps é usado para definir as propriedades do componente
    header: { // `header` recebe uma string ou nulo
        type: String, // Define o tipo da propriedade como string
        default: null // Define o valor padrão como nulo
    },
    code: null, // `code` pode ser qualquer tipo (geralmente uma string com o código a ser exibido)
    recent: { // `recent` recebe um booleano (indica se o bloco é recente)
        type: Boolean, // Define o tipo da propriedade como booleano
        default: false // Define o valor padrão como falso
    }, 
    free: {// `free` recebe um booleano (indica se o bloco é gratuito) 
        type: Boolean, // Define o tipo da propriedade como booleano
        default: false // Define o valor padrão como falso
    }, // `free` recebe um booleano (indica se o bloco é gratuito)
    containerClass: null, // `containerClass` pode ser qualquer tipo (classe adicional para o container)
    previewStyle: null // `previewStyle` pode ser qualquer tipo (estilo customizado para o preview)
});

/**
 * Enumeração dos estados possíveis de visualização do bloco.
 * 
 * @readonly
 * @enum {number}
 */
 const BlockView = reactive({ // `BlockView` é uma enumeração reativa dos estados de visualização
    PREVIEW: 0, // Visualização do Preview
    CODE: 1 // Visualização do Código
});

/**
 * Variável reativa que controla a visualização ativa do bloco.
 *
 * @type {Ref<number>}
 */
const blockView = ref(0); // `blockView` armazena o estado da visualização ativa (Preview ou Código)

/**
 * Ativa a visualização desejada (Preview ou Código).
 * 
 * @param {Event} event - O evento de clique.
 * @param {number} blockViewValue - O valor da visualização a ser ativada.
 */
 function activateView(event, blockViewValue) { // `activateView` ativa a visualização desejada (Preview ou Código)
    blockView.value = blockViewValue; // Ativa a visualização com o valor fornecido
    event.preventDefault(); // Evita o comportamento padrão do clique
}

/**
 * Copia o código para a área de transferência.
 * 
 * @param {Event} event - O evento de clique.
 */
async function copyCode(event) {// `copyCode` copia o código para a área de transferência
    await navigator.clipboard.writeText(props.code); // Copia o conteúdo de `props.code` para a área de transferência
    event.preventDefault(); // Evita o comportamento padrão do clique
}
</script>

<template><!-- Template do componente -->
    <!-- Bloco de seção -->
    <div class="block-section">
        <!-- Cabeçalho do bloco -->
        <div class="block-header">
            <!-- Título do bloco -->
            <span class="block-title">
                <span>{{ header }}</span>
                <span class="badge-new" v-if="recent">New</span>
                <span class="badge-free" v-if="free">Free</span>
            </span>
            <!-- Ações do bloco -->
            <div class="block-actions">
                <!-- Botões para alternar entre visualizações -->
                <a tabindex="0" :class="{ 'block-action-active': blockView === BlockView.PREVIEW }" @click="activateView($event, BlockView.PREVIEW)">
                    <span>Preview</span>
                </a>
                <a :tabindex="'0'" :class="{ 'block-action-active': blockView === BlockView.CODE }" @click="activateView($event, BlockView.CODE)">
                    <span>Code</span>
                </a>
                <!-- Botão para copiar o código -->
                <a :tabindex="0" class="block-action-copy" @click="copyCode($event)" v-tooltip.focus.bottom="{ value: 'Copied to clipboard' }">
                    <i class="pi pi-copy"></i>
                </a>
            </div>
        </div>
          <!-- Conteúdo do bloco -->
          <div class="block-content">
            <!-- Exibe o conteúdo do preview se a visualização ativa for o Preview -->
            <div :class="containerClass" :style="previewStyle" v-if="blockView == BlockView.PREVIEW">
                <slot></slot>
            </div>
            <!-- Exibe o código se a visualização ativa for o Code -->
            <div v-if="blockView === BlockView.CODE">
                <pre class="app-code"><code>{{code}}</code></pre>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
/**
 * Estilo geral da seção de bloco
 */
 .block-section {
    margin-bottom: 4rem; // Define a margem inferior de 4rem para a seção de bloco, criando espaçamento entre elementos
    overflow: hidden; // Garante que o conteúdo que ultrapassar os limites da caixa será ocultado
}

/**
 * Estilo do cabeçalho do bloco
 */
.block-header {
    padding: 1rem 2rem; // Adiciona padding (espaçamento interno) de 1rem nas laterais e 2rem no topo e fundo
    background-color: var(--surface-section); // Define a cor de fundo do cabeçalho com a variável CSS 'surface-section'
    border-top-left-radius: 12px; // Adiciona um raio de borda de 12px ao canto superior esquerdo
    border-top-right-radius: 12px; // Adiciona um raio de borda de 12px ao canto superior direito
    border: 1px solid var(--surface-d); // Define uma borda de 1px de cor 'surface-d' ao redor do cabeçalho
    display: flex; // Usa o layout flexbox para o conteúdo dentro do cabeçalho
    align-items: center; // Alinha os itens do cabeçalho verticalmente ao centro
    justify-content: space-between; // Distribui o conteúdo no cabeçalho com espaço entre os elementos
}

/**
 * Estilo do título dentro do cabeçalho
 */
.block-title {
    font-weight: 700; // Define a fonte em negrito (peso 700)
    display: inline-flex; // Exibe o título como um elemento flexível inline
    align-items: center; // Alinha os itens do título verticalmente ao centro

    /**
     * Estilo da badge que é exibida ao lado do título
     */
    .badge-free {
        border-radius: 4px; // Adiciona bordas arredondadas de 4px à badge
        padding: 0.25rem 0.5rem; // Define padding de 0.25rem no topo e fundo e 0.5rem nas laterais
        background-color: var(--orange-500); // Define a cor de fundo como um tom de laranja usando a variável CSS 'orange-500'
        color: white; // Define a cor do texto da badge como branco
        margin-left: 1rem; // Define a margem esquerda de 1rem para separar a badge do título
        font-weight: 700; // Define o peso da fonte da badge como negrito
        font-size: 0.875rem; // Define o tamanho da fonte da badge como 0.875rem
    }
}

/**
 * Estilo para as ações dentro do cabeçalho do bloco (botões e links)
 */
.block-actions {
    display: flex; // Exibe as ações como um layout flexbox
    align-items: center; // Alinha os itens de ação verticalmente ao centro
    justify-content: space-between; // Distribui as ações com espaço entre os elementos
    user-select: none; // Desabilita a seleção de texto nas ações (impede que o usuário selecione o texto acidentalmente)
    margin-left: 1rem; // Define uma margem à esquerda das ações

    /**
     * Estilo dos links de ação
     */
    a {
        display: flex; // Exibe os links como elementos flexíveis
        align-items: center; // Alinha os itens de cada link verticalmente ao centro
        margin-right: 0.75rem; // Define a margem direita de 0.75rem entre os links
        padding: 0.5rem 1rem; // Adiciona padding de 0.5rem nas laterais e 1rem no topo e fundo
        border-radius: 4px; // Adiciona bordas arredondadas de 4px aos links
        font-weight: 600; // Define o peso da fonte como semi-negrito
        border: 1px solid transparent; // Define uma borda de 1px transparente, para que o link tenha uma área clicável visível
        transition: background-color 0.2s; // Adiciona uma transição suave de 0.2s na mudança da cor de fundo
        cursor: pointer; // Define o cursor como ponteiro (mão) ao passar o mouse sobre o link

        /**
         * Estilo para o último link, removendo a margem direita
         */
        &:last-child {
            margin-right: 0; // Remove a margem direita do último link
        }

        /**
         * Estilo para o link quando não estiver desabilitado e for hover
         */
        &:not(.block-action-disabled):hover {
            background-color: var(--surface-c); // Altera a cor de fundo do link ao passar o mouse, usando a variável CSS 'surface-c'
        }

        /**
         * Estilo para links de ação ativa
         */
        &.block-action-active {
            border-color: var(--primary-color); // Define a cor da borda como a cor primária
            color: var(--primary-color); // Define a cor do texto como a cor primária
        }

        /**
         * Estilo para links de ação de cópia
         */
        &.block-action-copy {
            i {
                color: var(--primary-color); // Define a cor do ícone como a cor primária
                font-size: 1.25rem; // Define o tamanho do ícone como 1.25rem
            }
        }

        /**
         * Estilo para links desabilitados
         */
        &.block-action-disabled {
            opacity: 0.6; // Reduz a opacidade para 0.6 para indicar que está desabilitado
            cursor: auto !important; // Altera o cursor para o padrão, desabilitando o efeito de ponteiro
        }

        /**
         * Estilo para o ícone dentro dos links
         */
        i {
            margin-right: 0.5rem; // Adiciona uma margem de 0.5rem à direita do ícone
        }
    }
}

/**
 * Estilo do conteúdo dentro do bloco
 */
.block-content {
    padding: 0; // Remove o padding interno do conteúdo do bloco
    border: 1px solid var(--surface-d); // Define uma borda de 1px ao redor do conteúdo, com cor 'surface-d'
    border-top: 0 none; // Remove a borda superior
    border-bottom-left-radius: 12px; // Adiciona borda arredondada de 12px ao canto inferior esquerdo
    border-bottom-right-radius: 12px; // Adiciona borda arredondada de 12px ao canto inferior direito
    overflow: hidden; // Garante que o conteúdo que ultrapassar os limites do bloco será ocultado
}

/**
 * Estilo para o pré-formatado de código
 */
pre[class*='language-'] {
    margin: 0 !important; // Remove qualquer margem do elemento <pre> para garantir que não haja espaços extras

    /**
     * Remove os pseudo-elementos antes e depois do código
     */
    &:before,
    &:after {
        display: none !important; // Garante que os pseudo-elementos antes e depois do código não sejam exibidos
    }

    /**
     * Estilo do código dentro do <pre>
     */
    code {
        border-left: 0 none !important; // Remove a borda à esquerda do código
        box-shadow: none !important; // Remove qualquer sombra no código
        background: var(--surface-e) !important; // Define a cor de fundo do código com a variável 'surface-e'
        margin: 0; // Remove a margem do código
        color: var(--text-color); // Define a cor do texto do código com a variável de cor de texto
        font-size: 14px; // Define o tamanho da fonte como 14px
        padding: 0 2rem !important; // Adiciona padding horizontal de 2rem ao redor do código

        /**
         * Estilo para tokens específicos no código
         */
        .token {
            &.tag,
            &.keyword {
                color: #2196f3 !important; // Define a cor azul para tags e palavras-chave
            }

            &.attr-name,
            &.attr-string {
                color: #2196f3 !important; // Define a cor azul para atributos e strings
            }

            &.attr-value {
                color: #4caf50 !important; // Define a cor verde para os valores dos atributos
            }

            &.punctuation {
                color: var(--text-color); // Define a cor de pontuação com a cor de texto padrão
            }

            &.operator,
            &.string {
                background: transparent; // Remove qualquer fundo para operadores e strings
            }
        }
    }
}

/**
 * Estilos para telas pequenas (máximo de 575px)
 */
@media screen and (max-width: 575px) {
    .block-header {
        flex-direction: column; // Muda o layout para coluna, empilhando os elementos verticalmente
        align-items: start; // Alinha os itens ao início da linha (à esquerda)

        .block-actions {
            margin-top: 1rem; // Adiciona uma margem superior de 1rem para as ações
            margin-left: 0; // Remove a margem à esquerda das ações
        }
    }
}

</style>
