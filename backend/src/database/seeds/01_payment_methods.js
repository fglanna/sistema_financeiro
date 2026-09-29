/**
 * Seed para inserção do domínio fixo de Formas de Pagamento
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const paymentMethods = [
    { id: 1, name: 'Pix' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Cartão de Débito' },
    { id: 4, name: 'Dinheiro' },
    { id: 5, name: 'Boleto' },
    { id: 6, name: 'Transferência' }
  ];

  for (const method of paymentMethods) {
    await knex('payment_methods')
      .insert(method)
      .onConflict('id')
      .merge();
  }
};
