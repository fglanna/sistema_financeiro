const db = require('../database/connection');

/**
 * Retorna todas as formas de pagamento cadastradas no domínio fixo.
 * @returns {Promise<Array>}
 */
async function findAll() {
  return db('payment_methods')
    .select('id', 'name')
    .orderBy('id', 'asc');
}

/**
 * Busca uma forma de pagamento pelo seu ID numérico.
 * @param {number} id
 * @returns {Promise<Object|undefined>}
 */
async function findById(id) {
  return db('payment_methods')
    .where('id', id)
    .first();
}

module.exports = {
  findAll,
  findById,
};
