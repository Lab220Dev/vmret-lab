/**
 * Manipula mudanças na controladora selecionada.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} produtoSelecionado - Produto atualmente selecionado, com propriedades como `Controladora` e `Motor1`.
 * @param {Object[]} ListaItens - Lista de itens associados que afetam as opções disponíveis para a controladora.
 * @param {boolean} isEditMode - Indica se está no modo de edição, permitindo ajustes nas opções disponíveis.
 * @param {Object} options - Objeto contendo os estados reativos para atualizar as opções na UI.
 * @param {Object} options.molasOptions - Estado reativo para opções de molas disponíveis.
 * @param {Object} options.dipOptions - Estado reativo para opções de DIP disponíveis.
 * @param {Object} options.andarOptions - Estado reativo para opções de andar disponíveis.
 * @param {Object} options.posicaoOptions - Estado reativo para opções de posição disponíveis.
 * @param {Object} options.motorOptions - Estado reativo para opções de motor disponíveis.
 * @param {Object} options.placaOptions - Estado reativo para opções de placa disponíveis.
 *
 */
export const handleControladoraChange = (Controladoras, produtoSelecionado, ListaItens, isEditMode, options) => {
    const { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions } = options;
    const selectedControladora = Controladoras.find((c) => c.id === produtoSelecionado.Controladora);
    if (!selectedControladora) return;

    if (selectedControladora.tipo === '2018') {
        let molasOcupadas = ListaItens.filter((item) => {
            const [tipo, identificador] = item.Posicao.replace(/\s/g, '').split('/');
            return tipo === '2018' && Number(identificador) === selectedControladora.dados.placa;
        }).map((item) => {
            const [_, __, mola1] = item.Posicao.replace(/\s/g, '').split('/');
            return Number(mola1);
        });

        if (isEditMode && produtoSelecionado.Motor1) {
            molasOcupadas = molasOcupadas.filter((mola) => mola !== produtoSelecionado.Motor1);
        }

        const molasDisponiveis = selectedControladora.dados.molas.filter((mola) => !molasOcupadas.includes(mola));
        molasOptions.value = molasDisponiveis.map((mola) => ({ label: mola, value: mola }));
        placaOptions.value = [{ label: selectedControladora.dados.placa, value: selectedControladora.dados.placa }];
    } else if (selectedControladora.tipo === '2023') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];
        andarOptions.value = selectedControladora.dados.andar.map((a) => ({ label: a, value: a }));
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p }));
    } else if (selectedControladora.tipo === '2024') {
        motorOptions.value = [{ label: selectedControladora.dados.motor, value: selectedControladora.dados.motor }];
    } else if (selectedControladora.tipo === 'Locker') {
        dipOptions.value = [{ label: selectedControladora.dados.dip, value: selectedControladora.dados.dip }];
        posicaoOptions.value = selectedControladora.dados.posicao.map((p) => ({ label: p, value: p }));
    }
};

/**
 * Adiciona uma nova controladora à lista.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {string} tipo - Tipo da controladora a ser adicionada.
 * @param {Object} nextValues - Objeto contendo os valores padrão para cada tipo de controladora.
 */
export const addControladora = (Controladoras, tipo, nextValues) => {
    const newControladora = {
        ID: null,
        tipo,
        deleted: false,
        dados: tipo === '2018' ? { placa: nextValues['2018'].placa++ } : {}
    };
    Controladoras.push(newControladora);
};

/**
 * Remove uma controladora da lista.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {number} index - Índice da controladora a ser removida.
 */
export const removeControladora = (Controladoras, index) => {
    Controladoras[index].deleted = true;
};

/**
 * Preenche as opções de controladoras disponíveis para seleção.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @returns {Array} - Lista de opções formatadas para seleção.
 */
export const preencherControladoraOptions = (Controladoras) => {
    return Controladoras.map((controladora) => {
        const { id, tipo, dados } = controladora;

        // Identificador específico com base no tipo de controladora
        let identificador = '';
        if (tipo === '2018' || tipo === '2024') {
            identificador = dados.placa;
        } else if (tipo === '2023' || tipo === 'Locker') {
            identificador = dados.dip;
        } else {
            identificador = 'Indefinido'; // Caso para tipos desconhecidos
        }

        return {
            label: `Identificador: ${identificador}`,
            value: id
        };
    });
};

