import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, Users, TrendingUp } from 'lucide-react'
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 opacity-50" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-600 rounded-full blur-3xl opacity-20" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              {isNewList ? 'Lista Criada com Sucesso!' : 'Leads Adicionados com Sucesso!'}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 mb-6"
            >
              {isNewList 
                ? `Sua nova lista "${listName}" foi criada e está pronta para uso!`
                : `${leadsCount} leads foram adicionados à lista "${listName}"!`
              }
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-4 mb-6 border border-blue-100 dark:border-blue-800"
            >
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl mb-2">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{leadsCount}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Leads</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Qualificados</div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={onGoToDashboard}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ir para Dashboard
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Continuar Gerando Leads
              </Button>
            </motion.div>

            {/* Success message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl"
            >
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                ✨ Sua lista está pronta para prospecção e disparo de mensagens!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}















