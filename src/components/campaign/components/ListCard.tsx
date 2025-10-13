/**
 * =====================================================
 * COMPONENTE LIST CARD - CARD DE LISTA
 * =====================================================
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Minus, EyeOff } from 'lucide-react'

import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import type { LeadList } from '../../../types/campaign'

interface ListCardProps {
  list: LeadList
  isSelected: boolean
  isIgnored: boolean
  leadsCount: number
  onToggle: () => void
  onIgnore: () => void
  loading: boolean
}

export const ListCard: React.FC<ListCardProps> = ({
  list,
  isSelected,
  isIgnored,
  leadsCount,
  onToggle,
  onIgnore,
  loading
}) => {
  const getCardClass = () => {
    if (isSelected) {
      return 'list-card-selected-improved'
    } else if (isIgnored) {
      return 'list-card-ignored-improved'
    } else {
      return 'list-card-improved'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card

        className={`transition-all duration-300 hover:shadow-xl ${getCardClass()} cursor-pointer sm:cursor-default`}
        onClick={(e) => {
          // No mobile, permitir toque no card inteiro para adicionar/remover
          if (window.innerWidth < 640) {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Ícone otimizado para mobile */}
              <motion.div

                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate mb-1" title={list.name}>
                  {list.name}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {leadsCount} leads
                  </span>
                  {/* Indicador mobile */}
                  <span className="sm:hidden text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {isSelected ? 'Adicionada' : 'Toque para adicionar'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isIgnored && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()} // Prevenir propagação no mobile
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onIgnore}
                    disabled={loading}
                    className="h-8 w-8 p-0 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()} // Prevenir propagação no mobile
              >
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={onToggle}
                  disabled={loading}
                  className={`h-8 w-8 p-0 ${
                    isSelected

                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg"

                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg"
                  } transition-all duration-200`}
                >
                  {isSelected ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}