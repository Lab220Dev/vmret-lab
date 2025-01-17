import axios from '@/axios.js'; // Importa o axios para fazer requisições HTTP.

const videoService = {
    /**
     * Envia um vídeo para o servidor.
     *
     * @param {File} file - O arquivo de vídeo a ser enviado.
     * @param {string} dmId - ID associado à entidade (geralmente a algum tipo de documento ou registro) no servidor.
     * @param {string} customName - Nome personalizado para o arquivo de vídeo.
     * @param {function} onProgress - Função de callback para monitorar o progresso do upload (ex: mostrando barra de progresso).
     * @returns {Promise} - Retorna uma Promise que resolve com a resposta do servidor.
     *
     * Possíveis respostas esperadas:
     * - Sucesso: O vídeo foi carregado corretamente no servidor. O servidor retorna um objeto contendo informações do vídeo ou status de sucesso.
     * - Erro: Ocorre um erro durante o upload, como problemas de rede ou no servidor.
     *
     * Exemplos de erros:
     * - Erro 400: Dados inválidos no upload (ex: arquivo muito grande ou formato não suportado).
     * - Erro 500: Problema no servidor ao tentar fazer o upload do vídeo.
     * - Erro 403: O cliente não tem permissão para realizar o upload.
     */
    async uploadVideo(file, dmId, customName, onProgress) {
        const formData = new FormData(); // Cria um novo objeto FormData para enviar o arquivo e outros dados no corpo da requisição.

        // Adiciona o arquivo de vídeo ao FormData com a chave 'video'.
        formData.append('video', file);

        // Adiciona o ID do documento ou entidade associada ao upload (dmId) ao FormData.
        formData.append('dmId', dmId);

        // Adiciona um nome personalizado para o vídeo, que será usado no servidor ou para exibição.
        formData.append('customName', customName);

        try {
            // Faz a requisição POST para o servidor, enviando o FormData com o vídeo e outros dados.
            const response = await axios.post('/video/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Define o cabeçalho para que o corpo da requisição seja tratado como um formulário de arquivos.
                onUploadProgress: onProgress // Define a função de callback para monitorar o progresso do upload (ex: porcentagem).
            });

            return response.data; // Retorna os dados da resposta do servidor, que podem incluir informações do vídeo carregado (ex: URL do vídeo, status, etc).
        } catch (error) {
            console.error('Erro ao fazer upload de vídeo:', error.message); // Registra um erro no console caso algo dê errado no upload.

            // Lança o erro novamente para que possa ser tratado em outro lugar, por exemplo, no componente que chamou esta função.
            throw error;
        }
    },

    /**
     * Exclui um vídeo com base no ID fornecido.
     *
     * @param {string} dmId - ID do vídeo a ser excluído.
     * @returns {Promise} Retorna a Promise da requisição axios que contém a resposta da exclusão do vídeo.
     * @throws {Error} Lança um erro se a requisição falhar, permitindo que o chamador lide com o erro.
     */
    async deleteVideo(dmId) {
        // Cria um objeto `data` com o ID do vídeo a ser excluído.
        const data = { dmId: dmId };

        try {
            // Envia uma requisição POST para excluir o vídeo com o ID fornecido.
            const response = await axios.post('/video/delete', data);

            // Retorna os dados da resposta da requisição, que indicam se a exclusão foi bem-sucedida.
            return response.data;
        } catch (error) {
            // Caso ocorra um erro durante a requisição, loga a mensagem de erro no console.
            console.error('Erro ao fazer upload de vídeo:', error.message);

            // Lança o erro novamente para que o chamador possa tratá-lo adequadamente.
            throw error;
        }
    }
};

export default videoService; // Exporta o serviço para ser usado em outros módulos ou componentes.
