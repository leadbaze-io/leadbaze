import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedBeam } from './magicui/animated-beam'
import { BorderBeam } from './magicui/border-beam'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import LGPDImage from '../assets/LGPD2.png'

export default function MagicHero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <motion.div

          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div

          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <AnimatedBeam delay={0.2}>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Geração de Leads Inteligente</span>
            </div>
          </AnimatedBeam>

          {/* Título Principal */}
          <AnimatedBeam delay={0.4}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Gere mais de 1000 Leads B2B
              </span>
              <br />
              <span className="text-gray-900">
                em menos de 7 dias
              </span>
            </h1>
          </AnimatedBeam>

          {/* Subtítulo */}
          <AnimatedBeam delay={0.6}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
            </p>
          </AnimatedBeam>

          {/* CTA Centralizado */}
          <AnimatedBeam delay={0.8}>
            <div className="flex justify-center mb-12">
              <ShimmerButton

                onClick={() => {

                  // Tentar múltiplos métodos para encontrar a seção
                  let pricingSection = document.getElementById('pricing-plans-section')

                  // Verificar se é a seção correta (não mobile)
                  if (pricingSection && pricingSection.classList.contains('md:hidden')) {

                    pricingSection = null
                  }

                  // Se não encontrar, tentar por classe (desktop)
                  if (!pricingSection) {
                    pricingSection = document.querySelector('section[id*="pricing"]:not(.md\\:hidden)')

                  }

                  // Se ainda não encontrar, tentar por texto (desktop)
                  if (!pricingSection) {
                    const sections = document.querySelectorAll('section:not(.md\\:hidden)')
                    for (const section of sections) {
                      if (section.textContent?.includes('Plano') || section.textContent?.includes('Preço')) {
                        pricingSection = section as HTMLElement

                        break
                      }
                    }
                  }

                  // Fallback: usar qualquer seção com pricing
                  if (!pricingSection) {
                    pricingSection = document.querySelector('[id*="pricing"]')

                  }
                  if (pricingSection) {
                    // Scroll com offset para compensar navbar fixa
                    const elementPosition = pricingSection.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - 80

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })

                  } else {

                    // Método alternativo: scroll para o final da página
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
                className="px-8 py-4 text-lg"
              >
                <span>Ver Planos</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </ShimmerButton>
            </div>
          </AnimatedBeam>

          {/* Selo LGPD */}
          <AnimatedBeam delay={1.0}>
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{

                  duration: 1.2,

                  delay: 1.0,
                  type: "spring",
                  stiffness: 100,
                  damping: 20
                }}
                whileHover={{

                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                className="relative group cursor-pointer"
              >
                <motion.div
                  animate={{

                    boxShadow: [
                      "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                      "0 20px 40px -3px rgba(0, 0, 0, 0.15)",
                      "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{

                    duration: 3,

                    repeat: Infinity,

                    ease: "easeInOut"

                  }}
                  className="p-2 rounded-full bg-gradient-to-br from-white via-gray-50 to-white"
                >
                  <img

                    src={LGPDImage}

                    alt="LGPD Compliant"

                    className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl group-hover:drop-shadow-3xl transition-all duration-500"
                  />
                </motion.div>
              </motion.div>
            </div>
          </AnimatedBeam>

          {/* Stats */}
          <AnimatedBeam delay={1.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="relative group">
                <BorderBeam delay={0.2} className="text-center p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black mb-3">
                    <AnimatedCounter value={10} suffix="x" className="text-blue-600" delay={500} />
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">Mais Rápido</div>
                  <div className="text-gray-500 text-sm mt-2">que métodos tradicionais</div>
                </BorderBeam>
              </div>

              <div className="relative group">
                <BorderBeam delay={0.4} className="text-center p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black mb-3">
                    <AnimatedCounter value={95} suffix="%" className="text-purple-600" delay={700} />
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">Precisão</div>
                  <div className="text-gray-500 text-sm mt-2">nos dados extraídos</div>
                </BorderBeam>
              </div>

              <div className="relative group">
                <BorderBeam delay={0.6} className="text-center p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black mb-3">
                    <AnimatedCounter value={1000} suffix="+" className="text-green-600" delay={900} />
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">Leads/semana</div>
                  <div className="text-gray-500 text-sm mt-2">plano Start</div>
                </BorderBeam>
              </div>
            </div>
          </AnimatedBeam>
        </div>
      </div>
    </section>
  )
}