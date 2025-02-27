<template>
    <!-- Contêiner flexível para centralizar o conteúdo -->
    <div class="flex align-items-center justify-content-center flex-column">
      <!-- Input de arquivo oculto, acionado por outro botão -->
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" accept=".png, .jpeg, .jpg" />
      
      <!-- Contêiner de imagem com a imagem carregada ou imagem de placeholder -->
      <div class="image-container">
        <img :src="imageData || placeholderImage" alt="Uploaded or Placeholder Image" class="uploaded-image" />
        <!-- Botão de remoção da imagem carregada -->
        <button v-if="imageData" class="remove-button" @click="removeImage">×</button>
      </div>
      
      <!-- Botão para acionar o envio de imagem -->
      <button class="button" @click="triggerFileInput"><i class="pi pi-upload icon-left"></i> {{$t('send_image')}}</button>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'; // ref para reatividade, watch para observar mudanças em valores reativos
  import { defineProps, defineEmits, defineExpose } from 'vue'; // defineProps para declarar propriedades, defineEmits para declarar eventos e defineExpose para expor funções
  import imageUrl from '@/assets/images/placeholder4.png'; // Importa imagem de placeholder
  import { useToast } from 'primevue/usetoast'; // Função para mostrar notificações
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  /**
   * Propriedades do componente.
   * 
   * @typedef {Object} Props
   * @property {string|Object} externalImages - Imagem externa recebida para exibição (URL ou objeto com base64 e mimeType).
   */
  const props = defineProps({
    externalImages: {
      type: [String, Object],
      default: ''
    }
  });
  
  /**
   * Funções emitidas para o componente pai.
   * 
   * @typedef {Object} Emits
   * @property {function} fileSelected - Evento emitido quando um arquivo é selecionado.
   */
  const emit = defineEmits(['fileSelected']);
  
  const fileInput = ref(null); // Ref para o input de arquivo
  const imageData = ref(null); // Ref para armazenar a imagem carregada
  const placeholderImage = imageUrl; // Caminho da imagem de placeholder
  const toast = useToast(); // Função para exibir notificações
  const maxSize = 2 * 1024 * 1024; // Tamanho máximo para a imagem (2MB)
  
  /**
   * Função para acionar a seleção de arquivo.
   * 
   * @function triggerFileInput
   */
  const triggerFileInput = () => {
    fileInput.value.click(); // Aciona o clique no input de arquivo oculto
  };
  
  /**
   * Função para tratar o upload do arquivo.
   * 
   * @function handleFileUpload
   * @param {Event} event - Evento de mudança do input de arquivo.
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Obtém o primeiro arquivo selecionado
    
    if (file) {
      // Verifica se o tipo do arquivo é válido
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
  
      // Verifica se o tamanho do arquivo é aceitável
      if (file.size <= maxSize) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageData.value = e.target.result; // Atribui a imagem carregada à variável imageData
          emit('fileSelected', file); // Emite o evento para o componente pai
        };
        reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados
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
  
  /**
   * Função para remover a imagem carregada.
   * 
   * @function removeImage
   */
  const removeImage = () => {
    imageData.value = null; // Limpa a imagem carregada
    emit('fileSelected', null); // Emite evento para o componente pai
  };
  
  /**
   * Função para limpar os dados da imagem (exposta ao componente pai).
   * 
   * @function clearImageData
   */
  const clearImageData = () => {
    imageData.value = null; // Limpa a imagem
    if (fileInput.value) {
      fileInput.value.value = ''; // Limpa o valor do input de arquivo
    }
    emit('clearImage'); // Emite evento de limpeza para o componente pai
  };
  
  defineExpose({
    clearImageData // Expõe a função clearImageData para ser usada no componente pai
  });
  
  /**
   * Observa mudanças na propriedade `externalImages` e atualiza a imagem exibida.
   * 
   * @function watch
   * @param {string|Object} newVal - Novo valor da propriedade externalImages.
   */
  watch(
    () => props.externalImages,
    (newVal) => {
      if (typeof newVal === 'string') {
        imageData.value = newVal; // Atualiza com a URL da imagem
      } else if (typeof newVal === 'object' && newVal !== null) {
        imageData.value = `data:${newVal.mimeType};base64,${newVal.image}`; // Atualiza com a imagem base64
      } else {
        imageData.value = null; // Se não houver imagem, limpa a variável
      }
    },
    { immediate: true }
  );
  </script>
  
  <style>
  /* Estilos responsivos para telas pequenas */
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
  
  /* Estilos do botão */
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
  
  /* Estilo para o botão de hover */
  .button:hover {
    background: #2563eb;
    border-color: #2563eb;
  }
  
  /* Estilos para o contêiner da imagem */
  .image-container {
    margin-top: 1rem;
    position: relative;
  }
  
  /* Estilo da imagem carregada */
  .uploaded-image {
    width: 200px;
    height: 150px;
    display: block;
  }
  
  /* Estilos para o layout flexível em coluna */
  .flex-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Estilos do botão de remoção */
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
  
  /* Efeito de hover no botão de remoção */
  .remove-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }
  
  /* Estilos para o ícone do botão */
  .icon-left {
    margin-right: 0.5rem;
  }
  
  /* Estilos para telas médias (1085px) */
  @media (max-width: 1085px) {
    .uploaded-image {
      width: 150px;
      height: 100px;
    }
  
    .button {
      width: 150px;
    }
  }
  </style>