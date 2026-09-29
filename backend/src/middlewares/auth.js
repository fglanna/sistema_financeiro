const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AppError } = require('./errorHandler');

/**
 * Middleware de autenticação por Bearer Token JWT
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Token de autenticação não fornecido.', 401));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new AppError('Formato de token inválido. Esperado: Bearer <token>.', 401));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Injeta os dados do usuário autenticado no objeto req
    req.user = {
      id: decoded.user_id,
      email: decoded.email
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Sessão expirada. Faça login novamente.', 401));
    }
    return next(new AppError('Token de autenticação inválido.', 401));
  }
}

module.exports = authMiddleware;
