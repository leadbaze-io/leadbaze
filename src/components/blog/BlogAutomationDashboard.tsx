/**
 * =====================================================
 * BLOG AUTOMATION DASHBOARD
 * Dashboard para monitoramento de automação do blog
 * Acesso restrito ao admin: creaty12345@gmail.com
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  FileText,
  User,
  Zap,
  Database
} from 'lucide-react';
import blogAutomationService from '../../lib/blogAutomationService';
import type { 
  BlogAutomationStats, 
  BlogQueueItem, 
  BlogAutomationConfig,
  HealthStatus 
} from '../../lib/blogAutomationService';
import { supabase } from '../../lib/supabaseClient';

const BlogAutomationDashboard: React.FC = () => {
  // Estados
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BlogAutomationStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [queue, setQueue] = useState<BlogQueueItem[]>([]);
  const [config, setConfig] = useState<BlogAutomationConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'config' | 'logs'>('overview');
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Verificar autenticação e autorização
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        setCurrentUser(user);
        // Verificação de admin (e-mail direto + hash para segurança)
        if (user?.email) {
          const isAuthorized = await blogAutomationService.isAuthorizedAdmin();
          setIsAuthorized(isAuthorized);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setCurrentUser(user);
      // Verificação de admin (e-mail direto + hash para segurança)
      if (user?.email) {
        const isAuthorized = await blogAutomationService.isAuthorizedAdmin();
        setIsAuthorized(isAuthorized);
      } else {
        setIsAuthorized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
      
      // Desabilitar polling automático para produção
      // const interval = setInterval(loadDashboardData, 120000);
      // return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  // Subscription para mudanças em tempo real
  useEffect(() => {
    if (!isAuthorized) return;

    const queueSubscription = blogAutomationService.subscribeToQueueChanges((payload) => {
      console.log('Mudança na fila:', payload);
      loadQueue(); // Recarregar fila
      loadStats(); // Recarregar estatísticas
    });

    const postsSubscription = blogAutomationService.subscribeToNewPosts((payload) => {
      console.log('Novo post criado:', payload);
      loadStats(); // Recarregar estatísticas
    });

    return () => {
      queueSubscription?.unsubscribe();
      postsSubscription?.unsubscribe();
    };
  }, [isAuthorized]);

  // Carregar dados essenciais apenas (otimizado para produção)
  const loadDashboardData = async () => {
    if (!isAuthorized) return;
    
    try {
      // Carregar apenas dados essenciais
      await Promise.all([
        loadStats(),
        loadQueue()
      ]);
      
      // Carregar dados secundários apenas se necessário
      // loadHealth() e loadConfig() removidos para reduzir requisições
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await blogAutomationService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar health status
  const loadHealth = async () => {
    try {
      const healthData = await blogAutomationService.getHealthStatus();
      setHealth(healthData);
    } catch (error) {
      console.error('Erro ao carregar health:', error);
    }
  };

  // Carregar fila
  const loadQueue = async () => {
    try {
      const response = await blogAutomationService.getQueue(50);
      if (response.success) {
        setQueue(response.queue);
      }
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    }
  };

  // Carregar configuração
  const loadConfig = async () => {
    try {
      const response = await blogAutomationService.getConfig();
      if (response.success) {
        setConfig(response.config);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  // Carregar logs
  const loadLogs = async () => {
    try {
      const response = await blogAutomationService.getLogs(50);
      if (response.success) {
        setLogs(response.logs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  // Processar fila manualmente
  const handleProcessQueue = async () => {
    console.log('🎯 [Dashboard] ===== INICIANDO PROCESSAMENTO DA FILA =====');
    console.log('⏰ [Dashboard] Timestamp:', new Date().toISOString());
    console.log('👤 [Dashboard] Usuário autorizado:', isAuthorized);
    console.log('🔧 [Dashboard] blogAutomationService:', blogAutomationService);
    
    setProcessing(true);
    console.log('🔄 [Dashboard] Estado processing definido como true');
    
    try {
      console.log('📞 [Dashboard] ===== CHAMANDO BLOG AUTOMATION SERVICE =====');
      console.log('📞 [Dashboard] Método: blogAutomationService.processQueue()');
      console.log('📞 [Dashboard] Tipo do serviço:', typeof blogAutomationService);
      console.log('📞 [Dashboard] Método existe?', typeof blogAutomationService.processQueue);
      
      const result = await blogAutomationService.processQueue();
      
      console.log('📊 [Dashboard] ===== RESULTADO RECEBIDO =====');
      console.log('📊 [Dashboard] Tipo do resultado:', typeof result);
      console.log('📊 [Dashboard] Resultado completo:', JSON.stringify(result, null, 2));
      console.log('📊 [Dashboard] result.success:', result?.success);
      console.log('📊 [Dashboard] result.processed:', result?.processed);
      console.log('📊 [Dashboard] result.errors:', result?.errors);
      console.log('📊 [Dashboard] result.details:', result?.details);
      
      if (result.success) {
        console.log('✅ [Dashboard] ===== PROCESSAMENTO BEM-SUCEDIDO =====');
        console.log('✅ [Dashboard] Processados:', result.processed);
        console.log('✅ [Dashboard] Erros:', result.errors);
        alert(`✅ Processamento concluído!\n📝 Processados: ${result.processed}\n❌ Erros: ${result.errors}`);
        console.log('🔄 [Dashboard] Recarregando dados do dashboard...');
        loadDashboardData(); // Recarregar dados
      } else {
        console.log('❌ [Dashboard] ===== PROCESSAMENTO FALHOU =====');
        console.log('❌ [Dashboard] Mensagem de erro:', result.message);
        alert(`❌ Erro no processamento: ${result.message}`);
      }
    } catch (error) {
      console.error('💥 [Dashboard] ===== ERRO CAPTURADO =====');
      console.error('💥 [Dashboard] Tipo do erro:', typeof error);
      console.error('💥 [Dashboard] Erro completo:', error);
      console.error('💥 [Dashboard] Error message:', error instanceof Error ? error.message : String(error));
      console.error('💥 [Dashboard] Error stack:', error instanceof Error ? error.stack : 'N/A');
      alert(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      console.log('🏁 [Dashboard] ===== FINALIZANDO PROCESSAMENTO =====');
      console.log('🔄 [Dashboard] Estado processing definido como false');
      setProcessing(false);
      console.log('⏰ [Dashboard] Timestamp final:', new Date().toISOString());
    }
  };

  // Processar item específico
  const handleProcessItem = async (itemId: string) => {
    try {
      const result = await blogAutomationService.processItem(itemId);
      if (result.success) {
        alert('✅ Item processado com sucesso!');
        loadDashboardData();
      } else {
        alert(`❌ Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao processar item:', error);
      alert(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Controlar scheduler
  const handleSchedulerControl = async (action: 'start' | 'stop') => {
    try {
      const result = await blogAutomationService.controlScheduler(action);
      if (result.success) {
        alert(result.message);
        loadConfig();
        loadHealth();
      }
    } catch (error) {
      console.error('Erro ao controlar scheduler:', error);
      alert(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Este dashboard é restrito apenas para administradores autorizados.
          </p>
          {currentUser ? (
            <p className="text-sm text-gray-500">
              Usuário atual: {currentUser.email}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Você precisa estar logado para acessar esta área.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Blog Automation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sistema de automação de artigos via N8N
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status de saúde */}
              {health && (
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    health.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {health.status === 'healthy' ? 'Sistema Saudável' : 'Sistema com Problemas'}
                  </span>
                </div>
              )}
              
              {/* Usuário */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center space-x-8">
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'queue', label: 'Fila de Artigos', icon: FileText },
              { id: 'config', label: 'Configurações', icon: Settings },
              { id: 'logs', label: 'Logs', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats}
            health={health}
            config={config}
            onProcessQueue={handleProcessQueue}
            onSchedulerControl={handleSchedulerControl}
            processing={processing}
          />
        )}
        
        {activeTab === 'queue' && (
          <QueueTab 
            queue={queue}
            onProcessItem={handleProcessItem}
            onRefresh={loadQueue}
          />
        )}
        
        {activeTab === 'config' && (
          <ConfigTab 
            config={config}
            onConfigUpdate={loadConfig}
          />
        )}
        
        {activeTab === 'logs' && (
          <LogsTab 
            logs={logs}
            onRefresh={loadLogs}
          />
        )}
      </div>
    </div>
  );
};

