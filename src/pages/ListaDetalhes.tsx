import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Loader, AlertCircle, Download, Share2 } from 'lucide-react'
import { supabase, getCurrentUser } from '../lib/supabaseClient'
import type { LeadList, Lead } from '../types'
import LeadTableWithActions from '../components/LeadTableWithActions'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando lista de leads...</p>
        </div>
      </div>
    )
  }

  if (error || !leadList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Lista não encontrada'}
          </p>
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
            <Link
              to="/gerador"
              className="block text-blue-600 hover:text-blue-700 transition-colors"
            >
              Criar Nova Lista
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {leadList.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {formatDate(leadList.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{leadList.total_leads} leads encontrados</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>
                
                <button
                  onClick={shareList}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>

                <Link
                  to="/gerador"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Criar Nova Lista
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{leadList.total_leads}</p>
                <p className="text-gray-600 text-sm">Total de Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {leadList.leads.filter((lead: Lead) => lead.phone).length}
                </p>
                <p className="text-gray-600 text-sm">Com Telefone</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {leadList.leads.filter((lead: Lead) => lead.rating && lead.rating >= 4).length}
                </p>
                <p className="text-gray-600 text-sm">4+ Estrelas</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {leadList.leads.filter((lead: Lead) => lead.website).length}
                </p>
                <p className="text-gray-600 text-sm">Com Website</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Table */}
        <div id="lead-table">
          <LeadTableWithActions 
            leads={leadList.leads} 
            title={leadList.name}
            onLeadsDeleted={handleLeadsDeleted}
          />
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Dicas para usar estes leads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Qualificação:</h4>
              <ul className="space-y-1">
                <li>• Priorize estabelecimentos com 4+ estrelas</li>
                <li>• Leads com telefone têm maior taxa de conversão</li>
                <li>• Verifique se possuem website ativo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Abordagem:</h4>
              <ul className="space-y-1">
                <li>• Mencione que encontrou no Google Maps</li>
                <li>• Personalize a mensagem por tipo de negócio</li>
                <li>• Use os filtros para segmentar sua abordagem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}