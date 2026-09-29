/**
 * Migration para criar a tabela categories com constraints e trigger
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.string('type', 10).notNullable();
    table.boolean('is_default').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.check('?? IN (\'RECEITA\', \'DESPESA\')', ['type'], 'chk_category_type');
  });

  await knex.raw(`
    ALTER TABLE categories 
    ADD CONSTRAINT chk_category_owner CHECK (
        (is_default = TRUE AND user_id IS NULL) OR 
        (is_default = FALSE AND user_id IS NOT NULL)
    );
  `);

  await knex.raw(`
    CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;');
  await knex.schema.dropTableIfExists('categories');
};
