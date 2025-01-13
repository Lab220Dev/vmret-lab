<script setup>
// Importações de bibliotecas e componentes
import { reactive, ref, onMounted, watch } from 'vue'; // Importa hooks do Vue para gerenciamento de estado e ciclo de vida
import { useToast } from 'primevue/usetoast'; // Importa o hook do PrimeVue para exibição de mensagens (toast)
import axios from '@/axios.js'; // Instância do axios para realizar requisições HTTP
import VueDatePicker from '@vuepic/vue-datepicker'; // Componente de seleção de data
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o estilo do VueDatePicker
import { FilterMatchMode } from 'primevue/api'; // Filtros para DataTable do PrimeVue
import imagePlaceholder from '@/assets/images/placeholder4.1.png'; // Imagem de placeholder para usuários sem foto
import clockurl from '@/assets/images/OIP.png'; // URL para imagem de relógio (não utilizada no código)
import { useAuthStore } from '@/store/authStore.js'; // Store para gerenciamento da autenticação
import ImageUpload from '@/components/ImageUpload.vue'; // Componente para upload de imagem
import { isValid as validateCPF } from 'cpf-validator'; // Validador de CPF
import { useDataStore } from '@/store/dataStore.js'; // Store para dados compartilhados
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de spinner de carregamento

// Instâncias das stores
const store = useAuthStore(); // Store de autenticação
const dataStore = useDataStore(); // Store de dados compartilhados

// Instância para exibição de mensagens de sucesso e erro
const toast = useToast();

// Referências reativas para controle de estado
const selectedFile = ref(null); // Referência para o arquivo selecionado no upload de imagem
const errors = ref({}); // Objeto para armazenar erros de validação de formulário
const status = ref([
    // Lista de status possíveis para o funcionário
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' }
]);

// Referências para o upload de imagem e URLs
const imageUploader = ref(null); // Referência para o componente de upload de imagem
const imageUrl = ref(imagePlaceholder); // URL da imagem (começa com o placeholder)

// Variáveis reativas para dados do formulário
let centroCusto = ref([]); // Lista de centros de custo
let setor = ref([]); // Lista de setores
let hieraquiaoptions = ref([]); // Opções de hierarquia de funções
let formatedHierarquiaOptions = ref([]); // Opções formatadas de hierarquia
let plantas = ref([]); // Lista de plantas
let funcionario = reactive({
    // Dados do funcionário, utilizados no formulário
    id_funcionario: '',
    matricula: '',
    senha: '',
    nome: '',
    biometria: '',
    biometria2: '',
    data_admissao: null,
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    status: '',
    hora_inicial: '',
    hora_final: '',
    id_centro_custo: '',
    id_funcao: '',
    id_planta: '',
    id_setor: '',
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false,
    nomearquivo: '',
    itens: []
});

const ListaProdutos = ref([]); // Lista de produtos
const ListaProdutosDisponiveis = reactive([]); // Lista de produtos disponíveis
const ListaProdutoFuncionario = ref([]); // Lista de produtos associados ao funcionário
const ListaItemsSetor = ref([]); // Lista de itens do setor
const editVisible = ref(false); // Controle de visibilidade do formulário de edição

// Filtro global para pesquisa na tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global que realiza a busca por substrings
});

const selectedProduct = ref({
    // Produto selecionado no formulário
    id_produto: '',
    nome: '',
    sku: '',
    quantidade: 1
});

const ListaFuncionarios = ref([]); // Lista de funcionários
const itemDialog = ref(false); // Controle de visibilidade do diálogo de itens
const deleteProductDialog = ref(false); // Controle de visibilidade do diálogo de exclusão de produto
const deleteFuncionarioDialog = ref(false); // Controle de visibilidade do diálogo de exclusão de funcionário
const visible = ref(false); // Controle de visibilidade do formulário de cadastro
const active = ref(0); // Índice da aba ativa no formulário (listar ou adicionar)
const activeItens = ref(0); // Índice da aba ativa dos itens do funcionário
const loading = ref(false); // Controle de carregamento (spinner)

const dropdown1 = ref(null); // Referências para os dropdowns de seleção
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

// Função para formatar a data no formato dd/mm/yyyy
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const TempoInicio = ref(null); // Referência para o tempo de início
const TempoFim = ref(null); // Referência para o tempo de fim

const filteredCount = ref(0); // Contador de itens filtrados na tabela

/**
 * Função chamada ao selecionar uma linha na DataTable.
 * Preenche o formulário de edição com os dados do funcionário selecionado.
 */
const onRowSelect = async (event) => {
    funcionario = event.data; // Preenche os dados do formulário com os dados do funcionário selecionado
    ListaProdutoFuncionario.value = funcionario.itens.map((item) => ({ ...item, action: 'new' })); // Preenche os produtos associados ao funcionário
    setTempo(TempoInicio, funcionario.hora_inicial); // Define o tempo de início com o valor do funcionário
    setTempo(TempoFim, funcionario.hora_final); // Define o tempo de fim com o valor do funcionário
    await fetchItensSetor(funcionario.id_setor); // Carrega os itens do setor
    imageUploader.value?.clearImageData(); // Limpa os dados da imagem
    await getImagem(funcionario.foto); // Carrega a imagem do funcionário
    active.value = 1; // Muda para a aba de edição
    editVisible.value = true; // Torna o formulário de edição visível
};

/**
 * Função chamada ao alterar o setor do funcionário.
 * Atualiza os itens disponíveis no setor.
 */
const setorChange = async (event) => {
    const idSetorSelecionado = event.value; // Pega o valor do setor selecionado
    if (idSetorSelecionado) {
        await fetchItensSetor(idSetorSelecionado); // Carrega os itens disponíveis no setor selecionado
    }
};

/**
 * Função para carregar os funcionários a partir da API.
 */
const loadFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente // Envia o ID do cliente para filtrar os funcionários
    };
    try {
        loading.value = true; // Ativa o carregamento (spinner)
        const response = await axios.post('/funcionarios/listar', data, {
            // Requisição para listar os funcionários
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token para autenticação
            }
        });

        ListaFuncionarios.value = response.data; // Armazena os funcionários na lista
        filteredCount.value = ListaFuncionarios.value.length; // Atualiza o contador de registros filtrados

        resetTable(); // Reseta a tabela
        resetItens(); // Reseta os itens
    } catch (error) {
        // Caso ocorra erro, pode-se capturar e logar aqui
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

// Monitorando o filtro global para recalcular a quantidade de itens filtrados
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = ListaFuncionarios.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Converte o filtro para minúsculas
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum valor do item corresponde ao filtro
        }).length; // Atualiza o contador de registros filtrados
    },
    { immediate: true } // Executa imediatamente ao montar o componente
);

/**
 * Função para adicionar um novo funcionário.
 * Realiza a requisição para salvar os dados do funcionário na API.
 */
const adicionarFuncionario = async () => {
    const formData = new FormData(); // Cria um FormData para enviar os dados no formato multipart/form-data
    if (selectedFile.value) {
        const nomeArquivo = `funcionario_${funcionario.nome}_${Date.now()}`; // Gera um nome único para a imagem
        formData.append('foto', nomeArquivo); // Adiciona o nome do arquivo
        formData.append('file', selectedFile.value); // Adiciona o arquivo selecionado
    }
    Object.entries(funcionario).forEach(([key, value]) => {
        // Adiciona os campos do funcionário ao FormData
        formData.append(key, value);
    });
    formData.append('id_cliente', store.userIdCliente); // Adiciona o ID do cliente
    formData.append('id_usuario', store.userId); // Adiciona o ID do usuário que está criando o funcionário
    try {
        loading.value = true; // Ativa o spinner de carregamento
        const response = await axios.post('/funcionarios/adicionar', formData, {
            // Envia a requisição para adicionar o funcionário
            headers: {
                Authorization: `Bearer ${store.token}`, // Envia o token de autenticação
                'Content-Type': 'multipart/form-data' // Define o tipo de conteúdo para o envio de arquivos
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 }); // Exibe a mensagem de sucesso
        dataStore.invalidateFuncionariosCache(); // Invalida o cache de funcionários
        loadFuncionarios(); // Carrega novamente os funcionários
        active.value = 0; // Volta para a aba inicial
        resetForm(); // Reseta o formulário
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao criar o usuário', life: 3000 }); // Exibe a mensagem de erro
    } finally {
        loading.value = false; // Desativa o spinner
    }
};

/**
 * Função para carregar dados relacionados à planta, setor e centro de custo.
 */
const loadData = async () => {
    try {
        plantas = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega plantas
        setor = dataStore.setores || (await dataStore.fetchSetores()); // Carrega setores
        centroCusto = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega centros de custo
        const produtos = dataStore.produtos || (await dataStore.fetchProdutos()); // Carrega produtos

        // Exclui a opção 'Todos' e obtém os outros dados
        ListaProdutos.value = produtos.filter((produto) => produto.label !== 'Todos');
    } catch (error) {
        // Caso ocorra erro, pode-se capturar e logar aqui
    }
};

// Função para buscar os itens disponíveis de um setor específico
const fetchItensSetor = async (id_setor) => {
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: id_setor
    };

    try {
        const response = await axios.post('Setor/itensdisponiveissetor', data); // Envia requisição para buscar itens do setor

        // Armazena os itens do setor na lista
        ListaItemsSetor.value = response.data;

        listarProdutosDisponiveis(); // Atualiza a lista de produtos disponíveis
    } catch (error) {
        // Caso ocorra erro, pode-se capturar e logar aqui
    }
};

/**
 * Função para listar produtos disponíveis (não alocados a nenhum setor).
 */
const listarProdutosDisponiveis = () => {
    const addedIds = new Set(ListaItemsSetor.value.map((item) => item.id_produto)); // Cria um Set com os IDs dos produtos já alocados

    // Filtra os produtos disponíveis (da ListaProdutos) excluindo os que já estão no setor
    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...ListaProdutos.value.filter((produto) => !addedIds.has(produto.value)));
};

/**
 * Função para buscar as opções de hierarquia de funções.
 */
const fetchHieraquiaOptions = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarhierarquia', data, {
            // Envia requisição para buscar as hierarquias de funções
            headers: {
                Authorization: `Bearer ${store.token}` // Envia token de autenticação
            }
        });
        hieraquiaoptions = response.data; // Armazena as opções de hierarquia
        formatedHierarquiaOptions = hieraquiaoptions.map((hieraquiaoptions) => ({
            label: ` ${hieraquiaoptions.id_funcao}`,
            value: hieraquiaoptions.id_funcao
        })); // Formata as opções para exibição
    } catch (error) {
        // Caso ocorra erro, pode-se capturar e logar aqui
    }
};

// Monitora alterações no tempo de início e final
watch(
    TempoInicio,
    (newTime) => {
        if (newTime) {
            funcionario.hora_inicial = formatarTempo(newTime); // Atualiza a hora de início
        } else {
            funcionario.hora_inicial = ''; // Limpa a hora de início
        }
    },
    { deep: true } // Executa a cada mudança profunda
);

watch(
    TempoFim,
    (newTime) => {
        if (newTime) {
            funcionario.hora_final = formatarTempo(newTime); // Atualiza a hora de fim
        } else {
            funcionario.hora_final = ''; // Limpa a hora de fim
        }
    },
    { deep: true } // Executa a cada mudança profunda
);

/**
 * Reseta a tabela e itens do formulário
 */
const resetTable = () => {
    activeItens.value = 0; // Reseta o índice de itens
    resetItens(); // Reseta os itens associados
};

/**
 * Função para formatar a hora no formato ISO
 */
function formatarTempo(time, baseDate = new Date()) {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    const seconds = time.seconds.toString().padStart(2, '0');

    baseDate.setHours(parseInt(hours, 10)); // Define as horas
    baseDate.setMinutes(parseInt(minutes, 10)); // Define os minutos
    baseDate.setSeconds(parseInt(seconds, 10)); // Define os segundos

    return baseDate.toISOString(); // Retorna a data formatada no formato ISO
}

/**
 * Função para definir o tempo de início e fim
 */
