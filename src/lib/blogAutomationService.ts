/**
 * =====================================================
 * BLOG AUTOMATION SERVICE - Frontend
 * Cliente para integração com API de automação
 * =====================================================
 */

import { supabase } from './supabaseClient';

// Tipos TypeScript
export interface BlogAutomationStats {
  total_queue: number;
  pending: number;
  processed: number;
  errors: number;
  today_added: number;
  this_week: number;
  last_processed: string | null;
}

export interface BlogQueueItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  imageurl?: string;
  autor: string;
  processed: boolean;
  blog_post_id?: string;
  created_at: string;
  processed_at?: string;
  error_message?: string;
  blog_posts?: {
    id: string;
    slug: string;
    published_at: string;
  };
}

export interface BlogAutomationConfig {
  enabled: boolean;
  cronSchedule: string;
  timezone: string;
  maxRetries: number;
  retryDelay: number;
  adminEmail: string;
  lastExecution?: string;
  isRunning: boolean;
  schedulerActive: boolean;
}

export interface ProcessResult {
  success: boolean;
  processed?: number;
  errors?: number;
  details?: Array<{ id: string; status: string; message?: string }>;
  message?: string;
  error?: string;
}

export interface HealthStatus {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  scheduler: 'active' | 'inactive';
  lastExecution?: string;
  isRunning: boolean;
  stats?: BlogAutomationStats;
  error?: string;
}

class BlogAutomationServiceClient {
  private baseUrl: string;
  private currentUser: { id: string; email: string } | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://leadbaze.io' : '');

