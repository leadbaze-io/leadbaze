/**
 * =====================================================
 * COMPONENTE BUTTON - DESIGN SYSTEM
 * =====================================================
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'default'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'text-white hover:opacity-90 focus:ring-green-500',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-green-500 border border-gray-300 dark:border-gray-600',
    outline: 'bg-transparent text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-green-500 border border-gray-300 dark:border-gray-600',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-green-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    gradient: 'text-white hover:opacity-90 focus:ring-green-500',
    default: 'text-white hover:opacity-90 focus:ring-green-500'
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
    default: 'h-10 px-4 text-sm'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'cursor-wait',
        className
      )}
      style={{
        ...(variant === 'primary' && {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff'
        }),
        ...(variant === 'gradient' && {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff'
        }),
        ...(variant === 'default' && {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff'
        })
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  ...props
}) => {
  return (
    <Button
      size="icon"
      {...props}
    >
      {icon}
    </Button>
  )
}