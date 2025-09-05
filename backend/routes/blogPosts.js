const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

console.log('📦 [BlogPosts] Módulo blogPosts.js carregado');
console.log('📦 [BlogPosts] Router criado:', router);

// Configurar Supabase (será inicializado quando necessário)
let supabase = null;

const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
};

// Middleware para verificar se é admin
const isAuthorizedAdmin = (email) => {
  const adminEmail = 'creaty12345@gmail.com';
  return email === adminEmail;
};

// Deletar post
console.log('🔧 [BlogPosts] Definindo rota DELETE /delete-post');
router.delete('/delete-post', async (req, res) => {
  try {
    console.log('🗑️ [Backend] ===== INÍCIO DA REQUISIÇÃO DELETE =====');
    console.log('🗑️ [Backend] Timestamp:', new Date().toISOString());
    console.log('🗑️ [Backend] IP:', req.ip);
    console.log('🗑️ [Backend] User-Agent:', req.get('User-Agent'));
    console.log('🗑️ [Backend] Origin:', req.get('Origin'));
    console.log('🗑️ [Backend] Referer:', req.get('Referer'));
    console.log('🗑️ [Backend] Headers completos:', JSON.stringify(req.headers, null, 2));
    console.log('🗑️ [Backend] Body:', req.body);
    console.log('🗑️ [Backend] Body type:', typeof req.body);
    console.log('🗑️ [Backend] Body is null?', req.body === null);
    console.log('🗑️ [Backend] Body is undefined?', req.body === undefined);
    
    // Verificar se o body está disponível
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Body da requisição não está disponível. Verifique se o middleware express.json() está configurado.'
      });
    }
    
    const { postId } = req.body;
    const userEmail = req.headers['x-user-email'];

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Email do usuário é obrigatório'
      });
    }

    if (!isAuthorizedAdmin(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem deletar posts'
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'ID do post é obrigatório'
      });
    }

    console.log('🗑️ [Backend] Verificando se o post existe...');
    
    // Primeiro, verificar se o post existe
    const { data: existingPost, error: checkError } = await getSupabaseClient()
      .from('blog_posts')
      .select('id, title, slug')
      .eq('id', postId)
      .single();

    console.log('🗑️ [Backend] Post encontrado:', { existingPost, checkError });

    if (checkError || !existingPost) {
      console.log('🗑️ [Backend] Post não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    console.log('🗑️ [Backend] Deletando post:', postId, 'Título:', existingPost.title);

    // Deletar o post
    const { data, error } = await getSupabaseClient()
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .select();

    console.log('🗑️ [Backend] Resultado da deleção:', { data, error });

    if (error) {
      console.error('🗑️ [Backend] Erro ao deletar post:', error);
      return res.status(500).json({
        success: false,
        message: `Erro ao deletar post: ${error.message}`,
        error: error
      });
    }

    if (data && data.length > 0) {
      console.log('🗑️ [Backend] Post deletado com sucesso:', data[0]);
      return res.json({
        success: true,
        message: 'Post deletado com sucesso',
        deletedPost: data[0]
      });
    } else {
      console.log('🗑️ [Backend] Post não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

  } catch (error) {
    console.error('🗑️ [Backend] Erro inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

console.log('📦 [BlogPosts] Exportando router com rotas:', router.stack?.map(r => r.route?.path) || 'N/A');
module.exports = router;
