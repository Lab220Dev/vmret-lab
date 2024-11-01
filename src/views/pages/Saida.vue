<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { marked } from 'marked';
import axios from '@/axios.js';
import { useAuthStore } from '@/store/authStore'; // Certifique-se de importar a store corretamente
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const toast = useToast();
const store = useAuthStore(); // Inicializa a store
const loading = ref(false);

const apiKey = ref('');
const isApiKeyVisible = ref(false);
const selectedTopic = ref(null);

// Função para recuperar a chave da API
const fetchApiKey = async () => {
    try {
        loading.value = true;
        const data = {
            id_cliente: store.userIdCliente // Acessa o id_cliente da store
        };
        const response = await axios.post('/key/recuperar', data); // Usando POST para enviar o id_cliente no body
        apiKey.value = response.data.apiKey; // Assumindo que a resposta contém um campo apiKey
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API carregada com sucesso!', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível recuperar a chave da API.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Chama a função para buscar a chave da API quando o componente for montado
onMounted(() => {
    //fetchApiKey();
});
const passo1 = [
    {
        name: 'Login',
        description: marked(`**Exemplo de como realizar o login e obter o token.** O corpo da requisição deve incluir os campos:

- **"email"**: E-mail utilizado para logar no sistema, pode ser encontrado na aba "Cadastros > Usuários > Usuário WEB".
- **"senha"**: Senha utilizada para logar no sistema".

Todos os campos são obrigatórios. Se somente um ou nenhum campo for enviado, o sistema retornará 400
Bad Request: "E-mail e senha são obrigatórios".`),
        requestBody: `{
  "email": "seuemailaqui@exemplo.com.br",
  "senha": "insirasuasenha"
}`,
        apiUrl: 'http://vmretnew.sgilab220.com.br/api/login'
    }
];

const passo2 = [
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
    <div class="card vh">
        <h2 class="my-7 text-center">Guia de Autenticação e Acesso à API</h2>
        <p>
            Este guia técnico fornece instruções detalhadas sobre como autenticar-se na API e obter um token de acesso. Você encontrará exemplos de requisições para endpoints críticos, como relatórios de retiradas, status e estoque, utilizando
            linguagens como C#, Java, JavaScript. Cada exemplo inclui o formato do corpo da requisição e os cabeçalhos necessários para autenticação.
        </p>
        <Accordion class="mt-6">
            <AccordionTab header="Passo 1">
              <p class="mt-3">Neste passo, é abordado o processo de autenticação na API para a obtenção de um token de acesso. A requisição deve ser realizada utilizando o método POST e incluir os campos obrigatórios de "email" e "senha". Um token de acesso válido é retornado na resposta, permitindo chamadas subsequentes a outros endpoints da API. Certifique-se de tratar possíveis erros.</p>
                <ul class="mt-5">
                    <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic in passo1" :key="topic.name" @click="selectTopic(topic)" style="cursor: pointer">
                        <strong>{{ topic.name }}</strong>
                    </li>
                </ul>
            </AccordionTab>

            <AccordionTab header="Passo 2">
              <p class="mt-3">Neste passo, é demonstrado como acessar diversos relatórios da API, incluindo retiradas, status, estoque e devolução. Dependendo do relatório, podem ser enviados campos obrigatórios ou opcionais. As requisições são realizadas por meio do método POST, utilizando o token de acesso obtido anteriormente. Cada exemplo apresenta uma estrutura de corpo de requisição e a URL do endpoint correspondente, permitindo a recuperação de informações específicas conforme necessário.</p>
                <!-- Lista de Tópicos -->
                <ul class="mt-5">
                    <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic in passo2" :key="topic.name" @click="selectTopic(topic)" style="cursor: pointer">
                        <strong>{{ topic.name }}</strong>
                    </li>
                </ul>
            </AccordionTab>
        </Accordion>

        <!-- Exemplo de Uso da API com Abas para Diferentes Linguagens -->
        <div class="mt-6 card" v-if="selectedTopic" style="margin-top: 1rem">
            <h4 class="mt-5">{{ selectedTopic.name }}</h4>
            <p class="my-5" v-html="selectedTopic.description"></p>

            <TabView>
                <!-- Tab para Axios (JavaScript) -->
                <TabPanel header="JavaScript (Axios)">
                    <pre><code>
            
axios.post('{{ selectedTopic.apiUrl }}', {{ selectedTopic.requestBody }}, {
headers: {
'Authorization': `Bearer ${insiraotoken}`
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
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", insiraotoken);

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
            import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class Main {
    public static void main(String[] args) {
        try {
            URL url = new URL("{{ selectedTopic.apiUrl }}");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + insiraotoken); // Corrigido
            conn.setRequestProperty("Content-Type", "application/json");

            String jsonInputString = "{{ selectedTopic.requestBody }}";

            conn.setDoOutput(true);
            try (OutputStream os = conn.getOutputStream()) {
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

                <!-- Tab para cURL -->
                <TabPanel header="cURL">
                    <pre><code>
            curl -X POST "{{ selectedTopic.apiUrl }}" \
-H "Authorization: Bearer ${token}" \
-H "Content-Type: application/json" \
-d '{{ selectedTopic.requestBody }}'
          </code></pre>
                </TabPanel>

                <!-- Tab para Postman -->
                <TabPanel header="Postman">
                    <pre><code>
            POST {{ selectedTopic.apiUrl }}
Headers:
Authorization: Bearer ${token}
Content-Type: application/json

Body (raw JSON):
{{ selectedTopic.requestBody }}
          </code></pre>
                </TabPanel>
            </TabView>
        </div>
    </div>
    <LoadingSpinner v-if="loading" />
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
