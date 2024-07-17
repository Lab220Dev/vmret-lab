<template>
    <div class="flex align-items-center justify-content-center flex-column">
        <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" :multiple="multiple" accept="image/png" />
        <div v-if="!multiple && !imageData.length" class="image-container">
            <img :src="externalImages || placeholderImage" alt="Uploaded or Placeholder Image" class="uploaded-image" />
        </div>
        <div v-else>
            <div v-for="(image, index) in imageData" :key="index" class="image-container">
                <img :src="image || placeholderImage" alt="Uploaded or Placeholder Image" class="uploaded-image" />
                <button v-if="image" class="remove-button" @click="removeImage(index)">×</button>
            </div>
            <div v-if="imageData.length === 0" class="image-container">
                <img :src="placeholderImage" alt="Placeholder Image" class="uploaded-image" />
            </div>
        </div>
        <button class="button" @click="triggerFileInput"><i class="pi pi-upload icon-left"></i> Enviar {{ multiple ? 'Imagens' : 'uma Imagem' }}</button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import imageUrl from '@/assets/images/placeholder4.png';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    externalImages: {
        type: [Array, String],
        default: () => []
    },
    multiple: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['fileSelected']);

const fileInput = ref(null);
const imageData = ref([]);
const placeholderImage = imageUrl;
const toast = useToast();
const maxImages = 3;
const maxSize = 2 * 1024 * 1024;

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (props.multiple) {
        if (imageData.value.length + files.length > maxImages) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você pode carregar no máximo 3 imagens.', life: 3000 });
            return;
        }
        files.forEach((file) => {
            if (file.type !== 'image/png') {
                toast.add({ severity: 'error', summary: 'Erro', detail: `O arquivo ${file.name} não é um PNG.`, life: 3000 });
                return;
            }
            if (file.size <= maxSize) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageData.value.push(e.target.result);
                    emit('fileSelected', file);
                };
                reader.readAsDataURL(file);
            } else {
                toast.add({ severity: 'error', summary: 'Erro', detail: `O arquivo ${file.name} é muito grande. O tamanho máximo permitido é 2MB.`, life: 3000 });
            }
        });
    } else {
        const file = files[0];
        if (file) {
            if (file.type !== 'image/png') {
                toast.add({ severity: 'error', summary: 'Erro', detail: `O arquivo ${file.name} não é um PNG.`, life: 3000 });
                return;
            }
            if (file.size <= maxSize) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageData.value = [e.target.result];
                    emit('fileSelected', file);
                };
                reader.readAsDataURL(file);
            } else {
                toast.add({ severity: 'error', summary: 'Erro', detail: `O arquivo ${file.name} é muito grande. O tamanho máximo permitido é 2MB.`, life: 3000 });
            }
        }
    }
};

const removeImage = (index) => {
    imageData.value.splice(index, 1);
};

watch(
    () => props.externalImages,
    (newVal) => {
        if (Array.isArray(newVal)) {
            imageData.value = newVal;
        } else if (typeof newVal === 'string') {
            imageData.value = [newVal];
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
    height: 200px;
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
</style>
