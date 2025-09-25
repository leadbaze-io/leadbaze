import { supabase, getCurrentUser } from './supabaseClient'

export interface AdvancedAnalyticsData {
  // Métricas básicas
  totalLeads: number
  totalLists: number
  totalCampaigns: number
  messagesSent: number
  deliveryRate: number

  // Métricas avançadas
  responseRate: number
  conversionRate: number
  averageResponseTime: number
  totalSales: number
  roi: number

  // Métricas de qualidade
  averageLeadQuality: number
  highQualityLeads: number
  conversionProbability: number

  // Análise temporal
  bestSendingHours: Array<{ hour: number; performance: number }>
  bestSendingDays: Array<{ day: string; performance: number }>

  // Performance por categoria
  categoryPerformance: Array<{
    category: string
    totalLeads: number
    responseRate: number
    conversionRate: number
    averageQuality: number
  }>

  // Templates performance
  templatePerformance: Array<{
    templateId: string
    templateName: string
    totalSent: number
    responseRate: number
    conversionRate: number
    performanceScore: number
  }>

  // Insights e alertas
  insights: Array<{
    id: string
    type: string
    title: string
    description: string
    severity: string
    isActionable: boolean
    actionUrl?: string
    createdAt: string
  }>

  // Dados para gráficos
  chartData: {
    leadsOverTime: Array<{ date: string; count: number }>
    responsesOverTime: Array<{ date: string; positive: number; negative: number; questions: number }>
    conversionsOverTime: Array<{ date: string; count: number; value: number }>
    qualityDistribution: Array<{ range: string; count: number; percentage: number }>
    hourlyPerformance: Array<{ hour: number; sent: number; responses: number; rate: number }>
  }
}

export interface LeadQualityScore {
  leadId: string
  listId: string
  qualityScore: number
  conversionProbability: number
  factors: {
    rating: number
    reviewsCount: number
    hasWebsite: boolean
    hasPhone: boolean
    businessType: string
  }
}

export interface TemporalAnalysis {
  bestHours: Array<{ hour: number; performance: number; recommendations: string[] }>
  bestDays: Array<{ day: string; performance: number; recommendations: string[] }>
  seasonalTrends: Array<{ month: string; performance: number; trend: 'up' | 'down' | 'stable' }>
}

export async function getAdvancedAnalyticsData(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<AdvancedAnalyticsData> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    const userId = currentUser.id
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. Buscar dados básicos
    const [leadLists, campaigns, responses, conversions, insights] = await Promise.all([
      getLeadListsData(userId, startDate),
      getCampaignsData(userId, startDate),
      getResponsesData(userId, startDate),
      getConversionsData(userId, startDate),
      getInsightsData(userId)
    ])

    // 2. Calcular métricas básicas
    const totalLeads = leadLists.reduce((sum, list) => sum + (list.total_leads || 0), 0)
    const totalLists = leadLists.length
    const totalCampaigns = campaigns.length
    const messagesSent = campaigns.reduce((sum, campaign) => sum + (campaign.success_count || 0), 0)
    const totalAttempted = campaigns.reduce((sum, campaign) => sum + (campaign.success_count || 0) + (campaign.failed_count || 0), 0)
    const deliveryRate = totalAttempted > 0 ? Math.round((messagesSent / totalAttempted) * 100 * 10) / 10 : 0

    // 3. Calcular métricas avançadas
    const totalResponses = responses.length
    const responseRate = messagesSent > 0 ? Math.round((totalResponses / messagesSent) * 100 * 10) / 10 : 0
    const totalConversions = conversions.length
    const conversionRate = messagesSent > 0 ? Math.round((totalConversions / messagesSent) * 100 * 10) / 10 : 0
    const averageResponseTime = responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + (r.response_time || 0), 0) / responses.length) : 0
    const totalSales = conversions.reduce((sum, c) => sum + (c.sale_value || 0), 0)
    const roi = totalSales > 0 ? Math.round((totalSales / (totalAttempted * 0.1)) * 100) : 0 // Assumindo R$ 0,10 por mensagem

    // 4. Calcular métricas de qualidade
    const qualityScores = await getLeadQualityScores(userId)
    const averageLeadQuality = qualityScores.length > 0 ? Math.round(qualityScores.reduce((sum, q) => sum + q.qualityScore, 0) / qualityScores.length * 10) / 10 : 0
    const highQualityLeads = qualityScores.filter(q => q.qualityScore >= 70).length
    const conversionProbability = qualityScores.length > 0 ? Math.round(qualityScores.reduce((sum, q) => sum + q.conversionProbability, 0) / qualityScores.length * 10) / 10 : 0

    // 5. Análise temporal
    const temporalAnalysis = await getTemporalAnalysis(userId, startDate)

    // 6. Performance por categoria
    const categoryPerformance = await getCategoryPerformance(userId)

    // 7. Performance de templates
    const templatePerformance = await getTemplatePerformance(userId, startDate)

    // 8. Dados para gráficos
    const chartData = await getChartData(days)

    return {
      totalLeads,
      totalLists,
      totalCampaigns,
      messagesSent,
      deliveryRate,
      responseRate,
      conversionRate,
      averageResponseTime,
      totalSales,
      roi,
      averageLeadQuality,
      highQualityLeads,
      conversionProbability,
      bestSendingHours: temporalAnalysis.bestHours,
      bestSendingDays: temporalAnalysis.bestDays,
      categoryPerformance,
      templatePerformance,
      insights,
      chartData
    }

  } catch (error) {

    throw error
  }
}

