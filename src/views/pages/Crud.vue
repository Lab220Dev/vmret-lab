<script setup>
/**
 * Importações necessárias para o funcionamento do componente.
 *
 * @module
 */

// Importa os modos de correspondência de filtro para a tabela de dados.
import { FilterMatchMode } from 'primevue/api';

// Importa funções do Vue: 'ref' para reatividade, 'onMounted' e 'onBeforeMount' para hooks de ciclo de vida.
import { ref, onMounted, onBeforeMount } from 'vue';

// Importa o serviço que lida com dados de produtos.
import { RetiradasService } from '@/service/RetiradasService';

// Importa a função de notificação (toast).
import { useToast } from 'primevue/usetoast';

// Inicializa a função toast para exibir mensagens.
const toast = useToast(); // Cria uma instância do toast, usado para mostrar notificações ao usuário.

// Define as variáveis reativas para o gerenciamento do estado.
const products = ref(null); // Armazena a lista de produtos.
const productDialog = ref(false); // Controle de exibição do modal de edição de produto.
const deleteProductDialog = ref(false); // Controle de exibição do modal de exclusão de produto.
const deleteProductsDialog = ref(false); // Controle de exibição do modal de exclusão de múltiplos produtos.
const product = ref({}); // Armazena os dados de um produto específico.
const selectedProducts = ref(null); // Armazena os produtos selecionados.
const dt = ref(null); // Referência para o DataTable para exportação.
const filters = ref({}); // Filtros de pesquisa na tabela.
const submitted = ref(false); // Controle de envio de formulário.
const statuses = ref([
    // Status possíveis de um produto.
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

// Instancia o serviço de produtos.
const RetiradasService = new RetiradasService(); // Cria uma instância do serviço RetiradasService para manipulação dos dados de produtos.

/**
 * Função que retorna a severidade do badge (ícone) de acordo com o status do estoque.
 * Dependendo do status do produto no estoque, a severidade do badge muda.
 *
 * @param {string} inventoryStatus - Status do estoque do produto.
 * @returns {string} - Severidade que define o ícone exibido.
 */
const getBadgeSeverity = (inventoryStatus) => {
    switch (
        inventoryStatus.toLowerCase() // Converte o status para minúsculo para evitar discrepâncias de maiúsculas/minúsculas.
    ) {
        case 'instock': // Se o produto estiver em estoque.
            return 'success'; // Severidade "sucesso" para produtos em estoque.
        case 'lowstock': // Se o produto estiver com estoque baixo.
            return 'warning'; // Severidade "aviso" para estoque baixo.
        case 'outofstock': // Se o produto estiver fora de estoque.
            return 'danger'; // Severidade "perigo" para produtos fora de estoque.
        default: // Caso o status seja desconhecido ou não esteja especificado.
            return 'info'; // Severidade "informação" por padrão.
    }
};

/**
 * Hook do Vue que é executado antes de o componente ser montado.
 * Utiliza-se deste hook para inicializar filtros de pesquisa.
 */
onBeforeMount(() => {
    initFilters(); // Inicializa os filtros de pesquisa com valores padrões.
});

/**
 * Hook do Vue que é executado após o componente ser montado.
 * Aqui, recupera-se os produtos utilizando o serviço RetiradasService.
 */
onMounted(() => {
    // Recupera os produtos do serviço quando o componente é montado.
    RetiradasService
        .getProducts()
        .then((data) => (products.value = data)) // O método getProducts retorna os produtos e os armazena em 'products'.
        .catch((error) => {
            // Caso ocorra um erro ao buscar os produtos.
            console.error('Erro ao carregar produtos:', error); // Exibe erro no console.
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos.', life: 3000 }); // Exibe um toast de erro.
        });
});

/**
 * Função para formatar os valores de preço como moeda.
 * Converte um valor numérico para o formato de moeda.
 *
 * @param {number} value - O valor numérico que representa o preço do produto.
 * @returns {string} - O valor formatado como uma string de moeda.
 */
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); // Formata o valor como uma string de moeda no formato USD.
};

/**
 * Função para abrir o modal de criação de um novo produto.
 * Reseta o formulário e exibe o modal de produto.
 */
