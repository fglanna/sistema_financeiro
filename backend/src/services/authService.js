const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');
const tokenRepository = require('../repositories/tokenRepository');
const mailService = require('./mailService');
const { AppError } = require('../middlewares/errorHandler');

class AuthService {
  /**
   * Valida formato de e-mail
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
  }

  /**
   * Gera token JWT de autenticação (24 horas)
   */
  generateToken(user) {
    return jwt.sign(
      {
        user_id: user.id,
        email: user.email
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Cadastro de novo usuário
   */
  async register({ name, email, password, initial_balance = 0.00 }) {
    if (!name || name.trim().length === 0) {
      throw new AppError('O nome completo é obrigatório.', 400);
    }

    if (!email || !this.isValidEmail(email)) {
      throw new AppError('Informe um endereço de e-mail válido.', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('A senha deve conter no mínimo 6 caracteres.', 400);
    }

    const parsedBalance = parseFloat(initial_balance);
    if (isNaN(parsedBalance)) {
      throw new AppError('O saldo inicial deve ser um valor numérico válido.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verifica se o e-mail já existe
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Este endereço de e-mail já está cadastrado no sistema.', 409);
    }

    // Hash da senha com bcrypt (fator de custo 10)
    const password_hash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email: normalizedEmail,
      password_hash,
      initial_balance: parsedBalance
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initial_balance: parseFloat(user.initial_balance)
      }
    };
  }

  /**
   * Autenticação de usuário por e-mail e senha
   */
  async login({ email, password }) {
    if (!email || !this.isValidEmail(email)) {
      throw new AppError('Informe um endereço de e-mail válido.', 400);
    }

    if (!password) {
      throw new AppError('A senha é obrigatória.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initial_balance: parseFloat(user.initial_balance)
      }
    };
  }

  /**
   * Solicitação de recuperação de senha
   */
  async forgotPassword({ email }) {
    if (!email || !this.isValidEmail(email)) {
      throw new AppError('Informe um endereço de e-mail válido.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    // Se o usuário existir, gera token e dispara e-mail
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora a partir de agora

      await tokenRepository.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt
      });

      const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;
      await mailService.sendPasswordResetMail({
        to: user.email,
        name: user.name,
        resetUrl
      });
    }

    // Mensagem de confirmação genérica por segurança (FSD)
    return {
      message: 'Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinição de senha.'
    };
  }

  /**
   * Redefinição de senha com validação e invalidação do token
   */
  async resetPassword({ token, new_password }) {
    if (!token) {
      throw new AppError('Token de recuperação não fornecido.', 400);
    }

    if (!new_password || new_password.length < 6) {
      throw new AppError('A nova senha deve conter no mínimo 6 caracteres.', 400);
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await tokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
      throw new AppError('Token de recuperação inválido ou expirado.', 400);
    }

    if (tokenRecord.used) {
      throw new AppError('Este token de recuperação já foi utilizado.', 400);
    }

    if (new Date(tokenRecord.expires_at) <= new Date()) {
      throw new AppError('Este token de recuperação expirou.', 400);
    }

    // Gera hash da nova senha
    const password_hash = await bcrypt.hash(new_password, 10);

    // Atualiza a senha do usuário
    await userRepository.update(tokenRecord.user_id, { password_hash });

    // Invalida o token imediatamente
    await tokenRepository.markAsUsed(tokenRecord.id);

    return {
      message: 'Senha redefinida com sucesso. Faça login com a nova senha.'
    };
  }
}

module.exports = new AuthService();
