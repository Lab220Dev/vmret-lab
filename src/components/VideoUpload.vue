<template>
    <div>
        <h2>Uploads Regulares</h2>
        <DataTable :value="dmOptions" responsiveLayout="scroll">
            <Column field="Identificacao" header="DM"></Column>
            <Column field="Video" header="Vídeo Associado"></Column>
            <Column header="Ações">
                <template #body="slotProps">
                    <Button label="Editar" icon="pi pi-pencil" class="p-button-sm p-button-warning" @click="editDM(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showDialog" header="Associar Vídeo" :closable="false">
            <form @submit.prevent="uploadVideo">
                <input type="file" accept="video/mp4" ref="fileInput" @change="handleFile" style="display: none" />
                <Button label="Selecionar Arquivo" icon="pi pi-folder-open" @click="triggerFileInput" />
                <video id="video-preview" controls v-show="selectedFile" width="240" height="200" class="mt-2" />
                <div v-if="selectedFile">
                    <p><strong>Arquivo Selecionado:</strong> {{ selectedFile.name }}</p>
                </div>
                <div class="button-group">
                    <Button label="Salvar" icon="pi pi-check" class="p-button-sm p-button-success" :disabled="!selectedFile || isUploading" @click="uploadVideo" />
                    <Button label="Cancelar" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />
                </div>
            </form>
        </Dialog>
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';
import axios from '@/axios.js';
import { useToast } from 'primevue/usetoast';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
const props = defineProps({
    dmList: Array
});
const dmOptions = computed(() => props.dmList);
const loading = ref(false);
const emit = defineEmits(['update-video']);
const showDialog = ref(false);
const selectedDM = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null); // Arquivo selecionado
const uploadProgress = ref(0);
const isUploading = ref(false);
const toast = useToast();

const editDM = (dm) => {
    selectedDM.value = dm;
    showDialog.value = true;
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFile = (event) => {
    const file = event.target.files[0];

    if (!selectedDM.value) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Selecione uma DM antes de adicionar arquivos.',
            life: 3000
        });
        return;
    }

    if (!file.type.includes('mp4')) {
        toast.add({
            severity: 'error',
            summary: 'Erro de Arquivo',
            detail: 'Apenas arquivos .mp4 são permitidos.',
            life: 3000
        });
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.add({
            severity: 'error',
            summary: 'Erro de Arquivo',
            detail: 'O tamanho do arquivo não pode exceder 5MB.',
            life: 3000
        });
        return;
    }
    selectedFile.value = file;
    let video = document.getElementById('video-preview');
    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.addEventListener('load', function () {
        video.src = reader.result;
    });
};

const uploadVideo = async () => {
    if (!selectedFile.value) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Nenhum arquivo selecionado.',
            life: 3000
        });
        return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();
    let generatedName;
    if (selectedDM.value.video === 'N') {
        generatedName = `DM-${selectedDM.value.Identificacao}-v1`;
    } else {
        const atual = selectedDM.value.Video.match(/-v(\d+)$/);
        if (atual) {
            // Incrementa o número da versão se encontrado
            const proximaVersao = parseInt(atual[1], 10) + 1;
            generatedName = `DM-${selectedDM.value.Identificacao}-v${proximaVersao}`;
        } else {
            // Se o padrão não for encontrado, exibe uma mensagem de alerta e começa com v1
            console.warn(`Formato inesperado no campo Video: "${selectedDM.value.Video}". Iniciando como v1.`);
            generatedName = `DM-${selectedDM.value.Identificacao}-v1`;
        }
    }
    //const generatedName = `DM-${selectedDM.value.Identificacao}-v1`;
    formData.append('video', selectedFile.value);
    formData.append('dmId', selectedDM.value.ID_DM);
    formData.append('customName', generatedName);
    try {
        loading.value = true;
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
            detail: `Vídeo "${selectedFile.value.name}" enviado com sucesso!`,
            life: 3000
        });

        emit('update-video', {
            dmId: selectedDM.value.ID_DM,
            video: selectedFile.value.name
        });

        closeDialog();
    } catch (error) {
        console.error('Erro ao enviar vídeo:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Falha ao enviar o vídeo "${selectedFile.value.name}".`,
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

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
