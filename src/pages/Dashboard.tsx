import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {

  Loader,

  BarChart3,

  Home,

  Users,

  Target,

  CheckCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Database,
  Crown,
  Award,
  Rocket
} from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { UserProfileService } from '../lib/userProfileService'
import { ListManager } from '../components/ListManager'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'
import ScrollToTopButton from '../components/ScrollToTopButton'
import Footer from '../components/Footer'
import ProfileCheckGuard from '../components/ProfileCheckGuard'
import { useSubscription } from '../hooks/useSubscription'
import BonusLeadsCard from '../components/BonusLeadsCard'
import type { UserProfile } from '../types'

import { motion, AnimatePresence } from 'framer-motion'
import type { LeadList } from '../types'
import type { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')
  const navigate = useNavigate()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()

  // Funções auxiliares para formatação
  const formatLeads = (count: number) => {
    return new Intl.NumberFormat('pt-BR').format(count)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPlanDisplayName = (subscription: any) => {
    // Usar plan_display_name se disponível
    if (subscription?.plan_display_name) {
      return subscription.plan_display_name
    }

    // Fallback para plan_name
    const planName = subscription?.plan_name || ''
    switch (planName) {
      case 'free_trial':
        return 'Teste Gratuito'
      case 'start':
        return 'Plano Start'
      case 'scale':
        return 'Plano Scale'
      case 'enterprise':
        return 'Plano Enterprise'
      default:
        return 'Plano Desconhecido'
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free_trial':
        return <Sparkles className="w-5 h-5 text-blue-300" />
      case 'start':
        return <CheckCircle className="w-5 h-5 text-green-300" />
      case 'scale':
        return <Crown className="w-5 h-5 text-purple-300" />
      case 'enterprise':
        return <Award className="w-5 h-5 text-yellow-300" />
      default:
        return <Award className="w-5 h-5 text-gray-300" />
    }
  }

  const getStatusColor = (status: string, isFreeTrial: boolean = false) => {
    if (isFreeTrial) {
      return 'bg-blue-400'
    }

    switch (status) {
      case 'active':
        return 'bg-green-400'
      case 'cancelled':
        return 'bg-red-400'
      case 'expired':
        return 'bg-orange-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getUsagePercentage = () => {
    if (!subscription) return 0

    // Calcular porcentagem baseada no total de leads disponíveis (usados + restantes)
    const totalLeadsAvailable = subscription.leads_used + subscription.leads_remaining
    if (totalLeadsAvailable <= 0) return 0

    return Math.round((subscription.leads_used / totalLeadsAvailable) * 100)
  }

  const getUsageBarWidth = () => {
    const percentage = getUsagePercentage()
    return `${Math.min(percentage, 100)}%`
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          navigate('/login')
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }, 100)
          return
        }
        setUser(currentUser)
        
        // Carregar perfil do usuário
        try {
          const userProfile = await UserProfileService.getProfile(currentUser.id)
          if (userProfile) {
            setProfile(userProfile)
          }
        } catch (profileError) {
          console.error('Erro ao carregar perfil:', profileError)
          // Não falhar o carregamento do dashboard por causa do perfil
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        navigate('/login')
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

    navigate(`/lista/${list.id}`)
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
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-lg font-medium dashboard-card-text-claro dark:text-muted-foreground">
            Carregando seu dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro flex items-center justify-center">
        <div className="text-center">
          <p className="dashboard-card-text-claro dark:text-muted-foreground">
            Redirecionando para login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <ProfileCheckGuard user={user}>
      <div className="min-h-screen dashboard-bg-claro dashboard-bg-escuro">
        <div className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Boas-vindas Redesenhado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden dashboard-header-claro dashboard-header-escuro rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
                opacity: 0.1
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Crown className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Bem-vindo de volta!
                      </h1>
                      <p className="text-blue-100 text-sm sm:text-base">
                        {user.user_metadata?.name || user.email}
                      </p>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed"
                  >
                    Gerencie suas listas de leads e maximize suas conversões com nossa plataforma inteligente
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row lg:flex-col gap-4"
                >

                  {/* Status Card */}
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/30">
                    {subscriptionLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader className="w-5 h-5 text-white animate-spin" />
                        <span className="text-sm text-white/80 ml-2">Carregando...</span>
                      </div>
                    ) : subscription ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${getStatusColor(subscription.status, subscription.is_free_trial)} rounded-full animate-pulse shadow-sm`}></div>
                            <span className="text-sm font-semibold text-white">
                              {getPlanDisplayName(subscription)}
                            </span>
                          </div>
                          {getPlanIcon((subscription as any).plan_name || '')}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80">Leads restantes</span>
                            <span className="text-sm font-bold text-white">
                              {formatLeads(subscription.leads_remaining)}
                            </span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div

                              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: getUsageBarWidth() }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/80 space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 ${getStatusColor(subscription.status)} rounded-full animate-pulse shadow-sm`}></div>
                              <span>Status: {subscription.status === 'active' ? 'Ativo' : subscription.status === 'cancelled' ? 'Cancelado' : subscription.status}</span>
                            </div>
                            <span>
                              {subscription.is_free_trial

                                ? `Expira em ${formatDate(subscription.current_period_end)}`
                                : subscription.status === 'cancelled'

                                  ? `Acesso até ${formatDate(subscription.current_period_end)}`
                                  : `Renova em ${formatDate(subscription.current_period_end)}`
                              }
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Se não tem assinatura mas tem perfil com leads bônus, mostrar BonusLeadsCard */}
                        {profile && (profile.bonus_leads || 0) > 0 ? (
                          <BonusLeadsCard profile={profile} className="bg-white/20 backdrop-blur-md border border-white/30" />
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                                <span className="text-sm font-semibold text-white">Sem Assinatura Ativa</span>
                              </div>
                              <Award className="w-5 h-5 text-gray-300" />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/80">Leads disponíveis</span>
                                <span className="text-sm font-bold text-white">0</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div className="bg-gray-400 h-2 rounded-full w-0"></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-white/80 space-x-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full shadow-sm"></div>
                                  <span>Status: Inativo</span>
                                </div>
                                <span>Escolha um plano</span>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs Redesenhados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="dashboard-nav-card-claro dashboard-nav-card-escuro rounded-2xl p-2 shadow-lg border">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`relative py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'dashboard-nav-button-active-claro dashboard-nav-button-active-escuro transform scale-105'
                    : 'dashboard-nav-button-claro dashboard-nav-button-escuro hover:scale-102'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5" />
                  <span>Visão Geral</span>
                </div>
                {activeTab === 'overview' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'dashboard-nav-button-active-claro dashboard-nav-button-active-escuro transform scale-105'
                    : 'dashboard-nav-button-claro dashboard-nav-button-escuro hover:scale-102'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                {activeTab === 'analytics' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </nav>
          </div>
        </motion.div>

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

        {/* Ações Rápidas Redesenhadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold dashboard-card-title-claro dark:text-foreground mb-2">
              Ações Rápidas
            </h3>
            <p className="dashboard-card-muted-claro dark:text-muted-foreground">
              Comece a gerar leads e maximizar suas conversões
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div

              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
              onClick={() => {
                navigate('/gerador')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              <div className="absolute inset-0 dashboard-action-card-claro dashboard-action-card-escuro rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative dashboard-action-card-claro dashboard-action-card-escuro rounded-3xl p-8 text-white shadow-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Target className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Gerar Novos Leads</h3>
                        <p className="text-green-100 text-sm">Extraia leads qualificados do Google Maps</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>IA Avançada</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Dados Completos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-white/60">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div

              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
              onClick={() => {
                navigate('/disparador-novo')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              <div className="absolute inset-0 dashboard-action-card-purple-claro dashboard-action-card-purple-escuro rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative dashboard-action-card-purple-claro dashboard-action-card-purple-escuro rounded-3xl p-8 text-white shadow-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Disparador em Massa</h3>
                        <p className="text-purple-100 text-sm">Envie mensagens personalizadas via WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Personalização</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Automação</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-white/60">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recursos e Dicas Redesenhados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-3xl shadow-lg border p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold dashboard-card-title-claro dark:text-foreground">
                Recursos Disponíveis
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: Target, title: "Extração Inteligente", desc: "Extraia dados precisos do Google Maps com nossa IA", color: "blue" },
                { icon: Users, title: "Seleção Individual", desc: "Escolha exatamente quais leads deseja salvar", color: "green" },
                { icon: Database, title: "Exportação CSV", desc: "Integre facilmente com seu CRM favorito", color: "purple" },
                { icon: MessageSquare, title: "Disparador em Massa", desc: "Envie mensagens WhatsApp automaticamente", color: "orange" }
              ].map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${
                    resource.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    resource.color === 'green' ? 'from-green-500 to-green-600' :
                    resource.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'
                  } rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold dashboard-card-text-claro dark:text-foreground">
                      {resource.title}
                    </p>
                    <p className="text-sm dashboard-card-muted-claro dark:text-muted-foreground">
                      {resource.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-3xl shadow-lg border p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold dashboard-card-title-claro dark:text-foreground">
                Dicas de Uso
              </h3>
            </div>
            <div className="space-y-4">
              {[
                "Seja específico nas buscas do Google Maps para obter leads mais qualificados",
                "Priorize estabelecimentos com 4+ estrelas para melhor taxa de conversão",
                "Use os filtros nas listas para encontrar leads com telefone e website",
                "Organize seus leads em listas temáticas para melhor gestão"
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 dashboard-badge-claro dashboard-badge-escuro rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-sm dashboard-card-muted-claro dark:text-muted-foreground leading-relaxed">
                    {tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Footer */}
        <Footer />

        {/* Botão Voltar ao Topo */}
        <ScrollToTopButton />
      </div>
    </ProfileCheckGuard>
  )
}