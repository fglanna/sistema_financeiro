const cron = require('node-cron');
const cronService = require('../services/cronService');

let scheduledTask = null;

/**
 * Inicializa o worker agendado diário (RN07).
 * Executa todos os dias às 06:00 AM no fuso horário America/Sao_Paulo (0 6 * * *).
 */
function initNotificationWorker() {
  if (scheduledTask) {
    return scheduledTask;
  }

  // Agendamento cron: 06:00 AM todo dia em America/Sao_Paulo
  scheduledTask = cron.schedule(
    '0 6 * * *',
    async () => {
      console.log('[NotificationWorker] Iniciando rotina diária agendada das 06:00 AM (America/Sao_Paulo)...');
      try {
        const result = await cronService.executeDailyAlerts({
          force: false,
          ip: '127.0.0.1',
          userAgent: 'node-cron-internal-worker'
        });
        console.log('[NotificationWorker] Rotina diária concluída com sucesso:', JSON.stringify(result));
      } catch (err) {
        console.error('[NotificationWorker] Erro durante a execução da rotina diária:', err.message);
      }
    },
    {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    }
  );

  console.log('[NotificationWorker] Worker diário agendado com sucesso (06:00 AM America/Sao_Paulo).');
  return scheduledTask;
}

/**
 * Para o worker agendado (útil para testes e encerramento seguro do processo)
 */
function stopNotificationWorker() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[NotificationWorker] Worker diário interrompido.');
  }
}

module.exports = {
  initNotificationWorker,
  stopNotificationWorker
};
