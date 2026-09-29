const nodemailer = require('nodemailer');
const config = require('../config/config');

class MailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (config.smtp.host && config.smtp.user) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      });
    }
  }

  /**
   * Envia e-mail de recuperação de senha
   */
  async sendPasswordResetMail({ to, name, resetUrl }) {
    const mailOptions = {
      from: config.smtp.from,
      to,
      subject: 'Recuperação de Senha — Sistema de Controle Financeiro',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
          <h2 style="color: #4F46E5; margin-top: 0;">Recuperação de Senha</h2>
          <p>Olá, <strong>${name}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Sistema de Controle Financeiro</strong>.</p>
          <p>Para criar uma nova senha, clique no botão abaixo (este link é válido por 1 hora):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
          </div>
          <p style="font-size: 13px; color: #64748B;">Se você não solicitou a redefinição de senha, ignore esta mensagem com segurança. Sua senha atual permanecerá inalterada.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94A3B8; text-align: center;">Sistema de Controle Financeiro Pessoal — Executive Precision</p>
        </div>
      `
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`[MailService] E-mail de redefinição enviado com sucesso para ${to}`);
      } catch (err) {
        console.error(`[MailService] Falha ao enviar e-mail para ${to}:`, err.message);
      }
    } else {
      console.log(`[MailService (Mock Dev)] Link de redefinição gerado para ${to}: ${resetUrl}`);
    }
  }
}

module.exports = new MailService();
