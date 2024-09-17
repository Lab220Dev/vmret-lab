<template>
    <div class="card">
        <h2>Gerenciamento de Serviços por Cliente</h2>

        <div v-if="isAdmin" class="cliente-selection">
            <label for="cliente">Selecionar Cliente:</label>
            <Dropdown v-model="selectedClient" :options="availableClients" placeholder="Selecione um cliente"
                optionLabel="name" @change="onClientSelected" />
        </div>

        <div v-if="selectedClient?.id" class="services-edit">
            <h3>Serviços atribuídos a {{ selectedClient.name }}</h3>

            <DataTable :value="clientServices">
                <Column field="name" header="Serviço"></Column>
                <Column header="Ação">
                    <template #body="slotProps">
                        <Button label="Configurar" icon="pi pi-cog" @click="editService(slotProps.data)" />
                        <Button label="Remover" icon="pi pi-trash" @click="removeService(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <div class="add-service">
                <Dropdown v-model="newService" :options="availableServices" optionLabel="name"
                    placeholder="Adicionar Serviço" />
                <Button label="Inserir" @click="addService" />
            </div>

            <div v-if="showConfig" class="configuracao-monitoramento">
                <h4>Configurações para {{ selectedService.name }}</h4>

                <div class="field">
                    <label for="notificationFrequency">Frequência de Notificação:</label>
                    <Dropdown v-model="serviceConfigs[selectedService.id].notificationFrequency" :options="frequencies"
                        optionLabel="label" optionValue="value" />
                </div>

                <div v-if="serviceConfigs[selectedService.id].notificationFrequency === '1x-dia'" class="field">
                    <label for="time">Horário de Notificação:</label>
                    <VueDatePicker v-model="serviceConfigs[selectedService.id].notificationTime" time-picker
                        placeholder="Selecione o horário" />
                </div>

                <div class="field">
                    <label for="notificationMethods">Métodos de Notificação:</label>
                    <MultiSelect v-model="serviceConfigs[selectedService.id].notificationMethods"
                        :options="notificationMethods" optionLabel="label" optionValue="value" display="chip" />
                </div>

                <div class="field">
                    <label for="recipients">Destinatários:</label>
                    <MultiSelect v-model="serviceConfigs[selectedService.id].recipients" :options="availableRecipients"
                        optionLabel="name" optionValue="id" display="chip" />
                </div>
            </div>
            <Button v-if="novo" label="Adicionar Novo Serviço" @click="addServiceWithConfig" />
            <Button v-else label="Atualizar Serviços" @click="updateServiceConfig" />
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

const store = useAuthStore();
const isAdmin = ref(false);

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
const novo = ref(true)
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
    }else{
        await fetchServicos();
    }
};

const fetchClientes = async () => {
    try {
        const response = await axios.get('/admin/cliente/listarClienteServicos');
        availableClients.value = response.data.map(cliente => ({
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
        const response = await axios.post('/admin/cliente/listarServicos',data);
        const cliente = response.data[0];
        selectedClient.value = {
            id: cliente.id_cliente,
            name: cliente.nome,
            servicos: cliente.servicos
        };
        clientServices.value = cliente.servicos.map(servico => ({
            id: servico.id_servico,
            name: servico.nome
        }));
        await fetchRecipients(cliente.id_cliente);
        if (selectedClient.value.servicos.length > 0) {
            selectedClient.value.servicos.forEach(servico => {
                serviceConfigs.value[servico.id_servico] = {
                    notificationFrequency: servico.notificacoes[0]?.frequencia || null,
                    notificationMethods: servico.notificacoes.map(n => {
                        const method = notificationMethods.value.find(m => m.value === n.tipo_notificacao);
                        return method ? method.value : null;
                    }).filter(Boolean),
                    recipients: servico.notificacoes.map(n => n.id_funcionario_responsavel),
                    notificationTime: servico.notificacoes[0]?.hora_notificacao || null,
                    monitoringTime: servico.monitoringTime || null
                };
            });
            novo.value = false;
        } else {
            clientServices.value = [];
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
};
const fetchRecipients = async (idCliente) => {
    try {
        const response = await axios.post('/funcionarios/listar', { id_cliente: idCliente });
        availableRecipients.value = response.data.map(funcionario => ({
            id: funcionario.id_funcionario,
            name: funcionario.nome
        }));
    } catch (error) {
        console.error('Erro ao carregar destinatários:', error);
    }
};

const onClientSelected = async () => {
    clientServices.value = selectedClient.value.servicos.map(servico => ({
        id: servico.id_servico,
        name: servico.nome
    }));

    await fetchRecipients(selectedClient.value.id);

    if (selectedClient.value.servicos.length > 0) {
        selectedClient.value.servicos.forEach(servico => {
            serviceConfigs.value[servico.id_servico] = {
                notificationFrequency: servico.notificacoes[0]?.frequencia || null,
                notificationMethods: servico.notificacoes.map(n => {
                    const method = notificationMethods.value.find(m => m.value === n.tipo_notificacao);
                    return method ? method.value : null;
                }).filter(Boolean),
                recipients: servico.notificacoes.map(n => n.id_funcionario_responsavel),
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
    if (timeObj && timeObj.hour !== undefined && timeObj.minute !== undefined && timeObj.second !== undefined) {
        const hours = String(timeObj.hour).padStart(2, '0');
        const minutes = String(timeObj.minute).padStart(2, '0');
        const seconds = String(timeObj.second).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    return null;
};
const addServiceWithConfig = async () => {
    try {
        const servicesConfigData = clientServices.value.map(service => {
            const serviceConfig = serviceConfigs.value[service.id];

            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: formatarTempo(serviceConfig.notificationTime),
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
    if (newService.value && !clientServices.value.some(s => s.id === newService.value.id)) {
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
        toast.add({ severity: 'warn', summary: 'Serviço duplicado', detail: 'Este serviço já foi adicionado.', life: 3000 });
    }
};

const removeService = (service) => {
    clientServices.value = clientServices.value.filter(s => s.id !== service.id);
    delete serviceConfigs.value[service.id];

    if (selectedService.value?.id === service.id) {
        selectedService.value = null;
        showConfig.value = false;
    }
};
const updateServiceConfig = async () => {
    try {
        const servicesConfigData = clientServices.value.map(service => {
            const serviceConfig = serviceConfigs.value[service.id];

            return {
                id_servico: service.id,
                nome_servico: service.name,
                frequencia_notificacao: serviceConfig.notificationFrequency,
                horario_notificacao: formatarTempo(serviceConfig.notificationTime),
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

        toast.add({ severity: 'success', summary: 'Serviços Atualizado com sucesso!', life: 3000 });
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
</style>
