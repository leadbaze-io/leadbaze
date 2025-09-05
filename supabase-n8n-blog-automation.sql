-- =====================================================
-- N8N BLOG AUTOMATION - Setup do Banco de Dados
-- Sistema para automação de artigos via N8N
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA PARA RECEBER DADOS DO N8N
-- =====================================================

CREATE TABLE IF NOT EXISTS n8n_blog_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    imageurl TEXT,
    autor TEXT DEFAULT 'LeadBaze Team',
    
    -- Campos de controle
    processed BOOLEAN DEFAULT FALSE,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Índices para busca
    CONSTRAINT n8n_blog_queue_title_date_unique UNIQUE (title, date)
);

-- Adicionar coluna autor se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'n8n_blog_queue' 
        AND column_name = 'autor'
    ) THEN
        ALTER TABLE n8n_blog_queue ADD COLUMN autor TEXT DEFAULT 'LeadBaze Team';
    END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_n8n_blog_queue_processed ON n8n_blog_queue(processed);
CREATE INDEX IF NOT EXISTS idx_n8n_blog_queue_date ON n8n_blog_queue(date);
CREATE INDEX IF NOT EXISTS idx_n8n_blog_queue_created_at ON n8n_blog_queue(created_at);

-- =====================================================
-- 2. FUNÇÃO PARA PROCESSAR FILA N8N
-- =====================================================

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
        LIMIT 10 -- Processar até 10 por vez para evitar timeouts
    LOOP
        BEGIN
            -- Buscar categoria por nome (não criar nova)
            SELECT id INTO category_id 
            FROM blog_categories 
            WHERE name = queue_item.category;
            
            -- Se categoria não existe, usar categoria padrão
            IF category_id IS NULL THEN
                SELECT id INTO category_id 
                FROM blog_categories 
                WHERE name = 'Gestão e Vendas B2B';
                
                -- Se ainda não existe, usar a primeira categoria disponível
                IF category_id IS NULL THEN
                    SELECT id INTO category_id 
                    FROM blog_categories 
                    LIMIT 1;
                END IF;
            END IF;
            
            -- Criar slug único para o post
            base_slug := LOWER(REPLACE(REGEXP_REPLACE(queue_item.title, '[^a-zA-Z0-9\s]', '', 'g'), ' ', '-'));
            final_slug := base_slug;
            slug_counter := 1;
            
            -- Verificar se slug já existe e criar versão única
            WHILE EXISTS(SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
                final_slug := base_slug || '-' || slug_counter;
                slug_counter := slug_counter + 1;
            END LOOP;
            
            -- Criar o post no blog
            INSERT INTO blog_posts (
                title,
                slug,
                excerpt,
                content,
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
                queue_item.title,
                final_slug,
                -- Gerar excerpt automaticamente (primeiros 160 caracteres)
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160) || '...',
                queue_item.content,
                queue_item.imageurl,
                category_id,
                COALESCE(queue_item.autor, 'LeadBaze Team'), -- Usar autor do N8N ou padrão
                '/avatars/leadbaze-ai.png',
                TRUE, -- Publicar automaticamente
                NOW(),
                -- Calcular tempo de leitura (250 palavras por minuto)
                GREATEST(1, (LENGTH(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g')) / 5) / 250),
                queue_item.title,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160),
                queue_item.id::TEXT,
                NOW()
            ) RETURNING id INTO new_post_id;
            
            -- Marcar como processado
            UPDATE n8n_blog_queue 
            SET 
                processed = TRUE,
                blog_post_id = new_post_id,
                processed_at = NOW(),
                error_message = NULL
            WHERE id = queue_item.id;
            
            processed_count := processed_count + 1;
            
            -- Adicionar aos detalhes
            item_detail := jsonb_build_object(
                'id', queue_item.id,
                'title', queue_item.title,
                'status', 'success',
                'blog_post_id', new_post_id
            );
            details := details || item_detail;
            
        EXCEPTION WHEN OTHERS THEN
            -- Em caso de erro, marcar com erro
            UPDATE n8n_blog_queue 
            SET 
                error_message = SQLERRM,
                processed_at = NOW()
            WHERE id = queue_item.id;
            
            error_count := error_count + 1;
            
            -- Adicionar erro aos detalhes
            item_detail := jsonb_build_object(
                'id', queue_item.id,
                'title', queue_item.title,
                'status', 'error',
                'error', SQLERRM
            );
            details := details || item_detail;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, error_count, details;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNÇÃO PARA ESTATÍSTICAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_n8n_blog_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_queue', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE processed = FALSE AND error_message IS NULL),
        'processed', COUNT(*) FILTER (WHERE processed = TRUE),
        'errors', COUNT(*) FILTER (WHERE error_message IS NOT NULL),
        'today_added', COUNT(*) FILTER (WHERE date = CURRENT_DATE),
        'this_week', COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '7 days'),
        'last_processed', MAX(processed_at)
    )
    INTO result
    FROM n8n_blog_queue;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGER PARA AUTO-PROCESSAMENTO (OPCIONAL)
