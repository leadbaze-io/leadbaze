import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, ArrowRight, Star } from 'lucide-react'

export default function MagicGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>

      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm shadow-lg mb-8"
          >
            <Shield className="w-4 h-4" />
            🛡️ 6º Dobra - GARANTIA
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Teste <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">30 Dias</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sem Risco
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Sem letra miúda. Sem burocracia.
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-left"
          >
            <div className="space-y-8">
              {/* Why We Offer This Guarantee */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Por que oferecemos essa garantia?
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Porque sabemos que funciona. Temos uma <span className="font-semibold text-green-400">taxa de 95% de renovação</span> após o primeiro mês.
                </p>
              </div>

              {/* Two Paths */}
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-700/50">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                  Temos apenas dois caminhos:
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <p className="text-lg text-gray-300">
                      <span className="font-semibold text-white">Você consegue mais reuniões comerciais</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <p className="text-lg text-gray-300">
                      <span className="font-semibold text-white">Ou seu dinheiro de volta</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <div className="relative">
              {/* Main Guarantee Card */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 shadow-2xl transform rotate-3"
              >
                <div className="text-white text-center">
                  <Shield className="w-20 h-20 mx-auto mb-6 text-white/90" />
                  <div className="text-4xl font-bold mb-2">30 DIAS</div>
                  <div className="text-xl font-semibold mb-4">GARANTIA TOTAL</div>
                  <div className="text-lg opacity-90">100% do seu dinheiro de volta</div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg"
              >
                ⭐ 95% Renovação
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
              >
                🚀 Sem Risco
              </motion.div>
            </div>
          </motion.div>
        </div>


      </div>
    </section>
  )
}
