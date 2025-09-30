/**
 * =====================================================
 * OVERLAY DE CONCLUSÃO DE CAMPANHA - TELA CHEIA
 * =====================================================
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {

  AlertCircle,

  X,

  Eye,

  Sparkles,

  Trophy,
  Clock,
  Users,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { Button } from './ui/button'

interface CampaignCompletionOverlayProps {
  isVisible: boolean
  onClose: () => void
  campaignName: string
  status: 'completed' | 'failed'
  successCount: number
  failedCount: number
  totalLeads: number
  duration: number // em segundos
}

export function CampaignCompletionOverlay({
  isVisible,
  onClose,
  campaignName,
  status,
  successCount,
  failedCount,
  totalLeads,
  duration
}: CampaignCompletionOverlayProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Efeito de celebração para campanhas bem-sucedidas
  useEffect(() => {
    if (isVisible && status === 'completed') {
      setShowCelebration(true)
      // Parar celebração após 3 segundos
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [isVisible, status])

  // Auto-fechar após 20 segundos se não for interagido
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 20000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSuccessRate = () => {
    return totalLeads > 0 ? Math.round((successCount / totalLeads) * 100) : 0
  }

  const getPerformanceMessage = () => {
    const rate = getSuccessRate()
    if (rate >= 90) return "Excelente performance! 🎉"
    if (rate >= 80) return "Boa performance! 👍"
    if (rate >= 70) return "Performance satisfatória ✅"
    if (rate >= 50) return "Performance regular ⚠️"
    return "Performance precisa melhorar 📈"
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Efeito de partículas de celebração */}
        {showCelebration && status === 'completed' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                initial={{

                  scale: 0,
                  rotate: 0
                }}
                animate={{

                  scale: [0, 1, 0],
                  rotate: [0, 360],
                  y: [-20, -100],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{

              type: "spring",

              stiffness: 300,

              damping: 30,
              duration: 0.8

            }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com gradiente animado */}
            <div className={`relative p-8 text-white ${
              status === 'completed'

                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'

                : 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500'
            }`}>
              {/* Efeito de ondas animadas */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{

                      type: "spring",

                      stiffness: 200,

                      delay: 0.3

                    }}
                    className="p-4 bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    {status === 'completed' ? (
                      <Trophy className="w-12 h-12" />
                    ) : (
                      <AlertCircle className="w-12 h-12" />
                    )}
                  </motion.div>

                  <div>
                    <motion.h1

                      className="text-4xl font-bold mb-2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {status === 'completed' ? 'Campanha Concluída!' : 'Campanha Falhou'}
                    </motion.h1>
                    <motion.p

                      className="text-xl opacity-90"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {campaignName}
                    </motion.p>
                    <motion.p

                      className="text-lg opacity-80 mt-2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {getPerformanceMessage()}
                    </motion.p>
                  </div>
                </div>

                <motion.button
                  onClick={onClose}
                  className="p-3 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <X className="w-8 h-8" />
                </motion.button>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="p-8">
              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <motion.div

                  className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {successCount}
                  </div>
                  <div className="text-sm campaign-stats-label-claro campaign-stats-label-escuro font-medium">Enviados</div>
                </motion.div>

                <motion.div

                  className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {failedCount}
                  </div>
                  <div className="text-sm campaign-stats-label-claro campaign-stats-label-escuro font-medium">Falhas</div>
                </motion.div>

                <motion.div

                  className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {getSuccessRate()}%
                  </div>
                  <div className="text-sm campaign-stats-label-claro campaign-stats-label-escuro font-medium">Taxa Sucesso</div>
                </motion.div>

                <motion.div

                  className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {formatDuration(duration)}
                  </div>
                  <div className="text-sm campaign-stats-label-claro campaign-stats-label-escuro font-medium">Duração</div>
                </motion.div>
              </div>

              {/* Gráfico de performance visual */}
              <motion.div

                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    Performance da Campanha
                  </h3>
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {getSuccessRate()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${getSuccessRate()}%` }}
                    transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Detalhes expandidos */}
              <motion.div

                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="outline"
                  className="w-full campaign-details-button-claro campaign-details-button-escuro"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {showDetails ? 'Ocultar' : 'Ver'} Detalhes Completos
                </Button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-6 rounded-2xl campaign-details-area-claro campaign-details-area-escuro"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl campaign-stats-card-claro campaign-stats-card-escuro">
                            <div className="flex items-center">
                              <Users className="w-5 h-5 text-blue-500 mr-3" />
                              <span className="text-gray-700 dark:text-gray-300">Total de Leads</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{totalLeads}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl campaign-stats-card-claro campaign-stats-card-escuro">
                            <div className="flex items-center">
                              <Target className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700 dark:text-gray-300">Taxa de Sucesso</span>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400">{getSuccessRate()}%</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl campaign-stats-card-claro campaign-stats-card-escuro">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-purple-500 mr-3" />
                              <span className="text-gray-700 dark:text-gray-300">Tempo Médio/Lead</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {totalLeads > 0 ? formatDuration(Math.round(duration / totalLeads)) : '0:00'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl campaign-stats-card-claro campaign-stats-card-escuro">
                            <div className="flex items-center">
                              <TrendingUp className="w-5 h-5 text-orange-500 mr-3" />
                              <span className="text-gray-700 dark:text-gray-300">Performance</span>
                            </div>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              {getPerformanceMessage().split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Botão de ação */}
              <motion.div

                className="flex gap-4 justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 campaign-close-button-claro campaign-close-button-escuro"
                  onClick={onClose}
                >
                  Fechar
                </Button>
              </motion.div>
            </div>

            {/* Footer com efeito de brilho */}
            <div className="px-8 pb-6">
              <motion.div
                className="flex items-center justify-center space-x-3 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <Sparkles className="w-4 h-4 campaign-footer-icon-claro campaign-footer-icon-escuro" />
                <span className="campaign-footer-text-claro campaign-footer-text-escuro">Campanha finalizada com sucesso</span>
                <Sparkles className="w-4 h-4 campaign-footer-icon-claro campaign-footer-icon-escuro" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
