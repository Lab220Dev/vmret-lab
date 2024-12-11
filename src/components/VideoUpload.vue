<template>
    <div>
        <h2>Uploads Regulares</h2>
        
        <!-- Tabela que exibe a lista de DMs e vídeos associados -->
        <DataTable :value="dmOptions" responsiveLayout="scroll">
            <Column field="Identificacao" header="DM"></Column>
            <Column field="Video" header="Vídeo Associado"></Column>
            
            <!-- Coluna de Ações: Editar DM -->
            <Column header="Ações">
                <template #body="slotProps">
                    <!-- Botão de Editar: Exibe o diálogo de associar vídeo -->
                    <Button label="Editar" icon="pi pi-pencil" class="p-button-sm p-button-warning" @click="editDM(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Diálogo para associar vídeo -->
        <Dialog v-model:visible="showDialog" header="Associar Vídeo" :closable="false">
            <form @submit.prevent="uploadVideo">
                <!-- Campo de seleção de arquivo (oculto) -->
                <input type="file" accept="video/mp4" ref="fileInput" @change="handleFile" style="display: none" />
                
                <!-- Botão para abrir o seletor de arquivos -->
                <Button label="Selecionar Arquivo" icon="pi pi-folder-open" @click="triggerFileInput" />
                
                <!-- Pré-visualização do vídeo selecionado -->
                <video id="video-preview" controls v-show="selectedFile" width="240" height="200" class="mt-2" />
                
                <div v-if="selectedFile">
                    <p><strong>Arquivo Selecionado:</strong> {{ selectedFile.name }}</p>
                </div>
                
                <!-- Botões de ação para salvar ou cancelar -->
                <div class="button-group">
                    <Button label="Salvar" icon="pi pi-check" class="p-button-sm p-button-success" :disabled="!selectedFile || isUploading" @click="uploadVideo" />
                    <Button label="Cancelar" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />
                </div>
            </form>
        </Dialog>

        <!-- Spinner de carregamento enquanto o vídeo está sendo enviado -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'; // Funções do Vue para reatividade e manipulação de props
import axios from '@/axios.js'; // Importa o axios para realizar requisições HTTP
import { useToast } from 'primevue/usetoast'; // Biblioteca para exibição de notificações
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa a função de toast para exibir notificações

// Propriedades recebidas pelo componente, espera uma lista de DMs
const props = defineProps({
    dmList: Array // Recebe a lista de DMs (Dispositivos de Mídia) como prop
});

// Computed para mapear as DMs para a tabela
const dmOptions = computed(() => props.dmList);

// Variáveis reativas
const loading = ref(false); // Flag de carregamento
const emit = defineEmits(['update-video']); // Emissão de evento para o componente pai
const showDialog = ref(false); // Controle de exibição do diálogo
const selectedDM = ref(null); // DM selecionada para associar o vídeo
const fileInput = ref(null); // Ref para o input de arquivo
const selectedFile = ref(null); // Arquivo de vídeo selecionado
const uploadProgress = ref(0); // Progresso do upload
const isUploading = ref(false); // Flag de upload em andamento
const toast = useToast(); // Toast para exibição de notificações

// Função chamada ao clicar em Editar DM, abre o diálogo
const editDM = (dm) => {
    selectedDM.value = dm;
    showDialog.value = true;
};

// Função que simula o clique no campo de seleção de arquivos
const triggerFileInput = () => {
    fileInput.value.click();
};

// Função para tratar o arquivo selecionado
const handleFile = (event) => {
    const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

    // Verificação de DM selecionada antes de permitir upload
    if (!selectedDM.value) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Selecione uma DM antes de adicionar arquivos.',
            life: 3000
        });
        return;
    }

    // Validações do arquivo
    if (!file.type.includes('mp4')) {
        toast.add({
            severity: 'error',
            summary: 'Erro de Arquivo',
            detail: 'Apenas arquivos .mp4 são permitidos.',
            life: 3000
        });
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // Limite de tamanho do arquivo (5MB)
        toast.add({
            severity: 'error',
            summary: 'Erro de Arquivo',
            detail: 'O tamanho do arquivo não pode exceder 5MB.',
            life: 3000
        });
        return;
    }
    
    selectedFile.value = file; // Salva o arquivo selecionado
    let video = document.getElementById('video-preview');
    let reader = new FileReader();

    // Leitura do arquivo para pré-visualização
    reader.readAsDataURL(file);
    reader.addEventListener('load', function () {
        video.src = reader.result;
    });
};

// Função para realizar o upload do vídeo
const uploadVideo = async () => {
    // Valida se há um arquivo selecionado
    if (!selectedFile.value) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Nenhum arquivo selecionado.',
            life: 3000
        });
        return;
    }

    isUploading.value = true; // Inicia o processo de upload
    uploadProgress.value = 0; // Reseta o progresso

    const formData = new FormData();
    let generatedName;

    // Geração de nome do arquivo (incluindo versão)
    if (selectedDM.value.video === 'N') {
        generatedName = `DM-${selectedDM.value.Identificacao}-v1`; // Inicia com v1
    } else {
        const atual = selectedDM.value.Video.match(/-v(\d+)(\.mp4)?$/);
        if (atual) {
            // Incrementa a versão do vídeo se já houver um arquivo
            const proximaVersao = parseInt(atual[1], 10) + 1;
            generatedName = `DM-${selectedDM.value.Identificacao}-v${proximaVersao}`;
        } else {
            console.warn(`Formato inesperado no campo Video: "${selectedDM.value.Video}". Iniciando como v1.`);
            generatedName = `DM-${selectedDM.value.Identificacao}-v1`; // Valor padrão para nome de vídeo
        }
    }

    // Prepara o FormData para envio
    formData.append('video', selectedFile.value);
    formData.append('dmId', selectedDM.value.ID_DM);
    formData.append('customName', generatedName);

    try {
        loading.value = true; // Mostra o carregamento
        // Envia o arquivo via axios
        await axios.post('/video/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
        });

        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Vídeo "${generatedName}" enviado com sucesso!`,
            life: 3000
        });

        // Emite evento de atualização de vídeo para o componente pai
        emit('update-video', {
            dmId: selectedDM.value.ID_DM,
            video: generatedName
        });

        closeDialog(); // Fecha o diálogo
    } catch (error) {
        console.error('Erro ao enviar vídeo:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Falha ao enviar o vídeo "${selectedFile.value.name}".`,
            life: 3000
        });
    } finally {
        isUploading.value = false; // Finaliza o processo de upload
        loading.value = false; // Finaliza o carregamento
    }
};

// Função para fechar o diálogo
const closeDialog = () => {
    showDialog.value = false;
    selectedDM.value = null;
    selectedFile.value = null;
    uploadProgress.value = 0;
};
</script>

<style scoped>
.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.file-list {
    margin-top: 1rem;
}

.error {
    color: red;
    font-weight: bold;
}
</style>