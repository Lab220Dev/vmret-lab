<script setup>
import { useToast } from 'primevue/usetoast'; // Função para exibir notificações (toast)
import { reactive, ref, onMounted, watch, computed, nextTick } from 'vue'; // Hooks do Vue.js
import { useAuthStore } from '@/store/authStore.js'; // Store para autenticação de usuário
import axios from '@/axios.js'; // Instância Axios para requisições HTTP
import { FilterMatchMode } from 'primevue/api'; // Modo de filtro global para PrimeVue
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Componente de loading
import { useDataStore } from '@/store/dataStore.js'; // Store para dados gerais

// Variáveis reativas para gerenciar o estado do componente
const dialogMessage = ref(''); // Mensagem do diálogo
const selectedItem = ref(null); // Item selecionado
const toast = useToast(); // Função de notificação de toast
const active = ref(0); // Controle de estado ativo
const dataStore = useDataStore(); // Acesso ao store de dados
const todosOption = { label: 'Todos', value: { id_cliente: '', nome_cliente: 'Todos', usar_api: false }, usar_api: false }; // Opção de "todos"

// Store de autenticação
const store = useAuthStore();
const loading = ref(false); // Controle de loading
const loadingControladoras = ref(true); // Controle de loading de controladoras

// Objeto reativo para armazenar dados do DM (Dispositivo de Monitoramento)
let DM = reactive({
    Ativo: false,
    Chave: '',
    ChaveAPI: '',
    ClienteID: '',
    ClienteNome: '',
    Created: '',
    Enviada: '',
    ID_CR_Usuario: '',
    ID_DM: '',
    IDcliente: '',
    Identificacao: '',
    Integracao: false,
    Numero: '',
    OP_Biometria: '',
    OP_Facial: '',
    OP_Senha: '',
    URL: '',
    Updated: '',
    UserID: '',
    Versao: '',
    Devolucao: false
});

// Tipos de controladoras
const tipoControladoras = ['2018', '2023', '2024', 'Locker'];

// Mapeamento de valores para cada tipo de controladora
const nextValues = reactive({
    2018: { placa: 12 },
    2023: { dip: 2 },
    Locker: { dip: 3 },
    2024: { placa: 101 }
});

// Máximo de controladoras para cada tipo
const maxControladoras = {
    2018: 16,
    2023: 90,
    Locker: Infinity,
    2024: Infinity
};

// Função para contar as controladoras por tipo
const countControladoras = (tipo) => {
    return Controladoras.value.filter((controladora) => controladora.tipo === tipo).length;
};

// Controle de operador
const operador = ref(false);

// Controle de exibição de diálogos
const show = ref(false);
const showDialogDVM = ref(false);
const showDialogDItem = ref(false);
const showDialogProduto = ref(false);

// Listas de produtos, clientes e itens
const ListaProdutos = ref([]); // Lista de produtos
const ListaClientes = ref([]); // Lista de clientes
const selectedClient = ref({ id_cliente: '', nome_cliente: '', usar_api: false }); // Cliente selecionado
const visible = ref(false); // Controle de visibilidade
const ListaItens = ref([]); // Lista de itens

// Filtros de busca
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para busca por nome
});

// Controle de uso de API
const usarApi = ref(false);

// Objeto de produto selecionado
const produtoSelecionado = ref({
    id_produto: '',
    Porta: '',
    Placa: '',
    Posicao: '',
    Andar: '',
    Dip: '',
    Motor1: '',
    Motor2: '',
    Controladora: '',
    Capacidade: ''
});

// Variáveis para controlar o modo de edição
const isEditMode = ref(false); // Controle de edição de produto

// Listas de controladoras e opções
const Controladoras = ref([]); // Controladoras do DM
const controladoraOptions = ref([]); // Opções de controladoras
const molasOptions = ref([]); // Opções de molas
const dipOptions = ref([]); // Opções de DIP
const andarOptions = ref([]); // Opções de andar
const posicaoOptions = ref([]); // Opções de posição
const placaOptions = ref([]); // Opções de placa
const motorOptions = ref([]); // Opções de motor
const ListaDMS = ref([]); // Lista de DMs

// Função para manipular mudanças na controladora selecionada
const handleControladoraChange = () => {
    const selectedControladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora);
    if (!selectedControladora) return; // Se não encontrar a controladora, retorna sem fazer nada

    // Se a controladora selecionada for do tipo 2018
    if (selectedControladora.tipo === '2018') {
        let molasOcupadas = ListaItens.value
            .filter((item) => {
                const [tipo, identificador] = item.Posicao.replace(/\s/g, '').split('/'); // Separa a posição para identificar o tipo de controladora
                return tipo === '2018' && Number(identificador) === selectedControladora.dados.placa; // Filtra pela placa
            })
            .map((item) => {
                const [tipo, identificador, mola1, mola2] = item.Posicao.replace(/\s/g, '').split('/');
                return Number(mola1); // Retorna o número da mola ocupada
            });

        // Se estiver em modo de edição e a Mola1 estiver selecionada, filtra a mola ocupada
        if (isEditMode && produtoSelecionado.value.Motor1) {
            molasOcupadas = molasOcupadas.filter((mola) => mola !== produtoSelecionado.value.Motor1);
        }
        // Obtém as molas disponíveis para a controladora selecionada
        const molasDisponiveis = selectedControladora.dados.molas.filter((mola) => !molasOcupadas.includes(mola));
        molasOptions.value = molasDisponiveis.map((mola) => ({ label: mola, value: mola })); // Atualiza as opções de molas
        placaOptions.value = [{ label: selectedControladora.dados.placa, value: selectedControladora.dados.placa }]; // Atualiza as opções de placa
    } else if (selectedControladora.tipo === '2023') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }]; // Atualiza as opções de DIP
        andarOptions.value = selectedControladora.dados.andar.map((a) => ({ label: a, value: a })); // Atualiza as opções de andar
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p })); // Atualiza as opções de posição
    } else if (selectedControladora.tipo === '2024') {
        motorOptions.value = [{ label: selectedControladora.dados.motor, value: selectedControladora.dados.motor }]; // Atualiza as opções de motor
    } else if (selectedControladora.tipo === 'Locker') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }]; // Atualiza as opções de DIP para o tipo Locker
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p })); // Atualiza as opções de posição para o tipo Locker
    }
};

// Função para manipular mudanças no andar selecionado
const handleAndarChange = () => {
    const selectedControladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora); // Encontra a controladora selecionada
    const molasOcupadas = ListaItens.value
        .filter((item) => {
            const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/'); // Separa a posição do item
            return tipo === '2023' && Number(identificador) === selectedControladora.dados.dip && produtoSelecionado.value.Andar === Number(Andar); // Filtra pelo DIP e andar
        })
        .map((item) => {
            const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/');
            return Number(Posicao); // Retorna a posição ocupada
        });
    const molasDisponiveis = selectedControladora.dados.posicao.filter((mola) => !molasOcupadas.includes(mola)); // Obtém as molas disponíveis para o andar selecionado
    posicaoOptions.value = molasDisponiveis.map((mola) => ({ label: mola, value: mola })); // Atualiza as opções de posição
};

// Função para validar o andar selecionado
/**
 * Valida se o andar foi selecionado antes de permitir a seleção de uma posição.
 * Caso o andar não seja selecionado, a posição e andar são resetados e uma mensagem de aviso é exibida.
 */
const validarAndarSelecionado = () => {
    const Andar = produtoSelecionado.value.Andar; // Obtém o andar selecionado
    if (!Andar) {
        produtoSelecionado.value.Posicao = ''; // Reseta a posição
        produtoSelecionado.value.Andar = ''; // Reseta o andar

        // Exibe um aviso para o usuário informando que é necessário selecionar um andar primeiro
        toast.add({ severity: 'warn', summary: 'Erro', detail: 'Selecione um andar antes de selecionar uma posição.', life: 3000 });
        return; // Interrompe a execução da função caso o andar não esteja selecionado
    }
};

