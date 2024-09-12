<template>
    <div class="card">
        <h2>Gerenciamento de Serviços por Cliente</h2>

        <!-- Seção para selecionar cliente -->
        <div class="cliente-selection">
            <label for="cliente">Selecionar Cliente:</label>
            <Dropdown v-model="selectedClient" :options="availableClients" placeholder="Selecione um cliente"
                optionLabel="name" />
        </div>

        <!-- Seção para editar serviços atribuídos ao cliente -->
        <div v-if="selectedClient" class="services-edit">
            <h3>Serviços atribuídos a {{ selectedClient.name }}</h3>

            <!-- Tabela para exibir os serviços já atribuídos -->
            <DataTable :value="clientServices">
                <Column field="name" header="Serviço"></Column>
                <Column header="Ação">
                    <template #body="slotProps">
                        <Button label="Remover" icon="pi pi-trash" @click="removeService(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <!-- Adicionar serviços -->
            <div class="add-service">
                <Dropdown v-model="newService" :options="availableServices" optionLabel="name"
                    placeholder="Adicionar Serviço" />
                <Button label="Adicionar" @click="addService" />
            </div>
        </div>

        <hr />

        <!-- Seção de configuração de monitoramento para os serviços atribuídos -->
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

                <div class="field">
                    <label for="notificationMethods">Métodos de Notificação:</label>
                    <MultiSelect v-model="serviceConfigs[selectedService.id].notificationMethods"
                        :options="notificationMethods" optionLabel="label" optionValue="value" display="chip" />
                </div>

                <div class="field">
                    <label for="recipients">Destinatários:</label>
                    <MultiSelect v-model="serviceConfigs[selectedService.id].recipients" 
                    :options="availableRecipients" optionLabel="name" optionValue="id" display="chip" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

// Dados fictícios para clientes e serviços
const availableClients = ref([
    { id: 1, name: 'Cliente A' },
    { id: 2, name: 'Cliente B' }
]);

const availableServices = ref([
    { id: 1, name: 'Serviço A' },
    { id: 2, name: 'Serviço B' },
    { id: 3, name: 'Serviço C' }
]);

const toast = useToast();
const selectedClient = ref(null);
const clientServices = ref([]);
const newService = ref(null);

// Adiciona um serviço ao cliente
const addService = () => {
    // Verificar se o serviço já foi adicionado
    if (newService.value && clientServices.value.some(s => s.id === newService.value.id)) {
        toast.add({ severity: 'warn', summary: 'Serviço duplicado', detail: 'Este serviço já foi adicionado.', life: 3000 });
        return;
    }

    if (newService.value && !clientServices.value.includes(newService.value)) {
        clientServices.value.push(newService.value);
        newService.value = null;
    }
};

// Remove um serviço do cliente
const removeService = (service) => {
    clientServices.value = clientServices.value.filter(s => s.id !== service.id);
};

// Configurações de monitoramento
const selectedService = ref(null);
const serviceConfigs = ref({
    1: { frequency: null, notificationMethods: [], recipients: [] },
    2: { frequency: null, notificationMethods: [], recipients: [] },
    3: { frequency: null, notificationMethods: [], recipients: [] }
});

const frequencies = ref([
    { label: 'A cada 5 minutos', value: '5m' },
    { label: 'A cada 30 minutos', value: '30m' },
    { label: 'A cada 1 hora', value: '1h' }
]);

const notificationMethods = ref([
    { label: 'E-mail', value: 'email' },
    { label: 'Notificação', value: 'Notif' },
]);

const availableRecipients = ref([
    { id: 1, name: 'Funcionario 1' },
    { id: 2, name: 'Funcionario 2' },
    { id: 3, name: 'Funcionario 3' }
]);
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
