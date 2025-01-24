@ -1,249 +1,231 @@
<template>
    <!-- Div que contém a configuração inicial de vídeos -->
    <div class="config-inicial">
        <div class="">
            <!-- Exibe mensagem de erro caso ocorra algum problema -->
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <P class="mb-4 mt-6">Selecione uma DM no quadro abaixo para fazer o upload dos vídeos:</P>
            <div class="card flex align-items-center justify-content-center">
                <!-- Verifica se há opções de DM disponíveis -->
                <div class="flex grid my-2 flex justify-content-evenly flex-wrap" v-if="dmOptions.length > 0">
                    <div class="col-4">
                        <!-- Componente Listbox para selecionar a DM -->
                        <Listbox v-model="selectedDM" :options="dmOptions" filter optionLabel="label" class="mb-4" />
                    </div>

                    <Divider layout="vertical" />

                    <div class="file-upload">
                        <!-- Input para selecionar arquivos de vídeo -->
                        <input type="file" ref="fileInput" multiple accept=".mp4" @change="handleFiles" style="display: none" />
                    </div>

                    <!-- Caixa de diálogo de erro -->
                    <Dialog v-model:visible="showDialog" header="Erro!" :closable="false" :style="{ width: '300px' }" :draggable="false">
                        <p v-if="fileError" class="error">{{ fileError }}</p>
                    </Dialog>

                    <div class="col-3 my-3 p-0">
                        <!-- Botão para abrir o seletor de arquivos -->
                        <Button class="w-full" label="Selecionar Vídeos" icon="pi pi-folder-open" @click="triggerFileInput" />
                        <!-- Botão para enviar os vídeos -->
                        <Button class="my-2 w-full" label="Enviar Todos" icon="pi pi-upload" @click="uploadVideos" :disabled="filesToUpload.length === 0 || isUploading" />
                        <!-- Botão de conclusão de setup, habilitado apenas quando pelo menos um vídeo foi enviado -->
                        <Button class="w-full concluido" severity="success" label="Setup de Vídeo Concluído" icon="pi pi-check" @click="finalizarSetup" :disabled="!isAnyVideoUploaded" />
                    </div>

                    <Divider layout="vertical" />
                    <!-- Lista de vídeos selecionados para upload -->
                    <div class="col-4 file-list flex-wrap">
                        <div class="p-1 listadm">
                            <div v-for="(file, index) in filesToUpload" :key="index" class="file-list-item block w-full flex flex-column justify-content-start p-2" style="height: auto">
                                <!-- Título e Botão X em linha, alinhados -->
                                <div class="file-title-container flex justify-content-between align-items-center mb-2" style="width: 100%;">
                                    <span class="file-name flex-shrink-0 nowrap overflow-hidden	text-overflow-ellipsis max-w-full ">{{ file.customName }}</span> (DM: {{ file.dmId }})

                                    <!-- Botão "x" para remover o vídeo da lista -->
                                    <Button icon="pi pi-times" class="p-button-text m-0 p-button-danger  text-2xl text-red ml-2" style="font-size: 1.5rem; color: red" @click="removeVideo(index)" />
                                </div>

                                <!-- Barra de progresso abaixo <ProgressBar :value="100" class="mt-2 progress-bar min-h-2" style="width: 100%;" v-if="true" />-->
                                 
                                <ProgressBar :value="file.progress" class="my-2 progress-bar min-h-2" v-if="file.progress > 0" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Mensagem exibida quando não há DMs ou configuração já foi concluída -->
                <p v-else>Configuração inicial concluída!</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from '@/axios.js'; // Importa o axios para realizar requisições HTTP
import { ref, computed, defineProps, defineEmits } from 'vue'; // Funções do Vue para reatividade e manipulação de props
import { useToast } from 'primevue/usetoast'; // Importa a função de toast para exibir notificações

const toast = useToast(); // Instancia o objeto de notificações de toast

// Propriedades recebidas pelo componente, espera uma lista de DMs
const props = defineProps({
    dmList: Array // Recebe a lista de DMs (Dispositivos de Mídia) como prop
});

const selectedDM = ref(null); // DM selecionada pelo usuário
const filesToUpload = ref([]); // Lista de arquivos que serão enviados
const isUploading = ref(false); // Flag que indica se o upload está em andamento
const showDialog = ref(false);
const fileError = ref(''); // Mensagem de erro caso o usuário tente adicionar arquivos inválidos
const uploadedVideos = ref(0); // Contador de vídeos enviados com sucesso