// Computed para obter o tipo da controladora selecionada
/**
 * Computed property para retornar o tipo da controladora selecionada no produto.
 * Se a controladora selecionada não for encontrada, retorna `null`.
 */
const tipoControladoraSelecionada = computed(() => {
    const controladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora); // Encontra a controladora pelo ID
    return controladora ? controladora.tipo : null; // Retorna o tipo da controladora ou null caso não seja encontrada
});

// Função para atualizar o produto selecionado
/**
 * Função para atualizar o produto selecionado.
 * Envia os dados do produto selecionado para a API para atualização no backend.
 */
const atualizarProduto = async () => {
    const selectedControladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora); // Encontra a controladora selecionada

    const data = {
        id_usuario: store.userId, // ID do usuário
        id_cliente: store.userIdCliente, // ID do cliente
        ...produtoSelecionado.value, // Dados do produto selecionado
        id_dm: DM.ID_DM, // ID do dispositivo de monitoramento
        tipo_controladora: selectedControladora ? selectedControladora.tipo : null // Tipo da controladora (pode ser null se não encontrado)
    };

    try {
        loading.value = true; // Ativa o loading enquanto a requisição está em andamento
        const response = await axios.post('/DM/atualizarItens', data); // Envia a requisição para atualizar o item
        showDialogProduto.value = false; // Fecha o diálogo do produto após a atualização
        resetProdutoSelecionado(); // Reseta os dados do produto selecionado
        fetchItemDM(); // Atualiza a lista de itens
    } catch (error) {
        console.error('Erro ao carregar produtos:', error); // Loga o erro no console caso a requisição falhe
    } finally {
        loading.value = false; // Desativa o loading após a requisição
        isEditMode.value = false; // Desativa o modo de edição
    }
};

// Função para buscar DMs
/**
 * Função para buscar os Dispositivos de Monitoramento (DMs) através de uma requisição.
 * A requisição é ajustada de acordo com o tipo de usuário (admin ou não).
 */
const fetchDMS = async () => {
    loading.value = true; // Ativa o loading enquanto busca os DMs
    let data = null;
    if (admin()) {
        data = ''; // Se for admin, não passa dados adicionais
    } else {
        data = {};
        data.id_cliente = store.userIdCliente; // Se não for admin, inclui o ID do cliente
    }

    try {
        const response = await axios.post('/DM/listar', data, {
            // Faz a requisição para listar os DMs
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação no cabeçalho
            }
        });
        ListaDMS.value = response.data; // Atualiza a lista de DMs com a resposta
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar DMs', life: 3000 }); // Exibe uma mensagem de erro
        console.error('Erro ao carregar usuários:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Desativa o loading após a requisição
    }
};

/**
 * Função chamada quando o usuário deseja excluir um item.
 * Exibe o diálogo de confirmação de exclusão com a mensagem personalizada.
 */
const deleteItem = async (item) => {
    dialogMessage.value = `Você tem certeza que deseja excluir o item ${item.Nome_Produto}?`; // Define a mensagem do diálogo
    showDialogDItem.value = true; // Exibe o diálogo de confirmação
    selectedItem.value = item; // Armazena o item selecionado para exclusão
};

/**
 * Função chamada para confirmar a exclusão do item.
 * Realiza a requisição para excluir o item e atualiza a lista de itens.
 */
const confirmDelete = async () => {
    if (!selectedItem.value) return; // Se não houver item selecionado, interrompe a execução

    loading.value = true; // Ativa o loading enquanto realiza a exclusão
    try {
        const response = await axios.post('/DM/deleteItem', {
            id_item: selectedItem.value.id_item, // ID do item a ser excluído
            id_usuario: store.userId // ID do usuário que está realizando a exclusão
        });

        // Atualiza a lista de itens após a exclusão
        fetchItemDM();

        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído com sucesso', life: 3000 }); // Exibe mensagem de sucesso
    } catch (error) {
        console.error('Erro ao excluir item:', error); // Loga o erro caso a exclusão falhe
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir item', life: 3000 }); // Exibe mensagem de erro
    } finally {
        loading.value = false; // Desativa o loading
        showDialogDItem.value = false; // Fecha o diálogo de exclusão
        selectedItem.value = null; // Reseta o item selecionado
    }
};

/**
 * Função chamada para cancelar a exclusão de um item.
 * Apenas fecha o diálogo sem realizar nenhuma ação.
 */
const cancelDelete = () => {
    showDialogDItem.value = false; // Fecha o diálogo de exclusão
    selectedItem.value = null; // Reseta o item selecionado
};

/**
 * Função para carregar os itens associados ao DM (Dispositivo de Monitoramento).
 * Realiza uma requisição para listar os itens e os exibe na interface.
 */
const fetchItemDM = async () => {
    loading.value = true; // Ativa o loading enquanto busca os itens
    try {
        const data = {
            id_dm: DM.ID_DM, // ID do DM
            id_cliente: store.userIdCliente, // ID do cliente
            id_usuario: store.userId // ID do usuário
        };
        const response = await axios.post('/DM/listaritens', data, {
            // Faz a requisição para listar os itens
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação
            }
        });
        ListaItens.value = response.data; // Atualiza a lista de itens com a resposta
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar itens da DM', life: 3000 }); // Exibe mensagem de erro
        console.error('Erro ao carregar Itens:', error); // Loga o erro no console
    } finally {
        loading.value = false; // Desativa o loading
    }
};

/**
 * Função chamada ao selecionar uma linha de DM na tabela.
 * Preenche as informações relacionadas ao DM selecionado e suas controladoras.
 */
const onRowSelect = async (event) => {
    if (!event || !event.data) {
        console.error('Seleção inválida na tabela.'); // Se a seleção for inválida, exibe um erro
        return; // Interrompe a execução caso a seleção seja inválida
    }

    try {
        DM = event.data; // Define o DM selecionado
        visible.value = true; // Torna visível a seção associada ao DM selecionado
        await mapControladoras(DM); // Mapeia as controladoras do DM
        configurarClienteSelecionado(DM); // Configura as informações do cliente
        configurarVisibilidade(); // Configura a visibilidade da interface
    } catch (error) {
        console.error('Erro ao selecionar a DM:', error); // Loga o erro caso a seleção falhe
        loadingControladoras.value = false; // Desativa o loading de controladoras
    }
};

/**
 * Função para configurar as informações do cliente selecionado a partir do DM.
 * Mapeia o cliente para as opções de uso de API.
 */
const configurarClienteSelecionado = (dm) => {
    const client = ListaClientes.value.find((client) => client.value?.id_cliente === dm.ID_Cliente); // Encontra o cliente baseado no ID
    if (client) {
        selectedClient.value = { ...client.value }; // Preenche os dados do cliente selecionado
        usarApi.value = client.value.usar_api ?? false; // Define se a API deve ser utilizada
    } else {
        selectedClient.value = null; // Reseta o cliente selecionado caso não encontre
        usarApi.value = false; // Reseta a utilização da API
    }
};

/**
 * Função para mapear as controladoras do DM.
 * Preenche as informações relacionadas às controladoras e ajusta a contagem inicial de valores.
 */
