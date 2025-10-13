import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, TrendingUp, MapPin, Building2, Mail, Linkedin, Check, Sparkles, ArrowRight, Play, Target, Zap, Clock, Star, Award, CheckCircle2 } from 'lucide-react'
import { AnimatedBeam } from './magicui/animated-beam'
import { ShimmerButton } from './magicui/shimmer-button'
import { AnimatedCounter } from './magicui/animated-counter'
import { cn } from '../lib/utils'

type TabType = 'gerador' | 'disparador'

interface LeadPreview {
  id: number
  name: string
  company: string
  role: string
  location: string
  email: string
  linkedin: string
  phone: string
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
    email: "carlos.silva@techsolutions.com.br",
    linkedin: "linkedin.com/in/carlossilva",
    phone: "+55 11 99999-0001",
    score: 95,
    tags: ["Tomador de Decisão", "Tech", "B2B"]
  },
  {
    id: 2,
    name: "Ana Costa",
    company: "Inovação Digital Ltda",
    role: "Head de Marketing",
    location: "Rio de Janeiro, RJ",
    email: "ana.costa@inovacaodigital.com.br",
    linkedin: "linkedin.com/in/anacosta",
    phone: "+55 21 99999-0002",
    score: 88,
    tags: ["Marketing", "Growth", "SaaS"]
  },
  {
    id: 3,
    name: "Roberto Mendes",
    company: "Growth Ventures",
    role: "CEO",
    location: "Belo Horizonte, MG",
    email: "roberto@growthventures.com.br",
    linkedin: "linkedin.com/in/robertomendes",
    phone: "+55 31 99999-0003",
    score: 92,
    tags: ["CEO", "Founder", "Investment"]
  },
  {
    id: 4,
    name: "Mariana Oliveira",
    company: "StartupTech",
    role: "CTO",
    location: "São Paulo, SP",
    email: "mariana@startuptech.com.br",
    linkedin: "linkedin.com/in/marianaoliveira",
    phone: "+55 11 99999-0004",
    score: 98,
    tags: ["CTO", "Tech Lead", "Innovation"]
  },
  {
    id: 5,
    name: "Felipe Rodrigues",
    company: "Digital Corp",
    role: "Head de Produto",
    location: "Brasília, DF",
    email: "felipe@digitalcorp.com.br",
    linkedin: "linkedin.com/in/feliperodrigues",
    phone: "+55 61 99999-0005",
    score: 91,
    tags: ["Product", "Strategy", "Digital"]
  },
  {
    id: 6,
    name: "Juliana Ferreira",
    company: "Growth Agency",
    role: "Diretora de Vendas",
    location: "São Paulo, SP",
    email: "juliana@growthagency.com.br",
    linkedin: "linkedin.com/in/julianaferreira",
    phone: "+55 11 99999-0006",
    score: 89,
    tags: ["Sales", "Growth", "B2B"]
  },
  {
    id: 7,
    name: "Pedro Santos",
    company: "Cloud Solutions",
    role: "Gerente Comercial",
    location: "Porto Alegre, RS",
    email: "pedro@cloudsolutions.com.br",
    linkedin: "linkedin.com/in/pedrosantos",
    phone: "+55 51 99999-0007",
    score: 87,
    tags: ["Sales", "Cloud", "Enterprise"]
  }
]

const features = [
  { icon: Target, text: "Busca Inteligente com IA", color: "#00ff00" },
  { icon: Zap, text: "Geração em Tempo Real", color: "#00ff00" },
  { icon: Award, text: "Score de Qualificação", color: "#00ff00" }
]

