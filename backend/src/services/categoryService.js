const categoryRepository = require('../repositories/categoryRepository');
const { AppError } = require('../middlewares/errorHandler');

class CategoryService {
  /**
   * Retorna a lista consolidada das categorias padrão do sistema e personalizadas do usuário.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getAll(userId) {
    if (!userId) {
      throw new AppError('Identificador de usuário não fornecido.', 401);
    }
    return categoryRepository.findAllForUser(userId);
  }

  /**
   * Cria uma nova categoria personalizada para o usuário.
   * @param {string} userId
   * @param {Object} data - { name, type }
   * @returns {Promise<Object>}
   */
  async create(userId, { name, type }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('O nome da categoria é obrigatório.', 400);
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      throw new AppError('O nome da categoria deve ter no máximo 50 caracteres.', 400);
    }

    if (!type || !['RECEITA', 'DESPESA'].includes(type)) {
      throw new AppError('O tipo da categoria deve ser RECEITA ou DESPESA.', 400);
    }

    return categoryRepository.create({
      userId,
      name: trimmedName,
      type,
    });
  }

  /**
   * Atualiza uma categoria personalizada do usuário.
   * Impede a alteração de tipo (type) se a categoria possuir lançamentos vinculados (RN08).
   * Impede alteração de categorias padrão do sistema.
   *
   * @param {string} id
   * @param {string} userId
   * @param {Object} data - { name, type }
   * @returns {Promise<Object>}
   */
  async update(id, userId, { name, type }) {
    const category = await categoryRepository.findByIdForUser(id, userId);

    if (!category) {
      throw new AppError('Categoria não encontrada.', 404);
    }

    if (category.is_default) {
      throw new AppError('Categorias padrão do sistema não podem ser editadas.', 400);
    }

    let updatedName = category.name;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('O nome da categoria não pode ser vazio.', 400);
      }
      if (name.trim().length > 50) {
        throw new AppError('O nome da categoria deve ter no máximo 50 caracteres.', 400);
      }
      updatedName = name.trim();
    }

    let updatedType = category.type;
    if (type !== undefined) {
      if (!['RECEITA', 'DESPESA'].includes(type)) {
        throw new AppError('O tipo da categoria deve ser RECEITA ou DESPESA.', 400);
      }

      // Trava de alteração de tipo caso haja lançamentos vinculados (RN08)
      if (type !== category.type) {
        const hasTransactions = await categoryRepository.hasLinkedTransactions(id);
        if (hasTransactions) {
          throw new AppError(
            'Não é permitido alterar o tipo de uma categoria que possui lançamentos financeiros vinculados.',
            400
          );
        }
        updatedType = type;
      }
    }

    return categoryRepository.update(id, userId, {
      name: updatedName,
      type: updatedType,
    });
  }

  /**
   * Exclui uma categoria personalizada do usuário.
   * Bloqueia a exclusão de categorias padrão e de categorias com lançamentos vinculados (RN08).
   *
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async delete(id, userId) {
    const category = await categoryRepository.findByIdForUser(id, userId);

    if (!category) {
      throw new AppError('Categoria não encontrada.', 404);
    }

    if (category.is_default) {
      throw new AppError('Categorias padrão do sistema não podem ser excluídas.', 400);
    }

    const hasTransactions = await categoryRepository.hasLinkedTransactions(id);
    if (hasTransactions) {
      throw new AppError(
        'Não é possível excluir uma categoria que possui lançamentos financeiros vinculados.',
        400
      );
    }

    await categoryRepository.remove(id, userId);
    return { message: 'Categoria excluída com sucesso.' };
  }
}

module.exports = new CategoryService();
