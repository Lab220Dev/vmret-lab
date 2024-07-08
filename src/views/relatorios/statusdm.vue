<script setup>
import { onMounted, ref, watch } from 'vue';

const dms = ref([]);
const formatedDms = ref([])
const selectedDM = ref('');
const ListaDM = ref([]);
watch(dms, (newValue) => {
    if (newValue) {
        fetchSelectedDMs();
    } else {
        return;
    }
});

const fetchDMs = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {
        const response = await axios.post("relatorios/listarDms", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        dms = response.data;
        formatedDms = dms.map(dms => ({
            label: dms.nome,
            value: dms.id_maquina
        }))
    } catch (error) {
        console.error("Erro ao buscar centros de custo:", error);
    }
}
const fetchSelectedDMs = async () => {
    const data = {
        "DM": selectedDM.value
    };
    try {
        const response = await axios.post("relatorios/listarDMselecionado", data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        ListaDM = response.data;
    } catch (error) {
        console.error("Erro ao buscar a lista de DMs:", error);
    }
}
onMounted(() => {
    //fetchDMs();
})
</script>

<template>
    <div class="card">
        <!-- Header com a Seleção de Vms -->
        <div>
            <Dropdown v-model="selectedDM" :options="Dms" optionLabel="name" placeholder="Selecione uma DM"
                class="w-full md:w-14rem" />
        </div>
        <div>
            <DataTable :value="ListaDM" tableStyle="min-width: 50rem">
                <Column field="id_maquina" header="vm"></Column>
                <Column field="name" header="data"></Column>
             </DataTable>
        </div>
    </div>
</template>