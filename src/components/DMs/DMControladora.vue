<!-- DMControladora.vue -->
<template>
    <div class="card">
      <h5>Controladora {{ index + 1 }}</h5>
      <Dropdown v-model="controladora.tipo" :options="tipoControladoras"
                placeholder="Selecione o tipo de Controladora" @change="updateTipoControladora(index, controladora.tipo)" />
      <Button icon="pi pi-trash" label="Remover" class="p-button-danger"
              @click="removeControladora(index)" />
  
      <template v-if="controladora.tipo === '2018'">
        <!-- Renderiza os campos específicos da controladora 2018 -->
      </template>
      <template v-if="controladora.tipo === '2023'">
        <!-- Renderiza os campos específicos da controladora 2023 -->
      </template>
      <template v-if="controladora.tipo === '2024'">
        <!-- Renderiza os campos específicos da controladora 2024 -->
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps(['index', 'controladora', 'tipoControladoras']);
  
  const removeControladora = (index) => {
      emit('remove-controladora', index);
  };
  
  const updateTipoControladora = (index, tipo) => {
      emit('update-tipo-controladora', { index, tipo });
  };
  </script>
  