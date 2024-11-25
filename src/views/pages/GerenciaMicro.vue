<template>
    <div class="card">
        <h2 class="mt-6">Gerenciamento de Serviços</h2>
        <hr />
        <div v-if="isAdmin" class="flex justify-content-start cliente-selection">
            <!--<label class = "mt-6 mr-4" for="cliente">Selecione o Cliente:</label>-->

            <Dropdown class="mt-4 ml-3" style="width: 300px" v-model="selectedClient" :options="availableClients" placeholder="Selecione um cliente" optionLabel="name" @change="onClientSelected" />
        </div>

        <div v-if="selectedClient?.id" class="mt-8 card services-edit">
            <div class="flex mt-4 justify-content-between align-items-center">
                <h4 class="mt-3 no-break">
                    Serviços atribuídos:
                    <span v-if="isAdmin">{{ selectedClient.name }}</span>
                </h4>
                <div class="add-service flex align-items-center">
                    <Dropdown v-model="newService" class="" :options="availableServices" optionLabel="name" placeholder="Adicionar Serviço" />
                    <Button class="ml-3" label="Inserir" @click="addService" />
                </div>
            </div>

            <DataTable class="mt-5" :value="clientServices">
                <Column field="name" header="Serviço"></Column>
                <Column header="Ação">
                    <template #body="slotProps">
                        <Button label="Configurar" class="mr-2" icon="pi pi-cog" @click="editService(slotProps.data)" />
                        <Button label="Remover" class="p-button-danger" icon="pi pi-trash" @click="openDeleteDialog(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <!-- Caixa de diálogo para confirmação de deleção -->
            <Dialog header="Deletar Serviço" v-model:visible="deleteServiceDialog" style="width: 400px" :modal="true" :closable="true">
                <div class="confirmation-content text-justify">
                    <i class="" style="font-size: 2rem"></i>
                    <span>
                        Você tem certeza que deseja deletar o serviço <b>{{ selectedService?.name }}</b
                        >?
                    </span>
                </div>
                <template #footer>
                    <Button label="Não" icon="pi pi-times" @click="deleteServiceDialog = false" class="p-button-text" />
                    <Button label="Sim" icon="pi pi-check" @click="removeService(selectedService)" class="p-button-danger" />
                </template>
            </Dialog>

            <Fieldset legend="Configurações" v-if="showConfig" class="configuracao-monitoramento card mt-8 px-6">
                <!---->
                <h4 class="text-xl mt-3 justify-content-center flex">{{ selectedService.name }}</h4>

                <div class="flex flex-column col-12 mt-6 ml-3">
                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="notificationFrequency">Frequência de Notificação:</label>
                        <Dropdown style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationFrequency" :options="frequencies" optionLabel="label" optionValue="value" />
                    </div>

                    <div v-if="serviceConfigs[selectedService.id].notificationFrequency === '1x-dia'" class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="time">Horário de Notificação:</label>
                        <VueDatePicker style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationTime" time-picker placeholder="Selecione o horário" />
                    </div>

                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="notificationMethods">Métodos de Notificação:</label>
                        <MultiSelect style="width: 300px" v-model="serviceConfigs[selectedService.id].notificationMethods" :options="notificationMethods" optionLabel="label" optionValue="value" display="chip" />
                    </div>

                    <div class="field grid justify-content-center">
                        <label class="col-12 md:col-5 sm:col-12 md:mb-0 no-break" for="recipients">Destinatários:</label>
                        <MultiSelect style="width: 300px" v-model="serviceConfigs[selectedService.id].recipients" :options="availableRecipients" optionLabel="name" optionValue="id" display="chip" />
                    </div>
                </div>
            </Fieldset>
        </div>
        <div class="flex justify-content-end flex-wrap mt-8">
            <Button class="flex align-items-center justify-content-center" v-if="novo" label="Adicionar Serviço" @click="addServiceWithConfig" />

            <Button class="flex align-items-center justify-content-center" v-else label="Atualizar Serviços" @click="updateServiceConfig" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useAuthStore } from '@/store/authStore.js';
import axios from '@/axios';

const openDeleteDialog = (service) => {
    // Verifique se o 'service' foi passado corretamente
    if (!service || !service.id) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Serviço não encontrado.',
            life: 3000
        });
        return;
    }

    selectedService.value = { ...service }; // Armazenar o serviço a ser removido
    deleteServiceDialog.value = true; // Exibir o diálogo
};

const store = useAuthStore();
const isAdmin = ref(false);

const deleteServiceDialog = ref(false);

