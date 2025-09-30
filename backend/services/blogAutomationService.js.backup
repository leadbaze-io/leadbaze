/**
 * =====================================================
 * BLOG AUTOMATION SERVICE - LeadFlow
 * Serviço para automação de artigos via N8N
 * =====================================================
 */

const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const crypto = require('crypto');
const ContentFormatter = require('./contentFormatter');

class BlogAutomationService {
    constructor() {
        // Configuração Supabase
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role para bypass RLS
        
        if (!this.supabaseUrl || !this.supabaseServiceKey) {
            throw new Error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
        }
        
        // Cliente Supabase com service role
        this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
        
        // Formatter de conteúdo
        this.contentFormatter = new ContentFormatter();
        
        // Configurações
        this.config = {
            enabled: true,
            cronSchedule: '0 9 * * *', // Todo dia às 9h (0 minutos, 9 horas, todo dia, todo mês, todo dia da semana)
            timezone: 'America/Sao_Paulo',
            maxRetries: 3,
            retryDelay: 5000, // 5 segundos
            adminEmail: 'creaty12345@gmail.com', // Email do admin autorizado
            adminEmailHash: this.generateEmailHash('creaty12345@gmail.com') // Hash do email para segurança
        };
        
        // Estado do serviço
        this.isRunning = false;
        this.lastExecution = null;
        this.cronJob = null;
        
        console.log('🤖 BlogAutomationService inicializado');
        this.logActivity('service_start', 'success', 'Serviço de automação iniciado');
    }
    
    /**
     * Iniciar o scheduler automático
     */
    startScheduler() {
        if (this.cronJob) {
            console.log('⚠️ Scheduler já está rodando');
            return;
        }
        
        console.log(`⏰ Iniciando scheduler: ${this.config.cronSchedule} (${this.config.timezone})`);
        
        this.cronJob = cron.schedule(this.config.cronSchedule, async () => {
            console.log('🚀 Executando processamento automático...');
            await this.processQueue();
        }, {
            scheduled: true,
            timezone: this.config.timezone
        });
        
        this.logActivity('scheduler_start', 'success', `Scheduler iniciado: ${this.config.cronSchedule}`);
        console.log('✅ Scheduler iniciado com sucesso');
    }
    
    /**
     * Parar o scheduler
     */
    stopScheduler() {
        if (this.cronJob) {
            this.cronJob.destroy();
            this.cronJob = null;
            this.logActivity('scheduler_stop', 'success', 'Scheduler parado');
            console.log('🛑 Scheduler parado');
        }
    }
    
