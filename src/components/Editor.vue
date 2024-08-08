<template>
  <div class="quill-editor-container">
    <div ref="editor" class="quill-editor"></div>
  </div>
  <!--  -->
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Importa o estilo do Quill

const props = defineProps({
  modelValue: String // Recebe o valor do v-model
});

const emit = defineEmits(['update:modelValue']);

const editor = ref(null);

onMounted(() => {
  const quill = new Quill(editor.value, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': '1' }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }]
      ]
    }
  });

  // Atualizar o valor do v-model sempre que o conteúdo mudar
  quill.on('text-change', () => {
    emit('update:modelValue', quill.root.innerHTML);
  });

  // Atualizar conteúdo mantendo o cursor na posição correta
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      const range = quill.getSelection(); // Salvar a seleção atual
      const scrollTop = quill.root.scrollTop; // Salvar a posição de rolagem
      quill.root.innerHTML = newValue; // Atualizar o conteúdo
      if (range) {
        quill.setSelection(range.index, range.length); // Restaurar a seleção
      }
      quill.root.scrollTop = scrollTop; // Restaurar a posição de rolagem
    }
  }, { immediate: true });
});
</script>

<style scoped>
.quill-editor-container {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  min-height: 300px; /* Ajuste a altura conforme necessário */
}
</style>
