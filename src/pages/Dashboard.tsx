import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, Send, Plus, BarChart3, Users } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { ListManager } from '../components/ListManager'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'

import { motion, AnimatePresence } from 'framer-motion'
import type { LeadList, User } from '../types'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Boas-vindas */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.1
              }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Bem-vindo de volta! 👋
                </h1>
                <p className="text-blue-100 text-lg max-w-md">
                  Gerencie suas listas de leads e maximize suas conversões com nossa plataforma inteligente
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">Logado como</div>
                  <div className="text-lg font-semibold truncate max-w-48">{user.user_metadata?.name || user.email}</div>
                  <div className="text-xs text-blue-300 mt-1">Plano: Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-card rounded-xl p-2 shadow-lg border border-border">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`relative py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Visão Geral</span>
                </div>
                {activeTab === 'overview' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 -z-10"></div>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                {activeTab === 'analytics' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 -z-10"></div>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gerenciador de Listas */}
              <ListManager 
                onSelectList={handleSelectList}
              />
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Analytics Dashboard */}
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ações Rápidas */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative group cursor-pointer"
              onClick={() => {
                navigate('/gerador')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Gerar Novos Leads</h3>
                    <p className="text-green-100 text-sm">Extraia leads qualificados do Google Maps com nossa IA</p>
                  </div>
                  <div className="text-white/60">
                    <Plus className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative group cursor-pointer"
              onClick={() => {
                navigate('/disparador')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Send className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">Disparador em Massa</h3>
                    <p className="text-purple-100 text-sm">Envie mensagens personalizadas via WhatsApp</p>
                  </div>
                  <div className="text-white/60">
                    <Send className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dicas e Recursos Adicionais */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              🚀 Recursos Disponíveis
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Extração Inteligente</p>
                  <p className="text-sm text-muted-foreground">Extraia dados precisos do Google Maps com nossa IA</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Seleção Individual</p>
                  <p className="text-sm text-muted-foreground">Escolha exatamente quais leads deseja salvar</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Exportação CSV</p>
                  <p className="text-sm text-muted-foreground">Integre facilmente com seu CRM favorito</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Disparador em Massa</p>
                  <p className="text-sm text-muted-foreground">Envie mensagens WhatsApp para suas listas automaticamente</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              💡 Dicas de Uso
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
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