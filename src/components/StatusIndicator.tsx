import { motion } from 'framer-motion'
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface StatusIndicatorProps {
  status: 'ready' | 'generating' | 'completed' | 'error'
  className?: string
}

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ready':
        return {
          icon: Zap,
          text: 'Pronto para extrair',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          iconColor: 'text-blue-600 dark:text-blue-400',
          animation: 'pulse'
        }
      case 'generating':
        return {
          icon: Loader2,
          text: 'Extraindo leads...',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950',
          iconColor: 'text-orange-600 dark:text-orange-400',
          animation: 'spin'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Extração completa!',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950',
          iconColor: 'text-green-600 dark:text-green-400',
          animation: 'bounce'
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro na extração',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950',
          iconColor: 'text-red-600 dark:text-red-400',
          animation: 'shake'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`h-12 flex items-center px-4 ${config.bgColor} rounded-lg border-2 border-dashed gerador-input-claro gerador-input-escuro ${className}`}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={config.animation === 'spin' ? { rotate: 360 } : {}}
          transition={config.animation === 'spin' ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          className={`flex items-center justify-center w-6 h-6 ${config.iconColor}`}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>

        <motion.span
          key={status}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className={`text-sm font-medium ${config.color}`}
        >
          {config.text}
        </motion.span>
      </div>

      {/* Progress dots for generating status */}
      {status === 'generating' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-auto flex space-x-1"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-orange-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Success checkmark animation */}
      {status === 'completed' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{

            type: "spring",

            stiffness: 500,

            damping: 15,
            delay: 0.2
          }}
          className="ml-auto"
        >
          <motion.div
            animate={{

              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{

              duration: 0.6,
              repeat: 1,
              delay: 0.3
            }}
            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
