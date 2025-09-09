import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target,
  Download,
  RefreshCw,
  Users,
  FolderPlus,
  MessageSquare,
  Clock,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

import { useLeadLists } from '../../hooks/useLeadLists'
import { AnalyticsSkeleton } from '../LoadingScreen'
import { AnalyticsService } from '../../lib/analyticsService'
import type { LeadList } from '../../types'
import type { 
  AnalyticsOverview, 
  LeadsOverTime, 
  CategoryData, 
  CategoryDistribution, 
  CampaignData, 
  RecentActivity 
} from '../../lib/analyticsService'

// Interface para dados reais de analytics
interface AnalyticsData {
  overview: AnalyticsOverview
  leadsOverTime: LeadsOverTime[]
  categories: CategoryData[]
  categoryDistribution: CategoryDistribution[]
  campaigns: CampaignData[]
  recentActivity: RecentActivity[]
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  const { data: leadLists, isLoading: listsLoading } = useLeadLists()

  // Carregar dados reais de analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      try {
        console.log(`📊 [AnalyticsDashboard] Carregando dados para período: ${timeRange}`);
        const analyticsData = await AnalyticsService.getAllAnalytics(timeRange)
        setAnalytics(analyticsData)
        setLastUpdated(new Date())
        console.log('✅ [AnalyticsDashboard] Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ [AnalyticsDashboard] Erro ao carregar dados:', error);
        // Fallback para dados mockup em caso de erro
        if (leadLists) {
          const mockAnalytics = generateMockAnalytics(leadLists, timeRange)
          setAnalytics(mockAnalytics)
          setLastUpdated(new Date())
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (!listsLoading) {
      loadAnalytics()
    }
  }, [leadLists, timeRange, listsLoading])

  const refreshData = async () => {
    setIsLoading(true)
    
    try {
      console.log(`🔄 [AnalyticsDashboard] Atualizando dados para período: ${timeRange}`);
      const analyticsData = await AnalyticsService.getAllAnalytics(timeRange)
      setAnalytics(analyticsData)
      setLastUpdated(new Date())
      console.log('✅ [AnalyticsDashboard] Dados atualizados com sucesso');
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Erro ao atualizar dados:', error);
      // Fallback para dados mockup em caso de erro
      if (leadLists) {
        const mockAnalytics = generateMockAnalytics(leadLists, timeRange)
        setAnalytics(mockAnalytics)
        setLastUpdated(new Date())
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !analytics) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        {/* Mobile-first responsive controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs flex-1 sm:flex-none"
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </Button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Atualizar</span>
              <span className="xs:hidden">Atualizar</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Exportar</span>
              <span className="xs:hidden">Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Total de Leads"
          value={analytics.overview.totalLeads.toLocaleString()}
          change={`${analytics.overview.growthRate >= 0 ? '+' : ''}${analytics.overview.growthRate}%`}
          trend={analytics.overview.growthRate >= 0 ? "up" : "down"}
          icon={Users}
          color="blue"
        />
        
        <MetricCard
          title="Listas Criadas"
          value={analytics.overview.totalLists.toString()}
          change={`${analytics.overview.totalLists > 0 ? '+' : ''}${analytics.overview.totalLists}`}
          trend="up"
          icon={FolderPlus}
          color="green"
        />
        
        <MetricCard
          title="Campanhas Enviadas"
          value={analytics.overview.totalCampaigns.toString()}
          change={`${analytics.overview.totalCampaigns > 0 ? '+' : ''}${analytics.overview.totalCampaigns}`}
          trend="up"
          icon={BarChart3}
          color="purple"
        />
        
        <MetricCard
          title="Taxa de Entrega"
          value={`${analytics.overview.conversionRate}%`}
          change={`${analytics.overview.conversionRate > 0 ? '+' : ''}${analytics.overview.conversionRate}%`}
          trend={analytics.overview.conversionRate > 0 ? "up" : "down"}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Leads Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Leads ao Longo do Tempo</span>
            </CardTitle>
            <CardDescription>
              Crescimento de leads nos últimos {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={analytics.leadsOverTime} />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Categorias</span>
            </CardTitle>
            <CardDescription>
              Distribuição por tipo de negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categories.length > 0 ? (
                analytics.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: analytics.categoryDistribution[index]?.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{category.count}</div>
                      <div className="text-xs text-gray-500">{category.percentage}%</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma categoria encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Performance */}
      {analytics.overview.totalCampaigns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Performance das Campanhas</span>
            </CardTitle>
            <CardDescription>
              Taxa de entrega e mensagens enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignsChart data={analytics.campaigns} />
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>Atividade Recente</span>
          </CardTitle>
          <CardDescription>
            Últimas ações realizadas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.count && (
                  <div 
                    className="inline-flex items-center rounded-full text-xs font-bold px-3 py-1 shadow-lg border-0"
                    style={{
                      backgroundColor: 'rgb(59, 130, 246)',
                      minWidth: '32px',
                      height: '24px',
                      justifyContent: 'center'
                    }}
                  >
                    <span 
                      className="text-xs font-bold"
                      style={{
                        color: 'rgb(255, 255, 255)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                        lineHeight: '1'
                      }}
                    >
                      {activity.count}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-border shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground mt-1">
                {value}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`text-xs sm:text-sm font-bold ${
                  trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {change}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg ${colorClasses[color]} ml-3 flex-shrink-0`}>
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SimpleLineChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const maxValue = Math.max(...data.map(d => d.count))
  
  return (
    <div className="h-64 flex items-end space-x-2">
      {data.map((point, index) => (
        <motion.div
          key={point.date}
          initial={{ height: 0 }}
          animate={{ height: `${(point.count / maxValue) * 100}%` }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="flex-1 bg-blue-500 rounded-t-sm min-h-[4px] hover:bg-blue-600 transition-colors"
          title={`${point.date}: ${point.count} leads`}
        />
      ))}
    </div>
  )
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'lead_generated':
      return <Users className="w-4 h-4 text-white" />
    case 'list_created':
      return <FolderPlus className="w-4 h-4 text-white" />
    case 'campaign_sent':
      return <MessageSquare className="w-4 h-4 text-white" />
    case 'campaign_completed':
      return <BarChart3 className="w-4 h-4 text-white" />
    default:
      return <Zap className="w-4 h-4 text-white" />
  }
}

function generateMockAnalytics(leadLists: LeadList[], timeRange: string): AnalyticsData {
  const totalLeads = leadLists.reduce((sum, list) => sum + (list.total_leads || 0), 0)
  const totalLists = leadLists.length

  // Generate chart data based on time range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  const leadsOverTime = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: Math.floor(Math.random() * 20) + 5
    }
  })

  // Generate category distribution from actual leads
  const allLeads = leadLists.flatMap(list => list.leads || [])
  const categoryCounts: Record<string, number> = {}
  allLeads.forEach(lead => {
    if (lead.business_type) {
      categoryCounts[lead.business_type] = (categoryCounts[lead.business_type] || 0) + 1
    }
  })

  // Se não há categorias reais, usar categorias mockup
  if (Object.keys(categoryCounts).length === 0) {
    categoryCounts['Estabelecimento'] = Math.floor(totalLeads * 0.4)
    categoryCounts['Serviços'] = Math.floor(totalLeads * 0.3)
    categoryCounts['E-commerce'] = Math.floor(totalLeads * 0.2)
    categoryCounts['Consultoria'] = Math.floor(totalLeads * 0.1)
  }

  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
  const categoryDistribution = topCategories.map((category, index) => ({
    category: category.name,
    count: category.count,
    color: colors[index % colors.length]
  }))

  // Generate campaigns data with mockup values
  const totalCampaigns = Math.floor(totalLists * 0.8) // 80% das listas têm campanhas
  const messagesSent = Math.floor(totalLeads * 0.6) // 60% dos leads receberam mensagens
  const conversionRate = Math.floor(Math.random() * 15) + 5 // 5-20% de conversão
  const growthRate = Math.floor(Math.random() * 30) + 10 // 10-40% de crescimento

  const campaigns = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const success = Math.floor(Math.random() * 10) + 1
    const failed = Math.floor(Math.random() * 3)
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      count: success + failed,
      success,
      failed
    }
  })

  // Generate recent activity from actual lists
  const recentActivity = leadLists.slice(0, 5).map((list, index) => {
    const activities = [
      { type: 'list_created' as const, description: `Lista "${list.name}" criada` },
      { type: 'lead_generated' as const, description: `${list.total_leads} leads adicionados` },
      { type: 'campaign_sent' as const, description: `Campanha enviada para "${list.name}"` },
      { type: 'campaign_completed' as const, description: `Campanha finalizada` }
    ]
    
    const activity = activities[index % activities.length]
    return {
      id: `activity-${list.id}-${index}`,
      type: activity.type,
      description: activity.description,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      count: list.total_leads
    }
  })

  return {
    overview: {
      totalLeads,
      totalLists,
      totalCampaigns,
      messagesSent,
      conversionRate,
      growthRate,
      averageRating: 4.2,
      timeRange
    },
    leadsOverTime,
    categories: topCategories,
    categoryDistribution,
    campaigns,
    recentActivity
  }
}

function CampaignsChart({ data }: { data: Array<{ date: string; count: number; success: number; failed: number }> }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.success, d.failed)))
  
  return (
    <div className="h-64 flex items-end space-x-2">
      {data.map((point, index) => (
        <div key={point.date} className="flex-1 flex flex-col items-center space-y-1">
          <div className="flex flex-col space-y-1 w-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${maxValue > 0 ? (point.success / maxValue) * 100 : 0}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-green-500 rounded-t-sm min-h-[2px] hover:bg-green-600 transition-colors"
              title={`${point.date}: ${point.success} sucessos`}
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${maxValue > 0 ? (point.failed / maxValue) * 100 : 0}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-red-500 rounded-t-sm min-h-[2px] hover:bg-red-600 transition-colors"
              title={`${point.date}: ${point.failed} falhas`}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-2">{point.date}</span>
        </div>
      ))}
    </div>
  )
}
