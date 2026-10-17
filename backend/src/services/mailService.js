const nodemailer = require('nodemailer');
const config = require('../config/config');

class MailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // Credenciais placeholder comuns nos arquivos .env.example — não inicializar transporter com elas
    const PLACEHOLDER_USERS = ['seu_usuario_smtp', 'your_smtp_user', '', undefined, null];
    const PLACEHOLDER_HOSTS = ['seu_host_smtp', 'your_smtp_host', '', undefined, null];

    const hasRealCredentials =
      config.smtp.host &&
      config.smtp.user &&
      !PLACEHOLDER_USERS.includes(config.smtp.user) &&
      !PLACEHOLDER_HOSTS.includes(config.smtp.host);

    if (hasRealCredentials) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      });
      console.log(`[MailService] Transporter SMTP inicializado (host: ${config.smtp.host})`);
    } else {
      console.log('[MailService] Modo Mock ativo — nenhuma credencial SMTP real configurada. Configure SMTP_HOST, SMTP_USER e SMTP_PASS no .env para envio real.');
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
      // Em desenvolvimento, apenas confirma que o link seria enviado (sem exibir o token real)
      console.log(`[MailService (Mock Dev)] Link de redefinição gerado e enviado para ${to}. Configure as variáveis SMTP no .env para envio real.`);
    }
  }

  /**
   * Envia e-mail de alerta de contas pendentes/vencidas (RN07)
   */
  async sendDailyAlertMail({ to, name, pendingAlerts, executionDate }) {
    const totalPending = pendingAlerts.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
    const totalPendingFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending);

    const itemsHtml = pendingAlerts.map((tx) => {
      const isOverdue = tx.is_overdue;
      const statusColor = isOverdue ? '#DC2626' : '#D97706';
      const statusLabel = isOverdue ? 'VENCIDA' : 'VENCE HOJE';
      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount);
      const parts = String(tx.due_date).split('T')[0].split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : tx.due_date;

      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 8px; font-weight: 500;">${tx.description}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #64748B;">${tx.category_name || '-'}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #64748B;">${formattedDate}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-family: monospace;">${formattedAmount}</td>
          <td style="padding: 10px 8px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 9999px; background-color: ${statusColor}15; color: ${statusColor};">
              ${statusLabel}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: config.smtp.from,
      to,
      subject: `Alerta Financeiro: ${pendingAlerts.length} ${pendingAlerts.length === 1 ? 'conta requer sua atenção' : 'contas requerem sua atenção'}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Lembrete Diário de Contas — Sistema Financeiro</h2>
          <p>Olá, <strong>${name}</strong>!</p>
          <p>Identificamos pendências financeiras registradas na sua conta que vencem hoje ou estão com data de vencimento expirada (Data de referência: <strong>${executionDate}</strong>):</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background-color: #F8FAFC; border-bottom: 2px solid #CBD5E1; text-align: left;">
                <th style="padding: 10px 8px;">Descrição</th>
                <th style="padding: 10px 8px;">Categoria</th>
                <th style="padding: 10px 8px;">Vencimento</th>
                <th style="padding: 10px 8px; text-align: right;">Valor</th>
                <th style="padding: 10px 8px; text-align: center;">Situação</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #F1F5F9; font-weight: bold;">
                <td colspan="3" style="padding: 12px 8px; text-align: right;">Total Pendente:</td>
                <td style="padding: 12px 8px; text-align: right; font-family: monospace;">${totalPendingFormatted}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/transactions" style="background-color: #0F172A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar Meu Extrato</a>
          </div>

          <p style="font-size: 13px; color: #64748B;">Este é um envio automático do seu assistente de controle financeiro diário agendado para às 06:00 AM.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94A3B8; text-align: center;">Sistema de Controle Financeiro Pessoal — Executive Precision</p>
        </div>
      `
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`[MailService] E-mail de alerta de pendências enviado com sucesso para ${to}`);
        return { sent: true };
      } catch (err) {
        console.error(`[MailService] Falha ao enviar alerta de pendências para ${to}:`, err.message);
        return { sent: false, error: err.message };
      }
    } else {
      console.log(`[MailService (Mock Dev)] E-mail de alerta gerado para ${to} contendo ${pendingAlerts.length} pendências somando ${totalPendingFormatted}.`);
      return { sent: 'mock' };
    }
  }
}

module.exports = new MailService();
