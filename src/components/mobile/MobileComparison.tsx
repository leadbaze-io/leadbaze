import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, X, CheckCircle } from 'lucide-react'

export default function MobileComparison() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const comparisons = [
    {
      option: "SDR interno",
      cost: "R$68.000",
      period: "/ano",
      problems: ["Salário + benefícios", "Treinamento", "Rotatividade"],
      icon: "👤",
      color: "border-red-200 bg-red-50"
    },
    {
      option: "Agência",
      cost: "R$53.000",
      period: "/6 meses",
      problems: ["Contratos longos", "Sem transparência", "Resultados incertos"],
      icon: "🏢",
      color: "border-orange-200 bg-orange-50"
    },
    {
      option: "Lead Baze",
      cost: "R$2.364",
      period: "/ano",
      problems: [],
      benefits: ["Sem contrato", "100% transparente", "Resultados garantidos"],
      icon: "🚀",
      color: "border-green-200 bg-green-50"
    }
  ]

  return (
    <section className="md:hidden py-12 bg-gray-50">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs shadow-lg mb-4">
            <TrendingDown className="w-3 h-3" />
            Compare os custos
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Economia real</span>
          </h2>
          <p className="text-sm text-gray-600">
            Veja quanto você economiza com o LeadBaze
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="space-y-4">
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className={`rounded-xl p-4 border-2 ${item.color} relative`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{item.option}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">{item.cost}</span>
                      <span className="text-xs text-gray-600">{item.period}</span>
                    </div>
                  </div>
                </div>

                {/* Best choice badge */}
                {item.option === "Lead Baze" && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ✨ Melhor
                  </div>
                )}
              </div>

              {/* Problems/Benefits */}
              <div className="space-y-2">
                {item.problems && item.problems.map((problem, problemIndex) => (
                  <div key={problemIndex} className="flex items-center gap-2">
                    <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{problem}</span>
                  </div>
                ))}
                {item.benefits && item.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white text-center"
        >
          <div className="text-xs font-semibold mb-1">Você economiza:</div>
          <div className="text-xl font-bold">Mais de R$ 65.000/ano</div>
          <div className="text-xs opacity-90">vs. soluções tradicionais</div>
        </motion.div>
      </div>
    </section>
  )
}
