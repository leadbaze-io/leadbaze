import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {

  AlertTriangle,

  Info,

  CheckCircle,

  TrendingUp,

  TrendingDown,
  Clock,
  Target,
  MessageSquare,
  DollarSign,
  Users,
  ExternalLink,
  Bell,
  BellOff
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { markInsightAsRead, generateAutomaticInsights } from '../../lib/advancedAnalyticsService'

interface Insight {
  id: string
  type: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  isActionable: boolean
  actionUrl?: string
  createdAt: string
  isRead: boolean
}

interface InsightsPanelProps {
  insights: Insight[]
  onInsightRead?: (insightId: string) => void
  onRefresh?: () => void
}

export default function InsightsPanel({ insights, onInsightRead, onRefresh }: InsightsPanelProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const unread = insights.filter(insight => !insight.isRead).length
    setUnreadCount(unread)
  }, [insights])

  const handleMarkAsRead = async (insightId: string) => {
    try {
      await markInsightAsRead(insightId)
      onInsightRead?.(insightId)
    } catch (error) {
      console.error('Error marking insight as read:', error)
    }
  }

  const handleGenerateInsights = async () => {
    setIsGenerating(true)
    try {
      await generateAutomaticInsights('current-user-id')
      onRefresh?.()
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance_alert':
        return <TrendingUp className="w-4 h-4" />
      case 'trend_analysis':
        return <TrendingDown className="w-4 h-4" />
      case 'recommendation':
        return <Target className="w-4 h-4" />
      case 'conversion_alert':
        return <DollarSign className="w-4 h-4" />
      case 'response_alert':
        return <MessageSquare className="w-4 h-4" />
      case 'lead_alert':
        return <Users className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span>Insights e Alertas</span>
          </CardTitle>
          <CardDescription>
            Receba insights automáticos sobre sua performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum insight disponível
            </h3>
            <p className="text-muted-foreground mb-4">
              Execute algumas campanhas para receber insights automáticos sobre sua performance.
            </p>
            <Button

              onClick={handleGenerateInsights}
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? 'Gerando...' : 'Gerar Insights'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Insights e Alertas</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button

            onClick={handleGenerateInsights}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? 'Gerando...' : 'Atualizar'}
          </Button>
        </div>
        <CardDescription>
          Insights automáticos baseados na sua performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${getSeverityColor(insight.severity)
                  } ${!insight.isRead ? 'ring-2 ring-blue-500/20' : ''}`}
              >
                {/* Indicador de não lido */}
                {!insight.isRead && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(insight.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {insight.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getTypeIcon(insight.type)}
                        <span className="ml-1 capitalize">
                          {insight.type.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(insight.createdAt)}</span>
                        </div>
                        {insight.isActionable && (
                          <Badge variant="secondary" className="text-xs">
                            Ação Recomendada
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {insight.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => window.open(insight.actionUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        )}

                        {!insight.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => handleMarkAsRead(insight.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {insights.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" className="w-full">
              Ver todos os insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para exibir insights em tempo real
export function RealTimeInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simular conexão em tempo real
    const interval = setInterval(() => {
      // Aqui você implementaria a conexão WebSocket ou Server-Sent Events
      setIsConnected(true)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <InsightsPanel

        insights={insights}
        onInsightRead={(id) => {
          setInsights(prev => prev.map(insight =>

            insight.id === id ? { ...insight, isRead: true } : insight
          ))
        }}
      />
    </div>
  )
}
