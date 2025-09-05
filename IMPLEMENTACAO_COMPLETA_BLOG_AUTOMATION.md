# Implementação Completa - Blog Automation com N8N e Supabase

## Resumo do Projeto
Sistema completo de automação de blog que recebe dados do N8N e cria artigos automaticamente no blog, com dashboard de monitoramento restrito ao usuário `creaty12345@gmail.com`.

## Arquivos Criados/Modificados

### 1. SQL - Schema do Banco de Dados
**Arquivo:** `supabase-n8n-blog-automation.sql`

```sql
-- Tabela para receber dados do N8N
CREATE TABLE IF NOT EXISTS n8n_blog_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    imageurl TEXT,
    autor TEXT DEFAULT 'LeadBaze Team',
    processed BOOLEAN DEFAULT FALSE,
    blog_post_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Função para processar a fila N8N
CREATE OR REPLACE FUNCTION process_n8n_blog_queue()
RETURNS TABLE(
    processed_count INTEGER,
    error_count INTEGER,
    details JSONB
) AS $$
DECLARE
    queue_item RECORD;
    new_post_id UUID;
    category_id UUID;
    base_slug TEXT;
    final_slug TEXT;
    slug_counter INTEGER;
    processed_count INTEGER := 0;
    error_count INTEGER := 0;
    details JSONB := '[]'::JSONB;
    item_detail JSONB;
BEGIN
    -- Processar apenas itens não processados
    FOR queue_item IN 
        SELECT * FROM n8n_blog_queue 
        WHERE processed = FALSE 
        ORDER BY date ASC, created_at ASC
        LIMIT 10
    LOOP
        BEGIN
            -- Buscar ou criar categoria
            SELECT id INTO category_id 
            FROM blog_categories 
            WHERE LOWER(slug) = LOWER(REPLACE(LOWER(queue_item.category), ' ', '-'));
            
            -- Se categoria não existe, criar uma nova
            IF category_id IS NULL THEN
                INSERT INTO blog_categories (name, slug, description, color, icon)
                VALUES (
                    queue_item.category,
                    LOWER(REPLACE(LOWER(queue_item.category), ' ', '-')),
                    'Categoria criada automaticamente pelo N8N',
                    'bg-blue-500',
                    '📝'
                ) RETURNING id INTO category_id;
            END IF;
            
            -- Criar slug único para o post
            base_slug := LOWER(REPLACE(REGEXP_REPLACE(queue_item.title, '[^a-zA-Z0-9\\s]', '', 'g'), ' ', '-'));
            final_slug := base_slug;
            slug_counter := 1;
            
            -- Verificar se slug já existe e criar versão única
            WHILE EXISTS(SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
                final_slug := base_slug || '-' || slug_counter;
                slug_counter := slug_counter + 1;
            END LOOP;
            
            -- Criar o post no blog
            INSERT INTO blog_posts (
                title, slug, excerpt, content, featured_image, category_id,
                author_name, author_avatar, published, published_at, read_time,
                seo_title, seo_description, n8n_sync_id, n8n_last_sync
            ) VALUES (
                queue_item.title,
                final_slug,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160) || '...',
                queue_item.content,
                queue_item.imageurl,
                category_id,
                COALESCE(queue_item.autor, 'LeadBaze Team'),
                '/avatars/leadbaze-ai.png',
                TRUE,
                queue_item.date::TIMESTAMP WITH TIME ZONE,
                GREATEST(1, (LENGTH(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g')) / 5) / 250),
                queue_item.title,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160),
                queue_item.id::TEXT,
                NOW()
            ) RETURNING id INTO new_post_id;
            
            -- Marcar como processado
            UPDATE n8n_blog_queue 
            SET processed = TRUE, blog_post_id = new_post_id, processed_at = NOW(), error_message = NULL
            WHERE id = queue_item.id;
            
            processed_count := processed_count + 1;
            
            -- Adicionar aos detalhes
            item_detail := jsonb_build_object(
                'id', queue_item.id, 'title', queue_item.title, 'status', 'success', 'blog_post_id', new_post_id
            );
            details := details || item_detail;
            
        EXCEPTION WHEN OTHERS THEN
            -- Em caso de erro, marcar com erro
            UPDATE n8n_blog_queue 
            SET error_message = SQLERRM, processed_at = NOW()
            WHERE id = queue_item.id;
            
            error_count := error_count + 1;
            
            -- Adicionar erro aos detalhes
            item_detail := jsonb_build_object(
                'id', queue_item.id, 'title', queue_item.title, 'status', 'error', 'error', SQLERRM
            );
            details := details || item_detail;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, error_count, details;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS
DROP POLICY IF EXISTS "Todos podem visualizar fila N8N" ON n8n_blog_queue;
CREATE POLICY "Todos podem visualizar fila N8N" ON n8n_blog_queue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas N8N pode inserir" ON n8n_blog_queue;
CREATE POLICY "Apenas N8N pode inserir" ON n8n_blog_queue FOR INSERT WITH CHECK (true);

-- Função para estatísticas
CREATE OR REPLACE FUNCTION get_n8n_blog_stats()
RETURNS TABLE(
    total_items INTEGER,
    processed_items INTEGER,
    pending_items INTEGER,
    error_items INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_items,
        COUNT(*) FILTER (WHERE processed = TRUE)::INTEGER as processed_items,
        COUNT(*) FILTER (WHERE processed = FALSE AND error_message IS NULL)::INTEGER as pending_items,
        COUNT(*) FILTER (WHERE error_message IS NOT NULL)::INTEGER as error_items
    FROM n8n_blog_queue;
END;
$$ LANGUAGE plpgsql;
```

