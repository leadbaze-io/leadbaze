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
  Plus,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Zap
} from 'lucide-react'
import { supabase, getCurrentUser } from '../lib/supabaseClient'
import type { LeadList, Lead } from '../types'
import LeadTableWithActions from '../components/LeadTableWithActions'
import { SyncToCRMButton } from '../components/SyncToCRMButton'
import Footer from '../components/Footer'
import ScrollToTopButton from '../components/ScrollToTopButton'
import { motion } from 'framer-motion'

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

        } else {
          setLeadList(data)
        }
      } catch (err) {
        setError('Erro interno. Tente novamente.')

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

    // Detectar se é iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isIOS) {
      // Para iOS, usar data URL em vez de blob
      const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${leadList.name.replace(/\s+/g, '_').toLowerCase()}_leads.csv`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Para outros dispositivos, usar blob (método original)
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
        URL.revokeObjectURL(url) // Limpar URL para liberar memória
      }
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

      alert('Erro ao deletar leads. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(to right, #00ff00, #00cc00)' }}
          >
            <Loader className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-lg font-medium dashboard-card-text-claro dark:text-muted-foreground">
            Carregando lista de leads...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !leadList) {
    return (
      <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dashboard-card-title-claro dark:text-foreground mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="dashboard-card-muted-claro dark:text-muted-foreground mb-6">
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
    <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro">
      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Redesenhado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1 sm:space-x-2 dashboard-card-muted-claro dark:text-muted-foreground hover:dashboard-card-text-claro dark:hover:text-foreground transition-colors text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Voltar ao Dashboard</span>
                <span className="sm:hidden">Voltar</span>
              </Link>
            </div>

            <div className="dashboard-nav-card-claro dashboard-nav-card-escuro rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2 sm:space-x-3"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold dashboard-card-title-claro dark:text-foreground">
                        {leadList.name}
                      </h1>
                      <p className="dashboard-card-muted-claro dark:text-muted-foreground text-xs sm:text-sm lg:text-base">
                        Lista de leads qualificados
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 lg:space-x-6 space-y-1 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="dashboard-card-muted-claro dark:text-muted-foreground text-xs sm:text-sm">
                        Criado em {formatDate(leadList.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="dashboard-card-muted-claro dark:text-muted-foreground text-xs sm:text-sm">
                        {leadList.total_leads} leads encontrados
                      </span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-2 sm:gap-3"
                >
                  <button
                    onClick={exportToCSV}
                    className="h-10 inline-flex items-center justify-center space-x-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-sm"
                    title="Exportar CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline">Exportar</span>
                  </button>

                  <button
                    onClick={shareList}
                    className="h-10 inline-flex items-center justify-center space-x-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-sm"
                    title="Compartilhar"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden lg:inline">Compartilhar</span>
                  </button>

                  <SyncToCRMButton
                    leadListId={leadList.id}
                    leadListName={leadList.name}
                    totalLeads={leadList.total_leads}
                    className="h-10 inline-flex items-center justify-center space-x-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-md text-sm"
                    variant="default"
                  />

                  <Link
                    to="/gerador"
                    className="h-10 inline-flex items-center justify-center space-x-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Lista</span>
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
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
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
                className="dashboard-info-card-claro dashboard-info-card-escuro rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold dashboard-card-title-claro dark:text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
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
            className="mt-6 sm:mt-8"
          >
            <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border shadow-lg">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold dashboard-card-title-claro dark:text-foreground">
                  Dicas para usar estes leads
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h4 className="font-semibold dashboard-card-title-claro dark:text-foreground text-sm sm:text-base">Qualificação</h4>
                  </div>
                  <div className="space-y-2 sm:space-y-3 dashboard-card-muted-claro dark:text-muted-foreground">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Priorize estabelecimentos com 4+ estrelas</p>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Leads com telefone têm maior taxa de conversão</p>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Verifique se possuem website ativo</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h4 className="font-semibold dashboard-card-title-claro dark:text-foreground text-sm sm:text-base">Abordagem</h4>
                  </div>
                  <div className="space-y-2 sm:space-y-3 dashboard-card-muted-claro dark:text-muted-foreground">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Mencione que gerou o lead através do LeadBaze</p>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Personalize a mensagem por tipo de negócio</p>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">Use os filtros para segmentar sua abordagem</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h4 className="font-semibold dashboard-card-title-claro dark:text-foreground mb-1 sm:mb-2 text-sm sm:text-base">
                      Pronto para começar sua campanha?
                    </h4>
                    <p className="text-xs sm:text-sm dashboard-card-muted-claro dark:text-muted-foreground">
                      Use o Disparador em Massa para enviar mensagens personalizadas via WhatsApp
                    </p>
                  </div>
                  <Link
                    to="/disparador"
                    className="inline-flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Iniciar Campanha</span>
                    <span className="sm:hidden">Iniciar</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}