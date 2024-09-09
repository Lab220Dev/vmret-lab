<!-- DMItemList.vue -->
<template>
    <div class="card">
      <h5 class="mt-2">Itens da DM</h5>
      <Button class="m-1" label="Adicionar Itens" @click="emit('add-item')" />
      <div class="mt-5 mx-0 p-fluid grid">
        <DataTable :value="ListaItens" selectionMode="single" tableStyle="min-width: 25%"
                   :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows dataKey="id" :metaKeySelection="false"
                   @rowSelect="handleRowSelection" paginator :rows="10">
          <Column field="SKU" header="SKU"></Column>
          <Column field="Nome_Produto" header="Produto"></Column>
          <Column field="Posicao" header="Controladora/Placa/Motor 1/ Motor 2"></Column>
          <Column field="QTD" header="QTD"></Column>
          <Column style="min-width: 8rem">
            <template #body="slotProps">
              <Button icon="pi pi-trash" outlined rounded severity="danger"
                      @click="deleteItem(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from '@/axios.js';
  import { useAuthStore } from '@/store/authStore.js';
  
  const ListaItens = ref([]);
  const store = useAuthStore();
  const loading = ref(false);
  
  const fetchItemDM = async () => {
      loading.value = true;
      try {
          const data = {
              id_dm: DM.ID_DM,
              id_cliente: store.userIdCliente,
              id_usuario: store.userId
          };
          const response = await axios.post('/DM/listaritens', data, {
              headers: {
                  Authorization: `Bearer ${store.token}`
              }
          });
          ListaItens.value = response.data;
      } catch (error) {
          console.error('Erro ao carregar Itens:', error);
      } finally {
          loading.value = false;
      }
  };
  
  onMounted(() => {
      fetchItemDM();
  });
  
  const deleteItem = async (item) => {
      emit('delete-item', item);
  };
  
  const handleRowSelection = (event) => {
      emit('row-selected', event.data);
  };
  </script>
  