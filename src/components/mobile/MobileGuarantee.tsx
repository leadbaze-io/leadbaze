import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, TrendingUp } from 'lucide-react'

export default function MobileGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="md:hidden relative py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-green-100/40 to-cyan-100/40 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Teste <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>7 Dias</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Sem Risco
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Sem letra miúda. Sem burocracia. Apenas resultados comprovados.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Success Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{

              y: -8,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative"
          >
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-lg"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-3">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors duration-300">
                    95% de Renovação
                  </h3>
                  <p className="text-gray-600 font-medium text-lg">
                    Após o primeiro mês
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Nossa taxa de renovação demonstra a eficácia da plataforma. Empresas que testam a LeadBaze continuam utilizando nossos serviços.
                </p>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>

          {/* Center Column - Why We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{

              y: -8,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative"
          >
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-lg"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <Shield className="w-7 h-7" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-3">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors duration-300">
                    Por que oferecemos essa garantia?
                  </h3>
                  <p className="text-gray-600 font-medium text-lg">
                    Porque sabemos que funciona
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Temos uma taxa de 95% de renovação após o primeiro mês. Temos apenas dois caminhos: Você consegue mais reuniões comerciais ou seu dinheiro de volta.
                </p>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>

          {/* Right Column - Activation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{

              y: -8,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative"
          >
            <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-lg"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <CheckCircle className="w-7 h-7" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-3">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors duration-300">
                    Ativação Instantânea
                  </h3>
                  <p className="text-gray-600 font-medium text-lg">
                    Sem espera, sem complicação
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Comece a usar a plataforma imediatamente após a contratação. Sem configurações complexas, sem espera por aprovações.
                </p>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
