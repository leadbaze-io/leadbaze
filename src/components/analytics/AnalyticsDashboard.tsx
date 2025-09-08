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
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

import { useLeadLists } from '../../hooks/useLeadLists'
import { AnalyticsSkeleton } from '../LoadingScreen'
import type { LeadList } from '../../types'

interface AnalyticsData {
  totalLeads: number
  totalLists: number
  messagesSent: number
  conversionRate: number
  growthRate: number
  averageRating: number
  topCategories: Array<{ name: string; count: number; percentage: number }>
  recentActivity: Array<{ 
    id: string
    type: 'lead_generated' | 'list_created' | 'message_sent'
    description: string
    timestamp: string
    count?: number
  }>
  chartData: {
    leadsOverTime: Array<{ date: string; count: number }>
    categoryDistribution: Array<{ category: string; count: number; color: string }>
  }
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  const { data: leadLists, isLoading: listsLoading } = useLeadLists()

  // Simular carregamento de analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (leadLists) {
        const mockAnalytics = generateMockAnalytics(leadLists, timeRange)
        setAnalytics(mockAnalytics)
        setLastUpdated(new Date())
      }
      
      setIsLoading(false)
    }

    if (!listsLoading) {
      loadAnalytics()
    }
  }, [leadLists, timeRange, listsLoading])

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      if (leadLists) {
        const mockAnalytics = generateMockAnalytics(leadLists, timeRange)
        setAnalytics(mockAnalytics)
        setLastUpdated(new Date())
      }
      setIsLoading(false)
    }, 1000)
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
          value={analytics.totalLeads.toLocaleString()}
          change={`+${analytics.growthRate}%`}
          trend="up"
          icon={Users}
          color="blue"
        />
        
        <MetricCard
          title="Listas Criadas"
          value={analytics.totalLists.toString()}
          change="+12%"
          trend="up"
          icon={FolderPlus}
          color="green"
        />
        
        <MetricCard
          title="Mensagens Enviadas"
          value={analytics.messagesSent.toLocaleString()}
          change="+8%"
          trend="up"
          icon={MessageSquare}
          color="purple"
        />
        
        <MetricCard
          title="Taxa de Conversão"
          value={`${analytics.conversionRate}%`}
          change="+2.1%"
          trend="up"
          icon={TrendingDown}
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
            <SimpleLineChart data={analytics.chartData.leadsOverTime} />
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
              {analytics.topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: analytics.chartData.categoryDistribution[index]?.color || '#3B82F6' }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{category.count}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
      return <Users className="w-4 h-4 text-blue-600" />
    case 'list_created':
      return <FolderPlus className="w-4 h-4 text-green-600" />
    case 'message_sent':
      return <MessageSquare className="w-4 h-4 text-purple-600" />
    default:
      return <Zap className="w-4 h-4 text-gray-600" />
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
      count: Math.floor(Math.random() * 50) + 10
    }
  })

  // Generate category distribution
  const categories = ['Restaurantes', 'Clínicas', 'Lojas', 'Escritórios', 'Academias']
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
  
  const topCategories = categories.map((name) => {
    const count = Math.floor(Math.random() * 100) + 20
    return {
      name,
      count,
      percentage: Math.round((count / totalLeads) * 100)
    }
  })

  const categoryDistribution = categories.map((category, index) => ({
    category,
    count: topCategories[index].count,
    color: colors[index]
  }))

  const recentActivity = [
    {
      id: '1',
      type: 'lead_generated' as const,
      description: 'Novos leads extraídos do Google Maps',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      count: 25
    },
    {
      id: '2',
      type: 'list_created' as const,
      description: 'Lista "Restaurantes SP" criada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      type: 'message_sent' as const,
      description: 'Campanha WhatsApp enviada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      count: 50
    }
  ]

  return {
    totalLeads,
    totalLists,
    messagesSent: Math.floor(Math.random() * 1000) + 200,
    conversionRate: Math.round((Math.random() * 20 + 5) * 10) / 10,
    growthRate: Math.round((Math.random() * 50 + 10) * 10) / 10,
    averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    topCategories,
    recentActivity,
    chartData: {
      leadsOverTime,
      categoryDistribution
    }
  }
}
