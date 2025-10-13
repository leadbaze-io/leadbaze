import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, BookOpen, Users, FileText } from 'lucide-react'

export default function MobileBonus() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const bonuses = [
    {
      icon: BookOpen,
      title: "Aula Magna de implementação",
      description: "Passo a passo para começar",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Reunião com especialista",
      description: "Onboarding personalizado",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Templates por segmento",
      description: "Mensagens prontas que convertem",
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <section className="md:hidden py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs shadow-lg mb-4">
            <Gift className="w-3 h-3" />
            Bônus Inclusos
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">3 Bônus Exclusivos</span>
          </h2>
          <p className="text-sm text-gray-600">
            Para garantir seu sucesso desde o primeiro dia
          </p>
        </motion.div>

        {/* Bonus Items */}
        <div className="space-y-4">
          {bonuses.map((bonus, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${bonus.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  <bonus.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎁</span>
                    <h3 className="font-bold text-gray-900 text-sm">{bonus.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{bonus.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white text-center"
        >
          <div className="text-xs font-semibold mb-1">Valor dos bônus:</div>
          <div className="text-lg font-bold">R$ 2.497</div>
          <div className="text-xs opacity-90">Grátis para você!</div>
        </motion.div>
      </div>
    </section>
  )
}