const openNew = () => {
    product.value = {}; // Limpa o objeto do produto para um novo produto.
    submitted.value = false; // Reseta o estado de envio do formulário.
    productDialog.value = true; // Exibe o modal de produto.
};

/**
 * Função para esconder o modal de edição de produto.
 * Fecha o modal e reseta o estado de envio do formulário.
 */
const hideDialog = () => {
    productDialog.value = false; // Fecha o modal de produto.
    submitted.value = false; // Reseta o estado de envio do formulário.
};

/**
 * Função para salvar ou editar um produto.
 * Se o produto já existe (tem ID), ele será editado; caso contrário, um novo produto será criado.
 */
const saveProduct = () => {
    submitted.value = true; // Marca o formulário como enviado.
    // Verifica se o nome e o preço do produto estão presentes.
    if (product.value.name && product.value.name.trim() && product.value.price) {
        if (product.value.id) {
            // Se o produto já tem um ID, significa que é uma edição.
            product.value.inventoryStatus = product.value.inventoryStatus.value ? product.value.inventoryStatus.value : product.value.inventoryStatus; // Atualiza o status de inventário.
            products.value[findIndexById(product.value.id)] = product.value; // Atualiza o produto na lista de produtos.
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 }); // Exibe um toast de sucesso.
        } else {
            // Se o produto não tem um ID, significa que é um novo produto.
            product.value.id = createId(); // Gera um ID único para o novo produto.
            product.value.code = createId(); // Gera um código único para o novo produto.
            product.value.image = 'product-placeholder.svg'; // Define uma imagem padrão para o novo produto.
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus.value : 'INSTOCK'; // Define o status de inventário (padrão 'INSTOCK').
            products.value.push(product.value); // Adiciona o novo produto à lista de produtos.
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 }); // Exibe um toast de sucesso.
        }
        productDialog.value = false; // Fecha o modal de produto após salvar.
        product.value = {}; // Limpa os dados do produto após salvar.
    } else {
        // Se o nome ou o preço não estiverem presentes, exibe uma mensagem de erro.
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Nome e preço são obrigatórios.', life: 3000 });
    }
};

/**
 * Função para editar um produto existente.
 * Abre o modal de edição e carrega os dados do produto a ser editado.
 *
 * @param {Object} editProduct - O produto a ser editado.
 */
const editProduct = (editProduct) => {
    product.value = { ...editProduct }; // Copia os dados do produto para 'product'.
    productDialog.value = true; // Exibe o modal de edição.
};

/**
 * Função para confirmar a exclusão de um produto.
 * Abre o modal de confirmação de exclusão do produto.
 *
 * @param {Object} editProduct - O produto a ser excluído.
 */
const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct; // Armazena o produto a ser excluído.
    deleteProductDialog.value = true; // Exibe o modal de confirmação de exclusão.
};

/**
 * Função para excluir um produto.
 * Remove o produto da lista e exibe um toast de sucesso.
 */
const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id); // Remove o produto da lista.
    deleteProductDialog.value = false; // Fecha o modal de confirmação de exclusão.
    product.value = {}; // Limpa os dados do produto.
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 }); // Exibe um toast de sucesso.
};

/**
 * Função para encontrar o índice de um produto por ID.
 * Retorna o índice do produto na lista ou -1 se o produto não for encontrado.
 *
 * @param {string} id - O ID do produto a ser encontrado.
 * @returns {number} - O índice do produto na lista ou -1 se não encontrado.
 */
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i; // Encontrou o produto, salva o índice.
            break; // Sai do loop, pois o produto já foi encontrado.
        }
    }
    return index; // Retorna o índice ou -1 se não encontrado.
};

/**
 * Função para gerar um ID único aleatório para o produto.
 * Utiliza caracteres alfanuméricos para criar um ID.
 *
 * @returns {string} - O ID único gerado.
 */
const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Caracteres possíveis para o ID.
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length)); // Gera um ID aleatório.
    }
    return id; // Retorna o ID gerado.
};

/**
 * Função para exportar os produtos para CSV.
 * Utiliza o método exportCSV do DataTable para exportar os dados da lista de produtos.
 */
const exportCSV = () => {
    dt.value.exportCSV(); // Chama a função exportCSV do DataTable para exportar os dados.
};

