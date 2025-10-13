import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, TrendingUp, Crown } from 'lucide-react'
import { getCurrentUser } from '../../lib/supabaseClient'
import { AnimatedBeam } from '../magicui/animated-beam'
import { GridPattern } from '../magicui/grid-pattern'
import { ShimmerButton } from '../magicui/shimmer-button'

export default function MobilePricingPlans() {
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
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        navigate('/login')
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      navigate('/login')
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
      color: 'from-green-500 to-emerald-500',
      icon: Crown
    }
  ]

  return (
    <section id="pricing-plans-section" className="md:hidden relative py-16 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{zIndex: 0}}>
        <GridPattern
          width={40}
          height={40}
          x={1}
          y={1}
          strokeDasharray="4 4"
          className="opacity-15"
          color="#00ff00"
        />
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)',
        zIndex: 1
      }}></div>

      <div className="relative max-w-md mx-auto px-4" style={{zIndex: 2}}>
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Escolha o <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Plano</span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Perfeito para Você
              </span>
            </h2>
            <p className="text-base text-white leading-relaxed" style={{opacity: 0.9}}>
              Teste agora mesmo com 30 <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Leads Gratuitos</span>!
            </p>
          </div>
        </AnimatedBeam>

        {/* Pricing Cards */}
        <AnimatedBeam delay={0.4}>
          <div className="space-y-6 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative bg-white rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-500 p-6 cursor-pointer ${
                  selectedPlan === plan.id ? 'ring-4 ring-[#00ff00] ring-opacity-50' : ''
                }`}
                style={{
                  borderColor: selectedPlan === plan.id ? '#00ff00' : '#2e4842',
                  borderWidth: '3px'
                }}
                onClick={() => setSelectedPlan(plan.id as 'start' | 'scale' | 'enterprise')}
              >
                {/* Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg z-10">
                    Mais Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: '#00ff00'}}>
                      <plan.icon className="w-6 h-6" style={{color: '#082721'}} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-black mb-1">
                    {plan.price}
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Preço por lead:</span>
                    <span className="font-bold text-black ml-1">{plan.pricePerLead}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4" style={{color: '#00ff00'}} />
                      <span className="text-sm text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>


                {/* CTA Button */}
                <ShimmerButton
                  onClick={handleStartNow}
                  className={`w-full py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-[#00ff00] to-[#00cc00] shadow-lg'
                      : 'bg-gradient-to-r from-[#00ff00] to-[#00cc00] hover:from-[#00cc00] hover:to-[#00aa00] shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span style={{color: '#082721'}}>Começar Agora</span>
                </ShimmerButton>
              </motion.div>
            ))}
          </div>
        </AnimatedBeam>

        {/* Bottom CTA */}
        <AnimatedBeam delay={0.8}>
          <div className="text-center">
            <div className="bg-white rounded-3xl border shadow-xl p-6" style={{borderColor: '#00ff00', borderWidth: '3px'}}>
              <h3 className="text-lg font-bold text-black mb-2">
                Pronto para começar?
              </h3>
              <p className="text-sm text-gray-800 mb-4">
                Junte-se a milhares de empresas que já estão gerando mais leads com a LeadBaze.
              </p>
              <ShimmerButton
                onClick={handleStartNow}
                className="bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-[#00cc00] hover:to-[#00aa00] transition-all duration-300 shadow-lg"
              >
                <span style={{color: '#082721'}}>Começar Agora</span>
              </ShimmerButton>
            </div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}