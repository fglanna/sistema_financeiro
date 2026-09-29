const db = require('../database/connection');

class UserRepository {
  /**
   * Busca usuário pelo endereço de e-mail
   */
  async findByEmail(email) {
    return db('users')
      .where({ email: email.toLowerCase().trim() })
      .first();
  }

  /**
   * Busca usuário pelo ID único (UUID)
   */
  async findById(id) {
    return db('users')
      .where({ id })
      .first();
  }

  /**
   * Cria um novo registro de usuário
   */
  async create({ name, email, password_hash, initial_balance = 0 }) {
    const [user] = await db('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        initial_balance
      })
      .returning(['id', 'name', 'email', 'initial_balance', 'created_at', 'updated_at']);

    return user;
  }

  /**
   * Atualiza dados de um usuário
   */
  async update(id, data) {
    const updatePayload = {};

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.initial_balance !== undefined) updatePayload.initial_balance = data.initial_balance;
    if (data.password_hash !== undefined) updatePayload.password_hash = data.password_hash;

    const [user] = await db('users')
      .where({ id })
      .update(updatePayload)
      .returning(['id', 'name', 'email', 'initial_balance', 'created_at', 'updated_at']);

    return user;
  }

  /**
   * Exclui definitivamente um usuário do banco (acionando ON DELETE CASCADE no Postgres)
   */
  async delete(id) {
    return db('users')
      .where({ id })
      .del();
  }
}

module.exports = new UserRepository();
