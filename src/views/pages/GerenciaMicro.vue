<template>
    <div class="card">
        <h5 class="mt-6 ml-2 text-2xl">{{ t('cadastro_de_servicos') }}</h5>
        <div v-if="isAdmin" class="flex justify-content-start cliente-selection">

            <Dropdown class="mt-4 ml-3" style="width: 300px" v-model="selectedClient" :options="availableClients" :placeholder="$t('select_client')" optionLabel="name" @change="onClientSelected" />
        </div>

        <div v-if="selectedClient?.id" class="mt-6 card services-edit">
            <div class="flex mt-2 justify-content-between align-items-center">
                <h5 class="mt-1 no-break">
                    {{ t('assigned_services') }}:
                    <span v-if="isAdmin">{{ selectedClient.name }}</span>
                </h5>
                <div class="add-service flex align-items-center">
                    <Dropdown v-model="newService" class="" :options="availableServices" optionLabel="name" :placeholder="$t('add_service')" />
                    <Button class="ml-3" :label="t('insert')" @click="addService" />
                </div>
            </div>

            <DataTable class="mt-6" :value="clientServices" stripedRows showGridlines :tableStyle="{ width: '100%' }">
                <template #empty>{{ t('no_added_services') }}</template>
                <Column field="name" style="width: 80%" :header="t('service')"></Column>
                <Column :header="t('action')">
                    <template #body="slotProps">
                        <Button :label="$t('setting')" class="mr-2 configuracao-monitoramento w-full" icon="pi pi-cog" @click="editService(slotProps.data)" />
                        <Button :label="$t('remove')" class="p-button-danger w-full" icon="pi pi-trash" @click="openDeleteDialog(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <!-- Caixa de diálogo para confirmação de deleção -->
            <Dialog :header="t('delete_service')" v-model:visible="deleteServiceDialog" style="width: 400px" :modal="true" :closable="true" :draggable="false">
                <div class="confirmation-content text-justify">
                    <i class="" style="font-size: 2rem"></i>
                    <span>
                        {{ $t('delete_service_confirm', { name: selectedService?.name }) }}
                    </span>
                </div>
                <template #footer>
                    <Button :label="t('no')" icon="pi pi-times" @click="deleteServiceDialog = false" class="p-button-text" />
                    <Button :label="t('yes')" icon="pi pi-check" @click="removeService(selectedService)" class="p-button-danger" />
                </template>
            </Dialog>

            <Fieldset :legend="t('settings')" v-if="showConfig" class="configuracao-monitoramento card mt-8 p-8 mx-8">
                <!---->
                <h4 class="text-xl mt-1 justify-content-center flex">{{ selectedService.name }}</h4>

                <div class="flex flex-column col-12 mt-4 ml-3">
                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="notificationFrequency">{{ t('notification_frequency') }}:</label>
                        <Dropdown style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationFrequency" :options="frequencies" optionLabel="label" optionValue="value" />
                    </div>

                    <div v-if="serviceConfigs[selectedService.id].notificationFrequency === '1x-dia'" class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="time">{{ t('notification_time') }}:</label>
                        <VueDatePicker style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationTime" time-picker :placeholder="$t('frequency_placeholder')" />
                    </div>

                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="notificationMethods">{{ t('notification_method') }}:</label>
                        <MultiSelect style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationMethods" :options="notificationMethods" optionLabel="label" optionValue="value" display="chip" />
                    </div>

                    <div class="field grid justify-content-center" v-if="serviceConfigs[selectedService.id].notificationMethods.includes('notif')">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="recipients">{{ t('recipient') + ' web' }}:</label>
                        <MultiSelect style="width: 300px" v-model="serviceConfigs[selectedService.id].recipientsweb" :options="availableRecipientsWeb" optionLabel="name" optionValue="id" display="chip" />
                    </div>
                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="recipients">{{ t('recipient') }}:</label>
                        <MultiSelect style="width: 300px" v-model="serviceConfigs[selectedService.id].recipients" :options="availableRecipients" optionLabel="name" optionValue="id" display="chip" />
                    </div>
                    <div class="flex justify-content-end flex-wrap mt-7">
                        <Button class="flex align-items-center justify-content-center" v-if="novo" :label="$t('add_service')" @click="addServiceWithConfig" />

                        <Button class="flex align-items-center justify-content-center" v-else :label="$t('update_services')" @click="updateServiceConfig" />
                    </div>
                </div>
            </Fieldset>
        </div>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>

