import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react'
import { ShimmerButton } from '../magicui/shimmer-button'
import { AnimatedBeam } from '../magicui/animated-beam'
import { BorderBeam } from '../magicui/border-beam'
import { AnimatedCounter } from '../magicui/animated-counter'
import LGPDImage from '../../assets/LGPD2.png'

export default function MobileHero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="md:hidden relative py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-green-100/40 to-cyan-100/40 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4">
        <div className="text-center">

          {/* Main Heading */}
          <AnimatedBeam delay={0.6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Gere mais de 1000 Leads B2B
                </span>
                <br />
                <span className="text-gray-900 font-bold">
                  em menos de 7 dias
                </span>
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Tudo que você precisa para prospectar, escalar e ter sucesso em vendas.
              </p>
            </motion.div>
          </AnimatedBeam>

          {/* CTA Button */}
          <AnimatedBeam delay={0.7}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <ShimmerButton

                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
              >
                <span>Ver Planos</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </ShimmerButton>
            </motion.div>
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

                    className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl group-hover:drop-shadow-3xl transition-all duration-500"
                  />
                </motion.div>
              </motion.div>
            </div>
          </AnimatedBeam>

          {/* Stats */}
          <AnimatedBeam delay={1.2}>
            <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
              <div className="relative group">
                <BorderBeam delay={0.2} className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    <AnimatedCounter value={10} suffix="x" className="text-blue-600" delay={500} />
                  </div>
                  <div className="text-gray-700 font-semibold text-base">Mais Rápido</div>
                  <div className="text-gray-500 text-sm mt-1">que métodos tradicionais</div>
                </BorderBeam>
              </div>

              <div className="relative group">
                <BorderBeam delay={0.4} className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    <AnimatedCounter value={95} suffix="%" className="text-purple-600" delay={700} />
                  </div>
                  <div className="text-gray-700 font-semibold text-base">Precisão</div>
                  <div className="text-gray-500 text-sm mt-1">nos dados extraídos</div>
                </BorderBeam>
              </div>

              <div className="relative group">
                <BorderBeam delay={0.6} className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black mb-2">
                    <AnimatedCounter value={1000} suffix="+" className="text-green-600" delay={900} />
                  </div>
                  <div className="text-gray-700 font-semibold text-base">Leads/semana</div>
                  <div className="text-gray-500 text-sm mt-1">plano Start</div>
                </BorderBeam>
              </div>
            </div>
          </AnimatedBeam>
        </div>
      </div>
    </section>
  )
}
