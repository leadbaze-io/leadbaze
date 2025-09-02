import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, Send, Plus } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { ListManager } from '../components/ListManager'
import type { LeadList, User } from '../types'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      try {
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
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        navigate('/login')
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [navigate])

  const handleSelectList = (list: LeadList) => {
    // Callback quando uma lista é selecionada
    console.log('Lista selecionada:', list.name)
    navigate(`/lista/${list.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Boas-vindas */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bem-vindo de volta! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Gerencie suas listas de leads e maximize suas conversões
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <div className="text-sm text-blue-200">Logado como</div>
                  <div className="font-semibold">{user.user_metadata?.name || user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gerenciador de Listas */}
        <ListManager 
          onSelectList={handleSelectList}
        />

        {/* Ações Rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => {
              navigate('/gerador')
              // Scroll para o topo após navegação
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }, 100)
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Gerar Novos Leads</h3>
                <p className="text-green-100">Extraia leads do Google Maps</p>
              </div>
              <Plus className="w-8 h-8" />
            </div>
          </div>

          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => {
              navigate('/disparador')
              // Scroll para o topo após navegação
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }, 100)
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Disparador em Massa</h3>
                <p className="text-purple-100">Envie mensagens para suas listas</p>
              </div>
              <Send className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Dicas e Recursos Adicionais */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Recursos Disponíveis
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Extração Inteligente</p>
                  <p className="text-sm text-gray-600">Extraia dados precisos do Google Maps com nossa IA</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Seleção Individual</p>
                  <p className="text-sm text-gray-600">Escolha exatamente quais leads deseja salvar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Exportação CSV</p>
                  <p className="text-sm text-gray-600">Integre facilmente com seu CRM favorito</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Disparador em Massa</p>
                  <p className="text-sm text-gray-600">Envie mensagens WhatsApp para suas listas automaticamente</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Dicas de Uso
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>Seja específico nas buscas do Google Maps para obter leads mais qualificados</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>Priorize estabelecimentos com 4+ estrelas para melhor taxa de conversão</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>Use os filtros nas listas para encontrar leads com telefone e website</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <p>Organize seus leads em listas temáticas para melhor gestão</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}