const mapControladoras = async (dm) => {
    Controladoras.value = dm.Controladoras.map((controladora) => {
        return {
            id: controladora.ID, // ID da controladora
            tipo: controladora.Tipo_Controladora, // Tipo da controladora
            deleted: false, // Flag para verificar se foi deletada (inicialmente falso)
            dados: {
                placa: controladora.Placa, // Placa da controladora (se aplicável)
                dip: controladora.DIP, // DIP da controladora (se aplicável)
                andar: Array.isArray(controladora.Andar) ? controladora.Andar.flatMap((a) => a.split(',').map(Number)) : controladora.Andar ? controladora.Andar.split(',').map(Number) : [], // Andares da controladora
                posicao: Array.isArray(controladora.Posicao) ? controladora.Posicao.flatMap((p) => p.split(',').map(Number)) : controladora.Posicao ? controladora.Posicao.split(',').map(Number) : [], // Posições da controladora
                molas: controladora.Tipo_Controladora === '2018' && Array.isArray(controladora.Mola1) ? controladora.Mola1.flatMap((mola) => mola.split(',').map(Number)) : [], // Molas (apenas para controladoras de tipo '2018')
                motor: '', // Inicializa como vazio (motor1)
                motor2: '' // Inicializa como vazio (motor2)
            }
        };
    });

    ajustarContagemInicial(); // Ajusta a contagem inicial dos valores das controladoras
};

/**
 * Função para preencher as opções de controladoras disponíveis para seleção.
 */
const preencherControladoraOptions = () => {
    controladoraOptions.value = Controladoras.value.map((controladora) => {
        const id = controladora.id || 'N/A'; // Define o ID da controladora (caso não exista, coloca 'N/A')
        let identificador; // Variável para armazenar o identificador

        // Dependendo do tipo da controladora, define qual será o identificador
        if (controladora.tipo === '2018' || controladora.tipo === '2024') {
            identificador = controladora.dados.placa; // Para tipos '2018' e '2024', o identificador é a placa
        } else if (controladora.tipo === '2023' || controladora.tipo === 'Locker') {
            identificador = controladora.dados.dip; // Para tipos '2023' e 'Locker', o identificador é o DIP
        } else {
            identificador = 'Desconhecido'; // Caso para tipos de controladora inesperados
        }
        return {
            label: `ID: ${id}, Tipo: ${controladora.tipo}, Identificador: ${identificador}`, // Formata o label para exibição
            value: controladora.id // O valor será o ID da controladora
        };
    });
};

/**
 * Função para ajustar a contagem inicial dos valores das controladoras com base nas existentes.
 * Determina os próximos valores para placa, dip, etc., considerando os itens já cadastrados.
 */
const ajustarContagemInicial = () => {
    // Filtra as controladoras do tipo '2018' e ajusta o próximo valor para placa
    const placasExistentes2018 = Controladoras.value.filter((controladora) => controladora.tipo === '2018').map((controladora) => controladora.dados.placa);
    if (placasExistentes2018.length > 0) {
        nextValues['2018'].placa = Math.max(...placasExistentes2018) + 1; // Define o próximo valor para placa como o maior existente + 1
    } else {
        nextValues['2018'].placa = 12; // Valor inicial caso não haja nenhuma controladora do tipo '2018'
    }

    // Filtra as controladoras do tipo '2023' e ajusta o próximo valor para DIP
    const dipsExistentes2023 = Controladoras.value.filter((controladora) => controladora.tipo === '2023').map((controladora) => controladora.dados.dip);
    if (dipsExistentes2023.length > 0) {
        nextValues['2023'].dip = Math.max(...dipsExistentes2023) + 1; // Define o próximo valor para DIP
    } else {
        nextValues['2023'].dip = 2; // Valor inicial caso não haja nenhuma controladora do tipo '2023'
    }

    // Filtra as controladoras do tipo '2024' e ajusta o próximo valor para placa
    const placas2024Existentes = Controladoras.value.filter((controladora) => controladora.tipo === '2024').map((controladora) => controladora.dados.placa);
    if (placas2024Existentes.length > 0) {
        nextValues['2024'].placa = Math.max(...placas2024Existentes) + 1; // Define o próximo valor para placa
    } else {
        nextValues['2024'].placa = 101; // Valor inicial caso não haja nenhuma controladora do tipo '2024'
    }
};

/**
 * Função para preencher as opções de controladoras, incluindo molas, dips, andares, posições e motores.
 */
const preencherOpcoesControladoras = () => {
    // Reseta as opções antes de preenchê-las
    molasOptions.value = []; // Limpa as opções de molas
    dipOptions.value = []; // Limpa as opções de dips
    andarOptions.value = []; // Limpa as opções de andares
    posicaoOptions.value = []; // Limpa as opções de posições
    motorOptions.value = []; // Limpa as opções de motores

    // Itera sobre as controladoras e preenche as opções conforme o tipo
    Controladoras.value.forEach((controladora) => {
        if (controladora.tipo === '2018') {
            console.log(controladora); // Log para debug
            molasOptions.value.push(...controladora.dados.molas); // Adiciona as molas da controladora
            placaOptions.value.push(controladora.dados.placa); // Adiciona a placa da controladora do tipo 2018
        } else if (controladora.tipo === '2023') {
            console.log(controladora); // Log para debug
            dipOptions.value.push(controladora.dados.dip); // Adiciona o DIP da controladora do tipo 2023
            andarOptions.value.push(...controladora.dados.andar); // Adiciona os andares da controladora do tipo 2023
            posicaoOptions.value.push(...controladora.dados.posicao); // Adiciona as posições da controladora do tipo 2023
        } else if (controladora.tipo === '2024') {
            motorOptions.value.push(controladora.dados.motor); // Adiciona o motor da controladora do tipo 2024
        }
    });
};

/**
 * Função para configurar a visibilidade e realizar ações de inicialização.
 */
const configurarVisibilidade = () => {
    // Verifica se o usuário não é administrador
    if (!admin()) {
        show.value = true; // Exibe a interface
        fetchItemDM(); // Chama a função para buscar os itens DM
        loadData(); // Carrega os dados iniciais
        preencherOpcoesControladoras(); // Preenche as opções de controladoras
        preencherControladoraOptions(); // Preenche as opções de controladora
        operador.value = true; // Define o operador como true
    } else {
        active.value = 1; // Se for administrador, ativa o modo admin
    }
};

/**
 * Função para adicionar um DM (documento de movimentação).
 * Faz a validação e envia os dados via API.
 */
const adicionarDM = async () => {
    DM.IDcliente = selectedClient.value.id_cliente; // Atribui o ID do cliente ao DM
    DM.ClienteNome = selectedClient.value.nome_cliente; // Atribui o nome do cliente ao DM
    const data = {
        id_usuario: store.userId, // Adiciona o ID do usuário ao DM
        ...DM, // Espalha as propriedades de DM no objeto data
        Controladoras: Controladoras.value // Inclui as controladoras selecionadas
    };
    loading.value = true; // Ativa o loading
    try {
        // Envia os dados via requisição POST para adicionar o DM
        const response = await axios.post('/DM/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação
            }
        });
        dataStore.invalidateDMCache(); // Invalida o cache de DM
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'DM adicionada com sucesso', life: 3000 }); // Exibe mensagem de sucesso
        fetchDMS(); // Atualiza a lista de DMs
        active.value = 0; // Reseta o estado ativo
        resetDMForm(); // Reseta o formulário de DM
    } catch (error) {
        // Se ocorrer um erro, exibe mensagem de erro
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar DM', life: 3000 });
        console.error('Erro ao adicionar DM:', error); // Log do erro
    } finally {
        loading.value = false; // Desativa o loading
    }
};

/**
 * Função para deletar um DM específico.
 * Envia uma requisição para excluir o DM.
 */
const deleteDM = async (item) => {
    let data = {
        id_usuario: store.userId, // Inclui o ID do usuário
        id_cliente: store.userIdCliente, // Inclui o ID do cliente
        ID_DM: item.ID_DM // ID do DM que será deletado
    };
    loading.value = true; // Ativa o loading
    try {
        // Envia a requisição para deletar o DM
        await axios.post('/DM/delete', data);
        dataStore.invalidateDMCache(); // Invalida o cache de DMs
        toast.add({ severity: 'success', summary: 'Successful', detail: 'DM Deletada', life: 3000 }); // Exibe mensagem de sucesso
        await fetchDMS(); // Atualiza a lista de DMs
    } catch (error) {
        // Se o erro for 500 ou 401, exibe uma mensagem de erro
        if (error.response && (error.response.status === 500 || error.response.status === 401)) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar a DM.', life: 3000 });
        }
    } finally {
        loading.value = false; // Desativa o loading
    }
    active.value = 0; // Reseta o estado ativo
};