/**
 * Função para confirmar a exclusão de produtos selecionados.
 * Abre o modal de confirmação de exclusão de múltiplos produtos.
 */
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true; // Abre o modal de confirmação para exclusão de múltiplos produtos.
};

/**
 * Função para excluir os produtos selecionados.
 * Remove os produtos selecionados da lista e exibe um toast de sucesso.
 */
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val)); // Filtra os produtos selecionados e os remove da lista.
    deleteProductsDialog.value = false; // Fecha o modal de exclusão.
    selectedProducts.value = null; // Limpa os produtos selecionados.
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 }); // Exibe um toast de sucesso.
};

/**
 * Função para inicializar os filtros de pesquisa.
 * Configura o filtro global para "CONTAINS" (contém).
 */
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Inicializa o filtro global de pesquisa para "CONTAINS" (contém).
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <!-- Botão para adicionar novo produto -->
                            <Button label="New" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            <!-- Botão para excluir produtos selecionados -->
                            <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <!-- Tabela de produtos -->
                <DataTable
                    ref="dt"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                >
                    <!-- A tabela exibe os dados provenientes de 'products' -->
                    <!-- A seleção de produtos será vinculada à variável 'selectedProducts' -->
                    <!-- A tabela está configurada para exibir 10 linhas por página e suporta paginação -->
                    <!-- O template de paginação exibe links para navegar entre as páginas e escolher o número de linhas por página -->
                    <!-- O relatório de página atual exibe informações sobre o intervalo de itens e o total de produtos -->

                    <!-- Cabeçalho da tabela -->
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Products</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <!-- Definição das colunas da tabela -->
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="code" header="Code" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="'/demo/images/product/' + slotProps.data.image" :alt="slotProps.data.image" class="shadow-2" width="100" />
                        </template>
                    </Column>
                    <Column field="price" header="Price" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.price) }}
                        </template>
                    </Column>
                    <Column field="category" header="Category" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.category }}
                        </template>
                    </Column>
                    <Column field="rating" header="Reviews" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <Tag :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Tag>
                        </template>
                    </Column>
                    <!-- Ações -->
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <!-- Modal de edição de produto -->
                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details" :modal="true" class="p-fluid" :draggable="false">
                    <img :src="'/demo/images/product/' + product.image" :alt="product.image" v-if="product.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field">
                        <label for="name">Name</label>
                        <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" />
                        <small class="p-invalid" v-if="submitted && !product.name">Name is required.</small>
                    </div>
                    <div class="field">
                        <label for="description">Description</label>
                        <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" />
                    </div>

                    <div class="field">
                        <label for="inventoryStatus" class="mb-3">Inventory Status</label>
                        <Dropdown id="inventoryStatus" v-model="product.inventoryStatus" :options="statuses" optionLabel="label" placeholder="Select a Status">
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.value">
                                    <span :class="'product-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                </div>
                                <div v-else-if="slotProps.value && !slotProps.value.value">
                                    <span :class="'product-badge status-' + slotProps.value.toLowerCase()">{{ slotProps.value }}</span>
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="field">
                        <label class="mb-3">Category</label>
                        <div class="formgrid grid">
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category1" name="category" value="Accessories" v-model="product.category" />
                                <label for="category1">Accessories</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category2" name="category" value="Clothing" v-model="product.category" />
                                <label for="category2">Clothing</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category3" name="category" value="Electronics" v-model="product.category" />
                                <label for="category3">Electronics</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="category4" name="category" value="Fitness" v-model="product.category" />
                                <label for="category4">Fitness</label>
                            </div>
                        </div>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="price">Price</label>
                            <InputNumber id="price" v-model="product.price" mode="currency" currency="USD" locale="en-US" :invalid="submitted && !product.price" :required="true" />
                            <small class="p-invalid" v-if="submitted && !product.price">Price is required.</small>
                        </div>
                        <div class="field col">
                            <label for="quantity">Quantity</label>
                            <InputNumber id="quantity" v-model="product.quantity" integeronly />
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveProduct" />
                    </template>
                </Dialog>

                <!-- Modal de confirmação de exclusão do produto -->
                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true" :draggable="false">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
                    </template>
                </Dialog>

                <!-- Modal de confirmação de exclusão dos produtos selecionados -->
                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true" :draggable="false">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