    // Escutar mudanças de autenticação
    supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user ? {
        id: session.user.id,
        email: session.user.email || ''
      } : null;
    });
  }

  /**
   * Gerar hash do e-mail para segurança (compatível com backend)
   */
  private async generateEmailHash(email: string): Promise<string> {
    const salt = 'leadflow-blog-automation-2024'; // Mesmo salt do backend

    try {
      // Usar Web Crypto API para HMAC-SHA256
      const encoder = new TextEncoder();
      const keyData = encoder.encode(salt);
      const messageData = encoder.encode(email);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {

      // Fallback para e-mail direto se crypto falhar
      return email;
    }
  }

  /**
   * Verificar se usuário atual é admin autorizado
   */
  async isAuthorizedAdmin(): Promise<boolean> {
    if (!this.currentUser?.email) return false;

    // Verificação por e-mail direto (fallback)
    if (this.currentUser.email === 'creaty12345@gmail.com') {
      return true;
    }

    // Verificação por hash (mais seguro)
    try {
      const emailHash = await this.generateEmailHash(this.currentUser.email);
      const expectedHash = '742b0188bdd92a56f71b6cd8cd3f10679af59842413ae26468f681e129584747';
      return emailHash === expectedHash;
    } catch (error) {

      return false;
    }
  }

  /**
   * Headers para requisições (incluindo email do usuário)
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.currentUser?.email) {
      headers['x-user-email'] = this.currentUser.email;
    }

    return headers;
  }

  /**
   * Fazer requisição para API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();
    console.log('📋 [BlogAutomation] Headers:', JSON.stringify(headers, null, 2));
    console.log('⚙️ [BlogAutomation] Options:', JSON.stringify(options, null, 2));
    console.log('⏰ [BlogAutomation] Timestamp da requisição:', new Date().toISOString());

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    console.log('📡 [BlogAutomation] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {

      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [BlogAutomation] Error data:', JSON.stringify(errorData, null, 2));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();

    console.log('📄 [BlogAutomation] Response data completo:', JSON.stringify(result, null, 2));
    console.log('⏰ [BlogAutomation] Timestamp da resposta:', new Date().toISOString());

    return result;
  }

  /**
   * Obter health status do sistema
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/blog/automation/health');
  }

  /**
   * Obter estatísticas (público)
   */
  async getStats(): Promise<{ success: boolean; stats: BlogAutomationStats; lastExecution?: string; isRunning: boolean; schedulerActive: boolean }> {
    return this.request('/api/blog/automation/stats');
  }

  // =====================================================
  // MÉTODOS ADMIN (Requerem autenticação)
  // =====================================================

  /**
   * Verificar se endpoints admin estão acessíveis
   */
  private ensureAdminAccess(): void {
    if (!this.isAuthorizedAdmin()) {
      throw new Error('Acesso negado. Apenas administradores autorizados.');
    }
  }

  /**
   * Processar fila manualmente
   */
  async processQueue(): Promise<ProcessResult> {
    console.log('⏰ [BlogAutomation] Timestamp:', new Date().toISOString());

    this.ensureAdminAccess();

    try {
      console.log('📋 [BlogAutomation] Headers que serão enviados:', this.getHeaders());

      const result = await this.request<ProcessResult>('/api/blog/automation/admin/process', {
        method: 'POST',
      });
      console.log('📄 [BlogAutomation] Resultado completo:', JSON.stringify(result, null, 2));
      return result;

    } catch (error) {
      console.error('❌ [BlogAutomation] Error message:', error instanceof Error ? error.message : String(error));

      throw error;
    }
  }

  /**
   * Obter fila completa
   */
  async getQueue(limit: number = 50): Promise<{ success: boolean; queue: BlogQueueItem[] }> {
    this.ensureAdminAccess();
    return this.request(`/api/blog/automation/admin/queue?limit=${limit}`);
  }

  /**
   * Processar item específico
   */
  async processItem(itemId: string): Promise<ProcessResult> {
    this.ensureAdminAccess();
    return this.request<ProcessResult>(`/api/blog/automation/admin/process/${itemId}`, {
      method: 'POST',
    });
  }

  /**
   * Obter configuração
   */
  async getConfig(): Promise<{ success: boolean; config: BlogAutomationConfig }> {
    this.ensureAdminAccess();
    return this.request('/api/blog/automation/admin/config');
  }

  /**
   * Atualizar configuração
   */
  async updateConfig(config: Partial<BlogAutomationConfig>): Promise<{ success: boolean; message: string; config: BlogAutomationConfig }> {
    this.ensureAdminAccess();
    return this.request('/api/blog/automation/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  /**
   * Controlar scheduler
   */
  async controlScheduler(action: 'start' | 'stop'): Promise<{ success: boolean; message: string }> {
    this.ensureAdminAccess();
    return this.request(`/api/blog/automation/admin/scheduler/${action}`, {
      method: 'POST',
    });
  }

  /**
   * Iniciar scheduler
   */
  async startScheduler(): Promise<{ success: boolean; message: string }> {
    return this.controlScheduler('start');
  }

  /**
   * Parar scheduler
   */
  async stopScheduler(): Promise<{ success: boolean; message: string }> {
    return this.controlScheduler('stop');
  }

  /**
   * Obter logs
   */
  async getLogs(limit: number = 100): Promise<{ success: boolean; logs: Array<{ id: string; message: string; timestamp: string; level: string }> }> {
    this.ensureAdminAccess();
    return this.request(`/api/blog/automation/admin/logs?limit=${limit}`);
  }

  // =====================================================
  // MÉTODOS DE MONITORAMENTO EM TEMPO REAL
  // =====================================================

  /**
   * Subscription para mudanças na fila (usando Supabase Realtime)
   */
  subscribeToQueueChanges(callback: (payload: { id: string; status: string; message?: string }) => void) {
    if (!this.isAuthorizedAdmin()) {

      return null;
    }

    return supabase
      .channel('n8n_blog_queue_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'n8n_blog_queue',
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscription para novos posts criados
   */
  subscribeToNewPosts(callback: (payload: { id: string; title: string; status: string }) => void) {
    return supabase
      .channel('blog_posts_changes')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blog_posts',
          filter: 'n8n_sync_id=not.is.null',
        },
        callback
      )
      .subscribe();
  }

  // =====================================================
  // MÉTODOS UTILITÁRIOS
  // =====================================================

  /**
   * Formatar data para exibição
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obter status formatado do item
   */
  getItemStatus(item: BlogQueueItem): { status: string; color: string; icon: string } {
    if (item.error_message) {
      return { status: 'Erro', color: 'text-red-500', icon: '❌' };
    }

    if (item.processed && item.blog_post_id) {
      return { status: 'Publicado', color: 'text-green-500', icon: '✅' };
    }

    if (item.processed) {
      return { status: 'Processado', color: 'text-blue-500', icon: '🔄' };
    }

    return { status: 'Pendente', color: 'text-yellow-500', icon: '⏳' };
  }

  /**
   * Calcular progresso geral
   */
  calculateProgress(stats: BlogAutomationStats): number {
    const total = stats.total_queue;
    if (total === 0) return 100;

    const completed = stats.processed;
    return Math.round((completed / total) * 100);
  }

  /**
   * Obter resumo do status
   */
  getStatusSummary(stats: BlogAutomationStats): string {
    const { pending, processed, errors } = stats;

    if (errors > 0) {
      return `${processed} processados, ${pending} pendentes, ${errors} erros`;
    }

    if (pending === 0) {
      return 'Todos os itens foram processados';
    }

    return `${processed} processados, ${pending} pendentes`;
  }
}

// Instância singleton
export const blogAutomationService = new BlogAutomationServiceClient();

// Export default
export default blogAutomationService;
