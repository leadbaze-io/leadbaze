import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Shield, Users, Clock, MessageCircle, Zap, Gift } from 'lucide-react'
import { AnimatedBeam } from '../magicui/animated-beam'
import { ShimmerButton } from '../magicui/shimmer-button'

export default function MobileFAQ() {
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

  return (
    <section className="md:hidden py-16 bg-white overflow-hidden">
      <div className="relative max-w-md mx-auto px-4">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#082721'}}>
              Dúvidas <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent">Frequentes</span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent">
                Resolvidas
              </span>
            </h2>
            <p className="text-base leading-relaxed" style={{color: '#2e4842'}}>
              Encontre respostas para as principais dúvidas sobre a LeadBaze.
            </p>
          </div>
        </AnimatedBeam>

        {/* FAQ Items */}
        <AnimatedBeam delay={0.4}>
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{borderColor: '#00ff00', borderWidth: '2px'}}
              >
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#00ff00] to-[#00cc00] rounded-lg flex items-center justify-center">
                      <faq.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: openQuestion === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
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
          <div className="text-center">
            <div className="bg-white rounded-2xl border shadow-xl p-6" style={{borderColor: '#00ff00', borderWidth: '2px'}}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ainda tem dúvidas?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Nossa equipe está pronta para ajudar você a encontrar a melhor solução.
              </p>
              <ShimmerButton
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3 text-sm"
              >
                <span>Falar com Especialista</span>
              </ShimmerButton>
            </div>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}