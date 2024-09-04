<!-- DMForm.vue -->
<template>
    <div class="mt-5 mx-0 p-fluid grid">
      <div class="full lg:col-12 md:col-12 sm:col-12">
        <label for="name">Cliente:</label>
        <Dropdown class="my-2" v-model="selectedClient" :options="ListaClientes"
                  optionLabel="label" optionValue="value" placeholder="Selecione um" />
      </div>
      <div class="full lg:col-6 md:col-9 sm:col-12">
        <label for="Numero">Numero da DM:</label>
        <InputText class="my-2" v-model="DM.Numero" id="Numero" />
      </div>
      <div class="full lg:col-6 md:col-9 sm:col-12">
        <label for="Identificacao">Identificação da DM:</label>
        <InputText class="my-2" v-model="DM.Identificacao" id="Identificacao" />
      </div>
      <!-- Outros campos... -->
      <Button label="Salvar" icon="pi pi-check" @click="saveDM" class="full mt-4 mr-2" />
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useAuthStore } from '@/store/authStore.js';
  import axios from '@/axios.js';
  
  const DM = ref({
      Numero: '',
      Identificacao: '',
      // Outros campos...
  });
  const selectedClient = ref(null);
  const ListaClientes = ref([]);
  const store = useAuthStore();
  
  const saveDM = async () => {
      const data = {
          id_usuario: store.userId,
          ...DM.value
      };
      try {
          const response = await axios.post('/DM/adicionar', data, {
              headers: {
                  Authorization: `Bearer ${store.token}`
              }
          });
          emit('dm-saved');
      } catch (error) {
          console.error('Erro ao adicionar DM:', error);
      }
  };
  
  onMounted(() => {
      fetchClientes();
  });
  
  const fetchClientes = async () => {
      try {
          const response = await axios.post('/admin/cliente/listar', {}, {
              headers: {
                  Authorization: `Bearer ${store.token}`
              }
          });
          ListaClientes.value = response.data.map((cliente) => ({
              label: cliente.nome,
              value: {
                  id_cliente: cliente.id_cliente,
                  nome_cliente: cliente.nome,
                  usar_api: cliente.usar_api
              }
          }));
      } catch (error) {
          console.error('Erro ao carregar clientes:', error);
      }
  };
  
  watch(
      () => DM.value.IDcliente,
      (newClienteId) => {
          const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);
          if (client) {
              selectedClient.value = client.value;
          }
      }
  );
  </script>
  