<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'; // Importa funções do Vue para reatividade, ciclo de vida e manipulação de DOM.
import { useToast } from 'primevue/usetoast'; // Importa o hook para exibir notificações de toast.
import { marked } from 'marked'; // Importa a biblioteca 'marked' para converter markdown em HTML.
import axios from '@/axios.js'; // Importa a instância do axios configurada para fazer requisições HTTP.
import { useAuthStore } from '@/store/authStore'; // Importa a store de autenticação para gerenciar o estado do usuário.
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa um componente de carregamento.
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const toast = useToast(); // Inicializa o toast para exibir notificações.
const store = useAuthStore(); // Inicializa a store de autenticação.
const loading = ref(false); // Define uma referência reativa para controlar o estado de carregamento.

const apiKey = ref(''); // Define uma referência reativa para armazenar a chave da API.
const isApiKeyVisible = ref(false); // Define uma referência reativa para controlar a visibilidade da chave da API.
const selectedTopic = ref(null); // Define uma referência reativa para armazenar o tópico selecionado na interface.
const selectedTopic1 = ref(null); // Define uma referência reativa para armazenar o primeiro tópico selecionado.

// Função para recuperar a chave da API
/**
 * Função para recuperar a chave da API a partir do backend, enviando o ID do cliente.
 * @async
 * @function fetchApiKey
 * @returns {Promise<void>}
 */
const fetchApiKey = async () => {
    try {
        loading.value = true; // Inicia o estado de carregamento.
        const data = {
            id_cliente: store.userIdCliente // Obtém o ID do cliente da store de autenticação.
        };
        // Faz uma requisição POST para recuperar a chave da API.
        const response = await axios.post('/key/recuperar', data); // Envia o ID do cliente no corpo da requisição.
        apiKey.value = response.data.apiKey; // Atribui a chave da API à variável reativa.
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API carregada com sucesso!', life: 3000 }); // Exibe uma notificação de sucesso.
    } catch (error) {
        // Se houver erro na requisição, exibe uma notificação de erro.
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível recuperar a chave da API.', life: 3000 });
    } finally {
        loading.value = false; // Finaliza o estado de carregamento, independentemente de sucesso ou erro.
    }
};

// Chama a função para buscar a chave da API quando o componente for montado
onMounted(() => {
    //fetchApiKey(); // A função de recuperação da chave da API pode ser chamada aqui, caso necessário.
});

const passo1 = computed(() => [
    {
        name: t('login_title'),
        description: marked(t('login_description')), // Converte o markdown para HTML e adiciona à descrição do tópico.
        requestBody: {
            email: 'seuemailaqui@exemplo.com.br', // Exemplo de e-mail para enviar na requisição.
            senha: 'insirasuasenha' // Exemplo de senha para enviar na requisição.
        },
        apiUrl: 'http://vmretnew.sgilab220.com.br/api/login' // URL da API para realizar o login.
    }
]);

const passo2 = computed(() => [
    {
        name: t('retiradas_title'),
        description: marked(t('retiradas_description')), // Descrição do passo de retiradas convertida de markdown para HTML.
        requestBody: {
            id_dm: '1234', // Exemplo de ID de DM (Máquina/Dispositivo).
            id_funcionario: '5678', // Exemplo de ID de Funcionário.
            data_inicio: '2023-01-01', // Exemplo de data de início para o relatório.
            data_fim: '2023-01-31' // Exemplo de data de fim para o relatório.
        },
        apiUrl: 'http://vmretnew.sgilab220.com.br/api/relatorioRetiRe/relatorio' // URL da API para consultar o relatório de retiradas.
    },
    {
        name: t('status_title'),
        description: marked(t('status_description')), // Descrição do passo de status convertida de markdown para HTML.
        requestBody: {
            id_dm: '1234', // Exemplo de ID de DM (Máquina/Dispositivo).
            data: '2023-01-15' // Exemplo de data para o status.
        },
        apiUrl: 'http://vmretnew.sgilab220.com.br/api/SDM/relatorio' // URL da API para consultar o relatório de status.
    }
    // Outros tópicos e relatórios seguem a mesma estrutura.
]);

