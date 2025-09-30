import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, TrendingUp, Crown } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'

export default function MagicPricingPlans() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'start' | 'scale' | 'enterprise'>('scale')
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
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        navigate('/login')
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {

      navigate('/login')
      // Scroll para o topo após navegação
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

  const plans = [
    {
      id: 'start',
      name: 'Plano Start',
      price: 'R$200',
      period: '/mês',
      popular: false,
      leads: '1.000',
      pricePerLead: 'R$0,20',
      features: [
        '1.000 leads/mês',
        'R$0,20 centavos por lead',
        'Exportação dos leads via CSV',
        'Suporte por email'
      ],
      color: 'from-blue-500 to-cyan-500',
      icon: Zap
    },
    {
      id: 'scale',
      name: 'Plano Scale',
      price: 'R$497',
      period: '/mês',
      popular: true,
      leads: '4.000',
      pricePerLead: 'R$0,12',
      features: [
        '4.000 leads/mês',
        'R$0,12 centavos por lead',
        'Exportação dos leads via CSV',
        'Integração com CRM de Vendas',
        'Suporte prioritário'
      ],
      color: 'from-purple-500 to-pink-500',
      icon: TrendingUp
    },
    {
      id: 'enterprise',
      name: 'Plano Enterprise',
      price: 'R$997',
      period: '/mês',
      popular: false,
      leads: '10.000',
      pricePerLead: 'R$0,09',
      features: [
        '10.000 leads/mês',
        'R$0,09 centavos por lead',
        'Exportação dos leads via CSV',
        'Integração com CRM de Vendas',
        'Onboarding com nossos especialistas',
        'Suporte VIP 24/7'
      ],
      color: 'from-orange-500 to-red-500',
      icon: Crown
    }
  ]

  return (
    <section id="pricing-plans-section" className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Escolha o <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Plano</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Perfeito para Você
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="font-semibold text-gray-800">Transforme seu negócio hoje!</span> Comece pequeno e escale conforme cresce.<span className="font-semibold text-green-600"> Teste agora mesmo com 30 Leads Gratuitos!</span>
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{

                y: -10,
                transition: { duration: 0.3 }
              }}
              className={`relative group cursor-pointer h-full flex flex-col ${
                selectedPlan === plan.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id as 'start' | 'scale' | 'enterprise')}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                  🏆 Mais Vendido
                </div>
              )}

              {/* Best Value Badge for Start Plan */}
              {plan.id === 'start' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                  💎 Custo-Benefício
                </div>
              )}

              {/* Premium Badge for Enterprise Plan */}
              {plan.id === 'enterprise' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                  👑 Premium
                </div>
              )}

              <div className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-500 overflow-hidden h-full flex flex-col ${
                selectedPlan === plan.id

                  ? 'border-purple-500 shadow-2xl'

                  : 'border-gray-100 hover:border-gray-200'
              }`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Header */}
                <div className="relative text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl text-white mb-4`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-lg text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Price per Lead */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">Preço por Lead</div>
                  <div className="text-2xl font-bold text-gray-900">{plan.pricePerLead}</div>

                  {/* Urgency Badge - Only for Scale Plan */}
                  {plan.id === 'scale' && (
                    <div className="mt-3 space-y-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        ⚡ Oferta Limitada
                      </span>
                      <div className="text-xs text-gray-500">
                        Apenas <span className="font-bold text-red-600">23 vagas</span> restantes
                      </div>
                    </div>
                  )}

                  {/* Limited spots for other plans */}
                  {plan.id === 'start' && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">
                        Apenas <span className="font-bold text-blue-600">67 vagas</span> restantes
                      </div>
                    </div>
                  )}

                  {plan.id === 'enterprise' && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">
                        Apenas <span className="font-bold text-purple-600">12 vagas</span> restantes
                      </div>
                    </div>
                  )}
                </div>


                {/* Features */}
                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                {/* CTA Button */}
                <button className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 mt-auto transform hover:scale-105 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}>
                  {selectedPlan === plan.id ? '✅ Plano Selecionado' : '🚀 Começar Agora'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar?</h3>
            <p className="text-gray-600 mb-6">Teste agora mesmo nossa plataforma com 30 Leads Gratuitos!</p>
            <button

              onClick={handleStartNow}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Testar Agora
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
