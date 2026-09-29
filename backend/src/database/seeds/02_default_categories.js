/**
 * Seed para inserção das Categorias Padrão do Sistema
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const defaultCategories = [
    // Categorias Padrão de Receita
    { name: 'Salário', type: 'RECEITA', is_default: true, user_id: null },
    { name: 'Freelance', type: 'RECEITA', is_default: true, user_id: null },
    { name: 'Prestação de Serviços', type: 'RECEITA', is_default: true, user_id: null },
    { name: 'Outras Receitas', type: 'RECEITA', is_default: true, user_id: null },
    // Categorias Padrão de Despesa
    { name: 'Alimentação', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Moradia', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Transporte', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Saúde', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Lazer', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Educação', type: 'DESPESA', is_default: true, user_id: null },
    { name: 'Outras Despesas', type: 'DESPESA', is_default: true, user_id: null }
  ];

  for (const category of defaultCategories) {
    const exists = await knex('categories')
      .where({
        name: category.name,
        type: category.type,
        is_default: true,
        user_id: null
      })
      .first();

    if (!exists) {
      await knex('categories').insert(category);
    }
  }
};
