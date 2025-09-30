import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Shield, Users, Clock, MessageCircle, Zap, Gift } from 'lucide-react'

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

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index)
  }

  return (
    <section id="faq-section-mobile" className="md:hidden relative py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-md mx-auto px-4">
        <div className="text-center mb-12">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Dúvidas <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Frequentes</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Resolvidas
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-base text-gray-300 leading-relaxed">
              Tire todas as suas dúvidas sobre o LeadBaze. Aqui você encontra respostas para as principais objeções.
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <faq.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openQuestion === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openQuestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
