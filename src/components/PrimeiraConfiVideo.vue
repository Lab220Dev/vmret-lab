<template>
    <!-- Div que contém a configuração inicial de vídeos -->
    <div class="config-inicial">
        <h2>Configuração Inicial de Vídeos</h2>

        <!-- Exibe mensagem de erro caso ocorra algum problema -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <!-- Verifica se há opções de DM disponíveis -->
        <div v-if="dmOptions.length > 0">
            <h3>Selecione a DM para adicionar vídeos:</h3>
            <!-- Componente Listbox para selecionar a DM -->
            <Listbox v-model="selectedDM" :options="dmOptions" optionLabel="label" class="mb-4" />

            <div class="file-upload">
                <!-- Input para selecionar arquivos de vídeo -->
                <input type="file" ref="fileInput" multiple accept=".mp4" @change="handleFiles" style="display: none" />
                <p v-if="fileError" class="error">{{ fileError }}</p>

                <!-- Botão para abrir o seletor de arquivos -->
                <Button label="Selecionar Vídeos" icon="pi pi-folder-open" @click="triggerFileInput" />
                <!-- Botão para enviar os vídeos -->
                <Button
                    label="Enviar Todos"
                    icon="pi pi-upload"
                    @click="uploadVideos"
                    :disabled="filesToUpload.length === 0 || isUploading"
                />
            </div>

            <!-- Lista de vídeos selecionados para upload -->
            <div class="file-list" v-if="filesToUpload.length > 0">
                <h4>Vídeos para Upload:</h4>
                <ul>
                    <li v-for="(file, index) in filesToUpload" :key="index">
                        <span>{{ file.customName }}</span> (DM: {{ file.dmId }})
                        <!-- Barra de progresso para cada vídeo sendo enviado -->
                        <ProgressBar :value="file.progress" class="mt-2" v-if="file.progress > 0" />
                    </li>
                </ul>
            </div>

            <!-- Botão de conclusão de setup, habilitado apenas quando pelo menos um vídeo foi enviado -->
            <Button
                label="Setup de Vídeo Concluído"
                icon="pi pi-check"
                @click="finalizarSetup"
                :disabled="!isAnyVideoUploaded"
            />
        </div>

        <!-- Mensagem exibida quando não há DMs ou configuração já foi concluída -->
        <p v-else>Configuração inicial concluída!</p>
    </div>
</template>

<script setup>
import axios from '@/axios.js'; // Importa o axios para realizar requisições HTTP
import { ref, computed, defineProps, defineEmits } from 'vue'; // Funções do Vue para reatividade e manipulação de props
import { useToast } from 'primevue/usetoast'; // Importa a função de toast para exibir notificações

const toast = useToast(); // Instancia o objeto de notificações de toast

// Propriedades recebidas pelo componente, espera uma lista de DMs
const props = defineProps({
    dmList: Array, // Recebe a lista de DMs (Dispositivos de Mídia) como prop
});

const selectedDM = ref(null); // DM selecionada pelo usuário
const filesToUpload = ref([]); // Lista de arquivos que serão enviados
const isUploading = ref(false); // Flag que indica se o upload está em andamento
const fileError = ref(''); // Mensagem de erro caso o usuário tente adicionar arquivos inválidos
const uploadedVideos = ref(0); // Contador de vídeos enviados com sucesso

// Computed para gerar as opções da lista de DMs (Identificação e ID)
const dmOptions = computed(() =>
    props.dmList.map((dm) => ({
        label: dm.Identificacao, // Nome do dispositivo
        value: dm.ID_DM, // ID do dispositivo
    }))
);

// Função para emitir o evento de término do setup de vídeo
const emit = defineEmits(['setup-concluido']);
const isAnyVideoUploaded = computed(() => uploadedVideos.value > 0); // Computed para verificar se ao menos um vídeo foi enviado

// Função que dispara o input de seleção de arquivos
const triggerFileInput = () => {
    fileError.value = ''; // Reseta qualquer erro anterior
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.click(); // Abre o seletor de arquivos
    }
};

// Função que emite o evento 'setup-concluido' para informar que o setup foi concluído
const finalizarSetup = () => {
    emit('setup-concluido');
};

// Função que manipula a seleção de arquivos de vídeo
const handleFiles = (event) => {
    const files = event.target.files; // Obtém os arquivos selecionados

    // Verifica se uma DM foi selecionada
    if (!selectedDM.value) {
        fileError.value = 'Selecione uma DM antes de adicionar arquivos.';
        return;
    }

    // Verifica e valida cada arquivo
    for (const file of files) {
        // Verifica se o arquivo não é do tipo mp4
        if (!file.type.includes('mp4')) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'Apenas arquivos .mp4 são permitidos.',
                life: 3000,
            });
            continue; // Pula o arquivo inválido
        }

        // Verifica se o arquivo é maior que 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Erro de Arquivo',
                detail: 'O tamanho do arquivo não pode exceder 5MB.',
                life: 3000,
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
            progress: 0, // Inicializa o progresso do upload
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
            life: 3000,
        });
        return; // Retorna se não houver arquivos para enviar
    }

    isUploading.value = true; // Ativa o flag de upload

    // Envia cada arquivo individualmente
    for (const item of filesToUpload.value) {
        const formData = new FormData();
        formData.append('video', item.file); // Adiciona o arquivo
        formData.append('dmId', item.dmId); // Adiciona a ID da DM
        formData.append('customName', item.customName); // Adiciona o nome customizado do arquivo

        try {
            // Envia o vídeo via POST para o servidor
            await axios.post('/video/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    item.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100); // Atualiza o progresso
                },
            });

            uploadedVideos.value++; // Incrementa o contador de vídeos enviados com sucesso

            // Exibe notificação de sucesso
            toast.add({
                severity: 'success',
                summary: 'Upload Concluído',
                detail: `Vídeo "${item.customName}" enviado com sucesso!`,
                life: 3000,
            });
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            // Exibe notificação de erro caso o upload falhe
            toast.add({
                severity: 'error',
                summary: 'Erro de Upload',
                detail: `Falha ao enviar o vídeo "${item.customName}".`,
                life: 3000,
            });
        }
    }

    filesToUpload.value = []; // Limpa a lista de arquivos após o upload
    isUploading.value = false; // Desativa o flag de upload
};
</script>