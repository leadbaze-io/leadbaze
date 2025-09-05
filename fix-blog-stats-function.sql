-- Corrigir a função update_blog_stats para ter WHERE clause explícito
DROP FUNCTION IF EXISTS update_blog_stats();

CREATE OR REPLACE FUNCTION update_blog_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se a tabela blog_stats existe e tem dados
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_stats') THEN
        -- Se a tabela existe mas está vazia, inserir um registro
        IF NOT EXISTS (SELECT 1 FROM blog_stats) THEN
            INSERT INTO blog_stats (total_posts, total_published_posts, total_views, total_likes, last_updated)
            VALUES (0, 0, 0, 0, NOW());
        END IF;
        
        -- Atualizar com WHERE clause explícito
        UPDATE blog_stats SET
            total_posts = (SELECT COUNT(*) FROM blog_posts),
            total_published_posts = (SELECT COUNT(*) FROM blog_posts WHERE published = true),
            total_views = (SELECT COALESCE(SUM(views), 0) FROM blog_posts),
            total_likes = (SELECT COALESCE(SUM(likes), 0) FROM blog_posts),
            last_updated = NOW()
        WHERE id = (SELECT id FROM blog_stats LIMIT 1);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
