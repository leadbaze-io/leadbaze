import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LeadService } from '../lib/leadService'
import { CACHE_KEYS, invalidateQueries, optimisticUpdates } from '../lib/queryClient'
import type { LeadList, Lead } from '../types'
import { useToast } from './use-toast'

// Hook para buscar todas as listas do usuário
export const useLeadLists = () => {
  return useQuery({
    queryKey: CACHE_KEYS.LEAD_LISTS,
    queryFn: LeadService.getUserLeadLists,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    select: (data: LeadList[]) => {
      // Ordenar por data de criação (mais recentes primeiro)
      return data.sort((a, b) =>

        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
  })
}

// Hook para buscar uma lista específica
export const useLeadList = (listId: string) => {
  return useQuery({
    queryKey: CACHE_KEYS.LEAD_LIST(listId),
    queryFn: () => LeadService.getLeadList(listId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: !!listId, // Só executa se listId existir
  })
}

// Hook para estatísticas de uma lista
export const useLeadListStats = (listId: string) => {
  return useQuery({
    queryKey: CACHE_KEYS.LEAD_LIST_STATS(listId),
    queryFn: async () => {
      const list = await LeadService.getLeadList(listId)
      if (!list) return null

      const leads = list.leads || []
      return {
        total_leads: leads.length,
        with_phone: leads.filter(lead => lead.phone).length,
        with_website: leads.filter(lead => lead.website).length,
        high_rating: leads.filter(lead => lead.rating && lead.rating >= 4).length,
        avg_rating: leads.reduce((sum, lead) => sum + (lead.rating || 0), 0) / leads.length || 0,
        categories: leads.reduce((acc, lead) => {
          const category = lead.business_type || 'Outros'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!listId,
  })
}

// Hook para salvar nova lista
export const useSaveLeadList = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ name, leads, description, tags, autoSyncToCRM }: {
      name: string
      leads: Lead[]
      description?: string
      tags?: string[]
      autoSyncToCRM?: boolean
    }) => {
      // Salvar a lista primeiro
      const savedList = await LeadService.saveLeadList(name, leads, description, tags)

      // Se auto-sync estiver habilitado, enviar para CRM
      if (autoSyncToCRM) {
        console.log('🔄 Auto-sync to CRM enabled, syncing leads...')
        try {
          // Importar dinamicamente para evitar circular dependency
          const { crmService } = await import('../services/crmService')
          await crmService.syncLeads(savedList.id, 'kommo')
          console.log('✅ Leads automatically synced to CRM')
        } catch (error) {
          console.error('❌ Failed to auto-sync to CRM:', error)
          // Não falha o salvamento se o sync falhar
          toast({
            title: "⚠️ Lista salva, mas sync falhou",
            description: "A lista foi salva com sucesso, mas não foi possível enviar ao CRM automaticamente.",
            variant: 'default',
          })
        }
      }

      return savedList
    },

    onMutate: async ({ name, leads }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.LEAD_LISTS })

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData(CACHE_KEYS.LEAD_LISTS)

      // Optimistically update with new list
      const tempList = {
        id: 'temp-' + Date.now(),
        name,
        leads,
        total_leads: leads.length,
        user_id: 'temp',
        created_at: new Date().toISOString(),
        status: 'processing' as const,
      }

      optimisticUpdates.addNewList(tempList)

      return { previousLists, tempList }
    },

    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousLists) {
        queryClient.setQueryData(CACHE_KEYS.LEAD_LISTS, context.previousLists)
      }

      toast({
        title: "❌ Erro ao Salvar Lista",
        description: "Não foi possível salvar a lista. Tente novamente.",
        variant: 'destructive',
      })
    },

    onSuccess: (data, variables) => {
      const syncMessage = variables.autoSyncToCRM
        ? ` e enviados para o CRM`
        : ''

      toast({
        title: "✅ Lista Salva com Sucesso!",
        description: `${data.total_leads} leads salvos na lista "${data.name}"${syncMessage}.`,
        variant: 'success',
      })
    },

    onSettled: () => {
      // Always refetch after error or success
      invalidateQueries.leadLists()
    },
  })
}

// Hook para adicionar leads a lista existente
export const useAddLeadsToList = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ listId, leads }: { listId: string; leads: Lead[] }) =>
      LeadService.addLeadsToList(listId, leads),

    onMutate: async ({ listId, leads }) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.LEAD_LIST(listId) })

      const previousList = queryClient.getQueryData(CACHE_KEYS.LEAD_LIST(listId))

      // Optimistic update
      optimisticUpdates.updateLeadCount(listId, leads.length)

      return { previousList }
    },

    onError: (_, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(CACHE_KEYS.LEAD_LIST(listId), context.previousList)
      }

      toast({
        title: "Erro ao Adicionar Leads",
        description: "Não foi possível adicionar os leads. Tente novamente.",
        variant: "destructive",
      })
    },

    onSuccess: (data, { leads }) => {
      toast({
        title: "Leads Adicionados!",
        description: `${leads.length} leads adicionados à lista "${data.name}".`,
        variant: 'success',
      })
    },

    onSettled: (_, __, { listId }) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.LEAD_LIST(listId) })
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.LEAD_LIST_STATS(listId) })
      invalidateQueries.leadLists()
    },
  })
}

// Hook para deletar lista
export const useDeleteLeadList = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: LeadService.deleteLeadList,

    onMutate: async (listId: string) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.LEAD_LISTS })

      const previousLists = queryClient.getQueryData(CACHE_KEYS.LEAD_LISTS)

      // Optimistically remove from cache
      queryClient.setQueryData(
        CACHE_KEYS.LEAD_LISTS,
        (oldData: LeadList[]) => oldData?.filter(list => list.id !== listId) || []
      )

      return { previousLists }
    },

    onError: (_, __, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(CACHE_KEYS.LEAD_LISTS, context.previousLists)
      }

      toast({
        title: "Erro ao Deletar Lista",
        description: "Não foi possível deletar a lista. Tente novamente.",
        variant: "destructive",
      })
    },

    onSuccess: () => {
      toast({
        title: "Lista Deletada",
        description: "A lista foi removida com sucesso.",
        variant: 'success',
      })
    },

    onSettled: () => {
      invalidateQueries.leadLists()
    },
  })
}

// Hook para buscar listas com filtros e busca
export const useFilteredLeadLists = (filters: {
  search?: string
  tags?: string[]
  sortBy?: 'name' | 'created_at' | 'total_leads'
  sortOrder?: 'asc' | 'desc'
}) => {
  const { data: lists, ...query } = useLeadLists()

  const filteredLists = React.useMemo(() => {
    if (!lists) return []

    let filtered = lists

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(list =>

        list.name.toLowerCase().includes(searchLower) ||
        list.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro de tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(list =>
        filters.tags!.some(tag => list.tags?.includes(tag))
      )
    }

    // Ordenação
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy!]
        const bValue = b[filters.sortBy!]

        if (filters.sortOrder === 'desc') {
          return String(bValue).localeCompare(String(aValue))
        }
        return String(aValue).localeCompare(String(bValue))
      })
    }

    return filtered
  }, [lists, filters])

  return {
    ...query,
    data: filteredLists,
  }
}