/**
 * Ajusta as contagens iniciais de valores das controladoras.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} nextValues - Objeto contendo os valores padrão para cada tipo de controladora.
 */
export const ajustarContagemInicial = (Controladoras, nextValues,) => {
    const placasExistentes2018 = Controladoras.filter((controladora) => controladora.tipo === '2018').map((controladora) => controladora.dados.placa);

    if (placasExistentes2018.length > 0) {
        nextValues['2018'].placa = Math.max(...placasExistentes2018) + 1;
    } else {
        nextValues['2018'].placa = 12; // Valor inicial caso não haja nenhuma
    }

    const dipsExistentes2023 = Controladoras.filter((controladora) => controladora.tipo === '2023').map((controladora) => controladora.dados.dip);

    if (dipsExistentes2023.length > 0) {
        nextValues['2023'].dip = Math.max(...dipsExistentes2023) + 1;
    } else {
        nextValues['2023'].dip = 2; // Valor inicial caso não haja nenhuma
    }

    const placas2024Existentes = Controladoras.filter((controladora) => controladora.tipo === '2024').map((controladora) => controladora.dados.placa);

    if (placas2024Existentes.length > 0) {
        nextValues['2024'].placa = Math.max(...placas2024Existentes) + 1;
    } else {
        nextValues['2024'].placa = 101; // Valor inicial caso não haja nenhuma
    }
};
/**
 * Mapeia as controladoras de um DM para o formato necessário.
 * @param {Object} DM - Objeto DM com dados das controladoras.
 * @returns {Object[]} - Lista de controladoras mapeadas.
 */
export const mapControladoras = async (DM) => {
    return DM.Controladoras.map((controladora) => ({
        id: controladora.ID,
        tipo: controladora.Tipo_Controladora,
        deleted: false,
        dados: {
            placa: controladora.Placa || null,
            dip: controladora.DIP || null,
            andar: Array.isArray(controladora.Andar)
                ? controladora.Andar.map(Number) 
                : controladora.Andar?.split(',').map(Number) || [], 
            posicao: Array.isArray(controladora.Posicao)
                ? controladora.Posicao.map(Number)
                : controladora.Posicao?.split(',').map(Number) || [],
            molas: Array.isArray(controladora.Mola1)
                ? controladora.Mola1.map(Number)
                : controladora.Mola1?.split(',').map(Number) || []
        }
    }));
};

/**
 * Seleciona todas as opções disponíveis para uma controladora.
 * @param {Object} controladora - Controladora a ser ajustada.
 */

export const selectAll = (controladora) => {
    if (controladora.tipo === '2018') {
        controladora.dados.molas = Array.from({ length: 10 }, (_, i) => i + 1);
    }
    if (controladora.tipo === '2023') {
        controladora.dados.andar = Array.from({ length: 6 }, (_, i) => i + 1);
        controladora.dados.posicao = Array.from({ length: 15 }, (_, i) => i + 1);
    }
    if (controladora.tipo === 'Locker') {
        controladora.dados.posicao = Array.from({ length: 14 }, (_, i) => i + 1);
    }
};

/**
 * Remove a seleção de todas as opções para uma controladora.
 * @param {Object} controladora - Controladora específica.
 */
export const desselectAll = (controladora) => {
    if (controladora.tipo === '2018') {
        controladora.dados.molas = [];
    }
    if (controladora.tipo === '2023') {
        controladora.dados.andar = [];
        controladora.dados.posicao = [];
    }
    if (controladora.tipo === 'Locker') {
        controladora.dados.posicao = [];
    }
};
/**
 * Valida o andar selecionado no produto atualmente em edição.
 * Caso nenhum andar seja selecionado, limpa os campos relacionados (`Posicao` e `Andar`)
 * e exibe uma mensagem de aviso ao usuário.
 *
 * @returns {void}
 */
export const validarAndarSelecionado = (produtoSelecionado) => {
    const Andar = produtoSelecionado.value.Andar;
    if (!Andar) {
        produtoSelecionado.value.Posicao = '';
        produtoSelecionado.value.Andar = '';
        throw Error('Selecione um andar antes de selecionar uma posição.');
    }
};
/**
 * Valida a mudança de andar e atualiza as posições disponíveis.
 *
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} produtoSelecionado - Objeto representando o produto atualmente selecionado.
 * @param {Object[]} ListaItens - Lista de itens associados.
 * @param {Object} posicaoOptions - Objeto reativo contendo as opções de posição.
 *
 * @returns {void}
 */
