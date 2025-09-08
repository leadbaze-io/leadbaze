import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Send, MessageSquare, Users, CheckCircle, AlertTriangle, Loader, ArrowLeft, Plus, FolderOpen, Trash2, Eye, ChevronUp, ChevronDown, List, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '../hooks/use-toast'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { WhatsAppInstanceService } from '../lib/whatsappInstanceService'
import { CampaignService } from '../lib/campaignService'
import { CampaignLeadsService } from '../lib/campaignLeadsService'
import { CampaignStatusServiceV2 } from '../lib/campaignStatusServiceV2'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import WhatsAppConnection from '../components/WhatsAppConnection'
import CampaignProgressModalV2 from '../components/CampaignProgressModalV2'
import { EvolutionApiService } from '../lib/evolutionApiService'
import type { LeadList, EvolutionAPIConfig, BulkCampaign, Lead, CampaignLead, UsedListSummary } from '../types'
import type { User } from '@supabase/supabase-js'

export default function DisparadorMassa() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<LeadList[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [message, setMessage] = useState('')
  
  // Função de debug removida - problema resolvido
  const [campaignName, setCampaignName] = useState('')
  const [whatsappConfig, setWhatsappConfig] = useState<EvolutionAPIConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'campaign' | 'config'>('campaign')
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null)
  
  
  
  
  // Novos estados para gerenciamento de campanhas
  const [campaigns, setCampaigns] = useState<BulkCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<BulkCampaign | null>(null)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [campaignLeads, setCampaignLeads] = useState<CampaignLead[]>([])
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([])
  const [newLeads, setNewLeads] = useState<Lead[]>([])
  const [showCampaignDetails, setShowCampaignDetails] = useState(false)
  
  // Estado para controlar listas utilizadas (usando nova estrutura)
  const [usedListsSummary, setUsedListsSummary] = useState<UsedListSummary[]>([])
  const [showUsedLists, setShowUsedLists] = useState(false)
  
  // Estado para seleção múltipla de leads
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  
  // Estado para controlar visualização expandida dos leads
  const [showAllLeads, setShowAllLeads] = useState(false)
  
  // Estado para controlar animação do botão de salvar
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados para controle de status da campanha
  const [isPollingStatus, setIsPollingStatus] = useState(false)
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null)
  
  // Estados para o modal de progresso
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [isProgressModalMinimized, setIsProgressModalMinimized] = useState(false)
  const [campaignStartTime, setCampaignStartTime] = useState<Date | null>(null)
  const [currentCampaignStatus, setCurrentCampaignStatus] = useState<'sending' | 'completed' | 'failed'>('sending')
  const [currentSuccessCount, setCurrentSuccessCount] = useState(0)
  const [currentFailedCount, setCurrentFailedCount] = useState(0)

  const loadData = useCallback(async () => {
    try {
      console.log('🚀 Iniciando loadData para usuário:', user?.id)
      const userLists = await LeadService.getUserLeadLists()
      setLists(userLists)
      
      // Carregar campanhas do usuário
      if (user) {
        const userCampaigns = await loadUserCampaigns()
        setCampaigns(userCampaigns)
        console.log('📋 Campanhas carregadas:', userCampaigns.length)
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
    if (user && !loading && !selectedCampaign) {
      loadData().catch(error => {
        console.error('Erro ao carregar dados:', error)
      })
    }
  }, [user, loading, loadData, selectedCampaign])

  // Cleanup do polling quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling()
      }
    }
  }, [stopPolling])

  // Removido salvamento automático para evitar conflitos
  // A mensagem será salva apenas quando o usuário clicar no botão ou sair do campo

  // Logs de debug removidos - problema resolvido

  // Função de teste removida - problema resolvido

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
          variant: 'success',
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
        variant: 'success',
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
  const handleSelectCampaign = async (campaign: BulkCampaign) => {
    console.log('📋 Selecionando campanha:', {
      id: campaign.id,
      name: campaign.name,
      message: campaign.message,
      messageLength: campaign.message?.length || 0
    })
    
    // Recarregar campanha do banco para garantir dados atualizados
    try {
      const freshCampaign = await CampaignService.getCampaign(campaign.id)
      if (freshCampaign) {
        console.log('🔄 Campanha recarregada do banco:', {
          id: freshCampaign.id,
          message: freshCampaign.message,
          messageLength: freshCampaign.message?.length || 0,
          originalMessage: campaign.message
        })
        setSelectedCampaign(freshCampaign)
        setMessage(freshCampaign.message || '')
        console.log('✅ Estado atualizado:', {
          selectedCampaignId: freshCampaign.id,
          messageState: freshCampaign.message || ''
        })
      } else {
        console.log('⚠️ Campanha não encontrada no banco, usando dados locais')
        setSelectedCampaign(campaign)
        setMessage(campaign.message || '')
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar campanha:', error)
      setSelectedCampaign(campaign)
      setMessage(campaign.message || '')
    }
    
    // Não carregar listas selecionadas - usuário deve escolher novamente
    setSelectedLists([])
    
    // Carregar leads da campanha usando nova estrutura
    try {
      const leads = await CampaignLeadsService.getCampaignLeads(campaign.id)
      setCampaignLeads(leads)
      
      // Carregar resumo das listas utilizadas
      const usedLists = await CampaignLeadsService.getUsedListsSummary(campaign.id)
      setUsedListsSummary(usedLists)
    } catch (error) {
      console.error('Erro ao carregar leads da campanha:', error)
      setCampaignLeads([])
      setUsedListsSummary([])
    }
    
    setShowCampaignDetails(true)
    setIsCreatingCampaign(false)
  }

  // Verificar leads duplicados (baseado PRINCIPALMENTE no telefone)
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
      campaignLeads
        .map(lead => (lead.lead_data.phone || '').replace(/\D/g, ''))
        .filter(phone => phone) // Apenas telefones válidos
    )

    const newLeads: Lead[] = []
    const duplicateLeads: Lead[] = []

    allSelectedLeads.forEach(lead => {
      const normalizedPhone = (lead.phone || '').replace(/\D/g, '')
      
      // Se tem telefone, verificar duplicata por telefone
      if (normalizedPhone) {
        if (existingPhones.has(normalizedPhone)) {
          duplicateLeads.push(lead)
        } else {
          newLeads.push(lead)
          existingPhones.add(normalizedPhone)
        }
      } else {
        // Se não tem telefone, verificar por nome + endereço (fallback)
        const normalizedName = (lead.name || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const normalizedAddress = (lead.address || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const fallbackKey = `${normalizedName}|${normalizedAddress}`
        
        // Verificar se já existe lead sem telefone com mesmo nome + endereço
        const existingFallback = campaignLeads.some(existing => {
          const existingPhone = (existing.lead_data.phone || '').replace(/\D/g, '')
          if (existingPhone) return false // Se tem telefone, não é fallback
          
          const existingName = (existing.lead_data.name || '').toLowerCase().trim().replace(/\s+/g, ' ')
          const existingAddress = (existing.lead_data.address || '').toLowerCase().trim().replace(/\s+/g, ' ')
          return `${existingName}|${existingAddress}` === fallbackKey
        })
        
        if (existingFallback) {
          duplicateLeads.push(lead)
        } else {
          newLeads.push(lead)
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

      // Usar nova estrutura robusta para adicionar leads
      for (const listId of selectedLists) {
        const list = lists.find(l => l.id === listId)
        if (list && list.leads) {
          const result = await CampaignLeadsService.addLeadsFromList(
            selectedCampaign.id,
            listId,
            list.leads
          )
          
          if (result.success) {
            // Recarregar leads da campanha
            const updatedLeads = await CampaignLeadsService.getCampaignLeads(selectedCampaign.id)
            setCampaignLeads(updatedLeads)
            
            // Recarregar resumo das listas utilizadas
            const updatedUsedLists = await CampaignLeadsService.getUsedListsSummary(selectedCampaign.id)
            setUsedListsSummary(updatedUsedLists)
          }
        }
      }

      // Atualizar campanha
      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        selected_lists: selectedLists,
        total_leads: await CampaignLeadsService.getCampaignLeadsCount(selectedCampaign.id),
        message: message
      })

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
      }
      
      // Limpar apenas a seleção de listas, mas manter os leads na campanha
      setSelectedLists([])
      setNewLeads([])
      setDuplicateLeads([])

      // Mostrar feedback
      if (duplicateLeads.length > 0) {
        toast({
          title: '✅ Leads adicionados com sucesso',
          description: `${newLeads.length} novos leads únicos adicionados. ${duplicateLeads.length} leads duplicados foram automaticamente ignorados.`,
          variant: 'success'
        })
      } else {
        toast({
          title: '✅ Leads adicionados com sucesso',
          description: `${newLeads.length} leads únicos foram adicionados à campanha.`,
          variant: 'success'
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

    console.log('💾 Salvando mensagem:', {
      campaignId: selectedCampaign.id,
      currentMessage: message,
      showToast
    })

    // Ativar animação apenas quando o usuário clica no botão
    if (showToast) {
      setIsSaving(true)
    }

    try {
      const messageToSave = message
      console.log('💾 Tentando salvar mensagem:', {
        messageToSave,
        messageLength: messageToSave.length
      })

      const updatedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
        message: messageToSave
      })

      console.log('✅ Campanha atualizada:', {
        id: updatedCampaign?.id,
        savedMessage: updatedCampaign?.message,
        originalMessage: message,
        messageChanged: updatedCampaign?.message !== message
      })

      // Verificar se a mensagem foi alterada durante o salvamento
      if (updatedCampaign?.message !== message) {
        console.warn('⚠️ ATENÇÃO: Mensagem foi alterada durante o salvamento!', {
          original: message,
          saved: updatedCampaign?.message,
          difference: updatedCampaign?.message !== message
        })
        
        // Tentar corrigir automaticamente (múltiplas tentativas)
        console.log('🔧 Tentando corrigir mensagem...')
        let attempts = 0
        const maxAttempts = 3
        
        while (attempts < maxAttempts) {
          try {
            attempts++
            console.log(`🔄 Tentativa ${attempts}/${maxAttempts}`)
            
            const correctedCampaign = await CampaignService.updateCampaign(selectedCampaign.id, {
              message: message
            })
            
            if (correctedCampaign?.message === message) {
              console.log('✅ Mensagem corrigida com sucesso!')
              setSelectedCampaign(correctedCampaign)
              setCampaigns(prev => prev.map(c => c.id === correctedCampaign.id ? correctedCampaign : c))
              break
            } else {
              console.warn(`⚠️ Tentativa ${attempts} falhou, mensagem ainda incorreta`)
              if (attempts < maxAttempts) {
                // Aguardar um pouco antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }
          } catch (error) {
            console.error(`❌ Erro na tentativa ${attempts}:`, error)
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        }
        
        if (attempts >= maxAttempts) {
          console.error('❌ Falha ao corrigir mensagem após múltiplas tentativas')
          toast({
            title: '⚠️ Problema detectado',
            description: 'A mensagem pode ter sido alterada por um trigger do banco. Tente salvar novamente.',
            variant: 'warning'
          })
        }
      }

      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c))
        
        // Forçar atualização da mensagem no estado local
        console.log('🔄 Verificando sincronização do estado:', {
          currentState: message,
          savedMessage: updatedCampaign.message,
          areEqual: updatedCampaign.message === message
        })
        
        // Sempre atualizar o estado com a mensagem salva para garantir sincronização
        setMessage(updatedCampaign.message)

        // Só mostra toast se solicitado (para evitar spam quando salva automaticamente)
        if (showToast) {
          toast({
            title: '✅ Mensagem salva com sucesso',
            description: 'Sua mensagem personalizada foi salva e está pronta para envio.',
            variant: 'success'
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
    } finally {
      // Desativar animação após um pequeno delay
      if (showToast) {
        setTimeout(() => {
          setIsSaving(false)
        }, 1000)
      }
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
    setUsedListsSummary([])
    clearLeadSelection() // Limpar seleção de leads também
    // NÃO limpar campaignLeads aqui - eles devem permanecer na campanha
  }

  const calculateTotalLeads = () => {
    return lists
      .filter(list => selectedLists.includes(list.id))
      .reduce((total, list) => total + list.total_leads, 0)
  }

  // Funções para seleção múltipla de leads
  const handleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(leadId)) {
        newSelection.delete(leadId)
      } else {
        newSelection.add(leadId)
      }
      return newSelection
    })
  }

  const handleSelectAllLeads = () => {
    if (selectedLeads.size === campaignLeads.length) {
      // Se todos estão selecionados, desmarcar todos
      setSelectedLeads(new Set())
    } else {
      // Selecionar todos
      setSelectedLeads(new Set(campaignLeads.map(lead => lead.id)))
    }
  }

  const handleRemoveSelectedLeads = async () => {
    if (!selectedCampaign || selectedLeads.size === 0) return

    if (!window.confirm(`Tem certeza que deseja remover ${selectedLeads.size} lead(s) selecionado(s) da campanha?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      // Usar nova estrutura robusta para remover leads
      const result = await CampaignLeadsService.removeSpecificLeads(
        selectedCampaign.id,
        Array.from(selectedLeads)
      )
      
      if (result.success) {
        // Recarregar leads da campanha
        const updatedLeads = await CampaignLeadsService.getCampaignLeads(selectedCampaign.id)
        setCampaignLeads(updatedLeads)
        
        // Recarregar resumo das listas utilizadas (para remover listas vazias)
        const updatedUsedLists = await CampaignLeadsService.getUsedListsSummary(selectedCampaign.id)
        console.log('🔍 DEBUG - Listas utilizadas após remoção:', updatedUsedLists)
        setUsedListsSummary(updatedUsedLists)
        
        // Limpar seleção
        setSelectedLeads(new Set())
        
        toast({
          title: '🗑️ Leads removidos',
          description: `${result.removed_leads} lead(s) foram removido(s) da campanha com sucesso.`,
          variant: 'warning'
        })
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao remover leads:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover leads da campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  // Função para remover uma lista inteira com todos os seus leads
  const handleRemoveList = async (listId: string) => {
    if (!selectedCampaign) return

    const list = lists.find(l => l.id === listId)
    if (!list) return

    if (!window.confirm(`Tem certeza que deseja remover todos os leads da lista "${list.name}" da campanha?\n\nIsso removerá ${list.total_leads} leads.`)) {
      return
    }

    try {
      // Usar nova estrutura robusta para remover leads da lista
      const result = await CampaignLeadsService.removeLeadsFromList(
        selectedCampaign.id,
        listId
      )
      
      if (result.success) {
        // Recarregar leads da campanha
        const updatedLeads = await CampaignLeadsService.getCampaignLeads(selectedCampaign.id)
        setCampaignLeads(updatedLeads)
        
        // Recarregar resumo das listas utilizadas
        const updatedUsedLists = await CampaignLeadsService.getUsedListsSummary(selectedCampaign.id)
        setUsedListsSummary(updatedUsedLists)
        
        toast({
          title: '🗑️ Lista removida',
          description: `${result.removed_leads} leads da lista "${list.name}" foram removidos da campanha com sucesso.`,
          variant: 'warning'
        })
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao remover lista:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover lista da campanha. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const clearLeadSelection = () => {
    setSelectedLeads(new Set())
  }

  // Função para iniciar o monitoramento de status em tempo real
  const startCampaignStatusMonitoring = (campaignId: string) => {
    console.log('🚀 [DisparadorMassa] Iniciando monitoramento de status para campanha:', campaignId);
    
    // Parar monitoramento anterior se existir
    if (stopPolling) {
      console.log('🛑 [DisparadorMassa] Parando monitoramento anterior...');
      stopPolling()
    }

    setIsPollingStatus(true)
    console.log('📊 [DisparadorMassa] Status de polling definido como true');

    const stopFunction = CampaignStatusServiceV2.startStatusTracking(
      campaignId,
      (progress) => {
        console.log('📊 [DisparadorMassa] ===== CALLBACK ONPROGRESS CHAMADO =====');
        console.log('📊 [DisparadorMassa] Progresso da campanha atualizado (tempo real):', progress)
        console.log('📊 [DisparadorMassa] progress.successCount:', progress.successCount);
        console.log('📊 [DisparadorMassa] progress.failedCount:', progress.failedCount);
        console.log('📊 [DisparadorMassa] progress.progress:', progress.progress);
        console.log('📊 [DisparadorMassa] progress.campaignId:', progress.campaignId);
        
        // Atualizar estados do modal de progresso
        console.log('🔄 [DisparadorMassa] Chamando setCurrentSuccessCount...');
        setCurrentSuccessCount(progress.successCount)
        console.log('🔄 [DisparadorMassa] Chamando setCurrentFailedCount...');
        setCurrentFailedCount(progress.failedCount)
        console.log('🔄 [DisparadorMassa] Estados atualizados - Sucesso:', progress.successCount, 'Falhas:', progress.failedCount)
        console.log('📊 [DisparadorMassa] ===== FIM CALLBACK ONPROGRESS =====');
      },
      (completion) => {
        console.log('✅ [DisparadorMassa] Campanha finalizada (tempo real):', completion)
        
        // Atualizar estados do modal de progresso
        setCurrentCampaignStatus(completion.status)
        setCurrentSuccessCount(completion.successCount)
        setCurrentFailedCount(completion.failedCount)
        
        // Atualizar campanha na lista
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { 
                ...c, 
                status: completion.status, 
                success_count: completion.successCount, 
                failed_count: completion.failedCount 
              }
            : c
        ))

        console.log('🎉 [DisparadorMassa] Campanha atualizada na lista com status:', completion.status)

        // Fechar o modal após um delay
        setTimeout(() => {
          console.log('⏰ [DisparadorMassa] Fechando modal após 3 segundos...');
          setShowProgressModal(false)
        }, 3000) // Fechar após 3 segundos
      },
      (status) => {
        console.log('📊 [DisparadorMassa] Status da campanha atualizado (tempo real):', status)
        
        // Atualizar campanha na lista
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { 
                ...c, 
                status: status.status, 
                success_count: status.success_count || 0, 
                failed_count: status.failed_count || 0 
              }
            : c
        ))
        console.log('🔄 [DisparadorMassa] Lista de campanhas atualizada com novo status:', status.status)
      }
    )

    setStopPolling(() => stopFunction)
  }

  // Funções para controlar o modal de progresso
  const handleMinimizeProgressModal = () => {
    setIsProgressModalMinimized(true)
  }

  const handleExpandProgressModal = () => {
    setIsProgressModalMinimized(false)
  }

  const handleCloseProgressModal = () => {
    setShowProgressModal(false)
    setIsProgressModalMinimized(false)
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

    if (campaignLeads.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma lista de leads à campanha antes de enviar',
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
      nome: (lead.lead_data.name || 'Sem nome').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      telefone: (() => {
        const phone = (lead.lead_data.phone || '').replace(/\D/g, '');
        return phone.startsWith('55') ? phone : `55${phone}`;
      })(),
      cidade: lead.lead_data.address || ''
    }))

    const payload = [{
      instance_name: instanceName || 'sem_instancia',
      mensagem: normalizedMessage,
      campaign_id: selectedCampaign?.id || 'temp-campaign-' + Date.now(),
      itens: selectedItems
    }]

    console.log('📦 Payload N8N:', payload)

    try {
      // PRIMEIRO: Mostrar modal e iniciar monitoramento SSE
      setShowProgressModal(true)
      setCampaignStartTime(new Date())
      setCurrentCampaignStatus('sending')
      setCurrentSuccessCount(0)
      setCurrentFailedCount(0)

      // SEGUNDO: Iniciar monitoramento SSE ANTES de enviar
      console.log('🔌 [DisparadorMassa] Iniciando SSE ANTES de enviar campanha...')
      startCampaignStatusMonitoring(selectedCampaign.id)

      // Aguardar mais tempo para garantir que SSE conecte e permaneça ativo
      await new Promise(resolve => setTimeout(resolve, 3000))

      // TERCEIRO: Agora enviar para N8N
      console.log('📤 [DisparadorMassa] Enviando campanha para N8N...')
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
        variant: 'success',
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
      description: 'Sua conta WhatsApp está ativa e pronta para enviar campanhas.',
      variant: 'success',
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
    })
  }

  const handleDisconnect = () => {
    console.log('🔄 WhatsApp desconectado, atualizando estado...')
    setConnectedInstance(null)
    setWhatsappConfig(null)
    toast({
      title: '🔄 WhatsApp Desconectado',
      description: 'Sua instância foi desconectada. Você pode conectar um novo número agora.',
      variant: 'warning',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
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
              <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Disparador em Massa</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Envie mensagens para suas listas de 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ml-1 md:ml-2">
                    Leads
                  </span>
                </h1>
                <p className="text-purple-100 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed">
                  Envie mensagens personalizadas para todos os seus leads via WhatsApp de uma só vez!
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-purple-200 mb-1">Status</div>
                  <div className="text-lg font-semibold">{connectedInstance ? 'WhatsApp Conectado' : 'Aguardando Conexão'}</div>
                  <div className="text-xs text-purple-300 mt-1">{connectedInstance ? 'Pronto para enviar campanhas' : 'Configure sua instância'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voltar para Dashboard */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
                : 'bg-card text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md border border-border'
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
                : 'bg-card text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md border border-border'
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
                      WhatsApp Conectado via QR Code!
                    </span>
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
                      <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Você ainda não possui campanhas
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Crie sua primeira campanha para começar
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="group p-4 md:p-5 border-2 border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer bg-card hover:bg-muted/30"
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
                                <p className="text-xs text-gray-600 dark:text-gray-400">
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
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                              title="Deletar campanha"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Informações da Campanha */}
                          <div className="space-y-3">
                            {/* Estatísticas */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 bg-muted/50 rounded-lg border border-border">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-foreground">{campaign.total_leads}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">leads</span>
                              </div>
                              
                              {/* Status Badge - FORMATO ESPECÍFICO SOLICITADO */}
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                campaign.status === 'draft' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' :
                                campaign.status === 'sending' ? 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800' :
                                campaign.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' :
                                campaign.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' :
                                'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
                              }`}>
                                {campaign.status === 'draft' ? '📝 Em Preparação' :
                                 campaign.status === 'sending' ? (isPollingStatus ? '🔄 Verificando...' : '📤 Enviando') :
                                 campaign.status === 'completed' ? '✅ Campanha Enviada com Sucesso!' :
                                 campaign.status === 'failed' ? '❌ Falhou' : '❓ Desconhecido'}
                              </div>
                            </div>

                            {/* Mensagem Preview */}
                            {campaign.message && (
                              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mensagem:</p>
                                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                  {campaign.message}
                                </p>
                              </div>
                            )}

                            {/* Indicador de Interação */}
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
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
                   
                   <div className="relative p-4 md:p-6">
                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                       {/* Lado Esquerdo - Nome e Status */}
                       <div className="flex items-start space-x-3 md:space-x-4">
                         <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
                           <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
                         </div>
                         <div className="space-y-2 min-w-0 flex-1">
                           <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-sm leading-tight">
                             {selectedCampaign.name}
                           </h1>
                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-white/90">
                              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/20">
                                <Users className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="text-xs md:text-sm font-medium">{campaignLeads.length} Leads</span>
                              </div>
                              <div className="hidden sm:block w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                              <div className="bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/20">
                                <span className="text-xs md:text-sm font-medium">
                                  {selectedCampaign.status === 'draft' ? 'Rascunho' : 
                                   selectedCampaign.status === 'sending' ? (isPollingStatus ? 'Verificando...' : 'Enviando') : 
                                   selectedCampaign.status === 'completed' ? 'Campanha Enviada com Sucesso!' : 
                                   selectedCampaign.status === 'failed' ? 'Falhou' :
                                   selectedCampaign.status}
                                </span>
                              </div>
                            </div>
                         </div>
                       </div>
                       
                       {/* Botão Voltar - Mobile e Desktop */}
                       <div className="flex items-center justify-end md:justify-start">
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
                           className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 px-3 md:px-4 py-2 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm md:text-base"
                         >
                           <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                           Voltar
                         </Button>
                       </div>
                     </div>
                   </div>
                 </div>

                {/* Grid Principal - Layout Profissional */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
                               .filter(list => !usedListsSummary.some(used => used.list_id === list.id))
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
                                     <p className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200">
                                       {campaignLeads.length}
                                     </p>
                                     <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                                       Leads Únicos
                                     </p>
                                     </div>
                                   </div>
                                   <div className="text-right">
                                     <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                                       ✓ Pronto
                                     </div>
                                   </div>
                                 </div>
                               </div>
                            
                                                                                      {/* Lista de Leads com Scroll Elegante */}
                             <div className="space-y-3">
                                                               {/* Botão para expandir/recolher lista */}
                                {campaignLeads.length > 15 && (
                                  <div className="text-center pb-2">
                                    <Button
                                      onClick={() => setShowAllLeads(!showAllLeads)}
                                      variant="outline"
                                      size="sm"
                                      className="disparador-fundo-claro dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disparador-texto-claro dark:text-gray-300"
                                    >
                                      {showAllLeads ? (
                                        <>
                                          <ChevronUp className="w-4 h-4 mr-2" />
                                          Mostrar Menos
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="w-4 h-4 mr-2" />
                                          Ver Todos os {campaignLeads.length} Leads
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}
                               
                                                               {/* Lista de leads com altura dinâmica */}
                                <div className={`overflow-y-auto space-y-3 pr-2 ${
                                  showAllLeads ? 'max-h-96' : 'max-h-80'
                                }`}>
                                  {(showAllLeads ? campaignLeads : campaignLeads.slice(0, 15)).map((lead, index) => (
                                    <div 
                                      key={lead.id} 
                                      className={`p-4 disparador-fundo-claro dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                        selectedLeads.has(lead.id)
                                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      }`}
                                      onClick={() => handleLeadSelection(lead.id)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                          <div className="flex items-center mt-1">
                                            <input
                                              type="checkbox"
                                              checked={selectedLeads.has(lead.id)}
                                              onChange={(e) => {
                                                e.stopPropagation()
                                                handleLeadSelection(lead.id)
                                              }}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-semibold disparador-texto-claro dark:text-white text-sm mb-1">
                                              {lead.lead_data.name}
                                            </p>
                                            {lead.lead_data.phone && (
                                              <p className="text-xs disparador-texto-claro dark:text-gray-300 mb-1">
                                                📱 {lead.lead_data.phone}
                                              </p>
                                            )}
                                            <p className="text-xs disparador-texto-claro dark:text-gray-400 leading-relaxed">
                                              📍 {lead.lead_data.address}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-xs disparador-texto-claro dark:text-gray-500 font-mono">
                                          #{index + 1}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                               
                               {/* Indicador de leads restantes quando não expandido */}
                               {!showAllLeads && campaignLeads.length > 15 && (
                                 <div className="text-center py-3">
                                   <div className="inline-flex items-center space-x-2 px-4 py-2 disparador-fundo-claro dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600">
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
                         {usedListsSummary.length > 0 && (
                           <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                             <Button
                               onClick={() => setShowUsedLists(!showUsedLists)}
                               variant="outline"
                               className="w-full disparador-fundo-claro dark:bg-gray-800 border-blue-200 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-700 disparador-texto-claro dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                             >
                               <Eye className="w-4 h-4 mr-2" />
                               {showUsedLists ? 'Ocultar' : 'Ver'} Listas Utilizadas ({usedListsSummary.length})
                               {showUsedLists ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                             </Button>
                             
                                                          {/* Modal/Dropdown com Listas Utilizadas */}
                              {showUsedLists && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 max-h-60 overflow-y-auto space-y-2 p-4 disparador-fundo-claro dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                  <h4 className="font-semibold disparador-texto-claro dark:text-gray-200 text-sm mb-3 flex items-center">
                                    <List className="w-4 h-4 mr-2" />
                                    Listas já utilizadas nesta campanha:
                                  </h4>
                                                                    {usedListsSummary.map((usedList) => (
                                       <div key={usedList.list_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 disparador-fundo-claro dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                         <div className="flex items-center space-x-3">
                                           <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                                             <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                           </div>
                                           <div>
                                             <h4 className="font-medium disparador-texto-claro dark:text-gray-100 text-sm">
                                               {usedList.list_name}
                                             </h4>
                                             <p className="text-xs disparador-texto-claro dark:text-gray-400">
                                               {usedList.leads_in_campaign} leads
                                             </p>
                                           </div>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                           <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                             ✓ Utilizada
                                           </div>
                                           <button
                                             onClick={() => handleRemoveList(usedList.list_id)}
                                             className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200"
                                             title={`Remover todos os leads da lista "${usedList.list_name}"`}
                                           >
                                             <Trash2 className="w-3 h-3" />
                                           </button>
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
                                console.log('📝 Textarea onChange:', {
                                  newValue: e.target.value,
                                  currentMessage: message,
                                  campaignId: selectedCampaign?.id
                                });
                                setMessage(e.target.value);
                              }}
                              onFocus={() => {
                                // Removido: não restaurar mensagem padrão automaticamente
                                // O usuário deve digitar sua própria mensagem
                              }}
                              onBlur={() => {
                                // Salvar quando o campo perder o foco (usuário terminar de digitar)
                                console.log('👁️ Textarea onBlur:', {
                                  message: message,
                                  hasMessage: !!message.trim(),
                                  campaignId: selectedCampaign?.id
                                });
                                // TEMPORARIAMENTE DESABILITADO PARA TESTE
                                // if (selectedCampaign && message.trim()) {
                                //   handleSaveMessage(false);
                                // }
                              }}
                            />
                            {/* Contador de Caracteres Elegante */}
                            <div className="absolute bottom-3 right-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                message.length > 800 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                  : message.length > 600 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
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
                            className={`w-full border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 hover:border-purple-300 dark:hover:border-purple-600 py-3 rounded-xl font-semibold transition-all duration-300 ${
                              isSaving 
                                ? 'animate-pulse btn-salvando-claro dark:btn-salvando-escuro scale-95' 
                                : 'hover:scale-105 active:scale-95'
                            }`}
                            disabled={!message.trim() || isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Salvar Mensagem
                              </>
                            )}
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

      {/* Botão Flutuante para Adicionar Leads */}
      {selectedLists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4 min-w-[280px] relative">
            <button
              onClick={() => setSelectedLists([])}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
            >
              ×
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {calculateTotalLeads()} Leads Selecionados
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedLists.length} lista{selectedLists.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => {
                  if (selectedLists.length === lists.length) {
                    setSelectedLists([])
                  } else {
                    setSelectedLists(lists.map(list => list.id))
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full border-purple-200 dark:border-purple-700 disparador-texto-claro dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Check className="w-4 h-4 mr-2" />
                {selectedLists.length === lists.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </Button>
              
              <Button
                onClick={handleUpdateCampaignLists}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Users className="w-4 h-4 mr-2" />
                Adicionar à Campanha
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Botão Flutuante para Remover Leads */}
      {selectedCampaign && campaignLeads.length > 0 && selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-700 p-4 min-w-[280px] relative">
            <button
              onClick={() => setSelectedLeads(new Set())}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
            >
              ×
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedLeads.size} Lead(s) Selecionado(s)
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Para remoção da campanha
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleSelectAllLeads}
                variant="outline"
                size="sm"
                className="w-full border-blue-200 dark:border-blue-700 disparador-texto-claro dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Check className="w-4 h-4 mr-2" />
                {selectedLeads.size === campaignLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
              
              <Button
                onClick={handleRemoveSelectedLeads}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Selecionados
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Botão de Scroll para o Topo - aparece quando há muitas listas */}
      {lists.length > 5 && selectedLists.length === 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}

      {/* Modal de Progresso da Campanha V2 - Tempo Real */}
      <CampaignProgressModalV2
        isVisible={showProgressModal}
        campaignName={selectedCampaign?.name || 'Campanha'}
        totalLeads={campaignLeads.length}
        status={currentCampaignStatus}
        successCount={currentSuccessCount}
        failedCount={currentFailedCount}
        startTime={campaignStartTime || undefined}
        isMinimized={isProgressModalMinimized}
        onClose={handleCloseProgressModal}
        onMinimize={handleMinimizeProgressModal}
        onExpand={handleExpandProgressModal}
      />
    </div>
  )
}