function toggleApiKeyVisibility() {
    isApiKeyVisible.value = !isApiKeyVisible.value; // Alterna a visibilidade da chave da API (show/hide).
}

function copyToClipboard() {
    navigator.clipboard.writeText(apiKey.value); // Copia a chave da API para a área de transferência.
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Chave de API copiada!', life: 3000 }); // Exibe uma notificação de sucesso.
}

/**
 * Função para selecionar um tópico no passo 1.
 * @param {Object} topic - O tópico a ser selecionado.
 * @returns {void}
 */
function selectTopic1(topic1) {
    selectedTopic1.value = topic1; // Define o tópico selecionado como o tópico passado como parâmetro.
    nextTick(() => {
        const detailsCard = document.querySelector('.details-card'); // Obtém o elemento da descrição do tópico.
        if (detailsCard) {
            detailsCard.scrollIntoView({ behavior: 'smooth' }); // Rola suavemente para o detalhe do tópico.
        }
    });
}

/**
 * Função para selecionar um tópico no passo 2.
 * @param {Object} topic - O tópico a ser selecionado.
 * @returns {void}
 */
function selectTopic(topic) {
    selectedTopic.value = topic; // Define o tópico selecionado como o tópico passado como parâmetro.
    nextTick(() => {
        const detailsCard = document.querySelector('.details-card-passo2'); // Obtém o elemento da descrição do tópico.
        if (detailsCard) {
            detailsCard.scrollIntoView({ behavior: 'smooth' }); // Rola suavemente para o detalhe do tópico.
        }
    });
}
</script>

