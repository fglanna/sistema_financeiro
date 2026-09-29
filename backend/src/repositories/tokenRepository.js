const db = require('../database/connection');

class TokenRepository {
  /**
   * Registra um novo token de redefinição de senha
   */
  async create({ user_id, token_hash, expires_at }) {
    const [tokenRecord] = await db('password_reset_tokens')
      .insert({
        user_id,
        token_hash,
        expires_at,
        used: false
      })
      .returning(['id', 'user_id', 'token_hash', 'expires_at', 'used', 'created_at']);

    return tokenRecord;
  }

  /**
   * Busca um token pelo hash SHA-256
   */
  async findByTokenHash(token_hash) {
    return db('password_reset_tokens')
      .where({ token_hash })
      .first();
  }

  /**
   * Marca o token como utilizado (invalidação imediata de uso único)
   */
  async markAsUsed(id) {
    return db('password_reset_tokens')
      .where({ id })
      .update({ used: true });
  }
}

module.exports = new TokenRepository();
