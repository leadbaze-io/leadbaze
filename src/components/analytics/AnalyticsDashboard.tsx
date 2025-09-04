import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
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
          icon={Target}
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
              <BarChart3 className="w-5 h-5" />
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
              <PieChart className="w-5 h-5" />
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
            <Activity className="w-5 h-5" />
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
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-800 rounded-xl flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-700">
                    <span className="text-blue-600 dark:text-blue-200 text-lg">
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
    blue: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200',
    purple: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200',
    orange: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                {title}
              </p>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {value}
              </p>
              <div className="flex items-center mt-1 md:mt-2">
                <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 ${
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`text-xs md:text-sm font-medium ${
                  trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {change}
                </span>
              </div>
            </div>
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center ${colorClasses[color]} self-end md:self-auto`}>
              <Icon className="w-4 h-4 md:w-6 md:h-6" />
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
      return <Target className="w-4 h-4 text-green-600" />
    case 'message_sent':
      return <MessageSquare className="w-4 h-4 text-purple-600" />
    default:
      return <Activity className="w-4 h-4 text-gray-600" />
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