// Importa funções reativas do Vue, como `ref` e `onMounted`.
import { ref, onMounted, nextTick, computed } from 'vue'; // Utilizado para criar variáveis reativas e realizar ações ao montar o componente.

// Importa a função de toast do PrimeVue, usada para exibir mensagens ao usuário.
import { useToast } from 'primevue/usetoast'; // Utilizado para exibir mensagens de sucesso, erro ou aviso ao usuário.

// Importa o componente de data picker para seleção de datas.
import VueDatePicker from '@vuepic/vue-datepicker'; // Utilizado para seleção de datas (não está sendo usado diretamente no código fornecido).
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS do componente de date picker.

// Importa a store de autenticação, que contém informações sobre o usuário e cliente.
import { useAuthStore } from '@/store/authStore.js'; // Permite acessar o store para obter o ID do usuário e do cliente.

// Importa o serviço 'clientesService' para interagir com a API ou lógica relacionada aos clientes
import clientesService from '@/services/clientesService';  

// Importa o serviço 'funcionarioService' para interagir com a API ou lógica relacionada aos funcionários
import funcionarioService from '@/services/funcionarioService';  

// Importa o componente 'LoadingSpinner', que provavelmente é usado para mostrar um indicador de carregamento na interface
import LoadingSpinner from '@/components/LoadingSpinner.vue';  


// Importa a instância do Axios configurada para realizar requisições HTTP.
import axios from '@/axios'; // Responsável por realizar as requisições HTTP para o backend.
import { useI18n } from 'vue-i18n';
import usuarioService from '../../Services/usuarioService';
const { t } = useI18n();
/**
 * Função chamada quando o usuário tenta abrir o diálogo de remoção de serviço.
 * @param {Object} service - O serviço a ser removido.
 */
const openDeleteDialog = (service) => {
    // Verifica se o serviço foi passado corretamente e se contém um 'id'.
    if (!service || !service.id) {
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('title_error'), // Título da notificação.
            detail: t('erro_service'), // Mensagem de erro detalhada.
            life: 3000 // Tempo de duração da notificação (3000ms).
        });
        return; // Retorna caso o serviço não seja encontrado.
    }

    selectedService.value = { ...service }; // Copia o serviço selecionado para a variável reativa `selectedService`.
    deleteServiceDialog.value = true; // Abre o diálogo de confirmação para deletar o serviço.
};

// Criação de variáveis reativas com `ref()` para armazenar o estado do componente.
const store = useAuthStore(); // Obtém o store de autenticação para acessar o usuário e cliente autenticados.
const isAdmin = ref(false); // Variável booleana para verificar se o usuário é administrador.
const loading = ref(false);
const deleteServiceDialog = ref(false); // Variável booleana para controlar a exibição do diálogo de remoção do serviço.

const toast = useToast(); // Instância do sistema de notificações do PrimeVue.
const availableClients = ref([]); // Lista de clientes disponíveis.
const availableServices = computed(() => [
    // Lista de serviços disponíveis, pré-definida.
    { id: 1, name: t('status_monitoring_dm') },
    { id: 2, name: t('supply_monitoring') }
]);
const selectedClient = ref(null); // Cliente selecionado.
const availableRecipients = ref([]); // Destinatários disponíveis.
const availableRecipientsWeb = ref([]); // Destinatários disponíveis. para notificação web
const clientServices = ref([]); // Serviços associados ao cliente.
const newService = ref(null); // Novo serviço a ser adicionado.
const selectedService = ref(null); // Serviço atualmente selecionado.
const serviceConfigs = ref({}); // Configurações dos serviços selecionados.
const novo = ref(true); // Flag para indicar se o serviço é novo.
const frequencies = computed(() => [
    // Frequências de notificação disponíveis.
    { label: t('every_5m'), value: '5m' },
    { label: t('every_30m'), value: '30m' },
    { label: t('every_1h'), value: '1h' },
    { label: t('once_a_day'), value: '1x-dia' }
]);