// Componente da aba Overview
const OverviewTab: React.FC<{
  stats: BlogAutomationStats | null;
  health: HealthStatus | null;
  config: BlogAutomationConfig | null;
  onProcessQueue: () => void;
  onSchedulerControl: (action: 'start' | 'stop') => void;
  processing: boolean;
}> = ({ stats, config, onProcessQueue, onSchedulerControl, processing }) => {
  
  const progress = stats ? blogAutomationService.calculateProgress(stats) : 0;
  const statusSummary = stats ? blogAutomationService.getStatusSummary(stats) : '';

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total na Fila"
          value={stats?.total_queue || 0}
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Pendentes"
          value={stats?.pending || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Processados"
          value={stats?.processed || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Erros"
          value={stats?.errors || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Progresso geral */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Progresso Geral
          </h3>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div 
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {statusSummary}
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Controles do Sistema
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onProcessQueue}
            disabled={processing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
              processing 
                ? 'bg-blue-500 cursor-not-allowed scale-95' 
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            } text-white disabled:opacity-70`}
          >
            {processing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">Processando...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Processar Fila</span>
              </>
            )}
          </button>
          
          {config?.schedulerActive ? (
            <button
              onClick={() => onSchedulerControl('stop')}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Pause className="h-5 w-5" />
              <span>Parar Scheduler</span>
            </button>
          ) : (
            <button
              onClick={() => onSchedulerControl('start')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Play className="h-5 w-5" />
              <span>Iniciar Scheduler</span>
            </button>
          )}
        </div>
        
        {/* Status do scheduler */}
        {config && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Scheduler Status:
              </span>
              <span className={`text-sm font-medium ${
                config.schedulerActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {config.schedulerActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Agendamento: {config.cronSchedule}</p>
              <p>Fuso horário: {config.timezone}</p>
              {config.lastExecution && (
                <p>Última execução: {blogAutomationService.formatDate(config.lastExecution)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de card de estatística
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red';
}> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    yellow: 'bg-yellow-500 text-yellow-600',
    red: 'bg-red-500 text-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Componente da aba de fila
const QueueTab: React.FC<{
  queue: BlogQueueItem[];
  onProcessItem: (itemId: string) => void;
  onRefresh: () => void;
}> = ({ queue, onProcessItem, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Fila de Artigos ({queue.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {queue.map((item) => {
                const status = blogAutomationService.getItemStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                      {item.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {item.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.autor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 text-sm ${status.color}`}>
                        <span>{status.icon}</span>
                        <span>{status.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {!item.processed && (
                          <button
                            onClick={() => onProcessItem(item.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            Processar
                          </button>
                        )}
                        {item.blog_posts?.slug && (
                          <a
                            href={`/blog/${item.blog_posts.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 text-sm font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver Post</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {queue.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum item na fila
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente da aba de configuração
const ConfigTab: React.FC<{
  config: BlogAutomationConfig | null;
  onConfigUpdate: () => void;
}> = ({ config }) => {
  if (!config) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Carregando configurações...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Configurações do Sistema
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configuração Atual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status do Sistema
            </label>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              config.enabled 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {config.enabled ? 'Habilitado' : 'Desabilitado'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agendamento (Cron)
            </label>
            <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
              {config.cronSchedule}
            </code>
            <p className="text-xs text-gray-500 mt-1">Todo dia às 9h da manhã</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuso Horário
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {config.timezone}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Tentativas
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {config.maxRetries}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delay entre Tentativas
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {config.retryDelay}ms
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Autorizado
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {config.adminEmail}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Status Atual
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Scheduler: </span>
              <span className={config.schedulerActive ? 'text-green-600' : 'text-red-600'}>
                {config.schedulerActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Executando: </span>
              <span className={config.isRunning ? 'text-blue-600' : 'text-gray-500'}>
                {config.isRunning ? 'Sim' : 'Não'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Última Execução: </span>
              <span className="text-gray-900 dark:text-white">
                {config.lastExecution 
                  ? blogAutomationService.formatDate(config.lastExecution)
                  : 'Nunca'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente da aba de logs
const LogsTab: React.FC<{
  logs: any[];
  onRefresh: () => void;
}> = ({ logs, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Logs do Sistema ({logs.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0 mt-1">
                {log.processed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : log.error_message ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {log.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {blogAutomationService.formatDate(log.created_at)}
                </div>
                {log.error_message && (
                  <div className="text-xs text-red-600 mt-1">
                    {log.error_message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum log encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAutomationDashboard;