### 2. Backend - Serviço de Automação
**Arquivo:** `backend/services/blogAutomationService.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

class BlogAutomationService {
    constructor() {
        this.supabase = null;
        this.scheduler = null;
        this.isRunning = false;
        this.config = {
            enabled: process.env.BLOG_AUTOMATION_ENABLED === 'true',
            cron: process.env.BLOG_AUTOMATION_CRON || '0 9 * * *', // 9h todo dia
            timezone: process.env.BLOG_AUTOMATION_TIMEZONE || 'America/Sao_Paulo',
            maxRetries: parseInt(process.env.BLOG_AUTOMATION_MAX_RETRIES) || 3,
            retryDelay: parseInt(process.env.BLOG_AUTOMATION_RETRY_DELAY) || 5000
        };
    }

    async init() {
        try {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            console.log('✅ BlogAutomationService inicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar BlogAutomationService:', error);
            return false;
        }
    }

    async startScheduler() {
        if (!this.config.enabled) {
            console.log('⏸️ BlogAutomationService desabilitado');
            return;
        }

        if (this.scheduler) {
            console.log('⚠️ Scheduler já está rodando');
            return;
        }

        this.scheduler = cron.schedule(this.config.cron, async () => {
            console.log('🔄 Executando processamento automático da fila N8N...');
            await this.processQueue();
        }, {
            scheduled: false,
            timezone: this.config.timezone
        });

        this.scheduler.start();
        this.isRunning = true;
        console.log(`✅ Scheduler iniciado: ${this.config.cron} (${this.config.timezone})`);
    }

    async stopScheduler() {
        if (this.scheduler) {
            this.scheduler.stop();
            this.scheduler = null;
            this.isRunning = false;
            console.log('⏹️ Scheduler parado');
        }
    }

    async processQueue() {
        try {
            const { data, error } = await this.supabase.rpc('process_n8n_blog_queue');
            
            if (error) {
                console.error('❌ Erro ao processar fila:', error);
                return { success: false, error: error.message };
            }

            const result = data[0];
            console.log(`✅ Processamento concluído: ${result.processed_count} processados, ${result.error_count} erros`);
            
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            return { success: false, error: error.message };
        }
    }

    async getStats() {
        try {
            const { data, error } = await this.supabase.rpc('get_n8n_blog_stats');
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getQueue() {
        try {
            const { data, error } = await this.supabase
                .from('n8n_blog_queue')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async processItem(itemId) {
        try {
            const { data, error } = await this.supabase.rpc('process_n8n_blog_queue');
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healthCheck() {
        try {
            const { data, error } = await this.supabase.from('n8n_blog_queue').select('count').limit(1);
            return {
                status: 'healthy',
                database: error ? 'disconnected' : 'connected',
                scheduler: this.isRunning ? 'running' : 'stopped',
                config: this.config
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                database: 'disconnected',
                scheduler: 'stopped',
                error: error.message
            };
        }
    }

    isAuthorizedAdmin(email) {
        return email === process.env.BLOG_ADMIN_EMAIL;
    }
}

let blogAutomationService = null;

function getBlogAutomationService() {
    if (!blogAutomationService) {
        blogAutomationService = new BlogAutomationService();
    }
    return blogAutomationService;
}

module.exports = { getBlogAutomationService };
```