const notificationMethods = computed(() => [
    // Métodos de notificação disponíveis.
    { label: t('email'), value: 'email' },
    { label: t('notification'), value: 'notif' }
]);

const showConfig = ref(false); // Flag para mostrar as configurações do serviço.

const fetchIfAdmin = async () => {
    /**
     * Função que verifica se o usuário é administrador e carrega os dados de acordo.
     * Caso o usuário seja administrador, carrega a lista de clientes.
     * Caso contrário, carrega os serviços do cliente.
     */
    if (store.userRole === 'Administrador') {
        isAdmin.value = true; // Marca como administrador se o papel for "Administrador".
        await fetchClientes(); // Carrega os clientes disponíveis.
    } else {
        await fetchServicos(); // Carrega os serviços do cliente caso não seja administrador.
    }
};

/**
 * Função que busca a lista de clientes no servidor.
 */
const fetchClientes = async () => {
    try {
        loading.value = true; // Ativa o estado de carregamento para exibir o spinner.
        // Realiza uma requisição GET para listar os clientes e seus serviços.
        const response = await clientesService.listarClienteServicos();
        // Mapeia a resposta para extrair os clientes e seus serviços.
        availableClients.value = response.map((cliente) => ({
            id: cliente.id_cliente, // ID do cliente.
            name: cliente.nome, // Nome do cliente.
            servicos: cliente.servicos // Lista de serviços do cliente.
        }));
    } catch (error) {
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('title_error'), // Título da notificação.
            detail: t('load_client_list'), // Mensagem de erro detalhada.
            life: 3000 // Tempo de duração da notificação (3000ms).
        });
        console.error('Erro ao carregar clientes:', error); // Loga qualquer erro ocorrido.
    } finally {
        loading.value = false; // Desativa o estado de carregamento após a requisição.
    }
};

/**
 * Função que busca os serviços de um cliente no servidor.
 */
const fetchServicos = async () => {
    loading.value = true; // Ativa o estado de carregamento para exibir o spinner.
    try {
        // Prepara os dados para buscar os serviços do cliente específico.
        const data = {
            id_cliente: store.userIdCliente // Obtém o ID do cliente do store de autenticação.
        };

        // Realiza uma requisição POST para buscar os serviços do cliente.
        const response = await clientesService.listarServicos(data);

        // Verifica se a resposta foi bem-sucedida (status 200-299).
        if (response.status >= 200 && response.status < 300) {
            const cliente = response.data[0] || {}; // Obtém o primeiro cliente, se existir.

            // Atribui valores ao cliente e seus serviços de forma segura.
            selectedClient.value = {
                id: cliente.id_cliente || store.userIdCliente, // ID do cliente.
                name: cliente.nome || '', // Nome do cliente.
                servicos: cliente.servicos || [] // Lista de serviços ou um array vazio.
            };

            // Mapeia os serviços do cliente.
            clientServices.value = Array.isArray(cliente.servicos)
                ? cliente.servicos.map((servico) => {
                      // Procura no availableServices o serviço cujo id corresponda ao id_servico do serviço do cliente
                      const available = availableServices.value.find((s) => s.id === servico.id_servico);
                      return {
                          id: servico.id_servico,
                          // Se encontrado, utiliza o nome do availableServices; caso contrário, usa o nome do serviço do cliente
                          name: available ? available.name : servico.nome
                      };
                  })
                : [];

            // Chama a função para buscar os destinatários, se o cliente tiver um ID.
            const recipientId = cliente.id_cliente || store.userIdCliente;
            if (recipientId) {
                await fetchRecipients(recipientId); // Busca os destinatários para o cliente.
                await fetchRecipientsWeb(recipientId); //Busca destinatarios para noticação web
            }

            // Se o cliente tiver serviços, processa as configurações de cada um.
            if (selectedClient.value.servicos && selectedClient.value.servicos.length > 0) {
                selectedClient.value.servicos.forEach((servico) => {
                    serviceConfigs.value[servico.id_servico] = {
                        notificationFrequency: servico.notificacoes[0]?.frequencia || null,
                        notificationMethods: servico.notificacoes
                            .map((n) => {
                                const method = notificationMethods.value.find((m) => m.value === n.tipo_notificacao);
                                return method ? method.value : null;
                            })
                            .filter(Boolean),
                        recipients: servico.notificacoes.filter((n) => n.tipo_notificacao !== 'notif').map((n) => n.id_funcionario_responsavel),
                        recipientsweb: servico.notificacoes.filter((n) => n.tipo_notificacao === 'notif').map((n) => n.id_funcionario_responsavel),
                        notificationTime: servico.notificacoes[0]?.hora_notificacao || null,
                        monitoringTime: servico.monitoringTime || null
                    };
                });
                novo.value = false; // Marca como não novo após carregar os dados.
            } else {
                clientServices.value = []; // Limpa os serviços se não houver nenhum.
            }
        } else {
            console.log('Nenhum dado encontrado para o cliente'); // Loga se não encontrar dados para o cliente.
            selectedClient.value = { id: store.userIdCliente }; // Limpa o cliente selecionado.
            clientServices.value = []; // Limpa os serviços.
        }
    } catch (error) {
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('title_error'), // Título da notificação.
            detail: t('erro_fetch_service'), // Mensagem de erro detalhada.
            life: 3000 // Tempo de duração da notificação (3000ms).
        });
        console.error('Erro ao carregar clientes:', error); // Loga qualquer erro ocorrido.
    } finally {
        loading.value = false; // Desativa o estado de carregamento após a requisição.
    }
};

