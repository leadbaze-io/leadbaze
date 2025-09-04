import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Send, MessageSquare, Users, CheckCircle, AlertTriangle, Loader, ArrowLeft, Plus, FolderOpen, Trash2, Eye, ChevronUp, ChevronDown, List, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '../hooks/use-toast'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { WhatsAppInstanceService } from '../lib/whatsappInstanceService'
import { CampaignService } from '../lib/campaignService'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import WhatsAppConnection from '../components/WhatsAppConnection'
import { EvolutionApiService } from '../lib/evolutionApiService'
import type { LeadList, EvolutionAPIConfig, BulkCampaign, Lead } from '../types'
import type { User } from '@supabase/supabase-js'

export default function DisparadorMassa() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<LeadList[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [whatsappConfig, setWhatsappConfig] = useState<EvolutionAPIConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'campaign' | 'config'>('campaign')
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null)
  
  // Mensagem de exemplo para restaurar quando o campo estiver vazio
  const defaultMessage = `Ex: Olá {nome}, temos uma proposta especial para você! 🚀

Estamos oferecendo condições exclusivas para novos clientes.

Entre em contato conosco para mais detalhes!`
  
  
  
  // Novos estados para gerenciamento de campanhas
  const [campaigns, setCampaigns] = useState<BulkCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [campaignLeads, setCampaignLeads] = useState<Lead[]>([])
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([])
  const [newLeads, setNewLeads] = useState<Lead[]>([])
  const [showCampaignDetails, setShowCampaignDetails] = useState(false)
  
  // Estado para controlar listas utilizadas
  const [usedLists, setUsedLists] = useState<string[]>([])
  const [showUsedLists, setShowUsedLists] = useState(false)

  const loadData = useCallback(async () => {
    try {
      console.log('🚀 Iniciando loadData para usuário:', user?.id)
      const userLists = await LeadService.getUserLeadLists()
      setLists(userLists)
      
      // Carregar campanhas do usuário
      if (user) {
        const userCampaigns = await loadUserCampaigns()
        setCampaigns(userCampaigns)
      }
      
      // Carregar instância WhatsApp do usuário
      if (user) {
        console.log('🔍 Carregando instância WhatsApp para usuário:', user.id)
        const instance = await WhatsAppInstanceService.getUserInstance(user.id)
        if (instance && instance.status === 'connected') {
          console.log('✅ Instância conectada carregada:', instance.instance_name)
          setConnectedInstance(instance.instance_name)
          setWhatsappConfig({
            id: instance.id,
            user_id: instance.user_id,
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze.io' : 'http://localhost:3001',
            api_key: '***',
            instance_name: instance.instance_name,
            whatsapp_number: instance.whatsapp_number || 'Conectado via QR Code',
            status: 'active',
            created_at: instance.created_at,
            updated_at: instance.updated_at
          })
        } else {
          console.log('ℹ️ Nenhuma instância conectada encontrada para o usuário')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar suas listas de leads',
        variant: 'destructive'
      })
    }
  }, [user])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        navigate('/login')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }
    checkAuth()
  }, [navigate])

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user && !loading) {
      loadData().catch(error => {
        console.error('Erro ao carregar dados:', error)
      })
    }
  }, [user, loading, loadData])

  // Salvar mensagem automaticamente com debounce inteligente
  useEffect(() => {
    if (!selectedCampaign || !message.trim()) return;

    const timeoutId = setTimeout(() => {
      handleSaveMessage(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [message, selectedCampaign]);

  // Carregar campanhas do usuário
  const loadUserCampaigns = async (): Promise<BulkCampaign[]> => {
    try {
      return await CampaignService.getUserCampaigns()
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
      return []
    }
  }

  // Criar nova campanha
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um nome para a campanha',
        variant: 'destructive'
      })
      return
    }

    try {
      const newCampaign = await CampaignService.createCampaign({
        user_id: user!.id,
        name: campaignName,
        message: '',
        selected_lists: [],
        total_leads: 0,
        status: 'draft',
        success_count: 0,
        failed_count: 0
      })

      if (newCampaign) {
        setCampaigns(prev => [newCampaign, ...prev])
        setSelectedCampaign(newCampaign)
        setCampaignName('')
        setIsCreatingCampaign(false)
        setShowCampaignDetails(true)
        // Limpar seleção de listas para nova campanha
        clearListSelection()

        toast({
          title: 'Campanha criada!',
          description: `Campanha "${newCampaign.name}" criada com sucesso.`,
        })
      } else {
        throw new Error('Falha ao criar campanha')
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao criar campanha',
        variant: 'destructive'
      })
    }
  }

  // Deletar campanha
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await CampaignService.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast({
        title: 'Campanha deletada!',
        description: 'A campanha foi deletada com sucesso.',
      });
      setSelectedCampaign(null);
      clearListSelection();
      setMessage('');
      setShowCampaignDetails(false);
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      toast({
        title: 'Erro ao deletar campanha',
        description: 'Erro ao deletar a campanha. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Selecionar campanha existente
  const handleSelectCampaign = (campaign: BulkCampaign) => {
    setSelectedCampaign(campaign)
    setMessage(campaign.message || '')
    // Não carregar listas selecionadas - usuário deve escolher novamente
    setSelectedLists([])
    setUsedLists([])
    setShowCampaignDetails(true)
    setIsCreatingCampaign(false)
  }

  // Verificar leads duplicados
  const checkDuplicateLeads = (selectedListIds: string[]): { newLeads: Lead[], duplicateLeads: Lead[] } => {
    if (!selectedCampaign) {
      return { newLeads: [], duplicateLeads: [] }
    }

    const allSelectedLeads: Lead[] = []
    selectedListIds.forEach(listId => {
      const list = lists.find(l => l.id === listId)
      if (list && list.leads) {
        allSelectedLeads.push(...list.leads)
      }
    })

    // Criar um Set com os telefones já existentes na campanha
    const existingPhones = new Set(
      campaignLeads.map(lead => lead.phone?.replace(/\D/g, '')).filter(Boolean)
    )

    const newLeads: Lead[] = []
    const duplicateLeads: Lead[] = []

    allSelectedLeads.forEach(lead => {
      const normalizedPhone = lead.phone?.replace(/\D/g, '')
      
      if (normalizedPhone && existingPhones.has(normalizedPhone)) {
        duplicateLeads.push(lead)
      } else {
        newLeads.push(lead)
        if (normalizedPhone) {
          existingPhones.add(normalizedPhone)
        }
      }
    })

    return { newLeads, duplicateLeads }
  }

  // Atualizar campanha com novas listas
  const handleUpdateCampaignLists = async () => {
    if (!selectedCampaign) return

    try {
      const { newLeads, duplicateLeads } = checkDuplicateLeads(selectedLists)
      
      setNewLeads(newLeads)
      setDuplicateLeads(duplicateLeads)
      setCampaignLeads(prev => [...prev, ...newLeads])

      // Atualizar campanha
      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        selected_lists: selectedLists,
        total_leads: campaignLeads.length + newLeads.length,
        message: message
      })

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
      }

      // Adicionar listas utilizadas ao estado
      setUsedLists(prev => [...new Set([...prev, ...selectedLists])])
      
      // Limpar apenas a seleção de listas, mas manter os leads na campanha
      setSelectedLists([])
      setNewLeads([])
      setDuplicateLeads([])

      // Mostrar feedback
      if (duplicateLeads.length > 0) {
        toast({
          title: 'Leads adicionados',
          description: `${newLeads.length} novos leads adicionados. ${duplicateLeads.length} leads duplicados ignorados.`,
        })
      } else {
        toast({
          title: 'Leads adicionados',
          description: `${newLeads.length} novos leads adicionados à campanha.`,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar leads à campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  // Salvar mensagem da campanha
  const handleSaveMessage = async (showToast = true) => {
    if (!selectedCampaign) return

    try {
      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        message: message
      })

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))

        // Só mostra toast se solicitado (para evitar spam quando salva automaticamente)
        if (showToast) {
          toast({
            title: 'Mensagem salva!',
            description: 'Mensagem da campanha foi salva com sucesso.',
          })
        }
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error)
      // Sempre mostra erro
      toast({
        title: 'Erro',
        description: 'Erro ao salvar mensagem da campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleListToggle = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
    
    // Limpar feedbacks quando seleção mudar
    setNewLeads([])
    setDuplicateLeads([])
  }
  
  // Função para limpar seleção de listas quando sair da edição
  const clearListSelection = () => {
    setSelectedLists([])
    setNewLeads([])
    setDuplicateLeads([])
    setUsedLists([])
    // NÃO limpar campaignLeads aqui - eles devem permanecer na campanha
  }

  const calculateTotalLeads = () => {
    return lists
      .filter(list => selectedLists.includes(list.id))
      .reduce((total, list) => total + list.total_leads, 0)
  }

  const handleSendCampaign = async () => {
    if (!selectedCampaign) {
      toast({
        title: 'Erro',
        description: 'Selecione uma campanha primeiro',
        variant: 'destructive'
      })
      return
    }

    if (selectedLists.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma lista',
        variant: 'destructive'
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite uma mensagem para enviar',
        variant: 'destructive'
      })
      return
    }

    if (!whatsappConfig && !connectedInstance) {
      toast({
        title: 'Erro',
        description: 'Conecte sua conta WhatsApp antes de enviar',
        variant: 'destructive'
      })
      return
    }

    // Montar payload para webhook
    const instanceName = connectedInstance || whatsappConfig?.instance_name
    const normalizedMessage = message
    
    // Usar leads da campanha (que já foram verificados para duplicatas)
    const selectedItems = campaignLeads.map(lead => ({
      nome: (lead.name || 'Sem nome').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      telefone: (() => {
        const phone = (lead.phone || '').replace(/\D/g, '');
        return phone.startsWith('55') ? phone : `55${phone}`;
      })(),
      cidade: lead.address || ''
    }))

    const payload = [{
      instance_name: instanceName || 'sem_instancia',
      mensagem: normalizedMessage,
      itens: selectedItems
    }]

    console.log('📦 Payload N8N:', payload)

    try {
      const result = await EvolutionApiService.dispatchCampaignToWebhook(payload)
      if (!result.success) {
        toast({
          title: 'Erro ao enviar campanha',
          description: result.error || 'Falha desconhecida ao enviar a campanha para processamento',
          variant: 'destructive'
        })
        return
      }

      // Atualizar status da campanha
      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        status: 'sending',
        sent_at: new Date().toISOString()
      })

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
      }

      toast({
        title: 'Campanha enviada!',
        description: `Campanha "${selectedCampaign.name}" enviada para processamento.`,
      })

      // Reset form
      setMessage('')
      clearListSelection()
      setShowCampaignDetails(false)
    } catch (error) {
      console.error('Erro ao enviar campanha:', error)
      toast({
        title: 'Erro ao enviar campanha',
        description: 'Erro inesperado ao enviar a campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
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
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze.io' : 'http://localhost:3001',
            api_key: '***',
            instance_name: instance.instance_name,
            whatsapp_number: instance.whatsapp_number || 'Conectado via QR Code',
            status: 'active',
            created_at: instance.created_at,
            updated_at: instance.updated_at
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados da instância:', error)
    }
    
    // Mensagem de sucesso profissional
    toast({
      title: '🎉 WhatsApp Conectado com Sucesso!',
      description: `Sua instância "${instanceName}" está ativa e pronta para enviar campanhas.`,
      className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800',
    })
    
    // Mudar para a aba de campanha após conectar
    setActiveTab('campaign')
  }

  const handleConnectionError = (error: string) => {
    console.error('Erro na conexão WhatsApp:', error)
    setConnectedInstance(null)
    setWhatsappConfig(null)
    
    // Mensagem de erro profissional e encorajadora
    toast({
      title: '⚠️ Falha na Conexão WhatsApp',
      description: 'Não foi possível conectar ao WhatsApp. Tente novamente em alguns minutos ou verifique sua conexão.',
      variant: 'destructive',
      className: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 dark:from-red-950 dark:to-pink-950 dark:border-red-800',
    })
  }

  const handleDisconnect = () => {
    console.log('🔄 WhatsApp desconectado, atualizando estado...')
    setConnectedInstance(null)
    setWhatsappConfig(null)
    toast({
      title: '🔄 WhatsApp Desconectado',
      description: 'Sua instância foi desconectada. Você pode conectar um novo número agora.',
      className: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 rounded-2xl p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.1
              }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  <Send className="w-4 h-4" />
                  <span>Disparador em Massa</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Envie mensagens para suas listas de 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ml-2">
                    Leads
                  </span>
                </h1>
                <p className="text-purple-100 text-lg max-w-2xl">
                  Envie mensagens personalizadas para todos os seus leads via WhatsApp de uma só vez!
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-purple-200 mb-1">Status</div>
                  <div className="text-lg font-semibold">{connectedInstance ? 'WhatsApp Conectado' : 'Aguardando Conexão'}</div>
                  <div className="text-xs text-purple-300 mt-1">{connectedInstance || 'Configure sua instância'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voltar para Dashboard */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Dashboard</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'campaign'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:text-foreground hover:shadow-md border border-border'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Nova Campanha
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-card text-muted-foreground hover:text-foreground hover:shadow-md border border-border'
            }`}
          >
            Configuração WhatsApp
          </button>
        </div>

        {activeTab === 'campaign' && (
          <div className="space-y-6">
            {/* Status da Configuração */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center space-x-3">
                {(() => {
                  console.log('🔍 Verificando estado na interface:', { connectedInstance, whatsappConfig: !!whatsappConfig })
                  return connectedInstance || whatsappConfig
                })() ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      WhatsApp conectado: {whatsappConfig?.whatsapp_number || 'Via QR Code'}
                    </span>
                    {connectedInstance && (
                      <span className="text-xs text-gray-500">
                        (Instância: {connectedInstance})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-600 font-medium">
                      Conecte sua conta WhatsApp para enviar campanhas
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('config')}
                      className="ml-auto bg-green-500 hover:bg-green-600 text-white border-green-600 hover:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Conectar WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Seleção/Criação de Campanha */}
            {!showCampaignDetails && (
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Gerenciar Campanhas
                </h2>

                {/* Criar Nova Campanha */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setIsCreatingCampaign(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Campanha
                    </Button>
                  </div>

                  {isCreatingCampaign && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newCampaignName" className="text-foreground font-medium">Nome da Campanha</Label>
                          <Input
                            id="newCampaignName"
                            placeholder="Ex: Promoção de Natal 2024"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCreateCampaign}
                            disabled={!campaignName.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            Criar Campanha
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCreatingCampaign(false)
                              setCampaignName('')
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Lista de Campanhas Existentes */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground">Campanhas Existentes</h3>
                  
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não possui campanhas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Crie sua primeira campanha para começar
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="group p-5 border-2 border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card hover:bg-muted/30"
                          onClick={() => handleSelectCampaign(campaign)}
                        >
                          {/* Header do Card */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-base leading-tight">{campaign.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(campaign.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Botão Deletar - SEMPRE VISÍVEL */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCampaign(campaign.id)
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200"
                              title="Deletar campanha"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Informações da Campanha */}
                          <div className="space-y-3">
                            {/* Estatísticas */}
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-foreground">{campaign.total_leads}</span>
                                <span className="text-xs text-muted-foreground">leads</span>
                              </div>
                              
                              {/* Status Badge - FORMATO ESPECÍFICO SOLICITADO */}
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                campaign.status === 'draft' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' :
                                campaign.status === 'sending' ? 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800' :
                                campaign.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' :
                                'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
                              }`}>
                                {campaign.status === 'draft' ? '📝 Em Preparação' :
                                 campaign.status === 'sending' ? '📤 Enviando' :
                                 campaign.status === 'completed' ? '✅ Concluída' : '❓ Desconhecido'}
                              </div>
                            </div>

                            {/* Mensagem Preview */}
                            {campaign.message && (
                              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Mensagem:</p>
                                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                  {campaign.message}
                                </p>
                              </div>
                            )}

                            {/* Indicador de Interação */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Clique para editar</span>
                              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detalhes da Campanha Selecionada */}
            {showCampaignDetails && selectedCampaign && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                                 {/* Header da Campanha - Design Clean e Compacto */}
                 <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 dark:from-purple-700 dark:via-pink-700 dark:to-purple-900 rounded-2xl shadow-xl border border-purple-200/20 dark:border-purple-700/30">
                   {/* Padrão de Fundo Sutil */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30"></div>
                   
                   <div className="relative p-6">
                     <div className="flex items-center justify-between">
                       {/* Lado Esquerdo - Nome e Status */}
                       <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                           <MessageSquare className="w-6 h-6 text-white" />
                         </div>
                         <div className="space-y-1">
                           <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                             {selectedCampaign.name}
                           </h1>
                                                       <div className="flex items-center space-x-3 text-white/90">
                              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">{campaignLeads.length} Leads</span>
                              </div>
                              <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                              <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                                <span className="text-sm font-medium">
                                  {selectedCampaign.status === 'draft' ? 'Rascunho' : 
                                   selectedCampaign.status === 'sending' ? 'Enviando' : 
                                   selectedCampaign.status === 'completed' ? 'Concluída' : 
                                   selectedCampaign.status}
                                </span>
                              </div>
                            </div>
                         </div>
                       </div>
                       
                                                                       {/* Lado Direito - Botão Voltar (apenas desktop) */}
                         <div className="hidden md:flex items-center">
                           <Button
                             variant="outline"
                             onClick={() => {
                               setShowCampaignDetails(false)
                               setSelectedCampaign(null)
                               setSelectedLists([])
                               setMessage('')
                               setCampaignLeads([])
                               setNewLeads([])
                               setDuplicateLeads([])
                             }}
                             className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 px-4 py-2 rounded-xl font-medium shadow-md hover:shadow-lg"
                           >
                             <ArrowLeft className="w-4 h-4 mr-2" />
                             Voltar
                           </Button>
                         </div>
                     </div>
                   </div>
                 </div>

                {/* Grid Principal - Layout Profissional */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Coluna 1: Gestão de Listas */}
                  <div className="xl:col-span-1 space-y-6">
                    {/* Seleção de Listas - Card Elegante */}
                    <div className="bg-card rounded-2xl shadow-xl border-2 border-gray-200 dark:border-border overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-800 dark:to-pink-800 p-6 border-b-2 border-purple-200 dark:border-purple-600">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-white flex items-center">
                          <Users className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                          Gestão de Listas
                        </h3>
                        <p className="text-purple-700 dark:text-purple-200 mt-2">
                          Selecione as listas de leads para sua campanha
                        </p>
                      </div>
                      
                      <div className="p-6">
                        {lists.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                                                         <p className="text-black dark:text-gray-300 mb-4 font-medium">
                               Você ainda não possui listas de leads
                             </p>
                            <Button 
                              onClick={() => navigate('/gerador')}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              Criar Primeira Lista
                            </Button>
                          </div>
                                                 ) : (
                           <div className="space-y-4">
                             {/* Filtrar apenas listas não utilizadas */}
                             {lists
                               .filter(list => !usedLists.includes(list.id))
                               .map((list) => {
                               const isSelected = selectedLists.includes(list.id);
                               return (
                                <div
                                  key={list.id}
                                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-500 dark:bg-blue-900 shadow-lg scale-105' 
                                      : 'border-gray-200 dark:border-border hover:border-blue-300 hover:bg-blue-500 dark:hover:border-blue-600 dark:hover:bg-blue-800'
                                  }`}
                                  onClick={() => handleListToggle(list.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 
                                        className={`font-semibold text-lg mb-1 ${
                                          isSelected 
                                            ? 'disparador-texto-hover' 
                                            : 'disparador-texto-claro dark:text-white'
                                        }`}
                                      >
                                        {list.name}
                                      </h4>
                                      <p 
                                        className={`font-medium ${
                                          isSelected 
                                            ? 'disparador-texto-hover' 
                                            : 'disparador-texto-claro dark:text-gray-300'
                                        }`}
                                      >
                                        {list.total_leads} leads
                                      </p>
                                      {list.description && (
                                        <p 
                                          className={`text-sm mt-2 leading-relaxed ${
                                            isSelected 
                                              ? 'disparador-texto-hover' 
                                              : 'disparador-texto-claro dark:text-gray-400'
                                          }`}
                                        >
                                          {list.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-500 scale-110' 
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                      {isSelected && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Resumo de Seleção */}
                            {selectedLists.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl border-2 border-purple-200 dark:border-purple-800"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <span className="font-semibold text-purple-800 dark:text-white">
                                      {calculateTotalLeads()} leads selecionados
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={handleUpdateCampaignLists}
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Adicionar à Campanha
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Feedback de Leads - Design Elegante */}
                        {(newLeads.length > 0 || duplicateLeads.length > 0) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 space-y-3"
                          >
                            {newLeads.length > 0 && (
                              <div className="p-4 bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">✓</span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-purple-800 dark:text-purple-200">
                                      {newLeads.length} novos leads adicionados
                                    </p>
                                    <p className="text-sm text-purple-600 dark:text-purple-300">
                                      Sucesso na importação
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {duplicateLeads.length > 0 && (
                              <div className="p-4 bg-pink-50 dark:bg-pink-900 border-2 border-pink-200 dark:border-pink-800 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">!</span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-pink-800 dark:text-pink-200">
                                      {duplicateLeads.length} leads duplicados ignorados
                                    </p>
                                    <p className="text-sm text-pink-600 dark:text-pink-300">
                                      Evitando duplicação
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Leads da Campanha */}
                  <div className="xl:col-span-1 space-y-6">
                    {/* Leads da Campanha - Card Profissional */}
                    <div className="bg-card rounded-2xl shadow-xl border-2 border-gray-200 dark:border-border overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-800 dark:to-pink-800 p-6 border-b-2 border-purple-200 dark:border-purple-600">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-white flex items-center">
                          <Users className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                          Leads da Campanha
                        </h3>
                        <p className="text-purple-700 dark:text-purple-200 mt-2">
                          Visualize e gerencie os leads selecionados
                        </p>
                      </div>
                      
                      <div className="p-6">
                        {campaignLeads.length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                            <p className="mb-2 font-medium disparador-texto-claro dark:text-gray-300">
                              Nenhum lead adicionado ainda
                            </p>
                            <p className="text-sm disparador-texto-claro dark:text-gray-400">
                              Selecione listas para adicionar leads à campanha
                            </p>
                            
                            
                          </div>
                        ) : (
                          <div className="space-y-4">
                                                                                       {/* Resumo Estatístico - Design Compacto e Responsivo */}
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <p className="text-base sm:text-lg font-bold text-purple-800 dark:text-purple-200">
                                        {campaignLeads.length}
                                      </p>
                                      <p className="text-xs text-purple-600 dark:text-purple-300">
                                        Leads
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                                      ✓ Pronto
                                    </div>
                                  </div>
                                </div>
                              </div>
                            
                            {/* Lista de Leads com Scroll Elegante */}
                            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                                                                                            {campaignLeads.slice(0, 15).map((lead, index) => (
                                 <div key={index} className="p-4 disparador-fundo-claro dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                   <div className="flex items-start justify-between">
                                     <div className="flex-1">
                                       <p className="font-semibold disparador-texto-claro dark:text-white text-sm mb-1">
                                         {lead.name}
                                       </p>
                                       {lead.phone && (
                                         <p className="text-xs disparador-texto-claro dark:text-gray-300 mb-1">
                                           📱 {lead.phone}
                                         </p>
                                       )}
                                       <p className="text-xs disparador-texto-claro dark:text-gray-400 leading-relaxed">
                                         📍 {lead.address}
                                       </p>
                                     </div>
                                     <div className="text-xs disparador-texto-claro dark:text-gray-500 font-mono">
                                       #{index + 1}
                                     </div>
                                   </div>
                                 </div>
                               ))}
                               {campaignLeads.length > 15 && (
                                 <div className="text-center py-4">
                                   <div className="inline-flex items-center space-x-2 px-4 py-2 disparador-fundo-claro dark:bg-gray-800 rounded-full">
                                     <span className="text-sm disparador-texto-claro dark:text-gray-300">
                                       ... e mais {campaignLeads.length - 15} leads
                                     </span>
                                   </div>
                                 </div>
                               )}
                            </div>
                          </div>
                        )}
                        
                        {/* Botão Listas Utilizadas */}
                        {usedLists.length > 0 && (
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Button
                              onClick={() => setShowUsedLists(!showUsedLists)}
                              variant="outline"
                              className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {showUsedLists ? 'Ocultar' : 'Ver'} Listas Utilizadas ({usedLists.length})
                              {showUsedLists ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                            </Button>
                            
                            {/* Modal/Dropdown com Listas Utilizadas */}
                            {showUsedLists && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 max-h-60 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                              >
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-3 flex items-center">
                                  <List className="w-4 h-4 mr-2" />
                                  Listas já utilizadas nesta campanha:
                                </h4>
                                {lists
                                  .filter(list => usedLists.includes(list.id))
                                  .map((list) => (
                                    <div key={list.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            {list.name}
                                          </h4>
                                          <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {list.total_leads} leads
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        ✓ Utilizada
                                      </div>
                                    </div>
                                  ))}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna 3: Configuração da Mensagem */}
                  <div className="xl:col-span-1 space-y-6">
                    {/* Configuração da Mensagem - Card Elegante */}
                    <div className="bg-card rounded-2xl shadow-xl border-2 border-gray-200 dark:border-border overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-800 dark:to-pink-800 p-6 border-b-2 border-purple-200 dark:border-purple-600">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-white flex items-center">
                          <MessageSquare className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                          Mensagem da Campanha
                        </h3>
                        <p className="text-purple-700 dark:text-purple-200 mt-2">
                          Configure sua mensagem personalizada
                        </p>
                      </div>
                      
                      <div className="p-6 space-y-6">
                                                 {/* Editor de Mensagem Profissional */}
                         <div className="space-y-4">
                                                       <Label htmlFor="message" className="disparador-texto-claro dark:text-white font-semibold text-base block mb-3">
                              Mensagem Personalizada
                            </Label>
                           <div className="relative">
                                                                                         <textarea
                                id="message"
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 resize-none transition-all duration-300 disparador-fundo-claro dark:bg-gray-800 disparador-texto-claro dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                               rows={8}
                              placeholder="Ex: Olá {nome}, temos uma proposta especial para você! 🚀

Estamos oferecendo condições exclusivas para novos clientes.

Entre em contato conosco para mais detalhes!"
                              value={message}
                              onChange={(e) => {
                                setMessage(e.target.value);
                              }}
                              onFocus={() => {
                                // Se a mensagem estiver vazia, restaurar o exemplo
                                if (!message.trim()) {
                                  setMessage(defaultMessage);
                                }
                              }}
                              onBlur={() => {
                                // Salvar quando o campo perder o foco (usuário terminar de digitar)
                                if (selectedCampaign && message.trim()) {
                                  handleSaveMessage(false);
                                }
                              }}
                            />
                            {/* Contador de Caracteres Elegante */}
                            <div className="absolute bottom-3 right-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                message.length > 800 
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                                  : message.length > 600 
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              }`}>
                                {message.length}/1000
                              </div>
                            </div>
                          </div>
                          
                          {/* Dicas de Personalização */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white font-bold text-xs">💡</span>
                              </div>
                              <div>
                                <p className="font-semibold text-purple-800 dark:text-white text-sm mb-2">
                                  Dicas de Personalização
                                </p>
                                <div className="space-y-1 text-xs text-purple-700 dark:text-purple-100">
                                  <p>• Use <code>{"{nome}"}</code> para incluir o nome do lead</p>
                                  <p>• Mantenha a mensagem clara e objetiva</p>
                                  <p>• Inclua uma chamada para ação</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação Profissionais */}
                        <div className="space-y-4 pt-4">
                          <Button 
                            onClick={() => handleSaveMessage(true)}
                            variant="outline"
                            className="w-full border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 hover:border-purple-300 dark:hover:border-purple-600 py-3 rounded-xl font-semibold transition-all duration-300"
                            disabled={!message.trim()}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Salvar Mensagem
                          </Button>
                          
                          <Button 
                            onClick={handleSendCampaign}
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            disabled={!message || campaignLeads.length === 0 || (!whatsappConfig && !connectedInstance)}
                          >
                            <Send className="w-5 h-5 mr-3" />
                            Enviar Campanha
                            <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                              {campaignLeads.length} leads
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Status da Conexão Atual */}
            {connectedInstance && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      WhatsApp Conectado
                    </h3>
                    <p className="text-sm text-green-700">
                      Instância: {connectedInstance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Componente de Conexão WhatsApp */}
            <WhatsAppConnection
              userId={user?.id}
              userName={user?.user_metadata?.full_name as string || user?.email?.split('@')[0]}
              onConnectionSuccess={handleConnectionSuccess}
              onConnectionError={handleConnectionError}
              onDisconnect={handleDisconnect}
            />



          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-8">
          <button 
            onClick={() => {
              navigate('/dashboard')
              // Scroll para o topo após navegação
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }, 100)
            }}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}
