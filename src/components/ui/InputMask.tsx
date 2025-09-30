import React, { useState, useEffect, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string
  placeholder?: string
  onValueChange?: (value: string, formatted: string) => void
  error?: string
  label?: string
  icon?: React.ReactNode
  forceLightMode?: boolean
}

/**
 * Componente de input com máscara para formatação automática
 * Suporta máscaras como: 999.999.999-99, (99) 99999-9999, etc.
 */
export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  ({

    mask,

    placeholder,

    onValueChange,

    error,

    label,

    icon,

    className,

    value,

    onChange,
    forceLightMode = false,
    ...props

  }, ref) => {
    const [formattedValue, setFormattedValue] = useState('')

    // Aplica máscara ao valor
    const applyMask = (value: string, mask: string): string => {
      const cleanValue = value.replace(/\D/g, '')
      let maskedValue = ''
      let valueIndex = 0

      for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
        if (mask[i] === '9') {
          maskedValue += cleanValue[valueIndex]
          valueIndex++
        } else {
          maskedValue += mask[i]
        }
      }

      return maskedValue
    }

    // Remove máscara do valor
    const removeMask = (value: string): string => {
      return value.replace(/\D/g, '')
    }

    // Inicializa valores
    useEffect(() => {
      if (value) {
        const stringValue = String(value)
        setFormattedValue(stringValue)
        setFormattedValue(applyMask(stringValue, mask))
      }
    }, [value, mask])

    // Manipula mudanças no input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      const cleanValue = removeMask(newValue)
      const formatted = applyMask(cleanValue, mask)

      setFormattedValue(cleanValue)
      setFormattedValue(formatted)

      // Chama onChange original se fornecido
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: cleanValue
          }
        }
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
      }

      // Chama callback personalizado
      if (onValueChange) {
        onValueChange(cleanValue, formatted)
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type="text"
            value={formattedValue || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
              // Modo claro forçado
              forceLightMode

                ? "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

InputMask.displayName = 'InputMask'

// Máscaras pré-definidas
export const MASKS = {
  CPF: '999.999.999-99',
  CNPJ: '99.999.999/9999-99',
  CEP: '99999-999',
  PHONE: '(99) 99999-9999',
  PHONE_10: '(99) 9999-9999',
  DATE: '99/99/9999',
  CARD_NUMBER: '9999 9999 9999 9999',
  CARD_EXPIRY: '99/99',
  CARD_CVV: '999'
} as const

export default InputMask
