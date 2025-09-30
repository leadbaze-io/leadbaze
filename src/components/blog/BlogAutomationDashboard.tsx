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
  Database,
  Trash2,
  Edit,
  Menu
} from 'lucide-react';
import blogAutomationService from '../../lib/blogAutomationService';
import type {

  BlogAutomationStats,

  BlogQueueItem,

  BlogAutomationConfig,
  HealthStatus

} from '../../lib/blogAutomationService';
import { supabase } from '../../lib/supabaseClient';
import BlogRealtimeMonitor from './BlogRealtimeMonitor';
import AddPostToQueue from './AddPostToQueue';

const BlogAutomationDashboard: React.FC = () => {
  // Estados
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BlogAutomationStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [queue, setQueue] = useState<BlogQueueItem[]>([]);
  const [config, setConfig] = useState<BlogAutomationConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'config' | 'logs' | 'posts' | 'realtime'>('overview');
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const queueSubscription = blogAutomationService.subscribeToQueueChanges((_payload) => {

      loadQueue(); // Recarregar fila
      loadStats(); // Recarregar estatísticas
    });

    const postsSubscription = blogAutomationService.subscribeToNewPosts((_payload) => {

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

      // Carregar posts se estiver na aba de posts
      if (activeTab === 'posts') {
        loadPosts();
      }

      // Carregar dados secundários apenas se necessário
      // loadHealth() e loadConfig() removidos para reduzir requisições

    } catch (error) {

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

    }
  };

  // Carregar health status
  const loadHealth = async () => {
    try {
      const healthData = await blogAutomationService.getHealthStatus();
      setHealth(healthData);
    } catch (error) {

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

    }
  };

  // Carregar posts criados
  const loadPosts = async () => {
    try {

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          published,
          published_at,
          created_at,
          blog_categories (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {

        alert(`❌ Erro ao carregar posts: ${error.message}`);
        return;
      }
      setPosts(data || []);
    } catch (error) {

      alert(`❌ Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Deletar post
  const handleDeletePost = async (postId: string, postTitle: string) => {

    if (!confirm(`Tem certeza que deseja deletar o post "${postTitle}"?\n\nEsta ação não pode ser desfeita.`)) {

      return;
    }

    try {

      // Primeiro, verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {

        alert('❌ Você precisa estar logado para deletar posts');
        return;
      }
      // Usar sempre a API backend para deletar (tem SERVICE ROLE KEY)
      console.log('🗑️ [Delete] Body:', JSON.stringify({ postId }));

      const response = await fetch('/api/blog/delete-post', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || ''
        },
        body: JSON.stringify({ postId })
      });
      console.log('🗑️ [Delete] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();

      if (result.success) {

        alert('✅ Post deletado com sucesso!');
        loadPosts(); // Recarregar lista
      } else {

        alert(`❌ Erro ao deletar post: ${result.message}`);
      }
    } catch (error) {

      alert(`❌ Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Processar fila manualmente
  const handleProcessQueue = async () => {

    console.log('⏰ [Dashboard] Timestamp:', new Date().toISOString());
    setProcessing(true);

    try {

      console.log('📞 [Dashboard] Método: blogAutomationService.processQueue()');
      const result = await blogAutomationService.processQueue();
      console.log('📊 [Dashboard] Resultado completo:', JSON.stringify(result, null, 2));
      if (result.success) {
        alert(`✅ Processamento concluído!\n📝 Processados: ${result.processed}\n❌ Erros: ${result.errors}`);

        loadDashboardData(); // Recarregar dados
      } else {
        alert(`❌ Erro no processamento: ${result.message}`);
      }
    } catch (error) {
      console.error('💥 [Dashboard] Error message:', error instanceof Error ? error.message : String(error));

      alert(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
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
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
            </div>
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
          {/* Header Mobile */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Blog Auto
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Sistema de automação de artigos via N8N
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              {/* Desktop Refresh Button */}
              <button
                onClick={loadDashboardData}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>

              {/* Mobile Refresh Button */}
              <button
                onClick={loadDashboardData}
                className="sm:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop Admin Badge */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                  <User className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Desktop */}
          <div className="hidden sm:flex items-center space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'queue', label: 'Fila de Artigos', icon: FileText },
              { id: 'posts', label: 'Posts Criados', icon: Edit },
              { id: 'realtime', label: 'Tempo Real', icon: Zap },
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                  { id: 'queue', label: 'Fila de Artigos', icon: FileText },
                  { id: 'posts', label: 'Posts Criados', icon: Edit },
                  { id: 'realtime', label: 'Tempo Real', icon: Zap },
                  { id: 'config', label: 'Configurações', icon: Settings },
                  { id: 'logs', label: 'Logs', icon: Activity }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}

                {/* Mobile Admin Info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center px-4">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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

        {activeTab === 'posts' && (
          <PostsTab

            posts={posts}
            onDeletePost={handleDeletePost}
            onRefresh={loadPosts}
          />
        )}

        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <AddPostToQueue />
            <BlogRealtimeMonitor />
          </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
            Progresso Geral
          </h3>
          <span className="text-xl sm:text-2xl font-bold text-blue-600">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div

            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {statusSummary}
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
          Controles do Sistema
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onProcessQueue}
            disabled={processing}
            className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
              processing

                ? 'bg-blue-500 cursor-not-allowed scale-95'

                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            } text-white disabled:opacity-70`}
          >
            {processing ? (
              <>
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="animate-pulse text-sm sm:text-base">Processando...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Processar Fila</span>
              </>
            )}
          </button>

          {config?.schedulerActive ? (
            <button
              onClick={() => onSchedulerControl('stop')}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Parar Scheduler</span>
            </button>
          ) : (
            <button
              onClick={() => onSchedulerControl('start')}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Iniciar Scheduler</span>
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-6"
    >
      <div className="flex items-center">
        <div className={`p-1.5 sm:p-2 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <div className="ml-2 sm:ml-4">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Fila de Artigos ({queue.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {queue.map((item) => {
            const status = blogAutomationService.getItemStatus(item);
            return (
              <div key={item.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>
                  <span className={`inline-flex items-center space-x-1 text-xs ${status.color} ml-2`}>
                    <span>{status.icon}</span>
                    <span>{status.status}</span>
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p><strong>Categoria:</strong> {item.category}</p>
                  <p><strong>Autor:</strong> {item.autor}</p>
                  <p><strong>Data:</strong> {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                </div>

                {item.error_message && (
                  <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    {item.error_message}
                  </div>
                )}

                <div className="flex space-x-2 mt-3">
                  {!item.processed && (
                    <button
                      onClick={() => onProcessItem(item.id)}
                      className="text-blue-600 hover:text-blue-900 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Processar
                    </button>
                  )}
                  {item.blog_posts?.slug && (
                    <a
                      href={`/blog/${item.blog_posts.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 text-xs font-medium inline-flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver Post</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
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

// Componente da aba de posts criados
const PostsTab: React.FC<{
  posts: any[];
  onDeletePost: (postId: string, postTitle: string) => void;
  onRefresh: () => void;
}> = ({ posts, onDeletePost, onRefresh }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Posts Criados ({posts.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {post.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {post.blog_categories?.name || 'Sem categoria'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.published

                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'

                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 text-sm font-medium inline-flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Ver</span>
                      </a>
                      <button
                        onClick={() => onDeletePost(post.id, post.title)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium inline-flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Deletar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {posts.map((post) => (
            <div key={post.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
                  {post.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  post.published

                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'

                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {post.published ? 'Publicado' : 'Rascunho'}
                </span>
              </div>

              {post.excerpt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                  {post.excerpt}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Categoria:</strong> {post.blog_categories?.name || 'Sem categoria'}</p>
                <p><strong>Criado:</strong> {new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="flex space-x-3 mt-3">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-900 text-xs font-medium inline-flex items-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Ver Post</span>
                </a>
                <button
                  onClick={() => onDeletePost(post.id, post.title)}
                  className="text-red-600 hover:text-red-900 text-xs font-medium inline-flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Deletar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum post encontrado
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
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
        Configurações do Sistema
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configuração Atual
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm sm:text-md font-medium text-gray-900 dark:text-white mb-3">
            Status Atual
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Logs do Sistema ({logs.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div

              key={index}
              className="flex items-start space-x-2 sm:space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {log.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {blogAutomationService.formatDate(log.created_at)}
                </div>
                {log.error_message && (
                  <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded">
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
