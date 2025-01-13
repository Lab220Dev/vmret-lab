<template>
  <!-- Componente para gerenciar controladoras -->
  <div class="card">
    <h5>Controladora {{ index + 1 }}</h5>
    <!-- Dropdown para selecionar o tipo de controladora -->
    <Dropdown 
    v-model="controladora.tipo" 
    :options="tipoControladoras" 
    placeholder="Selecione o tipo de Controladora" 
    @change="updateTipoControladora(index, controladora.tipo)" />
    <!-- Botão para remover a controladora -->
    <Button icon="pi pi-trash" label="Remover" class="p-button-danger"
            @click="removeControladora(index)" />
    <!-- Renderização condicional de campos específicos para cada tipo de controladora -->
    <template v-if="controladora.tipo === '2018'">
      <!-- Campos específicos para a controladora de tipo 2018 -->
    </template>
    <template v-if="controladora.tipo === '2023'">
      <!-- Campos específicos para a controladora de tipo 2023 -->
    </template>
    <template v-if="controladora.tipo === '2024'">
      <!-- Campos específicos para a controladora de tipo 2024 -->
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';//ref é usado para reatividade

/**
* Propriedades do componente.
*
* @typedef {Object} Props
* @property {number} index - Índice da controladora no array de controladoras.
* @property {Object} controladora - Objeto que representa os dados da controladora.
* @property {Array} tipoControladoras - Lista de tipos de controladoras disponíveis.
*/

const props = defineProps(['index', 'controladora', 'tipoControladoras']); 

/**
* Função para remover uma controladora do array.
*
* @function removeControladora
* @param {number} index - Índice da controladora a ser removida.
*/
const removeControladora = (index) => {
  emit('remove-controladora', index); // Emite um evento para o componente pai remover a controladora
};

/**
* Função para atualizar o tipo da controladora selecionada.
*
* @function updateTipoControladora
* @param {number} index - Índice da controladora.
* @param {string} tipo - Novo tipo da controladora.
*/
const updateTipoControladora = (index, tipo) => {
  emit('update-tipo-controladora', { index, tipo }); // Emite um evento para o componente pai atualizar o tipo da controladora
};
</script>