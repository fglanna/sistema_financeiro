const db = require('../database/connection');

class SecurityLogRepository {
  /**
   * Registra um evento de auditoria de segurança
   */
  async create({ user_id = null, event_type, ip_address = null, user_agent = null, details = null }) {
    const [log] = await db('security_logs')
      .insert({
        user_id,
        event_type,
        ip_address,
        user_agent,
        details: details ? JSON.stringify(details) : null
      })
      .returning(['id', 'user_id', 'event_type', 'ip_address', 'user_agent', 'details', 'created_at']);

    return log;
  }
}

module.exports = new SecurityLogRepository();
