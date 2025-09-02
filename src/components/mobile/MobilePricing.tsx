import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Star, Zap, TrendingUp, Crown } from 'lucide-react'
import { getCurrentUser } from '../../lib/supabaseClient'

export default function MobilePricing() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'start' | 'growth' | 'scale'>('growth')
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleStartNow = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      navigate('/login')
    }
  }

  const plans = [
    {
      id: 'start',
      name: 'START',
      price: 'R$97',
      period: '/mês',
      leads: '500 leads',
      popular: false,
      features: [
        '500 leads/mês',
        'Exportação CSV',
        'WhatsApp automático'
      ],
      color: 'from-blue-500 to-cyan-500',
      icon: Zap
    },
    {
      id: 'growth',
      name: 'GROWTH',
      price: 'R$197',
      period: '/mês',
      leads: '1.000 leads + BDR IA',
      popular: true,
      features: [
        '1.000 leads/mês',
        'BDR IA incluído',
        'Exportação CSV',
        'WhatsApp automático',
        'Integração CRM'
      ],
      color: 'from-purple-500 to-pink-500',
      icon: TrendingUp
    },
    {
      id: 'scale',
      name: 'SCALE',
      price: 'R$397',
      period: '/mês',
      leads: '5.000 leads + multi-playbooks',
      popular: false,
      features: [
        '5.000 leads/mês',
        'Multi-playbooks',
        'BDR IA avançado',
        'Exportação CSV',
        'WhatsApp automático',
        'Integração CRM',
        'Onboarding especialista'
      ],
      color: 'from-orange-500 to-red-500',
      icon: Crown
    }
  ]

  return (
    <section id="mobile-pricing-section" className="md:hidden py-12 bg-white">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Escolha seu <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Plano</span>
          </h2>
          <p className="text-sm text-gray-600">
            Comece pequeno e escale conforme cresce
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="space-y-4 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className={`relative cursor-pointer ${
                selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id as any)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg z-10">
                  ⭐ Mais Popular
                </div>
              )}

              <div className={`bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? 'border-purple-500 shadow-xl' 
                  : 'border-gray-100'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${plan.color} rounded-lg flex items-center justify-center text-white`}>
                      <plan.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
                      <p className="text-xs text-gray-600">{plan.leads}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{plan.price}</div>
                    <div className="text-xs text-gray-600">{plan.period}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartNow()
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Começar Agora' : 'Selecionar'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-3"
        >
          <button 
            onClick={handleStartNow}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg"
          >
            Começar Growth R$197/mês
          </button>
          <button 
            onClick={handleStartNow}
            className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-semibold text-sm"
          >
            Teste Gratuito 30 Dias
          </button>
        </motion.div>
      </div>
    </section>
  )
}
