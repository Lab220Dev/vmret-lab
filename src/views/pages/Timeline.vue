<script setup>
/**
 * Importação do hook `ref` do Vue para criar variáveis reativas.
 * 
 * @module vue
 */
 import { ref } from 'vue'; // Importa a função 'ref' do Vue para criar variáveis reativas

/**
 * Define os eventos personalizados que serão usados no componente Timeline.
 * A estrutura de cada evento inclui: status, data, ícone, cor, e uma imagem opcional.
 * Esses eventos serão renderizados na interface do usuário para mostrar uma linha do tempo de ações.
 * 
 * @type {import('vue').Ref<Array<{ status: string, date: string, icon: string, color: string, image?: string }>>}
 */
const customEvents = ref([ // Define a variável reativa 'customEvents' que contém os eventos personalizados a serem exibidos
    {
        status: 'Ordered', // Status do evento, indicando que o pedido foi feito
        date: '15/10/2020 10:30', // Data e hora do evento (formato: dd/MM/yyyy HH:mm)
        icon: 'pi pi-shopping-cart', // Ícone associado ao evento, usando o prefixo 'pi' para ícones do PrimeIcons
        color: '#9C27B0', // Cor do ícone em formato hexadecimal (roxo)
        image: 'game-controller.jpg' // Imagem associada ao evento (opcional), representando o produto (se houver)
    },
    {
        status: 'Processing', // Status do evento, indicando que o pedido está sendo processado
        date: '15/10/2020 14:00', // Data e hora do evento
        icon: 'pi pi-cog', // Ícone associado ao evento (ícone de engrenagem)
        color: '#673AB7' // Cor do ícone (roxo escuro)
    },
    {
        status: 'Shipped', // Status do evento, indicando que o pedido foi enviado
        date: '15/10/2020 16:15', // Data e hora do evento
        icon: 'pi pi-envelope', // Ícone associado ao evento (ícone de envelope, geralmente usado para representar envio)
        color: '#FF9800' // Cor do ícone (laranja)
    },
    {
        status: 'Delivered', // Status do evento, indicando que o pedido foi entregue
        date: '16/10/2020 10:00', // Data e hora do evento
        icon: 'pi pi-check', // Ícone associado ao evento (ícone de check, indicando que o evento foi completado com sucesso)
        color: '#607D8B' // Cor do ícone (cinza azulado)
    }
]);

/**
 * Define os eventos horizontais para o uso do componente Timeline com layout horizontal.
 * Esses eventos podem ser usados para representar anos ou outras unidades de tempo de forma visual
 * na linha do tempo, no formato de um eixo temporal.
 * 
 * @type {import('vue').Ref<Array<string>>}
 */
const horizontalEvents = ref([ // Define a variável reativa 'horizontalEvents' que contém os eventos horizontais
    '2020', // Representa o evento para o ano de 2020
    '2021', // Representa o evento para o ano de 2021
    '2022', // Representa o evento para o ano de 2022
    '2023'  // Representa o evento para o ano de 2023
]);


</script>

