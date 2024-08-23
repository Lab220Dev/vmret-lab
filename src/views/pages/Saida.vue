<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { marked } from 'marked';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore'; // Certifique-se de importar a store corretamente

const toast = useToast();
const store = useAuthStore(); // Inicializa a store

const apiKey = ref('');
const isApiKeyVisible = ref(false);
const selectedTopic = ref(null);

// Função para recuperar a chave da API
const fetchApiKey = async () => {
  try {
    const data = {
      id_cliente: store.userIdCliente // Acessa o id_cliente da store
    };
    const response = await axios.post('/key/recuperar', data); // Usando POST para enviar o id_cliente no body
    apiKey.value = response.data.apiKey; // Assumindo que a resposta contém um campo apiKey
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API carregada com sucesso!', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível recuperar a chave da API.', life: 3000 });
  }
};

// Chama a função para buscar a chave da API quando o componente for montado
onMounted(() => {
  fetchApiKey();
});

const topics = [
  {
    name: 'Retiradas',
    description: marked(`**Exemplo de como acessar o relatório de retiradas.** O corpo da requisição deve incluir opcionalmente os campos:

- **id_dm**: Pode ser encontrado na aba "Lista de DM".
- **id_funcionario**: Pode ser encontrado na aba "Lista de Funcionários".
- **data_inicio** e **data_fim**: Período desejado para o relatório.

Todos os campos são opcionais. Se nenhum campo for enviado, o sistema retornará um JSON com todos os dados disponíveis.`),
    requestBody: `{
  "id_dm": "1234",
  "id_funcionario": "5678",
  "data_inicio": "2023-01-01",
  "data_fim": "2023-01-31"
}`,
    apiUrl: 'http://vmretnew.sgilab220.com.br/api/relatorioRetiRe/relatorio'
  },
  {
    name: 'Status',
    description: marked(`**Exemplo de como acessar o relatório de status.** O corpo da requisição pode opcionalmente incluir:

- **id_dm**: Pode ser encontrado na aba "Lista de DM".
- **data**: A data para o status específico.

Ambos os campos são opcionais. Se nenhum for enviado, o sistema retornará o status atual de todas as máquinas.`),
    requestBody: `{
  "id_dm": "1234",
  "data": "2023-01-15"
}`,
    apiUrl: 'http://vmretnew.sgilab220.com.br/api/SDM/relatorio'
  },
  {
    name: 'Estoque',
    description: marked(`**Exemplo de como acessar o relatório de estoque.** O corpo da requisição deve incluir:

- **id_dm**: Pode ser encontrado na aba "Lista de DM".

Esse campo é obrigatório para consultar o estoque de uma máquina específica.`),
    requestBody: `{
  "id_dm": "1234"
}`,
    apiUrl: 'http://vmretnew.sgilab220.com.br/api/Estoque/relatorio'
  },
  {
    name: 'Devolução',
    description: marked(`**Exemplo de como acessar o relatório de devolução.** O corpo da requisição deve incluir opcionalmente os campos:

- **id_dm**: Pode ser encontrado na aba "Lista de DM".
- **id_funcionario**: Pode ser encontrado na aba "Lista de Funcionários".
- **data_inicio** e **data_fim**: Período desejado para o relatório.

Todos os campos são opcionais. Se nenhum for enviado, o sistema retornará um JSON com todas as devoluções disponíveis.`),
    requestBody: `{
  "id_dm": "1234",
  "id_funcionario": "5678",
  "data_inicio": "2023-01-01",
  "data_fim": "2023-01-31"
}`,
    apiUrl: 'http://vmretnew.sgilab220.com.br/api/devolucoes/relatorio'
  }
];

function toggleApiKeyVisibility() {
  isApiKeyVisible.value = !isApiKeyVisible.value;
}

function copyToClipboard() {
  navigator.clipboard.writeText(apiKey.value);
  toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API copiada!', life: 3000 });
}

function selectTopic(topic) {
  selectedTopic.value = topic;
}
</script>

<template>
  <div class="card">
    <h2>Sua Chave de API</h2>

    <!-- Input com a API Key ofuscada -->
    <InputText :type="isApiKeyVisible ? 'text' : 'password'" v-model="apiKey" readonly
      style="width: 100%; margin-bottom: 1rem;" />

    <!-- Botões para copiar e alternar visibilidade -->
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
      <Button label="Copiar Chave" icon="pi pi-copy" @click="copyToClipboard" />
      <Button :label="isApiKeyVisible ? 'Ocultar Chave' : 'Mostrar Chave'"
        :icon="isApiKeyVisible ? 'pi pi-eye-slash' : 'pi pi-eye'" @click="toggleApiKeyVisibility" />
    </div>

    <!-- Lista de Tópicos -->
    <ul>
      <li v-for="topic in topics" :key="topic.name" @click="selectTopic(topic)" style="cursor: pointer;">
        <strong>{{ topic.name }}</strong>
      </li>
    </ul>

    <!-- Exemplo de Uso da API com Abas para Diferentes Linguagens -->
    <div v-if="selectedTopic" style="margin-top: 1rem;">
      <h3>{{ selectedTopic.name }}</h3>
      <p v-html="selectedTopic.description"></p>

      <TabView>
        <!-- Tab para Axios (JavaScript) -->
        <TabPanel header="JavaScript (Axios)">
          <pre><code>
axios.post('{{ selectedTopic.apiUrl }}', {{ selectedTopic.requestBody }}, {
  headers: {
    'x-api-key': apiKey.value
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Erro:', error);
});
          </code></pre>
        </TabPanel>

        <!-- Tab para C# -->
        <TabPanel header="C#">
          <pre><code>
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
            client.DefaultRequestHeaders.Add("x-api-key", "{{ apiKey.value }}");

            var jsonContent = new StringContent("{{ selectedTopic.requestBody }}", Encoding.UTF8, "application/json");

            var response = await client.PostAsync("{{ selectedTopic.apiUrl }}", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }
    }
}
          </code></pre>
        </TabPanel>

        <!-- Tab para Java -->
        <TabPanel header="Java">
          <pre><code>
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) {
        try {
            URL url = new URL("{{ selectedTopic.apiUrl }}");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("x-api-key", "{{ apiKey.value }}");
            conn.setRequestProperty("Content-Type", "application/json");

            String jsonInputString = "{{ selectedTopic.requestBody }}";

            conn.setDoOutput(true);
            try(OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);           
            }

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuffer content = new StringBuffer();

            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            conn.disconnect();

            System.out.println(content.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
          </code></pre>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #f4f4f4;
  border-radius: 4px;
  transition: background-color 0.3s;
}

li:hover {
  background-color: #e0e0e0;
}

pre {
  background-color: #333;
  color: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
