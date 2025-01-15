import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar informações do usuário autenticado.
import { isValidCPF, isValidEmail } from '@/helpers/HelperValidacao';
const store = useAuthStore();

/**
 * Prepara os dados do funcionário para envio ao backend.
 * @param {Object} funcionario - Dados do funcionário.
 * @param {File|null} selectedFile - Arquivo selecionado para upload (opcional).
 * @param {boolean} isUpdate - Define se é uma atualização (true) ou criação (false).
 * @returns {FormData} - Os dados preparados em um FormData.
 */
export const prepareFuncionarioData = (funcionario, selectedFile = null, isUpdate = false) => {
    const formData = new FormData();

    // Se um arquivo for selecionado, prepare para substituí-lo
    if (selectedFile.value) {
        const fileExtension = selectedFile.value.name.split('.').pop();
        const nomeArquivo = `funcionario_${funcionario.nome.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExtension}`;
        formData.append('foto', nomeArquivo);
        formData.append('file', selectedFile);

        // Para atualização, sinalize que a foto antiga deve ser removida
        if (isUpdate) {
            formData.append('remove_old_photo', true);
        }
    } else if (isUpdate) {
        // Se não houver arquivo novo, mantenha a foto antiga
        formData.append('foto', funcionario.foto);
    }

    // Remova o campo `foto` da lógica de manipulação se um arquivo novo for enviado
    const { foto, itens, ...restOfFuncionario } = funcionario;

    // Processar os itens do funcionário
    const itensUnicos = Array.from(new Set(itens.map((item) => item.id_produto))).map((id_produto) => itens.find((item) => item.id_produto === id_produto));

    formData.append('itens', JSON.stringify(itensUnicos));

    // Adicionar os demais campos do funcionário
    Object.entries(restOfFuncionario).forEach(([key, value]) => {
        formData.append(key, value);
    });

    // Campos obrigatórios
    formData.append('id_cliente', store.userIdCliente);
    formData.append('id_usuario', store.userId);

    return formData;
};

export const prepareprodutoData = (funcionario, produto) => {
    return {
        id_cliente: store.userIdCliente,
        id_usuario: store.userId,
        id_funcionario: funcionario.id_funcionario,
        id_produto: produto.value.id_produto,
        quantidade: produto.value.quantidade
    };
};

export const validateForm = (funcionario) => {
    const errors = {};
    if (!funcionario.CPF || !isValidCPF(funcionario.CPF)) {
        errors.CPF = 'CPF inválido';
    }
    if (!funcionario.email || !isValidEmail(funcionario.email)) {
        errors.email = 'E-mail inválido';
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
/**
 * Valida o CPF e atualiza o objeto de erros.
 *
 * @param {string} CPF - O CPF a ser validado.
 * @param {Object} errors - O objeto de erros a ser atualizado.
 */
export const validadorcpf=(CPF)=>{
    if (!CPF) {
       return 'O CPF é obrigatório';
    } else if (!isValidCPF(CPF)) {
        return 'CPF inválido';
    } else {
        return '';
    }
}

export const validadoremail = (email) => {
    if (!email) {
        return 'O e-mail é obrigatório';
    } else if (!isValidEmail(email)) {
       return 'E-mail inválido';
    } else {
        return '';
    }
}