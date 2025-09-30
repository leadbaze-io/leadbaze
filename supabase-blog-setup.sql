-- =====================================================
-- Blog LeadBaze - Setup do Banco de Dados
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE CATEGORIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT 'bg-gray-500',
    icon TEXT DEFAULT '📝',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_name ON blog_categories(name);

-- =====================================================
-- 2. TABELA DE TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tags
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_name ON blog_tags(name);

-- =====================================================
-- 3. TABELA DE POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'LeadBaze Team',
    author_avatar TEXT,
    author_bio TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 5,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    n8n_sync_id TEXT UNIQUE, -- ID para sincronização com N8N
    n8n_last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_views ON blog_posts(views);
CREATE INDEX IF NOT EXISTS idx_blog_posts_likes ON blog_posts(likes);
CREATE INDEX IF NOT EXISTS idx_blog_posts_n8n_sync_id ON blog_posts(n8n_sync_id);

-- Índice para busca full-text
CREATE INDEX IF NOT EXISTS idx_blog_posts_search 
ON blog_posts USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- =====================================================
-- 4. TABELA DE RELACIONAMENTO POST-TAGS (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Índices para relacionamentos
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- =====================================================
-- 5. TABELA DE ESTATÍSTICAS DO BLOG
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_posts INTEGER DEFAULT 0,
    total_published_posts INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial de estatísticas
INSERT INTO blog_stats (total_posts, total_published_posts, total_views, total_likes)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_blog_tags_updated_at BEFORE UPDATE ON blog_tags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para atualizar contadores de posts por categoria
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Se foi inserido um novo post
    IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL AND NEW.published = true THEN
        UPDATE blog_categories 
        SET post_count = post_count + 1 
        WHERE id = NEW.category_id;
    END IF;
    
    -- Se foi atualizado um post
    IF TG_OP = 'UPDATE' THEN
        -- Se mudou de categoria
        IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
            -- Decrementar categoria anterior
            IF OLD.category_id IS NOT NULL AND OLD.published = true THEN
                UPDATE blog_categories 
                SET post_count = post_count - 1 
                WHERE id = OLD.category_id;
            END IF;
            -- Incrementar nova categoria
            IF NEW.category_id IS NOT NULL AND NEW.published = true THEN
                UPDATE blog_categories 
                SET post_count = post_count + 1 
                WHERE id = NEW.category_id;
            END IF;
        -- Se mudou status de publicação
        ELSIF OLD.published IS DISTINCT FROM NEW.published AND NEW.category_id IS NOT NULL THEN
            IF NEW.published = true THEN
                UPDATE blog_categories 
                SET post_count = post_count + 1 
                WHERE id = NEW.category_id;
            ELSE
                UPDATE blog_categories 
                SET post_count = post_count - 1 
                WHERE id = NEW.category_id;
            END IF;
        END IF;
    END IF;
    
    -- Se foi deletado um post
    IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL AND OLD.published = true THEN
        UPDATE blog_categories 
        SET post_count = post_count - 1 
        WHERE id = OLD.category_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para contadores de categoria
CREATE TRIGGER update_category_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE PROCEDURE update_category_post_count();

-- Função para atualizar contadores de posts por tag
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_tags 
        SET post_count = post_count + 1 
        WHERE id = NEW.tag_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE blog_tags 
        SET post_count = post_count - 1 
        WHERE id = OLD.tag_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para contadores de tag
CREATE TRIGGER update_tag_post_count_trigger
    AFTER INSERT OR DELETE ON blog_post_tags
    FOR EACH ROW EXECUTE PROCEDURE update_tag_post_count();

-- Função para atualizar estatísticas gerais
CREATE OR REPLACE FUNCTION update_blog_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blog_stats SET
        total_posts = (SELECT COUNT(*) FROM blog_posts),
        total_published_posts = (SELECT COUNT(*) FROM blog_posts WHERE published = true),
        total_views = (SELECT COALESCE(SUM(views), 0) FROM blog_posts),
        total_likes = (SELECT COALESCE(SUM(likes), 0) FROM blog_posts),
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para estatísticas gerais
CREATE TRIGGER update_blog_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH STATEMENT EXECUTE PROCEDURE update_blog_stats();

-- =====================================================
-- 7. DADOS INICIAIS - CATEGORIAS
-- =====================================================

INSERT INTO blog_categories (name, slug, description, color, icon) VALUES
('Prospecção B2B', 'prospeccao-b2b', 'Estratégias e técnicas para prospecção eficaz no mercado B2B', 'bg-blue-500', '🎯'),
('Estratégias de Outbound', 'estrategias-outbound', 'Táticas de outbound marketing para gerar leads qualificados', 'bg-purple-500', '📈'),
('Gestão e Vendas B2B', 'gestao-vendas', 'Gestão de equipes e processos de vendas B2B', 'bg-green-500', '💼'),
('Inteligência de Dados', 'inteligencia-dados', 'Como usar dados para melhorar resultados comerciais', 'bg-orange-500', '🧠'),
('Automação de Vendas', 'automacao-vendas', 'Ferramentas e processos para automatizar vendas', 'bg-pink-500', '🤖')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 8. DADOS INICIAIS - TAGS
-- =====================================================

INSERT INTO blog_tags (name, slug) VALUES
('Geração de Leads', 'leads'),
('CRM', 'crm'),
('Outbound Marketing', 'outbound'),
('Google Maps', 'google-maps'),
('WhatsApp Business', 'whatsapp'),
('Automação', 'automacao'),
('Inteligência Artificial', 'ia'),
('KPIs', 'kpis'),
('Cold Email', 'cold-email'),
('LinkedIn', 'linkedin'),
('Vendas B2B', 'vendas-b2b'),
('Prospecção', 'prospeccao')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_stats ENABLE ROW LEVEL SECURITY;

-- Política para posts - leitura pública para posts publicados
CREATE POLICY "Blog posts são visíveis publicamente quando publicados" 
ON blog_posts FOR SELECT 
USING (published = true);

-- Política para posts - admin pode tudo
CREATE POLICY "Admins podem gerenciar todos os posts" 
ON blog_posts FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Política para categorias - leitura pública
CREATE POLICY "Categorias são visíveis publicamente" 
ON blog_categories FOR SELECT 
USING (true);

-- Política para tags - leitura pública
CREATE POLICY "Tags são visíveis publicamente" 
ON blog_tags FOR SELECT 
USING (true);

-- Política para relacionamentos - leitura pública
CREATE POLICY "Relacionamentos post-tag são visíveis publicamente" 
ON blog_post_tags FOR SELECT 
USING (true);

-- Política para estatísticas - leitura pública
CREATE POLICY "Estatísticas são visíveis publicamente" 
ON blog_stats FOR SELECT 
USING (true);

-- =====================================================
-- 10. FUNÇÕES PÚBLICAS PARA API
-- =====================================================

-- Função para buscar posts com filtros
CREATE OR REPLACE FUNCTION get_blog_posts(
    p_category TEXT DEFAULT NULL,
    p_tag TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'newest',
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image TEXT,
    author_name TEXT,
    category_name TEXT,
    category_slug TEXT,
    category_color TEXT,
    category_icon TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER,
    likes INTEGER,
    read_time INTEGER,
    tags JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featured_image,
        p.author_name,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        c.icon as category_icon,
        p.published_at,
        p.views,
        p.likes,
        p.read_time,
        COALESCE(
            (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
             FROM blog_tags t
             JOIN blog_post_tags pt ON pt.tag_id = t.id
             WHERE pt.post_id = p.id),
            '[]'::json
        ) as tags
    FROM blog_posts p
    LEFT JOIN blog_categories c ON c.id = p.category_id
    WHERE p.published = true
    AND (p_category IS NULL OR c.slug = p_category)
    AND (p_tag IS NULL OR EXISTS (
        SELECT 1 FROM blog_post_tags pt 
        JOIN blog_tags t ON t.id = pt.tag_id 
        WHERE pt.post_id = p.id AND t.slug = p_tag
    ))
    AND (p_search IS NULL OR 
         to_tsvector('portuguese', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || COALESCE(p.content, ''))
         @@ plainto_tsquery('portuguese', p_search))
    ORDER BY 
        CASE WHEN p_sort_by = 'newest' THEN p.published_at END DESC,
        CASE WHEN p_sort_by = 'oldest' THEN p.published_at END ASC,
        CASE WHEN p_sort_by = 'popular' THEN p.views END DESC,
        CASE WHEN p_sort_by = 'trending' THEN p.likes END DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE blog_posts 
    SET views = views + 1 
    WHERE slug = post_slug AND published = true;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- 11. COMENTÁRIOS E FINALIZAÇÃO
-- =====================================================

-- Comentários nas tabelas
COMMENT ON TABLE blog_posts IS 'Tabela principal de posts do blog';
COMMENT ON TABLE blog_categories IS 'Categorias dos posts do blog';
COMMENT ON TABLE blog_tags IS 'Tags para organização dos posts';
COMMENT ON TABLE blog_post_tags IS 'Relacionamento many-to-many entre posts e tags';
COMMENT ON TABLE blog_stats IS 'Estatísticas gerais do blog';

-- Comentários nas colunas importantes
COMMENT ON COLUMN blog_posts.n8n_sync_id IS 'ID para sincronização com N8N workflows';
COMMENT ON COLUMN blog_posts.read_time IS 'Tempo estimado de leitura em minutos';
COMMENT ON COLUMN blog_posts.seo_keywords IS 'Array de palavras-chave para SEO';

-- Verificar se tudo foi criado corretamente
SELECT 'Blog database setup completed successfully!' as status;
