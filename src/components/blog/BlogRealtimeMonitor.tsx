import { useState, useEffect } from 'react';
import { RefreshCw, Bell, CheckCircle, AlertCircle } from 'lucide-react';

interface RealtimeNotification {
  id: string;
  title: string;
  created_at: string;
  action: string;
  timestamp: string;
  details?: {
    pending?: number;
    processed?: number;
    errors?: number;
    error?: string;
    [key: string]: unknown;
  };
}

interface RealtimeStatus {
  isActive: boolean;
  lastNotification: string | null;
  totalNotifications: number;
  pendingCount: number;
}

export default function BlogRealtimeMonitor() {
  // Carregar notificações do localStorage
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(() => {
    try {
      const saved = localStorage.getItem('blog-realtime-notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [status, setStatus] = useState<RealtimeStatus>({
    isActive: false,
    lastNotification: null,
    totalNotifications: 0,
    pendingCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Salvar notificações no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('blog-realtime-notifications', JSON.stringify(notifications));
    } catch (error) {

    }
  }, [notifications]);

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Verificar status do sistema
        const response = await fetch('/api/blog/auto/status');
        const data = await response.json();

        if (data.success) {
          setStatus(prev => ({
            ...prev,
            pendingCount: data.pending,
            isActive: data.hasPending
          }));
        }
      } catch (error) {

      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Simular recebimento de notificações
  useEffect(() => {
    const eventSource = new EventSource('/api/blog/auto/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Ignorar heartbeats e mensagens de conexão
        if (data.type === 'heartbeat' || data.type === 'connected') {
          return;
        }

        // Verificar se já existe uma notificação com o mesmo ID
        const existingNotification = notifications.find(n => n.id === data.id);
        if (existingNotification) {

          return;
        }

        // Criar notificação detalhada
        const notification: RealtimeNotification = {
          id: data.id || Date.now().toString(),
          title: data.title || 'Nova Atividade Detectada',
          created_at: data.timestamp || new Date().toISOString(),
          action: data.action || 'unknown',
          timestamp: data.timestamp || new Date().toISOString(),
          details: data // Incluir todos os detalhes
        };
        setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Manter apenas 20 notificações

        setStatus(prev => ({
          ...prev,
          lastNotification: notification.timestamp,
          totalNotifications: prev.totalNotifications + 1,
          isActive: true
        }));
      } catch (error) {
      }
    };

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => eventSource.close();
  }, [notifications]);

  const handleForceCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blog/auto/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'force_check' })
      });

      const data = await response.json();
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          pendingCount: data.pending
        }));
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (status.pendingCount > 0) return 'bg-yellow-500';
    if (status.isActive) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (status.pendingCount > 0) return 'Processando';
    if (status.isActive) return 'Ativo';
    return 'Aguardando';
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Monitor de Processamento em Tempo Real
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor()}`}></div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-gray-600">{getStatusText()}</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{status.pendingCount}</div>
              <p className="text-sm font-medium">Pendentes</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.totalNotifications}</div>
              <p className="text-sm font-medium">Notificações</p>
            </div>

            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">Conexão</p>
              <p className="text-xs text-gray-600">{isConnected ? 'Conectado' : 'Desconectado'}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button

              onClick={handleForceCheck}

              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Verificar Agora
            </button>

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status.isActive

                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'

                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {status.isActive ? 'Processamento Ativo' : 'Aguardando Posts'}
            </span>
          </div>
        </div>
      </div>

      {/* Notificações Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Recentes
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  // Limpar estado local
                  setNotifications([]);
                  // Limpar localStorage
                  localStorage.removeItem('blog-realtime-notifications');
                  // Resetar contador de notificações
                  setStatus(prev => ({
                    ...prev,
                    totalNotifications: 0,
                    lastNotification: null
                  }));

                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Limpar Todas
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação recebida ainda</p>
              <p className="text-sm">As notificações aparecerão aqui quando novos posts forem adicionados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={notification.id || index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.action === 'new_post_added' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : notification.action === 'processing_started' ? (
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                    ) : notification.action === 'processing_completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : notification.action === 'processing_error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Bell className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleString('pt-BR')}
                    </p>

                    {/* Mostrar detalhes adicionais se disponíveis */}
                    {notification.details && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {notification.details.pending && (
                          <span className="inline-block mr-2">📋 {notification.details.pending} pendentes</span>
                        )}
                        {notification.details.processed && (
                          <span className="inline-block mr-2">✅ {notification.details.processed} processados</span>
                        )}
                        {notification.details.errors && (
                          <span className="inline-block mr-2">❌ {notification.details.errors} erros</span>
                        )}
                        {notification.details.error && (
                          <span className="inline-block text-red-500">⚠️ {notification.details.error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    notification.action === 'new_post_added'

                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : notification.action === 'processing_started'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : notification.action === 'processing_completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : notification.action === 'processing_error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {notification.action === 'new_post_added' ? 'Novo Post'

                     : notification.action === 'processing_started' ? 'Processando'
                     : notification.action === 'processing_completed' ? 'Concluído'
                     : notification.action === 'processing_error' ? 'Erro'
                     : 'Atividade'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Como Funciona</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Post Adicionado à Fila</p>
                <p className="text-gray-600">Quando um novo post é adicionado à fila, o trigger detecta automaticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <div>
                <p className="font-medium">Notificação Enviada</p>
                <p className="text-gray-600">O banco de dados envia uma notificação para o backend em tempo real</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-600">3</span>
              </div>
              <div>
                <p className="font-medium">Processamento Automático</p>
                <p className="text-gray-600">O backend processa o post automaticamente e o publica no blog</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
