import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target,
  Activity, 
  Clock, 
  CheckCircle, 
  Send,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AnalyticsService, type AnalyticsData } from '../../lib/analyticsService';
import { useTheme } from '../../hooks/use-theme';

// Componente de KPI Card otimizado
const KPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  loading = false 
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo';
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      border: 'border-blue-200 dark:border-blue-800/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950/50',
      text: 'text-green-600',
      icon: 'text-green-500',
      border: 'border-green-200 dark:border-green-800/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/50',
      text: 'text-red-600',
      icon: 'text-red-500',
      border: 'border-red-200 dark:border-red-800/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      border: 'border-purple-200 dark:border-purple-800/30'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      text: 'text-orange-600',
      icon: 'text-orange-500',
      border: 'border-orange-200 dark:border-orange-800/30'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      text: 'text-indigo-600',
      icon: 'text-indigo-500',
      border: 'border-indigo-200 dark:border-indigo-800/30'
    }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full ${colors.bg} ${colors.border} border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    value
                  )}
                </h3>
                {change !== undefined && !loading && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : 
                     change < 0 ? <ArrowDownRight className="w-4 h-4" /> : 
                     <Minus className="w-4 h-4" />}
                    <span className="font-medium">{Math.abs(change)}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Activity Item otimizado
const ActivityItem = ({ 
  activity, 
  index 
}: { 
  activity: any; 
  index: number; 
}) => {
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_completed': return <CheckCircle className="w-5 h-5" />;
      case 'campaign_sent': return <Send className="w-5 h-5" />;
      case 'campaign_created': return <Zap className="w-5 h-5" />;
      case 'list_created': return <Users className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'campaign_completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'campaign_sent': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'campaign_created': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'list_created': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group"
    >
      <div className="flex items-center space-x-4 p-4 rounded-xl border border-border/50 hover:border-border hover:shadow-md transition-all duration-300 bg-card/50 hover:bg-card">
        <div className={`p-3 rounded-xl ${getActivityColor(activity.type)} transition-all duration-300 group-hover:scale-110`}>
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {activity.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(activity.timestamp).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activity.count && (
            <Badge variant="secondary" className="font-semibold">
              {activity.count}
            </Badge>
          )}
          
          {activity.successRate && activity.successRate > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
              {activity.successRate}% sucesso
            </Badge>
          )}
          
          {activity.progress && activity.progress > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-800">
              {activity.progress}% concluído
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal do Analytics Dashboard
export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const loadAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await AnalyticsService.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  const handleExport = () => {
    // Implementar exportação de dados
    console.log('Exportando dados...');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-muted-foreground mb-4">
            Não há dados de analytics para exibir no momento.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho das suas campanhas e leads
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
            <Button 
            onClick={handleRefresh}
              variant="outline" 
              size="sm" 
            disabled={refreshing}
            >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
            </Button>
            
          <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
            Exportar
            </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Total de Leads"
          value={analytics.overview.totalLeads.toLocaleString()}
          change={analytics.overview.growthRate}
          icon={Users}
          color="blue"
          loading={loading}
        />
        
        <KPICard
          title="Mensagens Enviadas"
          value={analytics.overview.messagesSent.toLocaleString()}
          icon={Send}
          color="green"
          loading={loading}
        />
        
        <KPICard
          title="Taxa de Sucesso"
          value={`${analytics.overview.performance?.successRate || 0}%`}
          icon={Award}
          color="purple"
          loading={loading}
        />
        
        <KPICard
          title="Campanhas Ativas"
          value={analytics.overview.campaignStats?.total || 0}
          icon={Target}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Atividade</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Over Time */}
            <Card>
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
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de leads em desenvolvimento</p>
                  </div>
                </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <span>Distribuição por Categoria</span>
            </CardTitle>
            <CardDescription>
                  Segmentação dos seus leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                  {analytics.categories.length > 0 ? (
                    analytics.categories.map((category: any, index: number) => (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: analytics.categoryDistribution[index]?.color || '#3B82F6' }}
                      />
                          <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                          <div className="font-semibold">{category.count}</div>
                          <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                ))
              ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma categoria encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Performance das Campanhas</span>
            </CardTitle>
            <CardDescription>
                Estatísticas detalhadas de campanhas e mensagens
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-6">
                {/* Métricas de Performance */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800/30">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.overview.performance?.successMessages || 0}
                    </div>
                    <div className="text-sm text-green-600 font-medium">Mensagens Enviadas</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30">
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.overview.performance?.failedMessages || 0}
                    </div>
                    <div className="text-sm text-red-600 font-medium">Mensagens Falharam</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/30">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.overview.performance?.successRate || 0}%
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/30">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.overview.campaignStats?.total || 0}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Total Campanhas</div>
                  </div>
                </div>

                {/* Status das Campanhas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800/30">
                    <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                      {analytics.overview.campaignStats?.completed || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">Finalizadas</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800/30">
                    <div className="text-xl font-bold text-yellow-600">
                      {analytics.overview.campaignStats?.sending || 0}
                    </div>
                    <div className="text-sm text-yellow-600">Em Andamento</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/30">
                    <div className="text-xl font-bold text-blue-600">
                      {analytics.overview.campaignStats?.draft || 0}
                    </div>
                    <div className="text-sm text-blue-600">Rascunhos</div>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
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
              <div className="space-y-3">
                <AnimatePresence>
                  {analytics.recentActivity.map((activity: any, index: number) => (
                    <ActivityItem
                key={activity.id}
                      activity={activity}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
                
                {analytics.recentActivity.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade recente encontrada</p>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};