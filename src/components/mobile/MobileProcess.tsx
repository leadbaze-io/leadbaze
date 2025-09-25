import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, Target, MessageCircle, CheckCircle } from 'lucide-react'

export default function MobileProcess() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    {
      icon: Map,
      title: "MAP",
      subtitle: "Capturamos empresas",
      description: "via Google Maps",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "MATCH",
      subtitle: "Filtramos pelo",
      description: "seu ICP",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageCircle,
      title: "MESSAGE",
      subtitle: "BDR IA engaja no WhatsApp",
      description: "e agenda reuniões",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const benefits = [
    "WhatsApp tem 99% abertura vs 20% e-mail",
    "Sua mensagem é vista e respondida mais rápido",
    "BDR IA automatiza todo o processo"
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Por que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">funciona?</span>
          </h2>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Como funciona:</h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    <step.icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{step.title}</div>
                    <div className="text-xs text-gray-600">{step.subtitle}</div>
                    <div className="text-xs text-gray-600">{step.description}</div>
                  </div>

                  {/* Number Badge */}
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-4 bg-gray-200"></div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white text-center"
        >
          <div className="text-sm font-semibold mb-1">Resultado:</div>
          <div className="text-lg font-bold">Reuniões agendadas automaticamente</div>
          <div className="text-xs opacity-90 mt-1">Enquanto você foca no que importa: vender!</div>
        </motion.div>
      </div>
    </section>
  )
}