// Computed para gerar as opções da lista de DMs (Identificação e ID)
const dmOptions = computed(() =>
    props.dmList.map((dm) => ({
        label: dm.Identificacao, // Nome do dispositivo
        value: dm.ID_DM // ID do dispositivo
    }))
);

// Função para remover um vídeo da lista de arquivos a serem enviados
const removeVideo = (index) => {
    // Remove o vídeo da lista de arquivos
    filesToUpload.value.splice(index, 1); // Remove 1 item no índice especificado
};

// Função para emitir o evento de término do setup de vídeo
const emit = defineEmits(['setup-concluido']);
const isAnyVideoUploaded = computed(() => uploadedVideos.value > 0); // Computed para verificar se ao menos um vídeo foi enviado

// Função que dispara o input de seleção de arquivos
const triggerFileInput = () => {
    // Verifica se uma DM foi selecionada
    if (!selectedDM.value) {
        // Define a mensagem de erro com uma mensagem genérica
        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Selecione a DM para adicionar vídeos.',
            life: 3000
        });

        return; // Impede o processo de seleção de arquivos
    }

    // Caso uma DM esteja selecionada, abre o seletor de arquivos
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.click(); // Abre a janela para selecionar arquivos
    }
};

// Função que emite o evento 'setup-concluido' para informar que o setup foi concluído
const finalizarSetup = () => {
    emit('setup-concluido');
};

// Função que manipula a seleção de arquivos de vídeo
const handleFiles = (event) => {
    const files = event.target.files; // Obtém os arquivos selecionados

    // Verifica se já existe um arquivo para a DM selecionada
    const dmIdSelected = selectedDM.value.value; // ID da DM selecionada

    const existingFile = filesToUpload.value.find((file) => file.dmId === dmIdSelected);
    if (existingFile) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Já existe um vídeo selecionado para a DM "${selectedDM.value.label}".`,
            life: 3000
        });
        return; // Impede a adição de um novo arquivo para a mesma DM
    }

    // Verifica e valida cada arquivo
    for (const file of files) {
        // Verifica se o arquivo não é do tipo mp4
        if (!file.type.includes('mp4')) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'Apenas arquivos .mp4 são permitidos.',
                life: 3000
            });
            continue; // Pula o arquivo inválido
        }

        // Verifica se o arquivo é maior que 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'O tamanho do arquivo não pode exceder 5MB.',
                life: 3000
            });
            continue; // Pula o arquivo inválido
        }

        // Gera um nome customizado para o arquivo
        const generatedName = `DM-${selectedDM.value.label}-v1`;

        // Adiciona o arquivo à lista de arquivos a serem enviados
        filesToUpload.value.push({
            file,
            dmId: selectedDM.value.value,
            customName: generatedName,
            fileName: file.name,
            progress: 0 // Inicializa o progresso do upload
        });
    }
};

// Função que faz o upload dos vídeos selecionados
const uploadVideos = async () => {
    if (filesToUpload.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Nenhum Arquivo',
            detail: 'Adicione arquivos antes de enviar.',
            life: 3000
        });
        return; // Retorna se não houver arquivos para enviar
    }

    isUploading.value = true; // Ativa o flag de upload

    // Envia cada arquivo individualmente
    for (const item of filesToUpload.value) {
        const formData = new FormData();
        formData.append('video', item.file); // Adiciona o arquivo
        formData.append('dmId', item.dmId); // Adiciona a ID da DM
        formData.append('fileName', item.fileName);
        formData.append('customName', item.customName); // Adiciona o nome customizado do arquivo

        try {
            // Envia o vídeo via POST para o servidor
            await axios.post('/video/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    item.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100); // Atualiza o progresso
                }
            });

            uploadedVideos.value++; // Incrementa o contador de vídeos enviados com sucesso

            // Exibe notificação de sucesso
            toast.add({
                severity: 'success',
                summary: 'Upload Concluído',
                detail: `Arquivo "${item.fileName}" foi enviado como "${item.customName}"`,
                life: 3000
            });
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            // Exibe notificação de erro caso o upload falhe
            toast.add({
                severity: 'error',
                summary: 'Erro de Upload',
                detail: `Falha ao enviar o vídeo "${item.fileName}".`,
                life: 3000
            });
        }
    }

    filesToUpload.value = []; // Limpa a lista de arquivos após o upload
    isUploading.value = false; // Desativa o flag de upload
};
</script>
<style scoped>
/* Container do item da lista */
.file-list-item {
    border-bottom: 1px solid #ccc; /* Linha divisória entre os itens */
}

</style>
