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
   * Lógica interna de verificação e envio dos alertas diários (RN07)
   * Busca todas as transações com status = 'PENDENTE' e due_date <= CURRENT_DATE,
   * agrupa por usuário e dispara os e-mails com as pendências.
   */
  async _runDailyAlertsLogic(executionDate) {
    const db = require('../database/connection');
    const mailService = require('./mailService');

    // 1. Consulta todas as transações pendentes com vencimento até hoje
    const pendingTransactions = await db('financial_transactions as ft')
      .select(
        'ft.id',
        'ft.user_id',
        'ft.description',
        'ft.amount',
        'ft.type',
        'ft.due_date',
        'ft.status',
        'c.name as category_name',
        'u.name as user_name',
        'u.email as user_email'
      )
      .join('users as u', 'ft.user_id', 'u.id')
      .leftJoin('categories as c', 'ft.category_id', 'c.id')
      .where('ft.status', 'PENDENTE')
      .whereRaw('ft.due_date <= ?', [executionDate])
      .orderBy(['ft.user_id', 'ft.due_date']);

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return {
        processedUsers: 0,
        pendingAlertsCount: 0,
        message: 'Nenhum lançamento pendente com vencimento expirado ou na data atual foi encontrado.'
      };
    }

    // 2. Agrupa por usuário
    const userMap = new Map();

    for (const tx of pendingTransactions) {
      if (!userMap.has(tx.user_id)) {
        userMap.set(tx.user_id, {
          userId: tx.user_id,
          userName: tx.user_name,
          userEmail: tx.user_email,
          alerts: []
        });
      }

      const dueDateStr = tx.due_date instanceof Date
        ? tx.due_date.toISOString().split('T')[0]
        : String(tx.due_date).split('T')[0];

      const isOverdue = dueDateStr < executionDate;

      userMap.get(tx.user_id).alerts.push({
        id: tx.id,
        description: tx.description,
        amount: parseFloat(tx.amount),
        type: tx.type,
        due_date: dueDateStr,
        category_name: tx.category_name,
        is_overdue: isOverdue
      });
    }

    // 3. Dispara os e-mails para cada usuário com pendências
    let emailsSentCount = 0;   // sucessos reais (SMTP) ou mocks (dev)
    let emailsFailedCount = 0; // falhas de envio SMTP
    for (const [userId, userData] of userMap.entries()) {
      try {
        const result = await mailService.sendDailyAlertMail({
          to: userData.userEmail,
          name: userData.userName,
          pendingAlerts: userData.alerts,
          executionDate
        });
        // sent: true  → SMTP real com sucesso
        // sent: 'mock' → modo dev sem credenciais reais (simulação)
        if (result && (result.sent === true || result.sent === 'mock')) {
          emailsSentCount++;
        } else {
          // sent: false → falha SMTP com credenciais reais
          emailsFailedCount++;
          console.error(`[CronService] Falha de envio SMTP para usuário ${userId} (${userData.userEmail}): ${result && result.error ? result.error : 'Erro desconhecido'}`);
        }
      } catch (mailErr) {
        emailsFailedCount++;
        console.error(`[CronService] Exceção ao enviar e-mail de alerta para usuário ${userId} (${userData.userEmail}):`, mailErr.message);
      }
    }

    return {
      processedUsers: userMap.size,
      pendingAlertsCount: pendingTransactions.length,
      emailsSentCount,
      emailsFailedCount,
      message: `Alertas processados para ${userMap.size} usuário(s) com ${pendingTransactions.length} pendência(s). Enviados: ${emailsSentCount}, Falhas: ${emailsFailedCount}.`
    };
  }
}

module.exports = new CronService();