### 3. Backend - Endpoints da API
**Arquivo:** `backend/server.js` (adicionar estas rotas)

```javascript
const { getBlogAutomationService } = require('./services/blogAutomationService');

// Middleware de autenticação admin
const checkAdminAuth = (req, res, next) => {
    const adminEmail = process.env.BLOG_ADMIN_EMAIL;
    const userEmail = req.headers['x-user-email']; // Assumindo que vem do frontend
    
    if (!userEmail || userEmail !== adminEmail) {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
};

// Endpoints públicos
app.get('/api/blog/automation/health', async (req, res) => {
    const service = getBlogAutomationService();
    const health = await service.healthCheck();
    res.json(health);
});

app.get('/api/blog/automation/stats', async (req, res) => {
    const service = getBlogAutomationService();
    const result = await service.getStats();
    res.json(result);
});

// Endpoints admin
app.post('/api/blog/automation/admin/process', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    const result = await service.processQueue();
    res.json(result);
});

app.get('/api/blog/automation/admin/queue', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    const result = await service.getQueue();
    res.json(result);
});

app.post('/api/blog/automation/admin/process/:itemId', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    const result = await service.processItem(req.params.itemId);
    res.json(result);
});

app.get('/api/blog/automation/admin/config', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    res.json({ success: true, data: service.config });
});

app.put('/api/blog/automation/admin/config', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    service.config = { ...service.config, ...req.body };
    res.json({ success: true, data: service.config });
});

app.post('/api/blog/automation/admin/scheduler/:action', checkAdminAuth, async (req, res) => {
    const service = getBlogAutomationService();
    const { action } = req.params;
    
    if (action === 'start') {
        await service.startScheduler();
        res.json({ success: true, message: 'Scheduler iniciado' });
    } else if (action === 'stop') {
        await service.stopScheduler();
        res.json({ success: true, message: 'Scheduler parado' });
    } else {
        res.status(400).json({ error: 'Ação inválida' });
    }
});

// Inicializar serviço quando o servidor inicia
const service = getBlogAutomationService();
service.init().then(() => {
    service.startScheduler();
});
```

### 4. Backend - Dependências
**Arquivo:** `backend/package.json` (adicionar)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "node-cron": "^3.0.3"
  }
}
```

### 5. Backend - Variáveis de Ambiente
**Arquivo:** `backend/config.env`

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
BLOG_AUTOMATION_ENABLED=true
BLOG_AUTOMATION_CRON=0 9 * * *
BLOG_AUTOMATION_TIMEZONE=America/Sao_Paulo
BLOG_AUTOMATION_MAX_RETRIES=3
BLOG_AUTOMATION_RETRY_DELAY=5000
BLOG_ADMIN_EMAIL=creaty12345@gmail.com
```

### 6. Frontend - Serviço de Automação
**Arquivo:** `src/lib/blogAutomationService.ts`

