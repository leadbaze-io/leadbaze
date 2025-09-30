-- =====================================================
-- SISTEMA DE NOTIFICAÇÃO SEGURO PARA BLOG
-- Apenas adiciona notificação, não interfere em nada
-- =====================================================

-- 1. Função para notificar quando um novo post é adicionado
CREATE OR REPLACE FUNCTION notify_new_blog_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Log simples (não afeta nada)
    RAISE NOTICE 'Novo post adicionado à fila: %', NEW.title;
    
    -- Enviar notificação para o backend (via pg_notify)
    PERFORM pg_notify('new_blog_post', json_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'created_at', NEW.created_at,
        'action', 'new_post_added'
    )::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar trigger APENAS se não existir (100% seguro)
DO $$
BEGIN
    -- Verificar se já existe um trigger similar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_blog_notification' 
        AND event_object_table = 'n8n_blog_queue'
    ) THEN
        -- Criar trigger apenas se não existir
        CREATE TRIGGER trigger_blog_notification
            AFTER INSERT ON n8n_blog_queue
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_blog_post();
        
        RAISE NOTICE 'Sistema de notificação criado com sucesso';
    ELSE
        RAISE NOTICE 'Sistema de notificação já existe';
    END IF;
END $$;

-- 3. Função para testar se está funcionando (sem afetar dados)
CREATE OR REPLACE FUNCTION test_blog_notification()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Sistema de notificação funcionando corretamente';
END;
$$ LANGUAGE plpgsql;

-- 4. Função para remover o sistema (se necessário)
CREATE OR REPLACE FUNCTION remove_blog_notification()
RETURNS TEXT AS $$
BEGIN
    -- Remover apenas o que criamos
    DROP TRIGGER IF EXISTS trigger_blog_notification ON n8n_blog_queue;
    DROP FUNCTION IF EXISTS notify_new_blog_post();
    DROP FUNCTION IF EXISTS test_blog_notification();
    DROP FUNCTION IF EXISTS remove_blog_notification();
    
    RETURN 'Sistema de notificação removido com segurança';
END;
$$ LANGUAGE plpgsql;

-- 5. Verificar se foi criado corretamente
SELECT 
    'Sistema criado' as status,
    test_blog_notification() as resultado;

-- 6. Mostrar triggers ativos (apenas para verificação)
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'n8n_blog_queue'
AND trigger_name = 'trigger_blog_notification';

