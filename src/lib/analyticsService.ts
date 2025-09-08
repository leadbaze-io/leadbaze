import { supabase, getCurrentUser } from './supabaseClient'

export interface RealAnalyticsData {
  totalLeads: number
  totalLists: number
  totalCampaigns: number
  messagesSent: number
  conversionRate: number
  growthRate: number
  averageRating: number
  topCategories: Array<{ name: string; count: number; percentage: number }>
  recentActivity: Array<{ 
    id: string
    type: 'lead_generated' | 'list_created' | 'campaign_sent' | 'campaign_completed'
    description: string
    timestamp: string
    count?: number
  }>
  chartData: {
    leadsOverTime: Array<{ date: string; count: number }>
    categoryDistribution: Array<{ category: string; count: number; color: string }>
    campaignsOverTime: Array<{ date: string; count: number; success: number; failed: number }>
  }
}

export async function getRealAnalyticsData(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<RealAnalyticsData> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const userId = currentUser.id
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. Buscar dados básicos das listas
    const { data: leadLists, error: listsError } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (listsError) throw listsError

    // 2. Buscar dados das campanhas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (campaignsError) throw campaignsError

    // 3. Buscar leads das campanhas para calcular conversão
    const { data: campaignLeads, error: campaignLeadsError } = await supabase
      .from('campaign_leads')
      .select(`
        *,
        bulk_campaigns!inner(
          id,
          user_id,
          success_count,
          failed_count,
          status
        )
      `)
      .eq('bulk_campaigns.user_id', userId)
      .gte('added_at', startDate.toISOString())

    if (campaignLeadsError) throw campaignLeadsError

    // 4. Calcular métricas básicas
    const totalLeads = leadLists?.reduce((sum, list) => sum + (list.total_leads || 0), 0) || 0
    const totalLists = leadLists?.length || 0
    const totalCampaigns = campaigns?.length || 0
    const messagesSent = campaigns?.reduce((sum, campaign) => sum + (campaign.success_count || 0), 0) || 0

    // 5. Calcular taxa de conversão
    const totalMessagesAttempted = campaigns?.reduce((sum, campaign) => 
      sum + (campaign.success_count || 0) + (campaign.failed_count || 0), 0) || 0
    const conversionRate = totalMessagesAttempted > 0 
      ? Math.round((messagesSent / totalMessagesAttempted) * 100 * 10) / 10 
      : 0

    // 6. Calcular taxa de crescimento (comparar com período anterior)
    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
    
    const { data: previousLists } = await supabase
      .from('lead_lists')
      .select('total_leads')
      .eq('user_id', userId)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousTotalLeads = previousLists?.reduce((sum, list) => sum + (list.total_leads || 0), 0) || 0
    const growthRate = previousTotalLeads > 0 
      ? Math.round(((totalLeads - previousTotalLeads) / previousTotalLeads) * 100 * 10) / 10 
      : 0

    // 7. Calcular avaliação média
    const allLeads = leadLists?.flatMap(list => list.leads || []) || []
    const leadsWithRating = allLeads.filter(lead => lead.rating && lead.rating > 0)
    const averageRating = leadsWithRating.length > 0 
      ? Math.round((leadsWithRating.reduce((sum, lead) => sum + lead.rating, 0) / leadsWithRating.length) * 10) / 10 
      : 0

    // 8. Gerar distribuição por categorias
    const categoryCounts: Record<string, number> = {}
    allLeads.forEach(lead => {
      if (lead.business_type) {
        categoryCounts[lead.business_type] = (categoryCounts[lead.business_type] || 0) + 1
      }
    })

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 9. Gerar dados do gráfico de leads ao longo do tempo
    const leadsOverTime = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLists = leadLists?.filter(list => 
        list.created_at.startsWith(dateStr)
      ) || []
      
      const dayLeads = dayLists.reduce((sum, list) => sum + (list.total_leads || 0), 0)
      
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count: dayLeads
      }
    })

    // 10. Gerar dados do gráfico de campanhas
    const campaignsOverTime = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr = date.toISOString().split('T')[0]
      
      const dayCampaigns = campaigns?.filter(campaign => 
        campaign.created_at.startsWith(dateStr)
      ) || []
      
      const success = dayCampaigns.reduce((sum, campaign) => sum + (campaign.success_count || 0), 0)
      const failed = dayCampaigns.reduce((sum, campaign) => sum + (campaign.failed_count || 0), 0)
      
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count: dayCampaigns.length,
        success,
        failed
      }
    })

    // 11. Gerar cores para categorias
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
    const categoryDistribution = topCategories.map((category, index) => ({
      category: category.name,
      count: category.count,
      color: colors[index % colors.length]
    }))

    // 12. Gerar atividade recente
    const recentActivity = []
    
    // Adicionar listas criadas recentemente
    const recentLists = leadLists?.slice(0, 3) || []
    recentLists.forEach(list => {
      recentActivity.push({
        id: `list-${list.id}`,
        type: 'list_created' as const,
        description: `Lista "${list.name}" criada`,
        timestamp: list.created_at,
        count: list.total_leads
      })
    })

    // Adicionar campanhas recentes
    const recentCampaigns = campaigns?.slice(0, 3) || []
    recentCampaigns.forEach(campaign => {
      if (campaign.status === 'completed') {
        recentActivity.push({
          id: `campaign-${campaign.id}`,
          type: 'campaign_completed' as const,
          description: `Campanha "${campaign.name}" concluída`,
          timestamp: campaign.completed_at || campaign.updated_at,
          count: campaign.success_count
        })
      } else if (campaign.status === 'sending') {
        recentActivity.push({
          id: `campaign-${campaign.id}`,
          type: 'campaign_sent' as const,
          description: `Campanha "${campaign.name}" enviada`,
          timestamp: campaign.sent_at || campaign.updated_at,
          count: campaign.success_count
        })
      }
    })

    // Ordenar por timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      totalLeads,
      totalLists,
      totalCampaigns,
      messagesSent,
      conversionRate,
      growthRate,
      averageRating,
      topCategories,
      recentActivity: recentActivity.slice(0, 10), // Limitar a 10 atividades
      chartData: {
        leadsOverTime,
        categoryDistribution,
        campaignsOverTime
      }
    }

  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error)
    throw error
  }
}

// Função para calcular métricas de conversão mais detalhadas
export async function getConversionMetrics(userId: string, timeRange: '7d' | '30d' | '90d' = '30d') {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Buscar campanhas com status de entrega
    const { data: campaigns, error } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .in('status', ['completed', 'sending'])

    if (error) throw error

    const totalSent = campaigns?.reduce((sum, campaign) => sum + (campaign.success_count || 0), 0) || 0
    const totalFailed = campaigns?.reduce((sum, campaign) => sum + (campaign.failed_count || 0), 0) || 0
    const totalAttempted = totalSent + totalFailed

    return {
      totalSent,
      totalFailed,
      totalAttempted,
      deliveryRate: totalAttempted > 0 ? Math.round((totalSent / totalAttempted) * 100 * 10) / 10 : 0,
      campaigns: campaigns?.length || 0
    }
  } catch (error) {
    console.error('Erro ao calcular métricas de conversão:', error)
    return {
      totalSent: 0,
      totalFailed: 0,
      totalAttempted: 0,
      deliveryRate: 0,
      campaigns: 0
    }
  }
}
