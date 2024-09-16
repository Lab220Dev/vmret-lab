<template>
    <div class="card">
        <h2 v-if="isAdmin">Gerenciamento de Serviços por Cliente</h2>
        <h2 v-else>Configuração de Serviços</h2>

        <div v-if="isAdmin" class="cliente-selection">
            <label for="cliente">Selecionar Cliente:</label>
            <Dropdown v-model="selectedClient" :options="availableClients" placeholder="Selecione um cliente"
                optionLabel="name" />
        </div>

        <div v-if="isAdmin && selectedClient && selectedClient.id !== null" class="services-edit">
            <h3 v-if="isAdmin">Serviços atribuídos a {{ selectedClient.name }}</h3>
            <h3 v-else>Seus Serviços</h3>

            <DataTable :value="clientServices">
                <Column field="name" header="Serviço"></Column>
                <Column header="Ação">
                    <template #body="slotProps">
                        <Button label="Remover" icon="pi pi-trash" @click="removeService(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <div class="add-service">
                <Dropdown v-model="newService" :options="availableServices" optionLabel="name"
                    placeholder="Adicionar Serviço" />
                <Button label="Adicionar" @click="addService" />
            </div>
            <hr />

<div v-if="clientServices.length > 0" class="configuracao-monitoramento">
    <h3>Configurações de Monitoramento</h3>
    <Dropdown v-model="selectedService" :options="clientServices" placeholder="Selecione um serviço"
        optionLabel="name" />

    <div v-if="selectedService">
        <h4>Configurações para {{ selectedService.name }}</h4>

        <div class="field">
            <label for="frequency">Frequência de Monitoramento:</label>
            <Dropdown v-model="serviceConfigs[selectedService.id].frequency" :options="frequencies"
                optionLabel="label" optionValue="value" />
        </div>

        <div v-if="serviceConfigs[selectedService.id].frequency === '1x-dia'" class="field">
            <label for="time">Horário:</label>
            <VueDatePicker v-model="serviceConfigs[selectedService.id].time" time-picker
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
</div>
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
const clientServices = ref([]);
const newService = ref(null);
const availableRecipients = ref([]);
const availableClients = ref([]);
const selectedService = ref(null);
const serviceConfigs = ref({});

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

const availableServices = ref([
    { id: 1, name: 'Monitoramento De Status DM' },
    { id: 2, name: 'Monitoramento de Estoque' }
]);

const selectedClient = ref({
    id:null,
    nome:'',
});

const fetchIfAdmin = async() => {
    if(store.userRole === 'Administrador'){
        isAdmin.value = true;
        //clientServices.value  
        await fetchClientes();
    }else{
        selectedClient.value = { id: store.userId, name: store.userName }
    }
}
const fetchClientes = async () => {
    try {
        const response = await axios.get('/admin/cliente/listarClienteServicos');

        availableClients.value = response.data.map((cliente) => ({
            name: cliente.nome,
            value: cliente.id_cliente
        }));

        response.data.forEach(cliente => {
            cliente.servicos.forEach(servico => {
                serviceConfigs.value[servico.id_servico] = {
                    frequency: null,
                    notificationMethods: [],
                    recipients: [],
                    time: null
                };

                servico.notificacoes.forEach(notification => {
                    serviceConfigs.value[servico.id_servico].frequency = notification.frequencia;
                    serviceConfigs.value[servico.id_servico].notificationMethods.push(notification.tipo_notificacoes);
                    serviceConfigs.value[servico.id_servico].recipients.push(notification.id_funcionario_responsavel);
                    serviceConfigs.value[servico.id_servico].time = notification.hora_notificacao;
                });
            });
        });

    } catch (error) {
        console.error('Erro ao carregar clientes e serviços:', error);
    }
  };

const addService = () => {
    if (newService.value && clientServices.value.some(s => s.id === newService.value.id)) {
        toast.add({ severity: 'warn', summary: 'Serviço duplicado', detail: 'Este serviço já foi adicionado.', life: 3000 });
        return;
    }

    if (newService.value && !clientServices.value.includes(newService.value)) {
        clientServices.value.push(newService.value);
        newService.value = null;
    }
};

const removeService = (service) => {
    clientServices.value = clientServices.value.filter(s => s.id !== service.id);
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

.configuracao-monitoramento {
    margin-top: 20px;
}
</style>
