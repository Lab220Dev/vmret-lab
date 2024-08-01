<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
import clockurl from '@/assets/images/OIP.png';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';
import { isValid as validateCPF } from 'cpf-validator';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const store = useAuthStore();
const toast = useToast();
const selectedFile = ref(null);
const handleFileSelected = (file) => {
    selectedFile.value = file;
};

const errors = ref({});
const status = ref([
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' }
]);
const imageUrl = ref(null);
let centroCustooptions = ref([]);
let SetorDiretoriaoptions = ref([]);
let hieraquiaoptions = ref([]);
let plantasoptions = ref([]);
let formatedCentroCustoOptions = ref([]);
let formatedSetorOptions = ref([]);
let formatedHierarquiaOptions = ref([]);
let formatedPlantaOptions = ref([]);
let funcionario = reactive({
    id_funcionario: '',
    matricula: '',
    nome: '',
    biometria: '',
    biometria2: '',
    data_admissao: new Date().toDateString(),
    CPF: '',
    RG: '',
    CTPS: '',
    email: '',
    status: '',
    hora_inicial: '',
    hora_final: '',
    id_centro_custo: '',
    id_funcao: '',
    id_planta: '',
    id_setor: '',
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false,
    nomearquivo: ''
});
const editVisible = ref(false);
const selectedProduct = ref([]);
const itemsSelecionadosFuncionario = ref([]);
const ItensSetorDev = ref([
    { name: 'Mouse', sku: 123, quantidade: 1 },
    { name: 'Teclado', sku: 647, quantidade: 1 },
    { name: 'Microfone', sku: 563, quantidade: 1 },
    { name: 'Fone de ouvido', sku: 436, quantidade: 1 },
    { name: 'Cabo USB', sku: 279, quantidade: 1 }
]);
const ItensSetorAdm = ref([
    { name: 'Post-it', sku: 98374, quantidade: 0 },
    { name: 'caderno', sku: 827642, quantidade: 0 },
    { name: 'corretivo', sku: 7462, quantidade: 0 },
    { name: 'clipe de papel', sku: 2978264, quantidade: 0 }
]);
const arquivo = ref(null);
const ListaFuncionarios = ref([]);
const itemDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteFuncionarioDialog = ref(false);
const visible = ref(false);
const metaKey = ref(true);
const active = ref(0);
const item = ref({});
const loading = ref(false);

const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

const SalvarProduto = () => {
    if (!(itemsSelecionadosFuncionario.sku === selectedProduct.value.sku)) {
        itemsSelecionadosFuncionario.push(selectedProduct.value);
        selectedProduct.value = {};
        visible.value = false;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Adicionado', life: 3000 });
    } else {
        itemsSelecionadosFuncionario[findIndexById(item.value.sku)] = item.value;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Item atualizado', life: 3000 });
        item.value = {};
        itemDialog.value = false;
    }
};

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
const TempoInicio = ref(null);
const TempoFim = ref(null);

const onRowSelect = (event) => {
    funcionario = event.data;
    setTempo(TempoInicio, funcionario.hora_inicial);
    setTempo(TempoFim, funcionario.hora_final);
    getImagem(funcionario.foto);
    active.value = 1;
    editVisible.value = true;
};
const editItem = (itm) => {
    item.value = { ...itm };
    itemDialog.value = true;
};
const findIndexById = (sku) => {
    let index = 0;
    for (let i = 0; i < itemsSelecionadosFuncionario.length; i++) {
        if (itemsSelecionadosFuncionario[i].sku === sku) {
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
    const remover = itemsSelecionadosFuncionario.findIndex((itm) => itm.sku === item.value.sku);
    if (remover !== -1) {
        itemsSelecionadosFuncionario.splice(remover, 1);
    }
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Deletado', life: 3000 });
    item.value = {};
    deleteProductDialog.value = false;
};
const loadFuncionarios = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        loading.value = true;
        const response = await axios.post('/funcionarios/listar', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        ListaFuncionarios.value = response.data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }finally {
        loading.value = false; 
    }
};

const adicionarFuncionario = async () => {
    const formData = new FormData();
    if (selectedFile.value) {
        const nomeArquivo = `funcionario_${funcionario.nome}_${Date.now()}`;
        formData.append('foto', nomeArquivo);
        formData.append('file', selectedFile.value);
    }
    Object.entries(funcionario).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append('id_cliente', store.userIdCliente);
    try {
        loading.value = true
        const response = await axios.post('/funcionarios/adicionar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar o funcionário:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao criar o usuário', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
};

const fetchCentroCusto = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarcentrocusto', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        centroCustooptions = response.data;
        formatedCentroCustoOptions = centroCustooptions.map((centroCustooptions) => ({
            label: `Centro de Custo ${centroCustooptions.id_centro_custo}`,
            value: centroCustooptions.id_centro_custo
        }));
    } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
    }
};