export default function MagicPlatformPreview() {
  const [activeTab, setActiveTab] = useState<TabType>('gerador')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [currentLeads, setCurrentLeads] = useState<LeadPreview[]>([])

  useEffect(() => {
    if (generatedCount === 3) {
      setShowStats(true)
    }
  }, [generatedCount])

  const handleGenerate = () => {
    setIsGenerating(true)
    setGeneratedCount(0)
    setShowStats(false)
    
    // Selecionar 3 leads aleatórios
    const shuffled = [...mockLeads].sort(() => 0.5 - Math.random())
    const selectedLeads = shuffled.slice(0, 3)
    setCurrentLeads(selectedLeads)
    
    // Simulate lead generation
    const interval = setInterval(() => {
      setGeneratedCount(prev => {
        if (prev >= 3) {
          clearInterval(interval)
          setIsGenerating(false)
          return 3
        }
        return prev + 1
      })
    }, 600)
  }

  const handleSend = () => {
    if (selectedLeads.length === 0) return
    
    setIsSending(true)
    setSentCount(0)
    
    // Simulate message sending
    const interval = setInterval(() => {
      setSentCount(prev => {
        if (prev >= selectedLeads.length) {
          clearInterval(interval)
          setIsSending(false)
          return selectedLeads.length
        }
        return prev + 1
      })
    }, 800)
  }

  const toggleLeadSelection = (id: number) => {
    setSelectedLeads(prev => 
      prev.includes(id) 
        ? prev.filter(leadId => leadId !== id)
        : [...prev, id]
    )
  }


  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-white to-green-50/30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedBeam delay={0.2}>
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 204, 0, 0.1))',
                border: '2px solid rgba(0, 255, 0, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 255, 0, 0.1)'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" style={{color: '#00ff00'}} />
              </motion.div>
              <span className="text-base font-bold" style={{color: '#082721'}}>
                Experimente a Plataforma
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Teste Nossa </span>
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Plataforma
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Veja como é simples e poderoso gerar leads qualificados e disparar mensagens personalizadas.
            </p>

            {/* Features Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2"
                  style={{
                    borderColor: 'rgba(0, 255, 0, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <feature.icon className="w-4 h-4" style={{color: feature.color}} />
                  <span className="text-sm font-medium" style={{color: '#082721'}}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedBeam>

        {/* Interactive Demo */}
        <AnimatedBeam delay={0.4}>
          <div className="bg-white rounded-3xl shadow-2xl border-2 overflow-hidden relative" style={{borderColor: '#00ff00'}}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl"></div>

            {/* Tabs */}
            <div className="flex border-b relative" style={{borderColor: '#e5e7eb'}}>
              <button
                onClick={() => setActiveTab('gerador')}
                className={cn(
                  "flex-1 px-8 py-5 font-bold text-lg transition-all duration-300 relative group",
                  activeTab === 'gerador' 
                    ? "text-white" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                style={activeTab === 'gerador' ? {backgroundColor: '#10b981'} : {}}
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={activeTab === 'gerador' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="w-6 h-6" />
                  </motion.div>
                  <span>Gerar Leads</span>
                  {activeTab !== 'gerador' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </div>
                {activeTab === 'gerador' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{backgroundColor: '#059669'}}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('disparador')}
                className={cn(
                  "flex-1 px-8 py-5 font-bold text-lg transition-all duration-300 relative group",
                  activeTab === 'disparador' 
                    ? "text-white" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                style={activeTab === 'disparador' ? {backgroundColor: '#10b981'} : {}}
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={activeTab === 'disparador' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Send className="w-6 h-6" />
                  </motion.div>
                  <span>Disparador</span>
                  {activeTab !== 'disparador' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </div>
                {activeTab === 'disparador' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{backgroundColor: '#059669'}}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'gerador' && (
                  <motion.div
                    key="gerador"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Search Bar */}
                    <div className="mb-8">
                      <label className="block text-base font-bold mb-3" style={{color: '#082721'}}>
                        Buscar Leads por Segmento
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1 relative group">
                          <input
                            type="text"
                            placeholder="Ex: Diretores de TI em São Paulo com mais de 100 funcionários"
                            className="w-full px-6 py-4 border-2 rounded-2xl focus:outline-none transition-all text-base font-medium"
                            style={{
                              borderColor: '#b7c7c1',
                              color: '#082721',
                              backgroundColor: '#ffffff'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#00ff00'
                              e.target.style.boxShadow = '0 0 0 4px rgba(0, 255, 0, 0.1)'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#b7c7c1'
                              e.target.style.boxShadow = 'none'
                            }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                        <motion.button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 relative overflow-hidden"
                          style={{
                            background: isGenerating 
                              ? 'linear-gradient(135deg, #b7c7c1, #2e4842)' 
                              : 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff',
                            boxShadow: isGenerating ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.3)',
                            cursor: isGenerating ? 'not-allowed' : 'pointer'
                          }}
                          whileHover={!isGenerating ? { scale: 1.02, boxShadow: '0 6px 24px rgba(16, 185, 129, 0.4)' } : {}}
                          whileTap={!isGenerating ? { scale: 0.98 } : {}}
                        >
                          {!isGenerating && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ['-200%', '200%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                          {isGenerating ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-5 h-5" />
                              </motion.div>
                              <span>Gerando...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>Gerar Leads</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Results Counter */}
                    {generatedCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="mb-6 p-4 rounded-2xl inline-flex items-center gap-3"
                        style={{
                          backgroundColor: 'rgba(0, 255, 0, 0.1)',
                          border: '2px solid rgba(0, 255, 0, 0.3)',
                          boxShadow: '0 4px 12px rgba(0, 255, 0, 0.1)'
                        }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <CheckCircle2 className="w-6 h-6" style={{color: '#00ff00'}} />
                        </motion.div>
                        <span className="text-lg font-bold" style={{color: '#082721'}}>
                          <AnimatedCounter value={generatedCount} delay={0} duration={300} /> leads encontrados
                        </span>
                      </motion.div>
                    )}

                    {/* Stats Bar */}
                    {showStats && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 grid grid-cols-3 gap-4"
                      >
                        {[
                          { label: 'Score Médio', value: 92, icon: Star },
                          { label: 'Taxa de Qualificação', value: 100, icon: Award },
                          { label: 'Tempo de Busca', value: 1.8, suffix: 's', icon: Clock }
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-white border-2 text-center"
                            style={{borderColor: 'rgba(0, 255, 0, 0.2)'}}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <stat.icon className="w-5 h-5" style={{color: '#00ff00'}} />
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{color: '#082721'}}>
                              <AnimatedCounter value={stat.value} delay={100 + index * 50} duration={800} />
                              {stat.suffix || '%'}
                            </div>
                            <div className="text-xs font-medium" style={{color: '#2e4842'}}>
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Leads List */}
                    <div className="space-y-4">
                      {currentLeads.slice(0, generatedCount).map((lead, index) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            delay: index * 0.2, 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25 
                          }}
                          className="p-6 rounded-2xl border-2 cursor-pointer transition-all relative group overflow-hidden"
                          style={{
                            borderColor: '#b7c7c1',
                            backgroundColor: '#ffffff'
                          }}
                          whileHover={{
                            scale: 1.02,
                            borderColor: '#00ff00',
                            boxShadow: '0 12px 24px rgba(0, 255, 0, 0.15)',
                            y: -4
                          }}
                        >
                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          <div className="flex items-start gap-5 relative z-10">
                            {/* Avatar */}
                            <motion.div 
                              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 relative overflow-hidden"
                              style={{background: 'linear-gradient(135deg, #00ff00, #00cc00)'}}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </motion.div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-xl font-bold mb-1" style={{color: '#082721'}}>
                                    {lead.name}
                                  </h4>
                                  <p className="text-base font-semibold" style={{color: '#2e4842'}}>
                                    {lead.role}
                                  </p>
                                </div>
                                <motion.div 
                                  className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                                  style={{
                                    backgroundColor: 'rgba(0, 255, 0, 0.2)',
                                    color: '#000000',
                                    border: `2px solid rgba(0, 255, 0, 0.3)`
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <Star className="w-4 h-4" fill="currentColor" />
                                  <span>{lead.score}</span>
                                </motion.div>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {lead.tags.map((tag, tagIndex) => (
                                  <motion.span
                                    key={tagIndex}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.2 + tagIndex * 0.05 }}
                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                      backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                      color: '#00ff00',
                                      border: '1px solid rgba(0, 255, 0, 0.3)'
                                    }}
                                  >
                                    {tag}
                                  </motion.span>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50" style={{color: '#2e4842'}}>
                                  <Building2 className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate font-medium">{lead.company}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50" style={{color: '#2e4842'}}>
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate font-medium">{lead.location}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50" style={{color: '#2e4842'}}>
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate font-medium">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50" style={{color: '#2e4842'}}>
                                  <Linkedin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate font-medium">{lead.linkedin}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'disparador' && (
                  <motion.div
                    key="disparador"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Lead Selection */}
                    <div className="mb-8">
                      <label className="block text-base font-bold mb-4" style={{color: '#082721'}}>
                        Selecione os Leads para Disparar
                      </label>
                      <div className="space-y-3">
                        {mockLeads.map((lead, index) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => toggleLeadSelection(lead.id)}
                            className="p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden group"
                            style={{
                              borderColor: selectedLeads.includes(lead.id) ? '#00ff00' : '#b7c7c1',
                              backgroundColor: selectedLeads.includes(lead.id) ? 'rgba(0, 255, 0, 0.05)' : '#ffffff',
                              boxShadow: selectedLeads.includes(lead.id) ? '0 4px 12px rgba(0, 255, 0, 0.15)' : 'none'
                            }}
                            whileHover={{ scale: 1.01, boxShadow: '0 8px 16px rgba(0, 255, 0, 0.1)' }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <motion.div
                              className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all relative"
                              style={{
                                borderColor: selectedLeads.includes(lead.id) ? '#00ff00' : '#b7c7c1',
                                backgroundColor: selectedLeads.includes(lead.id) ? '#00ff00' : 'transparent'
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {selectedLeads.includes(lead.id) && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0 relative z-10">
                              <p className="font-bold text-lg mb-1" style={{color: '#082721'}}>
                                {lead.name}
                              </p>
                              <p className="text-sm font-medium" style={{color: '#2e4842'}}>
                                {lead.company} • {lead.role}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold"
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

                    {/* Message Template */}
                    <div className="mb-8">
                      <label className="text-base font-bold mb-3 block" style={{color: '#082721'}}>
                        Mensagem Personalizada
                      </label>
                      <div className="relative group">
                        <textarea
                          defaultValue="Olá {{nome}},

Notei seu trabalho como {{cargo}} na {{empresa}} e fiquei impressionado com seu perfil profissional!

Gostaria de compartilhar algumas estratégias que têm ajudado empresas como a sua a aumentar significativamente a geração de leads qualificados.

Teria 15 minutos para uma conversa rápida esta semana?

Abraços,
Equipe LeadBaze"
                          className="w-full px-6 py-4 border-2 rounded-2xl focus:outline-none transition-all resize-none text-base leading-relaxed font-medium"
                          rows={8}
                          style={{
                            borderColor: '#b7c7c1',
                            color: '#082721',
                            backgroundColor: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#00ff00'
                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 255, 0, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#b7c7c1'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <p className="mt-3 text-sm font-medium" style={{color: '#2e4842'}}>
                        💡 Use variáveis como <code className="px-2 py-1 rounded bg-green-50 text-green-600 font-mono">{'{{nome}}'}</code>, <code className="px-2 py-1 rounded bg-green-50 text-green-600 font-mono">{'{{cargo}}'}</code> e <code className="px-2 py-1 rounded bg-green-50 text-green-600 font-mono">{'{{empresa}}'}</code> para personalização automática
                      </p>
                    </div>

                    {/* Send Stats */}
                    {sentCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="mb-6 p-6 rounded-2xl relative overflow-hidden"
                        style={{
                          backgroundColor: 'rgba(0, 255, 0, 0.1)',
                          border: '2px solid rgba(0, 255, 0, 0.3)',
                          boxShadow: '0 4px 16px rgba(0, 255, 0, 0.1)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          >
                            <TrendingUp className="w-10 h-10" style={{color: '#00ff00'}} strokeWidth={2.5} />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-2xl font-bold mb-1" style={{color: '#082721'}}>
                              <AnimatedCounter value={sentCount} delay={0} duration={500} /> de {selectedLeads.length} mensagens enviadas
                            </p>
                            <p className="text-base font-semibold" style={{color: '#2e4842'}}>
                              Taxa de entrega: 100% • Tempo médio: 0.8s por lead
                            </p>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="px-4 py-2 rounded-xl text-xl font-bold"
                            style={{
                              backgroundColor: '#00ff00',
                              color: '#000000'
                            }}
                          >
                            ✓
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Send Button */}
                    <motion.button
                      onClick={handleSend}
                      disabled={selectedLeads.length === 0 || isSending}
                      className="w-full px-8 py-5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 text-xl relative overflow-hidden"
                      style={{
                        background: selectedLeads.length === 0 || isSending
                          ? 'linear-gradient(135deg, #b7c7c1, #2e4842)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        cursor: selectedLeads.length === 0 || isSending ? 'not-allowed' : 'pointer',
                        boxShadow: selectedLeads.length > 0 && !isSending ? '0 8px 24px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                      whileHover={selectedLeads.length > 0 && !isSending ? { 
                        scale: 1.02, 
                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)' 
                      } : {}}
                      whileTap={selectedLeads.length > 0 && !isSending ? { scale: 0.98 } : {}}
                    >
                      {selectedLeads.length > 0 && !isSending && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      {isSending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Send className="w-6 h-6" />
                          </motion.div>
                          <span>Enviando mensagens...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          <span>
                            {selectedLeads.length === 0 
                              ? 'Selecione ao menos 1 lead para continuar' 
                              : `Disparar para ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} agora`
                            }
                          </span>
                          {selectedLeads.length > 0 && <ArrowRight className="w-6 h-6" />}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedBeam>

        {/* CTA */}
        <AnimatedBeam delay={0.6}>
          <div className="text-center mt-16">
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Gostou do que viu? Crie sua conta e tenha acesso a muitas outras funcionalidades e ferramentas!
            </p>
            <ShimmerButton
              onClick={() => window.location.href = '/login'}
              className="px-10 py-5 text-xl font-bold"
            >
              <div className="flex items-center gap-3">
                <span>Começar Agora Gratuitamente</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </div>
            </ShimmerButton>
          </div>
        </AnimatedBeam>
      </div>
    </section>
  )
}
