import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  MessageSquare, 
  Minimize2, 
  Wifi, 
  WifiOff,
  TrendingUp,
  Timer
} from 'lucide-react'
import { Button } from './ui/button'
// import type { CampaignProgress } from '../lib/campaignStatusServiceV2' // Removido: não utilizado

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
  campaignName: string
  totalLeads: number
  status: CampaignStatus
  successCount: number
  failedCount: number
  startTime?: Date
  isMinimized: boolean
  onClose: () => void
  onMinimize: () => void
  onExpand: () => void
}

export default function CampaignProgressModalV2({
  isVisible,
  campaignName,
  totalLeads,
  status,
  successCount,
  failedCount,
  startTime,
  isMinimized,
  onClose,
  onMinimize,
  onExpand
}: CampaignProgressModalV2Props) {
  const [progress, setProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(true)

  // Calcular progresso baseado nos contadores
  useEffect(() => {
    const totalProcessed = successCount + failedCount
    const newProgress = totalLeads > 0 ? (totalProcessed / totalLeads) * 100 : 0
    setProgress(Math.min(newProgress, 100))
  }, [successCount, failedCount, totalLeads])

  // Monitorar status em tempo real - REMOVIDO: chamada duplicada
  // O monitoramento é feito pelo DisparadorMassa, não pelo modal
  // useEffect(() => {
  //   if (!isVisible || !campaignId) return
  //   const stopTracking = CampaignStatusServiceV2.startStatusTracking(...)
  //   return stopTracking
  // }, [isVisible, campaignId])

  // Detectar desconexão
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(false)
    }, 30000) // Considerar desconectado após 30s sem atualizações

    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = (): CampaignStatusInfo => {
    switch (status) {
      case 'sending':
        return {
          status: 'sending',
          progress,
          message: 'Enviando mensagens...',
          icon: <Send className="w-5 h-5" />,
          color: 'blue',
          showProgress: true,
          showTimeEstimate: true
        }
      case 'completed':
        return {
          status: 'completed',
          progress: 100,
          message: 'Campanha concluída com sucesso!',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green',
          showProgress: false,
          showTimeEstimate: false
        }
      case 'failed':
        return {
          status: 'failed',
          progress: 0,
          message: 'Falha na campanha',
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'red',
          showProgress: false,
          showTimeEstimate: false
        }
      case 'pending':
        return {
          status: 'pending',
          progress: 0,
          message: 'Aguardando processamento...',
          icon: <Clock className="w-5 h-5" />,
          color: 'yellow',
          showProgress: false,
          showTimeEstimate: false
        }
      default:
        return {
          status: 'draft',
          progress: 0,
          message: 'Preparando campanha...',
          icon: <MessageSquare className="w-5 h-5" />,
          color: 'gray',
          showProgress: false,
          showTimeEstimate: false
        }
    }
  }

  const statusInfo = getStatusInfo()

  // Calcular tempo estimado
  const getEstimatedTime = () => {
    if (!statusInfo.showTimeEstimate || !startTime) return null
    
    const remainingMessages = totalLeads - successCount - failedCount
    if (remainingMessages <= 0) return 'Concluindo...'
    
    // Estimativa baseada em 30 segundos por mensagem
    const estimatedMinutesRemaining = Math.ceil(remainingMessages * 0.5)
    return estimatedMinutesRemaining > 0 ? 
      `${estimatedMinutesRemaining} min${estimatedMinutesRemaining > 1 ? 's' : ''}` : 
      'Concluindo...'
  }

  const estimatedTime = getEstimatedTime()

  // Calcular tempo decorrido
  const getElapsedTime = () => {
    if (!startTime) return '0s'
    
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Modal minimizado - Design moderno e compacto
  if (isVisible && isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        >
          <motion.div
            onClick={onExpand}
            className={`relative w-80 h-20 rounded-2xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
              status === 'sending' ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 border-blue-400/50' :
              status === 'completed' ? 'bg-gradient-to-r from-green-500/90 to-green-600/90 border-green-400/50' :
              status === 'failed' ? 'bg-gradient-to-r from-red-500/90 to-red-600/90 border-red-400/50' :
              'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400/50'
            }`}
            whileHover={{ scale: 1.05 }}
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
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/10 dark:bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                opacity: 0.2
              }}></div>
            </div>

            <div className="relative z-10 flex items-center justify-between h-full px-4">
              {/* Lado Esquerdo - Informações */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <motion.div
                  animate={status === 'sending' ? { rotate: 360 } : {}}
                  transition={status === 'sending' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                  className="flex-shrink-0 text-white drop-shadow-lg"
                >
                  {statusInfo.icon}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate drop-shadow-md">
                    {campaignName}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-white/90 drop-shadow-sm">
                    <span>{statusInfo.message}</span>
                    {!isConnected && (
                      <WifiOff className="w-3 h-3 text-yellow-300 drop-shadow-sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Lado Direito - Progresso e Estatísticas */}
              <div className="flex items-center space-x-3">
                {/* Estatísticas Compactas */}
                <div className="text-right">
                  <div className="text-sm font-bold text-white drop-shadow-md">
                    {status === 'sending' ? `${successCount}/${totalLeads}` :
                     status === 'completed' ? 'Concluído' :
                     status === 'failed' ? 'Falhou' : 'Aguardando'}
                  </div>
                  {status === 'sending' && (
                    <div className="text-xs text-white/90 drop-shadow-sm">
                      {Math.floor(progress)}%
                    </div>
                  )}
                </div>

                {/* Badge de Status */}
                {status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {status === 'failed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Barra de Progresso Linear */}
            {status === 'sending' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full bg-white/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Modal expandido - Design completo e moderno
  if (isVisible && !isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header com Gradiente */}
            <div className={`relative p-6 text-white ${
              status === 'sending' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/15 dark:bg-white/10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                  opacity: 0.2
                }}></div>
              </div>

              <div className="relative z-10">
                {/* Header Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={status === 'sending' ? { rotate: 360 } : {}}
                      transition={status === 'sending' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                      className="w-10 h-10 bg-white/25 dark:bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg"
                    >
                      <div className="text-white drop-shadow-lg">
                        {statusInfo.icon}
                      </div>
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-black text-white drop-shadow-lg">Status da Campanha</h2>
                      <p className="text-white/95 text-sm font-semibold drop-shadow-md">Monitoramento em tempo real</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Indicador de Conexão */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      isConnected ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
                    }`}>
                      {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMinimize}
                      className="text-white hover:bg-white/20 rounded-xl"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-white hover:bg-white/20 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Nome da Campanha */}
                <div className="mb-4">
                  <h1 className="text-2xl font-black mb-1 text-white drop-shadow-lg">{campaignName}</h1>
                  <p className="text-white/95 font-semibold drop-shadow-md">{statusInfo.message}</p>
                </div>

                {/* Barra de Progresso Principal */}
                {statusInfo.showProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white drop-shadow-md">Progresso</span>
                      <span className="text-lg font-black text-white drop-shadow-lg">{Math.floor(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/25 dark:bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full bg-white/90 dark:bg-white/80 rounded-full shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6">
              {/* Estatísticas em Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-400 font-semibold drop-shadow-md">Total</p>
                      <p className="text-2xl font-black text-blue-950 dark:text-blue-100 drop-shadow-lg">{totalLeads}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-400 font-semibold drop-shadow-md">Enviados</p>
                      <p className="text-2xl font-black text-green-950 dark:text-green-100 drop-shadow-lg">{successCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-800 dark:text-red-400 font-semibold drop-shadow-md">Falhas</p>
                      <p className="text-2xl font-black text-red-950 dark:text-red-100 drop-shadow-lg">{failedCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <Timer className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-800 dark:text-purple-400 font-semibold drop-shadow-md">Tempo</p>
                      <p className="text-2xl font-black text-purple-950 dark:text-purple-100 drop-shadow-lg">{getElapsedTime()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-4">
                {/* Tempo Estimado */}
                {estimatedTime && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-900 dark:text-yellow-300 font-semibold drop-shadow-md">Tempo Estimado</p>
                        <p className="text-xl font-black text-yellow-950 dark:text-yellow-100 drop-shadow-lg">{estimatedTime}</p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-400 drop-shadow-md">Velocidade: 2 mensagens/minuto</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lead Atual (se disponível) - REMOVIDO: currentProgress não disponível */}
                {/* {currentProgress?.currentLead && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Processando</p>
                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                          {currentProgress.currentLead.name}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                          {currentProgress.currentLead.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Taxa de Sucesso */}
                {totalLeads > 0 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-900 dark:text-emerald-300 font-semibold drop-shadow-md">Taxa de Sucesso</p>
                          <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 drop-shadow-lg">
                            {Math.round((successCount / totalLeads) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-16 relative">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-emerald-200 dark:text-emerald-800"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${(successCount / totalLeads) * 100}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onMinimize}
                  className="rounded-xl"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Minimizar
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}