// Funções auxiliares
async function getLeadListsData(userId: string, startDate: Date) {
  const { data, error } = await supabase
    .from('lead_lists')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) throw error
  return data || []
}

async function getCampaignsData(userId: string, startDate: Date) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) throw error
  return data || []
}

async function getResponsesData(userId: string, startDate: Date) {
  const { data, error } = await supabase
    .from('whatsapp_responses')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) throw error
  return data || []
}

async function getConversionsData(userId: string, startDate: Date) {
  const { data, error } = await supabase
    .from('sales_conversions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) throw error
  return data || []
}

async function getInsightsData(userId: string) {
  const { data, error } = await supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data || []
}

async function getLeadQualityScores(userId: string): Promise<LeadQualityScore[]> {
  const { data, error } = await supabase
    .from('lead_quality_scores')
    .select('*')
    .eq('user_id', userId)
    .order('quality_score', { ascending: false })

  if (error) throw error
  return data || []
}

async function getTemporalAnalysis(userId: string, startDate: Date): Promise<TemporalAnalysis> {
  // Análise por hora
  const { data: hourlyData, error: hourlyError } = await supabase
    .from('whatsapp_responses')
    .select('created_at, response_type')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (hourlyError) throw hourlyError

  // Agrupar por hora
  const hourlyStats: Record<number, { sent: number; responses: number; positive: number }> = {}
  for (let hour = 0; hour < 24; hour++) {
    hourlyStats[hour] = { sent: 0, responses: 0, positive: 0 }
  }

  hourlyData?.forEach(response => {
    const hour = new Date(response.created_at).getHours()
    hourlyStats[hour].responses++
    if (response.response_type === 'positive') {
      hourlyStats[hour].positive++
    }
  })

  const bestHours = Object.entries(hourlyStats)
    .map(([hour, stats]) => ({
      hour: parseInt(hour),
      performance: stats.sent > 0 ? Math.round((stats.positive / stats.sent) * 100) : 0,
      recommendations: getHourRecommendations(parseInt(hour), { ...stats, rate: stats.sent > 0 ? (stats.positive / stats.sent) * 100 : 0 })
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5)

  // Análise por dia da semana
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const dailyStats: Record<string, { sent: number; responses: number; positive: number }> = {}

  dayNames.forEach(day => {
    dailyStats[day] = { sent: 0, responses: 0, positive: 0 }
  })

  hourlyData?.forEach(response => {
    const dayName = dayNames[new Date(response.created_at).getDay()]
    dailyStats[dayName].responses++
    if (response.response_type === 'positive') {
      dailyStats[dayName].positive++
    }
  })

  const bestDays = Object.entries(dailyStats)
    .map(([day, stats]) => ({
      day,
      performance: stats.sent > 0 ? Math.round((stats.positive / stats.sent) * 100) : 0,
      recommendations: getDayRecommendations(day, { performance: stats.sent > 0 ? Math.round((stats.positive / stats.sent) * 100) : 0 })
    }))
    .sort((a, b) => b.performance - a.performance)

  return {
    bestHours,
    bestDays,
    seasonalTrends: [] // Implementar análise sazonal se necessário
  }
}

async function getCategoryPerformance(userId: string) {
  const { data, error } = await supabase
    .from('category_performance')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  return data?.map(category => ({
    category: category.category,
    totalLeads: category.total_leads,
    responseRate: 0, // Calcular baseado nas respostas
    conversionRate: 0, // Calcular baseado nas conversões
    averageQuality: 0 // Calcular baseado nos scores
  })) || []
}

async function getTemplatePerformance(userId: string, startDate: Date) {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('created_at', startDate.toISOString())

  if (error) throw error

  return data?.map(template => ({
    templateId: template.id,
    templateName: template.name,
    totalSent: template.total_sent,
    responseRate: template.response_rate,
    conversionRate: template.conversion_rate,
    performanceScore: template.performance_score
  })) || []
}

async function getChartData(days: number) {
  // Leads ao longo do tempo
  const leadsOverTime = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: Math.floor(Math.random() * 10) + 1 // Placeholder
    }
  })

  // Respostas ao longo do tempo
  const responsesOverTime = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      positive: Math.floor(Math.random() * 5),
      negative: Math.floor(Math.random() * 3),
      questions: Math.floor(Math.random() * 2)
    }
  })

  // Conversões ao longo do tempo
  const conversionsOverTime = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: Math.floor(Math.random() * 3),
      value: Math.floor(Math.random() * 1000) + 100
    }
  })

  // Distribuição de qualidade
  const qualityDistribution = [
    { range: '0-20', count: 5, percentage: 10 },
    { range: '21-40', count: 10, percentage: 20 },
    { range: '41-60', count: 15, percentage: 30 },
    { range: '61-80', count: 12, percentage: 24 },
    { range: '81-100', count: 8, percentage: 16 }
  ]

  // Performance por hora
  const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sent: Math.floor(Math.random() * 50) + 10,
    responses: Math.floor(Math.random() * 10) + 2,
    rate: Math.floor(Math.random() * 30) + 10
  }))

  return {
    leadsOverTime,
    responsesOverTime,
    conversionsOverTime,
    qualityDistribution,
    hourlyPerformance
  }
}

