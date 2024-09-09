<!-- DMList.vue -->
<template>
    <div class="col-12">
      <DataTable v-model:filters="filters" :value="ListaDMS" selectionMode="single"
                 tableStyle="min-width: 25%" :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows
                 dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect" paginator
                 :rows="10" :globalFilterFields="['id_DM', 'nome', 'email', 'nome_cliente', 'local', 'atualizado']">
        <template #header>
          <div class="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Busca" />
            </IconField>
          </div>
        </template>
        <Column field="ID_DM" header="Id"></Column>
        <Column field="Numero" header="Número"></Column>
        <Column field="Identificacao" header="Identificação"></Column>
        <Column field="ClienteNome" header="Cliente"></Column>
        <Column field="local" header="Localização"></Column>
        <Column field="Ativo" header="Ativo">
          <template #body="{ data }">
            <i class="pi"
               :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
          </template>
        </Column>
        <Column field="Updated" header="Atualizado">
          <template #body="{ data }">
            {{ formatDate(new Date(data.Updated)) }}
          </template>
        </Column>
        <Column style="min-width: 8rem">
          <template #body="slotProps">
            <Button icon="pi pi-trash" outlined rounded severity="danger"
                    @click="deleteDM(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </template>
  
  <script setup>
  import { ref ,onMounted} from 'vue';
  import { useToast } from 'primevue/usetoast';
  import axios from '@/axios.js';
  import { FilterMatchMode } from 'primevue/api';
  import { useAuthStore } from '@/store/authStore.js';
  
  const ListaDMS = ref([]);
  const filters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const toast = useToast();
  const store = useAuthStore();
  const loading = ref(false);
  
  const fetchDMS = async () => {
      loading.value = true;
      let data = null;
      if (admin()) {
          data = '';
      } else {
          data = {};
          data.id_cliente = store.userIdCliente;
      }
      try {
          const response = await axios.post('/DM/listar', data, {
              headers: {
                  Authorization: `Bearer ${store.token}`
              }
          });
          ListaDMS.value = response.data;
      } catch (error) {
          console.error('Erro ao carregar usuários:', error);
      } finally {
          loading.value = false;
      }
  };
  
  onMounted(() => {
      fetchDMS();
  });
  
  const onRowSelect = async (event) => {
      emit('row-selected', event.data);
  };
  
  const deleteDM = async (item) => {
      emit('delete-dm', item);
  };
  
  const admin = () => {
      return store.userRole === 'Administrador';
  };
  
  const formatDate = (value) => {
      if (!value) {
          return '';
      }
      try {
          const date = new Date(value);
          if (isNaN(date)) {
              throw new Error('Data inválida');
          }
          const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
          const day = String(localDate.getDate()).padStart(2, '0');
          const month = String(localDate.getMonth() + 1).padStart(2, '0');
          const year = localDate.getFullYear();
          const hours = String(localDate.getHours()).padStart(2, '0');
          const minutes = String(localDate.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
      } catch (error) {
          console.error('Erro ao formatar data:', error);
          return 'Data inválida';
      }
  };
  </script>
  