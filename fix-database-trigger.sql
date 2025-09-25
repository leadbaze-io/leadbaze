-- Script para verificar e recriar o trigger de processamento automático

-- 1. Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'n8n_blog_queue';

-- 2. Verificar se a função existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'notify_new_blog_post';

-- 3. Recriar a função se não existir
CREATE OR REPLACE FUNCTION notify_new_blog_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Enviar notificação para o webhook do backend
    PERFORM pg_notify('new_blog_post', json_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'processed', NEW.processed,
        'timestamp', NOW()
    )::text);
    
    -- Chamar webhook HTTP para o backend
    PERFORM net.http_post(
        url := 'https://leadbaze.io/api/blog/auto/webhook',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object(
            'id', NEW.id,
            'title', NEW.title,
            'processed', NEW.processed,
            'timestamp', NOW()
        )::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recriar o trigger
DROP TRIGGER IF EXISTS trigger_auto_process_blog ON n8n_blog_queue;

CREATE TRIGGER trigger_auto_process_blog
    AFTER INSERT OR UPDATE ON n8n_blog_queue
    FOR EACH ROW
    WHEN (NEW.processed = false)
    EXECUTE FUNCTION notify_new_blog_post();

-- 5. Verificar se foi criado corretamente
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'n8n_blog_queue';

-- 6. Testar o trigger (opcional)
-- INSERT INTO n8n_blog_queue (title, content, category, date, autor, processed)
-- VALUES ('Teste Trigger', 'Conteúdo de teste', 'Automação de Vendas', CURRENT_DATE, 'Sistema', false);






























