/**
 * =====================================================
 * COMPONENTE STATS CARD - ESTATÍSTICAS DA CAMPANHA
 * =====================================================
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Target, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  variant = 'primary',
  trend,
  className
}) => {
  const getGradientClasses = () => {
    switch (variant) {
      case 'primary':
        return 'from-blue-500 to-purple-600'
      case 'success':
        return 'from-green-500 to-emerald-600'
      case 'warning':
        return 'from-orange-500 to-amber-600'
      case 'error':
        return 'from-red-500 to-rose-600'
      case 'info':
        return 'from-cyan-500 to-blue-600'
      default:
        return 'from-blue-500 to-purple-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">
            {title}
          </p>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </h3>
            {trend && (
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                trend.isPositive

                  ? 'text-green-600 dark:text-green-400'

                  : 'text-red-600 dark:text-red-400'
              }`}>
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${getGradientClasses()} rounded-lg flex items-center justify-center shadow-lg`}>
          <div className="w-4 h-4 sm:w-5 sm:h-5 text-white">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface CampaignStatsProps {
  stats: {
    totalLeads: number
    uniqueLeads: number
    selectedLists: number
    ignoredLists: number
    duplicates: number
  }
  className?: string
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({
  stats,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6', className)}>
      <StatsCard
        title="Total de Leads"
        value={stats.totalLeads}
        icon={<Eye className="w-5 h-5" />}
        variant="info"
      />
      <StatsCard
        title="Leads Únicos"
        value={stats.uniqueLeads}
        icon={<Users className="w-5 h-5" />}
        variant="primary"
      />
      <StatsCard
        title="Listas Selecionadas"
        value={stats.selectedLists}
        icon={<Target className="w-5 h-5" />}
        variant="success"
      />
      <StatsCard
        title="Listas Ignoradas"
        value={stats.ignoredLists}
        icon={<EyeOff className="w-5 h-5" />}
        variant="warning"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">
              Leads Duplicados
            </p>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.duplicates.toLocaleString()}
              </h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full border badge-ignorados">
                Ignorados
              </span>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
