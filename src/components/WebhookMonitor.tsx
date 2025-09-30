import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Activity, Clock, Globe } from 'lucide-react';
import './WebhookMonitor.css';

interface WebhookData {
  timestamp: string;
  method: string;
  path: string;
  headers: any;
  body: any;
  query: any;
  ip: string;
  userAgent: string;
}

interface WebhookStats {
  total: number;
  last24h: number;
  byMethod: Record<string, number>;
  byPath: Record<string, number>;
  byType: Record<string, number>;
  lastWebhook: WebhookData | null;
}

export const WebhookMonitor: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);

  const fetchWebhooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/webhook-monitor/history?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/webhook-monitor/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/webhook-monitor/history', {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setWebhooks([]);
        setStats(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    fetchStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchWebhooks();
        fetchStats();
      }, 5000); // Atualizar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'method-post';
      case 'GET': return 'method-get';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      default: return 'method-other';
    }
  };

  const getWebhookType = (path: string) => {
    if (path.includes('perfect-pay')) return 'Perfect Pay';
    if (path.includes('n8n')) return 'N8N';
    if (path.includes('blog')) return 'Blog';
    return 'Outros';
  };

  return (
    <div className="webhook-monitor">
      <div className="webhook-header">
        <h2>🔍 Monitor de Webhooks</h2>
        <div className="webhook-controls">
          <button
            onClick={fetchWebhooks}
            disabled={isLoading}
            className="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          
          <button
            onClick={clearHistory}
            className="clear-btn"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="webhook-stats">
          <div className="stat-card">
            <Activity className="w-5 h-5" />
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <Clock className="w-5 h-5" />
            <div>
              <div className="stat-value">{stats.last24h}</div>
              <div className="stat-label">Últimas 24h</div>
            </div>
          </div>
          
          <div className="stat-card">
            <Globe className="w-5 h-5" />
            <div>
              <div className="stat-value">{Object.keys(stats.byType).length}</div>
              <div className="stat-label">Tipos</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Webhooks */}
      <div className="webhook-list">
        <h3>Histórico de Webhooks</h3>
        
        {webhooks.length === 0 ? (
          <div className="no-webhooks">
            <p>Nenhum webhook recebido ainda</p>
          </div>
        ) : (
          <div className="webhook-items">
            {webhooks.map((webhook, index) => (
              <div
                key={index}
                className="webhook-item"
                onClick={() => setSelectedWebhook(webhook)}
              >
                <div className="webhook-item-header">
                  <span className={`method-badge ${getMethodColor(webhook.method)}`}>
                    {webhook.method}
                  </span>
                  <span className="webhook-path">{webhook.path}</span>
                  <span className="webhook-type">{getWebhookType(webhook.path)}</span>
                  <span className="webhook-time">{formatTimestamp(webhook.timestamp)}</span>
                </div>
                
                <div className="webhook-item-details">
                  <span className="webhook-ip">IP: {webhook.ip}</span>
                  <span className="webhook-user-agent">
                    {webhook.userAgent?.substring(0, 50)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedWebhook && (
        <div className="webhook-modal-overlay" onClick={() => setSelectedWebhook(null)}>
          <div className="webhook-modal" onClick={(e) => e.stopPropagation()}>
            <div className="webhook-modal-header">
              <h3>Detalhes do Webhook</h3>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="webhook-modal-content">
              <div className="webhook-detail-section">
                <h4>Informações Básicas</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Timestamp:</strong> {formatTimestamp(selectedWebhook.timestamp)}
                  </div>
                  <div className="detail-item">
                    <strong>Método:</strong> {selectedWebhook.method}
                  </div>
                  <div className="detail-item">
                    <strong>Path:</strong> {selectedWebhook.path}
                  </div>
                  <div className="detail-item">
                    <strong>IP:</strong> {selectedWebhook.ip}
                  </div>
                </div>
              </div>
              
              <div className="webhook-detail-section">
                <h4>Headers</h4>
                <pre className="json-display">
                  {JSON.stringify(selectedWebhook.headers, null, 2)}
                </pre>
              </div>
              
              <div className="webhook-detail-section">
                <h4>Body</h4>
                <pre className="json-display">
                  {JSON.stringify(selectedWebhook.body, null, 2)}
                </pre>
              </div>
              
              <div className="webhook-detail-section">
                <h4>Query Parameters</h4>
                <pre className="json-display">
                  {JSON.stringify(selectedWebhook.query, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