const setTempo = (tempoRef, isoString) => {
    const date = new Date(isoString);
    const time = {
        hours: date.getUTCHours(), // Pega a hora em UTC
        minutes: date.getUTCMinutes(), // Pega os minutos em UTC
        seconds: date.getUTCSeconds() // Pega os segundos em UTC
    };
    tempoRef.value = time; // Define o tempo no objeto referenciado
};

/**
 * Função para validar o formulário antes de enviar
 */
const validateForm = () => {
    errors.value = {}; // Limpa os erros de validação
    cpfvalidate(); // Valida o CPF
    validateEmail(); // Valida o email
    return Object.keys(errors.value).length === 0; // Retorna verdadeiro se não houver erros
};

/**
 * Função para validar o formato do e-mail
 */
const validateEmail = () => {
    const email = funcionario.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão de validação de e-mail
    if (!email || !emailPattern.test(email)) {
        errors.value.email = 'E-mail inválido'; // Se o e-mail for inválido, registra o erro
    } else {
        errors.value.email = ''; // Limpa o erro de e-mail se válido
    }
};

/**
 * Função para validar o CPF
 */
const cpfvalidate = () => {
    const cpf = funcionario.CPF;
    if (!cpf || !validateCPF(cpf)) {
        errors.value.CPF = 'CPF inválido'; // Se o CPF for inválido, registra o erro
    } else {
        errors.value.CPF = ''; // Limpa o erro de CPF se válido
    }
};

/**
 * Função para obter a imagem do funcionário
 */
const getImagem = async (filename) => {
    if (filename === '') {
        return imagePlaceholder; // Se não houver foto, retorna o placeholder
    }
    try {
        const response = await axios.get(`/image/funcionario/${store.userIdCliente}/${filename}`, {
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autenticação
            }
        });
        const { image, mimeType } = response.data; // Desestrutura a resposta com a imagem e mimeType
        imageUrl.value = `data:${mimeType};base64,${image}`; // Converte a imagem para base64
    } catch (error) {
        return imagePlaceholder; // Caso haja erro, retorna o placeholder
    }
};

// Função chamada no mounted para carregar os dados iniciais
onMounted(() => {
    loadData(); // Carrega os dados necessários
    loadFuncionarios(); // Carrega os funcionários
    fetchHieraquiaOptions(); // Carrega as opções de hierarquia
    fetchItensSetor(); // Carrega os itens do setor
});

