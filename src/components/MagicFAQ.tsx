import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Shield, Users, Clock, MessageCircle, Zap, Gift } from 'lucide-react'

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
    <section id="faq-section-desktop" className="relative py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{ scrollMarginTop: '80px' }}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Dúvidas <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Frequentes</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Resolvidas
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
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Tire todas as suas dúvidas sobre o LeadBaze. Aqui você encontra respostas para as principais objeções.
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/70 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <faq.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                </div>
                <motion.div
                  animate={{ rotate: openQuestion === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-400"
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
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ainda tem dúvidas?</h3>
            <p className="text-blue-100 mb-6">
              Nossa equipe está pronta para ajudar. Entre em contato e tire todas as suas dúvidas.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg">
              Falar com Especialista
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
