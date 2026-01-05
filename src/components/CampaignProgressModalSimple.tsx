import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {

  Send,

  CheckCircle,

  AlertTriangle,

  Clock,

  TrendingUp,
  XCircle,
  X,
  Trophy,
  Eye,
  Sparkles,
  MessageSquare,
  Users
} from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'
import './CampaignProgressModalSimple.css'

// Sistema de status simplificado
export type CampaignStatus = 'sending' | 'completed' | 'failed' | 'cancelled'

export interface CampaignStatusInfo {
  status: CampaignStatus
  progress: number
  message: string
  icon: React.ReactNode
  color: string
  showProgress: boolean
  showTimeEstimate: boolean
}

interface CampaignProgressModalSimpleProps {
  isVisible: boolean
  campaignName: string
  totalLeads: number
  status: CampaignStatus
  successCount: number
  failedCount: number
  currentLead?: { name: string, phone: string } | null
  startTime?: Date
  isInitializing?: boolean
  onCancel: () => void
  onClose: () => void
}

export default function CampaignProgressModalSimple({
  isVisible,
  campaignName,
  totalLeads,
  status,
  successCount,
  failedCount,
  currentLead,
  startTime,
  isInitializing = false,
  onCancel,
  onClose
}: CampaignProgressModalSimpleProps) {
  useTheme()
  const [elapsedTime, setElapsedTime] = useState<string>('00:00')
  const [showDetails, setShowDetails] = useState<boolean>(false)

  // Calcular tempo decorrido
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed' || status === 'cancelled') {
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const diff = now.getTime() - startTime.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, status])
  // Obter informações do status
  const getStatusInfo = (): CampaignStatusInfo => {
    switch (status) {
      case 'sending':
        return {
          status: 'sending',
          progress: totalLeads > 0 ? (successCount + failedCount) / totalLeads * 100 : 0,
          message: 'Enviando mensagens...',
          icon: <Send className="w-6 h-6" />,
          color: 'text-blue-600 dark:text-blue-400',
          showProgress: true,
          showTimeEstimate: true
        }
      case 'completed':
        return {
          status: 'completed',
          progress: 100,
          message: 'Campanha concluída com sucesso!',
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'text-green-600 dark:text-green-400',
          showProgress: false,
          showTimeEstimate: false
        }
      case 'failed':
        return {
          status: 'failed',
          progress: 0,
          message: 'Campanha falhou',
          icon: <AlertTriangle className="w-6 h-6" />,
          color: 'text-red-600 dark:text-red-400',
          showProgress: false,
          showTimeEstimate: false
        }
      case 'cancelled':
        return {
          status: 'cancelled',
          progress: totalLeads > 0 ? (successCount + failedCount) / totalLeads * 100 : 0,
          message: 'Campanha cancelada',
          icon: <XCircle className="w-6 h-6" />,
          color: 'text-orange-600 dark:text-orange-400',
          showProgress: false,
          showTimeEstimate: false
        }
      default:
        return {
          status: 'sending',
          progress: 0,
          message: 'Preparando envio...',
          icon: <Clock className="w-6 h-6" />,
          color: 'text-gray-600 dark:text-gray-400',
          showProgress: true,
          showTimeEstimate: false
        }
    }
  }

  const statusInfo = getStatusInfo()
  const progress = statusInfo.progress
  const successRate = totalLeads > 0 ? (successCount / totalLeads * 100).toFixed(1) : '0'

  // Modal de sucesso (quando status = 'completed')
  if (status === 'completed') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="campaign-modal-light modal-container relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header compacto */}
              <div className="relative p-6 text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full"></div>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">Campanha Concluída!</h1>
                      <p className="text-lg opacity-90">{campaignName}</p>
                      <p className="text-sm opacity-80">Excelente performance! 🎉</p>
                    </div>
                  </div>
                  <button

                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Conteúdo compacto */}
              <div className="p-6">
                {/* Estatísticas responsivas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="stats-card text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {successCount}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Enviados</div>
                  </div>
                  <div className="stats-card text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                      {failedCount}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Falhas</div>
                  </div>
                  <div className="stats-card text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {totalLeads}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="stats-card text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {elapsedTime}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Duração</div>
                  </div>
                </div>

                {/* Performance compacta */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Performance
                    </h3>
                    <span className="text-xl font-bold text-slate-700 dark:text-gray-300">
                      {successRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div

                      className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full relative"
                      style={{ width: `${successRate}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Botão Ver Detalhes */}
                <div className="mb-6">
                  <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="outline"
                    className="w-full h-10 text-sm modal-details-button"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Completos'}
                  </Button>
                </div>

                {/* Detalhes Completos */}
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="details-section mb-6 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                      📊 Relatório Detalhado
                    </h3>

                    <div className="space-y-4">
                      {/* Estatísticas Detalhadas */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-2">
                          📈 Estatísticas de Envio
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Total de Leads:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{totalLeads}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Enviados com Sucesso:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{successCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Falhas:</span>
                            <span className="font-medium text-red-600 dark:text-red-400">{failedCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Taxa de Sucesso:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{successRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Informações de Tempo */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-2">
                          ⏱️ Informações de Tempo
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Duração Total:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{elapsedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Velocidade Média:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {totalLeads > 0 && startTime ?

                                `${Math.round(totalLeads / ((new Date().getTime() - startTime.getTime()) / 60000))} leads/min` :

                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 dark:text-gray-300">Status Final:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">Concluída</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Análise de Performance */}
                    <div className="performance-section mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-2">
                        🎯 Análise de Performance
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 dark:text-gray-300">Eficiência de Envio:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                              <div

                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                style={{ width: `${successRate}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white text-xs">{successRate}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 dark:text-gray-300">Qualidade da Campanha:</span>
                          <span className={`font-medium px-2 py-1 rounded-full text-xs ${parseFloat(successRate) >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            parseFloat(successRate) >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            {parseFloat(successRate) >= 90 ? 'Excelente' :
                              parseFloat(successRate) >= 70 ? 'Boa' : 'Precisa Melhorar'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Executivo */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                        📋 Resumo Executivo
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        A campanha <strong>"{campaignName}"</strong> foi executada com sucesso,

                        alcançando uma taxa de sucesso de <strong>{successRate}%</strong> em {elapsedTime} de duração.

                        {parseFloat(successRate) >= 90 ?

                          ' Excelente performance!' :
                          parseFloat(successRate) >= 70 ?
                            ' Boa performance!' :
                            ' Precisa melhorar.'
                        }
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Botão Fechar */}
                <div className="flex justify-center">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="h-10 text-sm px-6 modal-close-button"
                  >
                    Fechar
                  </Button>
                </div>
              </div>

              {/* Footer compacto */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Campanha finalizada com sucesso</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Modal de progresso (durante envio)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="campaign-modal-light modal-container relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header com progresso circular */}
            <div className="relative p-6 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Círculo de progresso */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {status === 'sending' && progress < 100 ? (
                        <div className="relative">
                          {/* Animação de dots pulsantes */}
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-dot-1"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-dot-2"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-dot-3"></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(progress)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{campaignName}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{statusInfo.message}</p>
                  </div>
                </div>
                {/* Sem botão de fechar durante envio */}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="px-6 pb-6">
              {/* Barra de progresso */}
              {statusInfo.showProgress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Progresso
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Estatísticas em grid 2x2 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="stats-card text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {successCount}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Enviados</div>
                </div>
                <div className="stats-card text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {failedCount}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Falhas</div>
                </div>
                <div className="stats-card text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {totalLeads}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Total</div>
                </div>
                <div className="stats-card text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {elapsedTime}
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Tempo</div>
                </div>
              </div>

              {/* Lead atual */}
              <div className="lead-section mb-6 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {isInitializing ? 'Iniciando processo de envio...' : (currentLead?.name || 'Preparando envio...')}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      {isInitializing ? 'Preparando campanha' : (currentLead?.phone || 'Aguarde...')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Campanha em andamento...</span>
                {status === 'sending' && (
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    className="text-xs min-w-fit w-auto px-3 py-1 modal-cancel-button"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
