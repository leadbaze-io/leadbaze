import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {

  X,

  Send,

  CheckCircle,

  AlertTriangle,

  Clock,

  Minimize2,

  Maximize2,
  TrendingUp,
  Timer,
  Target,
  MessageSquare,
  XCircle,
  Zap
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
  const [finalTime, setFinalTime] = useState<string | null>(null)

  // Log para debug
  // Capturar tempo final quando campanha for concluída
  useEffect(() => {
    if ((status === 'completed' || status === 'failed') && startTime && !finalTime) {
      const now = new Date()
      const diff = now.getTime() - startTime.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      let timeString = ''
      if (hours > 0) {
        timeString = `${hours}h ${minutes % 60}m`
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds % 60}s`
      } else {
        timeString = `${seconds}s`
      }

      setFinalTime(timeString)
    }
  }, [status, startTime, finalTime])

  // Atualizar tempo decorrido
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed') return

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
  }, [startTime, status])

  // Informações de status
  const getStatusInfo = (): CampaignStatusInfo => {
    const progress = totalLeads > 0 ? Math.round((successCount + failedCount) / totalLeads * 100) : 0
    switch (status) {
      case 'sending':
        return {
          status: 'sending',
          progress,
          message: 'Enviando mensagens...',
          icon: <Send className="w-5 h-5" />,
          color: 'green',
          showProgress: true,
          showTimeEstimate: true
        }
      case 'completed':
        return {
          status: 'completed',
          progress: 100,
          message: '✅ Campanha concluída com sucesso!',
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

  // Mini Player Flutuante (quando minimizado)
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className="fixed bottom-4 right-4 z-50 w-80 sm:w-96"
      >
        <div className={`
          rounded-2xl border-2 shadow-2xl backdrop-blur-md overflow-hidden
          ${isDark

            ? 'bg-gray-900/95 border-gray-700 text-white'

            : 'bg-white/95 border-gray-200 text-gray-900'
          }
        `}>
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b
            ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}
          `}>
            <div className="flex items-center space-x-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                ${statusInfo.color === 'blue' ? 'bg-blue-500' :

                  statusInfo.color === 'green' ? 'bg-green-500' :
                  statusInfo.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                }
              `}>
                {statusInfo.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm truncate max-w-32">
                  {campaignName}
                </h4>
                <p className={`
                  text-xs
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {statusInfo.message}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className={`
                  w-8 h-8 p-0 rounded-lg
                  ${isDark

                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'

                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
                  }
                `}
                title="Expandir"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={`
                  w-8 h-8 p-0 rounded-lg
                  ${isDark

                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'

                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
                  }
                `}
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Progress Bar */}
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
                w-full h-2 rounded-full overflow-hidden
                ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
              `}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${statusInfo.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`
                p-3 rounded-lg text-center border
                ${isDark

                  ? 'bg-gray-800/50 border-gray-700'

                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                }
              `}>
                <p className={`
                  text-xs font-semibold uppercase tracking-wide
                  ${isDark ? 'text-gray-400' : 'text-blue-700'}
                `}>
                  Total
                </p>
                <p className={`
                  text-lg font-black
                  ${isDark ? 'text-white' : 'text-blue-900'}
                `}>
                  {totalLeads}
                </p>
              </div>

              <div className={`
                p-3 rounded-lg text-center border
                ${isDark

                  ? 'bg-gray-800/50 border-gray-700'

                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm'
                }
              `}>
                <p className={`
                  text-xs font-semibold uppercase tracking-wide
                  ${isDark ? 'text-gray-400' : 'text-green-700'}
                `}>
                  Enviados
                </p>
                <p className={`
                  text-lg font-black
                  ${isDark ? 'text-green-400' : 'text-green-900'}
                `}>
                  {successCount}
                </p>
              </div>

              <div className={`
                p-3 rounded-lg text-center border
                ${isDark

                  ? 'bg-gray-800/50 border-gray-700'

                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-sm'
                }
              `}>
                <p className={`
                  text-xs font-semibold uppercase tracking-wide
                  ${isDark ? 'text-gray-400' : 'text-red-700'}
                `}>
                  Falhas
                </p>
                <p className={`
                  text-lg font-black
                  ${isDark ? 'text-red-400' : 'text-red-900'}
                `}>
                  {failedCount}
                </p>
              </div>
            </div>

            {/* Time Info */}
            <div className={`
              p-3 rounded-lg
              ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status === 'completed' ? (
                    <CheckCircle className={`
                      w-4 h-4
                      ${isDark ? 'text-green-400' : 'text-green-600'}
                    `} />
                  ) : (
                    <Timer className={`
                      w-4 h-4
                      ${isDark ? 'text-gray-400' : 'text-gray-600'}
                    `} />
                  )}
                  <span className={`
                    text-sm font-medium
                    ${isDark ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    {status === 'completed' ? 'Tempo total da campanha' : 'Tempo decorrido'}
                  </span>
                </div>
                <div className="text-right">
                  {status === 'completed' ? (
                    <div>
                      <div className={`
                        text-sm font-bold
                        ${isDark ? 'text-green-400' : 'text-green-600'}
                      `}>
                        ✅ Concluída
                      </div>
                      <div className={`
                        text-xs font-medium
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        em {finalTime || elapsedTime}
                      </div>
                    </div>
                  ) : (
                    <span className={`
                      text-sm font-bold
                      ${isDark ? 'text-white' : 'text-gray-900'}
                    `}>
                      {elapsedTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Modal Completo (quando expandido)
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
            rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto
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
                onClick={onMinimize}
                className={`
                  ${isDark

                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'

                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
                title="Minimizar para canto da tela"
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
                title="Fechar campanha"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
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

                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                      ${isDark

                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'

                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }
                    `}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : 'text-blue-700'}
                      `}>
                        Total
                      </p>
                      <p className={`
                        text-2xl font-black
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

                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                      ${isDark

                        ? 'bg-gradient-to-br from-green-500 to-green-600'

                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                      }
                    `}>
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : 'text-green-700'}
                      `}>
                        Enviados
                      </p>
                      <p className={`
                        text-2xl font-black
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

                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-sm'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                      ${isDark

                        ? 'bg-gradient-to-br from-red-500 to-red-600'

                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                      }
                    `}>
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : 'text-red-700'}
                      `}>
                        Falhas
                      </p>
                      <p className={`
                        text-2xl font-black
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

                    : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-sm'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                      ${isDark

                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'

                        : 'bg-gradient-to-br from-purple-500 to-violet-600'
                      }
                    `}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : 'text-purple-700'}
                      `}>
                        {status === 'completed' ? 'Tempo Total' : 'Tempo'}
                      </p>
                      <p className={`
                        text-2xl font-black
                        ${isDark ? 'text-white' : 'text-purple-900'}
                      `}>
                        {status === 'completed' ? (finalTime || elapsedTime) : elapsedTime}
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

                      : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm'
                    }
                  `}>
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                        ${isDark

                          ? 'bg-gradient-to-br from-amber-500 to-amber-600'

                          : 'bg-gradient-to-br from-amber-500 to-yellow-600'
                        }
                      `}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`
                          text-xs font-semibold uppercase tracking-wide
                          ${isDark ? 'text-gray-400' : 'text-amber-700'}
                        `}>
                          Tempo Estimado
                        </p>
                        <p className={`
                          text-xl font-black
                          ${isDark ? 'text-white' : 'text-amber-900'}
                        `}>
                          {estimatedTime}
                        </p>
                        <p className={`
                          text-xs font-medium
                          ${isDark ? 'text-gray-500' : 'text-amber-800'}
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

                    : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
                      ${isDark

                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'

                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      }
                    `}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`
                        text-xs font-semibold uppercase tracking-wide
                        ${isDark ? 'text-gray-400' : 'text-emerald-700'}
                      `}>
                        Taxa de Sucesso
                      </p>
                      <p className={`
                        text-xl font-black
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}