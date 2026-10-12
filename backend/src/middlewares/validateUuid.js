const { AppError } = require('./errorHandler');

// Expressão regular padrão para validação de UUID (v1, v4, etc.)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Middleware para validação defensiva de parâmetros de rota com formato UUID.
 * Previne erros de sintaxe e exceções desnecessárias no banco de dados (22P02 no PostgreSQL).
 * @param {string} paramName Nome do parâmetro na rota (padrão: 'id')
 */
function validateUuidParam(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (value && !UUID_REGEX.test(value)) {
      return next(new AppError(`Identificador inválido no parâmetro '${paramName}'. Formato UUID esperado.`, 400));
    }
    return next();
  };
}

module.exports = {
  validateUuidParam,
  UUID_REGEX
};
