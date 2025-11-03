import { useState, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Zap, TrendingUp, Crown } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { GridPattern } from './magicui/grid-pattern'
import { ShimmerButton } from './magicui/shimmer-button'

export default function MagicPricingPlans() {
  const isVisible = true // Sempre visível para garantir renderização imediata
  const [selectedPlan, setSelectedPlan] = useState<'start' | 'scale' | 'enterprise'>('scale')
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)

  // Garantir que está no DOM imediatamente
  useLayoutEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.setAttribute('id', 'pricing-plans-section-desktop')
      sectionRef.current.offsetHeight // Forçar layout
      sectionRef.current.offsetTop // Forçar cálculo do offsetTop
    }
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
    <section 
      ref={sectionRef}
      id="pricing-plans-section-desktop" 
      data-section-type="pricing-desktop"
      className="relative py-24 md:py-32 overflow-hidden" 
      data-ready="true"
      style={{
        background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)',
        scrollMarginTop: '100px',
        scrollPaddingTop: '100px'
      }}
    >
      {/* Background with Grid Pattern */}
      <div className="absolute inset-0">
        <GridPattern
          width={60}
          height={60}
          maxOpacity={0.08}
        />
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(8, 39, 33, 0.3) 100%)'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" style={{ minHeight: '200px' }}>
          {/* Main Heading - Renderizar imediatamente sem delay para garantir dimensões */}
          <div style={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{color: '#FFFFFF', opacity: 1}}>
                Escolha o <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Plano</span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Perfeito para Você
                </span>
              </h2>
            </div>
          </div>

          {/* Subheadline - Renderizar imediatamente */}
          <div style={{ opacity: 1 }}>
            <div className="mb-12">
              <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed" style={{color: '#FFFFFF', opacity: 0.9}}>
                <span className="font-semibold" style={{color: '#FFFFFF'}}>Transforme seu negócio hoje!</span> Comece pequeno e escale conforme cresce.<span className="font-semibold"> Teste agora mesmo com 30 <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Leads Gratuitos</span>!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
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
              className="relative group cursor-pointer h-full flex flex-col"
              onClick={() => setSelectedPlan(plan.id as 'start' | 'scale' | 'enterprise')}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10" style={{backgroundColor: '#FFFFFF', color: '#082721', border: '2px solid #00ff00'}}>
                  🏆 Mais Vendido
                </div>
              )}

              {/* Best Value Badge for Start Plan */}
              {plan.id === 'start' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10" style={{backgroundColor: '#FFFFFF', color: '#082721', border: '2px solid #00ff00'}}>
                  💎 Custo-Benefício
                </div>
              )}

              {/* Premium Badge for Enterprise Plan */}
              {plan.id === 'enterprise' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10" style={{backgroundColor: '#FFFFFF', color: '#082721', border: '2px solid #00ff00'}}>
                  👑 Premium
                </div>
              )}

              <div className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-500 overflow-hidden h-full flex flex-col ${
                selectedPlan === plan.id
                  ? 'shadow-2xl'
                  : 'hover:shadow-xl'
              }`} style={{
                borderColor: selectedPlan === plan.id ? '#00ff00' : '#2e4842',
                borderWidth: '3px'
              }}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Header */}
                <div className="relative text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white mb-4" style={{backgroundColor: '#00ff00'}}>
                    <plan.icon className="w-8 h-8" style={{color: '#082721'}} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold" style={{color: '#000000'}}>{plan.price}</span>
                    <span className="text-lg ml-1" style={{color: '#2e4842'}}>{plan.period}</span>
                  </div>
                </div>

                {/* Price per Lead */}
                <div className="text-center mb-6">
                  <div className="text-sm mb-1" style={{color: '#2e4842'}}>Preço por Lead</div>
                  <div className="text-2xl font-bold" style={{color: '#000000'}}>{plan.pricePerLead}</div>

                  {/* Urgency Badge - Only for Scale Plan */}
                  {plan.id === 'scale' && (
                    <div className="mt-3 space-y-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{backgroundColor: '#FFFFFF', color: '#082721', borderColor: '#00ff00', borderWidth: '2px'}}>
                        ⚡ Oferta Limitada
                      </span>
                      <div className="text-xs" style={{color: '#082721'}}>
                        Apenas <span className="font-bold" style={{color: '#000000'}}>23 vagas</span> restantes
                      </div>
                    </div>
                  )}

                  {/* Limited spots for other plans */}
                  {plan.id === 'start' && (
                    <div className="mt-3">
                      <div className="text-xs" style={{color: '#082721'}}>
                        Apenas <span className="font-bold" style={{color: '#000000'}}>67 vagas</span> restantes
                      </div>
                    </div>
                  )}

                  {plan.id === 'enterprise' && (
                    <div className="mt-3">
                      <div className="text-xs" style={{color: '#082721'}}>
                        Apenas <span className="font-bold" style={{color: '#000000'}}>12 vagas</span> restantes
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
                <ShimmerButton
                  onClick={handleStartNow}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 mt-auto transform hover:scale-105"
                  background="linear-gradient(135deg, #00ff00 0%, #00cc00 100%)"
                  hoverBackground="linear-gradient(135deg, #00cc00 0%, #00aa00 100%)"
                  color="#082721"
                >
                  {selectedPlan === plan.id ? '✅ Plano Selecionado' : '🚀 Começar Agora'}
                </ShimmerButton>
              </div>
            </motion.div>
          ))}
          </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border max-w-2xl mx-auto" style={{borderColor: '#00ff00', borderWidth: '3px'}}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Pronto para começar?</h3>
            <p className="mb-6" style={{color: '#2e4842'}}>Teste agora mesmo nossa plataforma com 30 Leads Gratuitos!</p>
            <ShimmerButton
              onClick={handleStartNow}
              className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg"
              background="linear-gradient(135deg, #00ff00 0%, #00cc00 100%)"
              hoverBackground="linear-gradient(135deg, #00cc00 0%, #00aa00 100%)"
              color="#082721"
            >
              Testar Agora
            </ShimmerButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
