-- =====================================================
-- CORREÇÃO DA FUNÇÃO process_n8n_blog_queue
-- =====================================================

-- Recriar a função com correções
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
                queue_item.date::TIMESTAMP WITH TIME ZONE,
                -- Calcular tempo de leitura (250 palavras por minuto)
                GREATEST(1, (LENGTH(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g')) / 5) / 250),
                queue_item.title,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160),
                queue_item.id::TEXT,
                NOW()
            ) RETURNING id INTO new_post_id;
            
            -- Marcar como processado (COM WHERE CLAUSE EXPLÍCITO)
            UPDATE n8n_blog_queue 
            SET 
                processed = TRUE,
                blog_post_id = new_post_id,
                processed_at = NOW(),
                error_message = NULL
            WHERE id = queue_item.id; -- WHERE CLAUSE OBRIGATÓRIO
            
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
            -- Em caso de erro, marcar com erro (COM WHERE CLAUSE EXPLÍCITO)
            UPDATE n8n_blog_queue 
            SET 
                error_message = SQLERRM,
                processed_at = NOW()
            WHERE id = queue_item.id; -- WHERE CLAUSE OBRIGATÓRIO
            
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

-- Testar a função
SELECT * FROM process_n8n_blog_queue();
