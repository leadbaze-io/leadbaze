import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  loading?: boolean
  icon?: React.ReactNode
  count?: number
  gradient?: 'blue' | 'red' | 'green' | 'purple'
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  loading = false,
  icon,
  count,
  gradient,
  ...props
}) => {
  const getGradientClasses = () => {
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700'
      case 'red':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700'
      case 'green':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700'
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700'
      default:
        return ''
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{

        type: "spring",

        stiffness: 400,

        damping: 17

      }}
    >
      <Button
        variant={variant === 'link' ? 'ghost' : variant}
        size={size}
        className={cn(
          'transition-all duration-300 hover:shadow-lg',
          getGradientClasses(),
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {icon && (
            <motion.div
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{

                duration: loading ? 1 : 0.3,
                repeat: loading ? Infinity : 0,
                ease: "linear"
              }}
            >
              {icon}
            </motion.div>
          )}

          <span>{children}</span>

          {count !== undefined && count > 0 && (
            <motion.span
              className="ml-1 text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
            >
              {count}
            </motion.span>
          )}
        </motion.div>
      </Button>
    </motion.div>
  )
}
