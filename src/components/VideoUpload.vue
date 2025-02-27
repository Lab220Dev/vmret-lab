<template>
    <div class="my-7">
        <!-- Tabela que exibe a lista de DMs e vídeos associados -->
        <DataTable class="" :value="dmOptions"  responsiveLayout="scroll">  <!-- Tabela de DMs -->
            <Column field="Identificacao" header="DM"> </Column>    <!-- Coluna de Identificação -->
            <Column field="Video" :header="$t('video_associated')"></Column>    <!-- Coluna de Vídeo -->

            <!-- Coluna de Ações: Editar DM -->
            <Column :header="$t('action')" style="width: 10%">  <!-- Coluna de Ações -->
                <template #body="slotProps">    <!-- Template para exibir os botões de ação -->
                    <!-- Botão de Editar: Exibe o diálogo de associar vídeo -->
                    <Button :label="$t('edit')" style="width: 100px;" icon="pi pi-pencil" class="p-button-sm mb-2" @click="editDM(slotProps.data)" />   <!-- Botão de Editar -->
                    <Button :label="$t('delete')" style="width: 100px;" icon="pi pi-trash" class="p-button-sm p-button-danger" @click="deleteDM(slotProps.data)" />  <!-- Botão de Excluir -->
                </template>
            </Column>
        </DataTable>

        <!-- Diálogo para associar vídeo -->
        <Dialog v-model:visible="showDialog":header="$t('edit_video')" modal class="p-dialog py-2 " style="max-width: 350px; min-width: 330px;" :closable="false" :draggable="false">   <!-- Diálogo de Edição -->
            <hr class="my-0" /> <!-- Linha horizontal -->
            <form class="card formdevideo mx-4 my-3 py-3" @submit.prevent="uploadVideo">    <!-- Formulário de Upload de Vídeo -->
                <!-- Campo de seleção de arquivo (oculto) -->
                <input type="file" accept="video/mp4" ref="fileInput" @change="handleFile" style="display: none" /> <!-- Campo de Seleção de Arquivo -->

                <!-- Botão para abrir o seletor de arquivos -->
                <Button :label="$t('select_file')" icon="pi pi-folder-open" @click="triggerFileInput" />    <!-- Botão de Selecionar Arquivo -->

                <!-- Pré-visualização do vídeo selecionado -->
                <video autoplay loop id="video-preview" v-show="selectedFile" width="140" height="240" class="mt-3 p-0 mx-auto" />  <!-- Pré-visualização do Vídeo -->
            </form>
            <div class="mt-6 name-file" v-if="selectedFile">    <!-- Nome do arquivo selecionado -->
                <p class="text-sm "><strong>{{$t('selected_video')}}</strong></p>   <!-- Título --> 
                <p class="text-sm file-name ">  <!-- Nome do arquivo -->
                    <span class="tooltip-target" v-tooltip="selectedFile.name">{{ selectedFile.name }}</span>
                </p>
            </div>

            <hr />
            <!-- Botões de ação para salvar ou cancelar -->

            <div class="button-group flex justify-content-between mt-3">    <!-- Grupo de Botões -->
                <Button :label="$t('save')" icon="pi pi-check" class="p-button-sm p-button-success" :disabled="!selectedFile || isUploading" @click="uploadVideo" />    <!-- Botão de Salvar -->
                <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />   <!-- Botão de Cancelar -->
            </div>
        </Dialog>
        <Dialog v-model:visible="showDeleteDialog" :header="$t('delete_video')" modal class="p-dialog py-2 " style="max-width: 350px; min-width: 330px;" :closable="false" :draggable="false">  <!-- Diálogo de Exclusão -->
            <hr class="my-0" /> <!-- Linha horizontal -->
            <div class="m-5">   <!-- Mensagem de confirmação de exclusão -->
                <p class="text-sm text-center"><strong>{{$t('delete_video_dialog')}}</strong> {{ selectedDM.Video }}?</p>   <!-- Mensagem de Confirmação -->
                <p class="text-sm "></p>    <!-- Espaço em branco --> 
            </div>

            <hr />
            <!-- Botões de ação para salvar ou cancelar -->

            <div class="button-group flex justify-content-between mt-3">
                <Button :label="$t('delete')" icon="pi pi-trash" class="p-button-sm p-button-danger"  @click="handleDelete" />  <!-- Botão de Excluir -->
                <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />  <!-- Botão de Cancelar -->
            </div>
        </Dialog>
        <!-- Spinner de carregamento enquanto o vídeo está sendo enviado -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'; // Funções do Vue para reatividade e manipulação de props