// Função para excluir um funcionário
const deleteFuncionario = async () => {
    let data = { id_funcionario: funcionario.id_funcionario, id_usuario: store.userId }; // Dados do funcionário a ser excluído
    try {
        loading.value = true; // Ativa o spinner de carregamento
        await axios.post('/funcionarios/deleteFuncionario', data, {
            // Envia requisição para deletar o funcionário
            headers: {
                Authorization: `Bearer ${store.token}` // Envia o token de autenticação
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário Deletado', life: 3000 }); // Exibe mensagem de sucesso
        dataStore.invalidateFuncionariosCache(); // Invalida o cache de funcionários
        deleteFuncionarioDialog.value = false; // Fecha o diálogo de exclusão
        loadFuncionarios(); // Recarrega a lista de funcionários
        active.value = 0; // Volta para a aba inicial
        resetForm(); // Reseta o formulário
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o funcionário', life: 3000 }); // Exibe mensagem de erro
    } finally {
        loading.value = false; // Desativa o spinner
    }
};

/**
 * Função para resetar o formulário de funcionário
 */
const resetForm = () => {
    funcionario.foto = null; // Limpa a foto
    imageUrl.value = imagePlaceholder; // Define a imagem de placeholder

    funcionario.id_funcionario = ''; // Limpa o ID do funcionário
    funcionario.matricula = ''; // Limpa a matrícula
    funcionario.nome = ''; // Limpa o nome
    funcionario.senha = ''; // Limpa a senha
    funcionario.biometria = ''; // Limpa a biometria
    funcionario.biometria2 = ''; // Limpa a biometria 2
    funcionario.data_admissao = null; // Limpa a data de admissão
    funcionario.CPF = ''; // Limpa o CPF
    funcionario.RG = ''; // Limpa o RG
    funcionario.CTPS = ''; // Limpa a CTPS
    funcionario.email = ''; // Limpa o e-mail
    funcionario.status = ''; // Limpa o status
    funcionario.hora_inicial = ''; // Limpa a hora inicial
    funcionario.hora_final = ''; // Limpa a hora final
    funcionario.id_centro_custo = ''; // Limpa o ID do centro de custo
    funcionario.id_funcao = ''; // Limpa o ID da função
    funcionario.id_planta = ''; // Limpa o ID da planta
    funcionario.id_setor = ''; // Limpa o ID do setor

    funcionario.segunda = false; // Limpa o valor do dia segunda
    funcionario.terca = false; // Limpa o valor do dia terça
    funcionario.quarta = false; // Limpa o valor do dia quarta
    funcionario.quinta = false; // Limpa o valor do dia quinta
    funcionario.sexta = false; // Limpa o valor do dia sexta
    funcionario.sabado = false; // Limpa o valor do dia sábado
    funcionario.domingo = false; // Limpa o valor do dia domingo

    funcionario.itemsSelecionadosFuncionario = []; // Limpa os itens selecionados

    selectedFile.value = null; // Limpa o arquivo selecionado
    TempoInicio.value = null; // Limpa o tempo de início
    TempoFim.value = null; // Limpa o tempo de fim
    imageUploader.value?.clearImageData(); // Limpa os dados da imagem
    ListaItemsSetor.value = []; // Limpa a lista de itens do setor
};

/**
 * Reseta os dados do produto selecionado, deixando-o em seu estado inicial.
 */
const resetItens = () => {
    selectedProduct.value = {
        id_produto: '', // ID do produto
        nome: '', // Nome do produto
        sku: '', // SKU do produto
        quantidade: null // Quantidade do produto
    };
};

/**
 * Função para salvar o produto selecionado no funcionário.
 * Faz a validação dos campos e envia os dados ao servidor.
 */
const SalvarProduto = async () => {
    if (!validarCampos()) {
        // Se a validação dos campos falhar
        return; // Interrompe o processo de salvamento
    }

    // Dados do produto que serão enviados ao servidor
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente
        id_usuario: store.userId, // ID do usuário
        id_funcionario: funcionario.id_funcionario, // ID do funcionário
        id_produto: selectedProduct.value.id_produto, // ID do produto
        quantidade: selectedProduct.value.quantidade // Quantidade do produto
    };

    loading.value = true; // Ativa o carregamento enquanto a requisição é feita

    try {
        // Envia a requisição para adicionar o produto
        const response = await axios.post('/funcionarios/adicionarItem', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });

        // Reseta a lista de produtos do funcionário e a substitui com a resposta do servidor
        ListaProdutoFuncionario.value = [];
        ListaProdutoFuncionario.value = response.data.dados[0]; // Supondo que a resposta contenha os dados atualizados do produto

        visible.value = false; // Fecha o diálogo de adicionar item
        resetItens(); // Reseta os campos do produto
        toast.add({
            severity: 'success', // Exibe um toast de sucesso
            summary: 'Produto Adicionado',
            detail: 'O produto foi adicionado com sucesso!',
            life: 3000 // Duração do toast
        });
    } catch (error) {
        // Caso ocorra algum erro, exibe uma mensagem de erro no toast
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao adicionar o produto',
            life: 3000
        });
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

/**
 * Função para listar os produtos filtrados, ou seja, produtos que não estão alocados ao setor nem ao funcionário.
 */
const listarProdutosFiltrados = () => {
    const idsSetor = new Set(ListaItemsSetor.value.map((item) => item.id_produto)); // IDs dos produtos do setor

    const idsAdicionados = new Set(ListaProdutoFuncionario.value.map((item) => item.id_produto)); // IDs dos produtos já adicionados ao funcionário

    // Filtra os produtos que não estão no setor nem no funcionário
    const itensFiltrados = ListaProdutos.value.filter((produto) => !idsSetor.has(produto.value) && !idsAdicionados.has(produto.value));

    // Atualiza a lista de produtos disponíveis
    ListaProdutosDisponiveis.splice(0, ListaProdutosDisponiveis.length, ...itensFiltrados);

    // Se não houver produtos filtrados, exibe uma mensagem de advertência
    if (itensFiltrados.length === 0) {
        toast.add({
            severity: 'warn', // Tipo de toast: advertência
            summary: 'Nenhum item disponível',
            detail: 'Todos os itens já foram adicionados ao setor ou ao funcionário.',
            life: 3000 // Duração do toast
        });
    }
};

/**
 * Função chamada ao abrir o diálogo de adicionar item, listando os produtos filtrados antes.
 */
const abrirDialogAdicionarItem = () => {
    listarProdutosFiltrados(); // Lista os produtos filtrados
    visible.value = true; // Mostra o diálogo de adicionar item
};

/**
 * Função para editar um item já adicionado ao funcionário.
 * Preenche os campos do formulário com os dados do item selecionado.
 */
const editItem = (selectedItem) => {
    selectedProduct.value = { ...selectedItem }; // Preenche o produto selecionado
    itemDialog.value = true; // Abre o diálogo de edição do item
};

/**
 * Função para atualizar as informações do funcionário no servidor.
 * Envia dados atualizados, incluindo a foto, itens e outras informações do funcionário.
 */
const atualizarFuncionario = async () => {
    const formData = new FormData(); // Cria um FormData para enviar os dados via multipart

    if (selectedFile.value) {
        // Se um arquivo de imagem for selecionado
        const fileExtension = selectedFile.value.name.split('.').pop(); // Obtém a extensão do arquivo
        const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExtension}`; // Cria um nome único para o arquivo

        formData.append('foto', nomeArquivo); // Adiciona a foto ao FormData
        formData.append('file', selectedFile.value); // Adiciona o arquivo de imagem
        formData.append('remove_old_photo', true); // Informa que a foto anterior deve ser removida
    } else {
        formData.append('foto', funcionario.foto); // Caso contrário, apenas envia a foto existente
    }

    // Remove duplicatas de itens
    const { foto, itens, ...restOfFuncionario } = funcionario;
    const itensUnicos = Array.from(new Set(itens.map((item) => item.id_produto))).map((id_produto) => itens.find((item) => item.id_produto === id_produto));

    formData.append('itens', JSON.stringify(itensUnicos)); // Adiciona os itens ao FormData

    // Adiciona o restante dos dados do funcionário ao FormData
    Object.entries(restOfFuncionario).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append('id_usuario', store.userId); // Adiciona o ID do usuário que está atualizando

    try {
        loading.value = true; // Ativa o carregamento enquanto a requisição é feita

        const response = await axios.put(`/funcionarios/atualizar`, formData, {
            headers: {
                Authorization: `Bearer ${store.token}`, // Envia o token de autenticação
                'Content-Type': 'multipart/form-data' // Define o tipo de conteúdo como multipart/form-data
            }
        });

        toast.add({
            severity: 'success', // Exibe mensagem de sucesso
            summary: 'Sucesso',
            detail: 'Funcionário atualizado',
            life: 3000
        });

        dataStore.invalidateFuncionariosCache(); // Invalida o cache de funcionários
        loadFuncionarios(); // Recarrega a lista de funcionários
        active.value = 0; // Volta para a tela inicial
        resetForm(); // Reseta o formulário
    } catch (error) {
        toast.add({
            severity: 'error', // Exibe mensagem de erro
            summary: 'Erro',
            detail: 'Erro ao atualizar o funcionário',
            life: 3000
        });
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

/**
 * Função para fechar todos os dropdowns abertos na página.
 */
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o primeiro dropdown
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o segundo dropdown
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o terceiro dropdown
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o quarto dropdown
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o quinto dropdown
};

/**
 * Função chamada quando o datepicker é aberto, fecha todos os dropdowns para evitar sobreposição.
 */
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns
};

/**
 * Função para confirmar a exclusão de um produto.
 */
const confirmDeleteProduct = (item) => {
    selectedProduct.value = { ...item }; // Preenche o produto selecionado
    deleteProductDialog.value = true; // Exibe o diálogo de exclusão do produto
};

/**
 * Função para deletar um item associado ao funcionário.
 */
const deleteProduct = async () => {
    let data = {
        id_cliente: store.userIdCliente, // ID do cliente
        id_usuario: store.userId, // ID do usuário
        id_funcionario: funcionario.id_funcionario, // ID do funcionário
        id_produto: selectedProduct.value.id_produto, // ID do produto
        quantidade: selectedProduct.value.quantidade // Quantidade do produto
    };

    try {
        loading.value = true; // Ativa o carregamento

        // Envia a requisição para deletar o item
        const res = await axios.post('/funcionarios/deleteItem', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Token de autenticação
            }
        });

        if (res.data && res.data.items) {
            // Se a resposta contiver os itens atualizados
            ListaProdutoFuncionario.value = res.data.items; // Atualiza a lista de produtos do funcionário
        }

        resetItens(); // Reseta os itens

        toast.add({
            severity: 'success', // Exibe mensagem de sucesso
            summary: 'Sucesso',
            detail: 'Item deletado com sucesso!',
            life: 3000
        });

        deleteProductDialog.value = false; // Fecha o diálogo de exclusão
    } catch (error) {
        toast.add({
            severity: 'error', // Exibe mensagem de erro
            summary: 'Erro',
            detail: 'Erro ao deletar o item',
            life: 3000
        });
        console.error(error); // Exibe erro no console para depuração
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

/**
 * Função para validar os campos do produto antes de salvar.
 * Verifica se o produto e a quantidade foram preenchidos corretamente.
 */
const validarCampos = () => {
    try {
        if (!selectedProduct.value.id_produto) {
            // Verifica se o produto foi selecionado
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Selecione o item.',
                life: 3000
            });
            return false; // Se não selecionar o produto, retorna falso
        }

        if (!selectedProduct.value.quantidade || selectedProduct.value.quantidade <= 0) {
            // Verifica se a quantidade é válida
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Preencha a quantidade com um valor válido.',
                life: 3000
            });
            return false; // Se a quantidade for inválida, retorna falso
        }

        return true; // Se os campos forem válidos, retorna verdadeiro
    } catch (error) {
        console.error(error); // Para depuração
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, preencha todos os campos obrigatórios.',
            life: 3000
        });
        return false; // Caso ocorra algum erro, retorna falso
    }
};

/**
 * Função para esconder os diálogos de item e exclusão de produto.
 */
const hideDialog = () => {
    itemDialog.value = false; // Fecha o diálogo de item
    deleteProductDialog.value = false; // Fecha o diálogo de exclusão de produto
};
</script>

<template>
    <!-- Card com altura total da tela -->
    <div class="card vh">
        <!-- Componente TabView, que controla a exibição de abas -->
        <TabView v-model:activeIndex="active">
            <!-- Primeira aba do TabView para listar os funcionários -->
            <TabPanel header="Listar Funcionários">
                <div class="col-12">
                    <!-- Componente DataTable para exibição de dados em tabela -->
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaFuncionarios"
                        selectionMode="single"
                        stripedRows
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        dataKey="id"
                        :sortField="'matricula'"
                        :sortOrder="1"
                        :globalFilterFields="['nome', 'matricula']"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                    >
                        <!-- A tabela exibe os dados provenientes de "ListaFuncionarios" -->
                        <!-- Permite selecionar apenas uma linha por vez -->
                        <!-- Aplica um estilo alternado nas linhas para melhorar a legibilidade -->
                        <!-- Habilita a funcionalidade de paginação -->
                        <!-- Permite a ordenação removível, ou seja, a ordenação pode ser removida clicando novamente na coluna de ordenação -->
                        <!-- Oferece as opções de quantidade de itens por página: 5, 10, 20, 50 -->
                        <!-- Exibe 10 itens por página por padrão -->
                        <!-- Define a chave única para cada linha como o campo "id" -->
                        <!-- Ordena inicialmente pela coluna "matricula" em ordem crescente -->
                        <!-- Aplica o filtro global aos campos "nome" e "matricula" -->
                        <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" -->
                        <!-- Emite o evento 'rowSelect' e chama a função 'onRowSelect' ao selecionar uma linha -->
                        <!-- Cabeçalho da tabela -->
                        <template #header>
                            <div class="flex justify-content-between align-items-center mt-4">
                                <div class="font-semibold">
                                    <!-- Exibe o número de registros filtrados -->
                                    <span>Total de registros: {{ filteredCount }}</span>
                                </div>
                                <IconField iconPosition="left">
                                    <InputIcon>
                                        <!-- Ícone de pesquisa -->
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <!-- Campo de pesquisa global -->
                                    <InputText v-model="filters['global'].value" placeholder="Busca" />
                                </IconField>
                            </div>
                        </template>

                        <!-- Mensagem exibida quando não há dados -->
                        <template #empty> Nenhum funcionário adicionado. </template>

                        <!-- Coluna para exibir o nome do funcionário -->
                        <Column field="nome" sortable header="Nome" class="col-6"></Column>
                        <!-- Coluna para exibir a matrícula do funcionário -->
                        <Column field="matricula" sortable header="Matrícula" class="col-6"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <!-- Segunda aba do TabView para editar ou adicionar funcionários -->
            <TabPanel :header="editVisible ? 'Editar Funcionário' : 'Adicionar Funcionário'">
                <div class="grid">
                    <div class="col-12">
                        <div class="mt-5">
                            <!-- Formulário de cadastro de novo funcionário -->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <!-- Campo para o nome do funcionário -->
                                <div class="full lg:col-8 md:col-6 sm:col-12">
                                    <label for="name">Nome:</label>
                                    <InputText class="my-2" v-model="funcionario.nome" id="name" type="text"> </InputText>
                                </div>

                                <!-- Campo para a matrícula do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="matricula">Matrícula:</label>
                                    <InputText class="my-2" id="matricula" v-model="funcionario.matricula" />
                                </div>

                                <!-- Campo para a senha do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="senha">Senha:</label>
                                    <InputText type="password" class="my-2" id="senha" v-model="funcionario.senha" />
                                </div>

                                <!-- Campo para o hash biométrico 1 -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash">Hash 1:</label>
                                    <InputText class="my-2" disabled id="Hash" v-model="funcionario.biometria" />
                                </div>

                                <!-- Campo para o hash biométrico 2 -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash2">Hash 2:</label>
                                    <InputText class="my-2" disabled id="Hash2" v-model="funcionario.biometria2" />
                                </div>

                                <!-- Campo para a data de admissão do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="DataAdmissao">Data de Admissão:</label>
                                    <VueDatePicker class="my-2" v-model="funcionario.data_admissao" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />

                                    <!--
  Componente VueDatePicker para exibição do seletor de data:

  - `class="my-2"`: Aplica uma margem superior e inferior de 2 unidades (por padrão, 0.5rem no Tailwind CSS).
  - `v-model="funcionario.data_admissao"`: Realiza a vinculação bidirecional com a propriedade `data_admissao` do objeto `funcionario`, garantindo que a data escolhida seja refletida na variável.
  - `showIcon`: Exibe um ícone de calendário à direita do campo de entrada, indicando que é um campo de data.
  - `:showOnFocus="false"`: Impede que o calendário apareça automaticamente ao focar no campo de entrada, oferecendo maior controle ao usuário sobre quando o calendário será mostrado.
  - `:format="format"`: A variável `format` define o formato de exibição da data. Exemplo: `DD/MM/YYYY`.
  - `locale="pt-BR"`: Configura o idioma para Português Brasileiro, o que afetará a exibição de meses, dias e formato da data.
  - `auto-apply`: Quando ativado, a data é aplicada automaticamente assim que o usuário a escolhe, sem precisar confirmar.
  - `:enable-time-picker="false"`: Desabilita a seleção de hora, permitindo que apenas a data seja escolhida.
  - `@open="handleDatepickerOpen"`: Aciona o método `handleDatepickerOpen` sempre que o calendário é aberto, permitindo realizar ações personalizadas, como monitoramento ou ajustes de interface.

  Este componente é ideal para selecionar datas de maneira interativa e fácil de usar, com suporte a formatação personalizada e comportamento flexível.
-->
                                </div>

                                <!-- Campo para o CPF do funcionário com máscara de entrada -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="cpf">CPF:</label>
                                    <InputMask class="my-2" v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" :unmask="true" :invalid="!!errors.CPF" @blur="cpfvalidate" />
                                    <!-- Exibe mensagem de erro caso o CPF seja inválido -->
                                    <small v-if="errors.CPF" class="p-error">{{ errors.CPF }}</small>
                                </div>

                                <!-- Campo para o RG do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="rg">RG:</label>
                                    <InputMask class="my-2" id="rg" v-model="funcionario.RG" mask="99.999.999-*" :unmask="true" />
                                </div>

                                <!-- Campo para o CTPS do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="ctps">CTPS:</label>
                                    <InputMask class="my-2" id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" :unmask="true" />
                                </div>

                                <!-- Campo para o e-mail do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="email">E-mail:</label>
                                    <InputText class="my-2" id="email" v-model="funcionario.email" :invalid="!!errors.email" @blur="validateEmail" />
                                    <!-- Exibe mensagem de erro caso o e-mail seja inválido -->
                                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                </div>

                                <!-- Dropdown para selecionar o centro de custo do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="perfil">Centro de Custo:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Selecione Um " ref="dropdown1" />
                                </div>

                                <!-- Dropdown para selecionar a planta do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="planta">Planta:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Selecione a Planta" ref="dropdown2" />
                                </div>

                                <!-- Dropdown para selecionar o setor/diretoria do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="setor">Setor/Diretoria:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_setor" :options="setor" optionLabel="label" optionValue="value" placeholder="Selecione o Setor" @change="setorChange" ref="dropdown3" />
                                </div>

                                <!-- Dropdown para selecionar a função/nível hierárquico do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label class="ajustetexto" for="funcao">Função/Nível Hierárquico:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_funcao" :options="formatedHierarquiaOptions" optionLabel="label" optionValue="value" placeholder="Selecione a Função" ref="dropdown4" />
                                </div>

                                <!-- Dropdown para selecionar o status do funcionário -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="status">Status:</label>
                                    <Dropdown class="my-2" id="status" v-model="funcionario.status" :options="status" optionLabel="label" optionValue="value" placeholder="Escolha um" ref="dropdown5"></Dropdown>
                                </div>

                                <!-- Campo para selecionar a hora de início -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="inicio">Hora Início:</label>
                                    <VueDatePicker class="my-2" v-model="TempoInicio" time-picker disable-time-range-validation>
                                        <!-- Componente VueDatePicker configurado para selecionar um horário:

  - `class="my-2"`: Aplica uma margem superior e inferior de 2 unidades (por padrão, 0.5rem no Tailwind CSS), garantindo um espaçamento adequado ao redor do campo.
  - `v-model="TempoInicio"`: Cria uma vinculação bidirecional com a variável `TempoInicio`, o que significa que a hora selecionada será refletida nesta variável, e qualquer alteração na variável será refletida na interface.
  - `time-picker`: Habilita o seletor de horário, permitindo que o usuário escolha um horário específico. Quando esta propriedade é definida, o componente exibe um campo de seleção de hora e minuto.
  - `disable-time-range-validation`: Desativa a validação do intervalo de tempo. Normalmente, um validador de intervalo pode ser configurado para restringir os horários, mas essa opção permite que o usuário selecione qualquer hora, independentemente de qualquer limitação ou intervalo.

  Este componente é usado para escolher um horário, sem restrições de intervalo, com a funcionalidade de vinculação dinâmica à variável `TempoInicio`.
-->

                                        <template #input-icon>
                                            <!-- Ícone de relógio ao lado do campo de hora -->
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>

                                <!-- Campo para selecionar a hora de fim -->
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="inicio">Hora Fim:</label>
                                    <VueDatePicker class="my-2" id="inicio" v-model="TempoFim" time-picker disable-time-range-validation>
                                        <!-- Componente VueDatePicker configurado para selecionar um horário, com os seguintes parâmetros:
- `class="my-2"`: Aplica uma margem superior e inferior de 2 unidades (por padrão, 0.5rem no Tailwind CSS). Isso ajuda a garantir que o campo de data tenha espaçamento adequado ao redor de outros elementos.
  - `id="inicio"`: Define o identificador único do campo de data como "inicio". Esse ID pode ser útil para estilização ou manipulação do DOM via JavaScript (por exemplo, referenciar esse campo em testes ou aplicar regras CSS específicas).
  - `v-model="TempoFim"`: Vinculação bidirecional de dados. A variável `TempoFim` será automaticamente atualizada com o valor selecionado pelo usuário, e qualquer alteração dessa variável será refletida no componente.
  - `time-picker`: Habilita a seleção de tempo, permitindo ao usuário escolher apenas uma hora e minuto, sem a necessidade de selecionar uma data.
  - `disable-time-range-validation`: Desativa qualquer validação de intervalo de tempo. Normalmente, a validação de intervalo pode restringir as horas que podem ser escolhidas, mas esta propriedade permite que o usuário selecione qualquer horário, sem limitações.

  Este componente é utilizado para selecionar um horário (sem data) com a possibilidade de vinculação à variável `TempoFim`. O campo de tempo é completamente livre para o usuário escolher, pois a validação de intervalo está desativada.
-->
                                        <template #input-icon>
                                            <!-- Ícone de relógio ao lado do campo de hora -->
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>

                                <!-- Campo de seleção de dias da semana para retirar itens -->
                                <div class="p-fluid formgrid grid nested-grid lg:col-8 md:col-6 sm:4 p-0 pt-1">
                                    <Fieldset legend="Selecione os dias que o funcionário poderá retirar os Itens:" class="mt-5 p-1 lg:col-12 md:col-12 sm:col-12">
                                        <label for="fim"></label>
                                        <div id="fim" class="checkbox-container flex align-content-end flex-wrap mx-4">
                                            <!-- Opções de dias da semana -->
                                            <div class="checkbox-items m-2 flex align-items-end">
                                                <Checkbox v-model="funcionario.segunda" inputId="Segunda" name="Dias" value="Segunda" :binary="true" />
                                                <label for="Segunda" class="ml-2"> Segunda-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.terca" inputId="Terca" name="Dias" value="Terca" :binary="true" />
                                                <label for="Terca" class="ml-2"> Terça-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quarta" inputId="Quarta" name="Dias" value="Quarta" :binary="true" />
                                                <label for="Quarta" class="ml-2"> Quarta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quinta" inputId="Quinta" name="Dias" value="Quinta" :binary="true" />
                                                <label for="Quinta" class="ml-2"> Quinta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sexta" inputId="Sexta" name="Dias" value="Sexta" :binary="true" />
                                                <label for="Sexta" class="ml-2"> Sexta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sabado" inputId="Sabado" name="Dias" value="Sabado" :binary="true" />
                                                <label for="Sabado" class="ml-2"> Sábado </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.domingo" inputId="Domingo" name="Dias" value="Domingo" :binary="true" />
                                                <label for="Domingo" class="ml-2"> Domingo</label>
                                            </div>
                                        </div>
                                    </Fieldset>
                                </div>

                                <div class="full mx-auto lg:col-4 md:col-6 sm:col-12 ml-2 ml-2 p-0">
                                    <!-- Componente de upload de imagem -->
                                    <ImageUpload ref="imageUploader" @fileSelected="handleFileSelected" @clearImage="handleClearImage" :externalImages="imageUrl" />
                                </div>
                            </div>
                            <!-- Botões de Ação - Salvar, Excluir e Adicionar -->
                            <div class="grid justify-content-end flex-wrap mt-8">
                                <!-- Botão de "Salvar" exibido apenas quando editVisible é verdadeiro -->
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarFuncionario" />
                                <!-- Chama a função 'atualizarFuncionario' ao clicar -->

                                <!-- Botão de "Excluir" exibido apenas quando editVisible é verdadeiro -->
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteFuncionarioDialog = true" />
                                <!-- Exibe o diálogo de confirmação de exclusão -->

                                <!-- Botão de "Salvar" exibido quando editVisible for falso, ou seja, para um novo funcionário -->
                                <Button v-if="!editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarFuncionario()" />
                                <!-- Chama a função 'adicionarFuncionario' ao clicar -->
                            </div>
                            <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                            <div class="col-12">
                                <TabView v-model:activeIndex="activeItens">
                                    <TabPanel header="Itens do Setor">
                                        <DataTable
                                            class=""
                                            v-model:filters="filters"
                                            :value="ListaItemsSetor"
                                            stripedRows
                                            paginator
                                            removableSort
                                            :rows="10"
                                            :rowsPerPageOptions="[5, 10, 20, 50]"
                                            :globalFilterFields="['nome', 'sku', 'qtd_limite']"
                                            dataKey="sku"
                                        >
                                            <!-- A tabela exibe os dados provenientes de "ListaItemsSetor" -->
                                            <!-- Aplica um estilo alternado nas linhas para melhorar a legibilidade -->
                                            <!-- Habilita a funcionalidade de paginação, dividindo os dados em várias páginas -->
                                            <!-- Permite ao usuário remover a ordenação clicando novamente na coluna de ordenação -->
                                            <!-- Exibe 10 itens por página por padrão -->
                                            <!-- Oferece as opções de quantidade de itens por página: 5, 10, 20, 50 -->
                                            <!-- Aplica o filtro global aos campos "nome", "sku" e "qtd_limite" -->
                                            <!-- Define a chave única para cada linha como o campo "sku" -->

                                            <!-- Cabeçalho da tabela com campo de busca -->
                                            <template #header>
                                                <div class="flex justify-content-end align-items-center mb-2">
                                                    <div>
                                                        <IconField iconPosition="left">
                                                            <InputIcon>
                                                                <i class="pi pi-search" />
                                                            </InputIcon>
                                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                                        </IconField>
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- Mensagem caso não haja dados -->
                                            <template #empty> Nenhum item adicionado. </template>
                                            <!-- Definição das colunas da tabela -->
                                            <Column field="nome" sortable style="width: 45%" header="Nome"></Column>
                                            <Column field="sku" sortable header="SKU"></Column>
                                            <Column field="qtd_limite" header="Quantidade"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <!-- Aba "Itens do Funcionario" -->
                                    <TabPanel header="Itens do Funcionario">
                                        <Button class="mt-3 justify-content-end" label="Adicionar Itens" @click="abrirDialogAdicionarItem" />
                                        <!-- Abre o diálogo de adicionar item -->

                                        <DataTable
                                            class="mt-3"
                                            v-model:filters="filters"
                                            :value="ListaProdutoFuncionario"
                                            paginator
                                            :rows="10"
                                            :sortField="'sku'"
                                            :rowsPerPageOptions="[5, 10, 20, 50]"
                                            :globalFilterFields="['nome_produto', 'sku', 'quantidade']"
                                            tableStyle="min-width: 50rem"
                                            stripedRows
                                            dataKey="id_item_funcionario"
                                        >
                                            <!-- A tabela exibe os dados provenientes de "ListaProdutoFuncionario" -->
                                            <!-- Habilita a funcionalidade de paginação para organizar os dados em páginas -->
                                            <!-- Exibe 10 itens por página por padrão -->
                                            <!-- Permite ao usuário escolher entre 5, 10, 20 ou 50 itens por página -->
                                            <!-- Aplica o filtro global aos campos "nome_produto", "sku" e "quantidade" -->
                                            <!-- A tabela possui um estilo de largura mínima de 50rem para garantir uma exibição adequada -->
                                            <!-- Aplica um estilo alternado nas linhas para melhorar a leitura -->
                                            <!-- Utiliza o campo "id_item_funcionario" como chave única para identificar cada linha -->

                                            <!-- Cabeçalho da tabela com campo de busca -->
                                            <template #header>
                                                <div class="flex justify-content-end align-items-center mb-4">
                                                    <div>
                                                        <IconField iconPosition="left">
                                                            <InputIcon>
                                                                <i class="pi pi-search" />
                                                            </InputIcon>
                                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                                        </IconField>
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- Mensagem caso não haja dados -->
                                            <template #empty> Nenhum item adicionado. </template>
                                            <!-- Definição das colunas da tabela -->
                                            <Column field="nome_produto" sortable style="width: 45%" header="Nome"></Column>
                                            <Column field="sku" sortable header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <!-- Coluna de Ação: Editar e Excluir -->
                                            <Column style="min-width: 8rem">
                                                <template #body="slotProps">
                                                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                                                    <!-- Edita o item -->
                                                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                                                    <!-- Exclui o item -->
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </TabPanel>
                                </TabView>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <!-- Diálogo de Edição de Item -->
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :draggable="false" :modal="true" class="p-fluid">
            <div>
                <div class="p-fluid formgrid grid">
                    <!-- Campo para exibir o nome do produto (desabilitado) -->
                    <div class="field lg:col-12 md:col-6 sm:col-4">
                        <label for="name">Nome:</label>
                        <InputText disabled v-model="selectedProduct.nome_produto" id="name" type="text"></InputText>
                    </div>
                    <!-- Campo para editar a quantidade -->
                    <div class="field lg:col-4 md:col-6 sm:col-4">
                        <label for="Quantidade">Quantidade</label>
                        <InputText id="Quantidade" v-model="selectedProduct.quantidade" />
                    </div>
                </div>
            </div>
            <template #footer>
                <!-- Botões de Cancelar e Salvar -->
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Salvar" icon="pi pi-check" text @click="SalvarProduto" />
            </template>
        </Dialog>

        <!-- Diálogo para Adicionar Itens ao Funcionário -->
        <Dialog v-model:visible="visible" :modal="true" :draggable="false" header="Adicionar Itens do Funcionário">
            <div class="grid">
                <!-- Seleção de Produto -->
                <div class="col-12">
                    <label for="Produto" class="mr-2 font-semibold col-2">Produto: </label>
                    <Dropdown v-model="selectedProduct.id_produto" :options="ListaProdutosDisponiveis" optionLabel="label" optionValue="value" placeholder="Selecione um produto" class="col-8 p-0" />
                </div>
                <!-- Seleção de Quantidade -->
                <div class="col-12">
                    <label for="Quantidade" class="font-semibold w-6rem mr-2">Quantidade: </label>
                    <InputNumber variant="filled" id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <!-- Botões de Cancelar e Adicionar -->
                <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Adicionar" @click="SalvarProduto"></Button>
            </div>
        </Dialog>
        <!-- Diálogo para Deletar um Produto -->
        <Dialog v-model:visible="deleteProductDialog" :draggable="false" :style="{ width: '450px' }" header="Deletar Item" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="selectedProduct.id_produto">
                    Você tem certeza que quer deletar o Item <b>{{ selectedProduct.nome_produto }}</b> ?
                </span>
            </div>
            <template #footer>
                <!-- Botões de Confirmação ou Cancelamento -->
                <Button label="Não" icon="pi pi-times" text @click="hideDialog()" />
                <Button label="Sim" icon="pi pi-check" text @click="deleteProduct()" />
            </template>
        </Dialog>
        <!-- Diálogo para Deletar um Funcionário -->
        <Dialog header="Deletar Funcionário" v-model:visible="deleteFuncionarioDialog" :draggable="false" style="width: 400px" :modal="true" :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class="">
                    Você tem certeza que deseja deletar o funcionário <b>{{ funcionario.id_funcionario }}</b> - <b>{{ funcionario.nome }}</b> ?
                </span>
            </div>
            <template #footer>
                <!-- Botões de Confirmação ou Cancelamento -->
                <Button label="Não" icon="pi pi-times" @click="deleteFuncionarioDialog = false" class="p-button-text" />
                <Button label="Sim" icon="pi pi-check" @click="deleteFuncionario" class="p-button-text" />
            </template>
        </Dialog>
        <!-- Componente de Spinner de Carregamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>
<style>
.input-slot-image {
    height: 20px;
    width: auto;
    margin-left: 5px;
}

.p-error {
    color: red;
}

.ajustetexto {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    /* Garantir que o label se comporte corretamente dentro de um grid */
}

.checkbox-container {
    display: flex;
}

.checkbox-items {
    width: 40%;
    /* Metade da largura do contêiner para duas colunas */
    margin-bottom: 10px;
    /* Espaçamento entre as linhas */
}

.nested-grid {
    padding: 10px;
}

.buttons {
    width: 100px;
}

@media (max-width: 580px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }
}
</style>
