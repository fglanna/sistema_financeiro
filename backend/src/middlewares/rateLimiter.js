const rateLimit = require('express-rate-limit');

/**
 * Middleware de limitação de taxa para rotas sensíveis de autenticação
 * Configuração: 5 requisições a cada 15 minutos por endereço IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 requisições por IP
  standardHeaders: true, // Retorna informações nos cabeçalhos `RateLimit-*`
  legacyHeaders: false, // Desativa os cabeçalhos legados `X-RateLimit-*`
  statusCode: 429,
  message: {
    error: 'Muitas tentativas de acesso a partir deste endereço IP. Por favor, tente novamente após 15 minutos.'
  }
});

module.exports = {
  authRateLimiter
};
