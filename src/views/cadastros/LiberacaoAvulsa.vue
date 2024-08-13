<script setup>
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';

const toast = useToast();

const libAvulsa = reactive({
    matricula: '',
    voucher: '',
    sku: '',
    dm: '',
    mp: '',
    prazo: '',
    email: ''
});

const enviarEmail = ref(false);

const libOptions = ref([
    { nome: 'DM 1', code: 'plt1' },
    { nome: 'DM 2', code: 'plt2' }
]);

const molaOptions = ref([{ mp: 'Mola 1' }, { mp: 'Mola 2' }, { mp: 'Porta 1' }, { mp: 'Porta 2' }]);

const saveLiberacao = () => {
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Liberação registrada', life: 3000 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="mt-2">Liberação Avulsa</h5>
                <div class="mt-5 mx-0 p-fluid grid">
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="matricula">Matrícula:</label>
                        <InputText class="my-2" v-model="libAvulsa.matricula" id="matricula" type="text" />
                    </div>
                    <div class="full lg:col-4 md:col-12 sm:col-12">
                        <label for="voucher">Voucher:</label>
                        <InputText class="my-2" v-model="libAvulsa.voucher" id="voucher" />
                    </div>
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="sku">SKU:</label>
                        <InputText class="my-2" v-model="libAvulsa.sku" id="sku" />
                    </div>
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="dm">DM:</label>
                        <Dropdown class="my-2" id="dm" v-model="libAvulsa.dm" :options="libOptions" optionLabel="nome" placeholder="Escolha uma DM"></Dropdown>
                    </div>
                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="mp">Mola ou Porta:</label>

                        <!-- :disabled="!libAvulsa.dm" Desabilita o dropdown se DM não estiver selecionado -->
                        <Dropdown class="my-2" id="mp" v-model="libAvulsa.mp" :options="molaOptions" optionLabel="mp" :disabled="!libAvulsa.dm" placeholder="Selecione uma Mola ou Porta"></Dropdown>
                        <!-- <InputText class="my-2" v-model="libAvulsa.mp" id="mp" /> -->
                    </div>

                    <div class="full lg:col-4 md:col-6 sm:col-12">
                        <label for="prazo">Prazo de Retirada:</label>
                        <AutoComplete class="my-2" disabled placeholder="11/11/1111" />
                    </div>

                    <!-- Switch para enviar e-mail -->
                    <div class="full lg:col-12 md:col-12 sm:col-12">
                        <div class="flex align-items-center">
                            <Checkbox v-model="enviarEmail" inputId="sim" name="enviarEmail" value="Sim" class="mx-1" />
                            <label for="enviarEmail" class="mx-2">Desejo receber um aviso por e-mail</label>
                        </div>
                    </div>
                </div>
                <div class="flex align-items-center justify-content-end field col-12">
                    <Button label="Salvar" icon="pi pi-check" severity="info" @click="saveLiberacao" class="full mt-2" />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
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
