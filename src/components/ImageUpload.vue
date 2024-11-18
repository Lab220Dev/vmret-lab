<template>
    <div class="flex align-items-center justify-content-center flex-column">
    <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" accept=".png, .jpeg, .jpg" />
    <div class="image-container">
        <img :src="imageData || placeholderImage" alt="Uploaded or Placeholder Image" class="uploaded-image" />
        <button v-if="imageData" class="remove-button" @click="removeImage">×</button>
    </div>
    <button class="button" @click="triggerFileInput"><i class="pi pi-upload icon-left"></i> Enviar Imagem</button>
</div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import imageUrl from '@/assets/images/placeholder4.png';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    externalImages: {
        type: [String, Object],
        default: ''
    }
});

const emit = defineEmits(['fileSelected']);

const fileInput = ref(null);
const imageData = ref(null);
const placeholderImage = imageUrl;
const toast = useToast();
const maxSize = 2 * 1024 * 1024;

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const maxSize = 2 * 1024 * 1024; // Tamanho máximo em bytes (2MB)
    
    if (file) {
        // Verifica o tipo do arquivo
        const allowedTypes = ['image/png', 'image/jpeg'];
        if (!allowedTypes.includes(file.type)) {
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: `O arquivo ${file.name} não é um formato de imagem suportado. Aceitos: PNG, JPEG, JPG.`,
                life: 3000
            });
            return;
        }

        // Verifica o tamanho do arquivo
        if (file.size <= maxSize) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageData.value = e.target.result;
                emit('fileSelected', file);
            };
            reader.readAsDataURL(file);
        } else {
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: `O arquivo ${file.name} é muito grande. O tamanho máximo permitido é 2MB.`,
                life: 3000
            });
        }
    }
};

const removeImage = () => {
    imageData.value = null;
    emit('fileSelected', null);
};

watch(
    () => props.externalImages,
    (newVal) => {
        if (typeof newVal === 'string') {
            imageData.value = newVal;
        } else if (typeof newVal === 'object' && newVal !== null) {
            imageData.value = `data:${newVal.mimeType};base64,${newVal.image}` ;
        } else {
            imageData.value = null;
        }
    },
    { immediate: true }
);
</script>

<style>
@media (max-width: 425px) {
    .uploaded-image {
        max-width: 150px;
        min-width: 150px;
        min-height: 150px;
        max-height: 150px;
    }

    .button {
        min-width: 150px;
        max-width: 150px;
    }
}

.button {
    color: #ffffff;
    background: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, outline-color 0.2s;
    border-radius: 6px;
    outline-color: transparent;
    width: 200px;
    margin-top: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.button:hover {
    background: #2563eb;
    border-color: #2563eb;
}

.image-container {
    margin-top: 1rem;
    position: relative;
}

.uploaded-image {
    width: 200px;
    height: 150px;
    display: block;
}

.flex-column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.remove-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
}

.remove-button:hover {
    background: rgba(0, 0, 0, 0.8);
}

.icon-left {
    margin-right: 0.5rem;
}

@media (max-width: 1085px){
.uploaded-image {
    width: 150px;
    height: 100px;
}

.button {
    width: 150px;
}
}
</style>