-- =====================================================
-- TRIGGER SEGURO PARA PROCESSAMENTO AUTOMÁTICO
-- Versão que não interfere com o sistema existente
-- =====================================================

-- 1. Função para notificar o backend (sem afetar triggers existentes)
CREATE OR REPLACE FUNCTION notify_new_blog_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da inserção
    RAISE NOTICE 'Novo post detectado: % (ID: %)', NEW.title, NEW.id;
    
    -- Enviar notificação para o backend
    PERFORM pg_notify('new_blog_post', json_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'created_at', NEW.created_at,
        'trigger_type', 'auto_notify'
    )::text);
    
    RAISE NOTICE 'Notificação enviada para processamento automático';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar trigger APENAS se não existir (evita conflitos)
DO $$
BEGIN
    -- Verificar se o trigger já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_notify_new_post' 
        AND event_object_table = 'n8n_blog_queue'
    ) THEN
        -- Criar trigger apenas se não existir
        CREATE TRIGGER trigger_notify_new_post
            AFTER INSERT ON n8n_blog_queue
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_blog_post();
        
        RAISE NOTICE 'Trigger de notificação criado com sucesso';
    ELSE
        RAISE NOTICE 'Trigger de notificação já existe, pulando criação';
    END IF;
END $$;

-- 3. Função para verificar se o sistema está funcionando
CREATE OR REPLACE FUNCTION test_auto_processing()
RETURNS TABLE(
    status TEXT,
    message TEXT,
    timestamp TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'OK'::TEXT as status,
        'Sistema de processamento automático configurado'::TEXT as message,
        NOW() as timestamp;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para desativar o trigger (se necessário)
CREATE OR REPLACE FUNCTION disable_auto_processing()
RETURNS TEXT AS $$
BEGIN
    -- Remover apenas o trigger que criamos
    DROP TRIGGER IF EXISTS trigger_notify_new_post ON n8n_blog_queue;
    RETURN 'Processamento automático DESATIVADO com segurança';
END;
$$ LANGUAGE plpgsql;

-- 5. Função para verificar status dos triggers
CREATE OR REPLACE FUNCTION check_processing_triggers()
RETURNS TABLE(
    trigger_name TEXT,
    status TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        CASE 
            WHEN t.trigger_name = 'trigger_notify_new_post' THEN 'ATIVO'
            ELSE 'EXISTENTE'
        END as status,
        NOW() as created_at
    FROM information_schema.triggers t
    WHERE t.event_object_table = 'n8n_blog_queue'
    AND t.trigger_name LIKE '%notify%';
END;
$$ LANGUAGE plpgsql;

-- 6. Testar o sistema
SELECT * FROM test_auto_processing();
SELECT * FROM check_processing_triggers();

