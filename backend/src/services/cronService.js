const securityLogRepository = require('../repositories/securityLogRepository');
const config = require('../config/config');

class CronService {
  /**
   * Obtém a data civil atual (formato YYYY-MM-DD) no fuso horário America/Sao_Paulo
   */
  getCurrentDateSaoPaulo() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // Formato YYYY-MM-DD
  }

  /**
   * Executa a rotina diária de alertas por e-mail com garantia de idempotência,
   * prevenção de duplicações, timeout seguro e registro de auditoria.
   */
  async executeDailyAlerts({ force = false, ip = null, userAgent = null } = {}) {
    const executionDate = this.getCurrentDateSaoPaulo();
    const startTime = Date.now();

    // 1. Verificação de Idempotência: impede disparos duplicados no mesmo dia
    const alreadyExecuted = await securityLogRepository.findDailyCronSuccess(executionDate);
    if (alreadyExecuted && !force) {
      return {
        status: 'skipped',
        reason: 'already_executed',
        message: `A rotina diária para a data ${executionDate} (fuso America/Sao_Paulo) já foi executada com sucesso anteriormente.`,
        execution_date: executionDate,
        executed_at: alreadyExecuted.created_at
      };
    }

    // 2. Timeout e Execução Segura
    const timeoutMs = config.cron.timeoutMs || 30000;
    const processPromise = this._runDailyAlertsLogic(executionDate);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout de processamento da rotina cron excedido (${timeoutMs}ms)`)), timeoutMs);
    });

    try {
      const result = await Promise.race([processPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      // 3. Registro de Sucesso para garantia de idempotência no banco
      await securityLogRepository.create({
        user_id: null,
        event_type: 'CRON_DAILY_ALERTS_SUCCESS',
        ip_address: ip,
        user_agent: userAgent,
        details: {
          execution_date: executionDate,
          duration_ms: durationMs,
          forced: force,
          processed_users: result.processedUsers || 0,
          pending_alerts_count: result.pendingAlertsCount || 0
        }
      });

      return {
        status: 'completed',
        message: 'Rotina diária de alertas executada com sucesso.',
        execution_date: executionDate,
        duration_ms: durationMs,
        ...result
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;

      // Registro de Falha para auditoria
      await securityLogRepository.create({
        user_id: null,
        event_type: 'CRON_DAILY_ALERTS_FAILURE',
        ip_address: ip,
        user_agent: userAgent,
        details: {
          execution_date: executionDate,
          duration_ms: durationMs,
          error_message: err.message
        }
      }).catch(() => {}); // Não oculta o erro primário se o log falhar

      throw err;
    }
  }

  /**
   * Lógica interna de verificação e envio (Ponto de Extensão das Fases 4 e 5)
   * Na Fase 5, este bloco executará a consulta aos lançamentos pendentes
   * e o disparo de e-mails via Nodemailer.
   */
  async _runDailyAlertsLogic(executionDate) {
    // Ponto de integração: Quando a Fase 5 for implementada,
    // as consultas aos débitos com status 'PENDENTE' e due_date <= CURRENT_DATE
    // e os envios de e-mails em lote serão executados aqui.
    return {
      processedUsers: 0,
      pendingAlertsCount: 0,
      info: 'Preparação de infraestrutura do Cron concluída. Consultas de lançamentos serão ativadas na Fase 5.'
    };
  }
}

module.exports = new CronService();