/**
 * Função que busca a lista de destinatários (funcionários) para o cliente selecionado.
 * @param {number} idCliente - ID do cliente.
 */
const fetchRecipients = async (idCliente) => {
    try {
        // Realiza uma requisição POST para listar os funcionários responsáveis.
        // const response = await axios.post('/funcionarios/listar', { id_cliente: idCliente });
        let data = { id_cliente: idCliente };
        const response = await funcionarioService.listarFuncionariosSimples(data);
        // Mapeia a resposta para extrair os funcionários.
        availableRecipients.value = response.data.map((funcionario) => ({
            id: funcionario.id_funcionario, // ID do funcionário.
            name: funcionario.nome // Nome do funcionário.
        }));
    } catch (error) {
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('title_error'), // Título da notificação.
            detail: t('erro_fetch_recipeient'), // Mensagem de erro detalhada.
            life: 3000 // Tempo de duração da notificação (3000ms).
        });
        console.error('Erro ao carregar destinatários:', error); // Loga qualquer erro ocorrido.
    }
};
const fetchRecipientsWeb = async (idCliente) => {
    try {
        // Realiza uma requisição POST para listar os funcionários responsáveis.
        // const response = await axios.post('/funcionarios/listar', { id_cliente: idCliente });
        let data = { id_cliente: idCliente };
        const response = await usuarioService.listarUsuariosSimples(data);
        // Mapeia a resposta para extrair os funcionários.
        availableRecipientsWeb.value = response.data.map((usuario) => ({
            id: usuario.id_usuario, // ID do usuario.
            name: usuario.nome, // Nome do usuario.
            email: usuario.email //email do mesmo
        }));
    } catch (error) {
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('title_error'), // Título da notificação.
            detail: t('erro_fetch_recipeient'), // Mensagem de erro detalhada.
            life: 3000 // Tempo de duração da notificação (3000ms).
        });
        console.error('Erro ao carregar destinatários:', error); // Loga qualquer erro ocorrido.
    }
};
/**
 * Função chamada quando um cliente é selecionado.
 * Realiza a atualização da lista de serviços e busca os destinatários.
 */
const onClientSelected = async () => {
    // Atualiza a lista de serviços do cliente selecionado.
    clientServices.value = selectedClient.value.servicos.map((servico) => {
        // Procura, em availableServices, o serviço cujo id seja igual ao id do serviço do cliente.
        const available = availableServices.value.find((s) => s.id === servico.id_servico);
        return {
            id: servico.id_servico,
            name: available ? available.name : servico.nome
        };
    });

    // Busca os destinatários para o cliente selecionado.
    await fetchRecipients(selectedClient.value.id);
    await fetchRecipientsWeb(selectedClient.value.id); // Busca destinarios web para o cliente selecionado
    // Processa as configurações dos serviços, se existirem.
    if (selectedClient.value.servicos.length > 0) {
        selectedClient.value.servicos.forEach((servico) => {
            serviceConfigs.value[servico.id_servico] = {
                notificationFrequency: servico.notificacoes[0]?.frequencia || null,
                notificationMethods: servico.notificacoes
                    .map((n) => {
                        const method = notificationMethods.value.find((m) => m.value === n.tipo_notificacao);
                        return method ? method.value : null;
                    })
                    .filter(Boolean),
                recipients: servico.notificacoes.map((n) => n.id_funcionario_responsavel),
                notificationTime: servico.notificacoes[0]?.hora_notificacao || null,
                monitoringTime: servico.monitoringTime || null
            };
        });
        novo.value = false; // Marca como não novo após selecionar o cliente.
    } else {
        clientServices.value = []; // Limpa os serviços se não houver nenhum.
    }
};

