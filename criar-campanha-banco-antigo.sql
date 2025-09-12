-- Criar campanha no banco antigo do disparador antigo
-- ID: bf20ef97-f9e7-4655-bb6a-4021a2d1adbe

-- Primeiro, vamos verificar a estrutura da tabela de campanhas no banco antigo
-- (Execute este SQL no banco antigo para ver a estrutura)

-- Exemplo de estrutura comum para campanhas no banco antigo:
INSERT INTO campaigns (
    id,
    user_id,
    name,
    status,
    total_leads,
    created_at,
    updated_at
) VALUES (
    'bf20ef97-f9e7-4655-bb6a-4021a2d1adbe',
    '00000000-0000-0000-0000-000000000000', -- UUID padrão para teste
    'Deus o Melhor',
    'draft',
    2,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    total_leads = EXCLUDED.total_leads,
    updated_at = NOW();

-- Verificar se a campanha foi criada
SELECT 
    id,
    name,
    status,
    total_leads,
    created_at,
    updated_at
FROM campaigns 
WHERE id = 'bf20ef97-f9e7-4655-bb6a-4021a2d1adbe';
