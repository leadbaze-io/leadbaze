import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { ShimmerButton } from '../magicui/shimmer-button'
import { AnimatedCounter } from '../magicui/animated-counter'

export default function MobileCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { value: 1000, suffix: '+', label: 'Empresas Confiam' },
    { value: 99.9, suffix: '%', label: 'Uptime Garantido' },
    { value: 24, suffix: '/7', label: 'Suporte Ativo' }
  ]

  return (
    <section className="md:hidden relative py-16 bg-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div

          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-md mx-auto px-4">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs shadow-lg mb-6"
          >
            <Sparkles className="w-3 h-3" />
            🔥 Oferta Especial por Tempo Limitado
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Comece a gerar leads
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                hoje mesmo!
              </span>
            </h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Junte-se a mais de 1532 empresas que impulsionam sua prospecção com o LeadBaze
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
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
              <ArrowRight className="w-5 h-5 mr-2" />
              Começar Agora
            </ShimmerButton>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">✨ 30 leads gratuitos</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">🚀 Ativação instantânea</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">💎 Melhor custo-benefício do mercado</span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter

                    value={stat.value}

                    suffix={stat.suffix}

                    className="text-white"

                    delay={500 + index * 200}

                  />
                </div>
                <div className="text-xs text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
