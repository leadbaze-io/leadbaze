import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Minimize2, 
  TrendingUp,
  Timer
} from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'

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
  const { isDark } = useTheme()
  const [elapsedTime, setElapsedTime] = useState('0s')

  // Atualizar tempo decorrido
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = now.getTime() - startTime.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        setElapsedTime(`${hours}h ${minutes % 60}m`)
      } else if (minutes > 0) {
        setElapsedTime(`${minutes}m ${seconds % 60}s`)
      } else {
        setElapsedTime(`${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Informações de status
  const getStatusInfo = (): CampaignStatusInfo => {
    switch (status) {
      case 'sending':
        return {
          status: 'sending',
          progress: Math.round((successCount + failedCount) / totalLeads * 100),
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
          message: 'Campanha finalizada com sucesso!',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green',
          showProgress: false,
          showTimeEstimate: false
        }
      case 'failed':
        return {
          status: 'failed',
          progress: 0,
          message: 'Campanha falhou',
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'red',
          showProgress: false,
          showTimeEstimate: false
        }
      default:
        return {
          status: 'pending',
          progress: 0,
          message: 'Aguardando...',
          icon: <Clock className="w-5 h-5" />,
          color: 'gray',
          showProgress: false,
          showTimeEstimate: false
        }
    }
  }

  const statusInfo = getStatusInfo()

  // Tempo estimado
  const getEstimatedTime = (): string => {
    if (status !== 'sending' || totalLeads === 0) return '0 min'
    
    const remaining = totalLeads - successCount - failedCount
    if (remaining <= 0) return 'Concluindo...'
    
    // Estimativa baseada em 2 mensagens por minuto
    const estimatedMinutes = Math.ceil(remaining / 2)
    return estimatedMinutes === 1 ? '1 min' : `${estimatedMinutes} min`
  }

  const estimatedTime = getEstimatedTime()

  // Taxa de sucesso
  const successRate = totalLeads > 0 ? Math.round((successCount / totalLeads) * 100) : 0

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`
            relative w-full max-w-2xl mx-auto
            ${isDark 
              ? 'bg-gray-900 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
            }
            rounded-2xl border shadow-2xl
            ${isMinimized ? 'max-h-20 overflow-hidden' : 'max-h-[90vh] overflow-y-auto'}
          `}
        >
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex items-center space-x-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${statusInfo.color === 'blue' ? 'bg-blue-500' : 
                  statusInfo.color === 'green' ? 'bg-green-500' :
                  statusInfo.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                }
              `}>
                {statusInfo.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isMinimized ? 'Campanha' : campaignName}
                </h3>
                <p className={`
                  text-sm
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isMinimized ? onExpand : onMinimize}
                className={`
                  ${isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={`
                  ${isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-6 space-y-6">
              {/* Progress Bar */}
              {statusInfo.showProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`
                      text-sm font-medium
                      ${isDark ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Progresso
                    </span>
                    <span className={`
                      text-sm font-bold
                      ${isDark ? 'text-white' : 'text-gray-900'}
                    `}>
                      {statusInfo.progress}%
                    </span>
                  </div>
                  <div className={`
                    w-full h-3 rounded-full overflow-hidden
                    ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
                  `}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${statusInfo.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`
                        h-full rounded-full
                        ${statusInfo.color === 'blue' ? 'bg-blue-500' : 
                          statusInfo.color === 'green' ? 'bg-green-500' :
                          statusInfo.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                        }
                      `}
                    />
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className={`
                  p-4 rounded-xl border
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-blue-50 border-blue-200'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-blue-600'}
                      `}>
                        Total
                      </p>
                      <p className={`
                        text-xl font-bold
                        ${isDark ? 'text-white' : 'text-blue-900'}
                      `}>
                        {totalLeads}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enviados */}
                <div className={`
                  p-4 rounded-xl border
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-green-50 border-green-200'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-green-600'}
                      `}>
                        Enviados
                      </p>
                      <p className={`
                        text-xl font-bold
                        ${isDark ? 'text-white' : 'text-green-900'}
                      `}>
                        {successCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Falhas */}
                <div className={`
                  p-4 rounded-xl border
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-red-50 border-red-200'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-red-600'}
                      `}>
                        Falhas
                      </p>
                      <p className={`
                        text-xl font-bold
                        ${isDark ? 'text-white' : 'text-red-900'}
                      `}>
                        {failedCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tempo */}
                <div className={`
                  p-4 rounded-xl border
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-purple-50 border-purple-200'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Timer className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-purple-600'}
                      `}>
                        Tempo
                      </p>
                      <p className={`
                        text-xl font-bold
                        ${isDark ? 'text-white' : 'text-purple-900'}
                      `}>
                        {elapsedTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tempo Estimado */}
                {statusInfo.showTimeEstimate && (
                  <div className={`
                    p-4 rounded-xl border
                    ${isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-yellow-50 border-yellow-200'
                    }
                  `}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`
                          text-xs font-medium
                          ${isDark ? 'text-gray-400' : 'text-yellow-600'}
                        `}>
                          Tempo Estimado
                        </p>
                        <p className={`
                          text-lg font-bold
                          ${isDark ? 'text-white' : 'text-yellow-900'}
                        `}>
                          {estimatedTime}
                        </p>
                        <p className={`
                          text-xs
                          ${isDark ? 'text-gray-500' : 'text-yellow-700'}
                        `}>
                          Velocidade: 2 mensagens/minuto
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Taxa de Sucesso */}
                <div className={`
                  p-4 rounded-xl border
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-emerald-50 border-emerald-200'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-emerald-600'}
                      `}>
                        Taxa de Sucesso
                      </p>
                      <p className={`
                        text-lg font-bold
                        ${isDark ? 'text-white' : 'text-emerald-900'}
                      `}>
                        {successRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-4 rounded-xl border-2 border-green-500
                    ${isDark ? 'bg-green-900/20' : 'bg-green-50'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        Campanha Finalizada!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Todas as mensagens foram enviadas com sucesso.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-4 rounded-xl border-2 border-red-500
                    ${isDark ? 'bg-red-900/20' : 'bg-red-50'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Campanha Falhou
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Houve um problema durante o envio das mensagens.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}