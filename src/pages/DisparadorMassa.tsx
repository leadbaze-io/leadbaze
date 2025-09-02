import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, MessageSquare, Settings, Users, CheckCircle, AlertTriangle, Loader, ArrowLeft, Plus, FolderOpen } from 'lucide-react'
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
import type { LeadList, EvolutionAPIConfig, BulkCampaign, Lead, User } from '../types'

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
  
  // Novos estados para gerenciamento de campanhas
  const [campaigns, setCampaigns] = useState<BulkCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [campaignLeads, setCampaignLeads] = useState<Lead[]>([])
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([])
  const [newLeads, setNewLeads] = useState<Lead[]>([])
  const [showCampaignDetails, setShowCampaignDetails] = useState(false)

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
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze-backend.onrender.com' : 'http://localhost:3001',
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

  // Selecionar campanha existente
  const handleSelectCampaign = (campaign: BulkCampaign) => {
    setSelectedCampaign(campaign)
    setMessage(campaign.message || '')
    setSelectedLists(campaign.selected_lists || [])
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

      // Limpar seleção após adicionar
      setSelectedLists([])

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
  const handleSaveMessage = async () => {
    if (!selectedCampaign) return

    try {
      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        message: message
      })

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))

        toast({
          title: 'Mensagem salva!',
          description: 'Mensagem da campanha foi salva com sucesso.',
        })
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error)
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
      setSelectedLists([])
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

  const handleSaveWhatsAppConfig = async () => {
    // TODO: Implementar salvamento da configuração do WhatsApp
    toast({
      title: 'Configuração Salva!',
      description: 'Sua configuração do WhatsApp foi salva com sucesso.',
    })
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
            api_url: process.env.NODE_ENV === 'production' ? 'https://leadbaze-backend.onrender.com' : 'http://localhost:3001',
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
    
    // Mudar para a aba de campanha após conectar
    setActiveTab('campaign')
  }

  const handleConnectionError = (error: string) => {
    console.error('Erro na conexão WhatsApp:', error)
    setConnectedInstance(null)
    setWhatsappConfig(null)
  }

  const handleDisconnect = () => {
    console.log('🔄 WhatsApp desconectado, atualizando estado...')
    setConnectedInstance(null)
    setWhatsappConfig(null)
    toast({
      title: 'WhatsApp Desconectado',
      description: 'Você pode conectar um novo número agora.',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-3">
                  <Send className="w-4 h-4" />
                  <span>Disparador em Massa</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Envie mensagens para suas listas de Leads
                </h1>
                <p className="text-purple-100 text-base max-w-2xl font-medium">
                  Envie mensagens personalizadas para todos os seus Leads de uma só vez!
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <div className="text-sm text-purple-200">Logado como</div>
                  <div className="font-semibold">{user?.user_metadata?.name || user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'campaign'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:text-blue-600 hover:shadow-md border border-gray-200'
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
                : 'bg-white text-gray-600 hover:text-blue-600 hover:shadow-md border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuração WhatsApp
          </button>
        </div>

        {activeTab === 'campaign' && (
          <div className="space-y-6">
            {/* Status da Configuração */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
                      className="ml-auto"
                    >
                      Conectar WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Seleção/Criação de Campanha */}
            {!showCampaignDetails && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Gerenciar Campanhas
                </h2>

                {/* Criar Nova Campanha */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setIsCreatingCampaign(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
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
                          <Label htmlFor="newCampaignName" className="text-gray-700 font-medium">Nome da Campanha</Label>
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
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                  <h3 className="text-lg font-medium mb-4 text-gray-700">Campanhas Existentes</h3>
                  
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        Você ainda não possui campanhas
                      </p>
                      <p className="text-sm text-gray-400">
                        Crie sua primeira campanha para começar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                          onClick={() => handleSelectCampaign(campaign)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                              <p className="text-sm text-gray-500">
                                {campaign.total_leads} leads • Status: {campaign.status}
                              </p>
                              <p className="text-xs text-gray-400">
                                Criada em: {new Date(campaign.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status}
                              </span>
                              <FolderOpen className="w-4 h-4 text-gray-400" />
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
                className="space-y-6"
              >
                {/* Header da Campanha */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedCampaign.name}</h2>
                      <p className="text-blue-100">
                        {campaignLeads.length} leads na campanha • Status: {selectedCampaign.status}
                      </p>
                    </div>
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
                      className="text-white border-white hover:bg-white hover:text-blue-600"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </div>

                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Seleção de Listas */}
                   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Adicionar Listas
                    </h3>
                    
                    {lists.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          Você ainda não possui listas de leads
                        </p>
                        <Button 
                          onClick={() => navigate('/gerador')}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        >
                          Criar primeira lista
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lists.map((list) => (
                          <div
                            key={list.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedLists.includes(list.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleListToggle(list.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{list.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {list.total_leads} leads
                                </p>
                                {list.description && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {list.description}
                                  </p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedLists.includes(list.id)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedLists.includes(list.id) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {selectedLists.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-blue-800 font-medium">
                                {calculateTotalLeads()} leads selecionados
                              </p>
                            </div>
                            <Button
                              onClick={handleUpdateCampaignLists}
                              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                            >
                              Adicionar à Campanha
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback de Leads */}
                    {(newLeads.length > 0 || duplicateLeads.length > 0) && (
                      <div className="mt-4 space-y-2">
                        {newLeads.length > 0 && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm">
                              ✅ {newLeads.length} novos leads adicionados
                            </p>
                          </div>
                        )}
                        {duplicateLeads.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">
                              ⚠️ {duplicateLeads.length} leads duplicados ignorados
                            </p>
                          </div>
                        )}
                      </div>
                                         )}
                   </div>

                   {/* Leads da Campanha */}
                   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                     <h3 className="text-xl font-semibold mb-4 flex items-center">
                       <Users className="w-5 h-5 mr-2 text-green-600" />
                       Leads da Campanha
                     </h3>
                     
                     {campaignLeads.length === 0 ? (
                       <div className="text-center py-8">
                         <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                         <p className="text-gray-500 mb-4">
                           Nenhum lead adicionado ainda
                         </p>
                         <p className="text-sm text-gray-400">
                           Selecione listas para adicionar leads
                         </p>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                           <p className="text-green-800 font-medium">
                             {campaignLeads.length} leads na campanha
                           </p>
                         </div>
                         
                         <div className="max-h-64 overflow-y-auto space-y-2">
                           {campaignLeads.slice(0, 10).map((lead, index) => (
                             <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                               <p className="font-medium text-sm text-gray-900">{lead.name}</p>
                               <p className="text-xs text-gray-500">{lead.phone}</p>
                               <p className="text-xs text-gray-400">{lead.address}</p>
                             </div>
                           ))}
                           {campaignLeads.length > 10 && (
                             <p className="text-xs text-gray-500 text-center">
                               ... e mais {campaignLeads.length - 10} leads
                             </p>
                           )}
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Configuração da Mensagem */}
                   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                      Mensagem da Campanha
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message" className="text-gray-700 font-medium">Mensagem</Label>
                        <textarea
                          id="message"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none mt-1"
                          rows={6}
                          placeholder="Ex: Olá {nome}, temos uma proposta especial para você!"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {message.length}/1000 caracteres • Use {"{nome}"} para personalizar com o nome do lead
                        </p>
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button 
                          onClick={handleSaveMessage}
                          variant="outline"
                          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                          disabled={!message.trim()}
                        >
                          Salvar Mensagem
                        </Button>
                        
                        <Button 
                          onClick={handleSendCampaign}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          disabled={!message || campaignLeads.length === 0 || (!whatsappConfig && !connectedInstance)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Campanha ({campaignLeads.length} leads)
                        </Button>
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
              userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              onConnectionSuccess={handleConnectionSuccess}
              onConnectionError={handleConnectionError}
              onDisconnect={handleDisconnect}
            />

            {/* Configuração Manual (Opcional) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Configuração Manual (Opcional)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiUrl" className="text-gray-700 font-medium">URL da API</Label>
                    <Input
                      id="apiUrl"
                      placeholder="https://api.evolutionapi.com"
                      defaultValue={whatsappConfig?.api_url || ''}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apiKey" className="text-gray-700 font-medium">Chave da API</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Sua chave da Evolution API"
                      defaultValue={whatsappConfig?.api_key || ''}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instanceName" className="text-gray-700 font-medium">Nome da Instância</Label>
                    <Input
                      id="instanceName"
                      placeholder="minha-instancia"
                      defaultValue={whatsappConfig?.instance_name || ''}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsappNumber" className="text-gray-700 font-medium">Número do WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="5531999887766"
                      defaultValue={whatsappConfig?.whatsapp_number || ''}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite apenas números (DDI + DDD + Número)
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">
                      Como configurar manualmente:
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>1. Tenha uma instância ativa da Evolution API</li>
                      <li>2. Obtenha a URL e chave da API</li>
                      <li>3. Configure uma instância no painel</li>
                      <li>4. Conecte seu WhatsApp via QR Code</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleSaveWhatsAppConfig} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Salvar Configuração Manual
                  </Button>
                </div>
              </div>
            </div>
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