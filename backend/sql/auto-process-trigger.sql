-- =====================================================
-- TRIGGER AUTOMÁTICO PARA PROCESSAMENTO DE POSTS
-- Sistema eficiente que só executa quando há novos posts
-- =====================================================

-- 1. Criar função que será executada quando um novo post for inserido
CREATE OR REPLACE FUNCTION trigger_auto_process_blog_post()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT;
    payload JSON;
    response TEXT;
BEGIN
    -- Log da inserção
    RAISE NOTICE 'Novo post detectado: % (ID: %)', NEW.title, NEW.id;
    
    -- URL do webhook (ajuste conforme necessário)
    webhook_url := 'https://leadbaze.io/api/blog/realtime/webhook';
    
    -- Preparar payload
    payload := json_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'created_at', NEW.created_at,
        'trigger_type', 'auto_process'
    );
    
    -- Chamar webhook de forma assíncrona (não bloqueia a inserção)
    -- Usando pg_notify para notificar o backend
    PERFORM pg_notify('new_blog_post', payload::text);
    
    RAISE NOTICE 'Notificação enviada para processamento automático';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar trigger que executa a função quando um novo post é inserido
DROP TRIGGER IF EXISTS trigger_auto_process_blog ON n8n_blog_queue;
CREATE TRIGGER trigger_auto_process_blog
    AFTER INSERT ON n8n_blog_queue
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_process_blog_post();

-- 3. Função para processamento direto (alternativa mais simples)
CREATE OR REPLACE FUNCTION auto_process_single_post()
RETURNS TRIGGER AS $$
DECLARE
    blog_post_id UUID;
    category_id UUID;
    formatted_content TEXT;
    final_slug TEXT;
BEGIN
    -- Log
    RAISE NOTICE 'Processando post automaticamente: %', NEW.title;
    
    -- Gerar slug
    final_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
    final_slug := regexp_replace(final_slug, '\s+', '-', 'g');
    final_slug := final_slug || '-' || extract(epoch from now())::bigint;
    
    -- Buscar categoria (usar fallback se não encontrar)
    SELECT id INTO category_id FROM blog_categories 
    WHERE name = NEW.category 
    LIMIT 1;
    
    IF category_id IS NULL THEN
        -- Usar categoria padrão (Inteligência de Dados)
        SELECT id INTO category_id FROM blog_categories 
        WHERE name = 'Inteligência de Dados' 
        LIMIT 1;
    END IF;
    
    -- Formatar conteúdo (conversão básica de Markdown para HTML)
    formatted_content := NEW.content;
    formatted_content := regexp_replace(formatted_content, '^# (.+)$', '<h1>\1</h1>', 'gm');
    formatted_content := regexp_replace(formatted_content, '^## (.+)$', '<h2>\1</h2>', 'gm');
    formatted_content := regexp_replace(formatted_content, '^### (.+)$', '<h3>\1</h3>', 'gm');
    formatted_content := regexp_replace(formatted_content, '\*\*(.+?)\*\*', '<strong>\1</strong>', 'g');
    formatted_content := regexp_replace(formatted_content, '\*(.+?)\*', '<em>\1</em>', 'g');
    formatted_content := regexp_replace(formatted_content, '\n', '<br>', 'g');
    
    -- Inserir post no blog
    INSERT INTO blog_posts (
        title,
        slug,
        content,
        excerpt,
        featured_image,
        category_id,
        author_name,
        author_avatar,
        published,
        published_at,
        read_time,
        seo_title,
        seo_description,
        n8n_sync_id,
        n8n_last_sync
    ) VALUES (
        NEW.title,
        final_slug,
        formatted_content,
        left(NEW.content, 200) || '...',
        NEW.imageurl,
        category_id,
        COALESCE(NEW.autor, 'LeadBaze Team'),
        '/avatars/leadbaze-ai.png',
        true,
        NOW(),
        GREATEST(1, ceil(length(NEW.content) / 1250)),
        NEW.title,
        left(NEW.content, 160),
        NEW.id::text,
        NOW()
    ) RETURNING id INTO blog_post_id;
    
    -- Marcar como processado
    UPDATE n8n_blog_queue 
    SET 
        processed = true,
        processed_at = NOW(),
        blog_post_id = blog_post_id,
        error_message = NULL
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Post processado automaticamente com ID: %', blog_post_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para processamento direto (mais eficiente)
-- ATENÇÃO: Descomente apenas se quiser processamento 100% automático
-- DROP TRIGGER IF EXISTS trigger_direct_process ON n8n_blog_queue;
-- CREATE TRIGGER trigger_direct_process
--     AFTER INSERT ON n8n_blog_queue
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_process_single_post();

-- 5. Função para ativar/desativar processamento automático
CREATE OR REPLACE FUNCTION toggle_auto_processing(enable BOOLEAN DEFAULT true)
RETURNS TEXT AS $$
BEGIN
    IF enable THEN
        -- Ativar trigger de notificação
        DROP TRIGGER IF EXISTS trigger_auto_process_blog ON n8n_blog_queue;
        CREATE TRIGGER trigger_auto_process_blog
            AFTER INSERT ON n8n_blog_queue
            FOR EACH ROW
            EXECUTE FUNCTION trigger_auto_process_blog_post();
        
        RETURN 'Processamento automático ATIVADO';
    ELSE
        -- Desativar triggers
        DROP TRIGGER IF EXISTS trigger_auto_process_blog ON n8n_blog_queue;
        DROP TRIGGER IF EXISTS trigger_direct_process ON n8n_blog_queue;
        
        RETURN 'Processamento automático DESATIVADO';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar status dos triggers
CREATE OR REPLACE FUNCTION check_auto_processing_status()
RETURNS TABLE(
    trigger_name TEXT,
    is_active BOOLEAN,
    function_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        true as is_active,
        t.action_statement::TEXT as function_name
    FROM information_schema.triggers t
    WHERE t.event_object_table = 'n8n_blog_queue'
    AND t.trigger_name LIKE '%auto_process%';
END;
$$ LANGUAGE plpgsql;

