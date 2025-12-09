import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users } from 'lucide-react'
import { AnimatedCounter } from '../magicui/animated-counter'
import { AnimatedBeam } from '../magicui/animated-beam'

export default function MobilePricing() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const benefits = [
    {
      icon: Users,
      title: "Agende 6x mais reuniões para seus vendedores",
      subtitle: "",
      description: "Transforme sua equipe de vendas com leads qualificados e segmentados. Aumente a produtividade e feche mais negócios.",
      metrics: [
        { label: "Taxa de conversão", value: "+180%", color: "text-blue-600" },
        { label: "Leads qualificados", value: "95%", color: "text-cyan-600" }
      ],
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: Clock,
      title: "Economia de 60% do tempo",
      subtitle: "",
      description: "Automatize todo o processo de prospecção. De horas para minutos na criação de listas de leads qualificados.",
      metrics: [
        { label: "Tempo economizado", value: "60%", color: "text-purple-600" },
        { label: "Eficiência", value: "+400%", color: "text-pink-600" }
      ],
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-50 to-pink-50"
    },
    {
      icon: TrendingUp,
      title: "Aumente em 40% suas vendas",
      subtitle: "",
      description: "Pipeline sempre abastecido com leads de alta qualidade. Resultados mensuráveis e crescimento sustentável.",
      metrics: [
        { label: "Crescimento", value: "+40%", color: "text-green-600" },
        { label: "ROI", value: "8.5x", color: "text-emerald-600" }
      ],
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-50 to-emerald-50"
    }
  ]

  return (
    <section className="md:hidden relative py-16 bg-white overflow-hidden">
      <div className="relative max-w-md mx-auto px-4">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cada <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LEAD</span> sai por
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MENOS de 30 CENTAVOS
              </span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Economize milhares de reais comparado a outras plataformas de prospecção.
            </p>
          </div>
        </AnimatedBeam>

        {/* Benefits Grid */}
        <AnimatedBeam delay={0.4}>
          <div className="space-y-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-500 p-6"
                style={{ borderColor: '#00ff00', borderWidth: '2px' }}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00ff00' }}>
                      <benefit.icon className="w-6 h-6" style={{ color: '#082721' }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black leading-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-800 font-semibold mt-1 mb-3">
                      {benefit.subtitle}
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed mb-4">
                      {benefit.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {benefit.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="bg-gray-50 rounded-xl p-3 text-center border" style={{ borderColor: '#2e4842' }}>
                          <div className="text-lg font-bold" style={{ color: '#082721' }}>
                            {metric.value}
                          </div>
                          <div className="text-xs font-medium" style={{ color: '#2e4842' }}>
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedBeam>

        {/* Price Highlight */}
        <AnimatedBeam delay={0.8}>
          <div className="text-center">
            <div className="inline-block rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: '#2e4842' }}>
              <div style={{ color: '#FFFFFF' }}>
                <div className="text-lg font-semibold mb-2">
                  Preço por Lead
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#00ff00' }}>
                  R$ <AnimatedCounter value={0.30} delay={200} duration={800} />
                </div>
                <div className="text-sm font-medium" style={{ color: '#b7c7c1' }}>
                  vs. R$ 15+ em outras plataformas
                </div>
              </div>
            </div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}