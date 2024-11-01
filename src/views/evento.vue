<template>
    <h1>Dados do evento</h1>
    <DataTable
        v-model:filters="filters"
        :value="data"
        stripedRows
        showGridlines
        paginator
        :rows="50"
        :rowsPerPageOptions="[50, 100, 500, 1000]"
        rowHover
        :globalFilterFields="['Nome', 'Telefone', 'Email', 'Foto', 'Retirada']"
        :tableStyle="{ width: '100%' }"
        :sortField="'nome'"
        :sortOrder="1"
        :rowClass="rowClass"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <span>Total de registros: {{ data.length }}</span>
                </div>
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

        <template #empty> Nenhum registro encontrado </template>

        <Column field="Nome" header="Nome" sortable />
        <Column field="Telefone" header="Telefone" sortable />
        <Column field="Email" header="E-mail" sortable />
        <Column field="dia_retirada" header="Dia" sortable />
        <Column field="hora_retirada" header="Hora" sortable />
        <Column field="arquivo" header="Arquivo" sortable>
            <template #body="slotProps">
                <span>
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('arquivo')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.arquivo }}
                </span>
            </template>
        </Column>
        <Column field="Retirada" header="Retirada" sortable>
            <template #body="slotProps">
                <span>
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Retirada')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Retirada }}
                </span>
            </template>
        </Column>
        <Column field="Video" header="Video" sortable>
            <template #body="slotProps">
                <span>
                    <i v-if="slotProps.data.updatedColumns && slotProps.data.updatedColumns.includes('Video')" class="pi pi-refresh updated-icon"></i>
                    {{ slotProps.data.Video }}
                </span>
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import { ref, onMounted, onUnmounted,h } from 'vue';

const data = ref([]);
const filters = ref({ global: { value: null } });

let eventSource;
onMounted(() => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    eventSource = new EventSource(`${baseURL}/evento/updateDados`);
    eventSource.onmessage = (event) => {
        try {
            const updates = JSON.parse(event.data);
            if (updates) {
                data.value = Array.isArray(updates) ? updates : [];
            } else {
                console.warn('Nenhuma atualização recebida.');
            }
        } catch (error) {
            console.error('Erro ao processar dados do EventSource:', error);
        }
    };
});

onUnmounted(() => {
    if (eventSource) {
        eventSource.close();
    }
});

function rowClass(data) {
    if (data.isNew) return 'new-row';
    if (data.updatedColumns && data.updatedColumns.length > 0) return 'updated-row';
    return '';
}

</script>

<style>
.new-row {
    background-color: #e0ffe0;
}

.updated-row {
    background-color: #fff5e6; 
}
.updated-icon {
    margin-left: 5px;
}
</style>
