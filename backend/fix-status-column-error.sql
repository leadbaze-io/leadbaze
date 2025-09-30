-- CORREÇÃO: Remover referências à coluna 'status' inexistente
-- Este script corrige o erro "Could not find the 'status' column of 'blog_posts'"

-- 1. Primeiro, vamos verificar se existe alguma versão antiga da função
DROP FUNCTION IF EXISTS process_n8n_blog_queue();

-- 2. Recriar a função sem referências à coluna 'status'
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
            
            -- Validar dados obrigatórios antes de inserir
            IF queue_item.title IS NULL OR TRIM(queue_item.title) = '' THEN
                RAISE EXCEPTION 'Título não pode ser nulo ou vazio';
            END IF;
            
            IF queue_item.content IS NULL OR TRIM(queue_item.content) = '' THEN
                RAISE EXCEPTION 'Conteúdo não pode ser nulo ou vazio';
            END IF;
            
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
                COALESCE(NULLIF(TRIM(queue_item.autor), ''), 'LeadBaze Team'), -- Usar autor do N8N ou padrão (tratar strings vazias como NULL)
                '/avatars/leadbaze-ai.png',
                TRUE, -- Publicar automaticamente
                NOW(), -- CORREÇÃO: Usar data atual em vez de queue_item.date
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
                'result', 'success',
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
                'result', 'error',
                'error', SQLERRM
            );
            details := details || item_detail;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed_count, error_count, details;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se a função foi criada corretamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'process_n8n_blog_queue';

-- 4. Testar a função (opcional - descomente se quiser testar)
-- SELECT * FROM process_n8n_blog_queue();

-- 5. Comentário final
COMMENT ON FUNCTION process_n8n_blog_queue() IS 'Função corrigida para processar fila N8N sem referências à coluna status inexistente';

