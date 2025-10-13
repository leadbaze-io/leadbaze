import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, MapPin, Building2, Check, Sparkles, ArrowRight, Target, Zap, Star, CheckCircle2 } from 'lucide-react'
import { AnimatedBeam } from '../magicui/animated-beam'
import { ShimmerButton } from '../magicui/shimmer-button'
import { AnimatedCounter } from '../magicui/animated-counter'
import { cn } from '../../lib/utils'

type TabType = 'gerador' | 'disparador'

interface LeadPreview {
  id: number
  name: string
  company: string
  role: string
  location: string
  score: number
  tags: string[]
}

const mockLeads: LeadPreview[] = [
  {
    id: 1,
    name: "Carlos Silva",
    company: "Tech Solutions Brasil",
    role: "Diretor de TI",
    location: "São Paulo, SP",
    score: 95,
    tags: ["Decisor", "Tech"]
  },
  {
    id: 2,
    name: "Ana Costa",
    company: "Inovação Digital",
    role: "Head de Marketing",
    location: "Rio de Janeiro, RJ",
    score: 88,
    tags: ["Marketing", "SaaS"]
  },
  {
    id: 3,
    name: "Pedro Santos",
    company: "Vendas Pro",
    role: "Gerente Comercial",
    location: "Belo Horizonte, MG",
    score: 92,
    tags: ["Vendas", "B2B"]
  },
  {
    id: 4,
    name: "Mariana Oliveira",
    company: "StartupTech",
    role: "CEO",
    location: "São Paulo, SP",
    score: 98,
    tags: ["Decisor", "Startup"]
  },
  {
    id: 5,
    name: "Roberto Lima",
    company: "Digital Corp",
    role: "CTO",
    location: "Brasília, DF",
    score: 91,
    tags: ["Tech", "Inovação"]
  },
  {
    id: 6,
    name: "Juliana Ferreira",
    company: "Growth Agency",
    role: "Diretora de Vendas",
    location: "São Paulo, SP",
    score: 89,
    tags: ["Vendas", "Growth"]
  },
  {
    id: 7,
    name: "Felipe Rodrigues",
    company: "Cloud Solutions",
    role: "Head de Produto",
    location: "Porto Alegre, RS",
    score: 87,
    tags: ["Produto", "Cloud"]
  }
]

