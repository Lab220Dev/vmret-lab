<script setup>
import { ref, defineEmits } from 'vue';
import imageUrl from '@/assets/images/placeholder4.png';

const emit = defineEmits(['fileSelected']);

const fileInput = ref(null);
const imageData = ref(null);
const fileInputSecondary = ref([]);
const imageDataSecondary = ref([]);
const placeholderImage = imageUrl;

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit('fileSelected', file);
    const reader = new FileReader();
    reader.onload = (e) => {
      imageData.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInputSecondary = (index) => {
  fileInputSecondary.value[index].click();
};

const handleFileUploadSecondary = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageDataSecondary.value.push(e.target.result);
      };
      reader.readAsDataURL(file);

      emit('fileSelected', file);
    });
  }
};

</script>

<template>
  <div class="flex align-items-center justify-content-center">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileUpload"
      style="display: none"
    />
    <div class="image-container">
      <img
        :src="imageData ? imageData : placeholderImage"
        alt="Uploaded or Placeholder Image"
        class="uploaded-image"
      />
      <button class="button" @click="triggerFileInput">+ Escolha uma Imagem</button>
    </div>

    <div v-for="(image, index) in imageDataSecondary" :key="index" class="image-container">
      <input
        type="file"
        ref="fileInputSecondary"
        @change="handleFileUploadSecondary"
        style="display: none"
        multiple
      />
      <img
        :src="image ? image : placeholderImage"
        alt="Uploaded or Placeholder Image"
        class="uploaded-image"
      />
      <button class="button" @click="triggerFileInputSecondary(index)">+ Escolha Imagens Secundárias</button>
    </div>

  </div>
</template>

<style>
.button {
  color: #ffffff;
  background: #3B82F6;
  border: 1px solid #3B82F6;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, outline-color 0.2s;
  border-radius: 6px;
  outline-color: transparent;
  width: 200px;
}

.button:hover {
  background: #2563EB;
  border-color: #2563EB;
}

.image-container {
  margin-top: 1rem;
}

.uploaded-image {
  max-width: 200px;
  display: block;
  min-width: 200px;
}
</style>