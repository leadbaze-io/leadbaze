/**
 * =====================================================
 * BLOG QUEUE ROUTES - Inserção Manual de Posts
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Função para obter cliente Supabase
function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

/**
 * POST /api/blog/queue/add
 * Adicionar post manualmente à fila
 */
router.post('/add', async (req, res) => {
    try {
        const { title, content, category, date, imageurl, autor } = req.body;
        
        // Validação
        if (!title || !content || !category || !date) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: title, content, category, date'
            });
        }
        
        // Inserir na fila
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('n8n_blog_queue')
            .insert([{
                title,
                content,
                category,
                date,
                imageurl: imageurl || null,
                autor: autor || 'LeadBaze Team',
                processed: false
            }])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao adicionar à fila:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao adicionar à fila',
                details: error.message
            });
        }
        
        console.log('✅ Post adicionado à fila:', data);
        res.json({
            success: true,
            message: 'Post adicionado à fila com sucesso',
            data
        });
        
    } catch (error) {
        console.error('❌ Erro no endpoint /add:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

/**
 * GET /api/blog/queue/list
 * Listar posts na fila
 */
router.get('/list', async (req, res) => {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('n8n_blog_queue')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro ao listar fila:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao listar fila',
                details: error.message
            });
        }
        
        res.json({
            success: true,
            data: data || []
        });
        
    } catch (error) {
        console.error('❌ Erro no endpoint /list:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

/**
 * POST /api/blog/queue/process
 * Processar fila manualmente
 */
router.post('/process', async (req, res) => {
    try {
        // Importar o serviço de automação
        const { BlogAutomationService, getBlogAutomationService } = require('../services/blogAutomationService');
        const automationService = getBlogAutomationService();
        
        // Processar fila
        const result = await automationService.processQueue();
        
        res.json({
            success: true,
            message: 'Fila processada com sucesso',
            result
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar fila:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar fila',
            details: error.message
        });
    }
});

module.exports = router;
