// Sistema de logs profissional para o frontend
interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId: string
  userAgent: string
  url: string
}

class Logger {
  private sessionId: string
  private userId?: string
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100
  private flushInterval = 30000 // 30 segundos

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startPeriodicFlush()
    this.setupErrorHandlers()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, context)
    this.addToBuffer(entry)
    
    if (import.meta.env.DEV) {
      console.debug(`🐛 [DEBUG] ${message}`, context)
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, context)
    this.addToBuffer(entry)
    
    console.info(`ℹ️ [INFO] ${message}`, context)
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, context)
    this.addToBuffer(entry)
    
    console.warn(`⚠️ [WARN] ${message}`, context)
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    const entry = this.createLogEntry('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    })
    
    this.addToBuffer(entry)
    console.error(`❌ [ERROR] ${message}`, context, error)
    
    // Enviar erros imediatamente
    this.flushLogs()
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry)
    
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs()
    }
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) return

    const logsToSend = [...this.logBuffer]
    this.logBuffer = []

    try {
      // Enviar logs para o backend ou serviço de analytics
      await this.sendLogsToServer(logsToSend)
    } catch (error) {
      // Se falhar, recolocar os logs no buffer (evitar perda)
      this.logBuffer.unshift(...logsToSend)
      console.error('Failed to send logs to server:', error)
    }
  }

  private async sendLogsToServer(logs: LogEntry[]) {
    // Em produção, enviar para um endpoint de logs
    if (import.meta.env.PROD) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs }),
        })
      } catch (error) {
        // Fallback: armazenar localmente se servidor não disponível
        this.storeLogsLocally(logs)
      }
    } else {
      // Em desenvolvimento, apenas log no console
      console.group('📊 Logs Buffer Flush')
      logs.forEach(log => {
        const emoji = {
          debug: '🐛',
          info: 'ℹ️',
          warn: '⚠️',
          error: '❌',
        }[log.level]
        
        console.log(`${emoji} [${log.level.toUpperCase()}] ${log.message}`, log)
      })
      console.groupEnd()
    }
  }

  private storeLogsLocally(logs: LogEntry[]) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('leadbaze_logs') || '[]')
      const updatedLogs = [...existingLogs, ...logs].slice(-500) // Manter apenas os últimos 500 logs
      localStorage.setItem('leadbaze_logs', JSON.stringify(updatedLogs))
    } catch (error) {
      console.error('Failed to store logs locally:', error)
    }
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flushLogs()
    }, this.flushInterval)

    // Flush quando página estiver para ser fechada
    window.addEventListener('beforeunload', () => {
      this.flushLogs()
    })
  }

  private setupErrorHandlers() {
    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, event.error)
    })

    // Capturar Promise rejections não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
      })
    })

    // Capturar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.error('Resource Loading Error', {
          tagName: (event.target as HTMLElement)?.tagName,
          src: (event.target as any)?.src,
          href: (event.target as any)?.href,
        })
      }
    }, true)
  }

  // Métricas de performance
  logPerformance(name: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${name}`, {
      duration,
      ...context,
    })
  }

  // Log de interações do usuário
  logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, context)
  }

  // Log de eventos de negócio
  logBusinessEvent(event: string, context?: Record<string, any>) {
    this.info(`Business Event: ${event}`, context)
  }

  // Obter logs armazenados localmente (para debug)
  getLocalLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('leadbaze_logs') || '[]')
    } catch {
      return []
    }
  }

  // Limpar logs locais
  clearLocalLogs() {
    localStorage.removeItem('leadbaze_logs')
  }
}

// Instância singleton
export const logger = new Logger()

// Hook para usar o logger em componentes React
export function useLogger() {
  return logger
}

// Decorator para log automático de funções
export function logExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = performance.now()
    
    try {
      const result = await originalMethod.apply(this, args)
      const duration = performance.now() - start
      
      logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration, {
        args: args.length,
        success: true,
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      logger.error(`Error in ${target.constructor.name}.${propertyKey}`, {
        duration,
        args: args.length,
      }, error as Error)
      
      throw error
    }
  }

  return descriptor
}

// Utilitários para contextos específicos
export const LoggerUtils = {
  // Log de API calls
  logApiCall: (method: string, url: string, status: number, duration: number, context?: Record<string, any>) => {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    logger[level](`API Call: ${method} ${url}`, {
      status,
      duration,
      ...context,
    })
  },

  // Log de navegação
  logNavigation: (from: string, to: string) => {
    logger.logUserAction('Navigation', { from, to })
  },

  // Log de lead generation
  logLeadGeneration: (success: boolean, count: number, source: string, context?: Record<string, any>) => {
    logger.logBusinessEvent('Lead Generation', {
      success,
      count,
      source,
      ...context,
    })
  },

  // Log de autenticação
  logAuth: (action: 'login' | 'logout' | 'register', success: boolean, context?: Record<string, any>) => {
    logger.logBusinessEvent(`Auth ${action}`, {
      success,
      ...context,
    })
  },
}

export default logger
