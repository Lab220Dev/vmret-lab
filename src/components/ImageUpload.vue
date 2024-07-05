<template>
    <div>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        style="display: none"
      />
      <button @click="triggerFileInput">Upload Image</button>
      <div v-if="imageData">
        <img :src="imageData" alt="Uploaded Image" style="max-width: 300px;" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineEmits } from 'vue';
  
  const emit = defineEmits(['fileSelected']);
  
  const fileInput = ref(null);
  const imageData = ref(null);
  
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
  </script>
  