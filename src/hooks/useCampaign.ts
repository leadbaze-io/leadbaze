/**
 * =====================================================
 * HOOK PARA GERENCIAMENTO DE CAMPANHAS
 * =====================================================
 */

import { useState, useEffect, useCallback } from 'react'
import { CampaignService } from '../lib/campaignService'
import { LeadDeduplicationService } from '../services/LeadDeduplicationService'
import type { BulkCampaign } from '../types'
import type { CampaignLead } from '../types/campaign'

interface UseCampaignProps {
  campaignId?: string
}

interface UseCampaignReturn {
  // Estado
  campaign: BulkCampaign | null
  leads: CampaignLead[]
  selectedLists: string[]
  ignoredLists: string[]
  availableLists: string[]
  stats: { totalLeads: number, uniqueLeads: number, selectedLists: number, ignoredLists: number }
  loading: boolean
  error: string | null

  // Ações
  createCampaign: (name: string, message?: string) => Promise<BulkCampaign>
  updateCampaign: (updates: Partial<BulkCampaign>) => Promise<void>
  deleteCampaign: () => Promise<void>
  addList: (listId: string, leads: any[]) => Promise<void>
  removeList: (listId: string) => Promise<void>
  ignoreList: (listId: string) => Promise<void>
  unignoreList: (listId: string) => Promise<void>
  refreshCampaign: () => Promise<void>
}

