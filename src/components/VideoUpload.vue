<template>
    <div class="my-7">
        <!-- Tabela que exibe a lista de DMs e vídeos associados -->
        <DataTable class="" :value="dmOptions"  responsiveLayout="scroll">
            <Column field="Identificacao" header="DM"> </Column>
            <Column field="Video" :header="$t('video_associated')"></Column>

            <!-- Coluna de Ações: Editar DM -->
            <Column :header="$t('action')" style="width: 10%">
                <template #body="slotProps">
                    <!-- Botão de Editar: Exibe o diálogo de associar vídeo -->
                    <Button :label="$t('edit')" style="width: 100px;" icon="pi pi-pencil" class="p-button-sm mb-2" @click="editDM(slotProps.data)" />
                    <Button :label="$t('delete')" style="width: 100px;" icon="pi pi-trash" class="p-button-sm p-button-danger" @click="deleteDM(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <!-- Diálogo para associar vídeo -->
        <Dialog v-model:visible="showDialog":header="$t('edit_video')" modal class="p-dialog py-2 " style="max-width: 350px; min-width: 330px;" :closable="false" :draggable="false">
            <hr class="my-0" />
            <form class="card formdevideo mx-4 my-3 py-3" @submit.prevent="uploadVideo">
                <!-- Campo de seleção de arquivo (oculto) -->
                <input type="file" accept="video/mp4" ref="fileInput" @change="handleFile" style="display: none" />

                <!-- Botão para abrir o seletor de arquivos -->
                <Button :label="$t('select_file')" icon="pi pi-folder-open" @click="triggerFileInput" />

                <!-- Pré-visualização do vídeo selecionado -->
                <video autoplay loop id="video-preview" v-show="selectedFile" width="140" height="240" class="mt-3 p-0 mx-auto" />
            </form>
            <div class="mt-6 name-file" v-if="selectedFile">
                <p class="text-sm "><strong>{{$t('selected_video')}}</strong></p>
                <p class="text-sm file-name ">
                    <span class="tooltip-target" v-tooltip="selectedFile.name">{{ selectedFile.name }}</span>
                </p>
            </div>

            <hr />
            <!-- Botões de ação para salvar ou cancelar -->

            <div class="button-group flex justify-content-between mt-3">
                <Button :label="$t('save')" icon="pi pi-check" class="p-button-sm p-button-success" :disabled="!selectedFile || isUploading" @click="uploadVideo" />
                <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />
            </div>
        </Dialog>
        <Dialog v-model:visible="showDeleteDialog" :header="$t('delete_video')" modal class="p-dialog py-2 " style="max-width: 350px; min-width: 330px;" :closable="false" :draggable="false">
            <hr class="my-0" />
            <div class="m-5">
                <p class="text-sm "><strong>{{$t('delete_video_dialog')}}</strong></p>
                <p class="text-sm ">{{ selectedDM.Video }}</p>
            </div>

            <hr />
            <!-- Botões de ação para salvar ou cancelar -->

            <div class="button-group flex justify-content-between mt-3">
                <Button :label="$t('delete')" icon="pi pi-trash" class="p-button-sm p-button-danger"  @click="handleDelete" />
                <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-sm p-button-secondary" @click="closeDialog" />
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
import videoService from '@/services/videoService';
import {  generateCustomVideoName } from '@/helpers/HelperUtils';
import {  isValidVideoFile  } from '@/helpers/HelperValidacao.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Propriedades recebidas pelo componente, espera uma lista de DMs
const props = defineProps({
    dmList: Array // Recebe a lista de DMs (Dispositivos de Mídia) como prop
});
// Computed para mapear as DMs para a tabela
const dmOptions = computed(() => props.dmList);

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
const editDM = (dm) => {
    selectedDM.value = dm;
    showDialog.value = true;
};
const deleteDM = (dm) => {
    selectedDM.value = dm;
    showDeleteDialog.value = true;
};
// Função que simula o clique no campo de seleção de arquivos
const triggerFileInput = () => {
    fileInput.value.click();
};

// Função para tratar o arquivo selecionado
const handleFile = (event) => {
    const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

    // Verificação de DM selecionada antes de permitir upload
    if (!selectedDM.value) {
        toast.add({
            severity: 'error',
            summary: -t('title_error'),
            detail: t('video_associated_dm'),
            life: 3000
        });
        return;
    }
    // Validação do arquivo usando o helper
    const validation = isValidVideoFile(file);
    if (!validation.valid) {
        toast.add({
            severity: 'error',
            summary: t('title_error'),
            detail: validation.error,
            life: 3000,
        });
        return;
    }

    selectedFile.value = file; // Salva o arquivo selecionado
    let video = document.getElementById('video-preview');
    let reader = new FileReader();

    // Leitura do arquivo para pré-visualização
    reader.readAsDataURL(file);
    reader.addEventListener('load', function () {
        video.src = reader.result;
    });
};

const handleFileUpdate = (updatedFile) => {
  // Atualiza o arquivo na lista (se necessário)
  const fileIndex = props.dmList.findIndex(file => file.ID_DM === updatedFile.ID_DM);
  if (fileIndex !== -1) {
    props.dmList[fileIndex] = updatedFile;
  }
}
const handleDelete = async () => {
    try {
        await videoService.deleteVideo(selectedDM.value.ID_DM);
        emit('update-video', { dmId: selectedDM.value.ID_DM, video: null });
        toast.add({ severity: 'success', summary: t('title_sucess'), detail:  t('video_dialog_sucess'), life: 3000 });
        closeDialog();
    } catch (error) {
        toast.add({ severity: 'error', summary: t('title_error'), detail:  t('video_dialog_fail'), life: 3000 });
    }
};
// Função para realizar o upload do vídeo
const uploadVideo = async () => {
  if (!selectedFile.value) {
    toast.add({ severity: 'error', summary: t('title_error'), detail: t('video_empty'), life: 3000 });
    return;
  }

  const validation = isValidVideoFile(selectedFile.value);
  if (!validation.valid) {
    toast.add({ severity: 'error', summary: t('title_error'), detail: validation.error, life: 3000 });
    return;
  }

  const customName = generateCustomVideoName(selectedDM.value.Identificacao, selectedDM.value.Video);

  try {
    isUploading.value = true;
    await videoService.uploadVideo(
      selectedFile.value,
      selectedDM.value.ID_DM,
      customName,
      (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    );
    toast.add({ severity: 'success', summary: t('title_sucess'), detail:t('file_uploaded', { file: customName }), life: 3000 });
    emit('update-video', { dmId: selectedDM.value.ID_DM, video: customName });
    closeDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('title_error'), detail: t('video_upload_failed'), life: 3000 });
  } finally {
    isUploading.value = false;
  }
};

// Função para fechar o diálogo
const closeDialog = () => {
    showDialog.value = false;
    showDeleteDialog.value = false;
    selectedDM.value = null;
    selectedFile.value = null;
    uploadProgress.value = 0;
};
</script>

<style scoped>

/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}

.formdevideo {
    display: grid;
}

/* Forçar o z-index para a máscara de fundo do diálogo */
.p-dialog {
    background: rgba(0, 0, 0, 0.568) !important;
    z-index: 99999 !important;
}

.error {
    color: red;
    font-weight: bold;
}

.name-file {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 280px;  /* Limite de largura para o nome do arquivo */
    display: block;
}

.file-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;  /* Garante que o nome se ajuste ao container */
    display: inline-block;
    vertical-align: middle;
}
</style>