export const validarMudancaAndar = (Controladoras, produtoSelecionado, ListaItens, posicaoOptions) => {
    // Encontrar a controladora selecionada
    const selectedControladora = Controladoras.find((c) => c.id === produtoSelecionado.Controladora);

    if (!selectedControladora) {
        posicaoOptions.value = [];
        throw Error('Nenhuma controladora selecionada encontrada.');
    }

    // Filtrar molas ocupadas com base nos itens da lista
    const molasOcupadas = ListaItens.filter((item) => {
        const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/');
        return tipo === '2023' && Number(identificador) === selectedControladora.dados.dip && produtoSelecionado.Andar === Number(Andar);
    })
    .map((item) => {
        const [tipo, identificador, Andar, Posicao] = item.Posicao.replace(/\s/g, '').split('/');
        return Number(Posicao);
    });

    // Calcular molas disponíveis
    const molasDisponiveis = selectedControladora.dados.posicao.filter((mola) => !molasOcupadas.includes(mola));

    // Atualizar as opções de posição
    posicaoOptions.value = molasDisponiveis.map((mola) => ({ label: mola, value: mola }));
    posicaoOptions.value.sort((a, b) => a.value - b.value);
};

/**
 * Atualiza as opções disponíveis para controladoras com base no tipo de controladora.
 *
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis, cada uma contendo propriedades como `tipo` e `dados`.
 * @param {Object} options - Objeto contendo os estados reativos que serão atualizados.
 * @param {Object} options.molasOptions - Estado reativo para opções de molas.
 * @param {Object} options.dipOptions - Estado reativo para opções de DIP.
 * @param {Object} options.andarOptions - Estado reativo para opções de andar.
 * @param {Object} options.posicaoOptions - Estado reativo para opções de posição.
 * @param {Object} options.motorOptions - Estado reativo para opções de motor.
 * @param {Object} options.placaOptions - Estado reativo para opções de placa.
 *
 * @returns {void}
 */
export const preencherOpcoesControladoras = (Controladoras,options) => {
    const { molasOptions, dipOptions, andarOptions, posicaoOptions, motorOptions, placaOptions } = options;
    molasOptions.value = [];
    dipOptions.value = [];
    andarOptions.value = [];
    posicaoOptions.value = [];
    motorOptions.value = [];

    Controladoras.forEach((controladora) => {
        if (controladora.tipo === '2018') {
            molasOptions.value.push(...controladora.dados.molas);
            placaOptions.value.push(controladora.dados.placa);
        } else if (controladora.tipo === '2023') {
            dipOptions.value.push(controladora.dados.dip);
            andarOptions.value.push(...controladora.dados.andar);
            posicaoOptions.value.push(...controladora.dados.posicao);
        } else if (controladora.tipo === '2024') {
            motorOptions.value.push(controladora.dados.motor);
        }
    });
};
/**
 * Configura o cliente selecionado com base no DM.
 * @param {Object} ListaClientes - Lista de clientes disponíveis.
 * @param {Object} DM - Objeto DM com o cliente associado.
 * @returns {Object} - Cliente selecionado atualizado.
 */
export const configurarClienteSelecionado = (ListaClientes, DM) => {
    const client = ListaClientes.find((client) => client.value.id_cliente === DM.ID_Cliente);
    if (client) {
        return { ...client.value, usar_api: client.value.usar_api || false };
    }
    return { id_cliente: '', nome_cliente: '', usar_api: false };
};
/**
 * Valida os campos obrigatórios com base no tipo da controladora selecionada.
 *
 * @param {Object} produtoSelecionado - Objeto representando o produto atualmente selecionado.
 * @param {string} tipoControladoraSelecionada - Tipo da controladora selecionada (ex.: '2018', '2023').
 *
 * @throws {Error} - Lança um erro com uma mensagem apropriada se a validação falhar.
 *
 * @returns {void}
 */
