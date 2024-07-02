<script setup>
import { reactive, ref, onMounted, watch  } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import imageUrl from '@/assets/images/placeholder4.png'
import clockurl from '@/assets/images/OIP.jpeg'
import { useAuthStore } from '@/store/authStore.js';

const store = useAuthStore();
const toast = useToast();

const status = ref([
    { name: 'Ativo', status: true },
    { name: 'Inativo', status: false }
]);
const centroCusto = ref([
    { name: "Centro de Custo 1", key: "cc1" },
    { name: "Centro de Custo 2", key: "cc2" },
]);
const SetorDiretoria = ref([
    { name: "Desenvolvimento", key: "dev" },
    { name: "Administração", key: "adm" },
]);
const hieraquiaoptions = ref([
    { name: "Senior" },
    { name: "Junior" },
    { name: "Pleno" }
]);
let funcionario = reactive({
    matricula: '',
    nome: '',
    biometria: '',
    biometria2: '',
    data_admissao: new Date().toDateString(),
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    id_centro_custo: '',
    id_planta: '',
    id_setor: '',
    id_funcao: '',
    status: '',
    hora_inicial: '',
    hora_final: '',
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false,
    itemsSelecionadosFuncionario: [],
})
const selectedProduct = ref([]);

const ItensSetorDev = ref([
    { name: "Mouse", sku: 123, quantidade: 1 },
    { name: "Teclado", sku: 647, quantidade: 1 },
    { name: "Microfone", sku: 563, quantidade: 1 },
    { name: "Fone de ouvido", sku: 436, quantidade: 1 },
    { name: "Cabo USB", sku: 279, quantidade: 1 },

])
const ItensSetorAdm = ref([
    { name: "Post-it", sku: 98374, quantidade: 0 },
    { name: "caderno", sku: 827642, quantidade: 0 },
    { name: "corretivo", sku: 7462, quantidade: 0 },
    { name: "clipe de papel", sku: 2978264, quantidade: 0 },
]);
const ListaFuncionarios = ref([]);
const itemDialog = ref(false);
const deleteProductDialog = ref(false)
const visible = ref(false);
const metaKey = ref(true);
const active = ref(0);
const item = ref({});
const saveFuncionario = () => {
    //veirficar data/rg valido/se o status for ativado e as permissoes/
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });

}
const SalvarProduto = () => {
    if (!(funcionario.itemsSelecionadosFuncionario.sku === selectedProduct.value.sku)) {
        funcionario.itemsSelecionadosFuncionario.push(selectedProduct.value);
        selectedProduct.value = {};
        visible.value = false;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Adicionado', life: 3000 });
    } else {
        funcionario.itemsSelecionadosFuncionario[findIndexById(item.value.sku)] = item.value;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Item atualizado', life: 3000 });
        item.value = {};
        itemDialog.value = false;
    }

}
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
const selectedTimeObject = ref(null);
const selectedTimeeObject2 = ref(null);
const onRowSelect = (event) => {
    funcionario = event.data;
    active.value = 1;
};
const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
const editItem = (itm) => {
    item.value = { ...itm }
    itemDialog.value = true;
};
const findIndexById = (sku) => {
    let index = 0;
    for (let i = 0; i < funcionario.itemsSelecionadosFuncionario.length; i++) {
        if (funcionario.itemsSelecionadosFuncionario[i].sku === sku) {
            index = i;
            break;
        }

    }
    return index;
};
const confirmDeleteProduct = (itm) => {
    item.value = itm;
    deleteProductDialog.value = true;
};
const deleteProduct = () => {
    const remover = funcionario.itemsSelecionadosFuncionario.findIndex(itm => itm.sku === item.value.sku);
    if (remover !== -1) {
        funcionario.itemsSelecionadosFuncionario.splice(remover, 1);
    }
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Deletado', life: 3000 });
    item.value = {};
    deleteProductDialog.value = false;
};
const loadFuncionarios = async () => {
    const data = {
        "id_cliente": store.userIdCliente
    };
    try {

        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        ListaFuncionarios.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
};
const adicionarFuncionario = async () => {
    let data = {
        "id_cliente": store.userIdCliente
    };
    Object.assign(data, funcionario);
    try {

        const response = await axios.post('/funcionarios/adicionar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });
    } catch (error) {
        console.error('Erro ao adicionar o funcionario usuários:', error);
    }
};
watch([startDateObject, endDateObject], ([newStartDate, newEndDate]) => {
  if (newStartDate) {
    formattedStartDate.value = formatTime(newStartDate);
  } else {
    formattedStartDate.value = '';
  }

  if (newEndDate) {
    formattedEndDate.value = formatTime(newEndDate);
  } else {
    formattedEndDate.value = '';
  }
});

function updateFormattedDates() {
  if (startDateObject.value) {
    formattedStartDate.value = formatTime(startDateObject.value);
  } else {
    formattedStartDate.value = '';
  }

  if (endDateObject.value) {
    formattedEndDate.value = formatTime(endDateObject.value);
  } else {
    formattedEndDate.value = '';
  }
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
onMounted(() => {
    loadFuncionarios();
});
</script>

<template>
    <div class="card">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Funcionário">
                <div class="card">
                    <DataTable :value="ListaFuncionarios" selectionMode="single" stripedRows
                        tableStyle="min-width: 50rem" dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                        <Column field="nome" header="Nome"></Column>
                        <Column field="matricula" header="Matrícula"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <TabPanel header="Adicionar Funcionário">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-12 md:col-6 sm:col-4 ">
                                    <label for="name">Nome</label>
                                    <InputText v-model="funcionario.nome" id="name" type="text"></InputText>
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="matricula">Matrícula</label>
                                    <InputText id="matricula" v-model="funcionario.matricula" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="Hash">Hash 1</label>
                                    <InputText disabled id="Hash" v-model="funcionario.biometria" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="Hash2">Hash 2</label>
                                    <InputText disabled id="Hash2" v-model="funcionario.biometria2" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="DataAdmissao">Data de Admissao</label>
                                    <VueDatePicker v-model="funcionario.data_admissao" showIcon :showOnFocus="false"
                                        :format="format" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar"
                                        :enable-time-picker="false" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="cpf">CPF</label>
                                    <InputMask v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="rg">RG</label>
                                    <InputMask id="rg" v-model="funcionario.RG" mask="99.999.999-*" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="ctps">CTPS</label>
                                    <InputMask id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="email">E-mail</label>
                                    <InputText id="email" v-model="funcionario.email" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="perfil">Centro de Custo</label>
                                    <Dropdown v-model="funcionario.id_centro_custo" :options="centroCusto"
                                        optionLabel="name" placeholder="Selecione Um " />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="planta">Planta</label>
                                    <InputText id="planta" v-model="funcionario.id_planta" type="text" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="setor">Setor/Diretoria</label>
                                    <Dropdown v-model="funcionario.id_setor" :options="SetorDiretoria" optionLabel="name"
                                        placeholder="Selecione o Setor" />
                                </div>
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="funcao">Função/Nivel Hierarquico</label>
                                    <Dropdown v-model="funcionario.id_funcao" :options="hieraquiaoptions"
                                        optionLabel="name" placeholder="Selecione a Função" />
                                </div>

                            </div>
                            <div class="p-fluid formgrid grid">
                                <div class="field lg:col-4  md:col-6 sm:col-4">
                                    <label for="status">Status</label>
                                    <Dropdown id="status" v-model="funcionario.status" :options="status"
                                        optionLabel="name" placeholder="Escolha um"></Dropdown>
                                </div>
                                <div class="field lg:col-2  md:col-6 sm:col-4">
                                    <label for="inicio">Hora Inicio</label>
                                    <VueDatePicker v-model="selectedTimeObject" time-picker
                                        disable-time-range-validation @input="updateFormattedDates">
                                        <template #input-icon>
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>
                                <div class="field lg:col-2  md:col-6 sm:col-4">
                                    <label for="inicio">Hora Fim</label>
                                    <VueDatePicker id="inicio" v-model="selectedTimeObject2" time-picker
                                        disable-time-range-validation @input="updateFormattedDates">
                                        <template #input-icon>
                                            <img class="input-slot-image" :src="clockurl" />
                                        </template>
                                    </VueDatePicker>
                                </div>

                            </div>
                            <div class="p-fluid formgrid grid">
                                <div class="flex align-content-end flex-wrap field lg:col-4  md:col-6 sm:col-4">
                                    <Toast />
                                    <img role="presentation" :src="imageUrl" width="170" />
                                    <FileUpload mode="basic" name="demo[]" url="demo/images" accept="image/*"
                                        :maxFileSize="1000000" @upload="onUpload" chooseLabel="Escolha uma Foto" />
                                </div>
                                <!--Div com os dias da Semana-->
                                <div class=" lg:col-8  md:col-6 sm:col-4">
                                    <label for="fim">Selecione os dias que o Funcionario poderá retirar os
                                        items:</label>
                                    <div id="fim" class="flex align-content-end flex-wrap">
                                        <div class="m-2 flex align-items-end">
                                            <Checkbox v-model="funcionario.segunda" inputId="Segunda" name="pizza"
                                                value="Segunda" :binary="true" />
                                            <label for="Segunda" class="ml-2"> Segunda-Feira </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.terca" inputId="Terca" name="Dias"
                                                value="Terca":binary="true" />
                                            <label for="Terca" class="ml-2"> Terça-Feira </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.quarta" inputId="Quarta" name="Dias"
                                                value="Quarta" :binary="true"/>
                                            <label for="Quarta" class="ml-2"> Quarta-Feira </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.quinta" inputId="Quinta" name="Dias"
                                                value="Quinta":binary="true" />
                                            <label for="Quinta" class="ml-2"> Quinta-Feira </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.sexta" inputId="Sexta" name="Dias"
                                                value="Sexta" :binary="true"/>
                                            <label for="Sexta" class="ml-2"> Sexta-Feira </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.sabado" inputId="Sabado" name="Dias"
                                                value="Sabado":binary="true" />
                                            <label for="Sabado" class="ml-2"> Sabado </label>
                                        </div>
                                        <div class="m-2 flex align-items-center">
                                            <Checkbox v-model="funcionario.domingo" inputId="Domingo" name="Dias"
                                                value="Domingo":binary="true" />
                                            <label for="Domingo" class="ml-2"> Domingo</label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <Button label="Salvar" icon="pi pi-check" severity="info" @click="adicionarFuncionario"
                                class="m-2" />
                            <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                            <div class="col-12">
                                <TabView>
                                    <TabPanel header="Items do Setor">
                                        <DataTable :value="ItensSetorDev" stripedRows dataKey="sku"
                                            v-model="funcionario.itemsSelecionadosSetor">
                                            <Column field="name" header="Nome"></Column>
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column field="prazo" header="Prazo"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <TabPanel header="Items do Funcionario">
                                        <Button label="Adicionar Items" @click="visible = true" />
                                        <!--data table que exibe os items adicionados-->
                                        <DataTable :value="funcionario.itemsSelecionadosFuncionario"
                                            tableStyle="min-width: 50rem" stripedRows dataKey="sku">
                                            <Column field="name" header="Nome"></Column>
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column style="min-width:8rem">
                                                <template #body="slotProps">
                                                    <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                                                        @click="editItem(slotProps.data)" />
                                                    <Button icon="pi pi-trash" outlined rounded severity="danger"
                                                        @click="confirmDeleteProduct(slotProps.data)" />
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </TabPanel>
                                </TabView>
                            </div>

                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :modal="true"
            class="p-fluid">
            <div>
                <div class="p-fluid formgrid grid">
                    <div class="field lg:col-12 md:col-6 sm:col-4 ">
                        <label for="name">Nome:</label>
                        <InputText disabled v-model="item.name" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-4  md:col-6 sm:col-4">
                        <label for="Quantidade">Quantidade</label>
                        <InputText id="Quantidade" v-model="item.quantidade" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Salvar" icon="pi pi-check" text @click="SalvarProduto" />
            </template>
        </Dialog>
        <Dialog v-model:visible="visible" modal header="Adicionar Items do Funcionário">
            <div class="grid">
                <div class="col-12">
                    <label for="Produto" class="font-semibold col-2">Produto</label>
                    <Dropdown v-model="selectedProduct" :options="ItensSetorAdm" optionLabel="name"
                        placeholder="Selecione um produto" class="col-8 p-0" />
                </div>
                <div class="col-12">
                    <label for="Quantidade" class="font-semibold w-6rem">Quantidade</label>
                    <InputNumber id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3"
                        autocomplete="off" :min="1" :max="999" />
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Adicionar" @click="SalvarProduto"></Button>
            </div>
        </Dialog>
        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Deletar Item" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="item">Você tem certeza que quer deletar o Item: {{ item.name }}</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Sim" icon="pi pi-check" text @click="deleteProduct" />
            </template>
        </Dialog>
    </div>


</template>
<style>
.input-slot-image {
    height: 20px;
    width: auto;
    margin-left: 5px;
}
</style>