/**
 * Função para lidar com a seleção de uma linha de produto.
 * Preenche o formulário com os dados do produto selecionado.
 */
const handleRowSelection = async (event) => {
    const edit = event.data; // Recebe os dados da linha selecionada
    console.log(edit); // Log para debug
    isEditMode.value = true; // Define que estamos no modo de edição
    showDialogProduto.value = true; // Exibe o diálogo de produto
    produtoSelecionado.value = {
        id_item: edit.id_item,
        id_produto: edit.id_produto,
        Nome_Produto: edit.Nome_Produto,
        QTD: edit.QTD,
        SKU: edit.SKU,
        Controladora: '',
        Capacidade: edit.Capacidade
    }; // Preenche os dados do produto selecionado

    // Separa a posição do produto em controladora, valor1, valor2, valor3
    const [controladora, valor1, valor2, valor3] = edit.Posicao.split(' / ');
    const controladoraOriginal = Controladoras.value.find((c) => {
        // Verifica se existe uma controladora com os dados correspondentes
        if (c.tipo === controladora) {
            if (controladora === '2018' || controladora === '2024') {
                return c.dados.placa === Number(valor1);
            } else if (controladora === '2023' || controladora === 'Locker') {
                return c.dados.dip === Number(valor1);
            }
        }
        return false;
    });

    // Se encontrar a controladora original, preenche o ID da controladora no produto
    if (controladoraOriginal) {
        produtoSelecionado.value.Controladora = controladoraOriginal.id;
    } else {
        console.warn('Controladora não encontrada para o tipo e identificador fornecidos.'); // Log de aviso
    }

    // Preenche os campos de produto dependendo do tipo da controladora
    if (controladora === '2018') {
        produtoSelecionado.value.Placa = Number(valor1); // Preenche a placa
        produtoSelecionado.value.Motor1 = Number(valor2); // Preenche o motor 1
    } else if (controladora === '2023') {
        produtoSelecionado.value.Dip = Number(valor1); // Preenche o DIP
        produtoSelecionado.value.Andar = Number(valor2); // Preenche o andar
        produtoSelecionado.value.Posicao = Number(valor3); // Preenche a posição
    } else if (controladora === '2024') {
        produtoSelecionado.value.Motor1 = Number(valor1); // Preenche o motor 1
    } else if (controladora === 'Locker') {
        produtoSelecionado.value.Dip = Number(valor1); // Preenche o DIP
        produtoSelecionado.value.Posicao = Number(valor2); // Preenche a posição
    }

    // Aguarda a renderização da próxima "tick" do DOM
    await nextTick();
    handleControladoraChange(); // Chama a função para tratar a mudança de controladora
};

/**
 * Função para cancelar a edição de um produto.
 * Reseta os dados do produto e fecha o diálogo.
 */
const handleCancelar = () => {
    // Reseta os dados do produto selecionado
    produtoSelecionado.value = {
        id_item: '',
        id_produto: '',
        Nome_Produto: '',
        QTD: '',
        SKU: '',
        Controladora: '',
        Capacidade: ''
    };
    showDialogProduto.value = false; // Fecha o diálogo de produto
    isEditMode.value = false; // Desativa o modo de edição
    active.value = 0; // Reseta o estado ativo
};

/**
 * Atualiza as informações de um DM (Documento de Movimentação) existente.
 * - Atualiza o ID do cliente e o nome do cliente, se necessário.
 * - Envia os dados atualizados para o servidor.
 *
 * @returns {Promise<void>}
 */
const atualizarDM = async () => {
    // Verifica se o ID do cliente no DM é diferente do cliente selecionado e atualiza se necessário
    if (DM.IDcliente !== selectedClient.value.id_cliente) {
        DM.IDcliente = selectedClient.value.id_cliente;
    }
    // Verifica se o nome do cliente no DM é diferente do nome do cliente selecionado e atualiza se necessário
    if (DM.ClienteNome !== selectedClient.value.nome_cliente) {
        DM.ClienteNome = selectedClient.value.nome_cliente;
    }
    // Monta o objeto 'data' que será enviado na requisição
    const data = {
        id_usuario: store.userId, // ID do usuário
        ...DM, // Adiciona os dados do DM atualizados
        Controladoras: Controladoras.value.map((controladora) => {
            // Para cada controladora, se o ID não estiver definido, define como null
            if (!controladora.ID) {
                controladora.ID = null;
            }
            return controladora; // Retorna a controladora com o ID ajustado
        })
    };

    dataStore.invalidateDMCache(); // Invalida o cache de DMs

    loading.value = true; // Ativa o estado de carregamento
    try {
        // Envia a requisição POST para atualizar o DM
        const response = await axios.post('/DM/atualizar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação no cabeçalho
            }
        });
        // Exibe mensagem de sucesso ao atualizar o DM
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'DM atualizada com sucesso', life: 3000 });
        fetchDMS(); // Atualiza a lista de DMs
        active.value = 0; // Reseta o estado ativo
        resetDMForm(); // Reseta o formulário do DM
    } catch (error) {
        // Exibe mensagem de erro caso a atualização falhe
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar DM', life: 3000 });
        console.error('Erro ao atualizar DM:', error); // Log do erro para depuração
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função que verifica se o usuário tem o perfil de administrador.
 * @returns {boolean} True se o usuário for administrador, caso contrário, false.
 */
const admin = () => {
    return store.userRole === 'Administrador'; // Verifica se o papel do usuário é 'Administrador'
};

/**
 * Função para formatar a data para o formato 'dd/mm/yyyy hh:mm'.
 * - Caso a data seja inválida, retorna 'Data inválida'.
 *
 * @param {string|number} value - Valor da data a ser formatada.
 * @returns {string} Data formatada no formato 'dd/mm/yyyy hh:mm' ou 'Data inválida' em caso de erro.
 */
const formatDate = (value) => {
    if (!value) {
        return ''; // Retorna uma string vazia caso o valor seja falsy
    }
    try {
        const date = new Date(value); // Cria um objeto Date a partir do valor
        if (isNaN(date)) {
            throw new Error('Data inválida'); // Lança um erro se a data for inválida
        }
        // Ajusta a data para o fuso horário local
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const day = String(localDate.getDate()).padStart(2, '0'); // Formata o dia
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Formata o mês
        const year = localDate.getFullYear(); // Obtém o ano
        const hours = String(localDate.getHours()).padStart(2, '0'); // Formata as horas
        const minutes = String(localDate.getMinutes()).padStart(2, '0'); // Formata os minutos
        return `${day}/${month}/${year} ${hours}:${minutes}`; // Retorna a data formatada
    } catch (error) {
        console.error('Erro ao formatar data:', error); // Log do erro caso a formatação falhe
        return 'Data inválida'; // Retorna mensagem de erro
    }
};

/**
 * Função para listar os produtos de um cliente.
 *
 * @returns {Promise<void>}
 */
const listarProduto = async () => {
    loading.value = true; // Ativa o estado de carregamento
    const data = {
        id_cliente: store.userIdCliente // ID do cliente para buscar os produtos
    };
    try {
        // Envia a requisição POST para listar os produtos
        const response = await axios.post('/produtos/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação
            }
        });
        // Formata a resposta e preenche a lista de produtos
        ListaProdutos.value = response.data.map(({ id_produto, codigo, nome }) => ({
            label: `${codigo} | ${nome}`, // Exibe o código e nome do produto
            value: id_produto // ID do produto
        }));
    } catch (error) {
        // Exibe mensagem de erro caso falhe ao carregar os produtos
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos', life: 3000 });
        console.error('Erro ao carregar produtos:', error); // Log do erro
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função para adicionar um produto a um DM.
 * - Valida os campos antes de enviar os dados.
 * - Envia os dados via API para adicionar o item no DM.
 *
 * @returns {Promise<void>}
 */
const adicionarProduto = async () => {
    // Valida se todos os campos obrigatórios estão preenchidos
    if (!validarCampos()) {
        return; // Se a validação falhar, não continua com o processo
    }

    // Encontra a controladora selecionada
    const selectedControladora = Controladoras.value.find((c) => c.id === produtoSelecionado.value.Controladora);

    const data = {
        id_usuario: store.userId, // ID do usuário
        id_cliente: store.userIdCliente, // ID do cliente
        ...produtoSelecionado.value, // Dados do produto selecionado
        id_dm: DM.ID_DM, // ID do DM
        tipo_controladora: selectedControladora ? selectedControladora.tipo : null // Tipo de controladora, se encontrado
    };
    try {
        loading.value = true; // Ativa o estado de carregamento
        // Envia a requisição POST para adicionar o produto ao DM
        const response = await axios.post('/DM/adicionarItensDM', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Inclui o token de autenticação
            }
        });
        // Exibe mensagem de sucesso após adicionar o produto
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto adicionado com sucesso', life: 3000 });
        showDialogProduto.value = false; // Fecha o diálogo de produto
        resetProdutoSelecionado(); // Reseta os dados do produto selecionado
        fetchItemDM(); // Atualiza a lista de itens no DM
    } catch (error) {
        // Exibe mensagem de erro caso falhe ao adicionar o produto
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao adicionar produto, verifique os campos e tente novamente.', life: 3000 });
        console.error('Erro ao carregar produtos:', error); // Log do erro
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Função de validação dos campos obrigatórios ao adicionar um produto.
 *
 * @returns {boolean} Retorna 'true' se todos os campos obrigatórios estiverem preenchidos, 'false' caso contrário.
 */
const validarCampos = () => {
    try {
        // Verifica se o campo de controladora não está vazio
        if (produtoSelecionado.value.Controladora === '') {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios para adicionar o item.', life: 3000 });
            return false; // Falha na validação
        }
        // Validação específica para controladora tipo 2018
        if (tipoControladoraSelecionada.value === '2018') {
            if (produtoSelecionado.value.id_produto === '' || !produtoSelecionado.value.Controladora || !produtoSelecionado.value.Placa || !produtoSelecionado.value.Motor1) {
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios para a controladora 2018.', life: 3000 });
                return false; // Falha na validação
            }
        }
        // Validação específica para controladora tipo 2023
        else if (tipoControladoraSelecionada.value === '2023') {
            if (produtoSelecionado.value.id_produto === '' || !produtoSelecionado.value.Controladora || !produtoSelecionado.value.Dip || !produtoSelecionado.value.Andar || !produtoSelecionado.value.Posicao) {
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios para a controladora 2023.', life: 3000 });
                return false; // Falha na validação
            }
        }
        return true; // Todos os campos obrigatórios foram preenchidos
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.', life: 3000 });
        return false; // Falha na validação
    }
};

/**
 * Função que observa a alteração do índice ativo.
 * - Se o índice ativo mudar e for igual a 0, reseta o formulário do DM e carrega a lista de DMs.
 */
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetDMForm(); // Reseta o formulário do DM
        fetchDMS(); // Carrega a lista de DMs
        visible.value = false; // Torna a tela invisível
    }
});

