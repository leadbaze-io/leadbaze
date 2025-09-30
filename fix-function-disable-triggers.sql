-- Função que desabilita triggers temporariamente
DROP FUNCTION IF EXISTS process_n8n_blog_queue();

CREATE OR REPLACE FUNCTION process_n8n_blog_queue()
RETURNS TABLE(processed_count INTEGER, error_count INTEGER, details JSONB)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    queue_item RECORD;
    processed_count INTEGER := 0;
    error_count INTEGER := 0;
    details JSONB := '[]'::JSONB;
    item_detail JSONB;
    category_id UUID;
    new_post_id UUID;
    base_slug TEXT;
    final_slug TEXT;
    slug_counter INTEGER;
    current_item_id UUID;
BEGIN
    RAISE NOTICE '🚀 [NO-TRIGGERS] Iniciando processamento da fila N8N...';
    
    -- Desabilitar triggers temporariamente
    ALTER TABLE blog_posts DISABLE TRIGGER ALL;
    ALTER TABLE blog_categories DISABLE TRIGGER ALL;
    
    FOR queue_item IN SELECT * FROM n8n_blog_queue WHERE processed = FALSE ORDER BY created_at ASC
    LOOP
        BEGIN
            current_item_id := queue_item.id;
            RAISE NOTICE '📝 [NO-TRIGGERS] Processando: % (ID: %)', queue_item.title, current_item_id;
            
            -- Buscar ou criar categoria
            SELECT id INTO category_id 
            FROM blog_categories 
            WHERE LOWER(slug) = LOWER(REPLACE(LOWER(queue_item.category), ' ', '-'));
            
            IF category_id IS NULL THEN
                INSERT INTO blog_categories (name, slug, description, color, icon)
                VALUES (
                    queue_item.category,
                    LOWER(REPLACE(LOWER(queue_item.category), ' ', '-')),
                    'Categoria criada automaticamente pelo N8N',
                    'bg-blue-500',
                    '📝'
                ) RETURNING id INTO category_id;
                
                RAISE NOTICE '✅ [NO-TRIGGERS] Categoria criada: % (ID: %)', queue_item.category, category_id;
            END IF;
            
            -- Gerar slug único
            base_slug := LOWER(REPLACE(REGEXP_REPLACE(queue_item.title, '[^a-zA-Z0-9\s]', '', 'g'), ' ', '-'));
            final_slug := base_slug;
            slug_counter := 1;
            
            WHILE EXISTS(SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
                final_slug := base_slug || '-' || slug_counter;
                slug_counter := slug_counter + 1;
            END LOOP;
            
            RAISE NOTICE '🔗 [NO-TRIGGERS] Slug gerado: %', final_slug;
            
            -- Inserir post SEM triggers
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
                seo_description
            ) VALUES (
                queue_item.title,
                final_slug,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160) || '...',
                queue_item.content,
                queue_item.imageurl,
                category_id,
                COALESCE(queue_item.autor, 'LeadBaze Team'),
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                TRUE,
                COALESCE(queue_item.date::TIMESTAMP, NOW()),
                GREATEST(1, CEIL(LENGTH(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g')) / 200)),
                queue_item.title,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160)
            ) RETURNING id INTO new_post_id;
            
            RAISE NOTICE '✅ [NO-TRIGGERS] Post criado com sucesso (ID: %)', new_post_id;
            
            -- Marcar como processado
            UPDATE n8n_blog_queue 
            SET 
                processed = TRUE,
                blog_post_id = new_post_id,
                processed_at = NOW(),
                error_message = NULL
            WHERE id = current_item_id;
            
            RAISE NOTICE '✅ [NO-TRIGGERS] Item marcado como processado (ID: %)', current_item_id;
            
            processed_count := processed_count + 1;
            
            item_detail := jsonb_build_object(
                'id', current_item_id,
                'title', queue_item.title,
                'status', 'success',
                'blog_post_id', new_post_id
            );
            details := details || item_detail;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ [NO-TRIGGERS] Erro ao processar %: %', queue_item.title, SQLERRM;
            
            UPDATE n8n_blog_queue 
            SET 
                error_message = SQLERRM,
                processed_at = NOW()
            WHERE id = current_item_id;
            
            error_count := error_count + 1;
            
            item_detail := jsonb_build_object(
                'id', current_item_id,
                'title', queue_item.title,
                'status', 'error',
                'error', SQLERRM
            );
            details := details || item_detail;
        END;
    END LOOP;
    
    -- Reabilitar triggers
    ALTER TABLE blog_posts ENABLE TRIGGER ALL;
    ALTER TABLE blog_categories ENABLE TRIGGER ALL;
    
    RAISE NOTICE '🏁 [NO-TRIGGERS] Processamento concluído: % processados, % erros', processed_count, error_count;
    
    RETURN QUERY SELECT processed_count, error_count, details;
END;
$$;