export default function MobilePlatformPreview() {
  const [activeTab, setActiveTab] = useState<TabType>('gerador')
  const [generatedLeads, setGeneratedLeads] = useState<LeadPreview[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const handleGenerate = () => {
    setIsGenerating(true)
    setGeneratedLeads([])
    
    // Selecionar 3 leads aleatórios
    const shuffled = [...mockLeads].sort(() => 0.5 - Math.random())
    const selectedLeads = shuffled.slice(0, 3)
    
    selectedLeads.forEach((lead, index) => {
      setTimeout(() => {
        setGeneratedLeads(prev => [...prev, lead])
        if (index === selectedLeads.length - 1) {
          setIsGenerating(false)
        }
      }, (index + 1) * 800)
    })
  }

  const handleSend = () => {
    if (selectedLeads.length === 0) return
    
    setIsSending(true)
    setSentCount(0)
    
    selectedLeads.forEach((_, index) => {
      setTimeout(() => {
        setSentCount(index + 1)
        if (index === selectedLeads.length - 1) {
          setTimeout(() => setIsSending(false), 500)
        }
      }, (index + 1) * 600)
    })
  }

  const toggleLeadSelection = (id: number) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
    )
  }

  const features = [
    { icon: Target, text: 'Segmentação Avançada' },
    { icon: Zap, text: 'Geração Instantânea' },
    { icon: Sparkles, text: 'IA + Automação' }
  ]

  return (
    <section className="md:hidden relative py-16 bg-white overflow-hidden">
      <div className="relative max-w-md mx-auto px-4">
        <AnimatedBeam>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 204, 0, 0.1))',
                border: '2px solid rgba(0, 255, 0, 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{color: '#00ff00'}} />
              <span className="text-sm font-bold" style={{color: '#082721'}}>
                Experimente a Plataforma
              </span>
            </motion.div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">
              <span className="text-gray-900">Teste Nossa </span>
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Plataforma
              </span>
            </h2>

            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Veja como é simples e poderoso gerar leads qualificados e disparar mensagens personalizadas.
            </p>

            {/* Features Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(0, 255, 0, 0.05)',
                    border: '1px solid rgba(0, 255, 0, 0.2)',
                    color: '#082721'
                  }}
                >
                  <feature.icon className="w-3 h-3" style={{color: '#00ff00'}} />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{backgroundColor: 'rgba(0, 255, 0, 0.05)'}}>
            <button
              onClick={() => setActiveTab('gerador')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'gerador'
                  ? 'shadow-lg'
                  : 'hover:bg-white/50'
              )}
              style={{
                backgroundColor: activeTab === 'gerador' ? '#10b981' : 'transparent',
                color: activeTab === 'gerador' ? '#ffffff' : '#082721'
              }}
            >
              <Users className="w-4 h-4" />
              <span>Gerar Leads</span>
            </button>
            <button
              onClick={() => setActiveTab('disparador')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'disparador'
                  ? 'shadow-lg'
                  : 'hover:bg-white/50'
              )}
              style={{
                backgroundColor: activeTab === 'disparador' ? '#10b981' : 'transparent',
                color: activeTab === 'disparador' ? '#ffffff' : '#082721'
              }}
            >
              <Send className="w-4 h-4" />
              <span>Disparador</span>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border-2 p-6 min-h-[500px]" style={{borderColor: '#00ff00'}}>
            <AnimatePresence mode="wait">
              {activeTab === 'gerador' && (
                <motion.div
                  key="gerador"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Search Bar */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2" style={{color: '#082721'}}>
                      Buscar Leads por Segmento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Diretores de TI em SP"
                      className="w-full px-4 py-3 rounded-xl border-2 text-sm"
                      style={{
                        borderColor: '#b7c7c1',
                        color: '#082721'
                      }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mb-6 px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      backgroundColor: isGenerating ? '#b7c7c1' : '#10b981',
                      color: '#ffffff'
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span>Gerar Leads</span>
                      </>
                    )}
                  </button>

                  {/* Stats */}
                  {generatedLeads.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {[
                        { label: 'Encontrados', value: generatedLeads.length, icon: Users },
                        { label: 'Qualificados', value: Math.round(generatedLeads.length * 0.87), icon: CheckCircle2 },
                        { label: 'Score Médio', value: 92, icon: Star }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-xl border text-center"
                          style={{borderColor: '#b7c7c1'}}
                        >
                          <stat.icon className="w-4 h-4 mx-auto mb-1" style={{color: '#00ff00'}} />
                          <div className="text-lg font-bold" style={{color: '#082721'}}>
                            <AnimatedCounter value={stat.value} delay={100} duration={800} />
                          </div>
                          <div className="text-xs font-medium" style={{color: '#2e4842'}}>
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Generated Leads */}
                  <div className="space-y-3">
                    {generatedLeads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl border-2"
                        style={{borderColor: '#b7c7c1', backgroundColor: '#ffffff'}}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold" style={{color: '#082721'}}>
                              {lead.name}
                            </h4>
                            <p className="text-xs font-semibold" style={{color: '#2e4842'}}>
                              {lead.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: 'rgba(0, 255, 0, 0.2)',
                              color: '#000000'
                            }}
                          >
                            <Star className="w-3 h-3" fill="currentColor" />
                            <span>{lead.score}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {lead.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                color: '#082721'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Company */}
                        <div className="flex items-center gap-2 text-xs" style={{color: '#2e4842'}}>
                          <Building2 className="w-3 h-3" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1" style={{color: '#2e4842'}}>
                          <MapPin className="w-3 h-3" />
                          <span>{lead.location}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'disparador' && (
                <motion.div
                  key="disparador"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Lead Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-3" style={{color: '#082721'}}>
                      Selecione os Leads
                    </label>
                    <div className="space-y-2">
                      {mockLeads.map((lead, index) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => toggleLeadSelection(lead.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                            selectedLeads.includes(lead.id) ? 'shadow-md' : ''
                          )}
                          style={{
                            borderColor: selectedLeads.includes(lead.id) ? '#00ff00' : '#b7c7c1',
                            backgroundColor: selectedLeads.includes(lead.id) ? 'rgba(0, 255, 0, 0.05)' : '#ffffff'
                          }}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                            selectedLeads.includes(lead.id) ? 'rotate-0' : ''
                          )}
                          style={{
                            borderColor: selectedLeads.includes(lead.id) ? '#00ff00' : '#b7c7c1',
                            backgroundColor: selectedLeads.includes(lead.id) ? '#00ff00' : '#ffffff'
                          }}
                          >
                            {selectedLeads.includes(lead.id) && (
                              <Check className="w-3 h-3" style={{color: '#000000'}} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{color: '#082721'}}>
                              {lead.name}
                            </p>
                            <p className="text-xs truncate" style={{color: '#2e4842'}}>
                              {lead.company} • {lead.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: 'rgba(0, 255, 0, 0.2)',
                              color: '#000000'
                            }}
                          >
                            <Star className="w-3 h-3" fill="currentColor" />
                            <span>{lead.score}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Message Editor */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2" style={{color: '#082721'}}>
                      Mensagem Personalizada
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border-2 text-sm resize-none"
                      rows={4}
                      style={{
                        borderColor: '#b7c7c1',
                        color: '#082721'
                      }}
                      readOnly
                      value="Olá {{nome}}! Vi que você trabalha na {{empresa}} como {{cargo}}. Tenho uma proposta que pode ajudar a aumentar seus resultados. Podemos conversar?"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={selectedLeads.length === 0 || isSending}
                    className="w-full mb-6 px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      backgroundColor: selectedLeads.length === 0 || isSending ? '#b7c7c1' : '#10b981',
                      color: '#ffffff',
                      opacity: selectedLeads.length === 0 ? 0.5 : 1
                    }}
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Disparando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Disparar para {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>

                  {/* Stats */}
                  {(isSending || sentCount > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Enviadas', value: sentCount, icon: Send },
                        { label: 'Pendentes', value: selectedLeads.length - sentCount, icon: Sparkles }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-xl border text-center"
                          style={{borderColor: '#b7c7c1'}}
                        >
                          <stat.icon className="w-4 h-4 mx-auto mb-1" style={{color: '#00ff00'}} />
                          <div className="text-lg font-bold" style={{color: '#082721'}}>
                            <AnimatedCounter value={stat.value} delay={0} duration={300} />
                          </div>
                          <div className="text-xs font-medium" style={{color: '#2e4842'}}>
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-lg mb-6 leading-relaxed" style={{color: '#2e4842'}}>
              Gostou do que viu? Crie sua conta e tenha acesso a muitas outras funcionalidades e ferramentas!
            </p>
            <ShimmerButton className="w-full px-6 py-4 text-base">
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold">Começar Agora Gratuitamente</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </ShimmerButton>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}

