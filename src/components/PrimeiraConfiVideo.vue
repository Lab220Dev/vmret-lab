<template>
    <div class="config-inicial">
        <h2>Configuração Inicial de Vídeos</h2>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div v-if="dmOptions.length > 0">
            <h3>Selecione a DM para adicionar vídeos:</h3>
            <Listbox v-model="selectedDM" :options="dmOptions" optionLabel="label" class="mb-4" />

            <div class="file-upload">
                <input type="file" ref="fileInput" multiple accept=".mp4" @change="handleFiles" style="display: none" />
                <p v-if="fileError" class="error">{{ fileError }}</p>
                <Button label="Selecionar Vídeos" icon="pi pi-folder-open" @click="triggerFileInput" />
                <Button
                    label="Enviar Todos"
                    icon="pi pi-upload"
                    @click="uploadVideos"
                    :disabled="filesToUpload.length === 0 || isUploading"
                />
            </div>

            <div class="file-list" v-if="filesToUpload.length > 0">
                <h4>Vídeos para Upload:</h4>
                <ul>
                    <li v-for="(file, index) in filesToUpload" :key="index">
                        <span>{{ file.customName }}</span> (DM: {{ file.dmId }})
                        <ProgressBar :value="file.progress" class="mt-2" v-if="file.progress > 0" />
                    </li>
                </ul>
            </div>
            <!-- Botão de conclusão depende de vídeos enviados -->
            <Button
                label="Setup de Vídeo Concluído"
                icon="pi pi-check"
                @click="finalizarSetup"
                :disabled="!isAnyVideoUploaded"
            />
        </div>

        <p v-else>Configuração inicial concluída!</p>
    </div>
</template>

<script setup>
import axios from '@/axios.js';
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const props = defineProps({
    dmList: Array,
});

const selectedDM = ref(null); // DM selecionada
const filesToUpload = ref([]); // Lista de arquivos para upload
const isUploading = ref(false);
const fileError = ref('');
const uploadedVideos = ref(0); // Contador de vídeos enviados com sucesso

const dmOptions = computed(() =>
    props.dmList.map((dm) => ({
        label: dm.Identificacao,
        value: dm.ID_DM,
    }))
);

const emit = defineEmits(['setup-concluido']);
const isAnyVideoUploaded = computed(() => uploadedVideos.value > 0);

const triggerFileInput = () => {
    fileError.value = '';
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.click();
    }
};

const finalizarSetup = () => {
    emit('setup-concluido');
};

const handleFiles = (event) => {
    const files = event.target.files;

    if (!selectedDM.value) {
        fileError.value = 'Selecione uma DM antes de adicionar arquivos.';
        return;
    }

    for (const file of files) {
        if (!file.type.includes('mp4')) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'Apenas arquivos .mp4 são permitidos.',
                life: 3000,
            });
            continue;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'O tamanho do arquivo não pode exceder 5MB.',
                life: 3000,
            });
            continue;
        }

        const generatedName = `DM-${selectedDM.value.label}-v1`;

        filesToUpload.value.push({
            file,
            dmId: selectedDM.value.value,
            customName: generatedName,
            progress: 0,
        });
    }
};

const uploadVideos = async () => {
    if (filesToUpload.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Nenhum Arquivo',
            detail: 'Adicione arquivos antes de enviar.',
            life: 3000,
        });
        return;
    }

    isUploading.value = true;

    for (const item of filesToUpload.value) {
        const formData = new FormData();
        formData.append('video', item.file);
        formData.append('dmId', item.dmId);
        formData.append('customName', item.customName);

        try {
            await axios.post('/video/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    item.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                },
            });

            uploadedVideos.value++; // Incrementa o contador de vídeos enviados com sucesso

            toast.add({
                severity: 'success',
                summary: 'Upload Concluído',
                detail: `Vídeo "${item.customName}" enviado com sucesso!`,
                life: 3000,
            });
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            toast.add({
                severity: 'error',
                summary: 'Erro de Upload',
                detail: `Falha ao enviar o vídeo "${item.customName}".`,
                life: 3000,
            });
        }
    }

    filesToUpload.value = [];
    isUploading.value = false;
};
</script>