// Funções auxiliares para recomendações
function getHourRecommendations(hour: number, stats: { sent: number; responses: number; rate: number }): string[] {
  const recommendations = []

  if (hour >= 9 && hour <= 11) {
    recommendations.push('Horário ideal para envio - manhã produtiva')
  } else if (hour >= 14 && hour <= 16) {
    recommendations.push('Período de alta performance - tarde')
  } else if (hour >= 19 && hour <= 21) {
    recommendations.push('Boa performance - horário noturno')
  } else if (hour >= 22 || hour <= 7) {
    recommendations.push('Evitar envios - horário inadequado')
  }

  if (stats.rate > 70) {
    recommendations.push('Excelente taxa de respostas positivas')
  }

  return recommendations
}

function getDayRecommendations(day: string, stats: { performance: number }): string[] {
  const recommendations = []

  if (['Segunda', 'Terça', 'Quarta', 'Quinta'].includes(day)) {
    recommendations.push('Dia útil - boa performance esperada')
  } else if (day === 'Sexta') {
    recommendations.push('Sexta-feira - performance moderada')
  } else if (['Sábado', 'Domingo'].includes(day)) {
    recommendations.push('Fim de semana - performance reduzida')
  }

  if (stats.performance > 60) {
    recommendations.push('Dia com boa taxa de conversão')
  }

  return recommendations
}

// Função para calcular score de qualidade de um lead
export async function calculateLeadQualityScore(lead: {

  rating?: number;

  reviews_count?: number;

  website?: string;

  phone?: string;

  business_type?: string;

}): Promise<LeadQualityScore> {
  const rating = lead.rating || 0
  const reviewsCount = lead.reviews_count || 0
  const hasWebsite = !!lead.website
  const hasPhone = !!lead.phone
  const businessType = lead.business_type || ''

  // Calcular score usando a função do banco
  const { data, error } = await supabase
    .rpc('calculate_lead_quality_score', {
      p_rating: rating,
      p_reviews_count: reviewsCount,
      p_has_website: hasWebsite,
      p_has_phone: hasPhone,
      p_business_type: businessType
    })

  if (error) throw error

  const qualityScore = data || 0

  // Calcular probabilidade de conversão
  const { data: probability, error: probError } = await supabase
    .rpc('calculate_conversion_probability', {
      p_quality_score: qualityScore,
      p_business_type: businessType,
      p_has_phone: hasPhone
    })

  if (probError) throw probError

  return {
    leadId: `lead-${Date.now()}`, // ID temporário
    listId: '', // Lista não disponível neste contexto
    qualityScore,
    conversionProbability: probability || 0,
    factors: {
      rating,
      reviewsCount,
      hasWebsite,
      hasPhone,
      businessType
    }
  }
}

// Função para gerar insights automáticos
export async function generateAutomaticInsights(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('generate_analytics_insights', {
        p_user_id: userId
      })

    if (error) throw error
  } catch (error) {

    throw error
  }
}

// Função para marcar insight como lido
export async function markInsightAsRead(insightId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('analytics_insights')
      .update({ is_read: true })
      .eq('id', insightId)

    if (error) throw error
  } catch (error) {

    throw error
  }
}