<template>
    <div  class="card vh">
        <h2 class="my-7 text-center">{{ t('guide_title') }}</h2>
        <Fieldset legend="Guia" class="m-2">
            <p class="mt-3">
                {{ t('guide_description') }}
            </p>
        </Fieldset>

        <Accordion value="0" class="mt-3">
            <!-- Passo 1 - Login -->
            <AccordionPanel>
                <AccordionHeader>
                    {{ t('step1_title') }}
                </AccordionHeader>
                <AccordionContent>
                    <p class="mt-3">
                        {{ t('step1_description') }}
                    </p>
                    <ul class="mt-4">
                        <!-- Lista de tópicos do Passo 1 -->
                        <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic1 in passo1" :key="topic1.name" @click="selectTopic1(topic1)" style="cursor: pointer">
                            <strong>{{ topic1.name }}</strong>
                        </li>
                    </ul>
                    <div class="mt-4 card details-card" v-if="selectedTopic1" style="margin-top: 1rem">
                        <!-- Detalhes do tópico selecionado -->
                        <h4 class="mt-2">{{ selectedTopic1.name }}</h4>
                        <p class="my-5" v-html="selectedTopic1.description"></p>

                        <Tabs value="0">
                            <TabList>
                                <Tab value="0">
                                    JavaScript (Axios)
                                </Tab>
                                <Tab value="1">C#</Tab>
                                <Tab value="2">Java</Tab>
                                <Tab value="3">cURL</Tab>
                                <Tab value="4">Postman</Tab>

                            </TabList>
                            <TabPanels value="0">
                            <!-- Exemplo de uso com diferentes linguagens -->
                            <TabPanel value="0">
                                <pre><code>
                                
                    axios.post('{{ selectedTopic1.apiUrl }}', {{ selectedTopic1.requestBody }})
                    .then(response => {
                      console.log(response.data);
                    })
                    .catch(error => {
                      console.error('Erro:', error);
                    });
                                </code></pre>
                            </TabPanel>
                            <!-- Exemplo em C# -->
                            <TabPanel value="1">
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
                            <!-- Exemplo em Java -->
                            <TabPanel value="2">
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
                            post.setEntity(new StringEntity("{{ selectedTopic1.requestBody }}", ContentType.APPLICATION_JSON));
                    
                            HttpResponse response = client.execute(post);
                            System.out.println(EntityUtils.toString(response.getEntity()));
                        }
                    }
                                </code></pre>
                            </TabPanel>
                            <!-- Exemplo em cURL -->
                            <TabPanel value="3">
                                <pre><code>
                    curl -X POST "{{ selectedTopic1.apiUrl }}" \
                    -H "Content-Type: application/json" \
                    -d '{{ selectedTopic1.requestBody }}'
                                </code></pre>
                            </TabPanel>
                            <!-- Exemplo no Postman -->
                            <TabPanel value="4">
                                <pre><code>
                    POST {{ selectedTopic1.apiUrl }}
                    Content-Type: application/json
                    
                    Body:
                    {{ selectedTopic1.requestBody }}
                                </code></pre>
                            </TabPanel>
                        </TabPanels>
                        </Tabs>
                    </div>
                </AccordionContent>
            </AccordionPanel>

            <!-- Passo 2 - Relatórios e outros tópicos -->
            <AccordionPanel value="1">
                <AccordionHeader>
                    {{ t('step2_title') }}
                </AccordionHeader>
                <AccordionContent>
                    <p class="mt-3">
                        {{ $t('step2_description') }}
                    </p>
                    <ul class="mt-5">
                        <!-- Lista de tópicos do Passo 2 -->
                        <li class="hover:text-orange-700 hover:bg-orange-100" v-for="topic in passo2" :key="topic.name" @click="selectTopic(topic)" style="cursor: pointer">
                            <strong>{{ topic.name }}</strong>
                        </li>
                    </ul>
                    <!-- Detalhes do tópico selecionado -->
                    <div class="mt-4 card details-card-passo2" v-if="selectedTopic" style="margin-top: 1rem">
                        <h4 class="mt-2">{{ selectedTopic.name }}</h4>
                        <p class="my-5" v-html="selectedTopic.description"></p>
                        
                        
                        <Tabs value="0">
                            <TabList>
                                <Tab value="0">
                                    JavaScript (Axios)
                                </Tab>
                                <Tab value="1">C#</Tab>
                                <Tab value="2">Java</Tab>
                                <Tab value="3">cURL</Tab>
                                <Tab value="4">Postman</Tab>
                            </TabList>
                            <!-- Exemplo de uso com Axios -->
                            <TabPanels >
                                <TabPanel value="0">
                                <pre><code>
                                
                    axios.post('{{ selectedTopic.apiUrl }}', {{ selectedTopic.requestBody }}, {
                    headers: {
                    'Authorization': Bearer ${insiraotoken}
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
                            <!-- Exemplo em C# -->
                            <TabPanel value="1">
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
                            <!-- Exemplo em Java -->
                            <TabPanel value="2">
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
                            <!-- Exemplo em cURL -->
                            <TabPanel value="3">
                                <pre><code>
                    curl -X POST "{{ selectedTopic.apiUrl }}" \
                    -H "Authorization: Bearer insiraotoken" \
                    -H "Content-Type: application/json" \
                    -d '{{ selectedTopic.requestBody }}'
                                </code></pre>
                            </TabPanel>
                            <!-- Exemplo no Postman -->
                            <TabPanel value="4">
                                <pre><code>
                    POST {{ selectedTopic.apiUrl }}
                    Authorization: Bearer insiraotoken
                    Content-Type: application/json
                    
                    Body:
                    {{ selectedTopic.requestBody }}
                                </code></pre>
                            </TabPanel>
                        </TabPanels>
                        </Tabs>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>

<style scoped>
/* Estilos para lista */
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


.p-fieldset {
    border-radius: initial;
    color:#303030ec;
    border: 1px solid #626262ec !important;
}
</style>