```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface BlogAutomationStats {
  total_items: number;
  processed_items: number;
  pending_items: number;
  error_items: number;
}

export interface BlogQueueItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  imageurl: string | null;
  autor: string;
  processed: boolean;
  blog_post_id: string | null;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
}

export interface BlogAutomationConfig {
  enabled: boolean;
  cron: string;
  timezone: string;
  maxRetries: number;
  retryDelay: number;
}

export interface ProcessResult {
  processed_count: number;
  error_count: number;
  details: Array<{
    id: string;
    title: string;
    status: 'success' | 'error';
    blog_post_id?: string;
    error?: string;
  }>;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  scheduler: 'running' | 'stopped';
  config?: BlogAutomationConfig;
  error?: string;
}

class BlogAutomationServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/blog/automation/health');
  }

  async getStats(): Promise<BlogAutomationStats> {
    const result = await this.request<{ success: boolean; data: BlogAutomationStats }>('/api/blog/automation/stats');
    return result.data;
  }

  async getQueue(): Promise<BlogQueueItem[]> {
    const result = await this.request<{ success: boolean; data: BlogQueueItem[] }>('/api/blog/automation/admin/queue', {
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
    return result.data;
  }

  async processQueue(): Promise<ProcessResult> {
    const result = await this.request<{ success: boolean; data: ProcessResult }>('/api/blog/automation/admin/process', {
      method: 'POST',
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
    return result.data;
  }

  async processItem(itemId: string): Promise<ProcessResult> {
    const result = await this.request<{ success: boolean; data: ProcessResult }>(`/api/blog/automation/admin/process/${itemId}`, {
      method: 'POST',
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
    return result.data;
  }

  async getConfig(): Promise<BlogAutomationConfig> {
    const result = await this.request<{ success: boolean; data: BlogAutomationConfig }>('/api/blog/automation/admin/config', {
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
    return result.data;
  }

  async updateConfig(config: Partial<BlogAutomationConfig>): Promise<BlogAutomationConfig> {
    const result = await this.request<{ success: boolean; data: BlogAutomationConfig }>('/api/blog/automation/admin/config', {
      method: 'PUT',
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      },
      body: JSON.stringify(config)
    });
    return result.data;
  }

  async startScheduler(): Promise<void> {
    await this.request('/api/blog/automation/admin/scheduler/start', {
      method: 'POST',
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
  }

  async stopScheduler(): Promise<void> {
    await this.request('/api/blog/automation/admin/scheduler/stop', {
      method: 'POST',
      headers: {
        'x-user-email': 'creaty12345@gmail.com'
      }
    });
  }
}

export const blogAutomationService = new BlogAutomationServiceClient();
export default blogAutomationService;
```

