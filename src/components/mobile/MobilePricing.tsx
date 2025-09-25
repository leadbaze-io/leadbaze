import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users } from 'lucide-react'
import { AnimatedCounter } from '../magicui/animated-counter'

export default function MobilePricing() {
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
    <section className="md:hidden relative py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-green-100/40 to-cyan-100/40 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4">
        <div className="text-center mb-12">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cada <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>LEAD</span> sai por
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                MENOS <span className="text-gray-900 font-bold">de</span> 30 CENTAVOS
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-base text-gray-600 leading-relaxed">
              Empresas estão falindo pelo aumento do custo por lead em plataformas como Google e Meta.

              A cada ano que passa fica mais caro… com o <span className="font-semibold text-gray-800">LeadBaze</span> seu pipeline fica lotado e suas vendas decolam.
            </p>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{

                y: -8,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="group relative"
            >
              <div className={`relative bg-gradient-to-br ${benefit.gradient} rounded-2xl p-5 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-lg"></div>
                </div>

                {/* Header with Icon */}
                <div className="relative mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
                    <benefit.icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative space-y-3">
                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 font-medium text-lg">
                      {benefit.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {benefit.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                        <div className={`text-base font-bold ${metric.color}`}>
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 rounded-2xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Corner Accent */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-${benefit.color.split('-')[1]}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Price Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 shadow-2xl">
            <div className="text-white">
              <div className="text-lg font-semibold mb-2">Preço por Lead</div>
              <div className="text-4xl font-bold mb-2">
                R$ <AnimatedCounter value={0.30} className="text-white" delay={200} duration={800} />
              </div>
              <div className="text-sm opacity-90">vs. R$ 15+ em outras plataformas</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