/**
 * Função chamada ao montar o componente para carregar os dados necessários.
 * - Carrega dados iniciais, clientes e DMs.
 */
onMounted(async () => {
    await loadData(); // Carrega dados iniciais
    await fetchCliente(); // Carrega a lista de clientes
    await fetchDMS(); // Carrega a lista de DMs
});

/**
 * Carrega os dados iniciais do sistema.
 * - Carrega a lista de produtos.
 *
 * @returns {Promise<void>}
 */
const loadData = async () => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        const produtos = dataStore.produtos || (await dataStore.fetchProdutos()); // Obtém a lista de produtos (do cache ou via API)
        ListaProdutos.value = produtos.map(({ value, codigo, label }) => ({
            label: `${codigo} | ${label}`, // Formata o código e nome do produto
            value: value // ID do produto
        }));

        // Filtra os produtos para remover o 'Todos' da lista
        ListaProdutos.value = produtos.filter((produto) => produto.label !== 'Todos');
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar dados iniciais', life: 3000 });
        console.error('Erro ao carregar dados iniciais:', error); // Log do erro
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Reseta o formulário do DM, limpando todos os campos.
 */
const resetDMForm = () => {
    DM.Ativo = '';
    DM.Chave = '';
    DM.ChaveAPI = '';
    DM.ClienteID = '';
    DM.ClienteNome = '';
    DM.Created = '';
    DM.Enviada = '';
    DM.ID_CR_Usuario = '';
    DM.ID_DM = '';
    DM.IDcliente = '';
    DM.Identificacao = '';
    DM.Integracao = '';
    DM.Numero = '';
    DM.OP_Biometria = '';
    DM.OP_Facial = '';
    DM.OP_Senha = '';
    DM.URL = '';
    DM.Updated = '';
    DM.UserID = '';
    DM.Versao = '';
    DM.Devolucao = '';
    DM.ID_Cliente = null;
    Controladoras.value = [];
    selectedClient.value = { id_cliente: '', nome_cliente: '', usar_api: false };
    nextValues['2018'].placa = 12;
    nextValues['2023'].dip = 2;
    nextValues['Locker'].dip = 2;
    nextValues['2024'].placa = 101;
};

/**
 * Função para voltar à tela anterior.
 */
const voltar = () => {
    show.value = false;
    operador.value = false;
};

/**
 * Reseta os dados do produto selecionado.
 */
const resetProdutoSelecionado = () => {
    produtoSelecionado.value = {
        id_produto: '',
        Porta: '',
        Motor1: '',
        Motor2: '',
        Controladora: '',
        Posicao: '',
        Andar: ''
    };
};

/**
 * Função para buscar a lista de clientes do sistema.
 *
 * @returns {Promise<void>}
 */
