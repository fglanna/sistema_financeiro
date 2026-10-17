const app = require('./app');
const config = require('./config/config');
const { initNotificationWorker } = require('./cron/notificationWorker');

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Servidor backend ativo na porta ${config.port} [Ambiente: ${config.nodeEnv}]`);
    initNotificationWorker();
  });
}

module.exports = app;
