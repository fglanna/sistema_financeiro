const app = require('./app');
const config = require('./config/config');

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Servidor backend ativo na porta ${config.port} [Ambiente: ${config.nodeEnv}]`);
  });
}

module.exports = app;
