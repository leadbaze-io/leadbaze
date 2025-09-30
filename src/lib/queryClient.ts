import { QueryClient } from '@tanstack/react-query'
import type { LeadList } from '../types'

// Configuração otimizada do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por padrão
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (novo nome para cacheTime)

      // Retry inteligente
      retry: (failureCount, error: unknown) => {
        // Não retry em erros de autenticação
        const errorWithStatus = error as { status?: number }
        if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
          return false
        }
        // Máximo 3 tentativas
        return failureCount < 3
      },

      // Refetch em foco para dados críticos
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // Network error handling
      networkMode: 'online',
    },
    mutations: {
      // Retry apenas uma vez para mutations
      retry: 1,
      networkMode: 'online',
    },
  },
})

// Cache keys organizados
export const CACHE_KEYS = {
  // User data
  USER: ['user'] as const,
  USER_PROFILE: (userId: string) => ['user', 'profile', userId] as const,

  // Lead lists
  LEAD_LISTS: ['lead-lists'] as const,
  LEAD_LIST: (listId: string) => ['lead-lists', listId] as const,
  LEAD_LIST_STATS: (listId: string) => ['lead-lists', listId, 'stats'] as const,

  // Lead generation
  LEAD_GENERATION: (url: string, limit: number) =>

    ['lead-generation', url, limit] as const,

  // Analytics
  ANALYTICS_OVERVIEW: ['analytics', 'overview'] as const,
  ANALYTICS_PERFORMANCE: (period: string) =>

    ['analytics', 'performance', period] as const,

  // Usage tracking
  USAGE_CURRENT: ['usage', 'current'] as const,
  USAGE_HISTORY: (period: string) => ['usage', 'history', period] as const,

  // System health
  HEALTH_CHECK: ['health'] as const,
} as const

// Utility functions para invalidação de cache
export const invalidateQueries = {
  // Invalidar todas as listas do usuário
  leadLists: () => queryClient.invalidateQueries({

    queryKey: CACHE_KEYS.LEAD_LISTS

  }),

  // Invalidar lista específica
  leadList: (listId: string) => queryClient.invalidateQueries({

    queryKey: CACHE_KEYS.LEAD_LIST(listId)

  }),

  // Invalidar dados do usuário
  user: () => queryClient.invalidateQueries({

    queryKey: CACHE_KEYS.USER

  }),

  // Invalidar analytics
  analytics: () => queryClient.invalidateQueries({

    queryKey: ['analytics']

  }),

  // Invalidar usage
  usage: () => queryClient.invalidateQueries({

    queryKey: ['usage']

  }),
}

// Pre-populate cache para melhor UX
export const prefetchQueries = {
  // Prefetch listas quando usuário faz login
  leadLists: async () => {
    await queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.LEAD_LISTS,
      staleTime: 2 * 60 * 1000, // 2 minutes para prefetch
    })
  },

  // Prefetch analytics do dashboard
  dashboardData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.ANALYTICS_OVERVIEW,
        staleTime: 1 * 60 * 1000, // 1 minute
      }),
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.USAGE_CURRENT,
        staleTime: 30 * 1000, // 30 seconds
      }),
    ])
  },
}

// Background sync para manter dados atualizados
export const backgroundSync = {
  // Sync usage data a cada 30 segundos (só quando ativo)
  startUsageSync: () => {
    return setInterval(() => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({

          queryKey: CACHE_KEYS.USAGE_CURRENT,
          refetchType: 'active'
        })
      }
    }, 30 * 1000)
  },

  // Sync health check a cada 2 minutos
  startHealthSync: () => {
    return setInterval(() => {
      queryClient.invalidateQueries({

        queryKey: CACHE_KEYS.HEALTH_CHECK,
        refetchType: 'active'
      })
    }, 2 * 60 * 1000)
  },
}

// Optimistic updates para melhor UX
export const optimisticUpdates = {
  // Atualizar contagem de leads otimisticamente
  updateLeadCount: (listId: string, increment: number) => {
    queryClient.setQueryData(
      CACHE_KEYS.LEAD_LIST(listId),
      (oldData: LeadList | undefined) => oldData ? {
        ...oldData,
        total_leads: oldData.total_leads + increment
      } : oldData
    )
  },

  // Adicionar nova lista otimisticamente
  addNewList: (newList: LeadList) => {
    queryClient.setQueryData(
      CACHE_KEYS.LEAD_LISTS,
      (oldData: LeadList[] | undefined) => oldData ? [newList, ...oldData] : [newList]
    )
  },
}
