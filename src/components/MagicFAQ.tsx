import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Shield, Users, Clock, MessageCircle, Zap, Gift } from 'lucide-react'
import { AnimatedBeam } from './magicui/animated-beam'
import { ShimmerButton } from './magicui/shimmer-button'

export default function MagicFAQ() {
  const [isVisible, setIsVisible] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const faqs = [
    {
      question: "Posso testar a plataforma antes de assinar?",
      answer: "Sim! Ao criar sua conta, você recebe 30 leads gratuitos para testar toda a funcionalidade da plataforma. É uma oportunidade perfeita para conhecer o sistema, gerar leads reais e verificar a qualidade dos dados antes de escolher um plano.",
      icon: Gift
    },
    {
      question: "Isso é conforme a LGPD?",
      answer: "Sim. Trabalhamos apenas com dados públicos disponíveis no Google Maps e Receita Federal. Todo lead pode optar por sair da base em 1 clique. Temos procedimentos auditados por advogados especialistas em LGPD.",
      icon: Shield
    },
    {
      question: "Preciso ter CRM para usar?",
      answer: "Não é obrigatório. Você pode começar com nossa exportação CSV. Porém, recomendamos CRM para melhor acompanhamento. Fazemos integração gratuita com HubSpot, ClickUp, Trello e mais 15 plataformas.",
      icon: Users
    },
    {
      question: "Posso pausar ou trocar de segmento?",
      answer: "Sim. Você pode pausar por até 2 meses/ano sem cobrança e alterar segmentos/regiões a qualquer momento. Flexibilidade total para acompanhar mudanças do seu negócio.",
      icon: Clock
    },
    {
      question: "E se eu não conseguir usar todos os leads do mês?",
      answer: "Leads não utilizados acumulam por até 60 dias. Por exemplo: se usar apenas 300 dos 1000 leads em janeiro, terá 1700 no próximo mês.",
      icon: Zap
    },
    {
      question: "Tem suporte em português?",
      answer: "Sim, suporte 100% em português via WhatsApp (Growth/Scale) ou chat (Start). Resposta em até 4h durante dias úteis. Plus: materiais, tutoriais e treinamentos todos em português brasileiro.",
      icon: MessageCircle
    },
    {
      question: "Quanto tempo até ver resultados?",
      answer: "Instantaneamente após ativação. Lembre-se: você pode testar com 30 leads gratuitos antes de assinar.",
      icon: Zap
    }
  ]

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index)
  }

  return (
    <section id="faq-section-desktop" className="relative py-24 md:py-32 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a2f26 0%, #082721 50%, #0a2f26 100%)',
      scrollMarginTop: '80px'
    }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(0, 255, 0, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(0, 255, 0, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 2px 2px, rgba(0, 255, 0, 0.08) 1px, transparent 0)
        `,
        backgroundSize: '800px 800px, 800px 800px, 40px 40px',
        backgroundPosition: '0% 0%, 100% 100%, 0 0',
        animation: 'backgroundMove 20s ease-in-out infinite'
      }}></div>

      <style>{`
        @keyframes backgroundMove {
          0%, 100% {
            background-position: 0% 0%, 100% 100%, 0 0;
          }
          50% {
            background-position: 100% 100%, 0% 0%, 0 0;
          }
        }
      `}</style>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              Dúvidas <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Frequentes</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-extrabold" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Resolvidas
              </span>
            </h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Tire todas as suas dúvidas sobre o LeadBaze. Aqui você encontra respostas para as principais objeções.
            </p>
          </div>
        </AnimatedBeam>

        {/* FAQ Items */}
        <AnimatedBeam delay={0.4}>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="backdrop-blur-sm rounded-3xl border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                style={{
                  backgroundColor: 'rgba(8, 39, 33, 0.6)',
                  borderColor: 'rgba(0, 255, 0, 0.3)',
                  borderWidth: '2px'
                }}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-6 text-left flex items-center justify-between transition-colors duration-300"
                  style={{
                    backgroundColor: openQuestion === index ? 'rgba(0, 255, 0, 0.05)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#00ff00' }}>
                      <faq.icon className="w-6 h-6" style={{ color: '#082721' }} />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>{faq.question}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: openQuestion === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t pt-4" style={{ borderColor: 'rgba(0, 255, 0, 0.2)' }}>
                          <p className="leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </AnimatedBeam>

        {/* Bottom CTA */}
        <AnimatedBeam delay={0.8}>
          <div className="text-center mt-16">
            <div className="backdrop-blur-sm rounded-3xl p-8 shadow-2xl border" style={{
              backgroundColor: 'rgba(0, 255, 0, 0.08)',
              borderColor: 'rgba(0, 255, 0, 0.3)',
              borderWidth: '2px'
            }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Ainda tem dúvidas?</h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Nossa equipe está pronta para ajudar. Entre em contato e tire todas as suas dúvidas.
              </p>
              <ShimmerButton
                background="linear-gradient(135deg, #00ff00 0%, #00cc00 100%)"
                hoverBackground="linear-gradient(135deg, #00cc00 0%, #00aa00 100%)"
                color="#ffffff"
                className="px-8 py-4 rounded-2xl font-semibold text-lg"
              >
                Falar com Especialista
              </ShimmerButton>
            </div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}
