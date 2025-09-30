-- Função com logs detalhados para debug
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
    debug_info TEXT;
BEGIN
    -- Log inicial
    RAISE NOTICE '=== INICIANDO PROCESSAMENTO DA FILA ===';
    
    -- Processar apenas itens não processados
    FOR queue_item IN 
        SELECT * FROM n8n_blog_queue 
        WHERE processed = FALSE 
        ORDER BY date ASC, created_at ASC
        LIMIT 10
    LOOP
        BEGIN
            RAISE NOTICE 'Processando item: % - %', queue_item.id, queue_item.title;
            
            -- Buscar ou criar categoria
            SELECT id INTO category_id 
            FROM blog_categories 
            WHERE LOWER(slug) = LOWER(REPLACE(LOWER(queue_item.category), ' ', '-'));
            
            RAISE NOTICE 'Categoria encontrada: %', category_id;
            
            -- Se categoria não existe, criar uma nova
            IF category_id IS NULL THEN
                RAISE NOTICE 'Criando nova categoria: %', queue_item.category;
                INSERT INTO blog_categories (name, slug, description, color, icon)
                VALUES (
                    queue_item.category,
                    LOWER(REPLACE(LOWER(queue_item.category), ' ', '-')),
                    'Categoria criada automaticamente pelo N8N',
                    'bg-blue-500',
                    '📝'
                ) RETURNING id INTO category_id;
                RAISE NOTICE 'Categoria criada com ID: %', category_id;
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
            
            RAISE NOTICE 'Slug final: %', final_slug;
            
            -- Criar o post no blog
            RAISE NOTICE 'Criando post no blog...';
            INSERT INTO blog_posts (
                title, slug, excerpt, content, featured_image,
                category_id, author_name, author_avatar, published,
                published_at, read_time, seo_title, seo_description,
                n8n_sync_id, n8n_last_sync
            ) VALUES (
                queue_item.title,
                final_slug,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160) || '...',
                queue_item.content,
                queue_item.imageurl,
                category_id,
                COALESCE(queue_item.autor, 'LeadBaze Team'),
                '/avatars/leadbaze-ai.png',
                TRUE,
                queue_item.date::TIMESTAMP WITH TIME ZONE,
                GREATEST(1, (LENGTH(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g')) / 5) / 250),
                queue_item.title,
                LEFT(REGEXP_REPLACE(queue_item.content, '<[^>]+>', '', 'g'), 160),
                queue_item.id::TEXT,
                NOW()
            ) RETURNING id INTO new_post_id;
            
            RAISE NOTICE 'Post criado com ID: %', new_post_id;
            
            -- Marcar como processado - COM LOG DETALHADO
            RAISE NOTICE 'Atualizando fila para item ID: %', queue_item.id;
            debug_info := 'UPDATE n8n_blog_queue SET processed = TRUE, blog_post_id = ' || new_post_id || ', processed_at = NOW(), error_message = NULL WHERE id = ' || queue_item.id;
            RAISE NOTICE 'Query UPDATE: %', debug_info;
            
            UPDATE n8n_blog_queue 
            SET processed = TRUE,
                blog_post_id = new_post_id,
                processed_at = NOW(),
                error_message = NULL
            WHERE id = queue_item.id;
            
            RAISE NOTICE 'Item processado com sucesso!';
            
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
            RAISE NOTICE 'ERRO ao processar item %: %', queue_item.id, SQLERRM;
            
            -- Em caso de erro, marcar com erro - COM LOG DETALHADO
            debug_info := 'UPDATE n8n_blog_queue SET error_message = ' || quote_literal(SQLERRM) || ', processed_at = NOW() WHERE id = ' || queue_item.id;
            RAISE NOTICE 'Query UPDATE de erro: %', debug_info;
            
            UPDATE n8n_blog_queue 
            SET error_message = SQLERRM,
                processed_at = NOW()
            WHERE id = queue_item.id;
            
            RAISE NOTICE 'Item marcado com erro!';
            
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
    
    RAISE NOTICE '=== PROCESSAMENTO CONCLUÍDO ===';
    RAISE NOTICE 'Processados: %, Erros: %', processed_count, error_count;
    
    RETURN QUERY SELECT processed_count, error_count, details;
END;
$$ LANGUAGE plpgsql;
