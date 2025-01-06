<script setup>
// Importa os hooks 'ref' do Vue para criar variáveis reativas
import { ref } from 'vue';

// Define os eventos personalizados que serão usados no componente Timeline
const customEvents = ref([
    {
        status: 'Ordered', // Status do evento
        date: '15/10/2020 10:30', // Data e hora do evento
        icon: 'pi pi-shopping-cart', // Ícone associado ao evento
        color: '#9C27B0', // Cor do ícone
        image: 'game-controller.jpg' // Imagem associada ao evento (opcional)
    },
    {
        status: 'Processing',
        date: '15/10/2020 14:00',
        icon: 'pi pi-cog',
        color: '#673AB7'
    },
    {
        status: 'Shipped',
        date: '15/10/2020 16:15',
        icon: 'pi pi-envelope',
        color: '#FF9800'
    },
    {
        status: 'Delivered',
        date: '16/10/2020 10:00',
        icon: 'pi pi-check',
        color: '#607D8B'
    }
]);

// Define os eventos horizontais para o uso do Timeline com layout horizontal
const horizontalEvents = ref(['2020', '2021', '2022', '2023']);
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