### 7. Frontend - Dashboard de Automação
**Arquivo:** `src/components/blog/BlogAutomationDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Settings,
  BarChart3,
  List,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import blogAutomationService, { 
  BlogAutomationStats, 
  BlogQueueItem, 
  BlogAutomationConfig,
  ProcessResult,
  HealthStatus 
} from '../../lib/blogAutomationService';

const BlogAutomationDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<BlogAutomationStats | null>(null);
  const [queue, setQueue] = useState<BlogQueueItem[]>([]);
  const [config, setConfig] = useState<BlogAutomationConfig | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Verificar se é admin autorizado
  if (!currentUser || currentUser.email !== 'creaty12345@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, queueData, configData, healthData] = await Promise.all([
        blogAutomationService.getStats(),
        blogAutomationService.getQueue(),
        blogAutomationService.getConfig(),
        blogAutomationService.getHealth()
      ]);
      
      setStats(statsData);
      setQueue(queueData);
      setConfig(configData);
      setHealth(healthData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addLog(`Erro ao carregar dados: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const handleProcessQueue = async () => {
    try {
      setProcessing(true);
      addLog('Iniciando processamento da fila...');
      
      const result = await blogAutomationService.processQueue();
      addLog(`Processamento concluído: ${result.processed_count} processados, ${result.error_count} erros`);
      
      await loadData();
    } catch (error) {
      console.error('Erro ao processar fila:', error);
      addLog(`Erro ao processar fila: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessItem = async (itemId: string) => {
    try {
      setProcessing(true);
      addLog(`Processando item ${itemId}...`);
      
      const result = await blogAutomationService.processItem(itemId);
      addLog(`Item processado: ${result.processed_count} processados, ${result.error_count} erros`);
      
      await loadData();
    } catch (error) {
      console.error('Erro ao processar item:', error);
      addLog(`Erro ao processar item: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSchedulerToggle = async () => {
    try {
      if (health?.scheduler === 'running') {
        await blogAutomationService.stopScheduler();
        addLog('Scheduler parado');
      } else {
        await blogAutomationService.startScheduler();
        addLog('Scheduler iniciado');
      }
      await loadData();
    } catch (error) {
      console.error('Erro ao controlar scheduler:', error);
      addLog(`Erro ao controlar scheduler: ${error}`);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Zap className="w-8 h-8 text-blue-500 mr-3" />
                Blog Automation Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Monitoramento e controle da automação de artigos</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={handleProcessQueue}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Processar Fila
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_items || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processados</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.processed_items || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending_items || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erros</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.error_items || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Status do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${health?.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">Database: {health?.database || 'unknown'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${health?.scheduler === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600">Scheduler: {health?.scheduler || 'unknown'}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSchedulerToggle}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  health?.scheduler === 'running' 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {health?.scheduler === 'running' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1 inline" />
                    Parar
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1 inline" />
                    Iniciar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <List className="w-5 h-5 mr-2" />
              Fila de Artigos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.autor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.processed ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processado
                        </span>
                      ) : item.error_message ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center w-fit">
                          <XCircle className="w-3 h-3 mr-1" />
                          Erro
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center w-fit">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!item.processed && (
                        <button
                          onClick={() => handleProcessItem(item.id)}
                          disabled={processing}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Processar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Logs do Sistema
            </h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum log disponível</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-green-400 text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAutomationDashboard;
```

### 8. Frontend - Atualização do BlogService
**Arquivo:** `src/lib/blogService.ts` (método getPostBySlug atualizado)

```typescript
static async getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug,
          description,
          color,
          icon
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transformar dados do Supabase para o formato esperado
    const post: BlogPost = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      author: {
        name: data.author_name || 'LeadBaze Team',
        avatar: data.author_avatar || '/avatars/leadbaze-ai.png',
        bio: data.author_bio || 'Equipe LeadBaze'
      },
      category: data.blog_categories ? {
        id: data.blog_categories.id,
        name: data.blog_categories.name,
        slug: data.blog_categories.slug,
        description: data.blog_categories.description,
        color: data.blog_categories.color,
        icon: data.blog_categories.icon,
        postCount: 0
      } : mockCategories[0],
      tags: [],
      featuredImage: data.featured_image,
      published: data.published,
      publishedAt: data.published_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      readTime: data.read_time || 5,
      views: data.views || 0,
      likes: data.likes || 0,
      seoTitle: data.seo_title || data.title,
      seoDescription: data.seo_description || data.excerpt,
      seoKeywords: data.seo_keywords ? data.seo_keywords.split(',') : []
    };

    return post;
  } catch (error) {
    console.error('Error in getPostBySlug:', error);
    return null;
  }
}
```

### 9. Frontend - Roteamento
**Arquivo:** `src/App.tsx` (adicionar rota)

```typescript
import { lazy } from 'react';

const BlogAutomationDashboard = lazy(() => import('./components/blog/BlogAutomationDashboard'));

// Adicionar na lista de rotas:
<Route path="/admin/blog-automation" element={<BlogAutomationDashboard />} />
```

### 10. Frontend - Navegação
**Arquivo:** `src/components/Navbar.tsx` (adicionar link)

```typescript
import { Zap } from 'lucide-react';

// Adicionar na lista de links (apenas para creaty12345@gmail.com):
{user?.email === 'creaty12345@gmail.com' && (
  <NavLink to="/admin/blog-automation" className="flex items-center">
    <Zap className="w-4 h-4 mr-2" />
    <span className="hidden md:inline">Blog Auto</span>
    <span className="md:hidden">Blog Automation</span>
  </NavLink>
)}
```

### 11. Frontend - Variáveis de Ambiente
**Arquivo:** `env.example`

```env
VITE_BACKEND_URL=http://localhost:3001
```

## Como Executar

### 1. Backend
```bash
cd backend
npm install
# Configurar variáveis em config.env
npm start
```

### 2. Frontend
```bash
npm install
# Configurar variáveis em .env
npm run dev
```

### 3. Supabase
1. Executar o SQL em `supabase-n8n-blog-automation.sql`
2. Configurar as variáveis de ambiente no backend

## Status Atual

✅ **Concluído:**
- Schema do banco de dados
- Backend com automação e API
- Frontend com dashboard
- Integração Supabase
- Processamento de artigos
- Sistema de logs e monitoramento

🔄 **Em Andamento:**
- Teste final do artigo processado

## Próximos Passos

1. Testar se o artigo aparece no blog após processamento
2. Configurar webhook do N8N para enviar dados
3. Ajustar configurações de automação conforme necessário

## Comandos Úteis

```bash
# Backend
cd backend && npm start

# Frontend
npm run dev

# Build para produção
npm run build
```

## URLs Importantes

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Dashboard: http://localhost:5173/admin/blog-automation (apenas creaty12345@gmail.com)
- API Health: http://localhost:3001/api/blog/automation/health
