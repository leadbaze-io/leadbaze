import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, Users, TrendingUp, Sparkles, Target, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onGoToDashboard: () => void
  listName: string
  leadsCount: number
  isNewList: boolean
}

export default function SuccessModal({

  isOpen,

  onClose,

  onGoToDashboard,

  listName,

  leadsCount,

  isNewList

}: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{

            type: "spring",

            damping: 20,

            stiffness: 300,
            duration: 0.6
          }}
          className="modal-sucesso-bg-claro modal-sucesso-bg-escuro rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-lg w-full mx-4 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 modal-sucesso-decoration-claro modal-sucesso-decoration-escuro opacity-60" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 modal-sucesso-glow-claro modal-sucesso-glow-escuro rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{

                delay: 0.2,

                type: "spring",

                damping: 15,

                stiffness: 300

              }}
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 modal-sucesso-icon-claro modal-sucesso-icon-escuro rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
            >
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl lg:text-2xl font-bold modal-sucesso-titulo-claro modal-sucesso-titulo-escuro mb-2 sm:mb-3 text-center px-2"
            >
              {isNewList ? 'Lista Criada!' : 'Leads Adicionados!'}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base lg:text-lg modal-sucesso-descricao-claro modal-sucesso-descricao-escuro mb-4 sm:mb-6 lg:mb-8 text-center leading-relaxed px-2"
            >
              {isNewList

                ? `"${listName}" está pronta para uso!`
                : `${leadsCount} leads adicionados à "${listName}"!`
              }
            </motion.p>

            {/* Enhanced Stats - Compact for Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="modal-sucesso-stats-claro modal-sucesso-stats-escuro rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                {/* Leads Count */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 modal-sucesso-stats-icon-claro modal-sucesso-stats-icon-escuro rounded-xl sm:rounded-2xl mb-2 sm:mb-3 mx-auto">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold modal-sucesso-stats-numero-claro modal-sucesso-stats-numero-escuro mb-1">
                    {leadsCount}
                  </div>
                  <div className="text-xs sm:text-sm font-medium modal-sucesso-stats-label-claro modal-sucesso-stats-label-escuro">
                    Leads
                  </div>
                </div>

                {/* Quality Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 modal-sucesso-stats-icon-purple-claro modal-sucesso-stats-icon-purple-escuro rounded-xl sm:rounded-2xl mb-2 sm:mb-3 mx-auto">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold modal-sucesso-stats-numero-purple-claro modal-sucesso-stats-numero-purple-escuro mb-1">
                    100%
                  </div>
                  <div className="text-xs sm:text-sm font-medium modal-sucesso-stats-label-purple-claro modal-sucesso-stats-label-purple-escuro">
                    Qualificados
                  </div>
                </div>

                {/* Ready for Campaign */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 dark:bg-green-900 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 mx-auto">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    ✓
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                    Pronto
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2 sm:space-y-3"
            >
              <Button
                onClick={onGoToDashboard}
                className="w-full modal-sucesso-botao-principal-claro modal-sucesso-botao-principal-escuro py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ir para Dashboard
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full modal-sucesso-botao-secundario-claro modal-sucesso-botao-secundario-escuro py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base lg:text-lg transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Continuar Gerando
              </Button>
            </motion.div>

            {/* Enhanced Success Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 modal-sucesso-mensagem-claro modal-sucesso-mensagem-escuro border rounded-xl sm:rounded-2xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                <p className="text-xs sm:text-sm font-medium modal-sucesso-mensagem-texto-claro modal-sucesso-mensagem-texto-escuro text-center">
                  Pronta para prospecção e disparo!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}