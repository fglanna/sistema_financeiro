/**
 * Migration para criar a tabela security_logs (auditoria de segurança)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('security_logs', function(table) {
    table.bigIncrements('id').primary();
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('event_type', 50).notNullable();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.jsonb('details').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('security_logs');
};
