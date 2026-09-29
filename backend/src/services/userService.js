const userRepository = require('../repositories/userRepository');
const securityLogRepository = require('../repositories/securityLogRepository');
const { AppError } = require('../middlewares/errorHandler');

class UserService {
  /**
   * Recupera os dados do perfil do usuário autenticado
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      initial_balance: parseFloat(user.initial_balance)
    };
  }

  /**
   * Atualiza informações do perfil (Nome e Saldo Inicial)
   */
  async updateProfile(userId, { name, initial_balance }) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new AppError('O nome não pode ser vazio.', 400);
      }
      updateData.name = name.trim();
    }

    if (initial_balance !== undefined) {
      const parsedBalance = parseFloat(initial_balance);
      if (isNaN(parsedBalance)) {
        throw new AppError('O saldo inicial deve ser um valor numérico válido.', 400);
      }
      updateData.initial_balance = parsedBalance;
    }

    const updatedUser = await userRepository.update(userId, updateData);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      initial_balance: parseFloat(updatedUser.initial_balance)
    };
  }

  /**
   * Exclusão definitiva de conta de usuário (RN10) com auditoria prévia
   */
  async deleteAccount(userId, { ipAddress, userAgent }) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // Registra evento de auditoria no security_logs antes da exclusão física
    await securityLogRepository.create({
      user_id: userId,
      event_type: 'ACCOUNT_DELETED',
      ip_address: ipAddress,
      user_agent: userAgent,
      details: {
        email: user.email,
        name: user.name,
        timestamp: new Date().toISOString()
      }
    });

    // Exclusão no PostgreSQL acionando ON DELETE CASCADE para transações, categorias e tokens
    await userRepository.delete(userId);

    return {
      message: 'Conta excluída com sucesso juntamente com todos os registros vinculados.'
    };
  }
}

module.exports = new UserService();