const toast = useToast();
const availableClients = ref([]);
const availableServices = ref([
    { id: 1, name: 'Monitoramento de Status DM' },
    { id: 2, name: 'Monitoramento de Estoque' }
]);
const selectedClient = ref(null);
const availableRecipients = ref([]);
const clientServices = ref([]);
const newService = ref(null);
const selectedService = ref(null);
const serviceConfigs = ref({});
const novo = ref(true);
const frequencies = ref([
    { label: 'A cada 5 minutos', value: '5m' },
    { label: 'A cada 30 minutos', value: '30m' },
    { label: 'A cada 1 hora', value: '1h' },
    { label: '1x ao dia', value: '1x-dia' }
]);

const notificationMethods = ref([
    { label: 'E-mail', value: 'email' },
    { label: 'Notificação', value: 'notif' }
]);

const showConfig = ref(false);

const fetchIfAdmin = async () => {
    if (store.userRole === 'Administrador') {
        isAdmin.value = true;
        await fetchClientes();
    } else {
        await fetchServicos();
    }
};

const fetchClientes = async () => {
    try {
        const response = await axios.get('/admin/cliente/listarClienteServicos');
        availableClients.value = response.data.map((cliente) => ({
            id: cliente.id_cliente,
            name: cliente.nome,
            servicos: cliente.servicos
        }));
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
};
const fetchServicos = async () => {
    try {
        const data = {
            id_cliente: store.userIdCliente
        };
        const response = await axios.post('/admin/cliente/listarServicos', data);

        // Verifique se a resposta contém dados e se não é um array vazio
        if (response.data && response.data.length > 0) {
            const cliente = response.data[0]; // Acesse o primeiro cliente, se existir

            // Atribua valores de forma segura
            selectedClient.value = {
                id: cliente.id_cliente,
                name: cliente.nome,
                servicos: cliente.servicos || [] // Caso 'servicos' seja indefinido, use um array vazio
            };

            // Caso 'cliente.servicos' seja um array válido, mapeie os serviços
            if (Array.isArray(cliente.servicos) && cliente.servicos.length > 0) {
                clientServices.value = cliente.servicos.map((servico) => ({
                    id: servico.id_servico,
                    name: servico.nome
                }));
            } else {
                clientServices.value = []; // Caso não haja serviços
            }

            // Chama a função para buscar os destinatários, apenas se 'cliente.id_cliente' existir
            await fetchRecipients(cliente.id_cliente);

            // Se houver serviços, processa as configurações de cada serviço
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
                        recipients: servico.notificacoes.map((n) => n.id_funcionario_responsavel),
                        notificationTime: servico.notificacoes[0]?.hora_notificacao || null,
                        monitoringTime: servico.monitoringTime || null
                    };
                });
                novo.value = false;
            } else {
                clientServices.value = []; // Caso não haja serviços, limpa a lista
            }
        } else {
            // Se não houver dados, trate de forma adequada
            console.log('Nenhum dado encontrado para o cliente');
            selectedClient.value = { id: store.userIdCliente }; // Limpa o cliente selecionado
            clientServices.value = []; // Limpa os serviços
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
};

const fetchRecipients = async (idCliente) => {
    try {
        const response = await axios.post('/funcionarios/listar', { id_cliente: idCliente });
        availableRecipients.value = response.data.map((funcionario) => ({
            id: funcionario.id_funcionario,
            name: funcionario.nome
        }));
    } catch (error) {
        console.error('Erro ao carregar destinatários:', error);
    }
};

const onClientSelected = async () => {
    clientServices.value = selectedClient.value.servicos.map((servico) => ({
        id: servico.id_servico,
        name: servico.nome
    }));

    await fetchRecipients(selectedClient.value.id);

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
        novo.value = false;
    } else {
        clientServices.value = [];
    }
};