const fetchCliente = async () => {
    loading.value = true; // Ativa o estado de carregamento
    try {
        // Envia a requisição para listar os clientes
        const response = await axios.post('/admin/cliente/listar', {});
        // Preenche a lista de clientes
        ListaClientes.value = [
            todosOption,
            ...response.data.map((cliente) => ({
                label: cliente.nome, // Nome do cliente
                value: {
                    id_cliente: cliente.id_cliente, // ID do cliente
                    nome_cliente: cliente.nome, // Nome do cliente
                    usar_api: cliente.usar_api // Indica se o cliente usa API
                },
                usar_api: cliente.usar_api // Atributo para verificar se o cliente usa API
            }))
        ];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes', life: 3000 });
        console.error('Erro ao carregar clientes:', error); // Log do erro
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};

/**
 * Observa a alteração do ID do cliente no DM e atualiza o cliente selecionado.
 */
watch(
    () => DM.ID_Cliente,
    (newClienteId) => {
        // Encontra o cliente na lista de clientes
        const client = ListaClientes.value.find((client) => client.value.id_cliente === newClienteId);
        if (client) {
            selectedClient.value = { ...client.value }; // Atualiza os dados do cliente selecionado
            usarApi.value = client.value.usar_api ?? false; // Define 'usar_api' como false caso seja nulo
        } else {
            usarApi.value = false; // Define 'usar_api' como false se o cliente não for encontrado
        }
    }
);

/**
 * Função para adicionar uma nova controladora ao DM.
 */
const addControladora = () => {
    Controladoras.value.push({
        ID: null, // ID da controladora (nulo inicialmente)
        tipo: '', // Tipo da controladora (inicialmente vazio)
        deleted: false, // Flag para indicar se a controladora foi deletada
        dados: {} // Dados da controladora (inicialmente vazio)
    });
};

/**
 * Atualiza o tipo de controladora na lista.
 * - Verifica se atingiu o limite de controladoras do tipo selecionado.
 * - Se não, atualiza os dados para o tipo de controladora selecionada.
 */
const updateTipoControladora = (index, tipo) => {
    const count = countControladoras(tipo); // Conta as controladoras do tipo selecionado
    const controladora = Controladoras.value[index]; // Obtém a controladora selecionada

    if (count >= maxControladoras[tipo]) {
        // Se atingiu o limite, exibe um aviso e remove a controladora
        toast.add({
            severity: 'warn',
            summary: 'Limite Atingido',
            detail: `Você atingiu o limite máximo de controladoras ${tipo}`,
            life: 3000
        });
        Controladoras.value.splice(index, 1); // Remove a controladora da lista
        return;
    }

    // Atualiza os dados da controladora conforme o tipo selecionado
    if (tipo === '2018') {
        controladora.dados.placa = nextValues['2018'].placa++; // Aumenta o número da placa
        controladora.dados.molas = controladora.dados.molas || []; // Define as molas como um array vazio se não existir
    } else if (tipo === '2023') {
        controladora.dados.dip = nextValues['2023'].dip++; // Aumenta o número de DIP
        controladora.dados.andar = controladora.dados.andar || []; // Define andares como um array vazio se não existir
        controladora.dados.posicao = controladora.dados.posicao || []; // Define posições como um array vazio se não existir
    } else if (tipo === '2024') {
        controladora.dados.placa = nextValues['2024'].placa++; // Aumenta o número da placa
        controladora.dados.motor = controladora.dados.motor || ''; // Define motor como uma string vazia se não existir
    } else if (tipo === 'Locker') {
        controladora.dados.dip = nextValues['Locker'].dip++; // Aumenta o número de DIP
        controladora.dados.posicao = controladora.dados.posicao || []; // Define posições como um array vazio se não existir
    }
};

/**
 * Função que seleciona todos os itens de uma controladora.
 */
const selectAll = (index) => {
    if (Controladoras.value[index].tipo === '2018') {
        Controladoras.value[index].dados.molas = Array.from({ length: 10 }, (_, i) => i + 1); // Seleciona todos os itens para controladora 2018
    }
    if (Controladoras.value[index].tipo === '2023') {
        Controladoras.value[index].dados.andar = Array.from({ length: 6 }, (_, i) => i + 1); // Seleciona todos os andares para controladora 2023
        Controladoras.value[index].dados.posicao = Array.from({ length: 15 }, (_, i) => i + 1); // Seleciona todas as posições para controladora 2023
    }
    if (Controladoras.value[index].tipo === 'Locker') {
        Controladoras.value[index].dados.posicao = Array.from({ length: 14 }, (_, i) => i + 1); // Seleciona todas as posições para controladora Locker
    }
};

/**
 * Função que desmarca todos os itens de uma controladora.
 */
const desselectAll = (index) => {
    if (Controladoras.value[index].tipo === '2018') {
        Controladoras.value[index].dados.molas = Array.from({ length: 10 }, (_, i) => (i = 0)); // Desmarca todas as molas para controladora 2018
    }
    if (Controladoras.value[index].tipo === '2023') {
        Controladoras.value[index].dados.andar = Array.from({ length: 6 }, (_, i) => (i = 0)); // Desmarca todos os andares para controladora 2023
        Controladoras.value[index].dados.posicao = Array.from({ length: 15 }, (_, i) => (i = 0)); // Desmarca todas as posições para controladora 2023
    }
    if (Controladoras.value[index].tipo === 'Locker') {
        Controladoras.value[index].dados.posicao = Array.from({ length: 14 }, (_, i) => (i = 0)); // Desmarca todas as posições para controladora Locker
    }
};

/**
 * Função para remover uma controladora da lista.
 */
const removeControladora = (index) => {
    if (!DM.ID_DM) {
        Controladoras.value.splice(index, 1); // Remove a controladora se não houver DM associado
    } else {
        Controladoras.value[index].deleted = true; // Marca a controladora como deletada se houver DM associado
    }
};
</script>
<template>
    <!-- Container principal que usa uma grid -->
    <div class="grid">
        <!-- Primeira coluna com 12 colunas de largura -->
        <div class="col-12">
            <!-- Card principal que agrupa os componentes -->
            <div class="card">
                <!-- Título da seção -->
                <h4 class="my-6 ml-2">Dispenser Machines</h4>
                <!-- Componente TabView, com o v-model para controlar o índice ativo das abas -->
                <TabView v-model:activeIndex="active" v-if="!show">
                    <!-- Aba de Listagem -->
                    <TabPanel header="Listar Dispenser Machines">
                        <div class="col-12">
                            <!-- Componente DataTable para exibir uma tabela com dados -->
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaDMS"
                                stripedRows
                                removableSort
                                paginator
                                :rows="10"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['Numero', 'Identificacao', 'ClienteNome', 'local', 'Updated']"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="onRowSelect"
                                :sortOrder="1"
                                :sortField="'Identificacao'"
                            >
                                <!-- Cabeçalho da tabela -->
                                <template #header>
                                    <div class="flex justify-content-between align-items-center">
                                        <div class="flex justify-content-start">
                                            <span>Total de registros: {{ ListaDMS.length }}</span>
                                            <!-- Exibe o total de registros -->
                                        </div>
                                        <div>
                                            <!-- Campo de busca global -->
                                            <IconField iconPosition="left">
                                                <InputIcon>
                                                    <i class="pi pi-search" />
                                                </InputIcon>
                                                <InputText v-model="filters['global'].value" placeholder="Busca" />
                                            </IconField>
                                        </div>
                                    </div>
                                </template>
                                <!-- Caso a tabela esteja vazia -->
                                <template #empty> Nenhuma DM adicionada. </template>

                                <!-- Definição das colunas da tabela -->
                                <Column field="Identificacao" sortable header="Identificação"></Column>
                                <Column field="Numero" sortable header="Número"></Column>
                                <Column field="ClienteNome" sortable header="Cliente"></Column>
                                <Column field="local" sortable header="Localização"></Column>

                                <!-- Coluna de status de Ativo com ícones -->
                                <Column field="Ativo" sortable style="width: 9%; text-align: center" header="Ativo">
                                    <template #body="{ data }">
                                        <!-- Exibe o ícone correspondente ao status de Ativo -->
                                        <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.Ativo, 'pi-times-circle text-red-500': !data.Ativo }"></i>
                                    </template>
                                </Column>

                                <!-- Coluna com a data de atualização -->
                                <Column field="Updated" style="width: 15%" sortable header="Atualizado">
                                    <template #body="{ data }">
                                        {{ formatDate(new Date(data.Updated)) }}
                                        <!-- Formata e exibe a data -->
                                    </template>
                                </Column>

                                <!-- Coluna para excluir a DM -->
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteDM(slotProps.data)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <!-- Aba de Editar ou Adicionar Dispenser Machines -->
                    <TabPanel :header="visible ? 'Editar Dispenser Machines' : 'Adicionar Dispenser Machines'" v-if="admin()">
                        <div class="mt-5 mx-0 p-fluid grid">
                            <!-- Dropdown para selecionar o cliente -->
                            <div class="full lg:col-12 md:col-12 sm:col-12">
                                <label for="name">Cliente:</label>
                                <Dropdown class="my-2" v-model="selectedClient" :options="ListaClientes" optionLabel="label" optionValue="value" placeholder="Selecione um" />
                            </div>

                            <!-- Input para a identificação da DM -->
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Identificação da DM:</label>
                                <InputText class="my-2" v-model="DM.Identificacao" id="email" />
                            </div>

                            <!-- Input para o número da DM -->
                            <div class="full lg:col-6 md:col-9 sm:col-12">
                                <label for="email">Numero da DM:</label>
                                <InputText class="my-2" v-model="DM.Numero" id="email" />
                            </div>

                            <!-- Switch para controlar se a DM está ativa -->
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch2">DM ativa?</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Ativo" inputId="switch2" />
                                    <span class="ml-2">{{ DM.Ativo ? 'Sim' : 'Não' }}</span>
                                    <!-- Exibe "Sim" ou "Não" conforme o status da DM -->
                                </div>
                            </div>

                            <!-- Switch para controlar se a DM aceita devolução -->
                            <div class="full flex flex-column align-items-center xl:col-6 lg:col-6 md:col-6 sm:col-12">
                                <label class="mt-0 text-nowrap" for="switch3">DM aceita devolução?</label>
                                <div class="grid mt-3">
                                    <InputSwitch class="mr-2" v-model="DM.Devolucao" inputId="switch3" />
                                    <span class="ml-2">{{ DM.Devolucao ? 'Sim' : 'Não' }}</span>
                                    <!-- Exibe "Sim" ou "Não" conforme o status de devolução -->
                                </div>
                            </div>
                        </div>

                        <!-- Painel para adicionar opções da DM -->
                        <panel header="Opções de DM" class="mt-4">
                            <div class="mt-5 mx-0 p-fluid grid">
                                <label for="fim"></label>
                                <div id="fim" class="checkbox-container flex align-content-end flex-wrap">
                                    <!-- Lista de opções de DM (checkboxes) -->
                                    <div class="checkbox-items m-2 flex align-items-end">
                                        <Checkbox v-model="DM.voucher" inputId="Voucher" value="Voucher" :binary="true" />
                                        <label for="Voucher" class="ml-2"> Voucher </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.cracha" inputId="cracha" value="cracha" :binary="true" />
                                        <label for="cracha" class="ml-2"> Crachá </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Biometria" inputId="Biometria" value="Biometria" :binary="true" />
                                        <label for="Biometria" class="ml-2"> Biometria </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Facial" inputId="Facial" value="Facial" :binary="true" />
                                        <label for="Facial" class="ml-2"> Rec. Facial </label>
                                    </div>
                                    <div class="checkbox-items m-2 flex align-items-center">
                                        <Checkbox v-model="DM.OP_Senha" inputId="Senha" value="Senha" :binary="true" />
                                        <label for="Senha" class="ml-2"> Senha </label>
                                    </div>
                                </div>
                            </div>
                            <!-- Botão para adicionar uma controladora -->
                            <Button class="mt-7" icon="pi pi-plus" label="Adicionar Controladora" @click="addControladora" />
                        </panel>

                        <!-- Se o cliente usar API, exibe campos adicionais -->
                        <div v-if="selectedClient.usar_api" class="mt-5 mx-auto p-fluid grid">
                            <div class="full flex align-items-start xl:col-12 lg:col-12 md:col-6 sm:col-12">
                                <label class="mt-3 ml-4" for="switch3">Usa Mob?</label>
                                <InputSwitch class="grid mt-3 ml-3" v-model="DM.Integracao" inputId="switch3" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">UserID API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.UserID" />
                            </div>
                            <div class="full mt-4 lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">Senha API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.ChaveAPI" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">IdCliente API:</label>
                                <InputText class="my-2" id="senha" v-model="DM.ClienteID" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-12">
                                <label for="senha">URL:</label>
                                <InputText class="my-2" id="senha" v-model="DM.URL" />
                            </div>
                            <div class="full lg:col-6 md:col-12 sm:col-6">
                                <label for="codigo">Senha Chave:</label>
                                <Textarea v-model="DM.Chave" class="my-2 overflow-hidden" style="min-height: 50px; min-width: 450px" inputClass="w-full" rows="2" cols="30" />
                            </div>
                        </div>

                        <!-- Iteração pelas controladoras associadas à DM -->
                        <div>
                            <div v-for="(controladora, index) in Controladoras" :key="index" class="mt-5 card" v-show="!DM.ID_DM || !controladora?.deleted">
                                <div class="flex justify-content-between flex-wrap">
                                    <h5>Controladora {{ index + 1 }}</h5>

                                    <!-- Botão para remover a controladora -->
                                    <Button icon="pi pi-trash" label="Remover" class="p-button-danger" @click="removeControladora(index)" />
                                </div>

                                <!-- Campo para selecionar o modelo da controladora -->
                                <div class="field mt-3 col-12">
                                    <label class="mr-3">Modelo: </label>
                                    <Dropdown class="" style="width: 250px" v-model="controladora.tipo" :options="tipoControladoras" placeholder="Selecione o tipo de controladora" @change="updateTipoControladora(index, controladora.tipo)" />
                                </div>

                                <!-- Exibição dos campos específicos para cada tipo de controladora -->
                                <!-- Controladora 2018 -->
                                <div v-if="controladora.tipo === '2018'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Placa: </label>
                                        <InputText class="" style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>

                                    <!-- Seção de molas -->
                                    <fieldset class="field card mt-4">
                                        <legend>Molas</legend>

                                        <div class="checkbox-group mt-3" style="text-align: center">
                                            <div v-for="i in 10" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.molas" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <!-- Botões para selecionar ou desmarcar todas as molas -->
                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
                                        </div>
                                    </fieldset>
                                </div>

                                <!-- Controladora 2023 -->
                                <div v-if="controladora.tipo === '2023'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">DIP: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="card mt-5">
                                        <div class="field mt-3">
                                            <h4>Andar:</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 6" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.andar" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="field mt-6">
                                            <h4>Posição</h4>
                                            <div class="checkbox-group">
                                                <div v-for="i in 15" :key="i" class="checkbox-item mt-3">
                                                    <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                    <label>{{ i }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Botões para selecionar ou desmarcar todos os andares e posições -->
                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Controladora 2024 -->
                                <div v-if="controladora.tipo === '2024'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Placa: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.placa" />
                                    </div>
                                    <div class="field col-12 mt-3">
                                        <label class="mr-5 p-0">Motor: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.motor" />
                                    </div>
                                </div>

                                <!-- Controladora Locker -->
                                <div v-if="controladora.tipo === 'Locker'">
                                    <div class="field col-12 mt-3">
                                        <label class="mr-6 p-0">Dip: </label>
                                        <InputText style="width: 250px" v-model="controladora.dados.dip" />
                                    </div>
                                    <div class="field card">
                                        <h4>Posição</h4>
                                        <div class="checkbox-group">
                                            <div v-for="i in 14" :key="i" class="checkbox-item mt-3">
                                                <Checkbox v-model="controladora.dados.posicao" :value="i" />
                                                <label>{{ i }}</label>
                                            </div>
                                        </div>

                                        <!-- Botões para selecionar ou desmarcar todas as posições -->
                                        <div class="button-group mt-5" style="text-align: end">
                                            <Button class="mr-3" style="width: 200px" label="Selecionar Todos" @click="selectAll(index)" />
                                            <Button style="width: 200px" label="Desselecionar Todos" @click="desselectAll(index)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Botões de salvar dependendo do estado de visibilidade -->
                        <div class="mt-5 mx-0 p-fluid grid">
                            <Button v-if="!visible" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarDM" class="full mt-4 mr-2" />
                            <Button v-if="visible" label="Salvar" icon="pi pi-check" severity="info" @click="atualizarDM" class="full mt-4 mr-2" />
                        </div>
                    </TabPanel>
                </TabView>

                <!-- Cartão de operador -->
                <div class="card" v-if="operador">
                    <div class="mx-0 grid">
                        <div class="col-12">
                            <div class="flex mt-5 justify-content-between">
                                <h5>Itens da DM</h5>
                                <Button label="Adicionar Itens" @click="showDialogProduto = true" />
                                <!-- Botão para adicionar itens -->
                            </div>
                            <!-- Tabela para exibição dos itens -->
                            <DataTable
                                v-model:filters="filters"
                                :value="ListaItens"
                                rowGroupMode="subheader"
                                groupRowsBy="modelo"
                                selectionMode="single"
                                tableStyle="min-width: 50rem; table-layout: fixed;"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                :globalFilterFields="['SKU', 'Nome_Produto', 'Posicao', 'QTD']"
                                stripedRows
                                removableSort
                                dataKey="id"
                                :metaKeySelection="false"
                                @rowSelect="handleRowSelection"
                                paginator
                                :rows="10"
                                :sortOrder="1"
                                :sortField="'Posicao'"
                            >
                                <!-- Cabeçalho da Tabela -->
                                <template #header>
                                    <div class="flex justify-content-between mt-4">
                                        <div class="font-semibold">
                                            <span>Total de itens carregados: {{ ListaItens.length }}</span>
                                        </div>
                                        <!-- Campo de busca -->
                                        <IconField iconPosition="left">
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Busca" />
                                        </IconField>
                                    </div>
                                </template>

                                <!-- Se a tabela estiver vazia -->
                                <template #empty> Nenhum item encontrado. </template>

                                <!-- Definição das colunas da tabela -->
                                <Column field="SKU" style="width: 9%" sortable header="SKU"></Column>
                                <Column field="Nome_Produto" sortable style="width: 30%" header="Produto"></Column>
                                <Column field="Posicao" sortable style="width: 40%" header="Posição">
                                    <template #body="{ data }">
                                        <span v-tooltip="data.modelo === '2018' ? 'Controladora / Placa / Motor 1 / Motor 2' : data.modelo === '2023' ? 'Controladora / DIP / Andar / Posição' : 'Placa / Motor'">
                                            {{ data.Posicao }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="QTD" sortable style="width: 9%" header="QTD"></Column>

                                <!-- Coluna de Ação com Botão para Deletar -->
                                <Column style="min-width: 8rem">
                                    <template #body="slotProps">
                                        <!-- Botão para remover o item -->
                                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteItem(slotProps.data)" />
                                    </template>
                                </Column>
                                <!-- Cabeçalho de Agrupamento -->
                                <template #groupheader="slotProps">
                                    <div class="flex align-items-center text-3xl gap-2">
                                        <span v-tooltip="'Modelo da controladora'">
                                            {{ slotProps.data.modelo }}
                                        </span>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <!-- Botão de Voltar -->
                    <Button class="m-1" label="Voltar" @click="voltar()" />
                </div>
                <LoadingSpinner v-if="loading" />
            </div>
        </div>
    </div>
    <!-- Dialog para Adicionar/Editar Produto -->
    <Dialog class="" :header="isEditMode ? 'Editar Produto' : 'Adicionar Produto'" :visible.sync="showDialogProduto" :modal="true" :closable="false">
        <div class="box card">
            <div class="grid">
                <!-- Seção de Produto -->
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Produto" class="font-semibold">Produto:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown
                        v-model="produtoSelecionado.id_produto"
                        class="w-full"
                        removableSort
                        :options="ListaProdutos"
                        :virtualScrollerOptions="{ itemSize: 30 }"
                        :filter="true"
                        :filterBy="'label'"
                        v-model:filters="filters"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione um produto"
                    />
                </div>
                <!-- Seção de Controladora -->
                <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                    <label for="Controladora" class="font-semibold">Controladora:</label>
                </div>
                <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                    <Dropdown v-model="produtoSelecionado.Controladora" class="w-full" optionLabel="label" optionValue="value" :options="controladoraOptions" @change="handleControladoraChange" placeholder="Selecione uma controladora" />
                </div>

                <!-- Exibição dos campos específicos para cada tipo de controladora -->
                <!-- Controladora tipo 2018 -->
                <template v-if="tipoControladoraSelecionada === '2018'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">Placa:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Placa" class="w-full" :options="placaOptions" optionLabel="label" optionValue="value" placeholder="Selecione a Placa" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="molas" class="font-semibold">Molas:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="molasOptions" optionLabel="label" optionValue="value" placeholder="Selecione as Molas" />
                    </div>
                </template>

                <!-- Controladora tipo 2023 -->
                <template v-if="tipoControladoraSelecionada === '2023'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">DIP:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" placeholder="Selecione DIP" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Andar" class="font-semibold">Andar:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Andar" class="w-full" :options="andarOptions" optionLabel="label" optionValue="value" placeholder="Selecione o andar" @change="handleAndarChange" />
                    </div>

                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" placeholder="Selecione a posição" @change="validarAndarSelecionado" />
                    </div>
                </template>

                <!-- Controladora tipo 2024 -->
                <template v-if="tipoControladoraSelecionada === '2024'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Motor" class="font-semibold">Motor:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Motor1" class="w-full" :options="motorOptions" optionLabel="label" optionValue="value" placeholder="Selecione o Motor" />
                    </div>
                </template>

                <!-- Controladora tipo Locker -->
                <template v-if="tipoControladoraSelecionada === 'Locker'">
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Dip" class="font-semibold">DIP:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Dip" class="w-full" :options="dipOptions" optionLabel="label" optionValue="value" placeholder="Selecione DIP" />
                    </div>
                    <div class="lg:col-4 md:col-4 sm:col-4 flex align-items-center">
                        <label for="Posicao" class="font-semibold">Posição:</label>
                    </div>
                    <div class="lg:col-8 md:col-8 sm:col-8 flex justify-content-end">
                        <Dropdown v-model="produtoSelecionado.Posicao" class="w-full" :options="posicaoOptions" optionLabel="label" optionValue="value" placeholder="Selecione a posição" />
                    </div>
                </template>

                <!-- Campo para a Capacidade do Produto -->
                <div v-if="tipoControladoraSelecionada" class="lg:col-4 md:col-4 sm:col-4 flex align-items-center ">
                    <label for="Capacidade" class="font-semibold">Capacidade:</label>
                </div>
                <div v-if="tipoControladoraSelecionada" class="lg:col-8 md:col-8 sm:col-8 justify-content-end flex">
                    <InputNumber inputId="Capacidade" class="w-full" v-model="produtoSelecionado.Capacidade" aria-describedby="username-help" suffix=" unidades"/>
                </div>
            </div>
        </div>

        <!-- Botões para Cancelar e Salvar/Atualizar Produto -->
        <div class="flex justify-content-end gap-2 mt-4">
            <Button type="button" label="Cancelar" severity="secondary" @click="handleCancelar()"></Button>
            <Button type="button" :label="isEditMode ? 'Atualizar' : 'Salvar'" @click="isEditMode ? atualizarProduto() : adicionarProduto()"></Button>
        </div>
    </Dialog>

    <!-- Dialog para Confirmar Deleção de Item -->
    <Dialog header="Deletar Item" :visible.sync="showDialogDItem" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="cancelDelete" />
            <Button label="OK" icon="pi pi-check" @click="confirmDelete" />
        </template>
    </Dialog>

    <!-- Dialog de Confirmação de Deleção de DM -->
    <Dialog header="Deletar DM" :visible.sync="showDialogDVM" style="width: 30vw" :modal="true" :closable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>

<style scoped>
@media (max-width: 768px) {
    .full {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        width: 100%;
        margin: 1px;
    }

    .box {
        width: 50vw;
    }
}

@media (min-width: 769px) {
    .box {
        width: 40vw;
    }
}

@media (min-width: 900px) {
    .box {
        width: 30vw;
    }

    .card {
        overflow: hidden;
        /* Garantir que o conteúdo não ultrapasse os limites */
        box-sizing: border-box;
        /* Inclui o padding e border no cálculo de largura e altura */
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
}
</style>
