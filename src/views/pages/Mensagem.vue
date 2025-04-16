<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import clientesService from '@/Services/ClientesService.js';
import { useAuthStore } from '@/store/authStore.js';
import Badge from 'primevue/badge';
const { t } = useI18n();

const listaNotificacoes = ref([]);
const store = useAuthStore();
const notificacaoSelecionada = ref(null);
const getLista = async () => {
    const response = await clientesService.listarNotificacoes();
    listaNotificacoes.value = response;
};
const rowStyleClass = (data) => {
    return data.status === 0 ? 'linha-nao-lida' : '';
};
const onRowSelect = async (event) => {
    const id = event.data.id_notificacao;
    await clientesService.lerNotificacao(id);
    store.reduzirQtdMessage();
    const item = listaNotificacoes.value.find((n) => n.id_notificacao === id);
    if (item) {
        item.status = 1; // ou true, dependendo do seu backend
    }
    notificacaoSelecionada.value = event.data;
};
onMounted(() => {
    getLista();
});
</script>

<template>
    <div class="card split-view">
        <!-- Lado esquerdo: Lista de notificações -->
        <div class="lista vh">
            <DataTable
                :value="listaNotificacoes"
                selectionMode="single"
                :paginator="true"
                :rows="12"
                :rowsPerPageOptions="[5, 10, 15]"
                @rowSelect="onRowSelect"
                :rowStyleClass="rowStyleClass"
                dataKey="id_notificacao"
                v-model:selection="notificacaoSelecionada"
                class="datatable"
            >
                <Column header="Notificação">
                    <template #body="slotProps">
                        <Badge v-if="slotProps.data.status === false" severity="info" value="Nova" class="ml-2" />
                        {{ slotProps.data.titulo }}
                    </template>
                </Column>
                <template #empty>
                    {{ t('no_notifications') }}
                </template>
            </DataTable>
        </div>

        <!-- Lado direito: Detalhe da notificação selecionada -->
        <div class="detalhe" v-if="notificacaoSelecionada">
            <h4>{{ notificacaoSelecionada.titulo }}</h4>
            <div v-html="notificacaoSelecionada.conteudo"></div>
        </div>
        <div class="detalhe" v-else>
            <p class="mt-5 text-center">{{ t('select_notification') || 'Selecione uma notificação para ver os detalhes.' }}</p>
            <hr />
        </div>
    </div>
</template>

<style scoped>
.split-view {
    display: flex;
    flex-direction: row;
}

.lista {
    flex: 1;

}

.detalhe {
    flex: 1;
    padding: 1rem;
    border-left: 1px solid #ccc;
}
.nova-badge {
    background-color: #2196f3;
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 6px;
    margin-left: 8px;
    border-radius: 10px;
}

.datatable .p-datatable {
    display: grid;
    align-content: space-between;
}

</style>
