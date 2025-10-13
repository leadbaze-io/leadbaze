const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // Configuração do Gmail SMTP
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'leadbaze@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'sua_senha_app_gmail'
      }
    });
  }

  // Enviar email de cancelamento
  async sendCancellationTicket(ticketData) {
    try {
      const { ticket_id, user_id, perfect_pay_subscription_id, user_email, access_until } = ticketData;

      const mailOptions = {
        from: 'leadbaze@gmail.com',
        to: 'leadbaze@gmail.com',
        subject: `🚫 [CANCELAMENTO] ${ticket_id} - Requer Ação Manual`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1>🚫 CANCELAMENTO DE ASSINATURA</h1>
              <h2>Requer Ação Manual no Perfect Pay</h2>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h3>📋 Detalhes do Ticket</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>Ticket ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${ticket_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>User ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${user_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>Email do Usuário:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${user_email || 'Não informado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>Perfect Pay Subscription ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${perfect_pay_subscription_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>Acesso até:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date(access_until).toLocaleString('pt-BR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background: #e9ecef;"><strong>Data/Hora:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('pt-BR')}</td>
                </tr>
              </table>
            </div>

            <div style="padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107;">
              <h3>⚠️ AÇÃO NECESSÁRIA</h3>
              <p><strong>IMPORTANTE:</strong> O usuário deve cancelar manualmente no Perfect Pay para evitar cobranças futuras!</p>
              <ul>
                <li>✅ Cancelamento local já registrado no sistema</li>
                <li>⚠️ <strong>PENDENTE:</strong> Cancelamento manual no Perfect Pay</li>
                <li>📧 Usuário foi notificado sobre a necessidade de cancelamento manual</li>
              </ul>
            </div>

            <div style="padding: 20px; background: #d1ecf1; border-left: 4px solid #17a2b8;">
              <h3>🔗 Links Úteis</h3>
              <ul>
                <li><strong>Perfect Pay Dashboard:</strong> <a href="https://app.perfectpay.com.br">https://app.perfectpay.com.br</a></li>
                <li><strong>Supabase Dashboard:</strong> <a href="https://supabase.com/dashboard">https://supabase.com/dashboard</a></li>
                <li><strong>LeadBaze Admin:</strong> <a href="https://leadbaze.io/admin">https://leadbaze.io/admin</a></li>
              </ul>
            </div>

            <div style="padding: 20px; background: #f8f9fa; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="margin: 0; color: #6c757d;">
                Este email foi gerado automaticamente pelo sistema LeadBaze<br>
                Ticket ID: ${ticket_id} | ${new Date().toISOString()}
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] Email de cancelamento enviado:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ [EMAIL] Erro ao enviar email de cancelamento:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Enviar email de teste
  async sendTestEmail() {
    try {
      const mailOptions = {
        from: 'leadbaze@gmail.com',
        to: 'leadbaze@gmail.com',
        subject: '🧪 [TESTE] Sistema de Email LeadBaze',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
              <h1>✅ Sistema de Email Funcionando!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Este é um email de teste do sistema LeadBaze.</p>
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Status:</strong> Sistema de email configurado e funcionando!</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] Email de teste enviado:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ [EMAIL] Erro ao enviar email de teste:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;













