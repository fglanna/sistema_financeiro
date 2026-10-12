const transactionRepository = require('../repositories/transactionRepository');
const categoryRepository = require('../repositories/categoryRepository');
const paymentMethodRepository = require('../repositories/paymentMethodRepository');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Converte data para string YYYY-MM-DD.
 */
function formatDateToYMD(date) {
  if (!date) return null;
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return date;
}

/**
 * Retorna a data atual no formato YYYY-MM-DD.
 */
function getTodayYMD() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validador de formato de data YYYY-MM-DD.
 */
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

class TransactionService {
  /**
   * Retorna os lançamentos financeiros do usuário com base nos filtros informados.
   * Isolamento estrito por user_id (RN01).
   *
   * @param {string} userId
   * @param {Object} filters - { month, year, search, category_id }
   * @returns {Promise<Array>}
   */
  async getAll(userId, filters = {}) {
    if (!userId) {
      throw new AppError('Identificador de usuário não fornecido.', 401);
    }
    return transactionRepository.findAll(userId, filters);
  }

  /**
   * Busca um lançamento financeiro pelo ID, pertencente ao usuário.
   *
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getById(id, userId) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new AppError('Lançamento financeiro não encontrado.', 404);
    }
    return transaction;
  }

  /**
   * Cria um novo lançamento financeiro.
   * Validações de consistência de datas (RN05) e compatibilidade de categoria (RN08).
   *
   * @param {string} userId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(userId, data) {
    const {
      description,
      amount,
      type,
      category_id,
      payment_method_id,
      status,
      due_date,
      payment_date,
    } = data;

    // Validação da Descrição
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new AppError('A descrição do lançamento é obrigatória.', 400);
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 150) {
      throw new AppError('A descrição deve ter no máximo 150 caracteres.', 400);
    }

    // Validação do Valor
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new AppError('O valor do lançamento deve ser maior que zero.', 400);
    }

    // Validação do Tipo
    if (!type || !['RECEITA', 'DESPESA'].includes(type)) {
      throw new AppError('O tipo do lançamento deve ser RECEITA ou DESPESA.', 400);
    }

    // Validação do Status
    if (!status || !['PAGO', 'PENDENTE'].includes(status)) {
      throw new AppError('O status do lançamento deve ser PAGO ou PENDENTE.', 400);
    }

    // Validação de due_date (RN05)
    if (!due_date || !isValidDateString(due_date)) {
      throw new AppError('A data de vencimento (due_date) é obrigatória e deve estar no formato AAAA-MM-DD.', 400);
    }

    // Validação de payment_date conforme Status (RN05)
    let sanitizedPaymentDate = null;
    if (status === 'PAGO') {
      if (!payment_date || !isValidDateString(payment_date)) {
        throw new AppError('A data de pagamento/recebimento (payment_date) é obrigatória para lançamentos com status PAGO.', 400);
      }
      sanitizedPaymentDate = payment_date;
    } else {
      // Se PENDENTE, payment_date deve ser NULL (RN05)
      sanitizedPaymentDate = null;
    }

    // Validação da Forma de Pagamento
    const parsedPaymentMethodId = parseInt(payment_method_id, 10);
    if (isNaN(parsedPaymentMethodId)) {
      throw new AppError('A forma de pagamento é obrigatória.', 400);
    }
    const paymentMethod = await paymentMethodRepository.findById(parsedPaymentMethodId);
    if (!paymentMethod) {
      throw new AppError('Forma de pagamento não encontrada.', 400);
    }

    // Validação da Categoria e compatibilidade de tipo (RN08)
    if (!category_id) {
      throw new AppError('A categoria é obrigatória.', 400);
    }
    const category = await categoryRepository.findByIdForUser(category_id, userId);
    if (!category) {
      throw new AppError('Categoria não encontrada ou inacessível para este usuário.', 400);
    }

    // Regra RN08: Compatibilidade estrita category.type === transaction.type
    if (category.type !== type) {
      throw new AppError(
        `O tipo da categoria selecionada (${category.type}) é incompatível com o tipo do lançamento (${type}).`,
        400
      );
    }

    const createdTransaction = await transactionRepository.create({
      user_id: userId,
      category_id,
      payment_method_id: parsedPaymentMethodId,
      description: trimmedDescription,
      amount: parsedAmount,
      type,
      status,
      due_date,
      payment_date: sanitizedPaymentDate,
    });

    return transactionRepository.findById(createdTransaction.id, userId);
  }

  /**
   * Gera um rascunho de duplicação em memória (sem persistência no banco).
   * Preserva a descrição original intacta, status = 'PENDENTE', payment_date = null.
   *
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async duplicateDraft(id, userId) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new AppError('Lançamento financeiro não encontrado.', 404);
    }

    return {
      description: transaction.description,
      amount: Number(transaction.amount),
      type: transaction.type,
      category_id: transaction.category_id,
      payment_method_id: transaction.payment_method_id,
      status: 'PENDENTE',
      due_date: getTodayYMD(),
      payment_date: null,
    };
  }

  /**
   * Atualiza um lançamento financeiro existente.
   * Valida compatibilidade de categoria (RN08) e regras de datas (RN05).
   *
   * @param {string} id
   * @param {string} userId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, userId, data) {
    const existingTransaction = await transactionRepository.findById(id, userId);
    if (!existingTransaction) {
      throw new AppError('Lançamento financeiro não encontrado.', 404);
    }

    const updateData = {};

    // Descrição
    if (data.description !== undefined) {
      if (typeof data.description !== 'string' || data.description.trim().length === 0) {
        throw new AppError('A descrição não pode ser vazia.', 400);
      }
      if (data.description.trim().length > 150) {
        throw new AppError('A descrição deve ter no máximo 150 caracteres.', 400);
      }
      updateData.description = data.description.trim();
    }

    // Valor
    if (data.amount !== undefined) {
      const parsedAmount = Number(data.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError('O valor deve ser maior que zero.', 400);
      }
      updateData.amount = parsedAmount;
    }

    // Tipo
    const targetType = data.type !== undefined ? data.type : existingTransaction.type;
    if (data.type !== undefined) {
      if (!['RECEITA', 'DESPESA'].includes(data.type)) {
        throw new AppError('O tipo do lançamento deve ser RECEITA ou DESPESA.', 400);
      }
      updateData.type = data.type;
    }

    // Categoria
    const targetCategoryId = data.category_id !== undefined ? data.category_id : existingTransaction.category_id;
    if (data.category_id !== undefined || data.type !== undefined) {
      const category = await categoryRepository.findByIdForUser(targetCategoryId, userId);
      if (!category) {
        throw new AppError('Categoria não encontrada ou inacessível para este usuário.', 400);
      }
      // Validação RN08
      if (category.type !== targetType) {
        throw new AppError(
          `O tipo da categoria selecionada (${category.type}) é incompatível com o tipo do lançamento (${targetType}).`,
          400
        );
      }
      updateData.category_id = targetCategoryId;
    }

    // Forma de Pagamento
    if (data.payment_method_id !== undefined) {
      const parsedPaymentMethodId = parseInt(data.payment_method_id, 10);
      if (isNaN(parsedPaymentMethodId)) {
        throw new AppError('Forma de pagamento inválida.', 400);
      }
      const paymentMethod = await paymentMethodRepository.findById(parsedPaymentMethodId);
      if (!paymentMethod) {
        throw new AppError('Forma de pagamento não encontrada.', 400);
      }
      updateData.payment_method_id = parsedPaymentMethodId;
    }

    // Status e Datas (RN05)
    const targetStatus = data.status !== undefined ? data.status : existingTransaction.status;
    if (data.status !== undefined) {
      if (!['PAGO', 'PENDENTE'].includes(data.status)) {
        throw new AppError('O status do lançamento deve ser PAGO ou PENDENTE.', 400);
      }
      updateData.status = data.status;
    }

    if (data.due_date !== undefined) {
      if (!isValidDateString(data.due_date)) {
        throw new AppError('A data de vencimento (due_date) deve estar no formato AAAA-MM-DD.', 400);
      }
      updateData.due_date = data.due_date;
    }

    if (targetStatus === 'PAGO') {
      const finalPaymentDate = data.payment_date !== undefined
        ? data.payment_date
        : formatDateToYMD(existingTransaction.payment_date);

      if (!finalPaymentDate || !isValidDateString(finalPaymentDate)) {
        throw new AppError(
          'A data de pagamento/recebimento (payment_date) é obrigatória para lançamentos com status PAGO.',
          400
        );
      }
      updateData.payment_date = finalPaymentDate;
    } else {
      // Se PENDENTE, payment_date deve ser NULL (RN05)
      updateData.payment_date = null;
    }

    await transactionRepository.update(id, userId, updateData);
    return transactionRepository.findById(id, userId);
  }

  /**
   * Exclui fisicamente um lançamento financeiro pertencente ao usuário.
   *
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async delete(id, userId) {
    const existingTransaction = await transactionRepository.findById(id, userId);
    if (!existingTransaction) {
      throw new AppError('Lançamento financeiro não encontrado.', 404);
    }

    await transactionRepository.remove(id, userId);
    return { message: 'Lançamento financeiro excluído com sucesso.' };
  }
}

module.exports = new TransactionService();
