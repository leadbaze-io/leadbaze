/**
 * =====================================================
 * NOVA PÁGINA DO DISPARADOR - ARQUITETURA MODULAR
 * =====================================================
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/disparador.css'

// Componentes
import { Button } from '../components/ui/button'
import { CampaignManager } from '../components/campaign/CampaignManager'
import { CampaignWizard } from '../components/campaign/CampaignWizard'
import WhatsAppConnection from '../components/WhatsAppConnection'
import Footer from '../components/Footer'
import CampaignProgressModalSimple from '../components/CampaignProgressModalSimple'
import ScrollToTopButton from '../components/ScrollToTopButton'

// Hooks e Serviços
import { useCampaign } from '../hooks/useCampaign'
import { LeadService } from '../lib/leadService'
import { WhatsAppInstanceService } from '../lib/whatsappInstanceService'
import { getCurrentUser } from '../lib/supabaseClient'
import { toast } from '../hooks/use-toast'

// Função para normalizar números de telefone
const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return phone

  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')

  // Se já tem código do país (55), retorna como está
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
    return cleanPhone
  }

  // Se não tem código do país, adiciona 55 (Brasil)
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    return `55${cleanPhone}`
  }

  // Se não conseguir normalizar, retorna o número original
  return cleanPhone
}

// Tipos
import type { Campaign, LeadList } from '../types/campaign'
import type { EvolutionAPIConfig } from '../types'

// Estados da página
type PageState = 'campaigns' | 'create' | 'edit' | 'config'

export default function NewDisparadorMassa() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [user, setUser] = useState<any>(null)

  // Estado da página
  const [currentState, setCurrentState] = useState<PageState>('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [lists, setLists] = useState<LeadList[]>([])
  const [currentWizardStep, setCurrentWizardStep] = useState<'lists' | 'message' | 'review'>('lists')

  // Obter usuário logado
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {

      }
    }
    loadUser()
  }, [])
  const [whatsappConfig, setWhatsappConfig] = useState<EvolutionAPIConfig | null>(null)
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Estados para modal de progresso simplificado
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [currentCampaignStatus, setCurrentCampaignStatus] = useState<'sending' | 'completed' | 'failed' | 'cancelled'>('sending')
  const [campaignStartTime, setCampaignStartTime] = useState<Date | null>(null)
  const [currentCampaignName, setCurrentCampaignName] = useState<string>('')
  const [currentTotalLeads, setCurrentTotalLeads] = useState<number>(0)
  const [currentSuccessCount, setCurrentSuccessCount] = useState<number>(0)
  const [currentFailedCount, setCurrentFailedCount] = useState<number>(0)
  const [currentLead, setCurrentLead] = useState<{ name: string, phone: string } | null>(null)
  const [campaignLeads, setCampaignLeads] = useState<any[]>([])
  const [isInitializing, setIsInitializing] = useState(true)

  // Hook da campanha
  const campaignHook = useCampaign({

    campaignId: selectedCampaign?.id

  })

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [user])

  // Verificar periodicamente se há uma instância conectada (para detectar restauração automática)
  useEffect(() => {
    if (!user) return

    const checkConnectionStatus = async () => {
      try {
        const instance = await WhatsAppInstanceService.getUserInstance(user.id)
        if (instance && instance.status === 'connected' && instance.instance_name !== connectedInstance) {
          setConnectedInstance(instance.instance_name)
        } else if (!instance || instance.status !== 'connected') {
          setConnectedInstance(null)
        }
      } catch (error) {
        // Log removido para limpeza
      }
    }

    // Verificar a cada 10 segundos
    const interval = setInterval(checkConnectionStatus, 10000)
    return () => clearInterval(interval)
  }, [user, connectedInstance])
  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Carregar listas e configurações em paralelo
      const [userLists] = await Promise.all([
        LeadService.getUserLeadLists()
      ])

      setLists(userLists)
      setWhatsappConfig(null)

      // Carregar instância WhatsApp conectada
      if (user) {
        const instance = await WhatsAppInstanceService.getUserInstance(user.id)
        if (instance && instance.status === 'connected') {
          setConnectedInstance(instance.instance_name)
          setWhatsappConfig({
            id: instance.id,
            user_id: instance.user_id,
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze.io' : '',
            api_key: '***',
            instance_name: instance.instance_name,
            whatsapp_number: instance.whatsapp_number || 'QR Code',
            status: 'active' as const,
            created_at: instance.created_at,
            updated_at: instance.updated_at
          })
        } else {
          setConnectedInstance(null)
        }
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  // Handlers
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setCurrentState('edit')
  }

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null)
    setCurrentState('campaigns')
    setCurrentWizardStep('lists') // Reset do step do wizard
    campaignHook.refreshCampaign()
  }

  const handleConfigClick = () => {
    setCurrentState('config')
  }

  const handleConnectionSuccess = async (instanceName: string) => {
    setConnectedInstance(instanceName)

    try {
      // Buscar dados atualizados da instância
      if (user) {
        const instance = await WhatsAppInstanceService.getUserInstance(user.id)
        if (instance) {
          setWhatsappConfig({
            id: instance.id,
            user_id: instance.user_id,
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze.io' : '',
            api_key: '***',
            instance_name: instance.instance_name,
            whatsapp_number: instance.whatsapp_number || 'QR Code',
            status: 'active' as const,
            created_at: instance.created_at,
            updated_at: instance.updated_at
          })
        }
      }
    } catch (error) {

    }

    // Mensagem de sucesso profissional
    toast({
      title: '🎉 WhatsApp Conectado com Sucesso!',
      description: 'Sua conta WhatsApp está ativa e pronta para enviar campanhas.',
      variant: 'success',
    })

    // Voltar para a aba de campanhas
    setCurrentState('campaigns')
  }

  const handleConnectionError = (_error: string) => {

    setConnectedInstance(null)
    setWhatsappConfig(null)
  }

  const handleDisconnect = () => {
    setConnectedInstance(null)
    setWhatsappConfig(null)
  }
  // Função para lidar com mudanças de step do wizard
  const handleWizardStepChange = (step: 'lists' | 'message' | 'review') => {
    setCurrentWizardStep(step)
  }

  const handleSendCampaign = async (message: string, campaignLeads: any[]) => {
    // Iniciando envio da campanha

    if (!selectedCampaign) {

      toast({
        title: 'Erro',
        description: 'Nenhuma campanha selecionada',
        variant: 'destructive'
      })
      return
    }

    if (!connectedInstance) {

      toast({
        title: 'Erro',
        description: 'WhatsApp não está conectado',
        variant: 'destructive'
      })
      return
    }

    if (!message || message.trim().length === 0) {

      toast({
        title: 'Erro',
        description: 'Mensagem não pode estar vazia',
        variant: 'destructive'
      })
      return
    }

    if (!campaignLeads || campaignLeads.length === 0) {

      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma lista com leads',
        variant: 'destructive'
      })
      return
    }
    try {

      // Preparar dados para N8N (formato correto: body como array)
      const n8nPayload = [
        {
          instance_name: connectedInstance,
          mensagem: message,
          campaign_id: selectedCampaign.id,
          itens: campaignLeads.map(lead => ({
            nome: lead.name || 'Lead sem nome',
            telefone: normalizePhoneNumber(lead.phone),
            cidade: lead.city || 'Não informado'
          }))
        }
      ]

      // Log detalhado dos números normalizados
      // Normalizar números de telefone para debug (apenas em desenvolvimento)
      if (import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.VITE_APP_ENV !== 'production') {
        campaignLeads.forEach((lead, index) => {
          const originalPhone = lead.phone
          const normalizedPhone = normalizePhoneNumber(lead.phone)
          console.log(`Lead ${index + 1}: ${originalPhone} → ${normalizedPhone}`)
        })
        console.log('🌐 [CAMPAIGN-SEND] Enviando via backend (sistema antigo)...')
      }

      // Usar o mesmo fluxo do sistema antigo: Frontend → Backend → N8N
      const backendResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io'}/api/dispatch-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      })
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text()

        throw new Error(`Backend retornou erro: ${backendResponse.status} - ${errorText}`)
      }

      await backendResponse.json()
      // Armazenar leads da campanha no estado
      setCampaignLeads(campaignLeads)

      // Configurar estados do modal simplificado
      setCurrentCampaignName(selectedCampaign.name)
      setCurrentTotalLeads(campaignLeads.length)
      setCurrentSuccessCount(0)
      setCurrentFailedCount(0)
      setCurrentCampaignStatus('sending')
      setCampaignStartTime(new Date())

      // Definir estado de inicialização e mensagem profissional
      setIsInitializing(true)
      setCurrentLead({
        name: 'Iniciando processo de envio...',
        phone: 'Preparando campanha'
      })

      setShowProgressModal(true)
      toast({
        title: '🚀 Campanha Iniciada!',
        description: `Campanha "${selectedCampaign.name}" foi enviada para ${campaignLeads.length} leads. Acompanhe o progresso.`,
        variant: 'success'
      })

    } catch (error) {
      console.error('❌ [CAMPAIGN-SEND] Stack trace:', (error as Error).stack)

      toast({
        title: 'Erro ao enviar campanha',
        description: 'Erro inesperado ao enviar a campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  // Função para cancelar campanha
  const handleCancelCampaign = () => {

    setCurrentCampaignStatus('cancelled')

    // Aqui você pode adicionar lógica para cancelar no backend/N8N
    // Por enquanto, apenas muda o status local

    toast({
      title: 'Campanha Cancelada',
      description: 'A campanha foi cancelada com sucesso.',
      variant: 'default'
    })
  }

  // Função para fechar modal
  const handleCloseModal = () => {

    setShowProgressModal(false)
    setCurrentCampaignStatus('sending')
    setCurrentSuccessCount(0)
    setCurrentFailedCount(0)
    setCampaignStartTime(null)
  }

  // Conectar ao SSE quando modal estiver aberto e campanha estiver sendo enviada
  useEffect(() => {
    // Adicionar logs para debug de estado
    if (showProgressModal) {
      console.log('🔍 [SSE] Debug Estado:', {
        showProgressModal,
        status: currentCampaignStatus,
        campaignId: selectedCampaign?.id,
        campaignName: selectedCampaign?.name
      })
    }

    if (!showProgressModal || currentCampaignStatus !== 'sending' || !selectedCampaign?.id) {
      if (showProgressModal) {
        console.log('🔴 [SSE] Não conectando - Condições não atendidas')
      }
      return
    }

    // Usar URL relativa se VITE_BACKEND_URL não estiver definida (para usar o proxy do Vite)
    // Se estiver em produção, usar a URL definida ou leadbaze.io
    const baseUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://leadbaze.io' : '')
    const sseUrl = `${baseUrl}/api/campaign/status/stream/${selectedCampaign.id}`

    console.log('🟢 [SSE] Tentando conectar ao:', sseUrl)

    const eventSource = new EventSource(sseUrl)

    eventSource.onopen = () => {
      console.log('✅ [SSE] Conexão estabelecida com sucesso! ReadyState:', eventSource.readyState)
    }

    eventSource.onmessage = (event) => {
      // Log do evento bruto para debug
      // console.log('📨 [SSE] Mensagem bruta recebida:', event.data)

      try {
        const data = JSON.parse(event.data)

        // Ignorar heartbeats nos logs para não poluir
        if (data.type !== 'heartbeat') {
          console.log('📦 [SSE] Evento processado:', data.type, data)
        }

        if (data.type === 'progress') {
          // Sair do estado de inicialização
          if (isInitializing) setIsInitializing(false)

          // Atualizar estados locais
          setCurrentSuccessCount(data.data.successCount || 0)
          setCurrentFailedCount(data.data.failedCount || 0)

          // Priorizar o lead atual enviado pelo SSE
          if (data.data.currentLead) {
            setCurrentLead({
              name: data.data.currentLead.name,
              phone: data.data.currentLead.phone
            })
          }
          // Se não tem lead atual mas tem progresso, tentar estimar
          else if (data.data.progress > 0 && campaignLeads.length > 0) {
            const totalLeads = campaignLeads.length
            const processedLeads = Math.floor((data.data.progress / 100) * totalLeads)
            const currentLeadIndex = Math.min(processedLeads, totalLeads - 1)

            if (campaignLeads[currentLeadIndex]) {
              const currentLead = campaignLeads[currentLeadIndex]
              setCurrentLead({
                name: currentLead.name || 'Lead',
                phone: currentLead.phone || '(11) ...'
              })
            }
          }
        } else if (data.type === 'complete') {
          console.log('🎉 [SSE] Campanha concluída via evento!')
          setCurrentCampaignStatus('completed')
          setCurrentSuccessCount(data.data.successCount || 0)
          setCurrentFailedCount(data.data.failedCount || 0)

          toast({
            title: '🎉 Campanha Concluída!',
            description: `Finalizada: ${data.data.successCount} sucessos, ${data.data.failedCount} falhas.`,
            variant: 'success'
          })

          // Fechar conexão
          eventSource.close()
        }
      } catch (error) {
        console.error('❌ [SSE] Erro ao processar mensagem:', error)
      }
    }

    eventSource.onerror = (error) => {
      // Não logar erro apenas se for fechamento normal
      if (eventSource.readyState !== EventSource.CLOSED) {
        console.error('❌ [SSE] Erro na conexão:', error)
        console.error('❌ [SSE] ReadyState:', eventSource.readyState)
      }
    }

    return () => {
      console.log('🔌 [SSE] Fechando conexão (cleanup)')
      eventSource.close()
    }
  }, [showProgressModal, currentCampaignStatus, selectedCampaign?.id])
  // Renderizar conteúdo baseado no estado
  const renderContent = () => {
    switch (currentState) {
      case 'campaigns':
        return (
          <CampaignManager
            onEditCampaign={handleEditCampaign}
            onConfigClick={handleConfigClick}
            connectedInstance={connectedInstance}
            lists={lists}
          />
        )

      case 'create':
        return (
          <CampaignWizard
            campaign={null}
            lists={lists}
            whatsappConfig={whatsappConfig}
            connectedInstance={connectedInstance}
            onBack={handleBackToCampaigns}
            onSendCampaign={handleSendCampaign}
            onStepChange={handleWizardStepChange}
          />
        )

      case 'edit':
        return selectedCampaign ? (
          <CampaignWizard
            campaign={selectedCampaign}
            lists={lists}
            whatsappConfig={whatsappConfig}
            connectedInstance={connectedInstance}
            onBack={handleBackToCampaigns}
            onSendCampaign={handleSendCampaign}
            onStepChange={handleWizardStepChange}
            onCampaignCreated={handleEditCampaign}
          />
        ) : null

      case 'config':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentState('campaigns')}
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-primary">Configurações</h1>
            </div>

            <WhatsAppConnection

              userId={user?.id}
              userName={user?.email}
              onConnectionSuccess={handleConnectionSuccess}
              onConnectionError={handleConnectionError}
              onDisconnect={handleDisconnect}
            />
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <motion.div

          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <div className="w-full h-full rounded-full border-4" style={{ borderColor: '#b7c7c1', borderTopColor: '#00ff00' }}></div>
          </motion.div>
          <motion.p

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-gray-600 dark:text-gray-400"
          >
            Carregando Disparador...
          </motion.p>
          <motion.p

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500 dark:text-gray-500 mt-2"
          >
            Preparando suas campanhas
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'disparador-bg-escuro' : 'disparador-bg-claro'} disparador-transition`}>
      {/* Header */}
      <div className="py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div

            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl"
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                  <div className="space-y-3 lg:space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center space-x-2 sm:space-x-3"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white truncate">
                          Disparador Em Massa
                        </h1>
                        <p className="text-white/90 text-xs sm:text-sm md:text-base truncate">
                          {user?.user_metadata?.name || user?.email}
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
                    >
                      Envie mensagens personalizadas para todos os seus leads via WhatsApp de uma só vez!
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center sm:justify-end"
                  >
                    <motion.div

                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                    >
                      <div className="text-xs sm:text-sm text-white/80 mb-1">Status WhatsApp</div>
                      <div className="text-base sm:text-lg font-semibold flex items-center space-x-2">
                        {connectedInstance ? (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            </motion.div>
                            <span className="text-white text-sm sm:text-base">Conectado</span>
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            </motion.div>
                            <span className="text-white text-sm sm:text-base">Aguardando</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-white/70 mt-1">
                        {connectedInstance ? 'Pronto para enviar campanhas' : 'Configure sua instância'}
                      </div>
                    </motion.div>

                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Voltar para Dashboard */}
          <motion.div

            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="group text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 sm:px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">Voltar para Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </span>
            </Button>
          </motion.div>

          {/* Voltar para Campanhas - Só aparece quando criando/editando campanha */}
          {(currentState === 'create' || currentState === 'edit') && (
            <motion.div

              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToCampaigns}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="font-semibold text-sm sm:text-base">
                  <span className="hidden sm:inline">Voltar para Campanhas</span>
                  <span className="sm:hidden">Campanhas</span>
                </span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Indicador de Estado */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {currentState === 'create' || currentState === 'edit' ? (
            // Indicador para Criação/Edição de Campanha
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${currentWizardStep === 'lists'

                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600'

                  : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                <span className={`text-sm sm:text-base font-semibold ${currentWizardStep === 'lists'

                  ? 'text-indigo-600 dark:text-indigo-400'

                  : 'text-gray-600 dark:text-gray-400'
                  }`}>
                  <span className="hidden sm:inline">Criar/Editar Campanha</span>
                  <span className="sm:hidden">Campanha</span>
                </span>
              </div>

              <div className="hidden sm:block w-8 lg:w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="sm:hidden w-8 h-px bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${currentWizardStep === 'message'

                  ? 'bg-gradient-to-r from-purple-500 to-pink-600'

                  : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                <span className={`text-sm sm:text-base font-semibold ${currentWizardStep === 'message'

                  ? 'text-purple-600 dark:text-purple-400'

                  : 'text-gray-600 dark:text-gray-400'
                  }`}>
                  Mensagem
                </span>
              </div>

              <div className="hidden sm:block w-8 lg:w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="sm:hidden w-8 h-px bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${currentWizardStep === 'review'

                  ? 'bg-gradient-to-r from-green-500 to-green-600'

                  : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                <span className={`text-sm sm:text-base font-semibold ${currentWizardStep === 'review'

                  ? 'text-green-700 dark:text-green-400'

                  : 'text-gray-600 dark:text-gray-400'
                  }`}>
                  <span className="hidden sm:inline">Revisão e Envio</span>
                  <span className="sm:hidden">Revisão</span>
                </span>
              </div>
            </div>
          ) : currentState === 'config' ? (
            // Indicador para Configurações
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">Configurações WhatsApp</span>
                  <span className="sm:hidden">Configurações</span>
                </span>
              </div>
            </div>
          ) : null}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de Progresso Simplificado */}
      <CampaignProgressModalSimple
        isVisible={showProgressModal}
        campaignName={currentCampaignName}
        totalLeads={currentTotalLeads}
        status={currentCampaignStatus}
        successCount={currentSuccessCount}
        failedCount={currentFailedCount}
        currentLead={currentLead}
        startTime={campaignStartTime || undefined}
        isInitializing={isInitializing}
        onCancel={handleCancelCampaign}
        onClose={handleCloseModal}
      />

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}