// Função que permite editar um serviço existente.
const editService = async (service) => {
    selectedService.value = service; // Define o serviço selecionado.
    showConfig.value = true; // Exibe as configurações do serviço.
    await nextTick();
    // Rola suavemente para a área de configurações.
    const configSection = document.querySelector('.configuracao-monitoramento');
    if (configSection) {
        configSection.scrollIntoView({ behavior: 'smooth' });
    }
};

/**
 * Formata o tempo no formato "HH:mm".
 * @param {Object} timeObj - Objeto contendo horas e minutos.
 * @returns {string|null} O tempo formatado ou null caso o formato não seja válido.
 */
const formatarTempo = (timeObj) => {
    if (timeObj && timeObj.hours !== undefined && timeObj.minutes !== undefined) {
        const hours = String(timeObj.hours).padStart(2, '0'); // Preenche as horas com zero à esquerda.
        const minutes = String(timeObj.minutes).padStart(2, '0'); // Preenche os minutos com zero à esquerda.
        return `${hours}:${minutes}`; // Retorna a string formatada "HH:mm".
    }
    return null; // Retorna null se o objeto de tempo não for válido.
};

/**
 * Função que adiciona um serviço à lista de serviços com as configurações fornecidas.
 */
const addServiceWithConfig = async () => {
    try {
        // Verifica se há campos obrigatórios não preenchidos nas configurações do serviço.
        const missingFields = clientServices.value.some((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            return !serviceConfig.notificationFrequency || !serviceConfig.notificationMethods.length || !serviceConfig.recipients.length;
        });

        if (missingFields) {
            // Exibe um erro se houver campos obrigatórios não preenchidos.
            toast.add({
                severity: 'error',
                summary: t('required_fields'),
                detail: t('fill_all_settings'),
                life: 3000
            });
            return; // Retorna sem adicionar o serviço se os campos não estiverem preenchidos.
        }

        // Formata o tempo de notificação, caso seja um objeto de tempo.
        clientServices.value.forEach((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            if (typeof serviceConfig.notificationTime === 'object') {
                serviceConfig.notificationTime = formatarTempo(serviceConfig.notificationTime);
            }
        });

        // Cria os dados a serem enviados para o backend.
        const servicesConfigData = clientServices.value.map((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: serviceConfig.notificationTime,
                frequencia_monitoramento: serviceConfig.monitoringFrequency,
                metodos_notificacao: serviceConfig.notificationMethods,
                destinatarios: serviceConfig.recipients,
                destinatariosweb: serviceConfig.recipientsweb
            };
        });

        // Dados finais para envio.
        const data = {
            id_cliente: selectedClient.value.id,
            servicos: servicesConfigData
        };

        // Envia os dados ao backend para adicionar o serviço.
        await clientesService.adicionarServico(data);

        // Exibe uma notificação de sucesso.
        toast.add({ severity: 'success', summary: t('services_add'), life: 3000 });
    } catch (error) {
        console.error('Erro ao adicionar os serviços:', error); // Loga o erro ocorrido.
        toast.add({ severity: 'error', summary: t('erro_add_service'), life: 3000 }); // Exibe um erro ao usuário.
    }
};

const closeConfig = () => {
    showConfig.value = false; // Oculta a configuração do serviço.
    selectedService.value = null; // Limpa o serviço selecionado.
};

/**
 * Função para adicionar um novo serviço à lista de serviços do cliente.
 */
