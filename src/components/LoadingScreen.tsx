import { motion } from 'framer-motion'
// import { Loader2 } from 'lucide-react'
import '../styles/skeleton-loading.css'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingScreen({

  message = "Carregando...",

  fullScreen = true

}: LoadingScreenProps) {
  const containerClass = fullScreen

    ? "fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 transition-colors duration-300"

    : "w-full h-64 bg-white dark:bg-gray-800 transition-colors duration-300"

  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Spinner duplo para melhor visual */}
        <motion.div
          animate={{

            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{

            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mb-6 relative"
        >
          <div className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="w-12 h-12 border-2 border-transparent border-t-blue-500 rounded-full absolute top-0 left-0 animate-spin"></div>
        </motion.div>

        {/* Texto de carregamento */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 font-medium text-lg"
        >
          {message}
        </motion.p>

        {/* Barra de progresso animada */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ maxWidth: "200px", margin: "16px auto 0" }}
        />

        {/* Pontos de loading */}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{

                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{

                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Loading skeleton para listas
export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
        >
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 skeleton-loading-force rounded w-3/4"></div>
                <div className="h-3 skeleton-loading-force rounded w-1/2"></div>
              </div>
              <div className="h-8 skeleton-loading-force rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 skeleton-loading-force rounded w-full"></div>
              <div className="h-3 skeleton-loading-force rounded w-2/3"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Loading skeleton para cards de leads
export function LeadCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300"
        >
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 skeleton-loading-force rounded w-16"></div>
              <div className="h-4 skeleton-loading-force rounded w-12"></div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-5 skeleton-loading-force rounded w-3/4"></div>
              <div className="h-3 skeleton-loading-force rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 skeleton-loading-force rounded w-2/3"></div>
              <div className="h-3 skeleton-loading-force rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Loading para gráficos/analytics
export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
        >
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 skeleton-loading-force rounded w-1/2"></div>
              <div className="h-8 w-8 skeleton-loading-force rounded"></div>
            </div>
            <div className="h-8 skeleton-loading-force rounded w-3/4 mb-2"></div>
            <div className="h-3 skeleton-loading-force rounded w-1/3"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
