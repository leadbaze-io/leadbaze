import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { UserProfileService } from '../lib/userProfileService'
import { useToast } from '../hooks/use-toast'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/perfil.css'
import '../styles/profile-modern.css'
import '../styles/toast-modern.css'
import '../styles/subscription-history.css'
import '../styles/original-subscription.css'
import {
  User,
  MapPin,
  Calendar,
  Building2,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  LogOut,
  AlertCircle,
  TrendingUp,
  Package
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import ChangePasswordForm from '../components/ChangePasswordForm'
import { SubscriptionStatusCard } from '../components/SubscriptionStatusCard'
import { LeadsUsageTracker } from '../components/LeadsUsageTracker'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { SubscriptionHistory } from '../components/SubscriptionHistory'
import { OriginalSubscriptionInfo } from '../components/OriginalSubscriptionInfo'
import LeadPackagesTab from '../components/LeadPackagesTab'
import { useSmartSubscription } from '../hooks/useSmartSubscription'
import { usePlans } from '../hooks/usePlans'
import type { UserProfile } from '../types'

export default function UserProfile() {
  const { isDark } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('subscription')
  
  // Hooks para sistema de planos
  const { subscription, isLoading: subscriptionLoading, isUpdating, isConnected } = useSmartSubscription()
  
  // Reset para aba de assinatura se a aba de pacotes estiver ativa mas o usuário não tem assinatura ativa
  useEffect(() => {
    if (activeTab === 'lead-packages' && (!subscription || subscription.status !== 'active')) {
      setActiveTab('subscription')
    }
  }, [activeTab, subscription])
  const { plans, isLoading: plansLoading } = usePlans()
  const [showChangePassword, setShowChangePassword] = useState(false)
  // const [showWebhookMonitor, setShowWebhookMonitor] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()


  // Estados para edição
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    tradeName: '',
    billingStreet: '',
    billingNumber: '',
    billingComplement: '',
    billingNeighborhood: '',
    billingCity: '',
    billingState: '',
    billingZipCode: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar usuário atual
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        navigate('/login')
        return
      }

      setUser(currentUser)

      // Carregar perfil do usuário
      const userProfile = await UserProfileService.getProfile(currentUser.id)
      
      if (userProfile) {
        setProfile(userProfile)
        setEditData({
          fullName: userProfile.full_name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          companyName: userProfile.company_name || '',
          tradeName: userProfile.trade_name || '',
          billingStreet: userProfile.billing_street || '',
          billingNumber: userProfile.billing_number || '',
          billingComplement: userProfile.billing_complement || '',
          billingNeighborhood: userProfile.billing_neighborhood || '',
          billingCity: userProfile.billing_city || '',
          billingState: userProfile.billing_state || '',
          billingZipCode: userProfile.billing_zip_code || ''
        })
        
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados do perfil.",
        variant: 'destructive',
        className: 'toast-modern toast-error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!user || !profile) return

      const updatedProfile = await UserProfileService.updateProfile(user.id, {
        full_name: editData.fullName,
        email: editData.email,
        phone: editData.phone,
        company_name: editData.companyName,
        billing_street: editData.billingStreet,
        billing_number: editData.billingNumber,
        billing_complement: editData.billingComplement,
        billing_neighborhood: editData.billingNeighborhood,
        billing_city: editData.billingCity,
        billing_state: editData.billingState,
        billing_zip_code: editData.billingZipCode
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        setIsEditing(false)
        toast({
          title: "✅ Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
          variant: 'default',
          className: 'toast-modern toast-success'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast({
        title: "❌ Erro",
        description: "Não foi possível salvar as alterações.",
        variant: 'destructive',
        className: 'toast-modern toast-error'
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 mb-4">Não foi possível carregar seu perfil.</p>
          <Button 
            onClick={() => navigate('/login')}
            className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-4 py-2"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0a0f0e 0%, #0f1514 50%, #0a0f0e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)'
      }}
    >
      {/* Header igual ao Dashboard */}
      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div 
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
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
                        <User className="w-6 h-6" style={{color: '#ffffff'}} />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                          Meu Perfil
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                          Gerencie suas informações e configurações
                        </p>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end"
                  >
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-3 sm:px-4 py-2 w-full sm:w-auto"
                    >
                      <LogOut className="w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                      <span className="font-semibold text-sm sm:text-base">
                        <span className="hidden sm:inline">Sair da Conta</span>
                        <span className="sm:hidden">Sair</span>
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Sidebar - Mobile First */}
        <div className="lg:hidden mb-6">
          <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="relative inline-block mb-3 sm:mb-4">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center ${isDark ? 'perfil-avatar-escuro' : 'perfil-avatar-claro'}`}>
                    <span className="text-lg sm:text-2xl font-bold text-white">
                      {getInitials(profile.full_name)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="profile-camera-btn absolute -bottom-1 -right-1 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                    onClick={() => {/* Implementar upload de foto */}}
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <h2 
                  className="text-lg sm:text-xl mb-1 font-semibold"
                  style={{ color: isDark ? '#ffffff' : '#082721' }}
                >
                  {profile.full_name}
                </h2>
                <p 
                  className="text-sm sm:text-base break-all"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  {profile.email}
                </p>
                {profile.is_verified && (
                  <div 
                    className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff'
                    }}
                  >
                    Verificado
                  </div>
                )}
              </div>

              <div className={`h-px my-4 sm:my-6 ${isDark ? 'perfil-divider-escuro' : 'perfil-divider-claro'}`}></div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <Building2 
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {profile.tax_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <Calendar 
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <MapPin 
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  />
                  <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {profile.billing_city}, {profile.billing_state}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
              <div className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="relative inline-block mb-3 sm:mb-4">
                    <div 
                      className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                    >
                      <span className="text-lg sm:text-2xl font-bold text-white">
                        {getInitials(profile.full_name)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className={`absolute -bottom-1 -right-1 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 ${isDark ? 'perfil-btn-primary-escuro' : 'perfil-btn-primary-claro'}`}
                      onClick={() => {/* Implementar upload de foto */}}
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <h2 
                  className="text-lg sm:text-xl mb-1 font-semibold"
                  style={{ color: isDark ? '#ffffff' : '#082721' }}
                >
                  {profile.full_name}
                </h2>
                  <p 
                  className="text-sm sm:text-base break-all"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  {profile.email}
                </p>
                  {profile.is_verified && (
                    <div className="profile-badge profile-badge-success px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mt-2">
                      Verificado
                    </div>
                  )}
                </div>

                <div className={`h-px my-4 sm:my-6 ${isDark ? 'perfil-divider-escuro' : 'perfil-divider-claro'}`}></div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 text-xs sm:text-sm">
                    <Building2 className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`} />
                    <span className={`${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`}>
                      {profile.tax_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs sm:text-sm">
                    <Calendar className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`} />
                    <span className={`${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`}>
                      Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs sm:text-sm">
                    <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`} />
                    <span className={`${isDark ? 'perfil-texto-secundario-escuro' : 'perfil-texto-secundario-claro'}`}>
                      {profile.billing_city}, {profile.billing_state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
              <div className={`profile-tabs-list p-1 grid w-full gap-1 mb-4 sm:mb-6 ${
                subscription && subscription.status === 'active' 
                  ? 'grid-cols-4' 
                  : 'grid-cols-3'
              }`}>
                <button
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'subscription' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    color: activeTab === 'subscription' 
                      ? '#ffffff' 
                      : isDark ? '#9ca3af' : '#6b7280'
                  }}
                  onClick={() => setActiveTab('subscription')}
                >
                  <span className="hidden sm:inline">Assinatura</span>
                  <span className="sm:hidden">Plano</span>
                </button>
                {subscription && subscription.status === 'active' && (
                  <button
                    className={`px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${
                      activeTab === 'lead-packages' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                        : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      color: activeTab === 'lead-packages' 
                        ? '#ffffff' 
                        : isDark ? '#9ca3af' : '#6b7280'
                    }}
                    onClick={() => setActiveTab('lead-packages')}
                  >
                    <Package className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Pacotes de Leads</span>
                    <span className="sm:hidden">Pacotes</span>
                  </button>
                )}
                <button
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    color: activeTab === 'overview' 
                      ? '#ffffff' 
                      : isDark ? '#9ca3af' : '#6b7280'
                  }}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="hidden sm:inline">Visão Geral</span>
                  <span className="sm:hidden">Geral</span>
                </button>
                <button
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'personal' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    color: activeTab === 'personal' 
                      ? '#ffffff' 
                      : isDark ? '#9ca3af' : '#6b7280'
                  }}
                  onClick={() => setActiveTab('personal')}
                >
                  <span className="hidden sm:inline">Dados Pessoais</span>
                  <span className="sm:hidden">Dados</span>
                </button>
              </div>

              {activeTab === 'subscription' && (
                <div className="mt-4 sm:mt-6 animate-fade-in">
                  <div className="space-y-6">
                    {/* Status da Assinatura */}
                    {subscriptionLoading ? (
                      <div 
                        className="p-6 text-center rounded-xl shadow-lg border"
                        style={{
                          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                          borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
                        }}
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Carregando dados da assinatura...</p>
                      </div>
                  ) : subscription ? (
                    <>
                      <SubscriptionStatusCard
                        subscription={subscription}
                        onUpgrade={() => navigate('/plans')}
                        onManage={() => setActiveTab('overview')}
                        isUpdating={isUpdating}
                        isConnected={isConnected}
                        profile={profile}
                      />
                        
                        {/* Aviso de Cancelamento - Visível quando assinatura está cancelada */}
                        {subscription.status === 'cancelled' && (
                          <div className="space-y-4 mt-6">
                            {/* Aviso Principal */}
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <p className="text-sm text-red-800 dark:text-red-200">
                                <strong>🚨 ASSINATURA CANCELADA - AÇÃO MANUAL NECESSÁRIA</strong><br/>
                                Sua assinatura foi cancelada no LeadBaze, mas você DEVE cancelar manualmente no Perfect Pay para evitar cobranças futuras!
                              </p>
                            </div>

                            {/* Instruções para Cancelamento Manual */}
                            <div className="flex items-start gap-2">
                              <div className="text-blue-600 mt-0.5">📋</div>
                              <div>
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Instruções para Cancelamento Manual</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">Para evitar cobranças futuras, você deve cancelar no Perfect Pay:</p>
                                <ol className="text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                                  <li>Acesse: <strong>https://app.perfectpay.com.br</strong></li>
                                  <li>Faça login com suas credenciais</li>
                                  <li>Vá para "Minhas Assinaturas"</li>
                                  <li>Cancele a assinatura do LeadBaze</li>
                                  <li>Confirme o cancelamento</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <SubscriptionStatusCard
                          subscription={null}
                          onUpgrade={() => navigate('/plans')}
                          profile={profile}
                        />
                        
                        <div 
                          className="p-6 text-center mt-6 rounded-xl shadow-lg border"
                          style={{
                            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                            borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
                          }}
                        >
                          <div className="text-4xl mb-4">💳</div>
                          <h3 
                            className="text-lg mb-2 font-semibold"
                            style={{ color: isDark ? '#ffffff' : '#082721' }}
                          >
                            Nenhuma Assinatura Ativa
                          </h3>
                          <p 
                            className="mb-6"
                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                          >
                            Escolha um plano para começar a gerar leads de qualidade
                          </p>
                          <Button
                            onClick={() => navigate('/plans')}
                            className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-4 py-2"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Ver Planos Disponíveis
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Informações da Assinatura Original */}
                    {user?.id && (
                      <OriginalSubscriptionInfo userId={user.id} />
                    )}

                    {/* Rastreamento de Uso de Leads */}
                    {subscription && (
                      <LeadsUsageTracker 
                        className="rounded-xl shadow-lg border"
                      />
                    )}

                    {/* Histórico de Atividades da Assinatura */}
                    {subscription && (
                      <SubscriptionHistory 
                        subscription={subscription}
                        className="rounded-xl shadow-lg border"
                      />
                    )}


                    {/* Informações dos Planos */}
                    {!subscription && (
                      <div 
                        className="p-6 rounded-xl shadow-lg border"
                        style={{
                          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                          borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
                        }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                            <TrendingUp className="w-5 h-5" style={{color: '#ffffff'}} />
                          </div>
                          <div>
                            <h3 
                              className="text-lg font-semibold"
                              style={{ color: isDark ? '#ffffff' : '#082721' }}
                            >
                              Planos Disponíveis
                            </h3>
                            <p className="profile-text-muted text-sm">
                              Escolha o plano ideal para suas necessidades
                            </p>
                          </div>
                        </div>

                        {/* Exibir leads bônus se não tem assinatura paga */}
                        {!subscription && profile && (
                          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 rounded-lg" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                                <TrendingUp className="w-6 h-6" style={{color: '#ffffff'}} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                                  🎁 Leads Bônus Gratuitos
                                </h3>
                                <p className="text-green-700 dark:text-green-300">
                                  Você tem leads gratuitos para testar nossa plataforma!
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                  {profile.bonus_leads || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Leads Disponíveis
                                </div>
                              </div>
                              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                  {profile.bonus_leads_used || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Leads Usados
                                </div>
                              </div>
                              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                  {(profile.bonus_leads || 0) - (profile.bonus_leads_used || 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Leads Restantes
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="text-blue-500 mt-0.5">💡</div>
                                <div>
                                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                    Como usar seus leads bônus
                                  </h4>
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Vá para o <strong>Gerador de Leads</strong> e digite o tipo de estabelecimento e localização desejada. 
                                    Cada busca consome 1 lead. Quando acabar, você pode assinar um plano para continuar!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {plansLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="profile-text-muted">Carregando planos...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                              <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="text-center mb-4">
                                  <h4 className="profile-title text-lg font-semibold mb-2">
                                    {plan.display_name}
                                  </h4>
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    }).format(plan.price)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    por mês
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                      {new Intl.NumberFormat('pt-BR').format(plan.leads)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      leads por mês
                                    </div>
                                  </div>
                                </div>

                                <ul className="space-y-2 mb-4">
                                  {(plan.features || []).slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                  ))}
                                </ul>

                                <Button
                                  onClick={() => navigate('/plans')}
                                  className="w-full group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-4 py-2"
                                >
                                  Ver Detalhes
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'lead-packages' && subscription && subscription.status === 'active' && (
                <div className="mt-4 sm:mt-6 animate-fade-in">
                  <LeadPackagesTab 
                    userId={user.id}
                    currentLeads={subscription.leads_remaining || 0}
                    onLeadsUpdate={(newLeads) => {
                      // Atualizar o estado local se necessário
                      console.log('Leads atualizados:', newLeads);
                    }}
                  />
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="mt-4 sm:mt-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 profile-text-muted" />
                          <h3 className="profile-title text-sm sm:text-base">Informações Básicas</h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="profile-label text-xs sm:text-sm">Nome Completo</label>
                            <p className="profile-text text-sm sm:text-base break-words">{profile.full_name}</p>
                          </div>
                          <div>
                            <label className="profile-label text-xs sm:text-sm">Email</label>
                            <p className="profile-text text-sm sm:text-base break-all">{profile.email}</p>
                          </div>
                          <div>
                            <label className="profile-label text-xs sm:text-sm">Telefone</label>
                            <p className="profile-text text-sm sm:text-base">{profile.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 profile-text-muted" />
                          <h3 className="profile-title text-sm sm:text-base">Informações Empresariais</h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="profile-label text-xs sm:text-sm">Tipo</label>
                            <p className="profile-text text-sm sm:text-base">
                              {profile.tax_type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </p>
                          </div>
                          {profile.company_name && (
                            <div>
                              <label className="profile-label text-xs sm:text-sm">Empresa</label>
                              <p className="profile-text text-sm sm:text-base break-words">{profile.company_name}</p>
                            </div>
                          )}
                          {profile.cnpj && (
                            <div>
                              <label className="profile-label text-xs sm:text-sm">CNPJ</label>
                              <p className="profile-text text-sm sm:text-base">{profile.cnpj}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 profile-text-muted" />
                          <h3 className="profile-title text-sm sm:text-base">Segurança</h3>
                        </div>
                        <p className="profile-text-muted text-xs sm:text-sm mb-4 sm:mb-6">
                          Gerencie sua senha e configurações de segurança
                        </p>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg gap-3 sm:gap-0">
                            <div className="flex-1">
                              <h4 className="profile-title font-medium text-sm sm:text-base">Alterar Senha</h4>
                              <p className="profile-text-muted text-xs sm:text-sm">Atualize sua senha de acesso</p>
                            </div>
                            <Button 
                              className="text-xs sm:text-sm px-3 py-2 self-start sm:self-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                              size="sm"
                              onClick={() => setShowChangePassword(true)}
                            >
                              Alterar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="mt-4 sm:mt-6 animate-fade-in">
                  <div 
            className="rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
            }}
          >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="profile-title">Dados Pessoais</h3>
                          <p className="profile-text-muted">
                            Atualize suas informações pessoais
                          </p>
                        </div>
                        <Button
                          className={isEditing ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"}
                          onClick={() => {
                            if (isEditing) {
                              handleSaveProfile()
                            } else {
                              setIsEditing(true)
                            }
                          }}
                        >
                          {isEditing ? (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Salvar
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="profile-label block text-sm mb-2">
                            Nome Completo
                          </label>
                          {isEditing ? (
                            <Input
                              className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                              value={editData.fullName}
                              onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                            />
                          ) : (
                            <p className="profile-text py-2">{profile.full_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="profile-label block text-sm mb-2">
                            Email
                          </label>
                          {isEditing ? (
                            <Input
                              className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({...editData, email: e.target.value})}
                            />
                          ) : (
                            <p className="profile-text py-2">{profile.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="profile-label block text-sm mb-2">
                            Telefone
                          </label>
                          {isEditing ? (
                            <Input
                              className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                              value={editData.phone}
                              onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            />
                          ) : (
                            <p className="profile-text py-2">{profile.phone}</p>
                          )}
                        </div>

                        {profile.tax_type === 'pessoa_juridica' && (
                          <>
                            <div>
                              <label className="profile-label block text-sm mb-2">
                                Nome da Empresa
                              </label>
                              {isEditing ? (
                                <Input
                                  className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                  value={editData.companyName}
                                  onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                                />
                              ) : (
                                <p className="profile-text py-2">{profile.company_name || 'Não informado'}</p>
                              )}
                            </div>

                            <div>
                              <label className="profile-label block text-sm mb-2">
                                Nome Fantasia
                              </label>
                              {isEditing ? (
                                <Input
                                  className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                  value={editData.tradeName}
                                  onChange={(e) => setEditData({...editData, tradeName: e.target.value})}
                                />
                              ) : (
                                <p className="profile-text py-2">{profile.trade_name || 'Não informado'}</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Seção de Endereço de Cobrança */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="mb-6">
                          <h4 className="profile-title text-lg mb-2">Endereço de Cobrança</h4>
                          <p className="profile-text-muted">
                            Informações para faturamento e cobrança
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="profile-label block text-sm mb-2">
                              Rua
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingStreet}
                                onChange={(e) => setEditData({...editData, billingStreet: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_street}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              Número
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingNumber}
                                onChange={(e) => setEditData({...editData, billingNumber: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_number}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              Complemento
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingComplement}
                                onChange={(e) => setEditData({...editData, billingComplement: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_complement || 'Não informado'}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              Bairro
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingNeighborhood}
                                onChange={(e) => setEditData({...editData, billingNeighborhood: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_neighborhood}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              Cidade
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingCity}
                                onChange={(e) => setEditData({...editData, billingCity: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_city}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              Estado
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingState}
                                onChange={(e) => setEditData({...editData, billingState: e.target.value})}
                                maxLength={2}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_state}</p>
                            )}
                          </div>

                          <div>
                            <label className="profile-label block text-sm mb-2">
                              CEP
                            </label>
                            {isEditing ? (
                              <Input
                                className={`${isDark ? 'perfil-input-escuro' : 'perfil-input-claro'}`}
                                value={editData.billingZipCode}
                                onChange={(e) => setEditData({...editData, billingZipCode: e.target.value})}
                              />
                            ) : (
                              <p className="profile-text py-2">{profile.billing_zip_code}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end space-x-3 mt-6">
                          <Button
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                            onClick={() => {
                              setIsEditing(false)
                              // Reset form data
                              setEditData({
                                fullName: profile.full_name || '',
                                email: profile.email || '',
                                phone: profile.phone || '',
                                companyName: profile.company_name || '',
                                tradeName: profile.trade_name || '',
                                billingStreet: profile.billing_street || '',
                                billingNumber: profile.billing_number || '',
                                billingComplement: profile.billing_complement || '',
                                billingNeighborhood: profile.billing_neighborhood || '',
                                billingCity: profile.billing_city || '',
                                billingState: profile.billing_state || '',
                                billingZipCode: profile.billing_zip_code || ''
                              })
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>

      {/* Modal de Alteração de Senha */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="profile-card max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <ChangePasswordForm
              onSuccess={() => {
                setShowChangePassword(false)
                toast({
                  title: "✅ Senha alterada com sucesso!",
                  description: "Sua senha foi atualizada com segurança.",
                  variant: 'success',
                  className: 'toast-modern toast-success'
                })
              }}
              onCancel={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}

      {/* Status de Conexão (Debug) */}
      <ConnectionStatus 
        isConnected={isConnected}
        isUpdating={isUpdating}
        lastUpdate={subscription ? new Date() : null}
      />
    </div>
  )
}