const addService = () => {
    if (!newService.value) {
        // Verifica se um serviço foi selecionado antes de adicionar.
        toast.add({
            severity: 'error', // Tipo de notificação: erro.
            summary: t('no_service_added'), // Título da notificação.
            detail: t('no_service_added_detail'), // Mensagem de erro detalhada.
            life: 3000 // Duração da notificação.
        });
        return; // Retorna sem adicionar se nenhum serviço for selecionado.
    }

    // Verifica se o serviço já está na lista de serviços.
    if (!clientServices.value.some((s) => s.id === newService.value.id)) {
        clientServices.value.push(newService.value); // Adiciona o novo serviço à lista.
        serviceConfigs.value[newService.value.id] = {
            // Inicializa as configurações para o novo serviço.
            notificationFrequency: null,
            monitoringFrequency: null,
            notificationMethods: [],
            recipients: [],
            notificationTime: null,
            monitoringTime: null
        };
        selectedService.value = newService.value; // Define o serviço selecionado.
        newService.value = null; // Limpa a seleção do novo serviço.
    } else {
        // Exibe um aviso se o serviço já estiver na lista.
        toast.add({
            severity: 'warn',
            summary: t('duplciated_service'),
            detail: t('duplicated_service_detail'),
            life: 3000
        });
    }
};

/**
 * Função que remove um serviço da lista de serviços.
 */
const removeService = async (service) => {
    try {
        // Remove o serviço da lista local.
        clientServices.value = clientServices.value.filter((s) => s.id !== service.id);

        deleteServiceDialog.value = false; // Fecha o diálogo de confirmação.

        // Remove as configurações associadas ao serviço.
        delete serviceConfigs.value[service.id];

        // Se o serviço removido for o selecionado, limpa a seleção.
        if (selectedService.value?.id === service.id) {
            selectedService.value = null;
            showConfig.value = false; // Oculta a configuração do serviço removido.
        }

        // Dados a serem enviados para remoção no backend.
        const data = {
            id_cliente: selectedClient.value.id,
            id_servico: service.id,
            id_usuario: store.userId // ID do usuário que está realizando a remoção.
        };

        // Envia a solicitação de remoção ao backend.
        const response = await clientesService.deletarServico(data);

        // Verifica a resposta da API.

        toast.add({
            severity: 'success',
            summary: t('remove_service'),
            detail: t('remove_service_details', { name: service.name }),
            life: 3000
        });
    } catch (error) {
        // Exibe erro caso a remoção falhe.
        console.error('Erro ao remover serviço:', error);
        toast.add({
            severity: 'error',
            summary: t('remove_service_error'),
            detail: error.message || t('remove_service_error_default'),
            life: 3000
        });
    }
};

/**
 * Função que atualiza a configuração de um serviço.
 */
const updateServiceConfig = async () => {
    try {
        // Formata os tempos de notificação, caso necessário.
        clientServices.value.forEach((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            if (typeof serviceConfig.notificationTime === 'object') {
                serviceConfig.notificationTime = formatarTempo(serviceConfig.notificationTime);
            }
        });

        // Cria os dados das configurações de serviço.
        const servicesConfigData = clientServices.value.map((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: serviceConfig.notificationTime,
                frequencia_monitoramento: serviceConfig.monitoringFrequency,
                metodos_notificacao: serviceConfig.notificationMethods,
                destinatarios: serviceConfig.recipients,
                destinatariosweb: serviceConfig.recipientsweb
            };
        });

        // Dados a serem enviados para o backend.
        const data = {
            id_cliente: selectedClient.value.id,
            servicos: servicesConfigData
        };

        // Envia a atualização dos serviços ao backend.
        await axios.post('/admin/cliente/atualizarServico', data);

        closeConfig(); // Fecha a configuração do serviço após a atualização.

        // Exibe notificação de sucesso.
        toast.add({ severity: 'success', summary: t('update_service'), life: 3000 });
    } catch (error) {
        // Exibe erro caso a atualização falhe.
        console.error('Erro ao atualizar os serviços:', error);
        toast.add({ severity: 'error', summary: t('update_service_error'), life: 3000 });
    }
};

// Chama a função para verificar o perfil do usuário ao montar o componente.
onMounted(fetchIfAdmin);
</script>

<style scoped>
.field {
    margin-bottom: 10px;
}

.add-service {
    margin-top: 10px;
}

.configuracao-monitordmento {
    margin-top: 20px;
}

.no-break {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
