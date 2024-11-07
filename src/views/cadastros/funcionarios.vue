<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/axios.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { FilterMatchMode } from 'primevue/api';
import imagePlaceholder from '@/assets/images/placeholder4.1.png';
import clockurl from '@/assets/images/OIP.png';
import { useAuthStore } from '@/store/authStore.js';
import ImageUpload from '@/components/ImageUpload.vue';
import { isValid as validateCPF } from 'cpf-validator';
import { useDataStore } from '@/store/dataStore.js';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const store = useAuthStore();
const dataStore = useDataStore();

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
let centroCusto = ref([]);
let setor = ref([]);
let hieraquiaoptions = ref([]);
let formatedHierarquiaOptions = ref([]);
let plantas = ref([]);
let funcionario = reactive({
    id_funcionario: '',
    matricula: '',
    senha:'',
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
    nomearquivo: '',
    itens: []
});
const ListaProdutos = ref([]);
const ListaProdutoFuncionario = ref([]);
const ListaItemsSetor = ref([]);
const editVisible = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const selectedProduct = ref({
    id_produto: null,
    nome: '',
    sku: '',
    quantidade: 1
});
const itemsSelecionadosFuncionario = ref([]);
const arquivo = ref(null);
const ListaFuncionarios = ref([]);
const itemDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteFuncionarioDialog = ref(false);
const visible = ref(false);
const metaKey = ref(true);
const active = ref(0);
const items = ref({});
const loading = ref(false);

const dropdown1 = ref(null);
const dropdown2 = ref(null);
const dropdown3 = ref(null);
const dropdown4 = ref(null);
const dropdown5 = ref(null);

const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
const TempoInicio = ref(null);
const TempoFim = ref(null);

