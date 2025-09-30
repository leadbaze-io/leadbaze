import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, Star, TrendingUp } from 'lucide-react'

export default function MagicGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Teste <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>7 Dias</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Sem Risco
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sem letra miúda. Sem burocracia. Apenas resultados comprovados.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column - Success Rate */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{

              y: -12,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative h-full flex flex-col"
          >
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-4 flex-1 flex flex-col">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    95% de Renovação
                  </h3>
                  <p className="text-gray-600 font-medium text-xl">
                    Após o primeiro mês
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  Nossa taxa de renovação demonstra a eficácia da plataforma. Empresas que testam a LeadBaze continuam utilizando nossos serviços.
                </p>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-3xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>

          {/* Center Column - Why We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{

              y: -12,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative h-full flex flex-col"
          >
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <Star className="w-8 h-8" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-4 flex-1 flex flex-col">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    Por que oferecemos?
                  </h3>
                  <p className="text-gray-600 font-medium text-xl">
                    Confiança no produto
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  Acreditamos na qualidade do nosso produto. Sabemos que funciona e queremos que você tenha a confiança necessária para testar sem riscos.
                </p>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-3xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>

          {/* Right Column - Two Paths */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{

              y: -12,
              scale: 1.02,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            className="group relative h-full flex flex-col"
          >
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
              </div>

              {/* Header with Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <Shield className="w-8 h-8" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative space-y-4 flex-1 flex flex-col">
                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    Dois caminhos
                  </h3>
                  <p className="text-gray-600 font-medium text-xl">
                    Sucesso ou devolução
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">Sucesso nas vendas</p>
                      <p className="text-gray-600 text-base">Mais reuniões comerciais e aumento nas vendas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">Devolução integral</p>
                      <p className="text-gray-600 text-base">100% do valor pago de volta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-3xl"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
