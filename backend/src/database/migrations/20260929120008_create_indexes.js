/**
 * Migration para criar índices de otimização de performance
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw('CREATE INDEX idx_transactions_user_due ON financial_transactions (user_id, due_date);');
  await knex.raw('CREATE INDEX idx_transactions_user_status ON financial_transactions (user_id, status);');
  await knex.raw('CREATE INDEX idx_transactions_user_category ON financial_transactions (user_id, category_id);');
  await knex.raw('CREATE INDEX idx_categories_user_type ON categories (user_id, type);');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_categories_user_type;');
  await knex.raw('DROP INDEX IF EXISTS idx_transactions_user_category;');
  await knex.raw('DROP INDEX IF EXISTS idx_transactions_user_status;');
  await knex.raw('DROP INDEX IF EXISTS idx_transactions_user_due;');
};
