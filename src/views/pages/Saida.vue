<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore.js';

const toast = useToast();
const store = useAuthStore();
const apiKey = ref('');
const isApiKeyVisible = ref(false);

async function fetchApiKey() {
    try {
        const response = await axios.post('/key/recuperar', 
        { 
            id_cliente: store.userIdCliente 
        }, 
        {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });  
        
        apiKey.value = response.data.apiKey;
    } catch (error) {
        console.error('Erro ao recuperar API key:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível recuperar a API key', life: 3000 });
    }
}

function toggleApiKeyVisibility() {
    isApiKeyVisible.value = !isApiKeyVisible.value;
}

function copyToClipboard() {
    navigator.clipboard.writeText(apiKey.value);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API copiada!', life: 3000 });
}

onMounted(() => {
    fetchApiKey();
});
</script>

<template>
    <div class="card">
      <h2>Sua Chave de API</h2>
      
      <InputText 
        :type="isApiKeyVisible ? 'text' : 'password'" 
        v-model="apiKey" 
        readonly 
        style="width: 100%; margin-bottom: 1rem;" 
      />
  
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <Button label="Copiar Chave" icon="pi pi-copy" @click="copyToClipboard" />
        <Button 
          :label="isApiKeyVisible ? 'Ocultar Chave' : 'Mostrar Chave'" 
          :icon="isApiKeyVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" 
          @click="toggleApiKeyVisibility" 
        />
      </div>
  
      <TabView>
        <!-- Aba para Estoque -->
        <TabPanel header="Estoque (JavaScript - Axios)">
          <p>
            Exemplo de como acessar o relatório de estoque usando JavaScript e Axios.
            O corpo da requisição deve incluir os campos:
            <strong>id_dm</strong> (obrigatório).
          </p>
          <pre>
  <code class="language-javascript">
  axios.post('/api/Estoque/relatorio', {
      id_dm: 123 // ID da DM (obrigatório)
  }, {
      headers: {
          'x-api-key': 'apikey'
      }
  })
  .then(response => {
      console.log(response.data);
  })
  .catch(error => {
      console.error('Erro:', error);
  });
  </code>
          </pre>
        </TabPanel>
  
        <!-- Aba para Status -->
        <TabPanel header="Status (C#)">
          <p>
            Exemplo de como acessar o relatório de status usando C#. O corpo da requisição deve incluir os campos:
            <strong>id_dm</strong> (opcional) e <strong>data</strong> (opcional).
          </p>
          <pre>
  <code class="language-csharp">
  using System;
  using System.Net.Http;
  using System.Text;
  using System.Threading.Tasks;
  
  class Program
  {
      static async Task Main()
      {
          using (var client = new HttpClient())
          {
              client.DefaultRequestHeaders.Add("x-api-key", "apikey");
  
              var jsonContent = new StringContent("{\"id_dm\":\"123\",\"data\":\"2024-01-01\"}", Encoding.UTF8, "application/json");
  
              var response = await client.PostAsync("/api/SDM/relatorio", jsonContent);
              response.EnsureSuccessStatusCode();
  
              var responseBody = await response.Content.ReadAsStringAsync();
              Console.WriteLine(responseBody);
          }
      }
  }
  </code>
          </pre>
        </TabPanel>
  
        <!-- Aba para Retiradas -->
        <TabPanel header="Retiradas (Java)">
          <p>
            Exemplo de como acessar o relatório de retiradas usando Java. O corpo da requisição deve incluir os campos:
            <strong>id_dm</strong> (obrigatório), <strong>id_funcionario</strong> (opcional), <strong>data_inicio</strong> e <strong>data_fim</strong> (opcional).
          </p>
          <pre>
  <code class="language-java">
  import java.net.URI;
  import java.net.http.HttpClient;
  import java.net.http.HttpRequest;
  import java.net.http.HttpResponse;
  import java.net.http.HttpRequest.BodyPublishers;
  import java.net.http.HttpResponse.BodyHandlers;
  
  public class Main {
      public static void main(String[] args) throws Exception {
          HttpClient client = HttpClient.newHttpClient();
          String json = "{\"id_dm\":\"123\",\"id_funcionario\":\"456\",\"data_inicio\":\"2024-01-01\",\"data_fim\":\"2024-01-31\"}";
  
          HttpRequest request = HttpRequest.newBuilder()
              .uri(URI.create("/api/relatorioRetiRe/relatorio"))
              .header("x-api-key", "apikey")
              .header("Content-Type", "application/json")
              .POST(BodyPublishers.ofString(json))
              .build();
  
          HttpResponse&lt;String&gt; response = client.send(request, BodyHandlers.ofString());
  
          System.out.println(response.body());
      }
  }
  </code>
          </pre>
        </TabPanel>
  
        <!-- Aba para Devoluções -->
        <TabPanel header="Devoluções (JavaScript - Axios)">
          <p>
            Exemplo de como acessar o relatório de devoluções usando JavaScript e Axios.
            O corpo da requisição deve incluir os campos:
            <strong>id_dm</strong> (obrigatório), <strong>id_funcionario</strong> (opcional), <strong>data_inicio</strong> e <strong>data_fim</strong> (opcional).
          </p>
          <pre>
  <code class="language-javascript">
  axios.post('/api/devolucao/relatorio', {
      id_dm: 123, // ID da DM (obrigatório)
      id_funcionario: 456, // ID do funcionário (opcional)
      data_inicio: '2024-01-01', // Data de início (opcional)
      data_fim: '2024-01-31' // Data de fim (opcional)
  }, {
      headers: {
          'x-api-key': 'apikey'
      }
  })
  .then(response => {
      console.log(response.data);
  })
  .catch(error => {
      console.error('Erro:', error);
  });
  </code>
          </pre>
        </TabPanel>
      </TabView>
    </div>
  </template>
  
  
<style scoped>
pre {
    background-color: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}

code {
    font-family: monospace;
}
</style>