<template>
    <!-- Primeira grid com as seções de Timeline para diferentes alinhamentos -->
    <div class="grid">
        
        <!-- Seção para mostrar a Timeline com alinhamento à esquerda -->
        <div class="col-6">
            <div class="card">
                <h5>Left Align</h5>
                <!-- Componente Timeline com alinhamento à esquerda (padrão) -->
                <Timeline :value="customEvents">
                    <!-- Template para conteúdo de cada evento -->
                    <template #content="slotProps">
                        {{ slotProps.item.status }} <!-- Exibe o status do evento -->
                    </template>
                </Timeline>
            </div>
        </div>

        <!-- Seção para mostrar a Timeline com alinhamento à direita -->
        <div class="col-6">
            <div class="card">
                <h5>Right Align</h5>
                <!-- Componente Timeline com alinhamento à direita -->
                <Timeline :value="customEvents" align="right">
                    <!-- Template para conteúdo de cada evento -->
                    <template #content="slotProps">
                        {{ slotProps.item.status }} <!-- Exibe o status do evento -->
                    </template>
                </Timeline>
            </div>
        </div>

        <!-- Seção para mostrar a Timeline com alinhamento alternado -->
        <div class="col-6">
            <div class="card">
                <h5>Alternate Align</h5>
                <!-- Componente Timeline com alinhamento alternado -->
                <Timeline :value="customEvents" align="alternate">
                    <!-- Template para conteúdo de cada evento -->
                    <template #content="slotProps">
                        {{ slotProps.item.status }} <!-- Exibe o status do evento -->
                    </template>
                </Timeline>
            </div>
        </div>

        <!-- Seção para mostrar a Timeline com conteúdo oposto -->
        <div class="col-6">
            <div class="card">
                <h5>Opposite Content</h5>
                <!-- Componente Timeline com alinhamento à esquerda -->
                <Timeline :value="customEvents">
                    <!-- Template para exibir conteúdo oposto (data do evento) -->
                    <template #opposite="slotProps">
                        <small class="p-text-secondary">{{ slotProps.item.date }}</small>
                    </template>
                    <!-- Template para exibir conteúdo normal (status do evento) -->
                    <template #content="slotProps">
                        {{ slotProps.item.status }} <!-- Exibe o status do evento -->
                    </template>
                </Timeline>
            </div>
        </div>
    </div>

    <!-- Seção com Timeline customizada com marcadores e conteúdo -->
    <div class="card">
        <h5>Custom Timeline</h5>
        <!-- Componente Timeline com alinhamento alternado e customização de marcador -->
        <Timeline :value="customEvents" align="alternate" class="customized-timeline">
            <!-- Template para customizar o marcador -->
            <template #marker="slotProps">
                <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                    <i :class="slotProps.item.icon"></i> <!-- Ícone do evento -->
                </span>
            </template>
            <!-- Template para exibir o conteúdo do evento -->
            <template #content="slotProps">
                <!-- Exibe um card com título, subtítulo e conteúdo -->
                <Card>
                    <template #title>
                        {{ slotProps.item.status }} <!-- Exibe o status do evento -->
                    </template>
                    <template #subtitle>
                        {{ slotProps.item.date }} <!-- Exibe a data do evento -->
                    </template>
                    <template #content>
                        <!-- Se o evento tiver uma imagem, exibe a imagem -->
                        <img v-if="slotProps.item.image" :src="'/demo/images/product/' + slotProps.item.image" :alt="slotProps.item.name" width="200" class="shadow-2 mb-3" />
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate
                            neque quas!
                        </p>
                        <Button label="Read more" class="p-button-text"></Button>
                    </template>
                </Card>
            </template>
        </Timeline>
    </div>

    <!-- Seção com Timeline horizontal e diferentes alinhamentos -->
    <div class="card mt-3">
        <h5>Horizontal</h5>

        <!-- Timeline horizontal com alinhamento ao topo -->
        <h6>Top Align</h6>
        <Timeline :value="horizontalEvents" layout="horizontal" align="top">
            <!-- Template para conteúdo de cada evento -->
            <template #content="slotProps">
                {{ slotProps.item }} <!-- Exibe o valor do evento (ano) -->
            </template>
        </Timeline>

        <!-- Timeline horizontal com alinhamento para o fundo -->
        <h6>Bottom Align</h6>
        <Timeline :value="horizontalEvents" layout="horizontal" align="bottom">
            <!-- Template para conteúdo de cada evento -->
            <template #content="slotProps">
                {{ slotProps.item }} <!-- Exibe o valor do evento (ano) -->
            </template>
        </Timeline>

        <!-- Timeline horizontal com alinhamento alternado -->
        <h6>Alternate Align</h6>
        <Timeline :value="horizontalEvents" layout="horizontal" align="alternate">
            <!-- Template para conteúdo oposto (em branco) -->
            <template #opposite> &nbsp; </template>
            <!-- Template para conteúdo de cada evento -->
            <template #content="slotProps">
                {{ slotProps.item }} <!-- Exibe o valor do evento (ano) -->
            </template>
        </Timeline>
    </div>
</template>

<style lang="scss" scoped>
/* Responsividade para ajustar a Timeline personalizada em telas menores */
@media screen and (max-width: 960px) {
    ::v-deep(.customized-timeline) {
        /* Ajusta a direção dos eventos em telas menores */
        .p-timeline-event:nth-child(even) {
            flex-direction: row !important;
            /* Ajusta o texto de cada evento para alinhamento à esquerda */
            .p-timeline-event-content {
                text-align: left !important;
            }
        }

        /* Ajusta o comportamento do conteúdo oposto da Timeline */
        .p-timeline-event-opposite {
            flex: 0;
        }

        /* Adiciona margem ao card quando o layout for ajustado */
        .p-card {
            margin-top: 1rem;
        }
    }
}
</style>