export const useCampaign = ({ campaignId }: UseCampaignProps): UseCampaignReturn => {
  // Estado
  const [campaign, setCampaign] = useState<BulkCampaign | null>(null)
  const [leads, setLeads] = useState<CampaignLead[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [ignoredLists, setIgnoredLists] = useState<string[]>([])
  const [availableLists] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estatísticas calculadas
  const stats = {
    totalLeads: leads.length,
    uniqueLeads: leads.length, // Já são únicos
    selectedLists: selectedLists.length,
    ignoredLists: ignoredLists.length,
    duplicates: 0,
    duplicatePercentage: 0
  }

  // Carregar campanha
  const loadCampaign = useCallback(async () => {
    if (!campaignId) return

    setLoading(true)
    setError(null)

    try {
      const [campaignData, leadsData, listsData] = await Promise.all([
        CampaignService.getCampaign(campaignId),
        CampaignService.getCampaignLeads(campaignId),
        CampaignService.getCampaignLists(campaignId)
      ])

      if (campaignData) {
        // Log removido para limpeza

        // Verificar consistência: se há leads mas não há listas selecionadas,
        // pode ser um problema de sincronização
        if (leadsData.length > 0 && listsData.selected.length === 0) {

          // Filtrar leads que não têm lista associada válida
          const validLeads = leadsData.filter(lead => lead.listId)
          console.log('🔍 Leads válidos (com listId):', validLeads.length)

          setLeads(validLeads)
        } else {
          setLeads(leadsData)
        }

        setCampaign(campaignData)
        setSelectedLists(listsData.selected)
        setIgnoredLists(listsData.ignored)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanha')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  // Carregar campanha na inicialização (apenas uma vez)
  useEffect(() => {
    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId]) // Apenas quando campaignId muda

  // Criar campanha
  const createCampaign = useCallback(async (name: string, message?: string): Promise<BulkCampaign> => {
    setLoading(true)
    setError(null)

    try {
      const newCampaign = await CampaignService.createCampaign({
        name,
        message: message || '',
        status: 'draft',
        selected_lists_count: 0,
        ignored_lists_count: 0,
        total_leads: 0,
        unique_leads: 0,
        duplicates_count: 0,
        success_count: 0,
        failed_count: 0,
        user_id: '' // Será preenchido pelo CampaignService
      })

      setCampaign(newCampaign)
      return newCampaign!
    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar campanha'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar campanha
  const updateCampaign = useCallback(async (updates: Partial<BulkCampaign>): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      const updatedCampaign = await CampaignService.updateCampaign(campaign.id, updates)

      // SOLUÇÃO CONSERVADORA: Não atualizar o estado campaign após updateCampaign
      // para evitar que o useEffect no CampaignWizard sobrescreva a mensagem editada
      // setCampaign(updatedCampaign) // Comentado para preservar estado local

      // Apenas atualizar campos de sistema que não afetam a UI
      if (updatedCampaign) {
        setCampaign(prev => prev ? {
          ...prev,
          updated_at: updatedCampaign.updated_at,
          status: updatedCampaign.status
        } : updatedCampaign)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar campanha'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign])

  // Deletar campanha
  const deleteCampaign = useCallback(async (): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      await CampaignService.deleteCampaign(campaign.id)
      setCampaign(null)
      setLeads([])
      setSelectedLists([])
      setIgnoredLists([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar campanha'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign])

  // Adicionar lista
  const addList = useCallback(async (listId: string, listLeads: any[]): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      // Deduplicar leads da lista
      const uniqueLeads = LeadDeduplicationService.deduplicateLeads(listLeads, listId)

      // Adicionar leads únicos à campanha
      await CampaignService.addLeadsToCampaign(campaign.id, uniqueLeads)

      // Atualizar listas selecionadas
      const newSelectedLists = [...selectedLists, listId]
      const newIgnoredLists = ignoredLists.filter(id => id !== listId)

      await CampaignService.updateCampaignLists(campaign.id, newSelectedLists, newIgnoredLists)

      // Atualizar estado local
      setSelectedLists(newSelectedLists)
      setIgnoredLists(newIgnoredLists)
      setLeads(prev => LeadDeduplicationService.addLeadsWithDeduplication(prev, uniqueLeads))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar lista'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign, selectedLists, ignoredLists])

  // Remover lista
  const removeList = useCallback(async (listId: string): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      // Remover leads da lista
      const leadsToRemove = leads.filter(lead => lead.listId === listId)
      const phoneHashes = leadsToRemove.map(lead => lead.phoneHash)

      await CampaignService.removeLeadsFromCampaign(campaign.id, phoneHashes)

      // Atualizar listas
      const newSelectedLists = selectedLists.filter(id => id !== listId)
      const newIgnoredLists = ignoredLists.filter(id => id !== listId)

      await CampaignService.updateCampaignLists(campaign.id, newSelectedLists, newIgnoredLists)

      // Atualizar estado local
      setSelectedLists(newSelectedLists)
      setIgnoredLists(newIgnoredLists)
      setLeads(prev => LeadDeduplicationService.removeLeadsByList(prev, listId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover lista'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign, leads, selectedLists, ignoredLists])

  // Ignorar lista
  const ignoreList = useCallback(async (listId: string): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      // Remover da selecionada e adicionar à ignorada
      const newSelectedLists = selectedLists.filter(id => id !== listId)
      const newIgnoredLists = [...ignoredLists, listId]

      await CampaignService.updateCampaignLists(campaign.id, newSelectedLists, newIgnoredLists)

      // Atualizar estado local
      setSelectedLists(newSelectedLists)
      setIgnoredLists(newIgnoredLists)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao ignorar lista'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign, selectedLists, ignoredLists])

  // Designorar lista
  const unignoreList = useCallback(async (listId: string): Promise<void> => {
    if (!campaign) return

    setLoading(true)
    setError(null)

    try {
      // Remover da ignorada
      const newIgnoredLists = ignoredLists.filter(id => id !== listId)

      await CampaignService.updateCampaignLists(campaign.id, selectedLists, newIgnoredLists)

      // Atualizar estado local
      setIgnoredLists(newIgnoredLists)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao designorar lista'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [campaign, selectedLists, ignoredLists])

  // Atualizar campanha
  const refreshCampaign = useCallback(async (): Promise<void> => {
    await loadCampaign()
  }, [loadCampaign])

  return {
    // Estado
    campaign,
    leads,
    selectedLists,
    ignoredLists,
    availableLists,
    stats,
    loading,
    error,

    // Ações
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addList,
    removeList,
    ignoreList,
    unignoreList,
    refreshCampaign
  }
}
