const crypto = require('crypto');
const config = require('../config/config');

/**
 * Middleware para autenticação segura do acionamento de rotinas Cron
 * Exige cabeçalho HTTP: Authorization: Bearer <CRON_SECRET>
 */
const cronAuthMiddleware = (req, res, next) => {
  const configuredSecret = config.cron.secret;

  if (!configuredSecret) {
    return res.status(500).json({
      error: 'CRON_SECRET não configurado nas variáveis de ambiente do servidor'
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Não autorizado: token de autenticação do cron ausente ou em formato inválido'
    });
  }

  const providedToken = authHeader.substring(7).trim();

  // Comparação segura de buffer e timing para proteção contra timing attacks
  const secretBuffer = Buffer.from(configuredSecret, 'utf8');
  const tokenBuffer = Buffer.from(providedToken, 'utf8');

  if (secretBuffer.length !== tokenBuffer.length || !crypto.timingSafeEqual(secretBuffer, tokenBuffer)) {
    return res.status(401).json({
      error: 'Não autorizado: token de cron inválido'
    });
  }

  next();
};

module.exports = { cronAuthMiddleware };