const onRowSelect = async (event) => {
    funcionario = event.data;
    ListaProdutoFuncionario.value = funcionario.itens.map((item) => ({
        ...item,
        action: 'new'
    }));
    setTempo(TempoInicio, funcionario.hora_inicial);
    setTempo(TempoFim, funcionario.hora_final);
    await fetchItensSetor(funcionario.id_setor);
    await getImagem(funcionario.foto);
    //await listarProduto();
    active.value = 1;
    editVisible.value = true;
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
        console.error('Erro ao carregar funcionários:', error);
    } finally {
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
    formData.append('id_usuario', store.userId);
    try {
        loading.value = true;
        const response = await axios.post('/funcionarios/adicionar', formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário criado', life: 3000 });
        dataStore.invalidateFuncionariosCache();
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao adicionar o funcionário:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao criar o usuário', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};
const loadData = async () => {
    try {
        plantas = dataStore.plantas || await dataStore.fetchPlantas();
        setor = dataStore.setores || await dataStore.fetchSetores();
        centroCusto = dataStore.cdcs || await dataStore.fetchCdc();
        ListaProdutos.value = dataStore.produtos || await dataStore.fetchProdutos();
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
};

const fetchItensSetor = async (id_setor) => {
    const data = {
        id_cliente: store.userIdCliente,
        id_setor: id_setor
    };
    try {
        const response = await axios.post('Setor/itensdisponiveissetor', data);
        ListaItemsSetor.value = response.data;
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
    cpfvalidate();
    validateEmail();
    console.log(errors.value);
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
    loadData();
    loadFuncionarios();
     fetchHieraquiaOptions();
});

const deleteFuncionario = async () => {
    let data = { id_funcionario: funcionario.id_funcionario, id_usuario: store.userId };
    try {
        loading.value = true;
        await axios.post('/funcionarios/deleteFuncionario', data, {
            headers: {
                Authorization: `Bearer ${store.token}`
            }
        });
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Funcionário Deletado', life: 3000 });
        dataStore.invalidateFuncionariosCache();
        deleteFuncionarioDialog.value = false;
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Erro ao deletar o funcionário', life: 3000 });
    } finally {
        loading.value = false; // Desativando loading
    }
};

const resetForm = () => {
    funcionario.id_funcionario = '';
    funcionario.matricula = '';
    funcionario.nome = '';
    funcionario.senha = '';
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

const SalvarProduto = () => {
    if (!selectedProduct.value.id_produto || !selectedProduct.value.quantidade) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecione um produto e quantidade', life: 3000 });
        return;
    }

    const index = funcionario.itens.findIndex((i) => i.id_produto === selectedProduct.value.id_produto);

    if (index !== -1) {
        funcionario.itens[index] = {
            ...selectedProduct.value,
            action: 'update'
        };
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item atualizado com sucesso!', life: 3000 });
    } else {
        funcionario.itens.push({
            ...selectedProduct.value,
            action: 'new'
        });
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Novo item adicionado com sucesso!', life: 3000 });
    }
    selectedProduct.value = { id_produto: '', nome: '', sku: '', quantidade: 1 };

    visible.value = false;
    if (itemDialog.value) {
        itemDialog.value = false;
    }
};

const editItem = (selectedItem) => {
    selectedProduct.value = { ...selectedItem };
    itemDialog.value = true;
};

const atualizarFuncionario = async () => {
    const formData = new FormData();

    if (selectedFile.value) {
        const fileExtension = selectedFile.value.name.split('.').pop(); // Obtém a extensão do arquivo
        const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExtension}`;

        formData.append('foto', nomeArquivo);
        formData.append('file', selectedFile.value);
        formData.append('remove_old_photo', true);
    } else {
        formData.append('foto', funcionario.foto);
    }

    const { foto, itens, ...restOfFuncionario } = funcionario;

    // Remove itens duplicados antes de enviar
    const itensUnicos = Array.from(new Set(itens.map((item) => item.id_produto))) // Remove duplicados com base no id_produto
        .map((id_produto) => itens.find((item) => item.id_produto === id_produto)); // Mapeia os itens únicos de volta

    // Adiciona os itens únicos ao FormData
    formData.append('itens', JSON.stringify(itensUnicos));

    // Adiciona as demais propriedades do funcionário, incluindo a foto se ela estiver no `restOfFuncionario`
    Object.entries(restOfFuncionario).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append('id_usuario', store.userId);

    try {
        loading.value = true;
        const response = await axios.put(`/funcionarios/atualizar`, formData, {
            headers: {
                Authorization: `Bearer ${store.token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Funcionário atualizado', life: 3000 });
        dataStore.invalidateFuncionariosCache();
        loadFuncionarios();
        active.value = 0;
        resetForm();
    } catch (error) {
        console.error('Erro ao atualizar o funcionário:', error);
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar o funcionário', life: 3000 });
    } finally {
        loading.value = false;
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
const confirmDeleteProduct = (item) => {
    selectedProduct.value = { ...item };
    deleteProductDialog.value = true;
};
const deleteProduct = () => {
    const index = funcionario.itens.findIndex((i) => i.id_produto === selectedProduct.value.id_produto);

    if (index !== -1) {
        funcionario.itens[index].action = 'delete';
        //ListaProdutoFuncionario.value = funcionario.itens.filter(i => i.action !== 'delete');
    }
    selectedProduct.value = { id_produto: '', nome: '', sku: '', quantidade: 1 };
    deleteProductDialog.value = false;
};

const hideDialog = () => {
    itemDialog.value = false;
    deleteProductDialog.value = false;
};
</script>

<template>
    <div class="card vh">
        <TabView v-model:activeIndex="active">
            <TabPanel header="Listar Funcionários">
                <div class="col-12 ">
                    <DataTable
                        v-model:filters="filters"
                        :value="ListaFuncionarios"
                        selectionMode="single"
                        stripedRows
                        paginator
                        removableSort
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :rows="10"
                        dataKey="id"
                        :sortField="'matricula'"  
                        :sortOrder="1"
                        :globalFilterFields="['nome', 'matricula']"
                        :metaKeySelection="false"
                        @rowSelect="onRowSelect"
                    >
                        <template #header>
                            
                            <div class="flex justify-content-between align-items-center mb-4">
                                <div class="font-semibold">
                        <span>Total de registros: {{ ListaFuncionarios.length }}</span>
                    </div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" placeholder="Busca" />
                                    </IconField>
                            </div>
                        </template>

                        <Column field="nome" sortable header="Nome" class="col-6"></Column>
                        <Column field="matricula" sortable header="Matrícula" class="col-6"></Column>
                    </DataTable>
                </div>
            </TabPanel>

            <TabPanel :header="editVisible ? 'Editar Funcionário' : 'Adicionar Funcionário'">
                <div class="grid">
                    <div class="col-12">
                        <div class="card">
                            <!--form de cadastro de novo funcionario-->
                            <div class="p-fluid formgrid grid m-0 p-0">
                                <div class="full lg:col-8 md:col-6 sm:col-12">
                                    <label for="name">Nome:</label>
                                    <InputText class="my-2" v-model="funcionario.nome" id="name" type="text"> </InputText>
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="matricula">Matrícula:</label>
                                    <InputText class="my-2" id="matricula" v-model="funcionario.matricula" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="senha">Senha:</label>
                                    <InputText type="password" class="my-2" id="senha" v-model="funcionario.senha" />
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
                                    <VueDatePicker class="my-2" v-model="funcionario.data_admissao" showIcon :showOnFocus="false" :format="format" locale="pt-BR" auto-apply :enable-time-picker="false" @open="handleDatepickerOpen" />
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
                                    <Dropdown class="my-2" v-model="funcionario.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" placeholder="Selecione Um " ref="dropdown1" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="planta">Planta:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_planta" :options="plantas" optionLabel="label" optionValue="value" placeholder="Selecione a Planta" ref="dropdown2" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="setor">Setor/Diretoria:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_setor" :options="setor" optionLabel="label" optionValue="value" placeholder="Selecione o Setor" ref="dropdown3" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label class="ajustetexto" for="funcao">Função/Nível Hierárquico:</label>
                                    <Dropdown class="my-2" v-model="funcionario.id_funcao" :options="formatedHierarquiaOptions" optionLabel="label" optionValue="value" placeholder="Selecione a Função" ref="dropdown4" />
                                </div>
                                <div class="full lg:col-4 md:col-6 sm:col-12">
                                    <label for="status">Status:</label>
                                    <Dropdown class="my-2" id="status" v-model="funcionario.status" :options="status" optionLabel="label" optionValue="value" placeholder="Escolha um" ref="dropdown5"></Dropdown>
                                </div>
                                 <div class="full lg:col-4 md:col-6 sm:col-12">
                                        <label for="inicio">Hora Início:</label>
                                        <VueDatePicker class="my-2" v-model="TempoInicio" time-picker disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>
                                    <div class="full lg:col-4 md:col-6 sm:col-12">
                                        <label for="inicio">Hora Fim:</label>
                                        <VueDatePicker class="my-2" id="inicio" v-model="TempoFim" time-picker disable-time-range-validation>
                                            <template #input-icon>
                                                <img class="input-slot-image" :src="clockurl" />
                                            </template>
                                        </VueDatePicker>
                                    </div>
                                <!-- primeira parte do nested -->
                                <div class="p-fluid formgrid grid nested-grid lg:col-8 md:col-6 sm:4 p-0 pt-1">
                                   
                                    <Fieldset
                                        legend="Selecione os dias que o funcionário poderá retirar os
                                        Itens:"
                                        class="mt-5 p-1 lg:col-12 md:col-12 sm:col-12"
                                    >
                                        <label for="fim"></label>
                                        <div id="fim" class="checkbox-container flex align-content-end flex-wrap mx-4">
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
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="primary" @click="atualizarFuncionario" />
                                <Button v-if="editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Excluir" icon="pi pi-trash" severity="danger" @click="deleteFuncionarioDialog = true" />

                                <Button v-if="!editVisible" style="width: 15%" class="buttons flex align-items-center justify-content-center m-2" label="Salvar" icon="pi pi-check" severity="info" @click="adicionarFuncionario()" />
                            </div>
                            <!--Datatables com os items do setor + os que o funcionario pode retirar-->
                            <div class="col-12">
                                <TabView>
                                    <TabPanel header="Itens do Setor">
                                        <DataTable class=""
                                        v-model:filters="filters" :value="ListaItemsSetor" stripedRows 
                                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        :globalFilterFields="['nome', 'sku', 'qtd_limite']"
                                        dataKey="sku">

                                        <template #header>
                            <div class="flex justify-content-end align-items-center mb-2">
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

                                            <Column field="nome" sortable style="width:45%"  header="Nome"></Column>
                                            <Column field="sku" sortable header="SKU"></Column>
                                            <Column field="qtd_limite" header="Quantidade"></Column>
                                        </DataTable>
                                    </TabPanel>
                                    <TabPanel header="Itens do Funcionario">
                                        <Button class="mt-3 justify-content-end" label="Adicionar Itens" @click="visible = true" />
                                        <DataTable
                                            class="mt-3"
                                            v-model:filters="filters"
                                            :value="funcionario.itens.filter((i) => i.action !== 'delete')"
                                            paginator
                                            :rows="10"
                                            :sortField="'sku'" 
                                            :rowsPerPageOptions="[5, 10, 20, 50]"
                                            :globalFilterFields="['nome_produto', 'sku', 'quantidade']"
                                            tableStyle="min-width: 50rem"
                                            stripedRows
                                            dataKey="id_item_funcionario"
                                        >
                                            <template #header>
                                                <div class="flex justify-content-end align-items-center mb-4">
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
                                            <Column field="nome_produto" sortable style="width:45%" header="Nome"></Column>
                                            <Column field="sku" sortable header="SKU"></Column>
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
                        <InputText disabled v-model="selectedProduct.nome_produto" id="name" type="text"></InputText>
                    </div>
                    <div class="field lg:col-4 md:col-6 sm:col-4">
                        <label for="Quantidade">Quantidade</label>
                        <InputText id="Quantidade" v-model="selectedProduct.quantidade" />
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
                    <Dropdown v-model="selectedProduct" :options="ListaProdutos" optionLabel="label" optionValue="value" placeholder="Selecione um produto" class="col-8 p-0" />
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
                <span v-if="selectedProduct.id_produto"
                    >Você tem certeza que quer deletar o Item <b>{{ selectedProduct.nome_produto }}</b> ?</span
                >
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" text @click="hideDialog()" />
                <Button label="Sim" icon="pi pi-check" text @click="deleteProduct()" />
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
    display: block;
    /* Garantir que o label se comporte corretamente dentro de um grid */
}

.checkbox-container {
    display: flex;
}

.checkbox-items {
    width: 40%;
    /* Metade da largura do contêiner para duas colunas */
    margin-bottom: 10px;
    /* Espaçamento entre as linhas */
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