const fetchSetorDiretoria = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarsetor', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        SetorDiretoriaoptions = response.data;
        formatedSetorOptions = SetorDiretoriaoptions.map((SetorDiretoriaoptions) => ({
            label: `Setor ${SetorDiretoriaoptions.id_setor}`,
            value: SetorDiretoriaoptions.id_setor
        }));
    } catch (error) {
        console.error('Erro ao buscar setores/diretorias:', error);
    }
};

const fetchHieraquiaOptions = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarhierarquia', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        hieraquiaoptions = response.data;
        formatedHierarquiaOptions = hieraquiaoptions.map((hieraquiaoptions) => ({
            label: ` ${hieraquiaoptions.id_funcao}`,
            value: hieraquiaoptions.id_funcao
        }));
    } catch (error) {
        console.error('Erro ao buscar opções de hierarquia:', error);
    }
};
const fetchIdPlanta = async () => {
    const data = {
        id_cliente: store.userIdCliente
    };
    try {
        const response = await axios.post('funcionarios/listarplanta', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        plantasoptions = response.data;
        formatedPlantaOptions = plantasoptions.map((plantasoptions) => ({
            label: `Planta ${plantasoptions.id_planta}`,
            value: plantasoptions.id_planta
        }));
    } catch (error) {
        console.error('Erro ao buscar opções de plantas:', error);
    }
};

watch(
    TempoInicio,
    (newTime) => {
        if (newTime) {
            funcionario.hora_inicial = formatarTempo(newTime);
        } else {
            funcionario.hora_inicial = '';
        }
    },
    { deep: true }
);

watch(
    TempoFim,
    (newTime) => {
        if (newTime) {
            funcionario.hora_final = formatarTempo(newTime);
        } else {
            funcionario.hora_final = '';
        }
    },
    { deep: true }
);

/*resetar informações e botões*/
watch(active, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex === 0) {
        resetForm();
        loadFuncionarios();
        editVisible.value = false;
    }
});

function formatarTempo(time, baseDate = new Date()) {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    const seconds = time.seconds.toString().padStart(2, '0');

    baseDate.setHours(parseInt(hours, 10));
    baseDate.setMinutes(parseInt(minutes, 10));
    baseDate.setSeconds(parseInt(seconds, 10));

    return baseDate.toISOString();
}

const setTempo = (tempoRef, isoString) => {
    const date = new Date(isoString);
    const time = {
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds()
    };
    tempoRef.value = time;
};

const validateForm = () => {
    errors.value = {};
    validateCPF();
    validateEmail();
    return Object.keys(errors.value).length === 0;
};

const validateEmail = () => {
    const email = funcionario.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        errors.value.email = 'E-mail inválido';
    } else {
        errors.value.email = '';
    }
};
const cpfvalidate = () => {
    const cpf = funcionario.CPF;
    if (!cpf || !validateCPF(cpf)) {
        errors.value.CPF = 'CPF inválido';
    } else {
        errors.value.CPF = '';
    }
};
const handleSubmit = () => {
    if (validateForm()) {
        if (editVisible.value) {
            atualizarFuncionario();
        } else {
            adicionarFuncionario();
        }
    }
};

const getImagem = async (filename) => {
    if (filename === '') {
        return imagePlaceholder;
    }
    try {
        const response = await axios.get(`/image/funcionario/${store.userIdCliente}/${filename}`, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        const { image, mimeType } = response.data;
        imageUrl.value = `data:${mimeType};base64,${image}`;
    } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        return imagePlaceholder;
    }
};

onMounted(() => {
    loadFuncionarios();
    fetchCentroCusto();
    fetchSetorDiretoria();
    fetchHieraquiaOptions();
    fetchIdPlanta();
});

