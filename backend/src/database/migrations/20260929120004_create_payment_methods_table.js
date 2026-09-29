/**
 * Migration para criar a tabela payment_methods (domínio fixo)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('payment_methods', function(table) {
    table.smallint('id').primary();
    table.string('name', 30).unique().notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('payment_methods');
};
