import { motion } from 'framer-motion'
import { Megaphone, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  onButtonClick: () => void
  icon?: React.ComponentType<{ className?: string }>
  showWhatsAppHint?: boolean
}

export function EmptyState({

  title,

  description,

  buttonText,

  onButtonClick,

  icon: Icon = Megaphone,
  showWhatsAppHint = false
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Background com gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 rounded-xl" />

      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-8 text-center">
        {/* Ícone simples */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-blue-700 dark:text-blue-300" />
          </div>
        </motion.div>

        {/* Título */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3"
        >
          {title}
        </motion.h3>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Dica do WhatsApp se necessário */}
        {showWhatsAppHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Configure o WhatsApp primeiro para começar
              </span>
            </div>
          </motion.div>
        )}

        {/* Botão principal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button
            onClick={onButtonClick}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            <div className="relative flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">{buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Button>
        </motion.div>

        {/* Elementos decorativos */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full opacity-60" />
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 dark:bg-purple-500 rounded-full opacity-40" />
        <div className="absolute top-1/2 right-8 w-1 h-1 bg-pink-400 dark:bg-pink-500 rounded-full opacity-30" />
      </div>
    </motion.div>
  )
}
