import { getFileExtension } from '@/helpers/HelperUtils';
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
    const formData = new FormData();

    // Cria uma cópia do objeto e remove campos desnecessários
    const sanitizedProduto = { ...produto };
    delete sanitizedProduto.imagemUrl;

    // Adiciona os arquivos ao FormData, se disponíveis
    if (files?.selectedFile) {
        delete sanitizedProduto.imagem1;
        const fileExtension = getFileExtension(files.selectedFile.type);
        formData.append('imagem1', `produto_${produto.nome}_${produto.codigo}_Princ${Date.now()}${fileExtension}`);
        formData.append('file_principal', files.selectedFile);
    }

    if (files?.selectedSecFile) {
        delete sanitizedProduto.imagem2;
        const fileExtension = getFileExtension(files.selectedSecFile.type);
        formData.append('imagem2', `produto_${produto.nome}_${produto.codigo}_Sec${Date.now()}${fileExtension}`);
        formData.append('file_secundario', files.selectedSecFile);
    }

    if (files?.selectedInfoFile) {
        delete sanitizedProduto.imagemdetalhe;
        const fileExtension = getFileExtension(files.selectedInfoFile.type);
        formData.append('imagemdetalhe', `produto_${produto.nome}_${produto.codigo}_Info${Date.now()}${fileExtension}`);
        formData.append('file_info', files.selectedInfoFile);
    }
    // Adiciona os campos do produto ao FormData
    Object.entries(sanitizedProduto).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : String(value));
    });
    return formData;
};

/**
 * Valida os dados do produto antes do envio.
 *
 * @param {Object} produto - Objeto do produto.
 * @returns {Object} - Objeto contendo erros de validação, se houver.
 */
export const validateProdutoData = (produto) => {
    const errors = {};

    if (!produto.nome || produto.nome.trim() === '') {
        errors.nome = 'O nome do produto é obrigatório.';
    }
    if (!produto.codigo || produto.codigo.trim() === '') {
        errors.codigo = 'O código (SKU) do produto é obrigatório.';
    }
    if (!produto.id_tipoProduto) {
        errors.id_tipoProduto = 'O tipo do produto deve ser selecionado.';
    }
    if (produto.validadedias < 0) {
        errors.validadedias = 'A validade não pode ser negativa.';
    }

    return errors;
};

/**
 * Enriquece o objeto produto com dados adicionais, como IDs do cliente e do usuário.
 *
 * @param {Object} produto - Objeto do produto.
 * @param {string} userId - ID do usuário.
 * @param {string} clienteId - ID do cliente.
 * @returns {Object} - Objeto do produto enriquecido.
 */
export const enrichProdutoData = (produto, userId, clienteId) => {
    return {
        ...produto,
        id_cliente: clienteId,
        id_usuario: userId
    };
};