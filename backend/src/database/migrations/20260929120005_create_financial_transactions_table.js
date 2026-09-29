/**
 * Migration para criar a tabela financial_transactions com constraints e trigger
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('financial_transactions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('RESTRICT');
    table.smallint('payment_method_id').notNullable().references('id').inTable('payment_methods').onDelete('RESTRICT');
    table.string('description', 150).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('type', 10).notNullable();
    table.string('status', 10).notNullable();
    table.date('due_date').notNullable();
    table.date('payment_date').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.check('?? > 0', ['amount'], 'chk_transaction_amount');
    table.check('?? IN (\'RECEITA\', \'DESPESA\')', ['type'], 'chk_transaction_type');
    table.check('?? IN (\'PAGO\', \'PENDENTE\')', ['status'], 'chk_transaction_status');
  });

  await knex.raw(`
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT chk_payment_date_status CHECK (
        (status = 'PENDENTE' AND payment_date IS NULL) OR
        (status = 'PAGO' AND payment_date IS NOT NULL)
    );
  `);

  await knex.raw(`
    CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON financial_transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS update_transactions_updated_at ON financial_transactions;');
  await knex.schema.dropTableIfExists('financial_transactions');
};