import { useToast } from 'primevue/usetoast'; // Biblioteca para exibição de notificações
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa a função de toast para exibir notificações
import videoService from '@/services/videoService'; // Serviço para upload e exclusão de vídeos
import {  generateCustomVideoName } from '@/helpers/HelperUtils';   // Helper para gerar nome customizado para o vídeo
import {  isValidVideoFile  } from '@/helpers/HelperValidacao.js';  // Helper para validar o arquivo de vídeo
import { useI18n } from 'vue-i18n'; // Função para tradução de textos
const { t } = useI18n();    // Função para tradução de textos
// Propriedades recebidas pelo componente, espera uma lista de DMs
const props = defineProps({ // Define as propriedades do componente
    dmList: Array // Recebe a lista de DMs (Dispositivos de Mídia) como prop
});
// Computed para mapear as DMs para a tabela
const dmOptions = computed(() => props.dmList); // Mapeia a lista de DMs para a tabela

// Variáveis reativas
const loading = ref(false); // Flag de carregamento
const emit = defineEmits(['update-video']); // Emissão de evento para o componente pai
const showDialog = ref(false); // Controle de exibição do diálogo
const showDeleteDialog = ref(false); // Controle do diálogo de exclusão de video
const selectedDM = ref(null); // DM selecionada para associar o vídeo
const fileInput = ref(null); // Ref para o input de arquivo
const selectedFile = ref(null); // Arquivo de vídeo selecionado
const uploadProgress = ref(0); // Progresso do upload
const isUploading = ref(false); // Flag de upload em andamento
const toast = useToast(); // Toast para exibição de notificações

// Função chamada ao clicar em Editar DM, abre o diálogo
const editDM = (dm) => { // Função para editar a DM
    selectedDM.value = dm;  // Seleciona a DM
    showDialog.value = true;    // Exibe o diálogo
};
const deleteDM = (dm) => {  // Função para excluir a DM
    selectedDM.value = dm;  // Seleciona a DM
    showDeleteDialog.value = true;  // Exibe o diálogo de exclusão
};
// Função que simula o clique no campo de seleção de arquivos
const triggerFileInput = () => {    // Função para acionar o campo de seleção de arquivos
    fileInput.value.click();    // Clica no campo de seleção de arquivos
};

// Função para tratar o arquivo selecionado
const handleFile = (event) => { // Função para tratar o arquivo selecionado
    const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

    // Verificação de DM selecionada antes de permitir upload
    if (!selectedDM.value) {    // Se não houver DM selecionada
        toast.add({   // Exibe uma notificação de erro
            severity: 'error',  // Define a severidade como erro
            summary: t('title_error'),  // Título da notificação
            detail: t('video_associated_dm'),   // Detalhes da notificação
            life: 3000  // Tempo de exibição da notificação
        });
        return; // Retorna
    }
    // Validação do arquivo usando o helper
    const validation = isValidVideoFile(file);  // Valida o arquivo de vídeo
    if (!validation.valid) {    // Se a validação falhar
        toast.add({  // Exibe uma notificação de erro
            severity: 'error',  // Define a severidade como erro
            summary: t('title_error'),  // Título da notificação
            detail: validation.error,   // Detalhes da notificação
            life: 3000, // Tempo de exibição da notificação
        });
        return; // Retorna
    }

    selectedFile.value = file; // Salva o arquivo selecionado
    let video = document.getElementById('video-preview');   // Pega o elemento de vídeo
    let reader = new FileReader();  // Cria um leitor de arquivo

    // Leitura do arquivo para pré-visualização
    reader.readAsDataURL(file); // Lê o arquivo como URL
    reader.addEventListener('load', function () {   // Adiciona um evento de carregamento
        video.src = reader.result;  // Define a URL do vídeo
    });
};