export const validarCampos = (produtoSelecionado, tipoControladoraSelecionada) => {
    if (!produtoSelecionado.Controladora) {
        throw new Error('Preencha todos os campos obrigatórios para adicionar o item.');
    }

    if (tipoControladoraSelecionada === '2018') {
        if (
            !produtoSelecionado.id_produto ||
            !produtoSelecionado.Controladora ||
            !produtoSelecionado.Placa ||
            !produtoSelecionado.Motor1
        ) {
            throw new Error('Preencha todos os campos obrigatórios para a controladora 2018.');
        }
    } else if (tipoControladoraSelecionada === '2023') {
        if (
            !produtoSelecionado.id_produto ||
            !produtoSelecionado.Controladora ||
            !produtoSelecionado.Dip ||
            !produtoSelecionado.Andar ||
            !produtoSelecionado.Posicao
        ) {
            throw new Error('Preencha todos os campos obrigatórios para a controladora 2023.');
        }
    }
};
/**
 * Atualiza o tipo de uma controladora na lista de controladoras.
 *
 * @param {number} index - O índice da controladora a ser atualizada.
 * @param {string} tipo - O novo tipo da controladora.
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @param {Object} nextValues - Objeto contendo os próximos valores padrão para cada tipo de controladora.
 * @returns {void}
 */
export const updateTipoControladora = (index, tipo, Controladoras, nextValues) => {
    const count = Controladoras.filter((controladora) => controladora.tipo === tipo).length;
    const controladora = Controladoras[index];
    const maxControladoras = {
        2018: 16,
        2023: 90,
        Locker: Infinity,
        2024: Infinity
    };
    if (count >= maxControladoras[tipo]) {
        Controladoras.splice(index, 1);
        throw Error(`Você atingiu o limite máximo de controladoras ${tipo}`);
    }

    if (tipo === '2018') {
        controladora.dados.placa = nextValues['2018'].placa++;
        controladora.dados.molas = controladora.dados.molas || [];
    } else if (tipo === '2023') {
        controladora.dados.dip = nextValues['2023'].dip++;
        controladora.dados.andar = controladora.dados.andar || [];
        controladora.dados.posicao = controladora.dados.posicao || [];
    } else if (tipo === '2024') {
        controladora.dados.placa = nextValues['2024'].placa++;
        controladora.dados.motor = controladora.dados.motor || '';
    } else if (tipo === 'Locker') {
        controladora.dados.dip = nextValues['Locker'].dip++;
        controladora.dados.posicao = controladora.dados.posicao || [];
    }
};
/**
 * Encontra a controladora com base no tipo e identificador fornecidos.
 *
 * @param {string} tipo - Tipo da controladora (2018, 2023, 2024, Locker).
 * @param {number} identificador - Identificador da controladora (placa ou DIP).
 * @param {Object[]} Controladoras - Lista de controladoras disponíveis.
 * @returns {Object|null} - A controladora encontrada ou `null` se não existir.
 */
export const findControladora = (tipo, identificador, Controladoras) => {
    return Controladoras.find((c) => {
        if (c.tipo === tipo) {
            if (tipo === '2018' || tipo === '2024') {
                return c.dados.placa === identificador;
            } else if (tipo === '2023' || tipo === 'Locker') {
                return c.dados.dip === identificador;
            }
        }
        return false;
    });
};

/**
 * Atualiza o objeto `produtoSelecionado` com base no tipo de controladora e valores fornecidos.
 *
 * @param {Object} produtoSelecionado - Objeto do produto selecionado.
 * @param {string} tipo - Tipo da controladora (2018, 2023, 2024, Locker).
 * @param {Array<string|number>} valores - Array contendo os valores associados à controladora.
 */
export const updateProdutoSelecionado = (produtoSelecionado, tipo, valores) => {
    if (tipo === '2018') {
        produtoSelecionado.Placa = Number(valores[0]);
        produtoSelecionado.Motor1 = Number(valores[1]);
    } else if (tipo === '2023') {
        produtoSelecionado.Dip = Number(valores[0]);
        produtoSelecionado.Andar = Number(valores[1]);
        produtoSelecionado.Posicao = Number(valores[2]);
    } else if (tipo === '2024') {
        produtoSelecionado.Motor1 = Number(valores[0]);
    } else if (tipo === 'Locker') {
        produtoSelecionado.Dip = Number(valores[0]);
        produtoSelecionado.Posicao = Number(valores[1]);
    }
};