import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, Clock } from 'lucide-react'

export default function MobileGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="md:hidden py-12 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs shadow-lg mb-4">
            <Shield className="w-3 h-3" />
            Garantia Total
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">30 dias</span>
            <span className="text-white"> sem risco</span>
          </h2>
          <p className="text-sm text-gray-300">
            Não funcionou? Dinheiro de volta, sem burocracia.
          </p>
        </motion.div>

        {/* Guarantee Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center mb-6 shadow-2xl"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-white/90" />
          <div className="text-2xl font-bold mb-2">30 DIAS</div>
          <div className="text-sm font-semibold mb-2">GARANTIA TOTAL</div>
          <div className="text-xs opacity-90">100% do seu dinheiro de volta</div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Sem letra miúda</h3>
                <p className="text-gray-300 text-xs">Política simples e transparente</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Sem burocracia</h3>
                <p className="text-gray-300 text-xs">Processo rápido e fácil</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <div className="text-lg font-bold text-white">95%</div>
            <div className="text-xs text-gray-400">Taxa de renovação</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <div className="text-lg font-bold text-white">0%</div>
            <div className="text-xs text-gray-400">Reembolsos solicitados</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


