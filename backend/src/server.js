const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

const app = express();

// Middlewares essenciais
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());

// Rota de Health Check da infraestrutura
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Middleware Global de Tratamento de Erros e Gravação em backend/logs/error.log
app.use((err, req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] [${req.method} ${req.originalUrl}] ${err.stack || err.message}\n`;
  const logPath = path.resolve(__dirname, '../logs/error.log');
  
  fs.appendFile(logPath, logEntry, (fsErr) => {
    if (fsErr) console.error('Falha ao gravar no arquivo de log:', fsErr);
  });

  console.error('Erro capturado pelo middleware global:', err.message);
  
  res.status(err.status || 500).json({
    error: 'Ocorreu um erro interno no processamento da solicitação.'
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Servidor backend ativo na porta ${config.port} [Ambiente: ${config.nodeEnv}]`);
  });
}

module.exports = app;
