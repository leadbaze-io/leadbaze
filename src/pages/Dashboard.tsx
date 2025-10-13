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
import { useTheme } from '../contexts/ThemeContext'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')
  const navigate = useNavigate()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const { isDark } = useTheme()

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
        return <Sparkles className="w-5 h-5" style={{color: '#00ff00'}} />
      case 'start':
        return <CheckCircle className="w-5 h-5" style={{color: '#00ff00'}} />
      case 'scale':
        return <Crown className="w-5 h-5" style={{color: '#00ff00'}} />
      case 'enterprise':
        return <Award className="w-5 h-5" style={{color: '#00ff00'}} />
      default:
        return <Award className="w-5 h-5" style={{color: '#b7c7c1'}} />
    }
  }

  const getStatusColor = (status: string, isFreeTrial: boolean = false) => {
    if (isFreeTrial) {
      return 'dashboard-status-active'
    }

    switch (status) {
      case 'active':
        return 'dashboard-status-active'
      case 'cancelled':
        return 'dashboard-status-cancelled'
      case 'expired':
        return 'dashboard-status-warning'
      default:
        return 'dashboard-status-inactive'
    }
  }

  const getUsagePercentage = () => {
    if (!subscription) return 0

    // Usar a mesma lógica do LeadsUsageTracker que funciona
    const totalUsed = subscription.leads_used || 0
    const totalLeadsAvailable = subscription.leads_limit || 0
    
    // Calcular porcentagem de uso baseada no limite real
    const usagePercentage = totalLeadsAvailable > 0 ? (totalUsed / totalLeadsAvailable) * 100 : 0
    
    return Math.round(usagePercentage)
  }

  const getUsageBarWidth = () => {
    const percentage = getUsagePercentage()
    console.log('Progress Bar Debug:', {
      leadsUsed: subscription?.leads_used,
      leadsLimit: subscription?.leads_limit,
      percentage: percentage,
      width: `${Math.min(percentage, 100)}%`
    })
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
      <div className="min-h-screen dashboard-bg-light dark:dashboard-bg-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 dashboard-loading-spinner"
          >
          </motion.div>
          <p className="text-lg font-medium dashboard-card-text-light dark:dashboard-card-text-dark">
            Carregando seu dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen dashboard-bg-light dark:dashboard-bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="dashboard-card-text-light dark:dashboard-card-text-dark">
            Redirecionando para login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <ProfileCheckGuard user={user}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #0a0f0e 0%, #0f1514 50%, #0a0f0e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)'
        }}
      >
        <div className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Boas-vindas Redesenhado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div 
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl dashboard-glow-green"
            style={{
              background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
            }}
          >
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
                      <Rocket className="w-6 h-6" style={{color: '#ffffff'}} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Bem-vindo de volta!
                      </h1>
                      <p className="text-white/90 text-sm sm:text-base">
                        {user.user_metadata?.name || user.email}
                      </p>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed"
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
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                    {subscriptionLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader className="w-5 h-5 text-white animate-spin" />
                        <span className="text-sm text-white/80 ml-2">Carregando...</span>
                      </div>
                    ) : subscription ? (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 ${getStatusColor(subscription.status)} rounded-full animate-pulse shadow-lg flex items-center justify-center`}>
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-base font-bold text-white">
                              {getPlanDisplayName(subscription)}
                            </span>
                          </div>
                          <div className="p-2 bg-white/10 rounded-xl">
                            {getPlanIcon((subscription as any).plan_name || '')}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white/90">Leads restantes</span>
                            <span className="text-sm font-bold text-white">
                              {formatLeads(subscription.leads_remaining)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span>Usados: {subscription.leads_used || 0}</span>
                            <span>Limite: {subscription.leads_limit || 0}</span>
                            <span>Progresso: {getUsagePercentage()}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                getUsagePercentage() >= 90 ? 'bg-red-500' :
                                getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: getUsageBarWidth() }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-white/80 space-x-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 ${getStatusColor(subscription.status)} rounded-full animate-pulse shadow-md flex items-center justify-center`}>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                              <span className="font-medium">Status: {subscription.status === 'active' ? 'Ativo' : subscription.status === 'cancelled' ? 'Cancelado' : subscription.status}</span>
                            </div>
                            <span className="text-xs whitespace-nowrap">
                              {subscription.is_free_trial
                                ? `Expira em ${formatDate(subscription.current_period_end)}`
                                : subscription.status === 'cancelled'
                                  ? `Acesso até ${formatDate(subscription.current_period_end)}`
                                  : `Renova em ${formatDate(subscription.current_period_end)}`}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Se não tem assinatura mas tem perfil com leads bônus, mostrar BonusLeadsCard */}
                        {profile && (profile.bonus_leads || 0) > 0 ? (
                          <BonusLeadsCard profile={profile} />
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
          <div 
            className="rounded-2xl p-2 shadow-lg border transition-colors duration-300"
            style={{
              backgroundColor: isDark ? '#1a1f1e' : '#ffffff',
              borderColor: isDark ? 'rgba(0, 255, 0, 0.1)' : '#e5e7eb'
            }}
          >
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`relative py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'transform scale-105'
                    : 'hover:scale-102'
                }`}
                style={{
                  background: activeTab === 'overview' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'transparent',
                  color: activeTab === 'overview' 
                    ? '#ffffff'
                    : isDark ? '#b7c7c1' : '#2e4842',
                  boxShadow: activeTab === 'overview' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : 'none'
                }}
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-5 h-5" />
                  <span>Visão Geral</span>
                </div>
                {activeTab === 'overview' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl blur opacity-20 -z-10"
                    style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'transform scale-105'
                    : 'hover:scale-102'
                }`}
                style={{
                  background: activeTab === 'analytics' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'transparent',
                  color: activeTab === 'analytics' 
                    ? '#ffffff'
                    : isDark ? '#b7c7c1' : '#2e4842',
                  boxShadow: activeTab === 'analytics' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : 'none'
                }}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </div>
                {activeTab === 'analytics' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl blur opacity-20 -z-10"
                    style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
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
            <h3 
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 50%, #00ff00 100%)',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Ações Rápidas
            </h3>
            <p 
              className="text-sm sm:text-base"
              style={{color: isDark ? '#b7c7c1' : '#6b7280'}}
            >
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl border border-white/10">
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

            {/* 
              DIFERENTES TONS DE VERDE PARA EXPERIMENTAR:
              
              1. ATUAL: #10b981 → #34d399 (Verde esmeralda → Verde menta) - Tons naturais
              2. #059669 → #10b981 (Verde escuro → Verde esmeralda) - Profissional
              3. #34d399 → #6ee7b7 (Verde menta → Verde claro) - Suave e elegante
              4. #047857 → #059669 (Verde muito escuro → Verde escuro) - Sofisticado
              5. #6ee7b7 → #a7f3d0 (Verde claro → Verde muito claro) - Muito suave
              6. #10b981 → #6ee7b7 (Verde esmeralda → Verde claro) - Contraste suave
              
              Para trocar, substitua o background nos dois lugares:
              - background: 'linear-gradient(135deg, COR1 0%, COR2 100%)'
            */}
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
              <div className="absolute inset-0 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}></div>
              <div className="relative rounded-3xl p-8 text-white shadow-xl" style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Disparador em Massa</h3>
                        <p className="text-green-100 text-sm">Envie mensagens personalizadas via WhatsApp</p>
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
          <div className="bg-white dark:bg-card rounded-3xl shadow-lg border border-border p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h3 
                className="text-xl font-bold"
                style={{color: isDark ? '#ffffff' : '#082721'}}
              >
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
                    resource.color === 'blue' ? 'from-green-500 to-emerald-600' :
                    resource.color === 'green' ? 'from-green-500 to-emerald-600' :
                    resource.color === 'purple' ? 'from-green-500 to-emerald-600' :
                    'from-green-500 to-emerald-600'
                  } rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p 
                      className="font-semibold"
                      style={{color: isDark ? '#ffffff' : '#082721'}}
                    >
                      {resource.title}
                    </p>
                    <p 
                      className="text-sm"
                      style={{color: isDark ? '#b7c7c1' : '#6b7280'}}
                    >
                      {resource.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-3xl shadow-lg border border-border p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 
                className="text-xl font-bold"
                style={{color: isDark ? '#ffffff' : '#082721'}}
              >
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
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{color: isDark ? '#b7c7c1' : '#6b7280'}}
                  >
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