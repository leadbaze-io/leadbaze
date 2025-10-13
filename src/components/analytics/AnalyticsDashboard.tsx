import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {

  Users,

  Target,
  Activity,

  Clock,

  CheckCircle,

  Send,
  BarChart3,
  RefreshCw,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { AnalyticsService } from '../../lib/analyticsService';

// Componente de KPI Card seguindo o padrão do Dashboard
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
  const getGradientClasses = (color: string) => {
    const gradients = {
      blue: 'from-green-500 to-emerald-600',
      green: 'from-green-500 to-emerald-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-green-500 to-emerald-600',
      orange: 'from-green-500 to-emerald-600',
      indigo: 'from-green-500 to-emerald-600'
    };
    return gradients[color as keyof typeof gradients] || gradients.green;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6 lg:p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium dashboard-card-muted-claro dark:text-muted-foreground mb-1 sm:mb-2">
            {title}
          </p>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold dashboard-card-title-claro dark:text-foreground">
              {loading ? (
                <div className="h-6 sm:h-8 w-16 sm:w-20 skeleton-loading-force animate-pulse rounded" />
              ) : (
                value
              )}
            </h3>
            {change !== undefined && !loading && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                change > 0 ? 'text-green-600 dark:text-green-400' :

                change < 0 ? 'text-red-600 dark:text-red-400' :

                'dashboard-card-muted-claro dark:text-muted-foreground'
              }`}>
                {change > 0 ? <ArrowUpRight className="w-4 h-4" /> :

                 change < 0 ? <ArrowDownRight className="w-4 h-4" /> :

                 <Minus className="w-4 h-4" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r ${getGradientClasses(color)} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Activity Item seguindo o padrão do Dashboard
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

  const getActivityGradient = (type: string) => {
    switch (type) {
      case 'campaign_completed': return 'from-green-500 to-emerald-600';
      case 'campaign_sent': return 'from-green-500 to-emerald-600';
      case 'campaign_created': return 'from-green-500 to-emerald-600';
      case 'list_created': return 'from-green-500 to-emerald-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className="group"
    >
      <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl p-4 sm:p-6 shadow-lg border transition-all duration-300 group-hover:shadow-xl">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 bg-gradient-to-r ${getActivityGradient(activity.type)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            {getActivityIcon(activity.type)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold dashboard-card-text-claro dark:text-foreground truncate">
              {activity.description}
            </p>
            <p className="text-xs dashboard-card-muted-claro dark:text-muted-foreground">
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
              <span className="dashboard-badge-claro dashboard-badge-escuro px-3 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                {activity.count}
              </span>
            )}

            {activity.successRate && activity.successRate > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                {activity.successRate}% sucesso
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal do Analytics Dashboard
export const AnalyticsDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'activity'>('performance');

  const loadAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await AnalyticsService.getAllAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {

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
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl dashboard-glow-green" style={{background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'}}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" style={{color: '#10b981'}} />
            </div>
            <div>
              <div className="h-8 w-48 bg-white/20 animate-pulse rounded mb-2" />
              <div className="h-4 w-64 bg-white/20 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="dashboard-info-card-claro dashboard-info-card-escuro rounded-3xl shadow-lg border p-6 sm:p-8">
              <div className="h-32 skeleton-loading-force animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 dashboard-badge-claro dashboard-badge-escuro rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8" style={{color: '#10b981'}} />
          </div>
          <h3 className="text-lg font-semibold dashboard-card-title-claro dark:text-foreground mb-2">
            Nenhum dado disponível
          </h3>
          <p className="dashboard-card-muted-claro dark:text-muted-foreground mb-4">
            Não há dados de analytics para exibir no momento.
          </p>
          <button

            onClick={handleRefresh}

            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header seguindo o padrão do Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl dashboard-glow-green"
        style={{
          background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-white/5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            opacity: 0.1
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" style={{color: '#10b981'}} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm lg:text-base">
                    Acompanhe o desempenho das suas campanhas
                  </p>
                </div>
              </motion.div>
          </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <select

                value={timeRange}

                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 text-xs sm:text-sm"
              >
                <option value="7d" className="text-gray-900">7 dias</option>
                <option value="30d" className="text-gray-900">30 dias</option>
                <option value="90d" className="text-gray-900">90 dias</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-white border border-white/20 hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
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

      {/* Navigation Tabs seguindo o padrão do Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dashboard-nav-card-claro dashboard-nav-card-escuro rounded-2xl p-2 shadow-lg border"
      >
        <nav className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('performance')}
            className={`relative py-2 sm:py-4 px-3 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 transform ${
              activeTab === 'performance'
                ? 'scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: activeTab === 'performance' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'transparent',
              color: activeTab === 'performance' 
                ? '#ffffff' 
                : isDark ? '#9ca3af' : '#6b7280',
              boxShadow: activeTab === 'performance' 
                ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                : 'none'
            }}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </div>
            {activeTab === 'performance' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl blur opacity-20 -z-10"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`relative py-2 sm:py-4 px-3 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 transform ${
              activeTab === 'activity'
                ? 'scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: activeTab === 'activity' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'transparent',
              color: activeTab === 'activity' 
                ? '#ffffff' 
                : isDark ? '#9ca3af' : '#6b7280',
              boxShadow: activeTab === 'activity' 
                ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                : 'none'
            }}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Atividade</span>
              <span className="sm:hidden">Ativ</span>
            </div>
            {activeTab === 'activity' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl blur opacity-20 -z-10"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              />
            )}
          </button>

        </nav>
      </motion.div>

      {/* Content Tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-3xl shadow-lg border p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold dashboard-card-title-claro dark:text-foreground">
                  Métricas de Campanhas
                </h3>
              </div>

              <div className="space-y-8">
                {/* Métricas de Performance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                          Erros
                        </p>
                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold dashboard-card-title-claro dark:text-foreground">
                          {analytics.overview.performance?.failedMessages || 0}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                          Tempo Médio
                        </p>
                        <div className="flex items-baseline space-x-1">
                          <p className="text-2xl sm:text-3xl font-bold dashboard-card-title-claro dark:text-foreground">
                            10
                          </p>
                          <p className="text-xs dashboard-card-muted-claro dark:text-muted-foreground">
                            seg por mensagem
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                          Eficiência de Listas
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold dashboard-card-title-claro dark:text-foreground">
                          {analytics.overview.totalLists > 0 ?

                            Math.round(analytics.overview.totalLeads / analytics.overview.totalLists) : 0
                          }
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Métricas de Produtividade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                          Leads por Campanha
                        </p>
                        <p className="text-2xl font-bold dashboard-card-title-claro dark:text-foreground">
                          {analytics.overview.campaignStats?.total > 0 ?

                            Math.round(analytics.overview.totalLeads / analytics.overview.campaignStats.total) : 0
                          }
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="dashboard-info-card-claro dashboard-info-card-escuro rounded-2xl sm:rounded-3xl shadow-lg border p-3 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold dashboard-card-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                          Rating Médio
                        </p>
                        <div className="flex items-baseline space-x-1">
                          <p className="text-2xl font-bold dashboard-card-title-claro dark:text-foreground">
                            {analytics.overview.averageRating || 0}
                          </p>
                          <p className="text-xs dashboard-card-muted-claro dark:text-muted-foreground">
                            /5.0
                          </p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="dashboard-info-card-claro dashboard-info-card-escuro rounded-3xl shadow-lg border p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold dashboard-card-title-claro dark:text-foreground">
                  Atividade Recente
                </h3>
      </div>

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
                  <div className="text-center py-12 dashboard-card-muted-claro dark:text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade recente encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};