import { getFileExtension } from '@/helpers/HelperUtils'; // Importa a função de imagem
import { useAuthStore } from '@/store/authStore.js';
const store = useAuthStore()
/**
 * Prepara os dados do produto para envio ao backend.
 * Remove campos desnecessários e adiciona arquivos.
 *
 * @param {Object} produto - Objeto do produto.
 * @param {Object} files - Arquivos relacionados ao produto (opcional).
 * @returns {FormData} - Objeto FormData pronto para envio.
 */
export const prepareProdutoData = (produto, files) => {
    // Cria um novo objeto FormData para envio dos dados e arquivos
    const formData = new FormData();
    const sanitizedProduto = { ...produto };

    // Remove a propriedade `imagemUrl` do objeto, pois não será enviada no FormData
    delete sanitizedProduto.imagemUrl;
    if (files?.selectedFile) {
        // Remove a propriedade `imagem1` do produto, que é redundante quando o arquivo está sendo enviado
        delete sanitizedProduto.imagem1;
        const fileExtension = getFileExtension(files.selectedFile.type);// Obtém a extensão do arquivo.

        // Adiciona o arquivo ao FormData com um nome gerado dinamicamente
        formData.append('imagem1', `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}${fileExtension}`);

        // Adiciona o arquivo real ao FormData, para ser enviado no formulário
        formData.append('file_principal', files.selectedFile);
    }

    if (files?.selectedSecFile) {
        // Remove a propriedade `imagem2` do produto, que é redundante quando o arquivo está sendo enviado
        delete sanitizedProduto.imagem2;
        const fileExtension = getFileExtension(files.selectedSecFile.type);// Obtém a extensão do arquivo.

        // Adiciona o arquivo ao FormData com um nome gerado dinamicamente
        formData.append('imagem2', `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}${fileExtension}`);

        // Adiciona o arquivo real ao FormData, para ser enviado no formulário
        formData.append('file_secundario', files.selectedSecFile);
    }

    if (files?.selectedInfoFile) {
        // Remove a propriedade `imagemdetalhe` do produto, que é redundante quando o arquivo está sendo enviado
        delete sanitizedProduto.imagemdetalhe;
        const fileExtension = getFileExtension(files.selectedInfoFile.type);

        // Adiciona o arquivo ao FormData com um nome gerado dinamicamente
        formData.append('imagemdetalhe', `produto_${produto.nome}_${produto.codigo}_Info${Date.now()}${fileExtension}`);

        // Adiciona o arquivo real ao FormData, para ser enviado no formulário
        formData.append('file_info', files.selectedInfoFile);
    }

    Object.entries(sanitizedProduto).forEach(([key, value]) => {
        // Adiciona cada propriedade do produto ao FormData
        formData.append(key, typeof value === 'string' ? value : String(value));
    });

    // Retorna o FormData contendo os dados do produto e os arquivos
    return formData;
};

/**
 * Valida os dados do produto, verificando se os campos obrigatórios estão preenchidos e se os valores são válidos.
 * 
 * A função realiza as seguintes validações:
 * - Verifica se o nome do produto não está vazio.
 * - Verifica se o código (SKU) do produto não está vazio.
 * - Verifica se o tipo do produto foi selecionado.
 * - Verifica se o valor de validade não é negativo.
 * 
 * Caso algum dos campos seja inválido, um erro será registrado para aquele campo específico.
 * 
 * @param {Object} produto - Objeto contendo os dados do produto a serem validados.
 * @param {string} produto.nome - Nome do produto.
 * @param {string} produto.codigo - Código (SKU) do produto.
 * @param {number} produto.id_tipoProduto - Tipo do produto (ID).
 * @param {number} produto.validadedias - Validade do produto em dias.
 * @returns {Object} - Retorna um objeto contendo os erros encontrados durante a validação. Se não houver erros, retorna um objeto vazio.
 */
export const validateProdutoData = (produto) => {
    // Cria um objeto `errors` para armazenar os erros de validação
    const errors = {};

    if (!produto.nome || produto.nome.trim() === '') {  // Verifica se o nome do produto foi fornecido.
        errors.nome = 'O nome do produto é obrigatório.';   // Adiciona uma mensagem de erro ao objeto `errors`.
    }

    if (!produto.codigo || produto.codigo.trim() === '') {  // Verifica se o código (SKU) do produto foi fornecido.
        errors.codigo = 'O código (SKU) do produto é obrigatório.';   // Adiciona uma mensagem de erro ao objeto `errors`.
    }

    if (!produto.id_tipoProduto) {  // Verifica se o tipo do produto foi selecionado.
        errors.id_tipoProduto = 'O tipo do produto deve ser selecionado.';  // Adiciona uma mensagem de erro ao objeto `errors`.    
    }

    if (produto.validadedias < 0) { // Verifica se o valor de validade é negativo.
        errors.validadedias = 'A validade não pode ser negativa.';  // Adiciona uma mensagem de erro ao objeto `errors`.
    }

    // Retorna o objeto `errors` contendo todos os erros encontrados durante a validação
    return errors;  
};

/**
 * Função que enriquece os dados do produto com informações adicionais do cliente e do usuário.
 *
 * @param {Object} produto - O objeto contendo as informações do produto.
 * @param {number|string} userId - O ID do usuário que está realizando a ação.
 * @param {number|string} clienteId - O ID do cliente ao qual o produto está associado.
 * 
 * @returns {Object} O objeto do produto com os IDs de cliente e usuário adicionados.
 */
export const enrichProdutoData = (produto, userId, clienteId) => {
    // Retorna um novo objeto com os dados do produto e os IDs de cliente e usuário
    return {
        ...produto, // Adiciona todas as propriedades do produto ao novo objeto     
        id_cliente: clienteId,  // Adiciona o ID do cliente ao objeto
        id_usuario: userId  // Adiciona o ID do usuário ao objeto
    };
};