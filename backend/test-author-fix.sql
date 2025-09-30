-- Teste para verificar se o problema do author_name foi corrigido
-- Execute este script para testar a função process_n8n_blog_queue

-- 1. Inserir um item de teste com autor NULL
INSERT INTO n8n_blog_queue (title, content, category, date, autor) 
VALUES (
    'Teste Post com Autor NULL',
    'Este é um post de teste para verificar se o problema do author_name foi corrigido.',
    'Gestão e Vendas B2B',
    CURRENT_DATE,
    NULL
);

-- 2. Inserir um item de teste com autor vazio
INSERT INTO n8n_blog_queue (title, content, category, date, autor) 
VALUES (
    'Teste Post com Autor Vazio',
    'Este é um post de teste para verificar se strings vazias são tratadas corretamente.',
    'Gestão e Vendas B2B',
    CURRENT_DATE,
    ''
);

-- 3. Inserir um item de teste com autor válido
INSERT INTO n8n_blog_queue (title, content, category, date, autor) 
VALUES (
    'Teste Post com Autor Válido',
    'Este é um post de teste com um autor válido.',
    'Gestão e Vendas B2B',
    CURRENT_DATE,
    'João Silva'
);

-- 4. Verificar os itens inseridos
SELECT id, title, autor, processed FROM n8n_blog_queue 
WHERE title LIKE 'Teste Post%' 
ORDER BY created_at DESC;

-- 5. Executar a função de processamento
SELECT * FROM process_n8n_blog_queue();

-- 6. Verificar se os posts foram criados corretamente
SELECT 
    p.title,
    p.author_name,
    p.published,
    q.autor as original_autor
FROM blog_posts p
JOIN n8n_blog_queue q ON q.blog_post_id = p.id
WHERE p.title LIKE 'Teste Post%'
ORDER BY p.created_at DESC;

-- 7. Limpar os dados de teste (opcional - descomente se quiser limpar)
-- DELETE FROM blog_posts WHERE title LIKE 'Teste Post%';
-- DELETE FROM n8n_blog_queue WHERE title LIKE 'Teste Post%';

