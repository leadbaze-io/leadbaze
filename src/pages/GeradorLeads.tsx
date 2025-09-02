import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { LeadGeneratorPro } from '../components/LeadGeneratorPro'
import type { LeadList, User, Lead } from '../types'


export default function GeradorLeads() {
  const [user, setUser] = useState<User | null>(null)
  const [existingLists, setExistingLists] = useState<LeadList[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        navigate('/login')
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
        return
      }
      setUser(currentUser)

      // Carregar listas existentes para opção de adicionar leads
      try {
        const lists = await LeadService.getUserLeadLists()
        setExistingLists(lists)
      } catch (error) {
        console.error('Erro ao carregar listas existentes:', error)
      }
    }

    initializePage()
  }, [navigate])

  const handleLeadsGenerated = (leads: Lead[]) => {
    console.log('Leads gerados:', leads.length)
    // Callback quando leads são gerados - pode ser usado para analytics, etc.
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-3">
                  <Zap className="w-4 h-4" />
                  <span>Gerador de Leads Profissional</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                  Leads do 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ml-2">
                    Google Maps
                  </span>
                </h1>
                <p className="text-blue-50 text-base max-w-2xl font-medium">
                  Extraia dados precisos e selecione exatamente quais leads deseja salvar!
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <div className="text-sm text-blue-100">Logado como</div>
                  <div className="font-semibold text-white">{user.user_metadata?.name || user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Gerador de Leads Principal */}
        <LeadGeneratorPro 
          onLeadsGenerated={handleLeadsGenerated}
          existingLists={existingLists}
        />

        {/* Instruções e Dicas */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Como usar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Como funciona
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium text-gray-900">Cole o link de uma busca do Google Maps</p>
                  <p className="text-sm text-gray-600">Copie a URL da sua pesquisa no Google Maps</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-medium text-gray-900">Aguarde a extração automática dos dados</p>
                  <p className="text-sm text-gray-600">Nossa IA processa e extrai as informações</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium text-gray-900">Selecione os leads que deseja salvar</p>
                  <p className="text-sm text-gray-600">Escolha apenas os leads mais qualificados</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <p className="font-medium text-gray-900">Crie uma nova lista ou adicione a uma existente</p>
                  <p className="text-sm text-gray-600">Organize seus leads de forma eficiente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exemplos de URLs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Exemplos de buscas
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Restaurantes em São Paulo</p>
                <code className="text-xs text-gray-600 break-all bg-white p-2 rounded border">
                  https://maps.google.com/maps?q=restaurantes+sao+paulo
                </code>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Dentistas no Rio de Janeiro</p>
                <code className="text-xs text-gray-600 break-all bg-white p-2 rounded border">
                  https://maps.google.com/maps?q=dentistas+rio+de+janeiro
                </code>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Academias em Belo Horizonte</p>
                <code className="text-xs text-gray-600 break-all bg-white p-2 rounded border">
                  https://maps.google.com/maps?q=academias+belo+horizonte
                </code>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Seja específico nas buscas para obter leads mais qualificados. 
                Inclua a cidade e o tipo exato de negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}