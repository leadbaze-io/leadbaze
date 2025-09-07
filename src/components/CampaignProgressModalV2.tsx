import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle, AlertTriangle, Clock, Users, MessageSquare, Minimize2, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import { CampaignStatusServiceV2, type CampaignProgress, type CampaignCompletion } from '../lib/campaignStatusServiceV2'

// Sistema de status mais robusto
export type CampaignStatus = 'sending' | 'completed' | 'failed' | 'pending' | 'draft'

export interface CampaignStatusInfo {
  status: CampaignStatus
  progress: number
  message: string
  icon: React.ReactNode
  color: string
  showProgress: boolean
  showTimeEstimate: boolean
}

interface CampaignProgressModalV2Props {
  isVisible: boolean
  campaignId: string
  campaignName: string
  totalLeads: number
  status: CampaignStatus
  successCount?: number
  failedCount?: number
  startTime?: Date
  onClose: () => void
  onMinimize?: () => void
  onExpand?: () => void
  isMinimized?: boolean
}

export default function CampaignProgressModalV2({
  isVisible,
  campaignId,
  campaignName,
  totalLeads,
  status: initialStatus,
  successCount = 0,
  failedCount = 0,
  startTime,
  onClose,
  onMinimize,
  onExpand,
  isMinimized = false
}: CampaignProgressModalV2Props) {
  const [status, setStatus] = useState<CampaignStatus>(initialStatus)
  const [currentSuccessCount, setCurrentSuccessCount] = useState(successCount)
  const [currentFailedCount, setCurrentFailedCount] = useState(failedCount)
  const [progress, setProgress] = useState(0)
  const [currentLead, setCurrentLead] = useState<{ phone: string; name: string; success: boolean } | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [hasNotified, setHasNotified] = useState(false)
  const [hasAutoMinimized, setHasAutoMinimized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown')
  const [stopTracking, setStopTracking] = useState<(() => void) | null>(null)

  // Função robusta para obter informações do status
  const getStatusInfo = (): CampaignStatusInfo => {
    const baseInfo = {
      status,
      progress,
      message: '',
      icon: null as React.ReactNode,
      color: '',
      showProgress: false,
      showTimeEstimate: false
    }

    switch (status) {
      case 'sending':
        return {
          ...baseInfo,
          progress,
          message: currentLead 
            ? `Enviando para ${currentLead.name}...`
            : 'Enviando mensagens...',
          icon: <Send className="w-5 h-5 text-blue-700 dark:text-blue-400 animate-pulse" />,
          color: 'bg-white dark:bg-gray-800/90 border-blue-300 dark:border-blue-700 shadow-lg',
          showProgress: true,
          showTimeEstimate: true
        }
      
      case 'completed':
        return {
          ...baseInfo,
          progress: 100,
          message: 'Campanha enviada com sucesso!',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          color: 'bg-white dark:bg-gray-800/90 border-green-300 dark:border-green-700 shadow-lg',
          showProgress: false,
          showTimeEstimate: false
        }
      
      case 'failed':
        return {
          ...baseInfo,
          progress: 0,
          message: 'Falha no envio da campanha',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          color: 'bg-white dark:bg-gray-800/90 border-red-300 dark:border-red-700 shadow-lg',
          showProgress: false,
          showTimeEstimate: false
        }
      
      case 'pending':
        return {
          ...baseInfo,
          progress: 0,
          message: 'Preparando envio...',
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          color: 'bg-white dark:bg-gray-800/90 border-gray-300 dark:border-gray-700 shadow-lg',
          showProgress: false,
          showTimeEstimate: false
        }
      
      default:
        return baseInfo
    }
  }

  const statusInfo = getStatusInfo()

  // Iniciar rastreamento quando o modal for exibido
  useEffect(() => {
    if (isVisible && campaignId && status === 'sending') {
      console.log('🚀 Iniciando rastreamento da campanha:', campaignId)
      
      // Iniciar rastreamento de status
      const stopTrackingFn = CampaignStatusServiceV2.startStatusTracking(
        campaignId,
        // onProgress
        (progressData: CampaignProgress) => {
          console.log('📊 Progresso recebido:', progressData)
          setProgress(progressData.progress)
          setCurrentSuccessCount(progressData.successCount)
          setCurrentFailedCount(progressData.failedCount)
          setCurrentLead(progressData.currentLead || null)
          setConnectionStatus('connected')
        },
        // onComplete
        (completionData: CampaignCompletion) => {
          console.log('🏁 Campanha concluída:', completionData)
          setStatus(completionData.status)
          setCurrentSuccessCount(completionData.successCount)
          setCurrentFailedCount(completionData.failedCount)
          setProgress(100)
          setConnectionStatus('connected')
        },
        // onStatusUpdate (fallback)
        (statusData) => {
          console.log('📋 Status atualizado:', statusData)
          setStatus(statusData.status)
          setProgress(statusData.progress || 0)
          setConnectionStatus('connected')
        }
      )

      setStopTracking(() => stopTrackingFn)

      // Cleanup ao desmontar
      return () => {
        if (stopTrackingFn) {
          stopTrackingFn()
        }
      }
    }
  }, [isVisible, campaignId, status])

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
              ? `${campaignName} foi enviada com sucesso! ${currentSuccessCount} mensagens enviadas.`
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
  }, [isMinimized, status, hasNotified, campaignName, currentSuccessCount, onExpand])

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

  // Cleanup ao fechar
  useEffect(() => {
    return () => {
      if (stopTracking) {
        stopTracking()
      }
    }
  }, [stopTracking])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />
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
            title={`${campaignName} - ${statusInfo.message}`}
          >
            {/* Ícone animado */}
            <motion.div
              animate={status === 'sending' ? { rotate: 360 } : {}}
              transition={status === 'sending' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            >
              {statusInfo.icon}
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
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
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
            className={`relative ${statusInfo.color} rounded-2xl border-2 shadow-2xl overflow-hidden backdrop-blur-sm`}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {statusInfo.icon}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {campaignName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {statusInfo.message}
                    </p>
                  </div>
                </div>
                
                {/* Botões de controle */}
                <div className="flex items-center space-x-1">
                  {/* Status de conexão */}
                  <div className="flex items-center space-x-1" title={`Conexão: ${connectionStatus}`}>
                    {getConnectionIcon()}
                  </div>
                  
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
                    {currentSuccessCount}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full mx-auto mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Falhas</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{currentFailedCount}</p>
                </div>
              </div>

              {/* Lead atual sendo processado */}
              {currentLead && status === 'sending' && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentLead.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {currentLead.success ? 'Enviado' : 'Falhou'}: {currentLead.name}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {currentLead.phone}
                  </p>
                </div>
              )}

              {/* Barra de Progresso */}
              {statusInfo.showProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.floor(progress)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor()} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Tempo e Estimativa */}
              <div className="space-y-2">
                {status === 'sending' && (
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Tempo decorrido: {formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        Restam: {Math.max(0, totalLeads - currentSuccessCount - currentFailedCount)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Estimativa de tempo restante */}
                {statusInfo.showTimeEstimate && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {status === 'sending' && progress >= 100 ? (
                      <>
                        ✅ Envio concluído! Aguardando confirmação...
                        <br />
                        📊 {currentSuccessCount} mensagens processadas
                      </>
                    ) : (
                      <>
                        ⏱️ Tempo estimado restante: {(() => {
                          const remainingMessages = Math.max(0, totalLeads - currentSuccessCount - currentFailedCount)
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
                )}

                {/* Mensagem de status final */}
                {status === 'completed' && (
                  <div className="text-center text-xs text-green-600 dark:text-green-400">
                    🎉 Campanha enviada com sucesso!
                    <br />
                    📊 {currentSuccessCount} mensagens enviadas
                  </div>
                )}

                {status === 'failed' && (
                  <div className="text-center text-xs text-red-600 dark:text-red-400">
                    ❌ Falha no envio da campanha
                    <br />
                    📊 {currentFailedCount} mensagens falharam
                  </div>
                )}
              </div>

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
                    {currentSuccessCount} mensagens enviadas
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
