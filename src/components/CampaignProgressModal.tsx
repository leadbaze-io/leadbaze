import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle, AlertTriangle, Clock, Users, MessageSquare, Minimize2 } from 'lucide-react'
import { Button } from './ui/button'

interface CampaignProgressModalProps {
  isVisible: boolean
  campaignName: string
  totalLeads: number
  status: 'sending' | 'completed' | 'failed'
  successCount?: number
  failedCount?: number
  startTime?: Date
  onClose: () => void
  onMinimize?: () => void
  onExpand?: () => void
  isMinimized?: boolean
}

export default function CampaignProgressModal({
  isVisible,
  campaignName,
  totalLeads,
  status,
  successCount = 0,
  failedCount = 0,
  startTime,
  onClose,
  onMinimize,
  onExpand,
  isMinimized = false
}: CampaignProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedProgress, setEstimatedProgress] = useState(0)
  const [hasNotified, setHasNotified] = useState(false)
  const [hasAutoMinimized, setHasAutoMinimized] = useState(false)

  // Calcular tempo decorrido
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed') return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, status])

  // Calcular progresso estimado baseado no tempo
  useEffect(() => {
    if (status === 'sending' && startTime) {
      // Estimativa: 1 mensagem por minuto (60 segundos)
      const messagesPerMinute = 1
      const messagesPerSecond = messagesPerMinute / 60 // 0.0167 mensagens por segundo
      const estimatedSent = Math.min(elapsedTime * messagesPerSecond, totalLeads)
      const progress = Math.min((estimatedSent / totalLeads) * 100, 100) // Progresso completo
      setEstimatedProgress(progress)
    } else if (status === 'completed') {
      setEstimatedProgress(100)
    } else if (status === 'failed') {
      setEstimatedProgress(0)
    }
  }, [elapsedTime, totalLeads, status, startTime])

  // Mostrar notificação quando a campanha termina (se estiver minimizada)
  useEffect(() => {
    if (isMinimized && (status === 'completed' || status === 'failed') && !hasNotified) {
      setHasNotified(true)
      
      // Solicitar permissão para notificações
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      
      // Mostrar notificação do navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(
          status === 'completed' ? '🎉 Campanha Concluída!' : '❌ Campanha Falhou',
          {
            body: status === 'completed' 
              ? `${campaignName} foi enviada com sucesso! ${successCount} mensagens enviadas.`
              : `${campaignName} falhou. Tente novamente.`,
            icon: '/favicon.ico',
            tag: `campaign-${campaignName}`,
            requireInteraction: true
          }
        )
        
        notification.onclick = () => {
          window.focus()
          onExpand?.()
          notification.close()
        }
      }
    }
  }, [isMinimized, status, hasNotified, campaignName, successCount, onExpand])

  // Auto-minimizar após 4 segundos se o usuário não minimizar
  useEffect(() => {
    if (isVisible && !isMinimized && status === 'sending' && !hasAutoMinimized && onMinimize) {
      const timer = setTimeout(() => {
        setHasAutoMinimized(true)
        onMinimize()
      }, 4000) // 4 segundos

      return () => clearTimeout(timer)
    }
  }, [isVisible, isMinimized, status, hasAutoMinimized, onMinimize])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Send className="w-5 h-5 text-blue-700 dark:text-blue-400 animate-pulse" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Enviando mensagens...'
      case 'completed':
        return 'Campanha concluída com sucesso!'
      case 'failed':
        return 'Campanha falhou'
      default:
        return 'Preparando envio...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'bg-white dark:bg-gray-800/90 border-blue-300 dark:border-blue-700 shadow-lg'
      case 'completed':
        return 'bg-white dark:bg-gray-800/90 border-green-300 dark:border-green-700 shadow-lg'
      case 'failed':
        return 'bg-white dark:bg-gray-800/90 border-red-300 dark:border-red-700 shadow-lg'
      default:
        return 'bg-white dark:bg-gray-800/90 border-gray-300 dark:border-gray-700 shadow-lg'
    }
  }

  const getProgressColor = () => {
    switch (status) {
      case 'sending':
        return 'bg-gradient-to-r from-blue-500 to-purple-600'
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600'
      case 'failed':
        return 'bg-gradient-to-r from-red-500 to-pink-600'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600'
    }
  }

  // Bolinha de loading flutuante (quando minimizado)
  if (isVisible && isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        >
          <motion.div
            onClick={onExpand}
            className={`relative w-16 h-16 rounded-full shadow-2xl cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              status === 'sending' ? 'bg-blue-600 dark:bg-blue-500' :
              status === 'completed' ? 'bg-green-600 dark:bg-green-500' :
              status === 'failed' ? 'bg-red-600 dark:bg-red-500' :
              'bg-gray-600 dark:bg-gray-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={status === 'completed' || status === 'failed' ? { 
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.7)',
                '0 0 0 10px rgba(34, 197, 94, 0)',
                '0 0 0 0 rgba(34, 197, 94, 0)'
              ]
            } : {}}
            transition={status === 'completed' || status === 'failed' ? { 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
            title={`${campaignName} - ${getStatusText()}`}
          >
            {/* Ícone animado */}
            <motion.div
              animate={status === 'sending' ? { rotate: 360 } : {}}
              transition={status === 'sending' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            >
              {getStatusIcon()}
            </motion.div>
            
            {/* Badge de notificação quando completado */}
            {status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            )}
            
            {/* Badge de notificação quando falhou */}
            {status === 'failed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            )}
            
            {/* Progresso circular */}
            {status === 'sending' && (
              <svg className="absolute inset-0 w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="white"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - estimatedProgress / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - estimatedProgress / 100) }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isVisible && !isMinimized && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-72 sm:w-80 max-w-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative ${getStatusColor()} rounded-2xl border-2 shadow-2xl overflow-hidden backdrop-blur-sm`}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {campaignName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {getStatusText()}
                    </p>
                  </div>
                </div>
                
                {/* Botões de controle */}
                <div className="flex items-center space-x-1">
                  {/* Botão de minimizar (apenas quando não está minimizado) */}
                  {!isMinimized && onMinimize && (
                    <Button
                      onClick={onMinimize}
                      variant="ghost"
                      size="sm"
                      className="text-gray-800 dark:text-gray-400"
                      title="Minimizar para bolinha de loading"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  
                  {/* Botão de fechar sempre visível */}
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="text-gray-800 dark:text-gray-400"
                    title="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{totalLeads}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Enviadas</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {status === 'sending' ? Math.floor((estimatedProgress / 100) * totalLeads) : successCount}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full mx-auto mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Falhas</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{failedCount}</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progresso
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {status === 'sending' ? `${Math.floor(estimatedProgress)}%` : 
                     status === 'completed' ? '100%' : '0%'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full ${getProgressColor()} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: status === 'sending' ? `${estimatedProgress}%` : 
                             status === 'completed' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Tempo e Estimativa */}
              {status === 'sending' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Tempo decorrido: {formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        Restam: {Math.max(0, totalLeads - Math.floor((estimatedProgress / 100) * totalLeads))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Estimativa de tempo restante */}
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {status === 'completed' ? (
                      <>
                        🎉 Campanha enviada com sucesso!
                        <br />
                        📊 {successCount} mensagens enviadas
                      </>
                    ) : status === 'failed' ? (
                      <>
                        ❌ Falha no envio da campanha
                        <br />
                        📊 {failedCount} mensagens falharam
                      </>
                    ) : estimatedProgress >= 100 ? (
                      <>
                        ✅ Envio concluído! Aguardando confirmação...
                        <br />
                        📊 {successCount} mensagens processadas
                      </>
                    ) : (
                      <>
                        ⏱️ Tempo estimado restante: {(() => {
                          const remainingMessages = Math.max(0, totalLeads - Math.floor((estimatedProgress / 100) * totalLeads))
                          const estimatedMinutesRemaining = Math.ceil(remainingMessages / 1) // 1 mensagem por minuto
                          return estimatedMinutesRemaining > 0 ? 
                            `${estimatedMinutesRemaining} min${estimatedMinutesRemaining > 1 ? 's' : ''}` : 
                            'Concluindo...'
                        })()}
                        <br />
                        <span className="text-xs text-gray-400">Velocidade: 1 mensagem/minuto</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mensagem de Conclusão */}
              {status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    🎉 Campanha Enviada com Sucesso!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    {successCount} mensagens enviadas
                  </p>
                </motion.div>
              )}

              {/* Mensagem de Erro */}
              {status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    ❌ Campanha Falhou
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Tente novamente em alguns minutos
                  </p>
                </motion.div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
