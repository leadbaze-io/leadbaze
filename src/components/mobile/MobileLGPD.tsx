import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, MousePointer } from 'lucide-react'

export default function MobileLGPD() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const compliance = [
    {
      icon: Shield,
      title: "Dados públicos",
      description: "Apenas informações disponíveis no Google Maps",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MousePointer,
      title: "Opt-out em 1 clique",
      description: "Lead pode sair da base facilmente",
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <section className="md:hidden py-12 bg-blue-50">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xs shadow-lg mb-4">
            <Shield className="w-3 h-3" />
            100% Conforme LGPD
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Totalmente legal</span>
          </h2>
          <p className="text-sm text-gray-600">
            Auditado por advogados especialistas
          </p>
        </motion.div>

        {/* Compliance Items */}
        <div className="space-y-4 mb-6">
          {compliance.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legal Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white text-center"
        >
          <div className="text-2xl mb-2">⚖️</div>
          <div className="text-sm font-semibold mb-1">Auditado por advogados</div>
          <div className="text-xs opacity-90">especialistas em LGPD</div>
        </motion.div>
      </div>
    </section>
  )
}
