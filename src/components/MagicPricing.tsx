import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users } from 'lucide-react'
import { AnimatedCounter } from './magicui/animated-counter'
import { AnimatedBeam } from './magicui/animated-beam'

export default function MagicPricing() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const benefits = [
    {
      icon: Users,
      title: "Agende 6x mais reuniões",
      subtitle: "para seus vendedores",
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
      title: "Economia de 60%",
      subtitle: "do tempo gasto com criação de listas",
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
      title: "Aumente em 40%",
      subtitle: "suas vendas em 3 meses",
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
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Cada <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LEAD</span> sai por
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MENOS <span className="text-gray-900 font-bold">de</span> 30 CENTAVOS
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Invista no crescimento da sua empresa com leads de alta qualidade
            </p>
          </div>
        </AnimatedBeam>

        {/* Subheadline */}
        <AnimatedBeam delay={0.4}>
          <div className="text-center mb-12">
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Empresas estão falindo pelo aumento do custo por lead em plataformas como Google e Meta.
              A cada ano que passa fica mais caro… com o <span className="font-semibold text-gray-800">LeadBaze</span> seu pipeline fica lotado e suas vendas decolam.
            </p>
          </div>
        </AnimatedBeam>

        {/* Benefits Grid */}
        <AnimatedBeam delay={0.6}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{

                  y: -12,
                  scale: 1.02,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                className="group relative h-full flex flex-col"
              >
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm h-full flex flex-col" style={{ borderColor: '#00ff00', borderWidth: '2px' }}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-xl"></div>
                  </div>

                  {/* Header with Icon */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: '#00ff00' }}>
                      <benefit.icon className="w-8 h-8" style={{ color: '#082721' }} />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="relative space-y-4 flex-1 flex flex-col">
                    {/* Title and Subtitle */}
                    <div className="mb-2">
                      <h3 className="text-2xl font-bold leading-tight group-hover:transition-colors duration-300" style={{ color: '#082721' }}>
                        {benefit.title}
                      </h3>
                      <p className="font-semibold text-lg mt-1" style={{ color: '#2e4842' }}>
                        {benefit.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-lg leading-relaxed" style={{ color: '#2e4842' }}>
                      {benefit.description}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2 mt-auto">
                      {benefit.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="rounded-xl p-3 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#00ff00', borderWidth: '2px' }}>
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

                  {/* Enhanced Hover Effects */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: '#00ff00' }}></div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderTopColor: '#00ff00' }}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedBeam>

        {/* Price Highlight */}
        <AnimatedBeam delay={0.8}>
          <div className="text-center">
            <div className="relative inline-block rounded-3xl p-6 shadow-2xl overflow-hidden group" style={{ backgroundColor: '#082721' }}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300 to-transparent rounded-full blur-xl"></div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(45deg, #00ff00, #00cc00, #00ff00)',
                padding: '2px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }}></div>

              {/* Content */}
              <div className="relative" style={{ color: '#FFFFFF' }}>
                {/* Main Price */}
                <div className="mb-3">
                  <div className="text-2xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                    Preço por Lead
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-1" style={{ color: '#00ff00' }}>
                    R$ <AnimatedCounter value={0.30} delay={200} duration={800} />
                  </div>
                  <div className="text-base font-medium" style={{ color: '#b7c7c1' }}>
                    vs. R$ 15+ em outras plataformas
                  </div>
                </div>

                {/* Comparison Stats */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#00ff00' }}>50x</div>
                    <div className="text-xs" style={{ color: '#b7c7c1' }}>Mais barato</div>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#00ff00' }}>95%</div>
                    <div className="text-xs" style={{ color: '#b7c7c1' }}>Economia</div>
                  </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{
                  background: 'linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.3), transparent)',
                  animation: 'shimmer 2s infinite'
                }}></div>
              </div>
            </div>
          </div>
        </AnimatedBeam>

        {/* Shimmer Animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `
        }} />
      </div>
    </section>
  )
}
