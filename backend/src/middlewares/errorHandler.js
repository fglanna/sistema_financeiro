const fs = require('fs');
const path = require('path');

/**
 * Classe personalizada para erros da aplicação com código de status HTTP
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de captura e tratamento de erros
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const message = err.isOperational 
    ? err.message 
    : 'Ocorreu um erro interno no processamento da solicitação.';

  // Sanitização de dados sensíveis na URL antes de registrar no log
  const sanitizedUrl = (req.originalUrl || '').replace(/([?&](token|password|secret|key)=)[^&]+/gi, '$1[REDACTED]');

  // Registro de log técnico em backend/logs/error.log
  const logDir = path.resolve(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logEntry = `[${new Date().toISOString()}] [${req.method} ${sanitizedUrl}] [Status: ${statusCode}] ${err.stack || err.message}\n`;
  const logPath = path.join(logDir, 'error.log');

  fs.appendFile(logPath, logEntry, (fsErr) => {
    if (fsErr) console.error('Falha ao gravar no arquivo de log de erros:', fsErr);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error Handler] ${req.method} ${sanitizedUrl} - Status ${statusCode}:`, err.message);
  }

  return res.status(statusCode).json({
    error: message
  });
}

module.exports = {
  AppError,
  errorHandler
};
