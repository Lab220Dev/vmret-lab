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

const selectedTopic1 = ref(null);

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

function selectTopic1(topic1) {
    selectedTopic1.value = topic1;
}
</script>

<template>
    <div class="card vh">
        <h2 class="my-7 text-center">Guia de Autenticação e Acesso à API</h2>
        <fieldset class="m-2">
            <p>
                Este guia técnico fornece instruções detalhadas sobre como autenticar-se na API e obter um token de acesso. Você encontrará exemplos de requisições para endpoints críticos, como relatórios de retiradas, status e estoque, utilizando
                linguagens como C#, Java, JavaScript. Cada exemplo inclui o formato do corpo da requisição e os cabeçalhos necessários para autenticação.
            </p>
        </fieldset>

        <Accordion class="mt-3">
            <!--- Login -->
            <AccordionTab header="Passo 1">
                <p class="mt-3">
                    Neste passo, é abordado o processo de autenticação na API para a obtenção de um token de acesso. A requisição deve ser realizada utilizando o método POST e incluir os campos obrigatórios de "email" e "senha". Um token de acesso
                    válido é retornado na resposta, permitindo chamadas subsequentes a outros endpoints da API. Certifique-se de tratar possíveis erros.
                </p>
                <ul class="mt-4">
                    <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic1 in passo1" :key="topic1.name" @click="selectTopic1(topic1)" style="cursor: pointer">
                        <strong>{{ topic1.name }}</strong>
                    </li>
                </ul>

                <div class="mt-4 card" v-if="selectedTopic1" style="margin-top: 1rem">
                    <h4 class="mt-2">{{ selectedTopic1.name }}</h4>
                    <p class="my-5" v-html="selectedTopic1.description"></p>

                    <TabView>
                        <!-- Axios-->
                        <TabPanel header="JavaScript (Axios)">
                            <pre><code>
            
axios.post('{{ selectedTopic1.apiUrl }}', {{ selectedTopic1.requestBody }}, {
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

                        <!-- C# -->
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

            var jsonContent = new StringContent("{{ selectedTopic1.requestBody }}", Encoding.UTF8, "application/json");

            var response = await client.PostAsync("{{ selectedTopic1.apiUrl }}", jsonContent);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }
    }
}
                            </code></pre>
                        </TabPanel>

                        <!-- Java -->
                        <TabPanel header="Java">
                            <pre><code>
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.HttpClient;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClients.createDefault();
        HttpPost post = new HttpPost("{{ selectedTopic1.apiUrl }}");

        post.setHeader("Authorization", "Bearer " + insiraotoken);
        post.setEntity(new StringEntity("{{ selectedTopic1.requestBody }}", ContentType.APPLICATION_JSON));

        HttpResponse response = client.execute(post);
        System.out.println(EntityUtils.toString(response.getEntity()));
    }
}
                            </code></pre>
                        </TabPanel>

                        <!-- cURL -->
                        <TabPanel header="cURL">
                            <pre><code>
curl -X POST "{{ selectedTopic1.apiUrl }}" \
-H "Authorization: Bearer insiraotoken" \
-H "Content-Type: application/json" \
-d '{{ selectedTopic1.requestBody }}'
                            </code></pre>
                        </TabPanel>

                        <!--Postman -->
                        <TabPanel header="Postman">
                            <pre><code>
POST {{ selectedTopic1.apiUrl }}
Authorization: Bearer insiraotoken
Content-Type: application/json

Body:
{{ selectedTopic1.requestBody }}
                            </code></pre>
                        </TabPanel>
                    </TabView>
                </div>
            </AccordionTab>

            <!-- Passo 2 - Relatórios e outros tópicos -->
            <AccordionTab header="Passo 2">
                <p class="mt-3">
                    Neste passo, é demonstrado como acessar diversos relatórios da API, incluindo retiradas, status, estoque e devolução. Dependendo do relatório, podem ser enviados campos obrigatórios ou opcionais. As requisições são realizadas por
                    meio do método POST, utilizando o token de acesso obtido anteriormente. Cada exemplo apresenta uma estrutura de corpo de requisição e a URL do endpoint correspondente, permitindo a recuperação de informações específicas conforme
                    necessário.
                </p>
                <ul class="mt-5">
                    <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic in passo2" :key="topic.name" @click="selectTopic(topic)" style="cursor: pointer">
                        <strong>{{ topic.name }}</strong>
                    </li>
                </ul>
            </AccordionTab>
        </Accordion>

        <!-- Exemplo de Uso da API com Abas para Diferentes Linguagens -->
        <div class="mt-4 card" v-if="selectedTopic" style="margin-top: 1rem">
            <h4 class="mt-2">{{ selectedTopic.name }}</h4>
            <p class="my-5" v-html="selectedTopic.description"></p>

            <TabView>
                <!--  Axios 
            -->
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

                <!--  C# -->
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

                <!--Java -->
                <TabPanel header="Java">
                    <pre><code>
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.HttpClient;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClients.createDefault();
        HttpPost post = new HttpPost("{{ selectedTopic.apiUrl }}");

        post.setHeader("Authorization", "Bearer " + insiraotoken);
        post.setEntity(new StringEntity("{{ selectedTopic.requestBody }}", ContentType.APPLICATION_JSON));

        HttpResponse response = client.execute(post);
        System.out.println(EntityUtils.toString(response.getEntity()));
    }
}
                    </code></pre>
                </TabPanel>

                <!-- cURL -->
                <TabPanel header="cURL">
                    <pre><code>
curl -X POST "{{ selectedTopic.apiUrl }}" \
-H "Authorization: Bearer insiraotoken" \
-H "Content-Type: application/json" \
-d '{{ selectedTopic.requestBody }}'
                    </code></pre>
                </TabPanel>

                <!-- Postman -->
                <TabPanel header="Postman">
                    <pre><code>
POST {{ selectedTopic.apiUrl }}
Authorization: Bearer insiraotoken
Content-Type: application/json

Body:
{{ selectedTopic.requestBody }}
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

p {
    text-indent: 20px;
}
</style>
