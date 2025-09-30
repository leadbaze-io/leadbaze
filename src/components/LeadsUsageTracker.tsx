import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Zap, RefreshCw } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import type { LeadsUsageHistory } from '../types/subscription';
import { supabase } from '../lib/supabaseClient';
import '../styles/leads-usage-tracker.css';

interface LeadsUsageTrackerProps {
  className?: string;
}

export const LeadsUsageTracker: React.FC<LeadsUsageTrackerProps> = ({ className = '' }) => {
  const { subscription, refetch } = useSubscription();
  const [usageHistory, setUsageHistory] = useState<LeadsUsageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar histórico de uso
  const fetchUsageHistory = async () => {
    try {
      setIsLoading(true);
      
      if (!subscription) return;

      // Buscar o user_id do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('leads_usage_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscription_id', subscription.id)
        .eq('operation_type', 'generated') // Apenas gerações reais, não bonus
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar histórico de uso:', error);
        return;
      }

      setUsageHistory(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = () => {
    if (!subscription) return null;

    const now = new Date();
    const periodStart = new Date(subscription.current_period_start);
    const periodEnd = new Date(subscription.current_period_end);
    
    // Usar dados reais da assinatura em vez de calcular do histórico
    const totalUsed = subscription.leads_used || 0;
    const totalLeadsAvailable = subscription.leads_limit || 0;
    
    const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const averageDailyUsage = daysPassed > 0 ? totalUsed / daysPassed : 0;
    
    // Projeção baseada no plano real, não na média diária
    const projectedMonthlyUsage = totalLeadsAvailable;
    // Calcular dias até reset baseado no ciclo de cobrança
    const calculateDaysUntilReset = () => {
      // Se a data de fim do período já passou, calcular próximo ciclo
      if (periodEnd <= now) {
        // Calcular próximo ciclo (30 dias a partir de agora)
        const nextCycle = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return Math.ceil((nextCycle.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Se ainda está no período atual, calcular dias restantes
      return Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const daysUntilReset = calculateDaysUntilReset();
    
    // Calcular porcentagem de uso baseada no limite real
    const usagePercentage = totalLeadsAvailable > 0 ? (totalUsed / totalLeadsAvailable) * 100 : 0;

    // Calcular dias ativos
    const activeDays = usageHistory.filter(usage => {
      const usageDate = new Date(usage.created_at);
      return usageDate >= periodStart && usageDate <= now;
    }).reduce((unique: string[], usage) => {
      const date = new Date(usage.created_at).toDateString();
      if (!unique.includes(date)) {
        unique.push(date);
      }
      return unique;
    }, []).length;

    // Calcular maior uso diário
    const dailyUsageMap = new Map();
    usageHistory.forEach(usage => {
      const date = new Date(usage.created_at).toDateString();
      const current = dailyUsageMap.get(date) || 0;
      dailyUsageMap.set(date, current + usage.leads_generated);
    });

    let maxDailyUsage = 0;
    let maxUsageDate = '';
    dailyUsageMap.forEach((usage, date) => {
      if (usage > maxDailyUsage) {
        maxDailyUsage = usage;
        maxUsageDate = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
    });

    return {
      totalUsed,
      averageDailyUsage,
      projectedMonthlyUsage,
      daysUntilReset,
      usagePercentage,
      daysInPeriod,
      daysPassed,
      activeDays,
      maxDailyUsage,
      maxUsageDate
    };
  };

  // Gerar dados para o gráfico
  const generateChartData = () => {
    if (!subscription) return [];

    const now = new Date();
    const periodStart = new Date(subscription.current_period_start);
    const daysInPeriod = Math.ceil((new Date(subscription.current_period_end).getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const chartData = [];
    for (let i = 0; i < Math.min(daysInPeriod, 30); i++) {
      const date = new Date(periodStart);
      date.setDate(date.getDate() + i);
      
      const dayUsage = usageHistory
        .filter(usage => {
          const usageDate = new Date(usage.created_at);
          return usageDate.toDateString() === date.toDateString();
        })
        .reduce((sum, usage) => sum + usage.leads_generated, 0);
      
      chartData.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        usage: dayUsage,
        isToday: date.toDateString() === now.toDateString()
      });
    }
    
    return chartData;
  };

  // Gerar dados semanais
  const getWeeklyUsage = () => {
    if (!subscription) return [];

    const periodStart = new Date(subscription.current_period_start);
    const weeks = [];
    
    // Gerar dados dos últimos 28 dias (4 semanas)
    for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
      const weekStart = new Date(periodStart);
      weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
      
      const weekDays = [];
      let totalLeads = 0;
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayIndex);
        
        const dayUsage = usageHistory
          .filter(usage => {
            const usageDate = new Date(usage.created_at);
            return usageDate.toDateString() === date.toDateString();
          })
          .reduce((sum, usage) => sum + usage.leads_generated, 0);
        
        weekDays.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          leadsUsed: dayUsage
        });
        
        totalLeads += dayUsage;
      }
      
      weeks.push({
        days: weekDays,
        totalLeads,
        averageLeads: totalLeads / 7
      });
    }
    
    return weeks;
  };

  // Calcular tendência de uso
  const getUsageTrend = () => {
    if (!stats || chartData.length < 7) return 'Estável';
    
    const recentWeek = chartData.slice(-7);
    const previousWeek = chartData.slice(-14, -7);
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.usage, 0) / 7;
    const previousAvg = previousWeek.reduce((sum, day) => sum + day.usage, 0) / 7;
    
    const change = ((recentAvg - previousAvg) / (previousAvg || 1)) * 100;
    
    if (change > 20) return 'Crescendo';
    if (change < -20) return 'Diminuindo';
    return 'Estável';
  };

  // Obter descrição da tendência
  const getTrendDescription = () => {
    const trend = getUsageTrend();
    switch (trend) {
      case 'Crescendo':
        return 'Uso aumentando';
      case 'Diminuindo':
        return 'Uso diminuindo';
      default:
        return 'Uso consistente';
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchUsageHistory();
  }, [subscription]);

  // Atualizar dados
  const handleRefresh = async () => {
    await Promise.all([refetch(), fetchUsageHistory()]);
  };

  const stats = calculateStats();
  const chartData = generateChartData();

  if (!subscription) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma Assinatura Ativa
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Assine um plano para acompanhar seu uso de leads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`leads-usage-section rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="leads-usage-header flex items-center justify-between mb-6 p-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="leads-usage-title text-lg font-semibold">
              Uso de Leads
            </h3>
            <p className="leads-usage-description text-sm">
              Acompanhe seu consumo mensal
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Estatísticas Principais */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="leads-usage-stat-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="leads-usage-stat-label text-sm">Utilizados</span>
            </div>
            <div className="leads-usage-stat-value text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR').format(stats.totalUsed)}
            </div>
            <div className="leads-usage-stat-label text-xs">
              de {new Intl.NumberFormat('pt-BR').format(subscription.leads_limit || 0)}
            </div>
          </div>
          
          <div className="leads-usage-stat-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="leads-usage-stat-label text-sm">Média Diária</span>
            </div>
            <div className="leads-usage-stat-value text-2xl font-bold">
              {Math.round(stats.averageDailyUsage)}
            </div>
            <div className="leads-usage-stat-label text-xs">
              leads por dia
            </div>
          </div>
          
          <div className="leads-usage-stat-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="leads-usage-stat-label text-sm">Projeção</span>
            </div>
            <div className="leads-usage-stat-value text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR').format(subscription.leads_limit || 0)}
            </div>
            <div className="leads-usage-stat-label text-xs">
              leads disponíveis
            </div>
          </div>
          
          <div className="leads-usage-stat-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="leads-usage-stat-label text-sm">Novos leads em</span>
            </div>
            <div className="leads-usage-stat-value text-2xl font-bold">
              {stats.daysUntilReset}
            </div>
            <div className="leads-usage-stat-label text-xs">
              dias
            </div>
          </div>
        </div>
      )}

      {/* Barra de Progresso */}
      {stats && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="leads-usage-stat-label text-sm font-medium">
              Progresso do Mês
            </span>
            <span className="leads-usage-stat-value text-sm font-bold">
              {Math.round(stats.usagePercentage)}%
            </span>
          </div>
          
          <div className="leads-usage-progress-bg w-full rounded-full h-3">
            <div 
              className={`leads-usage-progress-bar h-3 rounded-full transition-all duration-300 ${
                stats.usagePercentage >= 90 ? 'bg-red-500' :
                stats.usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between leads-usage-progress-text text-xs mt-1">
            <span>{new Intl.NumberFormat('pt-BR').format(stats.totalUsed)} utilizados</span>
            <span>{new Intl.NumberFormat('pt-BR').format(subscription.leads_remaining || 0)} restantes</span>
          </div>
        </div>
      )}

      {/* Visualização de Uso por Semana */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h4 className="leads-usage-title text-sm font-semibold mb-4">
            Uso por Semana (Últimas 4 semanas)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getWeeklyUsage().map((week, weekIndex) => (
              <div key={weekIndex} className="leads-usage-week-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="leads-usage-week-title text-sm font-medium">
                    Semana {weekIndex + 1}
                  </h5>
                  <div className="flex items-center gap-1">
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-2 h-2 rounded-full ${
                          day.leadsUsed > 0 
                            ? 'leads-usage-week-dot-active' 
                            : 'leads-usage-week-dot-inactive'
                        }`}
                        title={`${day.date}: ${day.leadsUsed} leads`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="leads-usage-week-label text-xs">Total:</span>
                    <span className="leads-usage-week-metric text-sm font-semibold">
                      {week.totalLeads}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="leads-usage-week-label text-xs">Média:</span>
                    <span className="leads-usage-week-metric text-sm font-semibold">
                      {week.averageLeads.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="leads-usage-progress-bg w-full rounded-full h-2">
                    <div
                      className="leads-usage-progress-bar h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((week.totalLeads / (subscription?.plan?.leads || 1000)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Padrão de Uso */}
      {stats && (
        <div className="mb-6">
          <h4 className="leads-usage-title text-sm font-semibold mb-4">
            Padrão de Uso
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="leads-usage-pattern-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="leads-usage-pattern-title text-sm font-medium">Dias Ativos</span>
              </div>
              <div className="leads-usage-pattern-value text-lg font-bold">
                {stats.activeDays || 0} de {chartData.length}
              </div>
              <div className="leads-usage-pattern-description text-xs mt-1">
                {((stats.activeDays || 0) / chartData.length * 100).toFixed(1)}% dos dias
              </div>
            </div>
            
            <div className="leads-usage-pattern-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="leads-usage-pattern-title text-sm font-medium">Maior Uso</span>
              </div>
              <div className="leads-usage-pattern-value text-lg font-bold">
                {stats.maxDailyUsage || 0} leads
              </div>
              <div className="leads-usage-pattern-description text-xs mt-1">
                {stats.maxUsageDate || 'N/A'}
              </div>
            </div>
            
            <div className="leads-usage-pattern-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="leads-usage-pattern-title text-sm font-medium">Tendência</span>
              </div>
              <div className="leads-usage-pattern-value text-lg font-bold">
                {getUsageTrend()}
              </div>
              <div className="leads-usage-pattern-description text-xs mt-1">
                {getTrendDescription()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Histórico Recente */}
      {usageHistory.length > 0 && (
        <div>
          <h4 className="leads-usage-title text-sm font-semibold mb-3">
            Atividade Recente
          </h4>
          
          {/* Nota explicativa para planos de teste */}
          {subscription.is_free_trial && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-800 dark:text-blue-200">
                  Histórico mostra apenas gerações realizadas (não inclui bonus). Consumo real: {subscription.leads_used || 0} de {subscription.leads_limit || 0} leads.
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {usageHistory.slice(0, 8).map((usage) => (
              <div key={usage.id} className="leads-usage-activity-item flex items-center justify-between p-3 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="leads-usage-activity-text text-sm">
                    {usage.leads_generated} lead{usage.leads_generated > 1 ? 's' : ''} gerado{usage.leads_generated > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="leads-usage-activity-count text-sm font-semibold">
                    +{usage.leads_generated}
                  </span>
                  <span className="leads-usage-activity-date text-xs">
                    {new Date(usage.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aviso de Limite */}
      {stats && stats.usagePercentage >= 80 && (
        <div className="leads-usage-warning mt-4 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.usagePercentage >= 100 ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <span className="leads-usage-warning-text text-sm font-medium">
              {stats.usagePercentage >= 100 
                ? 'Limite esgotado! Considere atualizar seu plano.'
                : stats.usagePercentage >= 90 
                ? 'Limite quase esgotado! Considere atualizar seu plano.'
                : 'Você está usando mais de 80% do seu limite mensal.'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
