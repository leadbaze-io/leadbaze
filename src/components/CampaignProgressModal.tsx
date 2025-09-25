/**
 * =====================================================
 * MODAL DE PROGRESSO DA CAMPANHA - MAGIC UI
 * =====================================================
 */

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Clock, Users, MessageSquare, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { AnimatedCircularProgressBar } from './ui/animated-circular-progress-bar'

interface CampaignProgressModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignName: string
  status: 'sending' | 'completed' | 'failed'
  startTime: Date | null
  successCount: number
  failedCount: number
  progress: number
  currentLead: { name: string; phone: string } | null
  totalLeads: number
}

export const CampaignProgressModal = memo(function CampaignProgressModal({
  isOpen,
  onClose,
  campaignId: _campaignId,
  campaignName,
  status,
  startTime,
  successCount,
  failedCount,
  progress,
  currentLead,
  totalLeads
}: CampaignProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  // Calcular tempo decorrido
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed') return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, status])

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Status colors
  const getStatusColor = () => {
    switch (status) {
      case 'sending': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':

        return (
          <AnimatedCircularProgressBar
            value={progress}
            max={100}
            min={0}
            gaugePrimaryColor="#3b82f6"
            gaugeSecondaryColor="#e5e7eb"
            className="w-12 h-12"
          />
        )
      case 'completed': return <CheckCircle className="w-5 h-5" />
      case 'failed': return <AlertCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'sending': return 'Enviando mensagens...'
      case 'completed': return 'Campanha concluída!'
      case 'failed': return 'Campanha falhou'
      default: return 'Preparando...'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
        <motion.div
          key={`campaign-modal-${_campaignId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
          style={{ zIndex: 9999 }}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com BorderBeam */}
          <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
                animate={{

                  x: ['-100%', '100%'],
                  opacity: [0, 1, 0]
                }}
                transition={{

                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`${status === 'sending' ? 'p-1' : 'p-2'} rounded-full ${status === 'sending' ? '' : 'bg-gradient-to-r from-blue-500 to-purple-600'} ${getStatusColor()}`}>
                  {getStatusIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-bold campaign-modal-header-text-claro campaign-modal-header-text-escuro">
                    {campaignName}
                  </h2>
                  <p className="text-sm font-medium campaign-modal-subtitle-claro campaign-modal-subtitle-escuro">
                    {getStatusText()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="campaign-modal-close-button-claro campaign-modal-close-button-escuro"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Progresso
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {progress}%
                </span>
              </div>
              <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Enviados
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {successCount}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Falhas
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {failedCount}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Total
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalLeads}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tempo
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>

            {/* Lead Atual */}
            {currentLead && status === 'sending' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3">
                  <motion.div

                    className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    animate={{

                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{

                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Enviando para:
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentLead.name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {currentLead.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{

                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{

                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                    </motion.div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Enviando...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Final */}
            {status === 'completed' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-lg">
                <div>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Campanha Concluída!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Todas as mensagens foram enviadas com sucesso.
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-lg">
                <div>
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Campanha Falhou
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ocorreu um erro durante o envio das mensagens.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 campaign-modal-footer-claro campaign-modal-footer-escuro">
            <div className="flex justify-between items-center">
              <div className="text-xs campaign-progress-footer-text-claro campaign-progress-footer-text-escuro">
                {status === 'sending' && 'Campanha em andamento...'}
                {status === 'completed' && 'Campanha finalizada com sucesso'}
                {status === 'failed' && 'Campanha falhou'}
              </div>
              <div className="flex gap-3">
                {status === 'completed' || status === 'failed' ? (
                  <Button onClick={onClose} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Fechar
                  </Button>
                ) : (
                  <Button

                    variant="outline"

                    onClick={onClose}
                    className="campaign-modal-minimize-button-claro campaign-modal-minimize-button-escuro"
                  >
                    Minimizar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})