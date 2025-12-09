import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, Star, TrendingUp } from 'lucide-react'
import LGPDImage from '../assets/LGPD2.webp'
import { AnimatedBeam } from './magicui/animated-beam'

export default function MagicGuarantee() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden" style={{ display: 'none' }}>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Teste <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>7 Dias</span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Sem Risco
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sem letra miúda. Sem burocracia. Apenas resultados comprovados.
            </p>
          </div>
        </AnimatedBeam>

        {/* Main Content Grid */}
        <AnimatedBeam delay={0.4}>
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
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col" style={{ borderColor: '#00ff00', borderWidth: '2px' }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
                </div>

                {/* Header with Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: '#00ff00' }}>
                    <TrendingUp className="w-8 h-8" style={{ color: '#082721' }} />
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative space-y-4 flex-1 flex flex-col">
                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:transition-colors duration-300" style={{ color: '#082721' }}>
                      95% de Renovação
                    </h3>
                    <p className="font-medium text-xl" style={{ color: '#2e4842' }}>
                      Após o primeiro mês
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-lg leading-relaxed" style={{ color: '#2e4842' }}>
                    Nossa taxa de renovação demonstra a eficácia da plataforma. Empresas que testam a LeadBaze continuam utilizando nossos serviços.
                  </p>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderTopColor: '#00ff00' }}></div>
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
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col" style={{ borderColor: '#00ff00', borderWidth: '2px' }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
                </div>

                {/* Header with Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: '#00ff00' }}>
                    <Star className="w-8 h-8" style={{ color: '#082721' }} />
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative space-y-4 flex-1 flex flex-col">
                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:transition-colors duration-300" style={{ color: '#082721' }}>
                      Por que oferecemos?
                    </h3>
                    <p className="font-medium text-xl" style={{ color: '#2e4842' }}>
                      Confiança no produto
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-lg leading-relaxed" style={{ color: '#2e4842' }}>
                    Acreditamos na qualidade do nosso produto. Sabemos que funciona e queremos que você tenha a confiança necessária para testar sem riscos.
                  </p>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderTopColor: '#00ff00' }}></div>
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
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col" style={{ borderColor: '#00ff00', borderWidth: '2px' }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
                </div>

                {/* Header with Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: '#00ff00' }}>
                    <Shield className="w-8 h-8" style={{ color: '#082721' }} />
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative space-y-4 flex-1 flex flex-col">
                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:transition-colors duration-300" style={{ color: '#082721' }}>
                      Dois caminhos
                    </h3>
                    <p className="font-medium text-xl" style={{ color: '#2e4842' }}>
                      Sucesso ou devolução
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#00ff00' }} />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">Sucesso nas vendas</p>
                        <p className="text-gray-600 text-base">Mais reuniões comerciais e aumento nas vendas</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#00ff00' }} />
                      <div>
                        <p className="font-semibold text-lg" style={{ color: '#082721' }}>Devolução integral</p>
                        <p className="text-base" style={{ color: '#2e4842' }}>100% do valor pago de volta</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderTopColor: '#00ff00' }}></div>
              </div>
            </motion.div>
          </div>
        </AnimatedBeam>

        {/* LGPD Compliance Badge */}
        <AnimatedBeam delay={0.6}>
          <div className="flex justify-center mt-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border border-gray-200">
                <img
                  src={LGPDImage}
                  alt="LGPD Compliant"
                  className="w-20 h-20 object-contain drop-shadow-lg"
                  loading="lazy"
                  width="80"
                  height="80"
                />
              </div>
              <p className="text-gray-600 text-sm font-medium text-center max-w-xs">
                Conformidade total com a LGPD
              </p>
            </div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}
