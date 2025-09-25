import { useState, useEffect, useCallback } from 'react'
import { CampaignService } from '../lib/campaignService'
import type { BulkCampaign, CampaignLead, LeadList } from '../types'

interface UseCampaignStateProps {
  campaign: BulkCampaign | null
  lists: LeadList[]
}

interface UseCampaignStateReturn {
  // Estados
  selectedLists: string[]
  ignoredLists: string[]
  campaignLeads: CampaignLead[]
  message: string
  isLoading: boolean
  isSaving: boolean

  // Ações
  updateSelectedLists: (lists: string[]) => Promise<void>
  updateIgnoredLists: (lists: string[]) => Promise<void>
  updateMessage: (message: string) => Promise<void>
  updateCampaignLeads: (leads: CampaignLead[]) => Promise<void>
  handleListStateChange: (listId: string, action: 'select' | 'deselect' | 'ignore' | 'unignore') => Promise<void>
  refreshCampaign: () => Promise<void>
  saveCampaign: () => Promise<void>
}

export function useCampaignState({ campaign, lists: _lists }: UseCampaignStateProps): UseCampaignStateReturn {
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [ignoredLists, setIgnoredLists] = useState<string[]>([])
  const [campaignLeads, setCampaignLeads] = useState<CampaignLead[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Carregar dados da campanha quando ela muda
  const loadCampaignData = useCallback(async () => {
    if (!campaign) {
      setSelectedLists([])
      setIgnoredLists([])
      setCampaignLeads([])
      setMessage('')
      return
    }

    setIsLoading(true)
    try {

      // Carregar dados atualizados da campanha
      const freshCampaign = await CampaignService.getCampaign(campaign.id)
      if (!freshCampaign) {

        return
      }
      // Carregar leads da campanha
      const leads = await CampaignService.getCampaignLeads(campaign.id)

      // Atualizar estados - carregar listas da tabela campaign_lists
      const campaignLists = await CampaignService.getCampaignLists(campaign.id)
      setSelectedLists(campaignLists.selected || [])
      setIgnoredLists(campaignLists.ignored || [])
      setCampaignLeads(leads)
      setMessage(freshCampaign.message || '')
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }, [campaign])

  // Carregar dados quando a campanha muda
  useEffect(() => {
    loadCampaignData()
  }, [loadCampaignData])

  // Função para salvar a campanha
  const saveCampaign = useCallback(async () => {
    if (!campaign) return

    setIsSaving(true)
    try {
      // Salvar leads da campanha no banco
      await CampaignService.addLeadsToCampaign(campaign.id, campaignLeads)

      // Salvar dados da campanha
      await CampaignService.updateCampaign(campaign.id, {
        selected_lists_count: selectedLists.length,
        ignored_lists_count: ignoredLists.length,
        message: message
      })

    } catch (error) {

      throw error
    } finally {
      setIsSaving(false)
    }
  }, [campaign, selectedLists, ignoredLists, message, campaignLeads])

  // Função centralizada para mudanças de estado das listas
  const handleListStateChange = useCallback(async (listId: string, action: 'select' | 'deselect' | 'ignore' | 'unignore') => {
    let newSelectedLists = [...selectedLists]
    let newIgnoredLists = [...ignoredLists]

    switch (action) {
      case 'select':
        if (!newSelectedLists.includes(listId)) {
          newSelectedLists.push(listId)
        }
        newIgnoredLists = newIgnoredLists.filter(id => id !== listId)
        break

      case 'deselect':
        newSelectedLists = newSelectedLists.filter(id => id !== listId)
        newIgnoredLists = newIgnoredLists.filter(id => id !== listId)
        break

      case 'ignore':
        newSelectedLists = newSelectedLists.filter(id => id !== listId)
        if (!newIgnoredLists.includes(listId)) {
          newIgnoredLists.push(listId)
        }
        break

      case 'unignore':
        newIgnoredLists = newIgnoredLists.filter(id => id !== listId)
        break
    }

    // Atualizar estados locais
    setSelectedLists(newSelectedLists)
    setIgnoredLists(newIgnoredLists)
    // Os leads já foram salvos pelo updateCampaignLeads

    // Salvar dados da campanha
    await CampaignService.updateCampaign(campaign!.id, {
      selected_lists_count: newSelectedLists.length,
      ignored_lists_count: newIgnoredLists.length
    })
  }, [selectedLists, ignoredLists, campaign, campaignLeads.length])

  // Funções de atualização
  const updateSelectedLists = useCallback(async (lists: string[]) => {
    setSelectedLists(lists)
    await saveCampaign()
  }, [saveCampaign])

  const updateIgnoredLists = useCallback(async (lists: string[]) => {
    setIgnoredLists(lists)
    await saveCampaign()
  }, [saveCampaign])

  const updateMessage = useCallback(async (newMessage: string) => {
    setMessage(newMessage)
    await saveCampaign()
  }, [saveCampaign])

  const updateCampaignLeads = useCallback(async (leads: CampaignLead[]) => {
    setCampaignLeads(leads)

    // Salvar leads sempre que há uma campanha ativa (mesmo se 0 leads)
    if (campaign) {
      await CampaignService.addLeadsToCampaign(campaign.id, leads)
    }
  }, [campaign])

  const refreshCampaign = useCallback(async () => {
    await loadCampaignData()
  }, [loadCampaignData])

  return {
    // Estados
    selectedLists,
    ignoredLists,
    campaignLeads,
    message,
    isLoading,
    isSaving,

    // Ações
    updateSelectedLists,
    updateIgnoredLists,
    updateMessage,
    updateCampaignLeads,
    handleListStateChange,
    refreshCampaign,
    saveCampaign
  }
}