const editService = (service) => {
    selectedService.value = service;
    showConfig.value = true;
};
const formatarTempo = (timeObj) => {
    if (timeObj && timeObj.hours !== undefined && timeObj.minutes !== undefined) {
        const hours = String(timeObj.hours).padStart(2, '0');
        const minutes = String(timeObj.minutes).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    return null;
};
const addServiceWithConfig = async () => {
    try {
        const missingFields = clientServices.value.some((service) => {
            const serviceConfig = serviceConfigs.value[service.id];

            return !serviceConfig.notificationFrequency || !serviceConfig.notificationMethods.length || !serviceConfig.recipients.length;
        });

        if (missingFields) {
            toast.add({
                severity: 'error',
                summary: 'Campos obrigatórios não preenchidos',
                detail: 'Por favor, preencha todos os campos de Configurações antes de adicionar o serviço.',
                life: 3000
            });
            return;
        }

        // Processar a configuração do serviço
        clientServices.value.forEach((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            if (typeof serviceConfig.notificationTime === 'object') {
                serviceConfig.notificationTime = formatarTempo(serviceConfig.notificationTime);
            }
        });

        const servicesConfigData = clientServices.value.map((service) => {
            const serviceConfig = serviceConfigs.value[service.id];

            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: serviceConfig.notificationTime,
                frequencia_monitoramento: serviceConfig.monitoringFrequency,
                metodos_notificacao: serviceConfig.notificationMethods,
                destinatarios: serviceConfig.recipients
            };
        });

        const data = {
            id_cliente: selectedClient.value.id,
            servicos: servicesConfigData
        };
        
        await axios.post('/admin/cliente/adicionarServico', data);

        toast.add({ severity: 'success', summary: 'Serviços adicionados com sucesso!', life: 3000 });
    } catch (error) {
        console.error('Erro ao adicionar os serviços:', error);
        toast.add({ severity: 'error', summary: 'Erro ao adicionar os serviços', life: 3000 });
    }
};

const addService = () => {
    if (!newService.value) {
        toast.add({
            severity: 'error',
            summary: 'Nenhum serviço selecionado',
            detail: 'Por favor, selecione um serviço.',
            life: 3000
        });
        return;
    }

    if (!clientServices.value.some((s) => s.id === newService.value.id)) {
        clientServices.value.push(newService.value);
        serviceConfigs.value[newService.value.id] = {
            notificationFrequency: null,
            monitoringFrequency: null,
            notificationMethods: [],
            recipients: [],
            notificationTime: null,
            monitoringTime: null
        };
        selectedService.value = newService.value;
        newService.value = null;
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Serviço duplicado',
            detail: 'Este serviço já foi adicionado.',
            life: 3000
        });
    }
};

const removeService = async (service) => {
    try {
        // Remover o serviço da lista local
        clientServices.value = clientServices.value.filter((s) => s.id !== service.id);

        deleteServiceDialog.value = false;

        // Remover as configurações do serviço
        delete serviceConfigs.value[service.id];

        // Se o serviço removido for o selecionado, limpar a seleção e ocultar as configurações
        if (selectedService.value?.id === service.id) {
            selectedService.value = null;
            showConfig.value = false;
        }

        // Dados a serem enviados para o servidor
        const data = {
            id_cliente: selectedClient.value.id,
            id_servico: service.id,
            id_usuario: store.userId
        };

        // Debug: Verificar os dados antes de enviar
        console.log('Dados enviados para remoção do serviço:', data);

        // Enviar a solicitação para remover o serviço no backend
        const response = await axios.post('/admin/cliente/deletarServico', data);

        // Debug: Verificar a resposta da API
        console.log('Resposta da API:', response);

        // Verificar a estrutura da resposta do backend
        response.status === 200;
        toast.add({
            severity: 'success',
            summary: 'Serviço removido',
            detail: `O serviço ${service.name} foi removido com sucesso.`,
            life: 3000
        });
    } catch (error) {
        // Exibir uma mensagem de erro no toast
        console.error('Erro ao remover serviço:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro ao remover o serviço',
            detail: error.message || 'Ocorreu um erro ao tentar remover o serviço. Tente novamente.',
            life: 3000
        });
    }
};

const updateServiceConfig = async () => {
    try {
        clientServices.value.forEach((service) => {
            const serviceConfig = serviceConfigs.value[service.id];
            if (typeof serviceConfig.notificationTime === 'object') {
                serviceConfig.notificationTime = formatarTempo(serviceConfig.notificationTime);
            }
        });

        const servicesConfigData = clientServices.value.map((service) => {
            const serviceConfig = serviceConfigs.value[service.id];

            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: serviceConfig.notificationTime,
                frequencia_monitoramento: serviceConfig.monitoringFrequency,
                metodos_notificacao: serviceConfig.notificationMethods,
                destinatarios: serviceConfig.recipients
            };
        });

        const data = {
            id_cliente: selectedClient.value.id,
            servicos: servicesConfigData
        };


        await axios.post('/admin/cliente/atualizarServico', data);

        toast.add({ severity: 'success', summary: 'Serviço atualizado com sucesso!', life: 3000 });
    } catch (error) {
        console.error('Erro ao adicionar os serviços:', error);
        toast.add({ severity: 'error', summary: 'Erro ao atualizar os serviços', life: 3000 });
    }
};
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