    /**
     * Processar fila de artigos N8N
     */
    async processQueue() {
        console.log('🚀 [Service] ===== INICIANDO PROCESSQUEUE =====');
        console.log('⏰ [Service] Timestamp:', new Date().toISOString());
        console.log('🔄 [Service] isRunning atual:', this.isRunning);
        
        if (this.isRunning) {
            console.log('⚠️ [Service] Processamento já está em execução');
            return { success: false, message: 'Processamento já em execução' };
        }
        
        console.log('🔄 [Service] Definindo isRunning = true');
        this.isRunning = true;
        this.lastExecution = new Date();
        console.log('📅 [Service] lastExecution definido:', this.lastExecution);
        
        try {
            console.log('📊 [Service] ===== INICIANDO PROCESSAMENTO DA FILA N8N =====');
            
            // Log detalhado antes de chamar a função
            console.log('🔍 Verificando fila antes do processamento...');
            const { data: queueBefore, error: queueError } = await this.supabase
                .from('n8n_blog_queue')
                .select('id, title, processed, error_message')
                .eq('processed', false);
            
            if (queueError) {
                console.log('❌ Erro ao verificar fila:', queueError);
            } else {
                console.log('📋 Itens pendentes na fila:', queueBefore?.length || 0);
                queueBefore?.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.title} (ID: ${item.id})`);
                    if (item.error_message) {
                        console.log(`      ❌ Erro anterior: ${item.error_message}`);
                    }
                });
            }
            
            // Chamar função SQL para processar fila
            console.log('🚀 [Service] ===== CHAMANDO FUNÇÃO SQL =====');
            console.log('🚀 [Service] Chamando função SQL process_n8n_blog_queue...');
            console.log('🔧 [Service] Supabase client:', this.supabase ? 'OK' : 'NULL');
            
            const { data, error } = await this.supabase.rpc('process_n8n_blog_queue');
            
            console.log('📡 [Service] ===== RESPOSTA DA FUNÇÃO SQL =====');
            console.log('📡 [Service] Error:', error);
            console.log('📡 [Service] Data:', data);
            console.log('📡 [Service] Data tipo:', typeof data);
            console.log('📡 [Service] Data length:', data?.length);
            
            if (error) {
                console.log('❌ [Service] ===== ERRO DETALHADO DA FUNÇÃO SQL =====');
                console.log('❌ [Service] Código:', error.code);
                console.log('❌ [Service] Mensagem:', error.message);
                console.log('❌ [Service] Detalhes:', error.details);
                console.log('❌ [Service] Hint:', error.hint);
                throw new Error(`Erro na função SQL: ${error.message}`);
            }
            
            console.log('📄 [Service] ===== RESULTADO BRUTO DA FUNÇÃO =====');
            console.log('📄 [Service] Resultado bruto:', JSON.stringify(data, null, 2));
            
            const result = data[0]; // A função retorna array com um objeto
            console.log('📊 [Service] ===== PROCESSANDO RESULTADO =====');
            console.log('📊 [Service] Result[0]:', JSON.stringify(result, null, 2));
            console.log('📊 [Service] Result tipo:', typeof result);
            
            const { processed_count, error_count, details } = result;
            console.log('📊 [Service] processed_count:', processed_count);
            console.log('📊 [Service] error_count:', error_count);
            console.log('📊 [Service] details:', JSON.stringify(details, null, 2));
            
            console.log(`✅ Processamento concluído:`);
            console.log(`   📝 Processados: ${processed_count}`);
            console.log(`   ❌ Erros: ${error_count}`);
            console.log(`   📋 Detalhes:`, JSON.stringify(details, null, 2));
            
            // Log detalhado após o processamento
            console.log('🔍 Verificando fila após o processamento...');
            const { data: queueAfter, error: queueErrorAfter } = await this.supabase
                .from('n8n_blog_queue')
                .select('id, title, processed, error_message, processed_at')
                .eq('processed', false);
            
            if (queueErrorAfter) {
                console.log('❌ Erro ao verificar fila após processamento:', queueErrorAfter);
            } else {
                console.log('📋 Itens pendentes após processamento:', queueAfter?.length || 0);
                queueAfter?.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.title} (ID: ${item.id})`);
                    if (item.error_message) {
                        console.log(`      ❌ Erro: ${item.error_message}`);
                    }
                });
            }
            
            // Log detalhado
            await this.logActivity('queue_process', 'success', 
                `Processados: ${processed_count}, Erros: ${error_count}`, 
                { processed_count, error_count, details }
            );
            
            // Se houver erros, logar detalhes
            if (error_count > 0) {
                const errorDetails = details.filter(d => d.status === 'error');
                console.log('❌ Erros encontrados:', errorDetails);
                
                await this.logActivity('queue_errors', 'warning', 
                    `${error_count} erros durante processamento`, 
                    { errors: errorDetails }
                );
            }
            
            const finalResult = {
                success: true,
                processed: processed_count,
                errors: error_count,
                details: details
            };
            
            console.log('✅ [Service] ===== RESULTADO FINAL =====');
            console.log('✅ [Service] Resultado final:', JSON.stringify(finalResult, null, 2));
            console.log('✅ [Service] success:', finalResult.success);
            console.log('✅ [Service] processed:', finalResult.processed);
            console.log('✅ [Service] errors:', finalResult.errors);
            console.log('✅ [Service] details length:', finalResult.details?.length);
            
            return finalResult;
            
        } catch (error) {
            console.error('❌ [Service] ===== ERRO DURANTE PROCESSAMENTO =====');
            console.error('❌ [Service] Tipo do erro:', typeof error);
            console.error('❌ [Service] Erro completo:', error);
            console.error('❌ [Service] Error message:', error.message);
            console.error('❌ [Service] Error stack:', error.stack);
            
            await this.logActivity('queue_process', 'error', 
                `Erro no processamento: ${error.message}`, 
                { error: error.message, stack: error.stack }
            );
            
            const errorResult = {
                success: false,
                message: error.message,
                error: error
            };
            
            console.log('❌ [Service] ===== RESULTADO DE ERRO =====');
            console.log('❌ [Service] Resultado de erro:', JSON.stringify(errorResult, null, 2));
            
            return errorResult;
            
        } finally {
            console.log('🔄 [Service] ===== FINALIZANDO PROCESSAMENTO =====');
            console.log('🔄 [Service] Definindo isRunning = false');
            this.isRunning = false;
            console.log('⏰ [Service] Timestamp final:', new Date().toISOString());
        }
    }
    
    /**
     * Obter estatísticas da fila
     */
    async getStats() {
        try {
            const { data, error } = await this.supabase.rpc('get_n8n_blog_stats');
            
            if (error) {
                throw new Error(`Erro ao obter estatísticas: ${error.message}`);
            }
            
            return {
                success: true,
                stats: data,
                lastExecution: this.lastExecution,
                isRunning: this.isRunning,
                schedulerActive: !!this.cronJob
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error.message);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Obter fila completa para visualização
     */
    async getQueue(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('n8n_blog_queue')
                .select(`
                    *,
                    blog_posts (
                        id,
                        slug,
                        published_at
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) {
                throw new Error(`Erro ao obter fila: ${error.message}`);
            }
            
            return {
                success: true,
                queue: data
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter fila:', error.message);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Processar item específico da fila
     */
    async processItem(itemId) {
        try {
            // Primeiro, marcar item como não processado para reprocessar
            const { error: updateError } = await this.supabase
                .from('n8n_blog_queue')
                .update({ 
                    processed: false, 
                    error_message: null,
                    processed_at: null
                })
                .eq('id', itemId);
            
            if (updateError) {
                throw new Error(`Erro ao resetar item: ${updateError.message}`);
            }
            
            // Processar fila (vai pegar este item)
            const result = await this.processQueue();
            
            await this.logActivity('item_process', 'success', 
                `Item ${itemId} processado manualmente`
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Erro ao processar item:', error.message);
            
            await this.logActivity('item_process', 'error', 
                `Erro ao processar item ${itemId}: ${error.message}`
            );
            
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Verificar saúde do sistema
     */
    async healthCheck() {
        try {
            // Testar conexão com Supabase
            const { data, error } = await this.supabase
                .from('n8n_blog_queue')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                throw new Error(`Erro de conexão: ${error.message}`);
            }
            
            const stats = await this.getStats();
            
            return {
                success: true,
                status: 'healthy',
                database: 'connected',
                scheduler: this.cronJob ? 'active' : 'inactive',
                lastExecution: this.lastExecution,
                isRunning: this.isRunning,
                stats: stats.stats
            };
            
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    }
    
    /**
     * Adicionar artigo à fila N8N com formatação automática
     */
    async addToQueue(articleData) {
        try {
            console.log('📝 Adicionando artigo à fila N8N:', articleData.title);
            
            // Formatar conteúdo automaticamente
            const formattedData = this.contentFormatter.formatPost({
                title: articleData.title,
                content: articleData.content,
                category: articleData.category || 'Geral',
                type: articleData.type
            });
            
            console.log('🎨 Conteúdo formatado automaticamente');
            console.log('📊 Tipo detectado:', formattedData.type);
            console.log('📏 Tamanho do conteúdo:', formattedData.content.length);
            
            const { data, error } = await this.supabase
                .from('n8n_blog_queue')
                .insert([{
                    title: formattedData.title,
                    content: formattedData.content,
                    category: formattedData.category,
                    date: articleData.date,
                    imageurl: articleData.imageurl,
                    autor: articleData.autor,
                    processed: false
                }])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Erro ao adicionar à fila:', error);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Artigo formatado e adicionado à fila:', data);
            return { 
                success: true, 
                data,
                formatted: true,
                type: formattedData.type
            };
            
        } catch (error) {
            console.error('❌ Erro ao adicionar à fila:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Gerar hash do e-mail para segurança
     */
    generateEmailHash(email) {
        const salt = process.env.EMAIL_HASH_SALT || 'leadflow-blog-automation-2024';
        return crypto.createHmac('sha256', salt).update(email).digest('hex');
    }

    /**
     * Verificar se usuário é admin autorizado (por e-mail ou hash)
     */
    isAuthorizedAdmin(email) {
        // Verificação por e-mail direto (compatibilidade)
        if (email === this.config.adminEmail) {
            return true;
        }
        
        // Verificação por hash (mais seguro)
        const emailHash = this.generateEmailHash(email);
        return emailHash === this.config.adminEmailHash;
    }
    
    /**
     * Obter logs de atividade
     */
    async getLogs(limit = 100) {
        try {
            // Buscar na tabela blog_automation_log se existir, senão criar logs básicos
            const { data, error } = await this.supabase
                .from('n8n_blog_queue')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) {
                throw new Error(`Erro ao obter logs: ${error.message}`);
            }
            
            return {
                success: true,
                logs: data
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter logs:', error.message);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Registrar atividade no log
     */
    async logActivity(action, status, message, details = null) {
        try {
            const logEntry = {
                action,
                status,
                message,
                details: details ? JSON.stringify(details) : null,
                timestamp: new Date().toISOString()
            };
            
            console.log(`📝 LOG [${status.toUpperCase()}] ${action}: ${message}`);
            
            // Aqui poderia salvar em uma tabela de logs se necessário
            // Por enquanto, apenas console.log
            
        } catch (error) {
            console.error('❌ Erro ao registrar log:', error.message);
        }
    }
    
    /**
     * Configurar parâmetros do serviço
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Se mudou o cron schedule, reiniciar scheduler
        if (newConfig.cronSchedule && this.cronJob) {
            this.stopScheduler();
            this.startScheduler();
        }
        
        this.logActivity('config_update', 'success', 'Configuração atualizada', newConfig);
        console.log('⚙️ Configuração atualizada:', newConfig);
    }
    
    /**
     * Obter configuração atual
     */
    getConfig() {
        return {
            ...this.config,
            lastExecution: this.lastExecution,
            isRunning: this.isRunning,
            schedulerActive: !!this.cronJob
        };
    }
}

// Instância singleton
let automationServiceInstance = null;

/**
 * Obter instância do serviço (singleton)
 */
function getBlogAutomationService() {
    if (!automationServiceInstance) {
        automationServiceInstance = new BlogAutomationService();
    }
    return automationServiceInstance;
}

module.exports = {
    BlogAutomationService,
    getBlogAutomationService
};