const handleFileUpdate = (updatedFile) => { // Função para atualizar o arquivo
  // Atualiza o arquivo na lista (se necessário)
  const fileIndex = props.dmList.findIndex(file => file.ID_DM === updatedFile.ID_DM);   // Encontra o índice do arquivo
  if (fileIndex !== -1) {   // Se o arquivo existir
    props.dmList[fileIndex] = updatedFile;  // Atualiza o arquivo
  }
}
const handleDelete = async () => {  // Função para lidar com a exclusão
    try {   // Tenta
        await videoService.deleteVideo(selectedDM.value.ID_DM); // Exclui o vídeo
        emit('update-video', { dmId: selectedDM.value.ID_DM, video: null });    // Emite o evento de atualização
        toast.add({ severity: 'success', summary: t('title_sucess'), detail:  t('video_dialog_sucess'), life: 3000 });  // Exibe uma notificação de sucesso
        closeDialog();  // Fecha o diálogo
    } catch (error) {   // Se houver um erro
        toast.add({ severity: 'error', summary: t('title_error'), detail:  t('video_dialog_fail'), life: 3000 });   // Exibe uma notificação de erro
    }
};
// Função para realizar o upload do vídeo
const uploadVideo = async () => {   // Função para fazer o upload do vídeo
  if (!selectedFile.value) {    // Se não houver arquivo selecionado
    toast.add({ severity: 'error', summary: t('title_error'), detail: t('video_empty'), life: 3000 });  // Exibe uma notificação de erro
    return; // Retorna
  }

  const validation = isValidVideoFile(selectedFile.value);  // Valida o arquivo de vídeo
  if (!validation.valid) {  // Se a validação falhar
    toast.add({ severity: 'error', summary: t('title_error'), detail: validation.error, life: 3000 });  // Exibe uma notificação de erro
    return; // Retorna
  }

  const customName = generateCustomVideoName(selectedDM.value.Identificacao, selectedDM.value.Video);   // Gera um nome customizado para o vídeo

  try {  // Tenta
    isUploading.value = true;   // Define a flag de upload como verdadeira
    await videoService.uploadVideo( // Faz o upload do vídeo
      selectedFile.value,   // Arquivo selecionado
      selectedDM.value.ID_DM,   // ID da DM selecionada
      customName,   // Nome customizado
      (progressEvent) => {  // Função de progresso
        uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);  // Calcula o progresso
      }
    );
    toast.add({ severity: 'success', summary: t('title_sucess'), detail:t('file_uploaded', { file: customName }), life: 3000 });    // Exibe uma notificação de sucesso
    emit('update-video', { dmId: selectedDM.value.ID_DM, video: customName });  // Emite o evento de atualização
    closeDialog();  // Fecha o diálogo
  } catch (error) {  // Se houver um erro
    toast.add({ severity: 'error', summary: t('title_error'), detail: t('video_upload_failed'), life: 3000 });  // Exibe uma notificação de erro
  } finally {   // Finalmente
    isUploading.value = false;  // Define a flag de upload como falsa
  }
};

// Função para fechar o diálogo
const closeDialog = () => { // Função para fechar o diálogo
    showDialog.value = false;   // Fecha o diálogo
    showDeleteDialog.value = false; // Fecha o diálogo de exclusão
    selectedDM.value = null;    // Limpa a DM selecionada
    selectedFile.value = null;  // Limpa o arquivo selecionado
    uploadProgress.value = 0;   // Reseta o progresso do upload
};
</script>

<style scoped>

/* Estilos para a exibição de tooltip */
.tooltip-target {   /* Define o estilo do elemento com tooltip */
    cursor: pointer;    /* Aponta o cursor para indicar que é interativo */
    white-space: nowrap;    /* Impede a quebra de linha dentro do texto */
    overflow: hidden;   /* Oculta qualquer texto que ultrapasse o limite da área */
    text-overflow: ellipsis;    /* Exibe "..." para indicar que o texto foi cortado */
    display: inline-block;  /* Permite o controle de largura e altura */
    max-width: 100%;    /* Garante que o texto ocupe todo o espaço disponível */
}   /* Fim do estilo para o elemento com tooltip */

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {    /* Estilo para o tooltip */
    max-width: 400px;   /* Define a largura máxima do tooltip */
    white-space: normal;    /* Permite quebra de linha no tooltip */
}

.formdevideo {  /* Estilo para o formulário de upload de vídeo */
    display: grid;      /* Define o layout do formulário como grid */
}

/* Forçar o z-index para a máscara de fundo do diálogo */
.p-dialog { /* Estilo para o diálogo */
    background: rgba(0, 0, 0, 0.568) !important;    /* Define o fundo do diálogo */
    z-index: 99999 !important;  /* Define o z-index do diálogo */
}

.error {    /* Estilo para mensagens de erro */
    color: red; /* Define a cor do texto como vermelho */
    font-weight: bold;  /* Define o peso da fonte como negrito */
}

.name-file {    /* Estilo para o nome do arquivo */
    overflow: hidden;   /* Oculta o texto que excede o tamanho do container */
    white-space: nowrap;    /* Impede a quebra de linha */
    text-overflow: ellipsis;    /* Exibe reticências (...) quando o texto excede o tamanho */
    max-width: 280px;  /* Limite de largura para o nome do arquivo */       
    display: block; /* Exibe o elemento como bloco */
}

.file-name {    /* Estilo para o nome do arquivo */
    overflow: hidden;   /* Oculta o texto que excede o tamanho do container */
    white-space: nowrap;    /* Impede a quebra de linha */
    text-overflow: ellipsis;    /* Exibe reticências (...) quando o texto excede o tamanho */
    max-width: 100%;  /* Garante que o nome se ajuste ao container */   
    display: inline-block;  /* Exibe o elemento como bloco */
    vertical-align: middle; /* Alinha o texto verticalmente */
}
</style>