-- =====================================================

CREATE OR REPLACE FUNCTION auto_process_n8n_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Processar automaticamente quando um novo item é inserido
    -- (apenas se não houver muitos pendentes)
    IF (SELECT COUNT(*) FROM n8n_blog_queue WHERE processed = FALSE) <= 5 THEN
        PERFORM process_n8n_blog_queue();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (comentado por padrão - descomente se quiser processamento automático)
-- DROP TRIGGER IF EXISTS auto_process_n8n_blog ON n8n_blog_queue;
-- CREATE TRIGGER auto_process_n8n_blog
--     AFTER INSERT ON n8n_blog_queue
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_process_n8n_trigger();

-- =====================================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE n8n_blog_queue ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos podem ler)
DROP POLICY IF EXISTS "Todos podem visualizar fila N8N" ON n8n_blog_queue;
CREATE POLICY "Todos podem visualizar fila N8N"
ON n8n_blog_queue FOR SELECT
TO public
USING (true);

-- Política para inserção (apenas service_role pode inserir)
DROP POLICY IF EXISTS "Apenas service_role pode inserir" ON n8n_blog_queue;
CREATE POLICY "Apenas service_role pode inserir"
ON n8n_blog_queue FOR INSERT
TO service_role
WITH CHECK (true);

-- Política para atualização (apenas service_role pode atualizar)
DROP POLICY IF EXISTS "Apenas service_role pode atualizar" ON n8n_blog_queue;
CREATE POLICY "Apenas service_role pode atualizar"
ON n8n_blog_queue FOR UPDATE
TO service_role
USING (true);

-- =====================================================
-- 6. DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Inserir categorias padrão se não existirem
INSERT INTO blog_categories (name, slug, description, color, icon)
VALUES 
    ('Automação', 'automacao', 'Artigos sobre automação de processos', 'bg-blue-500', '🤖'),
    ('Vendas', 'vendas', 'Estratégias e técnicas de vendas', 'bg-green-500', '💰'),
    ('Marketing', 'marketing', 'Marketing digital e lead generation', 'bg-purple-500', '📈'),
    ('Tecnologia', 'tecnologia', 'Inovações e tendências tecnológicas', 'bg-indigo-500', '💻'),
    ('Negócios', 'negocios', 'Gestão e estratégias de negócios', 'bg-orange-500', '🏢')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. QUERIES ÚTEIS PARA MONITORAMENTO
-- =====================================================

-- Para visualizar a fila
-- SELECT * FROM n8n_blog_queue ORDER BY created_at DESC;

-- Para processar manualmente a fila
-- SELECT * FROM process_n8n_blog_queue();

-- Para ver estatísticas
-- SELECT get_n8n_blog_stats();

-- Para ver posts criados hoje
-- SELECT p.*, q.date as original_date 
-- FROM blog_posts p 
-- JOIN n8n_blog_queue q ON q.blog_post_id = p.id 
-- WHERE q.date = CURRENT_DATE;

-- Para limpar itens processados antigos (mais de 30 dias)
-- DELETE FROM n8n_blog_queue 
-- WHERE processed = TRUE 
-- AND processed_at < NOW() - INTERVAL '30 days';

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Comentários finais
COMMENT ON TABLE n8n_blog_queue IS 'Fila de conteúdo recebido do N8N para processamento automático no blog';
COMMENT ON FUNCTION process_n8n_blog_queue() IS 'Processa itens da fila N8N criando posts no blog automaticamente';
COMMENT ON FUNCTION get_n8n_blog_stats() IS 'Retorna estatísticas da fila de processamento N8N';

-- Verificação final
DO $$
BEGIN
    RAISE NOTICE '✅ Setup N8N Blog Automation concluído com sucesso!';
    RAISE NOTICE '📊 Tabela n8n_blog_queue criada';
    RAISE NOTICE '⚙️ Funções de processamento instaladas';
    RAISE NOTICE '🔒 Políticas de segurança configuradas';
    RAISE NOTICE '📝 Categorias padrão inseridas';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Para usar:';
    RAISE NOTICE '1. N8N insere dados na tabela n8n_blog_queue (title, content, category, date, imageurl, autor)';
    RAISE NOTICE '2. Execute: SELECT * FROM process_n8n_blog_queue();';
    RAISE NOTICE '3. Monitore com: SELECT get_n8n_blog_stats();';
END $$;
