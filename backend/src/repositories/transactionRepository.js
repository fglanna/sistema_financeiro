const db = require('../database/connection');

/**
 * Retorna lançamentos financeiros do usuário com filtros opcionais (mês, ano, busca, categoria).
 * Ordenados por data de vencimento (due_date ASC).
 * Isolamento estrito por user_id (RN01).
 *
 * @param {string} userId
 * @param {Object} filters - { month, year, search, category_id }
 * @returns {Promise<Array>}
 */
async function findAll(userId, filters = {}) {
  const query = db('financial_transactions as ft')
    .select(
      'ft.id',
      'ft.user_id',
      'ft.category_id',
      'ft.payment_method_id',
      'ft.description',
      'ft.amount',
      'ft.type',
      'ft.status',
      'ft.due_date',
      'ft.payment_date',
      'ft.created_at',
      'ft.updated_at',
      'c.name as category_name',
      'c.type as category_type',
      'pm.name as payment_method_name'
    )
    .join('categories as c', 'ft.category_id', 'c.id')
    .join('payment_methods as pm', 'ft.payment_method_id', 'pm.id')
    .where('ft.user_id', userId);

  if (filters.month) {
    const monthNum = parseInt(filters.month, 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      query.whereRaw('EXTRACT(MONTH FROM ft.due_date) = ?', [monthNum]);
    }
  }

  if (filters.year) {
    const yearNum = parseInt(filters.year, 10);
    if (!isNaN(yearNum)) {
      query.whereRaw('EXTRACT(YEAR FROM ft.due_date) = ?', [yearNum]);
    }
  }

  if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
    query.where('ft.description', 'ilike', `%${filters.search.trim()}%`);
  }

  if (filters.category_id) {
    query.where('ft.category_id', filters.category_id);
  }

  return query.orderBy([
    { column: 'ft.due_date', order: 'asc' },
    { column: 'ft.created_at', order: 'asc' }
  ]);
}

/**
 * Busca um lançamento financeiro pelo ID, pertencente exclusivamente ao usuário.
 *
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object|undefined>}
 */
async function findById(id, userId) {
  return db('financial_transactions as ft')
    .select(
      'ft.id',
      'ft.user_id',
      'ft.category_id',
      'ft.payment_method_id',
      'ft.description',
      'ft.amount',
      'ft.type',
      'ft.status',
      'ft.due_date',
      'ft.payment_date',
      'ft.created_at',
      'ft.updated_at',
      'c.name as category_name',
      'c.type as category_type',
      'pm.name as payment_method_name'
    )
    .join('categories as c', 'ft.category_id', 'c.id')
    .join('payment_methods as pm', 'ft.payment_method_id', 'pm.id')
    .where({ 'ft.id': id, 'ft.user_id': userId })
    .first();
}

/**
 * Cria um novo lançamento financeiro vinculado ao usuário.
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function create(data) {
  const [transaction] = await db('financial_transactions')
    .insert({
      user_id: data.user_id,
      category_id: data.category_id,
      payment_method_id: data.payment_method_id,
      description: data.description,
      amount: data.amount,
      type: data.type,
      status: data.status,
      due_date: data.due_date,
      payment_date: data.payment_date || null,
    })
    .returning('*');

  return transaction;
}

/**
 * Atualiza um lançamento financeiro existente pertencente ao usuário.
 *
 * @param {string} id
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object|undefined>}
 */
async function update(id, userId, data) {
  const updatePayload = {
    category_id: data.category_id,
    payment_method_id: data.payment_method_id,
    description: data.description,
    amount: data.amount,
    type: data.type,
    status: data.status,
    due_date: data.due_date,
    payment_date: data.payment_date,
  };

  // Remove campos indefinidos
  Object.keys(updatePayload).forEach((key) => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  const [updated] = await db('financial_transactions')
    .where({ id, user_id: userId })
    .update(updatePayload)
    .returning('*');

  return updated;
}

/**
 * Exclui fisicamente um lançamento financeiro pertencente ao usuário.
 *
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<number>} Quantidade de linhas afetadas
 */
async function remove(id, userId) {
  return db('financial_transactions')
    .where({ id, user_id: userId })
    .delete();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
