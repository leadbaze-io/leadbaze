/**
 * Serviço simplificado para logs de eventos de autenticação
 * Mantido apenas para auditoria e logs
 */

// ==============================================
// TIPOS
// ==============================================

export interface AuthEvent {
  type: string
  user?: {
    id: string
    email: string
    email_confirmed_at?: string
  }
  timestamp: string
}

// ==============================================
// SERVIÇO DE LOGS
// ==============================================

export class AuthWebhookService {
  /**
   * Log de eventos de autenticação para auditoria
   */
  static async logAuthEvent(_event: AuthEvent): Promise<void> {
    try {

      // Aqui você pode adicionar logs para banco de dados, analytics, etc.
      // Por exemplo: await logToDatabase(event)

    } catch (error) {

    }
  }

  /**
   * Log de criação de usuário
   */
  static async logUserCreated(userId: string, email: string): Promise<void> {
    await this.logAuthEvent({
      type: 'user.created',
      user: { id: userId, email },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log de confirmação de email
   */
  static async logEmailConfirmed(userId: string, email: string): Promise<void> {
    await this.logAuthEvent({
      type: 'user.confirmed',
      user: { id: userId, email, email_confirmed_at: new Date().toISOString() },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log de login
   */
  static async logUserLogin(userId: string, email: string): Promise<void> {
    await this.logAuthEvent({
      type: 'user.login',
      user: { id: userId, email },
      timestamp: new Date().toISOString()
    })
  }
}

export default AuthWebhookService