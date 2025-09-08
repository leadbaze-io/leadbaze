import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Loader, 
  AlertCircle, 
  Download, 
  Share2,
  Phone,
  Star,
  Globe,
  Target,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Eye,
  MessageSquare,
  BarChart3,
  Sparkles,
  Award,
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react'
import { supabase, getCurrentUser } from '../lib/supabaseClient'
import type { LeadList, Lead } from '../types'
import LeadTableWithActions from '../components/LeadTableWithActions'
import { motion, AnimatePresence } from 'framer-motion'

export default function ListaDetalhes() {
  const { id } = useParams<{ id: string }>()
  const [leadList, setLeadList] = useState<LeadList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadLeadList = async () => {
      try {
        // Verificar usuário autenticado
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          navigate('/login')
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }, 100)
          return
        }

        if (!id) {
          setError('ID da lista não fornecido')
          setIsLoading(false)
          return
        }

        // Carregar lista específica do usuário
        const { data, error } = await supabase
          .from('lead_lists')
          .select('*')
          .eq('id', id)
          .eq('user_id', currentUser.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Lista não encontrada ou você não tem permissão para visualizá-la')
          } else {
            setError('Erro ao carregar lista de leads')
          }
          console.error('Error loading lead list:', error)
        } else {
          setLeadList(data)
        }
      } catch (err) {
        setError('Erro interno. Tente novamente.')
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeadList()
  }, [id, navigate])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    if (!leadList) return
    
    const headers = ['Nome', 'Endereço', 'Telefone', 'Avaliação', 'Website', 'Tipo de Negócio', 'Horários']
    const csvData = [
      headers.join(','),
      ...leadList.leads.map(lead => [
        `"${lead.name}"`,
        `"${lead.address}"`,
        `"${lead.phone || ''}"`,
        lead.rating || '',
        `"${lead.website || ''}"`,
        `"${lead.business_type || ''}"`,
        `"${lead.opening_hours?.join('; ') || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${leadList.name.replace(/\s+/g, '_').toLowerCase()}_leads.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareList = () => {
    if (navigator.share) {
      navigator.share({
        title: `Lista de Leads: ${leadList?.name}`,
        text: `Confira esta lista com ${leadList?.total_leads} leads qualificados`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleLeadsDeleted = async (deletedLeadIds: string[]) => {
    if (!leadList) return

    try {
      // Atualizar a lista local removendo os leads deletados
      const updatedLeads = leadList.leads.filter(lead => !deletedLeadIds.includes(lead.id || ''))
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('lead_lists')
        .update({ 
          leads: updatedLeads,
          total_leads: updatedLeads.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadList.id)

      if (error) {
        throw error
      }

      // Atualizar o estado local
      setLeadList({
        ...leadList,
        leads: updatedLeads,
        total_leads: updatedLeads.length,
        updated_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('Erro ao deletar leads:', error)
      alert('Erro ao deletar leads. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen lista-bg-claro lista-bg-escuro flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-lg font-medium lista-texto-claro dark:text-muted-foreground">
            Carregando lista de leads...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !leadList) {
    return (
      <div className="min-h-screen lista-bg-claro lista-bg-escuro flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold lista-titulo-claro dark:text-foreground mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="lista-texto-muted-claro dark:text-muted-foreground mb-6">
            {error || 'Lista não encontrada'}
          </p>
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className="block bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
            <Link
              to="/gerador"
              className="block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Criar Nova Lista
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lista-bg-claro lista-bg-escuro py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Redesenhado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 lista-texto-muted-claro dark:text-muted-foreground hover:lista-texto-claro dark:hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </div>

          <div className="lista-header-claro lista-header-escuro rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold lista-titulo-claro dark:text-foreground">
                      {leadList.name}
                    </h1>
                    <p className="lista-texto-muted-claro dark:text-muted-foreground text-sm sm:text-base">
                      Lista de leads qualificados
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="lista-texto-muted-claro dark:text-muted-foreground text-sm">
                      Criado em {formatDate(leadList.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="lista-texto-muted-claro dark:text-muted-foreground text-sm">
                      {leadList.total_leads} leads encontrados
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
              >
                <button
                  onClick={exportToCSV}
                  className="lista-btn-export-claro lista-btn-export-escuro inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>Exportar CSV</span>
                </button>
                
                <button
                  onClick={shareList}
                  className="lista-btn-share-claro lista-btn-share-escuro inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Compartilhar</span>
                </button>

                <Link
                  to="/gerador"
                  className="lista-btn-secondary-claro lista-btn-secondary-escuro inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Nova Lista
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Redesenhados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            {
              icon: Users,
              title: "Total de Leads",
              value: leadList.total_leads,
              color: "blue",
              bgColor: "from-blue-500 to-blue-600"
            },
            {
              icon: Phone,
              title: "Com Telefone",
              value: leadList.leads.filter((lead: Lead) => lead.phone).length,
              color: "green",
              bgColor: "from-green-500 to-green-600"
            },
            {
              icon: Star,
              title: "4+ Estrelas",
              value: leadList.leads.filter((lead: Lead) => lead.rating && lead.rating >= 4).length,
              color: "purple",
              bgColor: "from-purple-500 to-purple-600"
            },
            {
              icon: Globe,
              title: "Com Website",
              value: leadList.leads.filter((lead: Lead) => lead.website).length,
              color: "orange",
              bgColor: "from-orange-500 to-orange-600"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="lista-stats-card-claro lista-stats-card-escuro rounded-2xl p-6 shadow-lg border"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold lista-texto-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold lista-titulo-claro dark:text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lead Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          id="lead-table"
        >
          <LeadTableWithActions 
            leads={leadList.leads} 
            title={leadList.name}
            onLeadsDeleted={handleLeadsDeleted}
          />
        </motion.div>

        {/* Dicas Redesenhadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="lista-dicas-claro lista-dicas-escuro rounded-3xl p-6 sm:p-8 border shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold lista-titulo-claro dark:text-foreground">
                Dicas para usar estes leads
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold lista-titulo-claro dark:text-foreground">Qualificação</h4>
                </div>
                <div className="space-y-3 lista-texto-muted-claro dark:text-muted-foreground">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Priorize estabelecimentos com 4+ estrelas</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Leads com telefone têm maior taxa de conversão</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Verifique se possuem website ativo</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold lista-titulo-claro dark:text-foreground">Abordagem</h4>
                </div>
                <div className="space-y-3 lista-texto-muted-claro dark:text-muted-foreground">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Mencione que encontrou no Google Maps</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Personalize a mensagem por tipo de negócio</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Use os filtros para segmentar sua abordagem</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold lista-titulo-claro dark:text-foreground mb-2">
                    Pronto para começar sua campanha?
                  </h4>
                  <p className="text-sm lista-texto-muted-claro dark:text-muted-foreground">
                    Use o Disparador em Massa para enviar mensagens personalizadas via WhatsApp
                  </p>
                </div>
                <Link
                  to="/disparador"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Zap className="w-5 h-5" />
                  <span>Iniciar Campanha</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}