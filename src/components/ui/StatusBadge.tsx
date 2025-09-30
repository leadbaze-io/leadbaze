import { motion } from 'framer-motion'
import { CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react'

interface StatusBadgeProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'qrcode' | 'error'
  instanceName?: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'WhatsApp Conectado',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-300',
          iconColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
          pulse: true
        }
      case 'connecting':
        return {
          icon: Clock,
          text: 'Conectando...',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          pulse: true
        }
      case 'qrcode':
        return {
          icon: Wifi,
          text: 'Aguardando QR Code',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-800 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800',
          pulse: false
        }
      case 'error':
        return {
          icon: WifiOff,
          text: 'Erro na Conexão',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
          pulse: true
        }
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          text: 'WhatsApp Desconectado',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
          pulse: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
        border transition-all duration-200
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${config.pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <motion.div
        animate={config.pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={`${config.iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </motion.div>

      <span className="font-semibold">
        {config.text}
      </span>

      {status === 'connected' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"
        />
      )}
    </motion.div>
  )
}