const deleteFuncionario = async () => {
    let data = { id_funcionario: funcionario.id_funcionario };
    try {
        loading.value = true
        await axios.post('/funcionarios/deleteFuncionario', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        // const index = ListaFuncionarios.value.findIndex((f) => f.id_funcionario === funcionario.id_funcionario);
        // if (index !== -1) {
        //     ListaFuncionarios.value.splice(index, 1);
        // }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário Deletado', life: 3000 });
        deleteFuncionarioDialog.value = false;
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o funcionário', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
};

const resetForm = () => {
    funcionario.id_funcionario = '';
    funcionario.matricula = '';
    funcionario.nome = '';
    funcionario.biometria = '';
    funcionario.biometria2 = '';
    funcionario.data_admissao = new Date().toDateString();
    funcionario.CPF = '';
    funcionario.RG = '';
    funcionario.CTPS = '';
    funcionario.email = '';
    funcionario.status = '';
    funcionario.hora_inicial = '';
    funcionario.hora_final = '';
    funcionario.id_centro_custo = '';
    funcionario.id_funcao = '';
    funcionario.id_planta = '';
    funcionario.id_setor = '';
    funcionario.segunda = false;
    funcionario.terca = false;
    funcionario.quarta = false;
    funcionario.quinta = false;
    funcionario.sexta = false;
    funcionario.sabado = false;
    funcionario.domingo = false;
    funcionario.itemsSelecionadosFuncionario = [];
    selectedFile.value = null;
    TempoInicio.value = null;
    TempoFim.value = null;
};

const atualizarFuncionario = async () => {
    const formData = new FormData();

    // Adiciona a foto se houver uma selecionada
    if (selectedFile.value) {
        const nomeArquivo = `funcionario_${funcionario.nome}_${Date.now()}`;
        formData.append('foto', nomeArquivo);
        formData.append('file', selectedFile.value);
    }

    // Adiciona os dados do funcionário
    Object.entries(funcionario).forEach(([key, value]) => {
        formData.append(key, value);
    });

    try {
        loading.value = true       
        // Faz a requisição PUT para atualizar o funcionário
        const response = await axios.put(`/funcionarios/atualizar`, formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        // Exibe um toast de sucesso e recarrega a lista de funcionários
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Funcionário atualizado', life: 3000 });
        loadFuncionarios();
        active.value = 0;
        // Reseta o formulário ou faz outra ação necessária
        resetForm();
    } catch (error) {
        // Em caso de erro, exibe um toast de erro
        console.error('Erro ao atualizar o funcionário:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar o funcionário', life: 3000 });
    }finally {
        loading.value = false; // Desativando loading
    }
};

const closeAllDropdowns = () => {
  if (dropdown1.value?.overlayVisible) dropdown1.value.hide();
  if (dropdown2.value?.overlayVisible) dropdown2.value.hide();
  if (dropdown3.value?.overlayVisible) dropdown3.value.hide();
  if (dropdown4.value?.overlayVisible) dropdown4.value.hide();
  if (dropdown5.value?.overlayVisible) dropdown5.value.hide();
};

const handleDatepickerOpen = () => {
  closeAllDropdowns();
};
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Funcionários">
                <div class="col-12">
                    <DataTable :value="ListaFuncionarios" selectionMode="single" stripedRows dataKey="id" :metaKeySelection="false" @rowSelect="onRowSelect">
                        <Column field="nome" header="Nome" class="col-6"></Column>
                        <Column field="matricula" header="Matrícula" class="col-6"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <TabPanel header="Adicionar Funcionário">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <div class="full lg:col-8 md:col-6 sm:col-12">
                                    <label for="name">Nome:</label>
                                    <InputText class="my-2" v-model="funcionario.nome" id="name" type="text"></InputText>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="matricula">Matrícula:</label>
                                    <InputText class="my-2" id="matricula" v-model="funcionario.matricula" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash">Hash 1:</label>
                                    <InputText class="my-2" disabled id="Hash" v-model="funcionario.biometria" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="Hash2">Hash 2:</label>
                                    <InputText class="my-2" disabled id="Hash2" v-model="funcionario.biometria2" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="DataAdmissao">Data de Admissão:</label>
                                    <VueDatePicker class="my-2" v-model="funcionario.data_admissao" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen"/>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="cpf">CPF:</label>
                                    <InputMask class="my-2" v-model="funcionario.CPF" id="cpf" mask="999.999.999-99" :unmask="true" :invalid="!!errors.CPF" @blur="cpfvalidate" />
                                    <small v-if="errors.CPF" class="p-error">{{ errors.CPF }}</small>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="rg">RG:</label>
                                    <InputMask class="my-2" id="rg" v-model="funcionario.RG" mask="99.999.999-*" :unmask="true" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="ctps">CTPS:</label>
                                    <InputMask class="my-2" id="ctps" v-model="funcionario.CTPS" mask="9999999/9999" :unmask="true" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="email">E-mail:</label>
                                    <InputText class="my-2" id="email" v-model="funcionario.email" :invalid="!!errors.email" @blur="validateEmail" />
                                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="perfil">Centro de Custo:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_centro_custo" :options="formatedCentroCustoOptions" 
                                    optionLabel="label" optionValue="value" placeholder="Selecione Um " ref="dropdown1" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="planta">Planta:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_planta" :options="formatedPlantaOptions" 
                                    optionLabel="label" optionValue="value" placeholder="Selecione a Planta" ref="dropdown2"/>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="setor">Setor/Diretoria:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_setor" :options="formatedSetorOptions" 
                                    optionLabel="label" optionValue="value" placeholder="Selecione o Setor" 
                                    ref="dropdown3"/>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label class="ajustetexto" for="funcao">Função/Nível Hierárquico:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_funcao" :options="formatedHierarquiaOptions" 
                                    optionLabel="label" optionValue="value" placeholder="Selecione a Função" ref="dropdown4"/>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="status">Status:</label>
                                    <Dropdown class="my-2" id="status" v-model="funcionario.status" :options="status" 
                                    optionLabel="label" optionValue="value" placeholder="Escolha um" ref="dropdown5"></Dropdown>
                                </div>
                                <!-- primeira parte do nested -->
                                <div class="p-fluid formgrid grid nested-grid lg:col-8 md:col-6 sm:4 p-0 pt-1">
                                    <div class="full lg:col-6 md:col-6 sm:col-6">
                                        <label for="inicio">Hora Início:</label>
                                        <VueDatePicker class="my-2" v-model="TempoInicio" time-picker  disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>
                                    <div class="full lg:col-6 md:col-6 sm:col-6">
                                        <label for="inicio">Hora Fim:</label>
                                        <VueDatePicker class="my-2" id="inicio" v-model="TempoFim" time-picker  disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>

                                    <Fieldset
                                        legend="Selecione os dias que o funcionário poderá retirar os
                                        Itens:"
                                        class="p-1 lg:col-12 md:col-12 sm:col-12"
                                    >
                                        <label for="fim"></label>
                                        <div id="fim" class="checkbox-container flex align-content-end flex-wrap">
                                            <div class="checkbox-items m-2 flex align-items-end">
                                                <Checkbox v-model="funcionario.segunda" inputId="Segunda" name="Dias" value="Segunda" :binary="true" />
                                                <label for="Segunda" class="ml-2"> Segunda-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.terca" inputId="Terca" name="Dias" value="Terca" :binary="true" />
                                                <label for="Terca" class="ml-2"> Terça-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quarta" inputId="Quarta" name="Dias" value="Quarta" :binary="true" />
                                                <label for="Quarta" class="ml-2"> Quarta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.quinta" inputId="Quinta" name="Dias" value="Quinta" :binary="true" />
                                                <label for="Quinta" class="ml-2"> Quinta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sexta" inputId="Sexta" name="Dias" value="Sexta" :binary="true" />
                                                <label for="Sexta" class="ml-2"> Sexta-Feira </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.sabado" inputId="Sabado" name="Dias" value="Sabado" :binary="true" />
                                                <label for="Sabado" class="ml-2"> Sábado </label>
                                            </div>
                                            <div class="checkbox-items m-2 flex align-items-center">
                                                <Checkbox v-model="funcionario.domingo" inputId="Domingo" name="Dias" value="Domingo" :binary="true" />
                                                <label for="Domingo" class="ml-2"> Domingo</label>
                                            </div>
                                        </div>
                                    </Fieldset>
                                </div>

                                <div class="full mx-auto lg:col-4 md:col-6 sm:col-12 ml-2 ml-2 p-0">
                                    <ImageUpload @fileSelected="handleFileSelected" :externalImages="imageUrl" />
                                </div>
                            </div>
                            <div class="grid justify-content-end flex-wrap mt-8">
                                <Button v-if="editVisible" style="width: 15%;" class="buttons flex align-items-center justify-content-center m-2" label="Atualizar" icon="pi pi-refresh" severity="primary" @click="atualizarFuncionario" />
                                <Button v-if="editVisible" style="width: 15%;" class="buttons flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteFuncionarioDialog = true" />

                                <Button v-if="!editVisible" style="width: 15%;" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="handleSubmit" />
                            </div>
                            <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                            <div class="col-12">
                                <TabView>
                                    <TabPanel header="Itens do Setor">
                                        <DataTable class="" :value="ItensSetorDev" stripedRows dataKey="sku" v-model="funcionario.itemsSelecionadosSetor">
                                            <Column field="name" header="Nome"></Column>
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column field="prazo" header="Prazo"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <TabPanel header="Itens do Funcionario">
                                        <Button class="m-1" label="Adicionar Itens" @click="visible = true" />
                                        <!--data table que exibe os items adicionados-->
                                        <DataTable class="mt-3" :value="itemsSelecionadosFuncionario" tableStyle="min-width: 50rem" stripedRows dataKey="sku">
                                            <Column field="name" header="Nome"></Column>
                                            <Column field="sku" header="SKU"></Column>
                                            <Column field="quantidade" header="Quantidade"></Column>
                                            <Column style="min-width: 8rem">
                                                <template #body="slotProps">
                                                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                                                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
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
        <Dialog v-model:visible="itemDialog" :style="{ width: '450px' }" header="Edição do Item" :modal="true" class="p-fluid">
            <div>
                <div class="p-fluid formgrid grid">
                    <div class="field lg:col-12 md:col-6 sm:col-4">
                        <label for="name">Nome:</label>
                        <InputText disabled v-model="item.name" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-4">
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
        <Dialog v-model:visible="visible" modal header="Adicionar Itens do Funcionário">
            <div class="grid">
                <div class="col-12">
                    <label for="Produto" class="mr-2 font-semibold col-2">Produto: </label>
                    <Dropdown v-model="selectedProduct" :options="ItensSetorAdm" optionLabel="name" placeholder="Selecione um produto" class="col-8 p-0" />
                </div>
                <div class="col-12">
                    <label for="Quantidade" class="font-semibold w-6rem mr-2">Quantidade: </label>
                    <InputNumber id="Quantidade" v-model="selectedProduct.quantidade" inputClass="col-3" autocomplete="off" :min="1" :max="999" />
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
                <span v-if="item"
                    >Você tem certeza que quer deletar o Item <b>{{ item.name }}</b> ?</span
                >
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Sim" icon="pi pi-check" text @click="deleteProduct" />
            </template>
        </Dialog>
        <Dialog header="Deletar Funcionário" v-model:visible="deleteFuncionarioDialog" style="width: 400px" :modal="true" :closable="false">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-1" style="font-size: 2rem"></i>
                <span class="">
                    Você tem certeza que deseja deletar o funcionário <b>{{ funcionario.id_funcionario }}</b> - <b>{{ funcionario.nome }}</b> ?</span
                >
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" @click="deleteFuncionarioDialog = false" class="p-button-text" />
                <Button label="Sim" icon="pi pi-check" @click="deleteFuncionario" class="p-button-text" />
            </template>
        </Dialog>
        <LoadingSpinner v-if="loading" />
    </div>
</template>
<style>
.input-slot-image {
    height: 20px;
    width: auto;
    margin-left: 5px;
}

.p-error {
    color: red;
}

.ajustetexto {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block; /* Garantir que o label se comporte corretamente dentro de um grid */
}

.checkbox-container {
    display: flex;
}

.checkbox-items {
    width: 40%; /* Metade da largura do contêiner para duas colunas */
    margin-bottom: 10px; /* Espaçamento entre as linhas */
}

.nested-grid {
    padding: 10px;
}

.buttons {
    width: 100px;
}


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
