/**
 * =====================================================
 * COMPONENTE ANIMATED SUBSCRIBE BUTTON - BOTÃO ANIMADO
 * =====================================================
 * Baseado na documentação do Magic UI
 * https://magicui.design/docs/components/animated-subscribe-button
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'

interface AnimatedSubscribeButtonProps {
  subscribeStatus?: boolean
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export const AnimatedSubscribeButton: React.FC<AnimatedSubscribeButtonProps> = ({
  subscribeStatus = false,
  children: _children,
  className = '',
  onClick,
  disabled = false,
  loading = false
}) => {
  const [isSubscribed, setIsSubscribed] = useState(subscribeStatus)

  const handleClick = () => {
    if (disabled || loading) return

    setIsSubscribed(!isSubscribed)
    if (onClick) {
      onClick()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden px-8 py-4 rounded-xl font-semibold text-white
        bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-xl transition-all duration-300
        min-w-48 flex items-center justify-center gap-3
        ${className}
      `}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {/* Background animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{

          scale: isSubscribed ? 1 : 0,

          opacity: isSubscribed ? 1 : 0

        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Conteúdo do botão */}
      <motion.div
        className="relative z-10 flex items-center gap-3"
        initial={false}
        animate={{

          x: isSubscribed ? -20 : 0,
          opacity: isSubscribed ? 0 : 1

        }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Enviar Campanha</span>
          </>
        )}
      </motion.div>

      {/* Estado de sucesso */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center gap-3"
        initial={{ x: 20, opacity: 0 }}
        animate={{

          x: isSubscribed ? 0 : 20,
          opacity: isSubscribed ? 1 : 0

        }}
        transition={{ duration: 0.3 }}
      >
        <CheckCircle className="w-5 h-5" />
        <span>Enviado!</span>
      </motion.div>

      {/* Efeito de brilho */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isSubscribed ? '100%' : '-100%' }}
        transition={{

          duration: 0.6,

          delay: isSubscribed ? 0.2 : 0,
          ease: "easeInOut"

        }}
      />
    </motion.button>
  )
}
