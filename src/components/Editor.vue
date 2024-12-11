<template>
  <!-- Contêiner do editor Quill -->
  <div class="quill-editor-container" style="height: 300px;">
    <!-- Elemento de editor Quill -->
    <div ref="editor" class="quill-editor" style="height: 210px;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'; // Importa funções reativas do Vue
import Quill from 'quill'; // Importa a biblioteca Quill para edição de texto
import 'quill/dist/quill.snow.css'; // Importa o tema "snow" do Quill

/**
 * Propriedades do componente.
 *
 * @typedef {Object} Props
 * @property {string} modelValue - O valor inicial do editor, recebido via `v-model`.
 */

const props = defineProps({
  modelValue: String // Valor do v-model que será usado para inicializar o conteúdo do editor
});

/**
 * Emissão de eventos para o componente pai.
 *
 * @typedef {Object} Emits
 * @property {function} update:modelValue - Evento para atualizar o valor do editor no componente pai.
 */
const emit = defineEmits(['update:modelValue']);

/**
 * Variáveis reativas do componente.
 *
 * @typedef {Object} ReactiveState
 * @property {Object} editor - Ref que armazena a referência do editor Quill.
 * @property {Object} quill - Instância do editor Quill.
 */
const editor = ref(null); // Referência para o elemento do editor Quill
let quill = null; // Instância do editor Quill

/**
 * Função executada quando o componente é montado.
 * Inicializa o editor Quill e configura os módulos e eventos.
 * 
 * @function onMounted
 */
onMounted(() => {
  // Inicializa o editor Quill com a referência do elemento e configura a aparência e funcionalidades
  quill = new Quill(editor.value, {
    theme: 'snow', // Tema do editor
    modules: {
      toolbar: [ // Configuração da barra de ferramentas
        [{ 'header': '1' }], // Cabeçalho de nível 1
        ['bold', 'italic', 'underline'], // Estilos de texto
        [{ 'list': 'ordered' }, { 'list': 'bullet' }] // Listas ordenadas e não ordenadas
      ]
    }
  });

  // Inicializa o conteúdo do editor com o valor recebido via v-model
  quill.root.innerHTML = props.modelValue || '';

  // Evento que emite as mudanças de conteúdo para o componente pai
  quill.on('text-change', () => {
    emit('update:modelValue', quill.root.innerHTML); // Emite o conteúdo atual do editor
  });

  // Observa mudanças no valor do v-model e atualiza o conteúdo do editor
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== quill.root.innerHTML) {
      const range = quill.getSelection(); // Salva a seleção atual
      const scrollTop = quill.root.scrollTop; // Salva a posição de rolagem
      quill.root.innerHTML = newValue; // Atualiza o conteúdo do editor
      if (range) {
        quill.setSelection(range.index, range.length); // Restaura a seleção
      }
      quill.root.scrollTop = scrollTop; // Restaura a posição de rolagem
    }
  }, { immediate: true }); // Executa a função imediatamente ao montar o componente
});
</script>

<style scoped>
/* Estilos do contêiner do editor Quill */
.quill-editor-container {
  border: 1px solid #ddd; /* Borda do editor */
  padding: 10px; /* Espaçamento interno */
  border-radius: 4px; /* Cantos arredondados */
  min-height: 300px; /* Altura mínima do editor */
}
</style>