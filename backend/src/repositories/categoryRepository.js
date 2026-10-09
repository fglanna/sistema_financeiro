const db = require('../database/connection');

/**
 * Retorna todas as categorias disponíveis para o usuário:
 * categorias padrão do sistema (is_default = TRUE) e as personalizadas do usuário.
 * Ordenadas por tipo e nome.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function findAllForUser(userId) {
  return db('categories')
    .where(function () {
      this.where('is_default', true).orWhere('user_id', userId);
    })
    .orderBy([{ column: 'type' }, { column: 'name' }])
    .select('id', 'user_id', 'name', 'type', 'is_default', 'created_at', 'updated_at');
}

/**
 * Busca uma categoria pelo id, validando que pertence ao usuário ou é padrão do sistema.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object|undefined>}
 */
async function findByIdForUser(id, userId) {
  return db('categories')
    .where('id', id)
    .where(function () {
      this.where('is_default', true).orWhere('user_id', userId);
    })
    .first();
}

/**
 * Busca uma categoria personalizada do usuário pelo id.
 * Não retorna categorias padrão — somente as do usuário.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object|undefined>}
 */
async function findCustomByIdAndUser(id, userId) {
  return db('categories')
    .where({ id, user_id: userId, is_default: false })
    .first();
}

/**
 * Cria uma nova categoria personalizada para o usuário.
 * @param {Object} data - { name, type, userId }
 * @returns {Promise<Object>}
 */
async function create({ name, type, userId }) {
  const [category] = await db('categories')
    .insert({
      user_id: userId,
      name,
      type,
      is_default: false,
    })
    .returning(['id', 'user_id', 'name', 'type', 'is_default', 'created_at', 'updated_at']);
  return category;
}

/**
 * Atualiza nome e/ou tipo de uma categoria personalizada do usuário.
 * @param {string} id
 * @param {string} userId
 * @param {Object} data - { name, type }
 * @returns {Promise<Object>}
 */
async function update(id, userId, { name, type }) {
  const [updated] = await db('categories')
    .where({ id, user_id: userId, is_default: false })
    .update({ name, type })
    .returning(['id', 'user_id', 'name', 'type', 'is_default', 'created_at', 'updated_at']);
  return updated;
}

/**
 * Exclui uma categoria personalizada do usuário.
 * Pode lançar erro de FK (ON DELETE RESTRICT) se houver lançamentos vinculados.
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<number>} quantidade de linhas excluídas
 */
async function remove(id, userId) {
  return db('categories')
    .where({ id, user_id: userId, is_default: false })
    .delete();
}

/**
 * Verifica se uma categoria personalizada possui lançamentos financeiros vinculados.
 * Usado para bloquear alteração de tipo e exclusão (RN08).
 * @param {string} categoryId
 * @returns {Promise<boolean>}
 */
async function hasLinkedTransactions(categoryId) {
  const result = await db('financial_transactions')
    .where('category_id', categoryId)
    .count('id as total')
    .first();
  return parseInt(result.total, 10) > 0;
}

module.exports = {
  findAllForUser,
  findByIdForUser,
  findCustomByIdAndUser,
  create,
  update,
  remove,
  hasLinkedTransactions,
};
