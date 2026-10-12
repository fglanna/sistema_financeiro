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

  /**
   * Busca se já houve execução bem-sucedida do cron para a data civil especificada
   * @param {string} executionDate Data no formato YYYY-MM-DD
   */
  async findDailyCronSuccess(executionDate) {
    const record = await db('security_logs')
      .where('event_type', 'CRON_DAILY_ALERTS_SUCCESS')
      .whereRaw("details->>'execution_date' = ?", [executionDate])
      .first();

    return record || null;
  }
}

module.exports = new SecurityLogRepository();
